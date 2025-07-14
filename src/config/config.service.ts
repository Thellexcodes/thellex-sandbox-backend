// src/config/config.service.ts
import * as dotenv from 'dotenv';
import * as fs from 'fs';
import * as path from 'path';

export class ConfigService {
  private envConfig: { [key: string]: string };

  constructor() {
    const envPath = path.resolve(__dirname, '../../.env');
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
}
