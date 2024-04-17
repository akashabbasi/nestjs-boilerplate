import { Injectable, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { Admin, ITopicConfig, Kafka, KafkaConfig } from 'kafkajs';
import { Logger } from '@nestjs/common/services/logger.service';
import { ConfigService } from '@nestjs/config';
import { IKafkaAdminService } from 'src/kafka/interfaces/kafka.admin-service.interface';
import { IKafkaTopic } from 'src//kafka/interfaces/kafka.interface';

@Injectable()
export class KafkaAdminService
  implements IKafkaAdminService, OnModuleInit, OnModuleDestroy
{
  private readonly kafka: Kafka;
  private readonly admin: Admin;
  private readonly topics: IKafkaTopic[];
  private readonly brokers: string[];
  private readonly clientId: string;
  private readonly kafkaOptions: KafkaConfig;

  protected logger = new Logger(KafkaAdminService.name);

  constructor(private readonly configService: ConfigService) {
    this.clientId = this.configService.get<string>('kafka.admin.clientID')!;
    this.brokers = this.configService.get<string[]>('kafka.brokers')!;

    this.topics = this.configService.get('kafka.topics')!;

    this.kafkaOptions = {
      clientId: this.clientId,
      brokers: this.brokers,
    };

    this.logger.log(`Brokers ${this.brokers}`);
    this.kafka = new Kafka(this.kafkaOptions);

    this.admin = this.kafka.admin();
  }

  async onModuleInit(): Promise<void> {
    await this.connect();
  }

  async onModuleDestroy(): Promise<void> {
    await this.disconnect();
  }

  async connect(): Promise<void> {
    this.logger.log(`Connecting ${KafkaAdminService.name} Admin`);
    await this.admin.connect();
    this.logger.log(`${KafkaAdminService.name} Admin Connected`);
  }

  async disconnect(): Promise<void> {
    this.logger.log(`Disconnecting ${KafkaAdminService.name} Admin`);
    await this.admin.connect();
    this.logger.log(`${KafkaAdminService.name} Admin Disconnected`);
  }

  async getAllTopic(): Promise<string[]> {
    return this.admin.listTopics();
  }

  async getAllTopicUnique(): Promise<string[]> {
    return [...new Set(await this.getAllTopic())].filter(
      (val) => val !== '__consumer_offsets',
    );
  }

  async createTopics(): Promise<boolean> {
    this.logger.log(`Topics ${this.topics}`);

    const currentTopic: string[] = await this.getAllTopicUnique();
    const data: ITopicConfig[] = [];

    for (const topic of this.topics) {
      const partition: number = topic.partitions;
      const replicationFactor: number =
        topic.replicationFactor &&
        topic.replicationFactor <= this.brokers.length
          ? topic.replicationFactor
          : this.brokers.length;
      if (!currentTopic.includes(topic.name)) {
        data.push({
          topic: topic.name,
          numPartitions: partition,
          replicationFactor: replicationFactor,
        });
      }
    }

    if (data.length > 0) {
      await this.admin.createTopics({
        waitForLeaders: true,
        topics: data,
      });
    }

    this.logger.log(`${KafkaAdminService.name} Topic Created`);
    return true;
  }

  async deleteTopics(): Promise<boolean> {
    const currentTopic: string[] = await this.getAllTopicUnique();

    const data: string[] = [];

    for (const topic of this.topics) {
      if (currentTopic.includes(topic.name)) {
        data.push(topic.name);
      }
    }

    if (data.length > 0) {
      await this.admin.deleteTopics({
        topics: data,
      });
    }

    this.logger.log(`${KafkaAdminService.name} Topic Deleted`);

    return true;
  }
}
