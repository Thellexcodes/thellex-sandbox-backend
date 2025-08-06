import { Injectable, Logger } from '@nestjs/common';
import * as dotenv from 'dotenv';
import * as fs from 'fs';
import * as path from 'path';

@Injectable()
export class ConfigService {
  private readonly logger = new Logger(ConfigService.name);
  private envConfig: { [key: string]: string };
  private envPrefix: string;

  constructor() {
    // Define .env path for Render (project root, not src)
    const envPath = path.resolve(__dirname, '../../.env'); // Adjusts to project root from src/config

    // Log the .env path for debugging
    this.logger.log(`Attempting to load .env from: ${envPath}`);

    // Load .env file if it exists, otherwise use process.env
    if (fs.existsSync(envPath)) {
      const result = dotenv.config({ path: envPath });
      if (result.error) {
        this.logger.error(
          `Failed to load .env file at ${envPath}: ${result.error.message}`,
        );
        throw result.error;
      }
      this.envConfig = result.parsed || {};
      this.logger.log(`Loaded .env file from ${envPath}`);
    } else {
      this.logger.warn(
        '.env file not found at project root. Using process.env for configuration.',
      );
      this.envConfig = { ...process.env }; // Fallback to process.env (Render dashboard variables)
    }

    // Validate NODE_ENV
    const nodeEnv = this.envConfig['NODE_ENV']?.toUpperCase();
    if (!nodeEnv) {
      this.logger.error('NODE_ENV not defined in .env or process.env');
      throw new Error('NODE_ENV not defined');
    }

    this.envPrefix = `${nodeEnv}_`;
    this.logger.log(`Running in ${nodeEnv} environment`);
  }

  get(key: string): string {
    const fullKey = this.envPrefix + key;
    const value = this.envConfig[fullKey] ?? this.envConfig[key]; // Check prefixed and raw key
    if (value === undefined) {
      this.logger.error(`Config key ${fullKey} or ${key} not found`);
      throw new Error(`Config key ${fullKey} not found`);
    }
    return value;
  }

  getRaw(key: string): string {
    const value = this.envConfig[key];
    if (value === undefined) {
      this.logger.error(`Config key ${key} not found`);
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
