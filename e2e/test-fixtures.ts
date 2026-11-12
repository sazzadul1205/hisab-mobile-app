import { test as base, expect } from '@playwright/test';

const TEST_PIN = '123457';

async function enterPin(page, pin) {
  for (const digit of pin) {
    await page.click(`button[aria-label="Digit ${digit}"]`);
  }
  await page.waitForTimeout(500);
}

async function setupPin(page) {
  await page.goto('/');
  
  // Wait for the PIN page to load
  await page.waitForSelector('h2', { timeout: 10000 });
  const h2Text = await page.locator('h2').textContent();
  
  if (h2Text?.includes('Set up your PIN')) {
    // First time setup flow
    await enterPin(page, TEST_PIN);
    await page.waitForSelector('h2:has-text("Re-enter your PIN")', { timeout: 10000 });
    await enterPin(page, TEST_PIN);
    await page.waitForURL(/.*dashboard/, { timeout: 15000 });
  } else if (h2Text?.includes('Enter your PIN')) {
    // Unlock existing vault
    await enterPin(page, TEST_PIN);
    await page.waitForURL(/.*dashboard/, { timeout: 15000 });
  }
  // Wait for categories to seed after unlock
  await page.waitForTimeout(5000);
}

const test = base.extend<{}>({
  page: async ({ page }, use) => {
    // Setup PIN before each test
    await setupPin(page);
    await use(page);
  },
});

export { test, expect };