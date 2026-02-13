// Dynamic routes plugin

import fp from 'fastify-plugin';
import { FastifyInstance } from 'fastify';
import { DynamicRoutesService } from '../services/dynamic-routes.service.js';

export interface DynamicRoutesPlugin {
  dynamicRoutes: DynamicRoutesService;
}

export default fp<DynamicRoutesPlugin>(
  async (fastify: FastifyInstance) => {
    // Initialize dynamic routes service
    const dynamicRoutes = new DynamicRoutesService(fastify);

    // Decorate fastify instance
    fastify.decorate('dynamicRoutes', dynamicRoutes);

    // Load and register routes for all existing user tables
    // This runs after all plugins are loaded but before routes are registered
    await dynamicRoutes.loadAndRegisterAllRoutes();
  },
  {
    name: 'dynamic-routes',
    dependencies: ['database'], // Ensure database plugin is loaded first
  }
);
