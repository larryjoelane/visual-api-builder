// Database plugin with AsyncDatabase wrapper for sql.js

import initSqlJs, { Database } from 'sql.js';
import fp from 'fastify-plugin';
import { readFileSync, writeFileSync, existsSync, mkdirSync } from 'fs';
import { dirname } from 'path';
import { FastifyInstance } from 'fastify';

export class AsyncDatabase {
  private db: Database | null = null;
  private dbPath: string;
  private saveInterval: NodeJS.Timeout | null = null;

  constructor(dbPath: string) {
    this.dbPath = dbPath;
  }

  async init(): Promise<void> {
    const SQL = await initSqlJs();
    
    // Ensure database directory exists
    const dir = dirname(this.dbPath);
    if (!existsSync(dir)) {
      mkdirSync(dir, { recursive: true });
    }

    // Load existing database from file if it exists
    if (existsSync(this.dbPath)) {
      const buffer = readFileSync(this.dbPath);
      this.db = new SQL.Database(buffer);
    } else {
      this.db = new SQL.Database();
    }

    // Auto-save every 5 seconds
    this.saveInterval = setInterval(() => {
      this.save();
    }, 5000);
  }

  async query<T = any>(sql: string, params?: any[]): Promise<T[]> {
    if (!this.db) throw new Error('Database not initialized');
    
    const stmt = this.db.prepare(sql, params || []);
    const results: T[] = [];
    
    while (stmt.step()) {
      const row = stmt.getAsObject();
      results.push(row as T);
    }
    
    stmt.free();
    return results;
  }

  async get<T = any>(sql: string, params?: any[]): Promise<T | undefined> {
    const results = await this.query<T>(sql, params);
    return results[0];
  }

  async run(sql: string, params?: any[]): Promise<{ lastID: number; changes: number }> {
    if (!this.db) throw new Error('Database not initialized');
    
    this.db.run(sql, params || []);
    
    // Get last insert ID
    const lastIDResult = this.db.exec('SELECT last_insert_rowid() as id');
    const lastID = (lastIDResult[0]?.values[0]?.[0] as number) || 0;
    
    // Get changes count
    const changesResult = this.db.exec('SELECT changes() as count');
    const changes = (changesResult[0]?.values[0]?.[0] as number) || 0;
    
    this.save();
    
    return { lastID, changes };
  }

  async exec(sql: string): Promise<void> {
    if (!this.db) throw new Error('Database not initialized');
    
    this.db.exec(sql);
    this.save();
  }

  transaction<T>(fn: () => T): T {
    if (!this.db) throw new Error('Database not initialized');
    
    this.db.run('BEGIN TRANSACTION');
    
    try {
      const result = fn();
      this.db.run('COMMIT');
      this.save();
      return result;
    } catch (error) {
      this.db.run('ROLLBACK');
      throw error;
    }
  }

  save(): void {
    if (!this.db) return;
    
    const data = this.db.export();
    writeFileSync(this.dbPath, data);
  }

  close(): void {
    if (this.saveInterval) {
      clearInterval(this.saveInterval);
    }
    
    this.save();
    
    if (this.db) {
      this.db.close();
      this.db = null;
    }
  }
}

export interface DatabasePlugin {
  db: AsyncDatabase;
}

export default fp<DatabasePlugin>(
  async (fastify: FastifyInstance) => {
    const dbPath = process.env.DB_PATH || './data/app.db';
    const database = new AsyncDatabase(dbPath);
    
    // Initialize the database
    await database.init();

    // Initialize system tables
    await database.exec(`
      CREATE TABLE IF NOT EXISTS tables (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL UNIQUE,
        display_name TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS columns (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        table_id INTEGER NOT NULL,
        name TEXT NOT NULL,
        display_name TEXT,
        data_type TEXT NOT NULL,
        is_required INTEGER DEFAULT 0,
        is_unique INTEGER DEFAULT 0,
        default_value TEXT,
        max_length INTEGER,
        position INTEGER NOT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (table_id) REFERENCES tables(id) ON DELETE CASCADE,
        UNIQUE (table_id, name)
      );

      CREATE INDEX IF NOT EXISTS idx_columns_table_id ON columns(table_id);
      CREATE INDEX IF NOT EXISTS idx_tables_name ON tables(name);
    `);

    fastify.log.info({ path: dbPath }, 'Database connection established');

    // Register cleanup hook
    fastify.addHook('onClose', async () => {
      database.close();
      fastify.log.info('Database connection closed');
    });

    // Decorate Fastify instance
    fastify.decorate('db', database);
  },
  {
    name: 'database',
  }
);

// Extend Fastify types
declare module 'fastify' {
  interface FastifyInstance {
    db: AsyncDatabase;
  }
}
