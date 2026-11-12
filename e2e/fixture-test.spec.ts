import { test, expect } from './test-fixtures';

test('fixture test - should be on dashboard', async ({ page }) => {
  console.log('Current URL:', page.url());
  await expect(page).toHaveURL(/.*dashboard/);
});