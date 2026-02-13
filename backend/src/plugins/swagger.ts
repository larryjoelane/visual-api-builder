// Swagger plugin for auto-generated API documentation

import swagger from '@fastify/swagger';
import swaggerUi from '@fastify/swagger-ui';
import fp from 'fastify-plugin';
import { FastifyInstance } from 'fastify';

export default fp(
  async (fastify: FastifyInstance) => {
    await fastify.register(swagger, {
      openapi: {
        info: {
          title: 'Visual API Builder',
          description: 'Auto-generated REST API endpoints for your visual data models',
          version: '1.0.0',
        },
        servers: [
          {
            url: 'http://localhost:3000',
            description: 'Development server',
          },
        ],
        tags: [
          {
            name: 'schema',
            description: 'Schema management operations (tables and columns)',
          },
          {
            name: 'dynamic',
            description: 'Auto-generated CRUD endpoints for your tables',
          },
        ],
      },
    });

    await fastify.register(swaggerUi, {
      routePrefix: '/documentation',
      uiConfig: {
        docExpansion: 'list',
        deepLinking: true,
      },
      staticCSP: true,
      transformStaticCSP: (header) => header,
    });

    fastify.log.info('Swagger documentation available at /documentation');
  },
  {
    name: 'swagger',
  }
);
