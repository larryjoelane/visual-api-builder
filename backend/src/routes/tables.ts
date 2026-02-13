// Table management routes

import { FastifyPluginAsync } from 'fastify';
import { Type, Static } from '@sinclair/typebox';
import { SchemaService } from '../services/schema.service.js';

// Schemas
const TableCreateSchema = Type.Object({
  name: Type.String({ minLength: 1, maxLength: 50 }),
  display_name: Type.Optional(Type.String({ maxLength: 100 })),
});

const ColumnCreateSchema = Type.Object({
  table_id: Type.Number({ minimum: 1 }),
  name: Type.String({ minLength: 1, maxLength: 50 }),
  display_name: Type.Optional(Type.String({ maxLength: 100 })),
  data_type: Type.Union([
    Type.Literal('string'),
    Type.Literal('text'),
    Type.Literal('number'),
    Type.Literal('decimal'),
    Type.Literal('boolean'),
    Type.Literal('date'),
    Type.Literal('datetime'),
  ]),
  is_required: Type.Optional(Type.Boolean()),
  is_unique: Type.Optional(Type.Boolean()),
  default_value: Type.Optional(Type.String()),
  max_length: Type.Optional(Type.Number({ minimum: 1 })),
  position: Type.Number({ minimum: 0 }),
});

const TableIdParams = Type.Object({
  id: Type.Number({ minimum: 1 }),
});

const ColumnIdParams = Type.Object({
  id: Type.Number({ minimum: 1 }),
});

type TableCreateType = Static<typeof TableCreateSchema>;
type ColumnCreateType = Static<typeof ColumnCreateSchema>;
type TableIdParamsType = Static<typeof TableIdParams>;
type ColumnIdParamsType = Static<typeof ColumnIdParams>;

const tableRoutes: FastifyPluginAsync = async (fastify) => {
  const schemaService = new SchemaService(fastify);

  // List all tables
  fastify.get(
    '/tables',
    {
      schema: {
        tags: ['schema'],
        description: 'Get all tables',
        response: {
          200: Type.Object({
            data: Type.Array(Type.Any()),
          }),
        },
      },
    },
    async (request, reply) => {
      const tables = await schemaService.listTables();
      return reply.send({ data: tables });
    }
  );

  // Get single table
  fastify.get<{ Params: TableIdParamsType }>(
    '/tables/:id',
    {
      schema: {
        tags: ['schema'],
        description: 'Get table by ID',
        params: TableIdParams,
        response: {
          200: Type.Object({
            data: Type.Any(),
          }),
          404: Type.Object({
            error: Type.Object({
              code: Type.String(),
              message: Type.String(),
            }),
          }),
        },
      },
    },
    async (request, reply) => {
      const table = await schemaService.getTable(request.params.id);
      if (!table) {
        return reply.code(404).send({
          error: {
            code: 'NOT_FOUND',
            message: 'Table not found',
          },
        });
      }
      return reply.send({ data: table });
    }
  );

  // Create table
  fastify.post<{ Body: TableCreateType }>(
    '/tables',
    {
      schema: {
        tags: ['schema'],
        description: 'Create a new table',
        body: TableCreateSchema,
        response: {
          201: Type.Object({
            data: Type.Any(),
          }),
          400: Type.Object({
            error: Type.Object({
              code: Type.String(),
              message: Type.String(),
            }),
          }),
        },
      },
    },
    async (request, reply) => {
      const table = await schemaService.createTable(request.body);
      return reply.code(201).send({ data: table });
    }
  );

  // Delete table
  fastify.delete<{ Params: TableIdParamsType }>(
    '/tables/:id',
    {
      schema: {
        tags: ['schema'],
        description: 'Delete a table',
        params: TableIdParams,
        response: {
          204: Type.Null(),
          404: Type.Object({
            error: Type.Object({
              code: Type.String(),
              message: Type.String(),
            }),
          }),
        },
      },
    },
    async (request, reply) => {
      await schemaService.deleteTable(request.params.id);
      return reply.code(204).send();
    }
  );

  // List columns for a table
  fastify.get<{ Params: TableIdParamsType }>(
    '/tables/:id/columns',
    {
      schema: {
        tags: ['schema'],
        description: 'Get all columns for a table',
        params: TableIdParams,
        response: {
          200: Type.Object({
            data: Type.Array(Type.Any()),
          }),
        },
      },
    },
    async (request, reply) => {
      const columns = await schemaService.listColumns(request.params.id);
      return reply.send({ data: columns });
    }
  );

  // Create column
  fastify.post<{ Body: ColumnCreateType }>(
    '/columns',
    {
      schema: {
        tags: ['schema'],
        description: 'Add a column to a table',
        body: ColumnCreateSchema,
        response: {
          201: Type.Object({
            data: Type.Any(),
          }),
          400: Type.Object({
            error: Type.Object({
              code: Type.String(),
              message: Type.String(),
            }),
          }),
        },
      },
    },
    async (request, reply) => {
      const column = await schemaService.createColumn(request.body);
      return reply.code(201).send({ data: column });
    }
  );

  // Delete column
  fastify.delete<{ Params: ColumnIdParamsType }>(
    '/columns/:id',
    {
      schema: {
        tags: ['schema'],
        description: 'Delete a column',
        params: ColumnIdParams,
        response: {
          204: Type.Null(),
          404: Type.Object({
            error: Type.Object({
              code: Type.String(),
              message: Type.String(),
            }),
          }),
        },
      },
    },
    async (request, reply) => {
      await schemaService.deleteColumn(request.params.id);
      return reply.code(204).send();
    }
  );
};

export default tableRoutes;
