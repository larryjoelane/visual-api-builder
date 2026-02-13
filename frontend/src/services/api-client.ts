// API client for backend communication

import type { TableSchema, TableCreate, ColumnSchema, ColumnCreate, ApiResponse, ApiError } from '../types/api.types.js';

const API_BASE = '/api/v1';

class ApiClient {
  private async request<T>(
    url: string,
    options: RequestInit = {}
  ): Promise<T> {
    const response = await fetch(`${API_BASE}${url}`, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
    });

    if (!response.ok) {
      const error: ApiError = await response.json();
      throw new Error(error.error.message || 'Request failed');
    }

    if (response.status === 204) {
      return {} as T;
    }

    return response.json();
  }

  // Table operations
  async getTables(): Promise<TableSchema[]> {
    const response = await this.request<ApiResponse<TableSchema[]>>('/tables');
    return response.data;
  }

  async getTable(id: number): Promise<TableSchema> {
    const response = await this.request<ApiResponse<TableSchema>>(`/tables/${id}`);
    return response.data;
  }

  async createTable(data: TableCreate): Promise<TableSchema> {
    const response = await this.request<ApiResponse<TableSchema>>('/tables', {
      method: 'POST',
      body: JSON.stringify(data),
    });
    return response.data;
  }

  async deleteTable(id: number): Promise<void> {
    await this.request<void>(`/tables/${id}`, {
      method: 'DELETE',
    });
  }

  // Column operations
  async getColumns(tableId: number): Promise<ColumnSchema[]> {
    const response = await this.request<ApiResponse<ColumnSchema[]>>(`/tables/${tableId}/columns`);
    return response.data;
  }

  async createColumn(data: ColumnCreate): Promise<ColumnSchema> {
    const response = await this.request<ApiResponse<ColumnSchema>>('/columns', {
      method: 'POST',
      body: JSON.stringify(data),
    });
    return response.data;
  }

  async deleteColumn(id: number): Promise<void> {
    await this.request<void>(`/columns/${id}`, {
      method: 'DELETE',
    });
  }
}

export const apiClient = new ApiClient();
