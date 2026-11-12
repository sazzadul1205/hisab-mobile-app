import { test, expect } from './test-fixtures';

test.describe('Dashboard - Budget Summary', () => {
  test('should display dashboard with greeting', async ({ page }) => {
    await expect(page.locator('h2')).toContainText(/Good (morning|afternoon|evening)/);
  });

  test('should show combined balance card', async ({ page }) => {
    await expect(page.locator('text=Combined balance')).toBeVisible();
  });

  test('should show quick actions', async ({ page }) => {
    await expect(page.locator('text=Income')).toBeVisible();
    await expect(page.locator('text=Expense')).toBeVisible();
    await expect(page.locator('text=Transfer')).toBeVisible();
    await expect(page.locator('text=Import')).toBeVisible();
  });

  test('should show weekly chart', async ({ page }) => {
    await expect(page.locator('text=This week')).toBeVisible();
  });

  test('should show budget summary when budgets exist', async ({ page }) => {
    // First add a budget
    await page.goto('/budgets');
    await page.waitForURL(/.*budgets/, { timeout: 10000 });
    await page.click('button:has-text("Add budget")');
    await page.click('[aria-label*="Category"], button:has-text("Select expense category")');
    await page.click('text=Groceries');
    await page.fill('input[placeholder="0"]', '5000');
    await page.click('button:has-text("Add budget")');
    
    // Go back to dashboard
    await page.goto('/dashboard');
    await page.waitForLoadState('networkidle');
    
    // Should show budget summary
    await expect(page.locator('text=Budget summary')).toBeVisible();
    await expect(page.locator('text=Groceries')).toBeVisible();
  });

  test('should navigate to budgets page from dashboard', async ({ page }) => {
    await page.click('a:has-text("View all"), button:has-text("View all")');
    await expect(page).toHaveURL(/.*budgets/);
  });
});