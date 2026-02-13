// Table list sidebar component

import { LitElement, html, css } from 'lit';
import { customElement, state } from 'lit/decorators.js';
import { apiClient } from '../../services/api-client.js';
import type { TableSchema } from '../../types/api.types.js';

@customElement('table-list')
export class TableList extends LitElement {
  @state() private _tables: TableSchema[] = [];
  @state() private _isLoading = false;
  @state() private _error: string | null = null;
  @state() private _showCreateDialog = false;
  @state() private _newTableName = '';

  static styles = css`
    :host {
      display: block;
      height: 100%;
      display: flex;
      flex-direction: column;
      
      /* CSS Variables for Shadow DOM */
      --color-primary: #2563eb;
      --color-primary-hover: #1d4ed8;
      --color-primary-light: #dbeafe;
      --color-secondary: #64748b;
      --color-secondary-hover: #475569;
      --color-success: #10b981;
      --color-border: #e5e7eb;
      --color-text-primary: #1f2937;
      --color-text-secondary: #6b7280;
      --radius-sm: 0.25rem;
      --radius-md: 0.375rem;
      --radius-lg: 0.5rem;
      --shadow-sm: 0 1px 2px 0 rgba(0, 0, 0, 0.05);
      --shadow-md: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
      --shadow-lg: 0 10px 15px -3px rgba(0, 0, 0, 0.1);
    }

    .header {
      padding: 1rem;
      border-bottom: 1px solid var(--color-border);
    }

    .header h2 {
      margin: 0 0 0.75rem;
      font-size: 1.125rem;
      color: var(--color-text-primary);
    }

    .create-btn {
      width: 100%;
      padding: 0.75rem 1rem;
      background: var(--color-primary);
      color: white;
      border: 2px solid transparent;
      border-radius: var(--radius-md);
      font-size: 0.9rem;
      font-weight: 600;
      cursor: pointer;
      transition: all 0.2s;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 0.5rem;
      box-shadow: var(--shadow-sm);
    }

    .create-btn:hover {
      background: var(--color-primary-hover);
      box-shadow: var(--shadow-md);
      transform: translateY(-1px);
    }

    .create-btn:active {
      transform: translateY(0);
    }

    .table-list {
      flex: 1;
      overflow-y: auto;
      padding: 0.5rem;
    }

    .table-item {
      padding: 0.75rem 1rem;
      margin-bottom: 0.25rem;
      background: white;
      border: 1px solid var(--color-border);
      border-radius: var(--radius-md);
      cursor: pointer;
      transition: all 0.2s;
    }

    .table-item:hover {
      background: var(--color-primary-light);
      border-color: var(--color-primary);
    }

    .table-item.selected {
      background: var(--color-primary-light);
      border-color: var(--color-primary);
    }

    .table-name {
      font-weight: 500;
      color: var(--color-text-primary);
      margin-bottom: 0.25rem;
    }

    .table-meta {
      font-size: 0.75rem;
      color: var(--color-text-secondary);
    }

    .empty-state {
      padding: 2rem 1rem;
      text-align: center;
      color: var(--color-text-secondary);
      font-size: 0.875rem;
    }

    .error {
      padding: 1rem;
      background: #fee2e2;
      color: #991b1b;
      font-size: 0.875rem;
      margin: 0.5rem;
      border-radius: var(--radius-md);
    }

    .loading {
      padding: 2rem 1rem;
      text-align: center;
      color: var(--color-text-secondary);
    }

    /* Modal styles */
    .modal-overlay {
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: rgba(0, 0, 0, 0.5);
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 1000;
    }

    .modal {
      background: white;
      padding: 1.5rem;
      border-radius: var(--radius-lg);
      box-shadow: var(--shadow-lg);
      min-width: 400px;
    }

    .modal h3 {
      margin: 0 0 1rem;
      font-size: 1.25rem;
    }

    .form-group {
      margin-bottom: 1rem;
    }

    .form-group label {
      display: block;
      margin-bottom: 0.5rem;
      font-size: 0.875rem;
      font-weight: 500;
      color: var(--color-text-primary);
    }

    .form-group input {
      width: 100%;
      padding: 0.5rem;
      border: 1px solid var(--color-border);
      border-radius: var(--radius-md);
      font-size: 0.875rem;
    }

    .modal-actions {
      display: flex;
      gap: 0.5rem;
      justify-content: flex-end;
      margin-top: 1.5rem;
    }

    .btn {
      padding: 0.5rem 1rem;
      border: none;
      border-radius: var(--radius-md);
      font-size: 0.875rem;
      font-weight: 500;
      cursor: pointer;
      transition: all 0.2s;
    }

    .btn-primary {
      background: var(--color-primary);
      color: white;
    }

    .btn-primary:hover {
      background: var(--color-primary-hover);
    }

    .btn-secondary {
      background: var(--color-secondary);
      color: white;
    }

    .btn-secondary:hover {
      background: var(--color-secondary-hover);
    }
  `;

  connectedCallback() {
    super.connectedCallback();
    this.loadTables();
  }

  async loadTables() {
    this._isLoading = true;
    this._error = null;

    try {
      this._tables = await apiClient.getTables();
    } catch (error) {
      this._error = error instanceof Error ? error.message : 'Failed to load tables';
    } finally {
      this._isLoading = false;
    }
  }

  async refresh() {
    await this.loadTables();
  }

  private _handleTableClick(table: TableSchema) {
    this.dispatchEvent(
      new CustomEvent('table-select', {
        detail: { tableId: table.id },
        bubbles: true,
        composed: true,
      })
    );
  }

  private _openCreateDialog() {
    this._showCreateDialog = true;
    this._newTableName = '';
  }

  private _closeCreateDialog() {
    this._showCreateDialog = false;
    this._newTableName = '';
  }

  private async _handleCreateTable() {
    if (!this._newTableName.trim()) {
      return;
    }

    try {
      const table = await apiClient.createTable({
        name: this._newTableName.trim(),
      });

      this._tables = [...this._tables, table];
      this._closeCreateDialog();
      
      this.dispatchEvent(
        new CustomEvent('table-created', {
          detail: { table },
          bubbles: true,
          composed: true,
        })
      );
    } catch (error) {
      this._error = error instanceof Error ? error.message : 'Failed to create table';
    }
  }

  private _handleKeyDown(e: KeyboardEvent) {
    if (e.key === 'Enter') {
      this._handleCreateTable();
    }
  }

  render() {
    return html`
      <div class="header">
        <h2>Tables</h2>
        <button class="create-btn" @click=${this._openCreateDialog}>
          + New Table
        </button>
      </div>

      <div class="table-list">
        ${this._error
          ? html`<div class="error">${this._error}</div>`
          : this._isLoading
          ? html`<div class="loading">Loading tables...</div>`
          : this._tables.length === 0
          ? html`<div class="empty-state">
              No tables yet.<br />Create your first table to get started.
            </div>`
          : this._tables.map(
              (table) => html`
                <div
                  class="table-item"
                  @click=${() => this._handleTableClick(table)}
                >
                  <div class="table-name">${table.display_name || table.name}</div>
                  <div class="table-meta">${table.name}</div>
                </div>
              `
            )}
      </div>

      ${this._showCreateDialog
        ? html`
            <div class="modal-overlay" @click=${this._closeCreateDialog}>
              <div class="modal" @click=${(e: Event) => e.stopPropagation()}>
                <h3>Create New Table</h3>
                <div class="form-group">
                  <label for="table-name">Table Name</label>
                  <input
                    id="table-name"
                    type="text"
                    placeholder="e.g., users, products"
                    .value=${this._newTableName}
                    @input=${(e: Event) =>
                      (this._newTableName = (e.target as HTMLInputElement).value)}
                    @keydown=${this._handleKeyDown}
                    autofocus
                  />
                </div>
                <div class="modal-actions">
                  <button class="btn btn-secondary" @click=${this._closeCreateDialog}>
                    Cancel
                  </button>
                  <button 
                    class="btn btn-primary" 
                    @click=${this._handleCreateTable}
                    ?disabled=${!this._newTableName.trim()}
                  >
                    Create Table
                  </button>
                </div>
              </div>
            </div>
          `
        : ''}
    `;
  }
}
