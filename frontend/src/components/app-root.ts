// Root application component

import { LitElement, html, css } from 'lit';
import { customElement, state } from 'lit/decorators.js';
import './designer/table-list.js';
import './designer/table-designer.js';

@customElement('app-root')
export class AppRoot extends LitElement {
  @state() private _selectedTableId: number | null = null;

  static styles = css`
    :host {
      display: block;
      width: 100%;
      height: 100vh;
      overflow: hidden;
      
      /* CSS Variables for Shadow DOM */
      --color-primary: #2563eb;
      --color-primary-hover: #1d4ed8;
      --color-primary-light: #dbeafe;
      --color-secondary: #64748b;
      --color-secondary-hover: #475569;
      --color-success: #10b981;
      --color-background: #f5f5f5;
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

    .app-container {
      display: grid;
      grid-template-columns: 300px 1fr;
      grid-template-rows: 60px 1fr;
      height: 100%;
      background: var(--color-background);
    }

    .app-header {
      grid-column: 1 / -1;
      display: flex;
      align-items: center;
      padding: 0 1.5rem;
      background: var(--color-primary);
      color: white;
      box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
    }

    .app-header h1 {
      margin: 0;
      font-size: 1.5rem;
      font-weight: 600;
    }

    .app-sidebar {
      background: white;
      border-right: 1px solid var(--color-border);
      overflow-y: auto;
    }

    .app-main {
      overflow: auto;
      padding: 1.5rem;
    }

    .empty-state {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      height: 100%;
      color: var(--color-text-secondary);
      text-align: center;
    }

    .empty-state h2 {
      margin: 0 0 0.5rem;
      font-size: 1.5rem;
      color: var(--color-text-primary, #111827);
    }

    .empty-state p {
      margin: 0;
      font-size: 1rem;
    }
  `;

  private _handleTableSelect(e: CustomEvent<{ tableId: number }>) {
    this._selectedTableId = e.detail.tableId;
  }

  private _handleTableCreated() {
    // Refresh table list
    const tableList = this.shadowRoot?.querySelector('table-list');
    if (tableList) {
      (tableList as any).refresh();
    }
  }

  render() {
    return html`
      <div class="app-container">
        <header class="app-header">
          <h1>Visual API Builder</h1>
        </header>

        <aside class="app-sidebar">
          <table-list
            @table-select=${this._handleTableSelect}
            @table-created=${this._handleTableCreated}
          ></table-list>
        </aside>

        <main class="app-main">
          ${this._selectedTableId
            ? html`
                <table-designer
                  .tableId=${this._selectedTableId}
                ></table-designer>
              `
            : html`
                <div class="empty-state">
                  <h2>Welcome to Visual API Builder</h2>
                  <p>Create a table to get started building your API</p>
                </div>
              `}
        </main>
      </div>
    `;
  }
}
