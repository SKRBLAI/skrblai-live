import { test, expect } from '@playwright/test';

test.describe('Smoke Tests', () => {
  test('Homepage loads and contains SKRBL', async ({ page }) => {
    await page.goto('/');
    
    // Check that page loads with 200 status
    const response = await page.request.get('/');
    expect(response.status()).toBe(200);
    
    // Check title contains "SKRBL"
    await expect(page).toHaveTitle(/SKRBL/);
    
    // Check for key homepage elements
    await expect(page.locator('nav')).toBeVisible();
    
    // Check for main content
    await expect(page.locator('main, [id="main-content"]')).toBeVisible();
    
    // Check that the page is not showing an error
    await expect(page.locator('text=404')).not.toBeVisible();
    await expect(page.locator('text=Something went wrong')).not.toBeVisible();
  });

  test('Sports page loads and shows AI Skill Smith', async ({ page }) => {
    await page.goto('/sports');
    
    // Check that page loads successfully
    const response = await page.request.get('/sports');
    expect(response.status()).toBe(200);
    
    // Check for AI Skill Smith text
    await expect(page.locator('text=AI Skill Smith')).toBeVisible();
    
    // Check for key sports page elements
    await expect(page.locator('nav')).toBeVisible();
    
    // Check that the page is not showing an error
    await expect(page.locator('text=404')).not.toBeVisible();
    await expect(page.locator('text=Something went wrong')).not.toBeVisible();
  });

  test('Health API endpoint returns ok', async ({ request }) => {
    const response = await request.get('/api/health');
    
    expect(response.status()).toBe(200);
    
    const data = await response.json();
    expect(data).toHaveProperty('ok', true);
    expect(data).toHaveProperty('ts');
    expect(typeof data.ts).toBe('string');
  });

  test('404 page shows custom error page', async ({ page }) => {
    await page.goto('/this-page-does-not-exist');
    
    // Should show custom 404 page
    await expect(page.locator('text=404')).toBeVisible();
    await expect(page.locator('text=Page Not Found')).toBeVisible();
    
    // Should have a "Go Home" button
    await expect(page.locator('text=Go Home')).toBeVisible();
  });

  test('Security headers are present', async ({ request }) => {
    const response = await request.get('/');
    
    // Check for security headers
    expect(response.headers()['strict-transport-security']).toContain('max-age=63072000');
    expect(response.headers()['x-content-type-options']).toBe('nosniff');
    expect(response.headers()['x-frame-options']).toBe('DENY');
    expect(response.headers()['referrer-policy']).toBe('strict-origin-when-cross-origin');
    expect(response.headers()['content-security-policy-report-only']).toBeTruthy();
  });

  test('Accessibility: Skip link is present', async ({ page }) => {
    await page.goto('/');
    
    // Focus on skip link (it should be the first focusable element)
    await page.keyboard.press('Tab');
    
    // Check if skip link is focused and visible
    const skipLink = page.locator('text=Skip to main content');
    await expect(skipLink).toBeFocused();
  });

  test('Navigation works without JavaScript errors', async ({ page }) => {
    // Listen for console errors
    const errors: string[] = [];
    page.on('console', msg => {
      if (msg.type() === 'error') {
        errors.push(msg.text());
      }
    });
    
    await page.goto('/');
    
    // Navigate to different pages
    await page.click('text=Features');
    await page.waitForLoadState('networkidle');
    
    await page.click('text=About');
    await page.waitForLoadState('networkidle');
    
    // Check that no critical JavaScript errors occurred
    const criticalErrors = errors.filter(error => 
      !error.includes('favicon.ico') && 
      !error.includes('ChunkLoadError') &&
      !error.includes('ResizeObserver')
    );
    
    expect(criticalErrors).toHaveLength(0);
  });
});