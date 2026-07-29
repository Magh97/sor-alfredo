import { test, expect } from '@playwright/test';

test.describe('KDS Screen', () => {
  test('renders KDS layout correctly', async ({ page }) => {
    await page.goto('/kds');
    await expect(page.getByText("Alfredo's Cocina")).toBeVisible();
    await expect(page.getByText('Esperando órdenes...')).toBeVisible();
  });
});
