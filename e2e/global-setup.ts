import { chromium, FullConfig } from '@playwright/test';
import { fileURLToPath } from 'url';
import { dirname, resolve } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const storageStatePath = resolve(__dirname, '.auth', 'storage-state.json');

const TEST_PIN = '123457';

async function enterPin(page, pin) {
  for (const digit of pin) {
    await page.click(`button[aria-label="Digit ${digit}"]`);
  }
  await page.waitForTimeout(500);
}

export default async function globalSetup(config: FullConfig) {
  const browser = await chromium.launch();
  const page = await browser.newPage();
  
  await page.goto('http://localhost:5174');
  
  // Check if already on welcome page (first visit)
  const h2Text = await page.locator('h2').textContent();
  if (h2Text?.includes('Set up your PIN')) {
    // Enter PIN (first entry)
    await enterPin(page, TEST_PIN);
    
    // Should now be on confirm step
    await page.waitForSelector('h2:has-text("Re-enter your PIN")');
    
    // Confirm PIN
    await enterPin(page, TEST_PIN);
    
    // Wait for vault setup to complete and redirect to dashboard
    await page.waitForURL(/.*dashboard/, { timeout: 15000 });
  }
  
  // Save storage state
  await page.context().storageState({ path: storageStatePath });
  await browser.close();
}