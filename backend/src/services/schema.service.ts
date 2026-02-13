// Schema service for managing tables and columns

import { FastifyInstance } from 'fastify';
import {
  TableSchema,
  TableCreate,
  ColumnSchema,
  ColumnCreate,
  ColumnUpdate,
  dataTypeMappings,
  RESERVED_COLUMNS,
  RESERVED_TABLES,
} from '../types/table-schema.js';
import { NotFoundError, DuplicateError, ValidationError, BadRequestError } from '../errors/index.js';

export class SchemaService {
  constructor(private fastify: FastifyInstance) {}

  // Table operations
  async listTables(): Promise<TableSchema[]> {
    return this.fastify.db.query<TableSchema>(
      'SELECT * FROM tables ORDER BY created_at DESC'
    );
  }

  async getTable(id: number): Promise<TableSchema | null> {
    const table = await this.fastify.db.get<TableSchema>(
      'SELECT * FROM tables WHERE id = ?',
      [id]
    );
    return table || null;
  }

  async getTableByName(name: string): Promise<TableSchema | null> {
    const table = await this.fastify.db.get<TableSchema>(
      'SELECT * FROM tables WHERE name = ?',
      [name]
    );
    return table || null;
  }

  async createTable(data: TableCreate): Promise<TableSchema> {
    // Validate table name
    this.validateTableName(data.name);

    // Check if table already exists
    const existing = await this.getTableByName(data.name);
    if (existing) {
      throw new DuplicateError('Table', data.name);
    }

    // Create table record
    const result = await this.fastify.db.run(
      'INSERT INTO tables (name, display_name) VALUES (?, ?)',
      [data.name, data.display_name || null]
    );

    // Create the actual database table
    await this.fastify.db.exec(`
      CREATE TABLE "${data.name}" (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);

    const table = await this.getTable(Number(result.lastID));
    this.fastify.log.info({ tableId: table?.id, tableName: data.name }, 'Table created');
    
    return table!;
  }

  async deleteTable(id: number): Promise<void> {
    const table = await this.getTable(id);
    if (!table) {
      throw new NotFoundError('Table');
    }

    // Delete the actual database table
    await this.fastify.db.exec(`DROP TABLE IF EXISTS "${table.name}"`);

    // Delete from system tables (columns will cascade)
    const result = await this.fastify.db.run('DELETE FROM tables WHERE id = ?', [id]);

    if (result.changes === 0) {
      throw new NotFoundError('Table');
    }

    this.fastify.log.info({ tableId: id, tableName: table.name }, 'Table deleted');
  }

  // Column operations
  async listColumns(tableId: number): Promise<ColumnSchema[]> {
    return this.fastify.db.query<ColumnSchema>(
      'SELECT * FROM columns WHERE table_id = ? ORDER BY position',
      [tableId]
    );
  }

  async getColumn(id: number): Promise<ColumnSchema | null> {
    const column = await this.fastify.db.get<ColumnSchema>(
      'SELECT * FROM columns WHERE id = ?',
      [id]
    );
    return column || null;
  }

  async createColumn(data: ColumnCreate): Promise<ColumnSchema> {
    // Validate column name
    this.validateColumnName(data.name);

    // Get table
    const table = await this.getTable(data.table_id);
    if (!table) {
      throw new NotFoundError('Table');
    }

    // Check if column already exists
    const existing = await this.fastify.db.get<ColumnSchema>(
      'SELECT * FROM columns WHERE table_id = ? AND name = ?',
      [data.table_id, data.name]
    );
    if (existing) {
      throw new DuplicateError('Column', data.name);
    }

    // Insert column record
    const result = await this.fastify.db.run(
      `INSERT INTO columns (table_id, name, display_name, data_type, is_required, is_unique, default_value, max_length, position)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        data.table_id,
        data.name,
        data.display_name || null,
        data.data_type,
        data.is_required ? 1 : 0,
        data.is_unique ? 1 : 0,
        data.default_value || null,
        data.max_length || null,
        data.position,
      ]
    );

    // SQLite limitation: Cannot add UNIQUE columns via ALTER TABLE
    if (data.is_unique) {
      throw new BadRequestError('Cannot add UNIQUE constraint to existing table. SQLite does not support this via ALTER TABLE.');
    }

    // Add column to actual database table
    const sqlType = dataTypeMappings[data.data_type];
    const constraints = [];
    if (data.is_required) constraints.push('NOT NULL');
    if (data.default_value) constraints.push(`DEFAULT '${data.default_value}'`);

    await this.fastify.db.exec(
      `ALTER TABLE "${table.name}" ADD COLUMN "${data.name}" ${sqlType} ${constraints.join(' ')}`
    );

    const column = await this.getColumn(Number(result.lastID));
    this.fastify.log.info({ columnId: column?.id, tableName: table.name, columnName: data.name }, 'Column created');
    
    return column!;
  }

  async updateColumn(id: number, data: ColumnUpdate): Promise<ColumnSchema> {
    const column = await this.getColumn(id);
    if (!column) {
      throw new NotFoundError('Column');
    }

    // Build update query
    const updates: string[] = [];
    const params: any[] = [];

    if (data.name !== undefined) {
      this.validateColumnName(data.name);
      updates.push('name = ?');
      params.push(data.name);
    }
    if (data.display_name !== undefined) {
      updates.push('display_name = ?');
      params.push(data.display_name);
    }
    if (data.is_required !== undefined) {
      updates.push('is_required = ?');
      params.push(data.is_required ? 1 : 0);
    }
    if (data.is_unique !== undefined) {
      updates.push('is_unique = ?');
      params.push(data.is_unique ? 1 : 0);
    }
    if (data.default_value !== undefined) {
      updates.push('default_value = ?');
      params.push(data.default_value);
    }
    if (data.max_length !== undefined) {
      updates.push('max_length = ?');
      params.push(data.max_length);
    }
    if (data.position !== undefined) {
      updates.push('position = ?');
      params.push(data.position);
    }

    if (updates.length === 0) {
      return column;
    }

    params.push(id);
    await this.fastify.db.run(
      `UPDATE columns SET ${updates.join(', ')} WHERE id = ?`,
      params
    );

    const updated = await this.getColumn(id);
    this.fastify.log.info({ columnId: id }, 'Column updated');
    
    return updated!;
  }

  async deleteColumn(id: number): Promise<void> {
    const column = await this.getColumn(id);
    if (!column) {
      throw new NotFoundError('Column');
    }

    const table = await this.getTable(column.table_id);
    if (!table) {
      throw new NotFoundError('Table');
    }

    // Note: SQLite doesn't support DROP COLUMN easily
    // For MVP, we'll just remove from schema table
    // In production, would need to recreate table
    const result = await this.fastify.db.run('DELETE FROM columns WHERE id = ?', [id]);

    if (result.changes === 0) {
      throw new NotFoundError('Column');
    }

    this.fastify.log.warn(
      { columnId: id, tableName: table.name, columnName: column.name },
      'Column removed from schema (column still exists in database table)'
    );
  }

  // Validation helpers
  private validateTableName(name: string): void {
    if (!name || name.trim().length === 0) {
      throw new ValidationError('Table name is required');
    }

    if (name.length > 50) {
      throw new ValidationError('Table name must be 50 characters or less');
    }

    if (!/^[a-zA-Z][a-zA-Z0-9_]*$/.test(name)) {
      throw new ValidationError('Table name must start with a letter and contain only letters, numbers, and underscores');
    }

    if (RESERVED_TABLES.includes(name.toLowerCase())) {
      throw new ValidationError(`Table name '${name}' is reserved`);
    }
  }

  private validateColumnName(name: string): void {
    if (!name || name.trim().length === 0) {
      throw new ValidationError('Column name is required');
    }

    if (name.length > 50) {
      throw new ValidationError('Column name must be 50 characters or less');
    }

    if (!/^[a-zA-Z][a-zA-Z0-9_]*$/.test(name)) {
      throw new ValidationError('Column name must start with a letter and contain only letters, numbers, and underscores');
    }

    if (RESERVED_COLUMNS.includes(name.toLowerCase())) {
      throw new ValidationError(`Column name '${name}' is reserved`);
    }
  }
}
