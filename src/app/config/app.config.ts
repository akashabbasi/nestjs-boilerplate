import { registerAs } from '@nestjs/config';
import { AppConfig } from './app-config.type';
import validateConfig from 'src/utils/validate-config';
import {
  IsBoolean,
  IsEnum,
  IsInt,
  IsOptional,
  IsString,
  Max,
  Min,
} from 'class-validator';
import { version } from 'package.json';
import { ENUM_APP_ENVIRONMENT } from 'src/app/constants/app.enum.constant';

enum Environment {
  Development = 'development',
  Production = 'production',
  Test = 'test',
}

class EnvironmentVariablesValidator {

  @IsString()
  APP_NAME: string;

  @IsEnum(ENUM_APP_ENVIRONMENT)
  @IsOptional()
  APP_ENV: ENUM_APP_ENVIRONMENT;

  @IsBoolean()
  HTTP_VERSIONING_ENABLE: boolean;

  @IsString()
  @IsOptional()
  HTTP_VERSION: string;

  @IsBoolean()
  @IsOptional()
  HTTP_ENABLE: boolean;

  @IsString()
  @IsOptional()
  HTTP_HOST: string;

  @IsInt()
  @Min(0)
  @Max(65535)
  HTTP_PORT: number;

  @IsBoolean()
  @IsOptional()
  JOB_ENABLE: boolean;
}

export default registerAs<AppConfig>('app', () => {
  validateConfig(process.env, EnvironmentVariablesValidator);

  return {
    name: process.env.APP_NAME!,
    env: process.env.APP_ENV ?? ENUM_APP_ENVIRONMENT.DEVELOPMENT,
    repoVersion: version,
    versioning: {
      enable: process.env.HTTP_VERSIONING_ENABLE === 'true' ?? false,
      prefix: 'v',
      version: process.env.HTTP_VERSION ?? '1',
    },
    globalPrefix: '/api',
    http: {
      enable: process.env.HTTP_ENABLE === 'true' ?? false,
      host: process.env.HTTP_HOST ?? 'localhost',
      port: process.env.HTTP_PORT
        ? Number.parseInt(process.env.HTTP_PORT)
        : 3000,
    },
    jobEnable: process.env.JOB_ENABLE === 'true' ?? false,
  };
});