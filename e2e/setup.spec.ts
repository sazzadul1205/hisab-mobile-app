import { test, expect } from '@playwright/test';

async function enterPin(page, pin) {
  for (const digit of pin) {
    await page.click(`button[aria-label="Digit ${digit}"]`);
  }
  // Wait for step to change
  await page.waitForTimeout(500);
}

// Use a PIN that's not in the weak PIN list
const TEST_PIN = '123457';

test.describe('Hisab App - Setup and PIN', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('should redirect to welcome page on first visit', async ({ page }) => {
    await expect(page).toHaveURL(/.*welcome/);
    await expect(page.locator('h1, h2')).toContainText(/welcome|set.*pin/i);
  });

  test('should allow setting up a new PIN', async ({ page }) => {
    await expect(page).toHaveURL(/.*welcome/);
    
    // Enter PIN (first entry)
    await enterPin(page, TEST_PIN);
    
    // Should now be on confirm step
    await expect(page.locator('h2')).toContainText('Re-enter your PIN');
    
    // Confirm PIN
    await enterPin(page, TEST_PIN);
    
    // Wait for vault setup to complete and redirect to dashboard
    await expect(page).toHaveURL(/.*dashboard/, { timeout: 15000 });
  });
});