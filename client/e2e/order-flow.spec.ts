import { test, expect } from '@playwright/test';

test.describe('Order Flow', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/login');
    await page.getByPlaceholder('admin@restaurant.com').fill('mesero1@restaurant.com');
    await page.getByPlaceholder('••••••••').fill('password123');
    await page.getByRole('button', { name: 'Entrar' }).click();
    await expect(page).toHaveURL(/\/mesero\/orders/);
  });

  test('mesero can see tables page', async ({ page }) => {
    await page.getByText('Mesas').click();
    await expect(page.getByText('10 Mesas')).toBeVisible();
    await expect(page.getByText('Libre').first()).toBeVisible();
  });

  test('mesero can create a new order', async ({ page }) => {
    await page.getByText('Nueva Orden').click();
    await expect(page.getByText('Nueva Orden')).toBeVisible();

    await page.getByText('1').first().click();

    await expect(page.getByText('Guacamole con totopos')).toBeVisible();

    await page.getByText('Guacamole con totopos').click();
    await page.getByText('+').first().click();

    await page.getByText(/Revisar/).click();
    await expect(page.getByText('Total')).toBeVisible();

    await page.getByRole('button', { name: /Crear y Enviar/ }).click();

    await expect(page.getByText('En Cocina').first()).toBeVisible();
  });

  test('mesero cannot create order with empty items', async ({ page }) => {
    await page.getByText('Nueva Orden').click();
    await page.getByText('1').first().click();

    await page.getByText(/Revisar/).click();
    await expect(page.getByText('Total')).toBeVisible();
    await expect(page.getByText('$0.00')).toBeVisible();
  });
});
