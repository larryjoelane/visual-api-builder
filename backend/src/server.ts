// Main Fastify server

import Fastify from 'fastify';
import cors from '@fastify/cors';
import { appConfig } from './config/index.js';
import databasePlugin from './plugins/database.js';
import swaggerPlugin from './plugins/swagger.js';
import dynamicRoutesPlugin from './plugins/dynamic-routes.js';
import tableRoutes from './routes/tables.js';
import { DynamicRoutesService } from './services/dynamic-routes.service.js';
import { AppError } from './errors/index.js';
import { FastifyError, FastifyReply, FastifyRequest } from 'fastify';

// Extend Fastify instance with custom properties
declare module 'fastify' {
  interface FastifyInstance {
    dynamicRoutes: DynamicRoutesService;
  }
}

// Create Fastify instance
const fastify = Fastify({
  logger: {
    level: appConfig.logLevel,
    transport:
      appConfig.nodeEnv === 'development'
        ? {
            target: 'pino-pretty',
            options: {
              colorize: true,
              translateTime: 'HH:MM:ss',
              ignore: 'pid,hostname',
            },
          }
        : undefined,
  },
});

// Register plugins
fastify.register(cors, {
  origin: appConfig.corsOrigin,
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
});

fastify.register(databasePlugin);
fastify.register(dynamicRoutesPlugin); // Load dynamic routes after database
fastify.register(swaggerPlugin);

// Health check
fastify.get('/health', async () => {
  return { status: 'ok', timestamp: new Date().toISOString() };
});

// Register routes
fastify.register(tableRoutes, { prefix: '/api/v1' });

// Global error handler
fastify.setErrorHandler(
  async (error: FastifyError | AppError, request: FastifyRequest, reply: FastifyReply) => {
    // Log error with context
    request.log.error({
      err: error,
      requestId: request.id,
      url: request.url,
      method: request.method,
    });

    // Handle custom application errors
    if (error instanceof AppError) {
      return reply.status(error.statusCode).send({
        error: {
          code: error.code,
          message: error.message,
        },
      });
    }

    // Handle Fastify validation errors
    if ('validation' in error && error.validation) {
      return reply.status(400).send({
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Request validation failed',
          details: error.validation,
        },
      });
    }

    // Handle unexpected errors (don't expose internals)
    return reply.status(500).send({
      error: {
        code: 'INTERNAL_SERVER_ERROR',
        message: 'An unexpected error occurred',
      },
    });
  }
);

// Start server
const start = async () => {
  try {
    await fastify.listen({
      port: appConfig.port,
      host: appConfig.host,
    });

    fastify.log.info(`Server listening on http://${appConfig.host}:${appConfig.port}`);
    fastify.log.info(`Swagger docs: http://${appConfig.host}:${appConfig.port}/documentation`);
  } catch (err) {
    fastify.log.error(err);
    process.exit(1);
  }
};

// Graceful shutdown
const signals = ['SIGINT', 'SIGTERM'];
signals.forEach((signal) => {
  process.on(signal, async () => {
    fastify.log.info(`Received ${signal}, closing server...`);
    await fastify.close();
    process.exit(0);
  });
});

start();
