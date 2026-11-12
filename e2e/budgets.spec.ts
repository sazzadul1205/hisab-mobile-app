import { test, expect } from './test-fixtures';

const TEST_PIN = '123457';

async function enterPin(page, pin) {
  for (const digit of pin) {
    await page.click(`button[aria-label="Digit ${digit}"]`);
  }
  await page.waitForTimeout(500);
}

async function handleUnlockAndNavigate(page, targetUrl) {
  console.log('Handling unlock, target:', targetUrl);
  await page.waitForSelector('h2', { timeout: 5000 });
  await enterPin(page, TEST_PIN);
  // Unlock redirects to dashboard
  await page.waitForURL(/.*dashboard/, { timeout: 15000 });
  // Wait for seedDefaultCategories to complete
  await page.waitForTimeout(3000);
  // Now navigate to target using client-side routing (pushState + router)
  await page.evaluate((url) => {
    window.history.pushState(null, '', url);
    window.dispatchEvent(new PopStateEvent('popstate'));
  }, targetUrl);
  // Wait for React Router to handle the navigation
  await page.waitForURL(new RegExp(targetUrl.replace('/', '\\/')), { timeout: 10000 });
}

test.describe('Budgets Page', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/budgets');
    console.log('URL after goto:', page.url());
    // Handle unlock page if redirected (auth state lost on full page reload)
    if (page.url().includes('unlock') || page.url().includes('welcome') || (await page.locator('h2').textContent())?.includes('Enter your PIN')) {
      console.log('Handling unlock page');
      await handleUnlockAndNavigate(page, '/budgets');
    }
    await page.waitForLoadState('networkidle');
  });

  test('should display budgets page', async ({ page }) => {
    console.log('Test URL:', page.url());
    await expect(page.locator('h2')).toContainText('Budgets');
  });

  test('should show empty state when no budgets', async ({ page }) => {
    await expect(page.locator('text=No budgets yet')).toBeVisible();
    await expect(page.locator('text=Set a monthly spending limit')).toBeVisible();
  });

test('should allow adding a budget', async ({ page }) => {
    // Click add budget button (IconButton with aria-label)
    await page.click('button[aria-label="Add budget"]');
    
    // Wait for BudgetForm to appear (contains "Add budget" heading)
    await page.waitForSelector('text=Add budget', { timeout: 10000 });
    
    // Wait for CategoryPicker grid to render
    await page.waitForSelector('.grid.grid-cols-4', { timeout: 15000 });
    
    // Wait for category buttons to appear inside grid (categories might need time to seed)
    await page.waitForSelector('.grid.grid-cols-4 button', { timeout: 15000 });
    
    // Debug: log all category buttons
    const categoryButtons = await page.locator('.grid.grid-cols-4 button').allTextContents();
    console.log('Available categories:', categoryButtons);
    
    // Wait for Groceries button in CategoryPicker
    await page.waitForSelector('button:has-text("Groceries")', { timeout: 10000 });
    
    // Select category - click the Groceries button in the CategoryPicker
    await page.click('button:has-text("Groceries")');
    
    // Enter amount
    await page.fill('input[placeholder="0.00"]', '5000');
    
    // Submit - click the form submit button (type="submit" with text "Add budget")
    await page.click('form button[type="submit"]:has-text("Add budget")');
    
    // Wait for budget to appear in the list
    await page.waitForSelector('text=Groceries', { timeout: 10000 });
    
    // Debug: log the budget row text
    const budgetRow = await page.locator('text=Groceries').locator('..').textContent();
    console.log('Budget row text:', budgetRow);
    
    // Should show the budget
    await expect(page.locator('text=Groceries')).toBeVisible();
    // Amount shows as ৳5,000 or 5,000
    await expect(page.locator('text=/5,?000/')).toBeVisible();
  });

  test('should show month navigation', async ({ page }) => {
    await expect(page.locator('button[aria-label*="Previous month"]')).toBeVisible();
    await expect(page.locator('button[aria-label*="Next month"]')).toBeVisible();
  });

  test('should prevent duplicate budget for same category/month', async ({ page }) => {
    // Add first budget
    await page.click('button[aria-label="Add budget"]');
    await page.waitForSelector('text=Add budget', { timeout: 10000 });
    await page.waitForSelector('.grid.grid-cols-4', { timeout: 15000 });
    await page.waitForSelector('.grid.grid-cols-4 button', { timeout: 15000 });
    await page.waitForSelector('button:has-text("Groceries")', { timeout: 10000 });
    await page.click('button:has-text("Groceries")');
    await page.fill('input[placeholder="0.00"]', '5000');
    await page.click('button:has-text("Add budget")');
    
    // Try to add duplicate
    await page.click('button[aria-label="Add budget"]');
    await page.waitForSelector('text=Add budget', { timeout: 10000 });
    await page.waitForSelector('.grid.grid-cols-4', { timeout: 15000 });
    await page.waitForSelector('.grid.grid-cols-4 button', { timeout: 15000 });
    await page.waitForSelector('button:has-text("Groceries")', { timeout: 10000 });
    await page.click('button:has-text("Groceries")');
    await page.fill('input[placeholder="0.00"]', '3000');
    await page.click('button:has-text("Add budget")');
    
    // Should show error
    await expect(page.locator('text=already exists')).toBeVisible();
  });

  test('should show budget progress bar', async ({ page }) => {
    // Add a budget first
    await page.click('button[aria-label="Add budget"]');
    await page.waitForSelector('text=Add budget', { timeout: 10000 });
    await page.waitForSelector('.grid.grid-cols-4', { timeout: 15000 });
    await page.waitForSelector('.grid.grid-cols-4 button', { timeout: 15000 });
    await page.waitForSelector('button:has-text("Groceries")', { timeout: 10000 });
    await page.click('button:has-text("Groceries")');
    await page.fill('input[placeholder="0.00"]', '5000');
    await page.click('button:has-text("Add budget")');
    
    // Check for progress bar
    await expect(page.locator('[role="progressbar"], .progress, [style*="width"]')).toBeVisible();
  });
});