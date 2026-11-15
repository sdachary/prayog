import { test, expect } from '@playwright/test';

test('accessibility - basic checks', async ({ page }) => {
  await page.goto('/');
  
  // Check for basic accessibility
  const hasTitle = await page.title();
  expect(hasTitle).toBeTruthy();
  
  // Check for heading structure
  const h1Count = await page.locator('h1').count();
  expect(h1Count).toBeGreaterThanOrEqual(1);
  
  // Check for alt attributes on images
  const images = page.locator('img');
  const count = await images.count();
  for (let i = 0; i < count; i++) {
    const alt = await images.nth(i).getAttribute('alt');
    expect(alt).toBeTruthy();
  }
});