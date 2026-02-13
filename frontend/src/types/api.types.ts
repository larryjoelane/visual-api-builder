// TypeScript interfaces for API communication

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

export type DataType = 'string' | 'text' | 'number' | 'decimal' | 'boolean' | 'date' | 'datetime';

export interface ApiResponse<T> {
  data: T;
  message?: string;
}

export interface ApiError {
  error: {
    code: string;
    message: string;
    details?: any[];
  };
}
