// src/config/config.service.ts

import * as fs from 'fs';
import * as path from 'path';
import * as dotenv from 'dotenv';

export class ConfigService {
  private envConfig: { [key: string]: string };

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
  }

  get(key: string): string {
    const value = this.envConfig[key];
    if (value === undefined) {
      throw new Error(`Config key ${key} not found`);
    }
    return value;
  }

  getNodeEnv(): string {
    return this.get('NODE_ENV') + '_';
  }
}
