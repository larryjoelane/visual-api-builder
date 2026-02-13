// Table designer component - shows table details and columns

import { LitElement, html, css } from 'lit';
import { customElement, property, state } from 'lit/decorators.js';
import { apiClient } from '../../services/api-client.js';
import type { TableSchema, ColumnSchema, DataType } from '../../types/api.types.js';
import '../data/data-grid.js';
import '../data/row-form.js';
import type { RowFormData } from '../data/row-form.js';

type Tab = 'schema' | 'data';

@customElement('table-designer')
export class TableDesigner extends LitElement {
  @property({ type: Number }) tableId!: number;
  
  @state() private _table: TableSchema | null = null;
  @state() private _columns: ColumnSchema[] = [];
  @state() private _isLoading = false;
  @state() private _error: string | null = null;
  @state() private _showAddColumn = false;
  @state() private _activeTab: Tab = 'schema';
  @state() private _showRowForm = false;
  @state() private _editingRow: RowFormData | null = null;
  @state() private _newColumn = {
    name: '',
    data_type: 'string' as DataType,
    is_required: false,
    is_unique: false,
  };

  static styles = css`
    :host {
      display: block;
      
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

    .designer-container {
      max-width: 1200px;
      margin: 0 auto;
    }

    .table-header {
      background: white;
      padding: 1.5rem;
      border-radius: var(--radius-lg);
      box-shadow: var(--shadow-sm);
      margin-bottom: 1.5rem;
    }

    .table-header h2 {
      margin: 0 0 0.5rem;
      font-size: 1.75rem;
      color: var(--color-text-primary);
    }

    .table-meta {
      color: var(--color-text-secondary);
      font-size: 0.875rem;
    }

    .columns-section {
      background: white;
      padding: 1.5rem;
      border-radius: var(--radius-lg);
      box-shadow: var(--shadow-sm);
    }

    .section-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 1rem;
    }

    .section-header h3 {
      margin: 0;
      font-size: 1.25rem;
    }

    .add-column-btn {
      padding: 0.625rem 1.25rem;
      background: var(--color-success);
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

    .add-column-btn:hover {
      background: #059669;
      box-shadow: var(--shadow-md);
      transform: translateY(-1px);
    }

    .add-column-btn:active {
      transform: translateY(0);
    }

    .columns-list {
      display: grid;
      gap: 0.75rem;
    }

    .column-card {
      padding: 1rem;
      border: 1px solid var(--color-border);
      border-radius: var(--radius-md);
      display: grid;
      grid-template-columns: auto 1fr auto;
      gap: 1rem;
      align-items: center;
    }

    .column-info {
      display: flex;
      flex-direction: column;
      gap: 0.25rem;
    }

    .column-name {
      font-weight: 500;
      color: var(--color-text-primary);
    }

    .column-meta {
      font-size: 0.75rem;
      color: var(--color-text-secondary);
    }

    .column-badges {
      display: flex;
      gap: 0.5rem;
    }

    .badge {
      padding: 0.25rem 0.5rem;
      border-radius: var(--radius-sm);
      font-size: 0.75rem;
      font-weight: 500;
    }

    .badge-type {
      background: var(--color-primary-light);
      color: var(--color-primary);
    }

    .badge-required {
      background: #fee2e2;
      color: #991b1b;
    }

    .badge-unique {
      background: #dbeafe;
      color: #1e40af;
    }

    .delete-btn {
      padding: 0.375rem 0.75rem;
      background: var(--color-error);
      color: white;
      border: none;
      border-radius: var(--radius-sm);
      font-size: 0.75rem;
      cursor: pointer;
      transition: opacity 0.2s;
    }

    .delete-btn:hover {
      opacity: 0.8;
    }

    .add-column-form {
      margin-top: 1rem;
      padding: 1rem;
      border: 2px dashed var(--color-border);
      border-radius: var(--radius-md);
      background: var(--color-background);
    }

    .form-row {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 1rem;
      margin-bottom: 1rem;
    }

    .form-group {
      display: flex;
      flex-direction: column;
      gap: 0.5rem;
    }

    .form-group label {
      font-size: 0.875rem;
      font-weight: 500;
      color: var(--color-text-primary);
    }

    .form-group input,
    .form-group select {
      padding: 0.5rem;
      border: 1px solid var(--color-border);
      border-radius: var(--radius-md);
      font-size: 0.875rem;
    }

    .checkbox-group {
      display: flex;
      align-items: center;
      gap: 0.5rem;
    }

    .checkbox-group input {
      width: auto;
    }

    .form-actions {
      display: flex;
      gap: 0.5rem;
      justify-content: flex-end;
    }

    .btn {
      padding: 0.5rem 1rem;
      border: none;
      border-radius: var(--radius-md);
      font-size: 0.875rem;
      font-weight: 500;
      cursor: pointer;
    }

    .btn-primary {
      background: var(--color-primary);
      color: white;
    }

    .btn-secondary {
      background: var(--color-secondary);
      color: white;
    }

    .empty-state {
      padding: 2rem;
      text-align: center;
      color: var(--color-text-secondary);
      font-size: 0.875rem;
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
      border-radius: var(--radius-md);
      margin-bottom: 1rem;
    }

    /* Tabs */
    .tabs {
      display: flex;
      gap: 0.5rem;
      margin-bottom: 1.5rem;
      border-bottom: 2px solid var(--color-border);
    }

    .tab {
      padding: 0.75rem 1.5rem;
      background: none;
      border: none;
      border-bottom: 2px solid transparent;
      color: var(--color-text-secondary);
      font-size: 0.9375rem;
      font-weight: 500;
      cursor: pointer;
      transition: all 0.2s;
      margin-bottom: -2px;
    }

    .tab:hover {
      color: var(--color-primary);
    }

    .tab.active {
      color: var(--color-primary);
      border-bottom-color: var(--color-primary);
    }

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
      padding: 1rem;
    }

    .modal-content {
      background: white;
      border-radius: var(--radius-lg);
      max-width: 600px;
      width: 100%;
      max-height: 90vh;
      overflow-y: auto;
    }

    .add-row-btn {
      padding: 0.625rem 1.25rem;
      background: var(--color-primary);
      color: white;
      border: none;
      border-radius: var(--radius-md);
      font-size: 0.9rem;
      font-weight: 600;
      cursor: pointer;
      transition: all 0.2s;
      margin-bottom: 1rem;
    }

    .add-row-btn:hover {
      background: var(--color-primary-hover);
    }
  `;

  connectedCallback() {
    super.connectedCallback();
    this.loadTable();
  }

  updated(changedProperties: Map<string, any>) {
    if (changedProperties.has('tableId')) {
      this._activeTab = 'schema';
      this._showRowForm = false;
      this.loadTable();
    }
  }

  async loadTable() {
    this._isLoading = true;
    this._error = null;

    try {
      this._table = await apiClient.getTable(this.tableId);
      this._columns = await apiClient.getColumns(this.tableId);
    } catch (error) {
      this._error = error instanceof Error ? error.message : 'Failed to load table';
    } finally {
      this._isLoading = false;
    }
  }

  private _toggleAddColumn() {
    this._showAddColumn = !this._showAddColumn;
    if (this._showAddColumn) {
      this._newColumn = {
        name: '',
        data_type: 'string',
        is_required: false,
        is_unique: false,
      };
    }
  }

  private async _handleAddColumn() {
    if (!this._newColumn.name.trim()) {
      return;
    }

    try {
      const column = await apiClient.createColumn({
        table_id: this.tableId,
        name: this._newColumn.name.trim(),
        data_type: this._newColumn.data_type,
        is_required: this._newColumn.is_required,
        is_unique: this._newColumn.is_unique,
        position: this._columns.length,
      });

      this._columns = [...this._columns, column];
      this._toggleAddColumn();
    } catch (error) {
      this._error = error instanceof Error ? error.message : 'Failed to add column';
    }
  }

  private async _handleDeleteColumn(column: ColumnSchema) {
    if (!confirm(`Delete column "${column.name}"?`)) {
      return;
    }

    try {
      await apiClient.deleteColumn(column.id);
      this._columns = this._columns.filter((c) => c.id !== column.id);
    } catch (error) {
      this._error = error instanceof Error ? error.message : 'Failed to delete column';
    }
  }

  render() {
    if (this._isLoading) {
      return html`<div class="loading">Loading table...</div>`;
    }

    if (!this._table) {
      return html`<div class="error">Table not found</div>`;
    }

    const userColumns = this._columns.filter(c => !['id', 'created_at', 'updated_at'].includes(c.name));

    return html`
      <div class="designer-container">
        ${this._error ? html`<div class="error">${this._error}</div>` : ''}

        <div class="table-header">
          <h2>${this._table.display_name || this._table.name}</h2>
          <div class="table-meta">
            Table: ${this._table.name} • Created: ${new Date(this._table.created_at).toLocaleDateString()}
          </div>
        </div>

        <div class="tabs">
          <button 
            class="tab ${this._activeTab === 'schema' ? 'active' : ''}"
            @click=${() => this._activeTab = 'schema'}
          >
            Schema
          </button>
          <button 
            class="tab ${this._activeTab === 'data' ? 'active' : ''}"
            @click=${() => this._activeTab = 'data'}
          >
            Data
          </button>
        </div>

        ${this._activeTab === 'schema' ? html`
          <div class="columns-section">
            <div class="section-header">
              <h3>Columns</h3>
              <button class="add-column-btn" @click=${this._toggleAddColumn}>
                + Add Column
              </button>
            </div>

            ${this._showAddColumn
              ? html`
                  <div class="add-column-form">
                    <div class="form-row">
                      <div class="form-group">
                        <label>Column Name</label>
                        <input
                          type="text"
                          placeholder="e.g., email, name"
                          .value=${this._newColumn.name}
                          @input=${(e: Event) => {
                            this._newColumn = {
                              ...this._newColumn,
                              name: (e.target as HTMLInputElement).value
                            };
                          }}
                        />
                      </div>
                      <div class="form-group">
                        <label>Data Type</label>
                        <select
                          .value=${this._newColumn.data_type}
                          @change=${(e: Event) => {
                            this._newColumn = {
                              ...this._newColumn,
                              data_type: (e.target as HTMLSelectElement).value as DataType
                            };
                          }}
                        >
                          <option value="string">String</option>
                          <option value="text">Text</option>
                          <option value="number">Number</option>
                          <option value="decimal">Decimal</option>
                          <option value="boolean">Boolean</option>
                          <option value="date">Date</option>
                          <option value="datetime">DateTime</option>
                        </select>
                      </div>
                    </div>
                    <div class="form-row">
                      <div class="checkbox-group">
                        <input
                          type="checkbox"
                          id="required"
                          .checked=${this._newColumn.is_required}
                          @change=${(e: Event) => {
                            this._newColumn = {
                              ...this._newColumn,
                              is_required: (e.target as HTMLInputElement).checked
                            };
                          }}
                        />
                        <label for="required">Required</label>
                      </div>
                      <div class="checkbox-group">
                        <input
                          type="checkbox"
                          id="unique"
                          .checked=${this._newColumn.is_unique}
                          @change=${(e: Event) => {
                            this._newColumn = {
                              ...this._newColumn,
                              is_unique: (e.target as HTMLInputElement).checked
                            };
                          }}
                        />
                        <label for="unique">Unique</label>
                      </div>
                    </div>
                    <div class="form-actions">
                      <button class="btn btn-secondary" @click=${this._toggleAddColumn}>
                        Cancel
                      </button>
                      <button 
                        class="btn btn-primary" 
                        @click=${this._handleAddColumn}
                        ?disabled=${!this._newColumn.name.trim()}
                      >
                        Add Column
                      </button>
                    </div>
                  </div>
                `
              : ''}

            <div class="columns-list">
              ${this._columns.length === 0
                ? html`<div class="empty-state">
                    No columns yet. Add a column to define your data structure.
                  </div>`
                : this._columns.map(
                    (column) => html`
                      <div class="column-card">
                        <div class="column-info">
                          <div class="column-name">${column.name}</div>
                          <div class="column-meta">
                            ${column.display_name || ''}
                          </div>
                        </div>
                        <div class="column-badges">
                          <span class="badge badge-type">${column.data_type}</span>
                          ${column.is_required
                            ? html`<span class="badge badge-required">Required</span>`
                            : ''}
                          ${column.is_unique
                            ? html`<span class="badge badge-unique">Unique</span>`
                            : ''}
                        </div>
                        <button
                          class="delete-btn"
                          @click=${() => this._handleDeleteColumn(column)}
                        >
                          Delete
                        </button>
                      </div>
                    `
                  )}
            </div>
          </div>
        ` : html`
          <div class="columns-section">
            <div class="section-header">
              <h3>Table Data</h3>
              <button 
                class="add-row-btn" 
                @click=${() => {
                  this._editingRow = null;
                  this._showRowForm = true;
                }}
              >
                + Add Row
              </button>
            </div>
            <data-grid
              .tableName=${this._table.name}
              .columns=${userColumns.map(c => c.name)}
              @edit-record=${(e: CustomEvent) => {
                this._editingRow = e.detail.record;
                this._showRowForm = true;
              }}
              @data-updated=${() => this.requestUpdate()}
            ></data-grid>
          </div>
        `}
      </div>

      ${this._showRowForm ? html`
        <div class="modal-overlay" @click=${() => this._showRowForm = false}>
          <div class="modal-content" @click=${(e: Event) => e.stopPropagation()}>
            <row-form
              .tableName=${this._table.name}
              .columns=${userColumns}
              .initialData=${this._editingRow}
              @submit-success=${() => {
                this._showRowForm = false;
                this._editingRow = null;
                this.requestUpdate();
              }}
              @cancel=${() => {
                this._showRowForm = false;
                this._editingRow = null;
              }}
            ></row-form>
          </div>
        </div>
      ` : ''}
    `;
  }
}
