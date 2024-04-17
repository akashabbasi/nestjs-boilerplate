import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { RpcArgumentsHost } from '@nestjs/common/interfaces';
import { KafkaContext, RpcException } from '@nestjs/microservices';
import { Observable, catchError, tap, throwError } from 'rxjs';
import { KafkaService } from 'src/kafka/services/kafka.service';
import { ENUM_REQUEST_STATUS_CODE_ERROR } from 'src/request/constants/request.status-code.constant';
import { IKafkaMessage, IKafkaMessageHeader } from '../interfaces/kafka.interface';

@Injectable()
export class KafkaCommitOffsetLastInterceptor
  implements NestInterceptor<Promise<any>>
{
  constructor(private readonly kafkaService: KafkaService) {}

  async intercept(
    context: ExecutionContext,
    next: CallHandler,
  ): Promise<Observable<Promise<any> | string>> {
    const ctx: RpcArgumentsHost = context.switchToRpc();
    const kafkaContext = ctx.getContext<KafkaContext>();
    const message = kafkaContext.getMessage()
    const originalTopic = kafkaContext.getTopic();
    const deadLetterTopic = `${originalTopic}DLQ`;

    return next.handle().pipe(
      tap({
        next: async () => {
          await this.kafkaService.commitOffsets(kafkaContext);
        },
        error: async (err: unknown) => {
          console.error('Failed to process Kafka message', err);
        }
      }),
      catchError(async (error) => {
        if (error instanceof RpcException) {
          const err = error.getError()

          if (typeof err === "object" && err["statusCode"] === ENUM_REQUEST_STATUS_CODE_ERROR.REQUEST_VALIDATION_ERROR) {
            // Asynchronously send the problematic message to the Dead Letter Queue
            const msg: IKafkaMessage<any> = {
              key: message.key?.toString() ?? "",
              value: message.value,
              headers: message.headers as IKafkaMessageHeader,
            };
            await this.kafkaService.sendToDLQ(deadLetterTopic, msg)

            // Commit the offset to ensure it does not get reprocessed
            await this.kafkaService.commitOffsets(kafkaContext)
          }
        }
        
        return throwError(() => error);
      })
    );
  }
}
