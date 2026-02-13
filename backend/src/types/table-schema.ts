// TypeScript types for table schemas

export interface TableSchema {
  id: number;
  name: string;
  display_name: string | null;
  created_at: string;
  updated_at: string;
}

export interface TableCreate {
  name: string;
  display_name?: string;
}

export interface TableUpdate {
  name?: string;
  display_name?: string;
}

export interface ColumnSchema {
  id: number;
  table_id: number;
  name: string;
  display_name: string | null;
  data_type: DataType;
  is_required: boolean;
  is_unique: boolean;
  default_value: string | null;
  max_length: number | null;
  position: number;
  created_at: string;
}

export interface ColumnCreate {
  table_id: number;
  name: string;
  display_name?: string;
  data_type: DataType;
  is_required?: boolean;
  is_unique?: boolean;
  default_value?: string;
  max_length?: number;
  position: number;
}

export interface ColumnUpdate {
  name?: string;
  display_name?: string;
  is_required?: boolean;
  is_unique?: boolean;
  default_value?: string;
  max_length?: number;
  position?: number;
}

export type DataType = 'string' | 'text' | 'number' | 'decimal' | 'boolean' | 'date' | 'datetime';

export interface DataTypeMapping {
  [key: string]: string;
}

export const dataTypeMappings: DataTypeMapping = {
  string: 'TEXT',
  text: 'TEXT',
  number: 'INTEGER',
  decimal: 'REAL',
  boolean: 'INTEGER', // SQLite uses 0/1 for boolean
  date: 'TEXT', // Store as ISO 8601 date string
  datetime: 'TEXT', // Store as ISO 8601 datetime string
};

// Reserved column names that are automatically managed
export const RESERVED_COLUMNS = ['id', 'created_at', 'updated_at'];

// Reserved table names that cannot be used
export const RESERVED_TABLES = ['tables', 'columns', 'sqlite_sequence', 'sqlite_master'];
