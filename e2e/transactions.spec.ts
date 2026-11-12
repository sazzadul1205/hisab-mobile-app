import { test, expect } from './test-fixtures';

const TEST_PIN = '123457';

async function enterPin(page, pin) {
  for (const digit of pin) {
    await page.click(`button[aria-label="Digit ${digit}"]`);
  }
  await page.waitForTimeout(500);
}

async function handleUnlock(page) {
  await page.waitForURL(/.*unlock/, { timeout: 10000 });
  await page.waitForSelector('h2', { timeout: 5000 });
  await enterPin(page, TEST_PIN);
  await page.waitForURL(/.*transactions/, { timeout: 15000 });
}

test.describe('Transactions Page - Advanced Filters', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/transactions');
    // Handle unlock page if redirected (auth state lost on full page reload)
    if (page.url().includes('unlock')) {
      await handleUnlock(page);
    }
    await page.waitForURL(/.*transactions/, { timeout: 10000 });
    await page.waitForLoadState('networkidle');
  });

  test('should display transactions page', async ({ page }) => {
    await expect(page.locator('h2')).toContainText('Transactions');
  });

  test('should have search bar', async ({ page }) => {
    await expect(page.locator('input[placeholder*="Search"]')).toBeVisible();
  });

  test('should have type filter chips', async ({ page }) => {
    await expect(page.locator('text=All')).toBeVisible();
    await expect(page.locator('text=Income')).toBeVisible();
    await expect(page.locator('text=Expense')).toBeVisible();
    await expect(page.locator('text=Transfer')).toBeVisible();
  });

  test('should filter by transaction type', async ({ page }) => {
    await page.click('text=Income');
    await expect(page.locator('[data-selected="true"], .selected, [aria-pressed="true"]')).toContainText('Income');
    
    await page.click('text=Expense');
    await expect(page.locator('[data-selected="true"], .selected, [aria-pressed="true"]')).toContainText('Expense');
  });

  test('should open filter modal', async ({ page }) => {
    // Click filter button (icon button with filter icon)
    await page.click('button[aria-label*="Filter" i], button[label*="Filter" i]');
    
    // Check if modal opens
    await expect(page.locator('text=Filters')).toBeVisible();
    await expect(page.locator('text=Date range')).toBeVisible();
    await expect(page.locator('text=Account')).toBeVisible();
    await expect(page.locator('text=Category')).toBeVisible();
    await expect(page.locator('text=Amount range')).toBeVisible();
    await expect(page.locator('text=Sort by')).toBeVisible();
  });

  test('should have date preset options', async ({ page }) => {
    await page.click('button[aria-label*="Filter" i], button[label*="Filter" i]');
    
    await expect(page.locator('text=All time')).toBeVisible();
    await expect(page.locator('text=Today')).toBeVisible();
    await expect(page.locator('text=This week')).toBeVisible();
    await expect(page.locator('text=This month')).toBeVisible();
    await expect(page.locator('text=Previous month')).toBeVisible();
    await expect(page.locator('text=Custom range')).toBeVisible();
  });

  test('should have sort options', async ({ page }) => {
    await page.click('button[aria-label*="Filter" i], button[label*="Filter" i]');
    
    await expect(page.locator('text=Newest first')).toBeVisible();
    await expect(page.locator('text=Oldest first')).toBeVisible();
    await expect(page.locator('text=Highest amount')).toBeVisible();
    await expect(page.locator('text=Lowest amount')).toBeVisible();
  });

  test('should clear all filters', async ({ page }) => {
    await page.click('button[aria-label*="Filter" i], button[label*="Filter" i]');
    await page.click('text=Clear all');
    
    // Modal should close or filters should be reset
    await expect(page.locator('text=Filters')).not.toBeVisible();
  });
});