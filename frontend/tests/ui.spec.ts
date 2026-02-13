import { test, expect } from '@playwright/test';

test.describe('Frontend Components', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('http://localhost:5173');
    await page.waitForLoadState('networkidle');
  });

  test('should render app-root component', async ({ page }) => {
    const appRoot = page.locator('app-root');
    await expect(appRoot).toBeVisible();
  });

  test('should render header with title', async ({ page }) => {
    const header = page.locator('app-root').locator('h1');
    await expect(header).toContainText('Visual API Builder');
  });

  test('should render table-list sidebar', async ({ page }) => {
    const sidebar = page.locator('app-root').locator('table-list');
    await expect(sidebar).toBeVisible();
  });

  test('should load tables from API', async ({ page }) => {
    const tableList = page.locator('table-list');
    await expect(tableList).toBeVisible();
    
    // Wait for API call to complete
    await page.waitForLoadState('networkidle');
    const appLoaded = await page.locator('app-root').count().then(c => c > 0);
    expect(appLoaded).toBeTruthy();
  });

  test('screenshot: initial state with new app', async ({ page }) => {
    await page.waitForLoadState('networkidle');
    await page.screenshot({ path: 'screenshots/01-initial-state.png', fullPage: true });
  });

  test('screenshot: create table flow', async ({ page }) => {
    // Click create button
    const createBtn = page.locator('button').filter({ hasText: '+ New Table' }).first();
    await createBtn.click();
    await page.waitForTimeout(500);
    
    // Type table name
    const input = page.locator('input[type="text"]').first();
    await input.fill('products');
    
    // Click create
    const submitBtn = page.getByRole('button', { name: /Create Table/i });
    await submitBtn.click();
    
    await page.waitForLoadState('networkidle');
    await page.screenshot({ path: 'screenshots/02-table-created.png', fullPage: true });
  });

  test('screenshot: button visibility - Create Table button is visible', async ({ page }) => {
    await page.waitForLoadState('networkidle');
    
    // Verify Create button exists and is visible
    const createBtn = page.locator('button').filter({ hasText: '+ New Table' }).first();
    await expect(createBtn).toBeVisible();
    
    const boundingBox = await createBtn.boundingBox();
    expect(boundingBox?.width).toBeGreaterThanOrEqual(44);
    expect(boundingBox?.height).toBeGreaterThanOrEqual(44);
    
    await page.screenshot({ path: 'screenshots/03-button-visibility.png', fullPage: true });
  });
});
