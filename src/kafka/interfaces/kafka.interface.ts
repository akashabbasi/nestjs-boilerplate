import { HttpStatus } from '@nestjs/common';
import { ValidationError } from 'class-validator';
import { CONTENT_TYPE_HEADER_NAME } from 'src/kafka/constants/kafka.constant'

export type IKafkaResponse = Record<string, any>;

export interface IKafkaMessageHeader {
  [key: string]: string;
}

export interface IKafkaProducerMessageOptions {
  headers?: IKafkaMessageHeader;
}

export interface IKafkaProducerSendMessageOptions
  extends IKafkaProducerMessageOptions {
  raw?: boolean;
}

export interface IKafkaBaseMessage {
  messageID: string;
  createdAt: Date;
  eventType: string;
}

export interface IKafkaMessage<T = Record<string, string>> {
  key: string;
  value: T;
  headers?: IKafkaMessageHeader;
}

export interface IKafkaErrorException {
  statusCode: number;
  message: string;
  errors: ValidationError;
  statusHttp: HttpStatus;
}

export interface IKafkaCreateTopic {
  topic: string;
  topicReply: string;
  partition?: number;
  replicationFactor?: number;
}

export interface IKafkaTopic {
  name: string;
  partitions: number;
  replicationFactor: number;
}
