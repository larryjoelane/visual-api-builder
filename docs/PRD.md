# Product Requirements Document (PRD)
## Visual API Builder

**Version:** 1.0  
**Date:** February 12, 2026  
**Status:** Draft  

---

## Executive Summary

Visual API Builder is a web-based tool that enables developers and non-technical users to create fully functional REST APIs through a visual interface. Users design data structures using drag-and-drop table and column widgets, and the system automatically generates API endpoints, database schemas, and interactive Swagger documentation.

---

## Problem Statement

Creating REST APIs traditionally requires:
- Writing backend code for CRUD operations
- Designing database schemas
- Creating API documentation
- Setting up validation and error handling
- Testing endpoints

This process is time-consuming and requires technical expertise, creating a barrier for rapid prototyping and for non-developers who need simple data APIs.

---

## Goals & Objectives

### Primary Goals
1. Enable users to create functional REST APIs in minutes, not hours
2. Auto-generate complete Swagger documentation for every API
3. Provide immediate API testing through integrated Swagger UI
4. Support full CRUD operations without writing code

### Success Metrics
- Time to create first working API: < 5 minutes
- User satisfaction score: > 4.5/5
- API endpoint creation success rate: > 95%
- Concurrent API usage: Support 100+ APIs per instance

---

## User Personas

### Persona 1: Frontend Developer (Primary)
**Name:** Alex  
**Background:** React/Vue developer who needs backend APIs for prototypes  
**Pain Points:** 
- Doesn't want to spin up separate backend projects
- Needs quick mock APIs for frontend development
- Wants realistic data structures, not just static JSON

**Goals:**
- Create API endpoints in minutes
- Test APIs immediately via Swagger
- Export API definitions for team members

### Persona 2: Product Manager (Secondary)
**Name:** Jordan  
**Background:** Non-technical PM who needs to demo features  
**Pain Points:**
- Dependent on developers to create demo APIs
- Can't iterate quickly on data structures
- Needs to share working APIs with stakeholders

**Goals:**
- Create APIs without coding
- Share live API URLs with team
- Modify data structures visually

### Persona 3: Backend Developer (Tertiary)
**Name:** Sam  
**Background:** Backend developer prototyping new services  
**Pain Points:**
- Tedious to set up new API projects
- Repetitive CRUD code for simple resources

**Goals:**
- Rapid API prototyping
- Export generated code for customization
- Quick database schema design

---

## Feature Requirements

### Phase 1: MVP Features (Day 1-30)

#### 1.1 Visual Table Designer
**Priority:** P0 (Critical)

**User Story:**  
*As a user, I want to visually create database tables so that I can define my data structure without writing SQL.*

**Requirements:**
- [ ] Drag-and-drop interface to create new tables
- [ ] Rename tables via inline editing
- [ ] Delete tables with confirmation
- [ ] Display all tables in a sidebar/panel
- [ ] Support creating multiple tables
- [ ] Auto-save table changes

**Acceptance Criteria:**
- User can create a new table with a single click
- Table names must be unique and valid (alphanumeric + underscores)
- Changes reflect immediately in the UI
- System prevents deletion of tables with existing data

#### 1.2 Visual Column Designer
**Priority:** P0 (Critical)

**User Story:**  
*As a user, I want to add columns to my tables with different data types so that I can model my data accurately.*

**Requirements:**
- [ ] Add columns to tables via drag-and-drop or button click
- [ ] Configure column properties:
  - Name (required)
  - Data type (string, number, boolean, date, text)
  - Required/Optional flag
  - Default value
  - Unique constraint
  - Max length (for strings)
- [ ] Reorder columns via drag-and-drop
- [ ] Delete columns with confirmation
- [ ] Auto-add `id` (primary key) and `created_at` columns

**Acceptance Criteria:**
- User can add unlimited columns to a table
- Column names must be unique within a table
- At least one data type is required per column
- Changes update the database schema immediately

**Data Types Supported:**
- `string` - VARCHAR(255)
- `text` - TEXT (unlimited length)
- `number` - INTEGER
- `decimal` - REAL/FLOAT
- `boolean` - BOOLEAN
- `date` - DATE
- `datetime` - DATETIME

#### 1.3 Auto-Generated API Endpoints
**Priority:** P0 (Critical)

**User Story:**  
*As a user, when I create a table, I want REST API endpoints automatically generated so that I can immediately use the API.*

**Requirements:**
- [ ] Auto-generate 5 standard CRUD endpoints per table:
  - `GET /api/v1/{table}` - List all records (with pagination)
  - `GET /api/v1/{table}/{id}` - Get single record
  - `POST /api/v1/{table}` - Create new record
  - `PUT /api/v1/{table}/{id}` - Update existing record
  - `DELETE /api/v1/{table}/{id}` - Delete record
- [ ] Validate requests against column schema
- [ ] Return appropriate HTTP status codes
- [ ] Support query parameters for filtering and sorting (future)
- [ ] Implement pagination (limit, offset)

**Acceptance Criteria:**
- Endpoints are available immediately after table creation
- All endpoints validate input data
- Proper error messages for validation failures
- Response format is consistent across all endpoints

**API Response Format:**
```json
{
  "data": { /* single object or array */ },
  "message": "Success",
  "pagination": {
    "total": 100,
    "limit": 20,
    "offset": 0,
    "hasMore": true
  }
}
```

**Error Response Format:**
```json
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Validation failed",
    "details": [
      {
        "field": "email",
        "message": "Invalid email format"
      }
    ]
  }
}
```

#### 1.4 Auto-Generated Swagger Documentation
**Priority:** P0 (Critical)

**User Story:**  
*As a user, I want to see and test my API endpoints through Swagger UI so that I can immediately verify the API works.*

**Requirements:**
- [ ] Auto-generate OpenAPI 3.0 specification from table schemas
- [ ] Serve Swagger UI at `/documentation`
- [ ] Include all endpoints with full request/response schemas
- [ ] Support "Try it out" functionality for all endpoints
- [ ] Update Swagger docs in real-time when tables change
- [ ] Include validation rules in schema (required, maxLength, etc.)
- [ ] Display example requests and responses

**Acceptance Criteria:**
- User can access Swagger UI immediately
- All endpoints are documented with correct schemas
- "Try it out" successfully executes API calls
- Documentation updates without page refresh when schema changes

#### 1.5 Data Management UI
**Priority:** P1 (High)

**User Story:**  
*As a user, I want to view and edit data in my tables through a UI so that I can populate my API with test data.*

**Requirements:**
- [ ] Display table data in a grid/spreadsheet view
- [ ] Add new rows via form or inline editing
- [ ] Edit existing rows inline
- [ ] Delete rows with confirmation
- [ ] Support all data types with appropriate input controls
- [ ] Validate data against column constraints
- [ ] Paginate large datasets
- [ ] Refresh data view after changes

**Acceptance Criteria:**
- User can add/edit/delete data without using API
- Data validation works consistently with API validation
- Large tables (1000+ rows) load and scroll smoothly
- Changes persist to database immediately

### Phase 2: Enhanced Features (Day 31-60)

#### 2.1 Relationships Between Tables
- Define foreign key relationships
- Visual relationship designer
- Auto-generate JOIN queries
- Cascade delete options

#### 2.2 Advanced Query Support
- Filter data by column values
- Sort by multiple columns
- Search across columns
- Custom query builder UI

#### 2.3 Authentication & Authorization
- API key generation
- Per-endpoint permission controls
- Rate limiting
- CORS configuration UI

#### 2.4 Data Import/Export
- Import CSV data
- Export tables to CSV/JSON
- Bulk data operations
- Seed data templates

#### 2.5 API Versioning
- Create API versions (v1, v2)
- Schema migration tools
- Backward compatibility checks

### Phase 3: Advanced Features (Day 61+)

#### 3.1 Code Generation & Export
- Export API code (TypeScript/Node.js)
- Export database migrations
- Export Swagger spec file
- Docker deployment configuration

#### 3.2 Webhooks & Events
- Configure webhooks for data changes
- Event logging
- Real-time subscriptions

#### 3.3 Custom Business Logic
- Add custom validation rules
- Pre/post processing hooks
- Custom computed fields

---

## Technical Architecture

### Frontend Components

```
src/components/
├── designer/
│   ├── table-designer.ts        # Main table design canvas
│   ├── table-list.ts            # Sidebar with all tables
│   ├── column-editor.ts         # Column configuration panel
│   ├── column-widget.ts         # Draggable column widget
│   └── data-grid.ts             # Data viewing/editing grid
├── api/
│   ├── swagger-viewer.ts        # Embedded Swagger UI
│   └── endpoint-list.ts         # List of generated endpoints
└── common/
    ├── modal.ts                 # Reusable modal dialog
    ├── form-input.ts            # Form controls
    └── button.ts                # Styled buttons
```

### Backend Structure

```
backend/src/
├── routes/
│   ├── tables.ts                # Table CRUD operations
│   ├── dynamic-api.ts           # Dynamic endpoint generator
│   └── swagger.ts               # OpenAPI spec generation
├── services/
│   ├── schema.service.ts        # Database schema management
│   ├── api-generator.service.ts # Dynamic API creation
│   ├── validation.service.ts    # Request validation
│   └── swagger.service.ts       # Swagger spec builder
├── plugins/
│   ├── database.ts              # SQLite connection
│   └── dynamic-routes.ts        # Runtime route registration
└── types/
    ├── table-schema.ts          # Table/column type definitions
    └── api-spec.ts              # OpenAPI types
```

### Database Schema

#### System Tables (Meta-schema)

**tables**
```sql
CREATE TABLE tables (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL UNIQUE,
  display_name TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
```

**columns**
```sql
CREATE TABLE columns (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  table_id INTEGER NOT NULL,
  name TEXT NOT NULL,
  display_name TEXT,
  data_type TEXT NOT NULL, -- string, number, boolean, date, text
  is_required BOOLEAN DEFAULT 0,
  is_unique BOOLEAN DEFAULT 0,
  default_value TEXT,
  max_length INTEGER,
  position INTEGER NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (table_id) REFERENCES tables(id) ON DELETE CASCADE,
  UNIQUE (table_id, name)
);
```

#### Dynamic User Tables
Created dynamically based on user designs, stored in same SQLite database.

---

## User Flows

### Flow 1: Create First API (Happy Path)

1. User lands on empty dashboard
2. Click "Create Table" button
3. Modal appears: "Enter table name" → User enters "users"
4. Table widget appears in canvas
5. System auto-adds `id` and `created_at` columns
6. User clicks "Add Column" on table widget
7. Column editor appears: User enters:
   - Name: `email`
   - Type: `string`
   - Required: ✓
8. User clicks "Add Column" again:
   - Name: `name`
   - Type: `string`
   - Required: ✓
9. Table automatically saves to database
10. User clicks "View API" button
11. Swagger UI opens showing 5 endpoints for `users`
12. User clicks "Try it out" on `POST /api/v1/users`
13. Enters sample data:
    ```json
    {
      "email": "test@example.com",
      "name": "Test User"
    }
    ```
14. Clicks "Execute"
15. API returns 201 Created with new user object
16. User clicks "View Data" tab
17. Sees newly created user in data grid
18. Success! First API created and tested in < 5 minutes

### Flow 2: Edit Existing Table

1. User selects "users" table from sidebar
2. Table widget displays with existing columns
3. User clicks "Add Column"
4. Adds `age` field (type: number, optional)
5. System alters table schema in background
6. Swagger docs auto-update with new field
7. Existing data remains intact (new column is NULL/optional)

### Flow 3: Delete Table

1. User right-clicks on "users" table
2. Context menu appears: "Delete Table"
3. Confirmation modal: "This will delete all data and API endpoints"
4. User confirms
5. Table, data, and API endpoints removed
6. Swagger docs updated

---

## Non-Functional Requirements

### Performance
- Table creation: < 500ms
- API endpoint response: < 100ms (for queries < 1000 rows)
- Swagger UI load: < 2s
- Support 50+ tables per instance
- Support 100,000+ rows per table

### Scalability
- Single SQLite database (Phase 1)
- Future: Support PostgreSQL for production deployments
- Horizontal scaling via Read replicas

### Security
- Input validation on all endpoints
- SQL injection prevention (parameterized queries)
- XSS prevention (sanitized outputs)
- Rate limiting: 100 requests/minute per IP
- Future: API key authentication

### Reliability
- Auto-save all changes
- Transaction support for data operations
- Database backup/restore capability
- Graceful error handling with user-friendly messages

### Usability
- Intuitive drag-and-drop interface
- Undo/redo support (future)
- Keyboard shortcuts for power users
- Responsive design (desktop-first, mobile-friendly)
- Loading states for all async operations

---

## Success Criteria

### MVP Launch Criteria (Day 30)
- [ ] User can create a table with columns in < 2 minutes
- [ ] All 5 CRUD endpoints work correctly
- [ ] Swagger UI is accessible and functional
- [ ] Data grid supports viewing and manual CRUD
- [ ] Zero critical bugs
- [ ] Performance benchmarks met

### User Adoption Criteria (Day 60)
- [ ] 100+ registered users
- [ ] 500+ APIs created
- [ ] Average session time > 15 minutes
- [ ] < 5% error rate on API calls

---

## Future Considerations

### Potential Features
- GraphQL API generation
- Real-time collaboration (multiple users editing)
- Version control for schemas
- API analytics dashboard
- Mock data generation
- Automated testing suite generation
- CI/CD integration
- Multi-tenancy support

### Technical Debt
- Migration from SQLite to PostgreSQL for production
- Implement proper caching layer
- Add comprehensive audit logging
- Implement blue-green deployments

---

## Appendix

### API Naming Conventions
- Table names: snake_case (e.g., `user_profiles`)
- Column names: snake_case (e.g., `first_name`)
- API paths: kebab-case (e.g., `/api/v1/user-profiles`)

### Validation Rules
- Table names: 1-50 characters, alphanumeric + underscores
- Column names: 1-50 characters, alphanumeric + underscores
- Reserved names: `id`, `created_at`, `updated_at` (auto-managed)
- String max length: 1-65535 characters

### Error Codes
- `VALIDATION_ERROR` - Invalid input data
- `NOT_FOUND` - Resource doesn't exist
- `DUPLICATE_ERROR` - Unique constraint violation
- `INTERNAL_SERVER_ERROR` - Unexpected server error

---

**Document Owner:** Development Team  
**Last Updated:** February 12, 2026  
**Next Review:** March 15, 2026
