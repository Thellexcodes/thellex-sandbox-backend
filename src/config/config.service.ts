// src/config/config.service.ts

import { Injectable } from '@nestjs/common';
import * as dotenv from 'dotenv';
import * as fs from 'fs';
import * as path from 'path';

@Injectable()
export class ConfigService {
  private envConfig: { [key: string]: string };
  private envPrefix: string;

  constructor() {
    const envPath = path.resolve(process.cwd(), '.env');

    if (!fs.existsSync(envPath)) {
      throw new Error('.env file not found!');
    }

    const result = dotenv.config({ path: envPath });

    if (result.error) {
      throw result.error;
    }

    this.envConfig = result.parsed || {};

    const nodeEnv = this.envConfig['NODE_ENV']?.toUpperCase();
    if (!nodeEnv) {
      throw new Error('NODE_ENV not defined in .env file');
    }

    this.envPrefix = `${nodeEnv}_`;

    // console.log(`Running in ${nodeEnv} environment`);
  }

  get(key: string): string {
    const fullKey = this.envPrefix + key;
    const value = this.envConfig[fullKey];
    if (value === undefined) {
      throw new Error(`Config key ${fullKey} not found`);
    }
    return value;
  }

  getRaw(key: string): string {
    const value = this.envConfig[key];
    if (value === undefined) {
      throw new Error(`Config key ${key} not found`);
    }
    return value;
  }

  getNumber(key: string): number {
    return Number(this.get(key));
  }

  getBoolean(key: string): boolean {
    return this.get(key) === 'true';
  }
}
