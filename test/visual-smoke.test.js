import { test, expect } from '@playwright/test';

test('visual smoke - page loads without console errors', async ({ page }) => {
  const errors: string[] = [];
  page.on('console', msg => {
    if (msg.type() === 'error') {
      errors.push(msg.text());
    }
  });
  
  await page.goto('/');
  
  // Filter out known benign errors
  const criticalErrors = errors.filter(e => 
    !e.includes('favicon') && 
    !e.includes('webmanifest') &&
    !e.includes('404') &&
    !e.includes('blocked by CORS')
  );
  
  expect(criticalErrors.length).toBe(0);
});

test('visual smoke - key elements visible', async ({ page }) => {
  await page.goto('/');
  
  // Check for key sections
  await expect(page.locator('body')).toBeVisible();
  
  // Check navigation or header exists
  const header = page.locator('header, nav, [role="banner"]').first();
  await expect(header).toBeVisible();
});