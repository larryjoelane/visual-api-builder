# GitHub Copilot Development Journal

## Purpose
This journal documents my thought process, decisions, and learnings while using GitHub Copilot to build the Visual API Builder project.

---

## February 12, 2026

### Session 1: Project Setup & Architecture Decisions

#### Initial Setup
Started by creating comprehensive GitHub Copilot instructions to guide code generation throughout the project.

**Tech Stack Decisions:**
- **Frontend**: Lit.js (Web Components) + TypeScript + CSS
- **Build Tool**: Vite - chosen for fast dev server and excellent TypeScript support
- **Backend**: Fastify (TypeScript/Node.js) - initially considered FastAPI but switched to Fastify to maintain full TypeScript stack
- **API Docs**: Swagger/OpenAPI via @fastify/swagger
- **Testing**: Playwright - covers both frontend components and backend API testing in one unified framework
- **Database**: SQLite with better-sqlite3 - lightweight, file-based, perfect for this use case

#### Key Architecture Patterns

**Object Pooling & Resource Management:**
- Implemented AsyncDatabase wrapper around better-sqlite3 for promise-based operations
- Enabled WAL mode for better concurrency
- Proper cleanup in Fastify's `onClose` hooks

**Error Handling Strategy:**
- Custom error classes (AppError, ValidationError, NotFoundError)
- Centralized error handler using Fastify's `setErrorHandler`
- Structured error logging with request context
- Consistent error response format across all endpoints

**Agent Files Created:**
1. **frontend-agent.md** - Specializes in Lit.js components, state management, and accessibility
2. **backend-agent.md** - Focuses on Fastify patterns, SQLite operations, and API design
3. **testing-agent.md** - Covers Playwright testing for both UI and API

#### Why These Choices?

**Fastify over FastAPI:**
- Maintains consistent TypeScript throughout the stack
- Excellent performance characteristics
- Rich plugin ecosystem
- Built-in dependency injection via decorators

**SQLite over PostgreSQL:**
- Simpler deployment (no separate DB server)
- Perfect for medium-scale applications
- File-based makes backup/restore trivial
- WAL mode provides good concurrency for our needs

**Playwright over Jest/Vitest:**
- Single framework for both component and API testing
- Excellent TypeScript support
- Built-in accessibility testing with @axe-core/playwright
- Cross-browser testing out of the box
- Visual regression capabilities

#### Project Structure
```
backend/
├── src/
│   ├── server.ts
│   ├── plugins/
│   │   └── database.ts      # SQLite connection & AsyncDatabase wrapper
│   ├── routes/
│   ├── services/            # Business logic layer
│   ├── errors/              # Custom error classes
│   ├── schemas/             # TypeBox validation schemas
│   └── config/

frontend/
├── src/
│   ├── components/
│   │   ├── common/          # Reusable components
│   │   ├── features/        # Feature-specific components
│   │   └── layout/
│   ├── services/
│   │   └── api-client.ts    # Centralized API calls
│   ├── types/
│   └── styles/

tests/                       # Playwright tests
```

#### Next Steps
- [ ] Set up actual project scaffolding (package.json, tsconfig, etc.)
- [ ] Initialize SQLite database with schema
- [ ] Create basic CRUD endpoints
- [ ] Build initial Lit components
- [ ] Set up Playwright test suite
- [ ] Configure CI/CD pipeline

#### Questions/Concerns
- Need to decide on authentication strategy (JWT? Session-based?)
- Should implement rate limiting from the start?
- Consider adding a caching layer (Redis?) for future scaling

#### Lessons Learned
- GitHub Copilot benefits greatly from detailed, example-rich instruction files
- Separate agent files help focus Copilot's expertise on specific domains
- Important to establish patterns early (error handling, database access) for consistency

---

## Day 1: Product Definition & Planning

### Product Vision Clarity
Defined the core product concept: **Visual API Builder** - a tool that enables users to create REST APIs through visual design of tables and columns.

**Core Value Proposition:**
- Create APIs in minutes without writing backend code
- Visual drag-and-drop interface for data modeling
- Auto-generated Swagger documentation for immediate testing
- Full CRUD operations generated automatically

### PRD Creation
Created comprehensive Product Requirements Document covering:

**Key User Personas:**
1. Frontend developers needing quick backend APIs for prototypes
2. Product managers wanting to demo features without developer dependency
3. Backend developers prototyping new services

**MVP Features (Phase 1):**
1. **Visual Table Designer** - Drag-and-drop table creation
2. **Visual Column Designer** - Configure columns with data types, constraints
3. **Auto-Generated API Endpoints** - 5 CRUD endpoints per table
4. **Auto-Generated Swagger Docs** - Interactive API documentation
5. **Data Management UI** - Spreadsheet-like interface for data editing

**Data Types Supported:**
- string (VARCHAR)
- text (TEXT)
- number (INTEGER)
- decimal (REAL/FLOAT)
- boolean
- date
- datetime

### System Architecture Decisions

**Meta-Schema Design:**
Using SQLite to store both:
1. **System tables** (`tables`, `columns`) - Store schema definitions
2. **Dynamic user tables** - Created on-the-fly based on user designs

This approach allows dynamic API generation without code deployment.

**Key Technical Components:**

*Frontend:*
- `table-designer.ts` - Main canvas for visual design
- `table-list.ts` - Sidebar navigation
- `column-editor.ts` - Column property configuration
- `data-grid.ts` - Data viewing/editing interface
- `swagger-viewer.ts` - Embedded Swagger UI

*Backend:*
- `schema.service.ts` - Manages dynamic table creation/modification
- `api-generator.service.ts` - Creates routes at runtime
- `validation.service.ts` - Schema-based validation
- `swagger.service.ts` - Real-time OpenAPI spec generation
- `dynamic-routes.ts` - Plugin for runtime route registration

### API Design Decisions

**Endpoint Pattern:**
```
GET    /api/v1/{table}       - List all records
GET    /api/v1/{table}/{id}  - Get single record
POST   /api/v1/{table}       - Create record
PUT    /api/v1/{table}/{id}  - Update record
DELETE /api/v1/{table}/{id}  - Delete record
```

**Response Format:**
Standardized JSON responses with data/pagination/error structure for consistency.

**Swagger Integration:**
- Live at `/documentation`
- Auto-updates when schema changes
- "Try it out" functionality for immediate testing

### User Flow Mapping

**Primary Happy Path:** (Target < 5 minutes)
1. Create table (e.g., "users")
2. Add columns (email, name)
3. System auto-generates 5 endpoints
4. Open Swagger UI
5. Test POST endpoint
6. View data in grid
7. Success!

This flow validates the entire product concept end-to-end.

### Success Metrics Defined

**MVP Launch (Day 30):**
- Table creation < 2 minutes
- API response time < 100ms
- Support 50+ tables
- Zero critical bugs

**User Adoption (Day 60):**
- 100+ users
- 500+ APIs created
- < 5% error rate

### Scope Control

**In Scope (Phase 1):**
- Single table CRUD operations
- Basic data types
- Manual data entry
- Swagger documentation

**Out of Scope (Future Phases):**
- Table relationships/JOINs
- Advanced querying (filters, sorts)
- Authentication
- Data import/export
- Code generation

### Technical Challenges Identified

1. **Dynamic Route Registration** - Need Fastify plugin that can add routes at runtime
2. **Schema Validation** - Build TypeBox schemas dynamically from column definitions
3. **SQLite ALTER TABLE Limitations** - Cannot drop columns easily; may need table recreation
4. **Real-time Swagger Updates** - Regenerate OpenAPI spec when schema changes
5. **Data Grid Performance** - Large tables need virtual scrolling

### Next Immediate Steps

**Day 2 Tasks:**
- [ ] Set up project scaffolding (package.json for both frontend/backend)
- [ ] Initialize SQLite database with system tables
- [ ] Create database schema service with table/column management
- [ ] Build basic table creation API endpoint
- [ ] Create initial Lit component for table designer

**Week 1 Goals:**
- System tables functional
- Can create/edit/delete tables via API
- Can add/remove columns
- Basic Swagger integration working

### Open Questions

1. **Column Modification:** How to handle changing column type when data exists? (Options: validate compatibility, clear data, block change)
2. **Reserved Keywords:** How to prevent users from creating tables named "table" or "column"?
3. **Naming Conflicts:** Should we namespace user tables (e.g., `user_users`) to avoid conflicts?
4. **Data Seeding:** Should we provide sample data generators for testing?
5. **Undo/Redo:** How important is this for MVP vs. later?

**Decisions Made:**
- Start with blocking incompatible column type changes
- Maintain list of reserved names for validation
- User tables use direct names; we'll document reserved names clearly
- No data seeding in MVP; users manually add data via grid
- Undo/redo deferred to Phase 2

### Reflections

**What's Working:**
- Clear product vision makes technical decisions easier
- Breaking into phases helps manage scope
- Focusing on single-user first simplifies initial architecture

**Concerns:**
- SQLite may limit scaling; but acceptable for MVP
- Dynamic route registration might have edge cases
- Need to carefully design schema migration system

**Key Insight:**
The meta-schema approach (tables about tables) is elegant and powerful. It allows the system to be self-describing and makes features like schema versioning possible in the future.

---

