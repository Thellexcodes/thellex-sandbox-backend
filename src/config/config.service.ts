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
    // Define possible .env paths
    const possibleEnvPaths = [
      path.resolve(process.cwd(), '.env'), // Current working directory
      path.resolve(__dirname, '../../../.env'), // Project root from src/config
      '/opt/render/project/.env', // Explicit Render project root
      '/app/.env', // Common Render root path
    ];

    let envPath: string | undefined;
    for (const possiblePath of possibleEnvPaths) {
      if (fs.existsSync(possiblePath)) {
        envPath = possiblePath;
        break;
      }
    }

    // Load .env file if found, otherwise use process.env
    if (envPath) {
      const result = dotenv.config({ path: envPath });
      if (result.error) {
        this.logger.error(
          `Failed to load .env file at ${envPath}: ${result.error.message}`,
        );
        throw result.error;
      }
      this.envConfig = result.parsed || {};
      // this.logger.log(`Loaded .env file from ${envPath}`);
    } else {
      this.envConfig = { ...process.env };
    }

    // Validate NODE_ENV
    const nodeEnv = this.envConfig['NODE_ENV']?.toUpperCase();
    if (!nodeEnv) {
      this.logger.error('NODE_ENV not defined in .env or process.env');
      throw new Error('NODE_ENV not defined');
    }

    this.envPrefix = `${nodeEnv}_`;
  }

  get(key: string): string {
    const fullKey = this.envPrefix + key;
    const value = this.envConfig[fullKey] ?? this.envConfig[key];
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
