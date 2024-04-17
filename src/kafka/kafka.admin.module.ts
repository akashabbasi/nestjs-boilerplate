import { Inject, Module, OnModuleInit } from '@nestjs/common';
import { KafkaAdminService } from 'src/kafka/services/kafka.admin.service';
// import { Logger } from 'winston';
// import { WINSTON_MODULE_PROVIDER } from 'nest-winston';
import { ConfigService } from '@nestjs/config';

@Module({
  providers: [KafkaAdminService],
  exports: [KafkaAdminService],
  controllers: [],
  imports: [],
})
export class KafkaAdminModule implements OnModuleInit {
  constructor(
    // @Inject(WINSTON_MODULE_PROVIDER)
    // private readonly logger: Logger,
    private readonly adminService: KafkaAdminService,
    private readonly configService: ConfigService
  ) {}
  async onModuleInit() {
    try {
      if (!this.configService.get<boolean>('kafka.allowAutoTopicCreation')) {
        await this.adminService.createTopics();
      }
    } catch (err: unknown) {
      // TODO: add proper logger
      console.error("Error initializing kafka topics: ", err)
      process.exit(-1)
    }
  }
}
