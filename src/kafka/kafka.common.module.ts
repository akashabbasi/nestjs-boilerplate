import { DynamicModule, Module } from '@nestjs/common';
import { KafkaModule } from 'src/kafka/kafka.module';

@Module({})
export class KafkaCommonModule {
  static forRoot(): DynamicModule {
    const imports = [];

    return {
      module: KafkaCommonModule,
      providers: [],
      exports: [],
      controllers: [],
      imports: [KafkaModule, ...imports],
    };
  }
}
