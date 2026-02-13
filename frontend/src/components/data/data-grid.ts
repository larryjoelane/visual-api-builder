// Data grid component - displays table data in a grid/spreadsheet view

import { LitElement, html, css } from 'lit';
import { customElement, property, state } from 'lit/decorators.js';

interface DataRecord {
  id: number;
  [key: string]: any;
}

interface PaginationInfo {
  total: number;
  limit: number;
  offset: number;
  hasMore: boolean;
}

@customElement('data-grid')
export class DataGrid extends LitElement {
  @property({ type: String }) tableName!: string;
  @property({ type: Array }) columns: string[] = [];

  @state() private _data: DataRecord[] = [];
  @state() private _pagination: PaginationInfo = {
    total: 0,
    limit: 20,
    offset: 0,
    hasMore: false,
  };
  @state() private _isLoading = false;
  @state() private _error: string | null = null;

  static styles = css`
    :host {
      display: block;
      
      --color-primary: #2563eb;
      --color-border: #e5e7eb;
      --color-text-primary: #1f2937;
      --color-text-secondary: #6b7280;
      --color-background: #f9fafb;
      --color-hover: #f3f4f6;
    }

    .grid-container {
      background: white;
      border-radius: 0.5rem;
      box-shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.1);
      overflow: hidden;
    }

    .table-wrapper {
      overflow-x: auto;
    }

    table {
      width: 100%;
      border-collapse: collapse;
    }

    thead {
      background: var(--color-background);
      border-bottom: 2px solid var(--color-border);
    }

    th {
      padding: 0.75rem 1rem;
      text-align: left;
      font-size: 0.75rem;
      font-weight: 600;
      color: var(--color-text-secondary);
      text-transform: uppercase;
      letter-spacing: 0.05em;
    }

    tbody tr {
      border-bottom: 1px solid var(--color-border);
      transition: background-color 0.15s;
    }

    tbody tr:hover {
      background: var(--color-hover);
    }

    td {
      padding: 0.75rem 1rem;
      font-size: 0.875rem;
      color: var(--color-text-primary);
    }

    .id-column {
      color: var(--color-text-secondary);
      font-weight: 500;
      width: 80px;
    }

    .actions-column {
      width: 120px;
      text-align: right;
    }

    .action-btn {
      padding: 0.25rem 0.5rem;
      font-size: 0.75rem;
      border: none;
      border-radius: 0.25rem;
      cursor: pointer;
      margin-left: 0.5rem;
      transition: opacity 0.2s;
    }

    .action-btn:hover {
      opacity: 0.8;
    }

    .edit-btn {
      background: var(--color-primary);
      color: white;
    }

    .delete-btn {
      background: #dc2626;
      color: white;
    }

    .pagination {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 1rem;
      border-top: 1px solid var(--color-border);
      font-size: 0.875rem;
      color: var(--color-text-secondary);
    }

    .pagination-buttons {
      display: flex;
      gap: 0.5rem;
    }

    .page-btn {
      padding: 0.5rem 1rem;
      background: white;
      border: 1px solid var(--color-border);
      border-radius: 0.25rem;
      cursor: pointer;
      font-size: 0.875rem;
      transition: all 0.2s;
    }

    .page-btn:hover:not(:disabled) {
      background: var(--color-hover);
    }

    .page-btn:disabled {
      opacity: 0.5;
      cursor: not-allowed;
    }

    .empty-state {
      padding: 3rem;
      text-align: center;
      color: var(--color-text-secondary);
    }

    .empty-state-icon {
      font-size: 3rem;
      margin-bottom: 1rem;
    }

    .loading {
      padding: 2rem;
      text-align: center;
      color: var(--color-text-secondary);
    }

    .error {
      padding: 1rem;
      background: #fee2e2;
      color: #991b1b;
      border-radius: 0.25rem;
      margin-bottom: 1rem;
    }
  `;

  connectedCallback() {
    super.connectedCallback();
    this.loadData();
  }

  updated(changedProperties: Map<string, any>) {
    if (changedProperties.has('tableName')) {
      this._pagination.offset = 0;
      this.loadData();
    }
  }

  async loadData() {
    this._isLoading = true;
    this._error = null;

    try {
      const response = await fetch(
        `/api/v1/data/${this.tableName}?limit=${this._pagination.limit}&offset=${this._pagination.offset}`
      );

      if (!response.ok) {
        throw new Error('Failed to load data');
      }

      const result = await response.json();
      this._data = result.data;
      this._pagination = result.pagination;
    } catch (error) {
      this._error = error instanceof Error ? error.message : 'Failed to load data';
    } finally {
      this._isLoading = false;
    }
  }

  private async _handleDelete(id: number) {
    if (!confirm('Are you sure you want to delete this record?')) {
      return;
    }

    try {
      const response = await fetch(`/api/v1/data/${this.tableName}/${id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Failed to delete record');
      }

      await this.loadData();
    } catch (error) {
      this._error = error instanceof Error ? error.message : 'Failed to delete record';
    }
  }

  private _handleEdit(record: DataRecord) {
    // Dispatch event for parent to handle
    this.dispatchEvent(
      new CustomEvent('edit-record', {
        detail: { record },
        bubbles: true,
        composed: true,
      })
    );
  }

  private async _nextPage() {
    this._pagination.offset += this._pagination.limit;
    await this.loadData();
  }

  private async _prevPage() {
    this._pagination.offset = Math.max(0, this._pagination.offset - this._pagination.limit);
    await this.loadData();
  }

  render() {
    if (this._isLoading) {
      return html`<div class="loading">Loading data...</div>`;
    }

    return html`
      <div class="grid-container">
        ${this._error ? html`<div class="error">${this._error}</div>` : ''}

        ${this._data.length === 0
          ? html`
              <div class="empty-state">
                <div class="empty-state-icon">📊</div>
                <p>No data yet. Add your first record!</p>
              </div>
            `
          : html`
              <div class="table-wrapper">
                <table>
                  <thead>
                    <tr>
                      <th class="id-column">ID</th>
                      ${this.columns.map((col) => html`<th>${col}</th>`)}
                      <th>Created</th>
                      <th>Updated</th>
                      <th class="actions-column">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    ${this._data.map(
                      (record) => html`
                        <tr>
                          <td class="id-column">${record.id}</td>
                          ${this.columns.map(
                            (col) => html`<td>${this._formatValue(record[col])}</td>`
                          )}
                          <td>${this._formatDate(record.created_at)}</td>
                          <td>${this._formatDate(record.updated_at)}</td>
                          <td class="actions-column">
                            <button class="action-btn edit-btn" @click=${() => this._handleEdit(record)}>
                              Edit
                            </button>
                            <button class="action-btn delete-btn" @click=${() => this._handleDelete(record.id)}>
                              Delete
                            </button>
                          </td>
                        </tr>
                      `
                    )}
                  </tbody>
                </table>
              </div>

              <div class="pagination">
                <div>
                  Showing ${this._pagination.offset + 1} to
                  ${Math.min(this._pagination.offset + this._data.length, this._pagination.total)}
                  of ${this._pagination.total} records
                </div>
                <div class="pagination-buttons">
                  <button
                    class="page-btn"
                    @click=${this._prevPage}
                    ?disabled=${this._pagination.offset === 0}
                  >
                    Previous
                  </button>
                  <button
                    class="page-btn"
                    @click=${this._nextPage}
                    ?disabled=${!this._pagination.hasMore}
                  >
                    Next
                  </button>
                </div>
              </div>
            `}
      </div>
    `;
  }

  private _formatValue(value: any): string {
    if (value === null || value === undefined) return '-';
    if (typeof value === 'boolean') return value ? 'Yes' : 'No';
    if (typeof value === 'number') return value.toLocaleString();
    return String(value);
  }

  private _formatDate(dateString: string): string {
    if (!dateString) return '-';
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString() + ' ' + date.toLocaleTimeString();
    } catch {
      return dateString;
    }
  }
}
