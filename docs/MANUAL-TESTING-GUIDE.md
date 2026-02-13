# Manual Testing Guide - Day 2 Completion

**Status**: Code implementation complete. Manual browser testing required.

**Servers Running**:
- ✅ Backend: http://localhost:3000 (API working, tested via PowerShell)
- ✅ Frontend: http://localhost:5173 (Vite dev server running)

**Browser**: Open at http://localhost:5173

---

## Test Checklist

### ✅ Prerequisites (Already Verified)
- [x] Backend server running on port 3000
- [x] Frontend server running on port 5173
- [x] Test table `test_products` exists with 1 record
- [x] Dynamic API endpoint `/api/v1/data/test_products` responding correctly
- [x] TypeScript compilation successful (0 errors, only unused import warnings which are now fixed)

### 📋 Manual Testing Steps

#### 1. Initial Load
- [ ] Browser loads http://localhost:5173 without errors
- [ ] Check browser console (F12) - should be no red errors
- [ ] Sidebar shows "test_products" table

#### 2. Table Designer View
- [ ] Click on "test_products" in sidebar
- [ ] Table header shows "Test Products Table"
- [ ] **Two tabs visible**: "Schema" and "Data"
- [ ] Schema tab is active by default (blue underline)

#### 3. Schema Tab (Default View)
- [ ] "Columns" section visible
- [ ] "+ Add Column" button visible (green)
- [ ] Two columns displayed:
  - product_name (string, Required badge)
  - price (decimal, Required badge)
- [ ] Each column has a "Delete" button

#### 4. Data Tab (NEW FEATURE)
- [ ] Click "Data" tab button
- [ ] Tab switches (Data tab gets blue underline)
- [ ] **Expected view**:
  - "Table Data" header
  - "+ Add Row" button (blue, top right)
  - Data grid/table showing:
    - Headers: ID, Product Name, Price, Created At, Updated At, Actions
    - One row of data:
      - ID: 1
      - Product Name: Gaming Laptop
      - Price: 999.99
      - Created At: (date)
      - Updated At: (date)
      - Actions: Edit button, Delete button
  - Pagination info: "Showing 1 of 1 records"
  - Pagination buttons: Previous (disabled), Next (disabled)

#### 5. Add Row Functionality
- [ ] Click "+ Add Row" button
- [ ] **Modal appears** with form overlay
- [ ] Click outside modal - modal should close
- [ ] Click "+ Add Row" again
- [ ] Form shows:
  - Title: "Add Row"
  - Two input fields:
    - Product Name (text input, required *)
    - Price (number input, required *)
  - Cancel button
  - Submit button (blue)
- [ ] Try clicking Submit with empty fields - should not submit (browser validation)
- [ ] Fill in data:
  - Product Name: "Wireless Mouse"
  - Price: 29.99
- [ ] Click Submit button
- [ ] **Expected result**:
  - Modal closes
  - Grid refreshes and shows TWO rows now
  - "Showing 2 of 2 records"
  - New row appears with ID: 2

#### 6. Edit Row Functionality
- [ ] Click "Edit" button on the Gaming Laptop row (ID: 1)
- [ ] **Modal appears** with form
- [ ] Form title: "Edit Row"
- [ ] Form shows pre-filled values:
  - Product Name: Gaming Laptop
  - Price: 999.99
- [ ] Change Price to: 899.99
- [ ] Click Submit
- [ ] **Expected result**:
  - Modal closes
  - Grid refreshes
  - Price cell now shows 899.99
  - Updated At timestamp should change

#### 7. Delete Row Functionality
- [ ] Click "Delete" button on the Wireless Mouse row (ID: 2)
- [ ] **Confirm dialog appears**: "Are you sure you want to delete this record?"
- [ ] Click Cancel - nothing happens
- [ ] Click "Delete" again, confirm this time
- [ ] **Expected result**:
  - Row disappears from grid
  - "Showing 1 of 1 records"
  - Only Gaming Laptop row remains

#### 8. Data Persistence
- [ ] Refresh the entire browser page (F5 or Ctrl+R)
- [ ] **Expected result**:
  - Page reloads
  - Click on test_products table
  - Data tab shows the same data (1 row, Gaming Laptop at $899.99)
  - Data persisted correctly

#### 9. Switch Between Tabs
- [ ] Click Schema tab
- [ ] **Expected**: Columns view appears (add column form, column list)
- [ ] Click Data tab
- [ ] **Expected**: Data grid appears again
- [ ] No console errors during tab switching

#### 10. Add Second Product (Full Flow)
- [ ] In Data tab, click "+ Add Row"
- [ ] Fill form:
  - Product Name: "Mechanical Keyboard"
  - Price: 149.99
- [ ] Submit
- [ ] **Expected**: Grid shows 2 records
- [ ] Edit the keyboard price to 139.99
- [ ] **Expected**: Price updates successfully
- [ ] Verify data persists after refresh

---

## Expected API Behavior

### GET /api/v1/data/test_products
**Status**: ✅ Tested via PowerShell, working
```json
{
  "data": [{ 
    "id": 1, 
    "product_name": "Gaming Laptop", 
    "price": 999.99,
    "created_at": "...",
    "updated_at": "..."
  }],
  "pagination": { "total": 1, "limit": 20, "offset": 0, "hasMore": false }
}
```

### POST /api/v1/data/test_products
**Status**: ✅ Tested via PowerShell, working
```json
// Request body
{ "product_name": "...", "price": 123.45 }

// Response 201
{ "id": 2, "product_name": "...", "price": 123.45, "created_at": "...", "updated_at": "..." }
```

### PUT /api/v1/data/test_products/:id
**Status**: ✅ Tested via PowerShell, working

### DELETE /api/v1/data/test_products/:id
**Status**: ✅ Tested via PowerShell, working

---

## Known Issues / Limitations

### None Expected
All code has been implemented following best practices:
- ✅ Lit.js reactivity patterns (object spread)
- ✅ TypeScript strict mode
- ✅ Proper event handling
- ✅ Modal click-outside-to-close behavior
- ✅ Form validation (required fields)
- ✅ API error handling
- ✅ Loading states (though not visible for fast local API)

### If Issues Occur

**If tabs don't switch:**
- Check browser console for JavaScript errors
- Verify `_activeTab` state is changing (add console.log in click handler)

**If modal doesn't appear:**
- Check if `_showRowForm` state is true
- Verify modal-overlay CSS is not display:none
- Check z-index is 1000

**If data grid is empty despite API having data:**
- Check Network tab (F12 → Network)
- Look for GET request to `/api/v1/data/test_products`
- Verify response status is 200
- Check response body has data array

**If Add Row doesn't create record:**
- Check Network tab for POST request
- Look at request payload
- Check response status (should be 201)
- Check for console errors about validation

**If Edit doesn't work:**
- Check Network tab for PUT request
- Verify correct ID in URL
- Check request payload
- Verify response status (should be 200)

---

## Success Criteria

### Day 2 is COMPLETE when:
- [x] Dynamic API generation working (✅ COMPLETE - tested via PowerShell)
- [ ] Schema/Data tabs switch correctly
- [ ] Data grid displays table data
- [ ] Add Row creates new records
- [ ] Edit Row updates records
- [ ] Delete Row removes records
- [ ] Data persists after page refresh
- [ ] No console errors
- [ ] All actions feel responsive and correct

---

## Next Steps After Testing

1. **If all tests pass**: Create Day 2 completion summary documenting the successful implementation

2. **If issues found**: Debug ONE issue at a time:
   - Check browser console
   - Check Network tab
   - Add console.log statements
   - Fix the ONE issue
   - Test again
   - Move to next issue

3. **Future enhancements** (not part of Day 2):
   - Pagination controls for >20 records
   - Column sorting
   - Search/filter functionality
   - Bulk operations
   - Export data (CSV, JSON)
   - Import data
   - Custom validation rules
   - Relationship management (foreign keys)

---

**Testing Date**: February 13, 2026  
**Code Status**: Implementation complete, awaiting manual verification  
**Testing Required**: YES - User must click through UI to verify all functionality works as expected
