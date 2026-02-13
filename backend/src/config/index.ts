// Configuration loader with type safety

import { config } from 'dotenv';
import { resolve } from 'path';

// Load environment variables
config();

export interface AppConfig {
  nodeEnv: string;
  port: number;
  host: string;
  dbPath: string;
  corsOrigin: string;
  logLevel: string;
}

export const appConfig: AppConfig = {
  nodeEnv: process.env.NODE_ENV || 'development',
  port: parseInt(process.env.PORT || '3000', 10),
  host: process.env.HOST || '0.0.0.0',
  dbPath: process.env.DB_PATH || './data/app.db',
  corsOrigin: process.env.CORS_ORIGIN || 'http://localhost:5173',
  logLevel: process.env.LOG_LEVEL || 'info',
};

// Validate required configuration
if (!appConfig.dbPath) {
  throw new Error('DB_PATH is required');
}

export default appConfig;
