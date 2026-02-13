// Row form component - for adding/editing table rows

import { LitElement, html, css } from 'lit';
import { customElement, property, state } from 'lit/decorators.js';
import type { ColumnSchema } from '../../types/api.types.js';

export interface RowFormData {
  [key: string]: any;
}

@customElement('row-form')
export class RowForm extends LitElement {
  @property({ type: String }) tableName!: string;
  @property({ type: Array }) columns: ColumnSchema[] = [];
  @property({ type: Object }) existingData: RowFormData | null = null;
  @property({ type: Boolean }) isEdit = false;

  @state() private _formData: RowFormData = {};
  @state() private _error: string | null = null;
  @state() private _isSubmitting = false;

  static styles = css`
    :host {
      display: block;
      
      --color-primary: #2563eb;
      --color-border: #e5e7eb;
      --color-text-primary: #1f2937;
      --color-text-secondary: #6b7280;
      --color-error: #dc2626;
    }

    .form-container {
      background: white;
      padding: 1.5rem;
      border-radius: 0.5rem;
      box-shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.1);
    }

    .form-title {
      font-size: 1.25rem;
      font-weight: 600;
      margin: 0 0 1.5rem;
      color: var(--color-text-primary);
    }

    .form-group {
      margin-bottom: 1rem;
    }

    .form-label {
      display: block;
      font-size: 0.875rem;
      font-weight: 500;
      color: var(--color-text-primary);
      margin-bottom: 0.5rem;
    }

    .required-mark {
      color: var(--color-error);
      margin-left: 0.25rem;
    }

    .form-input,
    .form-select,
    .form-textarea {
      width: 100%;
      padding: 0.5rem;
      border: 1px solid var(--color-border);
      border-radius: 0.375rem;
      font-size: 0.875rem;
      font-family: inherit;
      transition: border-color 0.2s;
    }

    .form-input:focus,
    .form-select:focus,
    .form-textarea:focus {
      outline: none;
      border-color: var(--color-primary);
      box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.1);
    }

    .form-textarea {
      min-height: 80px;
      resize: vertical;
    }

    .form-checkbox {
      width: auto;
      margin-right: 0.5rem;
    }

    .checkbox-label {
      display: flex;
      align-items: center;
      cursor: pointer;
    }

    .field-hint {
      font-size: 0.75rem;
      color: var(--color-text-secondary);
      margin-top: 0.25rem;
    }

    .form-actions {
      display: flex;
      gap: 0.75rem;
      justify-content: flex-end;
      margin-top: 1.5rem;
      padding-top: 1.5rem;
      border-top: 1px solid var(--color-border);
    }

    .btn {
      padding: 0.625rem 1.25rem;
      border: none;
      border-radius: 0.375rem;
      font-size: 0.875rem;
      font-weight: 500;
      cursor: pointer;
      transition: all 0.2s;
    }

    .btn:disabled {
      opacity: 0.5;
      cursor: not-allowed;
    }

    .btn-primary {
      background: var(--color-primary);
      color: white;
    }

    .btn-primary:hover:not(:disabled) {
      background: #1d4ed8;
    }

    .btn-secondary {
      background: #6b7280;
      color: white;
    }

    .btn-secondary:hover:not(:disabled) {
      background: #4b5563;
    }

    .error {
      padding: 1rem;
      background: #fee2e2;
      color: var(--color-error);
      border-radius: 0.375rem;
      margin-bottom: 1rem;
      font-size: 0.875rem;
    }
  `;

  connectedCallback() {
    super.connectedCallback();
    this._initializeFormData();
  }

  updated(changedProperties: Map<string, any>) {
    if (changedProperties.has('existingData') || changedProperties.has('columns')) {
      this._initializeFormData();
    }
  }

  private _initializeFormData() {
    const formData: RowFormData = {};

    // Initialize form with existing data or defaults
    for (const column of this.columns) {
      // Skip auto-generated fields
      if (['id', 'created_at', 'updated_at'].includes(column.name)) {
        continue;
      }

      if (this.existingData && column.name in this.existingData) {
        formData[column.name] = this.existingData[column.name];
      } else {
        // Set defaults based on data type
        switch (column.data_type) {
          case 'boolean':
            formData[column.name] = false;
            break;
          case 'number':
          case 'decimal':
            formData[column.name] = column.default_value || '';
            break;
          default:
            formData[column.name] = column.default_value || '';
        }
      }
    }

    this._formData = formData;
  }

  private async _handleSubmit(e: Event) {
    e.preventDefault();
    this._error = null;

    // Validate required fields
    for (const column of this.columns) {
      if (['id', 'created_at', 'updated_at'].includes(column.name)) continue;

      if (column.is_required) {
        const value = this._formData[column.name];
        if (value === null || value === undefined || value === '') {
          this._error = `Field "${column.name}" is required`;
          return;
        }
      }
    }

    this._isSubmitting = true;

    try {
      const url = this.isEdit && this.existingData
        ? `/api/v1/data/${this.tableName}/${this.existingData.id}`
        : `/api/v1/data/${this.tableName}`;

      const method = this.isEdit ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(this._formData),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error?.message || `Failed to ${this.isEdit ? 'update' : 'create'} record`);
      }

      // Dispatch success event
      this.dispatchEvent(
        new CustomEvent('submit-success', {
          bubbles: true,
          composed: true,
        })
      );
    } catch (error) {
      this._error = error instanceof Error ? error.message : 'An error occurred';
    } finally {
      this._isSubmitting = false;
    }
  }

  private _handleCancel() {
    this.dispatchEvent(
      new CustomEvent('cancel', {
        bubbles: true,
        composed: true,
      })
    );
  }

  private _updateField(column: ColumnSchema, value: any) {
    // Convert value to appropriate type
    let convertedValue = value;

    if (value !== '' && value !== null) {
      switch (column.data_type) {
        case 'number':
          convertedValue = value === '' ? null : parseInt(value, 10);
          break;
        case 'decimal':
          convertedValue = value === '' ? null : parseFloat(value);
          break;
        case 'boolean':
          convertedValue = Boolean(value);
          break;
      }
    }

    this._formData = {
      ...this._formData,
      [column.name]: convertedValue,
    };
  }

  render() {
    return html`
      <div class="form-container">
        <h3 class="form-title">
          ${this.isEdit ? 'Edit Record' : 'Add New Record'}
        </h3>

        ${this._error ? html`<div class="error">${this._error}</div>` : ''}

        <form @submit=${this._handleSubmit}>
          ${this.columns
            .filter((col) => !['id', 'created_at', 'updated_at'].includes(col.name))
            .map((column) => html`
              <div class="form-group">
                <label class="form-label">
                  ${column.display_name || column.name}
                  ${column.is_required ? html`<span class="required-mark">*</span>` : ''}
                </label>
                ${this._renderInput(column)}
                ${column.is_unique ? html`<div class="field-hint">Must be unique</div>` : ''}
              </div>
            `)}

          <div class="form-actions">
            <button
              type="button"
              class="btn btn-secondary"
              @click=${this._handleCancel}
              ?disabled=${this._isSubmitting}
            >
              Cancel
            </button>
            <button
              type="submit"
              class="btn btn-primary"
              ?disabled=${this._isSubmitting}
            >
              ${this._isSubmitting
                ? 'Saving...'
                : this.isEdit
                ? 'Update'
                : 'Create'}
            </button>
          </div>
        </form>
      </div>
    `;
  }

  private _renderInput(column: ColumnSchema) {
    const value = this._formData[column.name] ?? '';

    switch (column.data_type) {
      case 'text':
        return html`
          <textarea
            class="form-textarea"
            .value=${String(value)}
            @input=${(e: Event) =>
              this._updateField(column, (e.target as HTMLTextAreaElement).value)}
            ?required=${column.is_required}
          ></textarea>
        `;

      case 'boolean':
        return html`
          <label class="checkbox-label">
            <input
              type="checkbox"
              class="form-checkbox"
              .checked=${Boolean(value)}
              @change=${(e: Event) =>
                this._updateField(column, (e.target as HTMLInputElement).checked)}
            />
            ${column.is_required ? 'Required' : 'Optional'}
          </label>
        `;

      case 'number':
        return html`
          <input
            type="number"
            class="form-input"
            .value=${value === null || value === '' ? '' : String(value)}
            @input=${(e: Event) =>
              this._updateField(column, (e.target as HTMLInputElement).value)}
            ?required=${column.is_required}
            step="1"
          />
        `;

      case 'decimal':
        return html`
          <input
            type="number"
            class="form-input"
            .value=${value === null || value === '' ? '' : String(value)}
            @input=${(e: Event) =>
              this._updateField(column, (e.target as HTMLInputElement).value)}
            ?required=${column.is_required}
            step="0.01"
          />
        `;

      case 'date':
        return html`
          <input
            type="date"
            class="form-input"
            .value=${String(value)}
            @input=${(e: Event) =>
              this._updateField(column, (e.target as HTMLInputElement).value)}
            ?required=${column.is_required}
          />
        `;

      case 'datetime':
        return html`
          <input
            type="datetime-local"
            class="form-input"
            .value=${String(value)}
            @input=${(e: Event) =>
              this._updateField(column, (e.target as HTMLInputElement).value)}
            ?required=${column.is_required}
          />
        `;

      default: // string
        return html`
          <input
            type="text"
            class="form-input"
            .value=${String(value)}
            @input=${(e: Event) =>
              this._updateField(column, (e.target as HTMLInputElement).value)}
            ?required=${column.is_required}
            maxlength=${column.max_length || 255}
          />
        `;
    }
  }
}
