import { registerAs } from '@nestjs/config';
import ms from 'ms';
import bytes from 'bytes';
import { Partitioners } from 'kafkajs';
import { IsBoolean, IsInt, IsNumber, IsPositive, IsString } from 'class-validator';
import validateConfig from 'src/utils/validate-config';
import { KafkaConfig } from './kafka-config.type';
import { IsUpperCamelCase } from 'src/utils/validation/constraints/is-upper-camel-case.constraint';

class EnvironmentVariablesValidator {
  @IsString()
  KAFKA_CLIENT_ID: string;

  @IsString()
  KAFKA_ADMIN_CLIENT_ID: string;

  @IsString()
  KAFKA_BROKERS: string;

  @IsBoolean()
  KAFKA_CONSUMER_ENABLE: boolean;

  @IsString()
  KAFKA_CONSUMER_GROUP: string;

  @IsString()
  @IsUpperCamelCase()
  USER_SIGNUP_V1_TOPIC_NAME: string;

  @IsInt()
  @IsPositive()
  USER_SIGNUP_V1_TOPIC_PARTITIONS: number;

  @IsNumber()
  @IsPositive()
  USER_SIGNUP_V1_TOPIC_REPLICATION_FACTOR: number;

  @IsBoolean()
  KAFKA_ALLOW_AUTO_TOPIC_CREATION: boolean;

  @IsInt()
  KAFKA_PRODUCER_SEND_TIMEOUT: number;
}

export default registerAs<KafkaConfig>('kafka', (): KafkaConfig => {
  validateConfig(process.env, EnvironmentVariablesValidator);

  return {
    clientID: process.env.KAFKA_CLIENT_ID!,
    admin: {
      clientID: process.env.KAFKA_ADMIN_CLIENT_ID!,
    },
    allowAutoTopicCreation: process.env.KAFKA_ALLOW_AUTO_TOPIC_CREATION === 'true',
    topics: [{
      name: process.env.USER_SIGNUP_V1_TOPIC_NAME!,
      partitions: parseInt(process.env.USER_SIGNUP_V1_TOPIC_PARTITIONS!),
      replicationFactor: parseInt(process.env.USER_SIGNUP_V1_TOPIC_REPLICATION_FACTOR!)
    }],
    brokers: process.env.KAFKA_BROKERS!.includes(',') ? 
      process.env.KAFKA_BROKERS!.split(',').map(item => item.trim()) 
      : [process.env.KAFKA_BROKERS!.trim()],
    consumerEnable: process.env.KAFKA_CONSUMER_ENABLE === 'true',
    consumer: {
      groupId: process.env.KAFKA_CONSUMER_GROUP || 'nestjs.ack',
      sessionTimeout: ms('60s'), // 6000 .. 300000
      rebalanceTimeout: ms('90s'), // 300000
      heartbeatInterval: ms('3s'), // 3000
      maxBytesPerPartition: bytes('1mb'), // 1mb
      maxBytes: bytes('10mb'), // 5mb
      maxWaitTimeInMs: ms('5s'), // 5s
      maxInFlightRequests: null, // set this to make customer guaranteed sequential
      retry: {
        maxRetryTime: ms('60s'), // 30s
        initialRetryTime: ms('0.3s'), // 3s
        retries: 5,
      },
    },
    producer: {
      createPartitioner: Partitioners.LegacyPartitioner,
      transactionTimeout: ms('100s'), // 30000 .. 60000
      retry: {
        maxRetryTime: ms('60s'), // 30s
        initialRetryTime: ms('0.3s'), // 3s
        retries: 5,
      },
    },
    producerSend: {
      timeout: ms('30s'), // 30s
    },
  };
});
