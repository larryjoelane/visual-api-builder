# Day 2 Implementation Plan

## Date: February 13, 2026

## 🎯 Objectives

**Primary Goal**: Fix Day 1 broken features and implement the core product feature (dynamic API generation)

**Success Criteria**:
- ✅ User can create a table via UI
- ✅ User can add columns to table via UI
- ✅ System auto-generates CRUD endpoints for user tables
- ✅ User can insert/query data via Swagger or API calls
- ✅ End-to-end flow works: create table → add columns → insert data → query data

---

## 🔧 Phase 1: Fix Day 1 Broken Features (FIRST - BEFORE ANYTHING ELSE)

### Task 1.1: Fix Add Column Button
**Issue**: Button shows form but clicking "Add Column" does nothing

**Steps**:
1. Start backend server (`cd backend; npm run dev`)
2. Start frontend server (`cd frontend; npm run dev`)
3. Open browser to http://localhost:5173
4. Create a test table (if needed)
5. Click "Add Column" button
6. Fill form and click submit
7. Check browser console for errors
8. Check Network tab for API call
9. Debug and fix the ONE specific issue
10. Test until button works

**Acceptance**: Column is added and appears in UI after clicking submit

---

### Task 1.2: Test/Fix New Table Button
**Issue**: Code exists but never tested in browser

**Steps**:
1. With servers running, click "New Table" button
2. Fill form with table name
3. Click submit
4. Check console for errors
5. Check Network tab for API call
6. Verify table appears in sidebar
7. Fix any issues found

**Acceptance**: Table is created and appears in sidebar after submit

---

### Task 1.3: Verify End-to-End Table/Column Creation
**Issue**: Never tested the complete flow

**Steps**:
1. Delete existing test data (if any)
2. Create new table "products"
3. Add column "name" (string, required)
4. Add column "price" (decimal, required)
5. Add column "description" (text, optional)
6. Check backend database: `SELECT * FROM tables`
7. Check backend database: `SELECT * FROM columns WHERE table_id = ?`
8. Check backend database: `PRAGMA table_info(products)`

**Acceptance**: 
- Table created in `tables` system table
- Columns created in `columns` system table
- SQLite table `products` exists with correct schema

---

## 🚀 Phase 2: Core Feature - Dynamic API Generation (AFTER Phase 1 Works)

### Task 2.1: Create Dynamic Routes Service
**File**: `backend/src/services/dynamic-routes.service.ts`

**Purpose**: Service to read user tables from `tables` system table and register CRUD routes dynamically

**Implementation**:
```typescript
class DynamicRoutesService {
  async loadAllUserTables(): Promise<TableSchema[]>
  async registerRoutesForTable(fastify: FastifyInstance, table: TableSchema): Promise<void>
  async generateCRUDHandlers(table: TableSchema, columns: ColumnSchema[]): CRUDHandlers
  async refreshRoutes(): Promise<void>
}
```

**Features**:
- Load all tables from `tables` system table on startup
- For each table, generate 5 CRUD endpoints:
  - `GET /api/v1/data/{tableName}` - List all records
  - `GET /api/v1/data/{tableName}/{id}` - Get single record
  - `POST /api/v1/data/{tableName}` - Create record
  - `PUT /api/v1/data/{tableName}/{id}` - Update record
  - `DELETE /api/v1/data/{tableName}/{id}` - Delete record
- Validate request bodies against column schema
- Generate TypeBox schemas from column definitions

---

### Task 2.2: Register Dynamic Routes on Server Startup
**File**: `backend/src/server.ts`

**Steps**:
1. Import DynamicRoutesService
2. After database initialization, call `loadAllUserTables()`
3. For each table, call `registerRoutesForTable()`
4. Log registered routes

**Acceptance**: Server logs show "Registered dynamic routes for table: products"

---

### Task 2.3: Auto-Refresh Routes When Schema Changes
**File**: `backend/src/routes/tables.ts` and `backend/src/routes/columns.ts`

**Steps**:
1. After POST /api/v1/tables - call `dynamicRoutes.refreshRoutes()`
2. After POST /api/v1/columns - call `dynamicRoutes.refreshRoutes()`
3. After DELETE /api/v1/tables/:id - call `dynamicRoutes.refreshRoutes()`
4. After DELETE /api/v1/columns/:id - call `dynamicRoutes.refreshRoutes()`

**Acceptance**: Creating a table immediately makes endpoints available without restart

---

### Task 2.4: Update Swagger Documentation
**File**: `backend/src/services/dynamic-routes.service.ts`

**Steps**:
1. Generate OpenAPI schema for each dynamic route
2. Include in Swagger UI
3. Show request/response examples
4. Include validation rules

**Acceptance**: Swagger UI shows GET/POST/PUT/DELETE endpoints for user tables

---

### Task 2.5: Test Dynamic API Generation End-to-End

**Steps**:
1. Start backend server
2. Open Swagger UI at http://localhost:3000/documentation
3. Use POST /api/v1/tables to create "users" table
4. Use POST /api/v1/columns to add "name" (string, required)
5. Use POST /api/v1/columns to add "email" (string, required, unique)
6. Refresh Swagger UI
7. Verify endpoints exist: GET/POST/PUT/DELETE /api/v1/data/users
8. Click "Try it out" on POST /api/v1/data/users
9. Insert test data: `{"name": "John", "email": "john@example.com"}`
10. Verify 201 Created response
11. Click "Try it out" on GET /api/v1/data/users
12. Verify data is returned
13. Check database: `SELECT * FROM users`

**Acceptance**: 
- Endpoints auto-generated
- Data inserted successfully
- Data queryable via API
- Data persists in SQLite

---

## 📊 Phase 3: Data Management UI (AFTER Phase 2 Works)

### Task 3.1: Create Data Grid Component
**File**: `frontend/src/components/data/data-grid.ts`

**Features**:
- Display table data in grid/spreadsheet view
- Pagination (20 rows per page)
- Column headers with data types
- Empty state when no data

---

### Task 3.2: Create Add Row Form
**File**: `frontend/src/components/data/row-form.ts`

**Features**:
- Modal dialog for adding rows
- Form fields based on column schema
- Input validation (required, unique, type checking)
- Submit to POST /api/v1/data/{tableName}

---

### Task 3.3: Add Edit/Delete Row Actions
**File**: `frontend/src/components/data/data-grid.ts`

**Features**:
- Edit button per row → opens row-form in edit mode
- Delete button per row → confirmation dialog
- PUT /api/v1/data/{tableName}/{id} for updates
- DELETE /api/v1/data/{tableName}/{id} for deletes

---

### Task 3.4: Integrate Data View into Table Designer
**File**: `frontend/src/components/designer/table-designer.ts`

**Steps**:
1. Add "Data" tab next to "Schema" tab
2. Schema tab shows columns (existing functionality)
3. Data tab shows data-grid component
4. "Add Row" button in data tab

---

### Task 3.5: Test Data Management End-to-End

**Steps**:
1. With servers running, navigate to "products" table
2. Click "Data" tab
3. Verify empty state shows
4. Click "Add Row" button
5. Fill form: name="Laptop", price=999.99, description="Gaming laptop"
6. Submit form
7. Verify row appears in grid
8. Click "Edit" on row
9. Change price to 899.99
10. Submit
11. Verify updated in grid
12. Refresh page
13. Verify data persists
14. Click "Delete" on row
15. Confirm deletion
16. Verify row removed

**Acceptance**: Full CRUD operations work through UI

---

## ✅ Phase 4: Validation & Testing

### Task 4.1: API Validation Tests
**Test Cases**:
- [ ] Required fields are enforced
- [ ] Unique constraints are enforced
- [ ] Data types are validated
- [ ] Invalid table names rejected
- [ ] Non-existent tables return 404
- [ ] Invalid IDs return 404
- [ ] Malformed JSON returns 400

---

### Task 4.2: UI Validation Tests
**Test Cases**:
- [ ] Cannot submit empty required fields
- [ ] Cannot submit duplicate unique values
- [ ] Type mismatches show error messages
- [ ] Loading states show during API calls
- [ ] Error messages display on failure
- [ ] Success feedback after operations

---

### Task 4.3: Integration Tests
**Test Case: Complete User Journey**
1. User opens app
2. Creates "customers" table
3. Adds columns: name, email, phone, created_at
4. Switches to Data tab
5. Adds 3 customer records
6. Edits 1 record
7. Deletes 1 record
8. Refreshes page
9. Data still present
10. Makes API call via curl/Postman
11. Data returned correctly

**Acceptance**: Entire flow works without errors

---

## 📋 Autonomous Execution Checklist

### Phase 1: Fix Day 1 (Immediate)
- [x] Start backend server in background
- [x] Start frontend server in background
- [ ] Fix add column button (debug browser console/network)
- [ ] Test new table button
- [ ] Verify table/column creation persists

### Phase 2: Core Feature (Next)
- [ ] Create dynamic-routes.service.ts
- [ ] Implement loadAllUserTables()
- [ ] Implement registerRoutesForTable()
- [ ] Generate CRUD handlers with validation
- [ ] Update server.ts to load dynamic routes
- [ ] Add route refresh on schema changes
- [ ] Update Swagger docs
- [ ] Test with Swagger UI "Try it out"

### Phase 3: Data UI (After Core Works)
- [ ] Create data-grid.ts component
- [ ] Create row-form.ts component
- [ ] Add edit/delete actions
- [ ] Integrate into table-designer
- [ ] Test complete CRUD flow in UI

### Phase 4: Validation (Final)
- [ ] Test API validation edge cases
- [ ] Test UI validation edge cases
- [ ] Complete integration test
- [ ] Update README with usage examples

---

## 🎯 Definition of Done

Day 2 is complete when:
1. ✅ User can create tables via UI (verified in browser)
2. ✅ User can add columns via UI (verified in browser)
3. ✅ System auto-generates CRUD APIs for user tables
4. ✅ Swagger UI shows user table endpoints
5. ✅ User can insert data via Swagger "Try it out"
6. ✅ User can query data via Swagger "Try it out"
7. ✅ User can view data in UI grid
8. ✅ User can add/edit/delete rows via UI
9. ✅ Data persists across page refreshes
10. ✅ All operations verified by checking SQLite database

**Not done until**: Every item above is manually tested and working.

---

## 🚨 Critical Rules

1. **Fix Phase 1 FIRST** - do not move to Phase 2 until add column button works
2. **Test in browser** - start servers and click buttons before claiming done
3. **One issue at a time** - fix add column, then new table, then move on
4. **Verify in database** - check SQLite to confirm data persists
5. **Use Swagger UI** - test all endpoints with "Try it out"
6. **Check console/network** - debug errors before implementing new features
7. **No assumptions** - if it's not tested in browser, it doesn't work

---

## 📊 Expected Outcomes

### End of Phase 1
- Add column button works
- New table button works
- Can create tables and columns via UI
- Changes persist in database

### End of Phase 2
- Creating "users" table auto-generates /api/v1/data/users endpoints
- Can POST data via Swagger
- Can GET data via Swagger
- Swagger docs show all user table endpoints
- **PRODUCT IS FUNCTIONAL**

### End of Phase 3
- Can view table data in UI grid
- Can add rows via UI form
- Can edit rows via UI
- Can delete rows via UI
- Complete visual API builder experience

### End of Phase 4
- All validation works
- All error cases handled
- Product ready for demo
- Documentation complete

---

**Estimated Time**: 4-6 hours (with focused, granular approach)
**Priority**: Phase 1 → Phase 2 → Phase 3 → Phase 4 (NO SKIPPING)
