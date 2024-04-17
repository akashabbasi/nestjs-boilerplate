import {
  applyDecorators,
  createParamDecorator,
  ExecutionContext,
  UseFilters,
  UseInterceptors,
  UsePipes,
} from '@nestjs/common';
import {
  EventPattern,
  KafkaContext,
  MessagePattern,
  Payload,
  Transport,
} from '@nestjs/microservices';
import { KafkaErrorFilter } from '../error/filters/kafka.error.filter';
import { KafkaResponseInterceptor } from '../interceptors/kafka.response.interceptor';
import { KafkaResponseTimeoutInterceptor } from '../interceptors/kafka.response-timeout.interceptor';
import { KafkaValidationPipe } from '../pipes/kafka.validation.pipe';
import { KafkaCommitOffsetFirstInterceptor } from '../interceptors/kafka.commit-offset-first.interceptor';
import { KafkaCommitOffsetLastInterceptor } from '../interceptors/kafka.commit-offset-last.interceptor';

export function MessageTopic(topic: string): any {
  return applyDecorators(
    MessagePattern(topic, Transport.KAFKA),
    UseInterceptors(KafkaResponseInterceptor, KafkaResponseTimeoutInterceptor),
    UseFilters(KafkaErrorFilter),
    UsePipes(KafkaValidationPipe),
  );
}

export function EventTopic(topic: string): any {
  return applyDecorators(
    EventPattern(topic, Transport.KAFKA),
    UseInterceptors(KafkaCommitOffsetLastInterceptor),
    UseFilters(KafkaErrorFilter),
    UsePipes(KafkaValidationPipe),
  );
}

export const MessageValue = Payload;

export const MessageHeader = createParamDecorator<Record<string, any> | string>(
  (field: string, ctx: ExecutionContext): Record<string, any> => {
    const context: KafkaContext = ctx.switchToRpc().getContext();
    const headers: Record<string, any> = context.getMessage().headers ?? {};
    return field ? headers[field] : headers;
  },
);

export const MessageKey = createParamDecorator<string>(
  (field: string, ctx: ExecutionContext): string => {
    const context: KafkaContext = ctx.switchToRpc().getContext();
    const message = context.getMessage();
    return message.key ? message.key.toString(): "";
  },
);

export function MessageCommitOffsetInFirstRunning(): any {
  return applyDecorators(UseInterceptors(KafkaCommitOffsetFirstInterceptor));
}
