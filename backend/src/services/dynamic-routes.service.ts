// Dynamic routes service - auto-generates CRUD endpoints for user tables

import { FastifyInstance } from 'fastify';
import { Type, Static } from '@sinclair/typebox';
import { SchemaService } from './schema.service.js';
import { TableSchema, ColumnSchema, DataType } from '../types/table-schema.js';
import { NotFoundError, ValidationError } from '../errors/index.js';

export class DynamicRoutesService {
  private fastify: FastifyInstance;
  private schemaService: SchemaService;
  private registeredTables: Set<string> = new Set();

  constructor(fastify: FastifyInstance) {
    this.fastify = fastify;
    this.schemaService = new SchemaService(fastify);
  }

  /**
   * Load all user tables and register routes for each
   */
  async loadAndRegisterAllRoutes(): Promise<void> {
    const tables = await this.schemaService.listTables();
    this.fastify.log.info({ tableCount: tables.length }, 'Loading user tables for dynamic API generation');

    for (const table of tables) {
      await this.registerRoutesForTable(table);
    }

    this.fastify.log.info({ registeredTables: Array.from(this.registeredTables) }, 'Dynamic routes registered');
  }

  /**
   * Register CRUD routes for a specific table
   */
  async registerRoutesForTable(table: TableSchema): Promise<void> {
    // Skip if already registered
    if (this.registeredTables.has(table.name)) {
      this.fastify.log.debug({ tableName: table.name }, 'Routes already registered for table');
      return;
    }

    // Get columns for the table
    const columns = await this.schemaService.listColumns(table.id);
    
    // Generate TypeBox schema from columns
    const createSchema = this.generateCreateSchema(columns);
    const updateSchema = this.generateUpdateSchema(columns);
    const itemSchema = this.generateItemSchema(columns);

    const baseUrl = `/api/v1/data/${table.name}`;

    // List all records - GET /api/v1/data/{tableName}
    this.fastify.get(
      baseUrl,
      {
        schema: {
          tags: ['data'],
          description: `List all records from ${table.display_name || table.name}`,
          querystring: Type.Object({
            limit: Type.Optional(Type.Number({ minimum: 1, maximum: 100, default: 20 })),
            offset: Type.Optional(Type.Number({ minimum: 0, default: 0 })),
          }),
          response: {
            200: Type.Object({
              data: Type.Array(Type.Any()),
              pagination: Type.Object({
                total: Type.Number(),
                limit: Type.Number(),
                offset: Type.Number(),
                hasMore: Type.Boolean(),
              }),
            }),
          },
        },
      },
      async (request, reply) => {
        const { limit = 20, offset = 0 } = request.query as { limit?: number; offset?: number };

        // Get total count
        const countResult = await this.fastify.db.get<{ count: number }>(
          `SELECT COUNT(*) as count FROM "${table.name}"`
        );
        const total = countResult?.count || 0;

        // Get records
        const records = await this.fastify.db.query(
          `SELECT * FROM "${table.name}" LIMIT ? OFFSET ?`,
          [limit, offset]
        );

        return reply.send({
          data: records,
          pagination: {
            total,
            limit,
            offset,
            hasMore: offset + records.length < total,
          },
        });
      }
    );

    // Get single record - GET /api/v1/data/{tableName}/{id}
    this.fastify.get<{ Params: { id: number } }>(
      `${baseUrl}/:id`,
      {
        schema: {
          tags: ['data'],
          description: `Get a single record from ${table.display_name || table.name}`,
          params: Type.Object({
            id: Type.Number(),
          }),
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
        const record = await this.fastify.db.get(
          `SELECT * FROM "${table.name}" WHERE id = ?`,
          [request.params.id]
        );

        if (!record) {
          throw new NotFoundError(`Record in ${table.name}`);
        }

        return reply.send({ data: record });
      }
    );

    // Create record - POST /api/v1/data/{tableName}
    this.fastify.post<{ Body: any }>(
      baseUrl,
      {
        schema: {
          tags: ['data'],
          description: `Create a new record in ${table.display_name || table.name}`,
          body: createSchema,
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
        // Validate required fields
        this.validateRequiredFields(columns, request.body);

        // Build INSERT query
        const columnNames = Object.keys(request.body);
        const placeholders = columnNames.map(() => '?').join(', ');
        const values = columnNames.map((col) => request.body[col]);

        const result = await this.fastify.db.run(
          `INSERT INTO "${table.name}" (${columnNames.map((c) => `"${c}"`).join(', ')})
           VALUES (${placeholders})`,
          values
        );

        // Get the created record
        const record = await this.fastify.db.get(
          `SELECT * FROM "${table.name}" WHERE id = ?`,
          [result.lastID]
        );

        return reply.code(201).send({ data: record });
      }
    );

    // Update record - PUT /api/v1/data/{tableName}/{id}
    this.fastify.put<{ Params: { id: number }; Body: any }>(
      `${baseUrl}/:id`,
      {
        schema: {
          tags: ['data'],
          description: `Update a record in ${table.display_name || table.name}`,
          params: Type.Object({
            id: Type.Number(),
          }),
          body: updateSchema,
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
        // Check if record exists
        const existing = await this.fastify.db.get(
          `SELECT * FROM "${table.name}" WHERE id = ?`,
          [request.params.id]
        );

        if (!existing) {
          throw new NotFoundError(`Record in ${table.name}`);
        }

        // Build UPDATE query
        const columnNames = Object.keys(request.body);
        const setClause = columnNames.map((col) => `"${col}" = ?`).join(', ');
        const values = [...columnNames.map((col) => request.body[col]), request.params.id];

        await this.fastify.db.run(
          `UPDATE "${table.name}" SET ${setClause}, updated_at = CURRENT_TIMESTAMP WHERE id = ?`,
          values
        );

        // Get the updated record
        const record = await this.fastify.db.get(
          `SELECT * FROM "${table.name}" WHERE id = ?`,
          [request.params.id]
        );

        return reply.send({ data: record });
      }
    );

    // Delete record - DELETE /api/v1/data/{tableName}/{id}
    this.fastify.delete<{ Params: { id: number } }>(
      `${baseUrl}/:id`,
      {
        schema: {
          tags: ['data'],
          description: `Delete a record from ${table.display_name || table.name}`,
          params: Type.Object({
            id: Type.Number(),
          }),
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
        // Check if record exists
        const existing = await this.fastify.db.get(
          `SELECT * FROM "${table.name}" WHERE id = ?`,
          [request.params.id]
        );

        if (!existing) {
          throw new NotFoundError(`Record in ${table.name}`);
        }

        await this.fastify.db.run(
          `DELETE FROM "${table.name}" WHERE id = ?`,
          [request.params.id]
        );

        return reply.code(204).send();
      }
    );

    this.registeredTables.add(table.name);
    this.fastify.log.info({ tableName: table.name, baseUrl }, 'Registered dynamic CRUD routes for table');
  }

  /**
   * Refresh routes - reload all tables and re-register routes
   * Call this when tables or columns are added/deleted
   */
  async refreshRoutes(): Promise<void> {
    // Clear registered tables (routes cannot be unregistered in Fastify, so we just track what we've registered)
    // In a real system, we'd need to restart the server or use a plugin that supports dynamic route management
    this.fastify.log.info('Refreshing dynamic routes (note: requires server restart for route removal)');
    await this.loadAndRegisterAllRoutes();
  }

  /**
   * Generate TypeBox schema for creating records
   */
  private generateCreateSchema(columns: ColumnSchema[]): any {
    const properties: Record<string, any> = {};
    const required: string[] = [];

    for (const column of columns) {
      // Skip auto-generated columns
      if (['id', 'created_at', 'updated_at'].includes(column.name)) {
        continue;
      }

      properties[column.name] = this.getTypeBoxType(column);

      if (column.is_required) {
        required.push(column.name);
      }
    }

    return Type.Object(properties, { additionalProperties: false });
  }

  /**
   * Generate TypeBox schema for updating records (all fields optional)
   */
  private generateUpdateSchema(columns: ColumnSchema[]): any {
    const properties: Record<string, any> = {};

    for (const column of columns) {
      // Skip auto-generated columns
      if (['id', 'created_at', 'updated_at'].includes(column.name)) {
        continue;
      }

      properties[column.name] = Type.Optional(this.getTypeBoxType(column));
    }

    return Type.Object(properties, { additionalProperties: false });
  }

  /**
   * Generate TypeBox schema for item response
   */
  private generateItemSchema(columns: ColumnSchema[]): any {
    const properties: Record<string, any> = {
      id: Type.Number(),
      created_at: Type.String(),
      updated_at: Type.String(),
    };

    for (const column of columns) {
      if (!['id', 'created_at', 'updated_at'].includes(column.name)) {
        properties[column.name] = column.is_required
          ? this.getTypeBoxType(column)
          : Type.Optional(this.getTypeBoxType(column));
      }
    }

    return Type.Object(properties);
  }

  /**
   * Convert column data type to TypeBox type
   */
  private getTypeBoxType(column: ColumnSchema): any {
    switch (column.data_type) {
      case 'string':
      case 'text':
        return Type.String();
      case 'number':
        return Type.Number();
      case 'decimal':
        return Type.Number();
      case 'boolean':
        return Type.Boolean();
      case 'date':
      case 'datetime':
        return Type.String(); // ISO date string
      default:
        return Type.String();
    }
  }

  /**
   * Validate required fields are present
   */
  private validateRequiredFields(columns: ColumnSchema[], data: Record<string, any>): void {
    const requiredColumns = columns.filter((col) => col.is_required && !['id', 'created_at', 'updated_at'].includes(col.name));

    for (const column of requiredColumns) {
      if (data[column.name] === undefined || data[column.name] === null || data[column.name] === '') {
        throw new ValidationError(`Field "${column.name}" is required`);
      }
    }
  }
}
