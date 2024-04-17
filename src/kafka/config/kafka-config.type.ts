import { ICustomPartitioner } from '@nestjs/microservices/external/kafka.interface'

export type KafkaConfig = {
  clientID: string;
  admin: {
    clientID: string;
  };
  brokers: string[]
  consumerEnable: boolean
  consumer: {
    groupId: string
    sessionTimeout: number
    rebalanceTimeout: number
    heartbeatInterval: number
    maxBytesPerPartition: number // 1mb
    maxBytes: number // 5mb
    maxWaitTimeInMs: number // 5s
    maxInFlightRequests: number | null // set this to make customer guaranteed sequential
    retry: {
      maxRetryTime: number // 30s
      initialRetryTime: number
      retries: number
    },
  },
  allowAutoTopicCreation: boolean
  topics: [{
    name: string,
    partitions: number,
    replicationFactor: number,
  }]
  // producer
  producer: {
    createPartitioner: ICustomPartitioner,
    transactionTimeout: number
    retry: {
      maxRetryTime: number
      initialRetryTime: number
      retries: number
    },
  },
  producerSend: {
    timeout: number
  },
};
