import { test, expect } from '@playwright/test';

test.describe('Payment Flow', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/login');
    await page.getByPlaceholder('admin@restaurant.com').fill('cajero1@restaurant.com');
    await page.getByPlaceholder('••••••••').fill('password123');
    await page.getByRole('button', { name: 'Entrar' }).click();
    await expect(page).toHaveURL(/\/caja\/orders/);
  });

  test('cajero can open cash register', async ({ page }) => {
    await page.getByText('Caja').click();
    await expect(page.getByText('No hay turno de caja abierto.')).toBeVisible();
    await page.getByText('Abrir Turno').click();

    await expect(page.getByText('Abrir Turno').nth(1)).toBeVisible();
    await page.getByRole('textbox').fill('500');

    await page.getByRole('button', { name: 'Abrir' }).click();

    await expect(page.getByText('Cerrar Turno')).toBeVisible();
  });

  test('cajero can view orders table', async ({ page }) => {
    await expect(page.getByText('Órdenes').first()).toBeVisible();
  });

  test('cajero can switch to register tab', async ({ page }) => {
    await page.getByText('Caja').click();
    await expect(page.getByText(/turno de caja/)).toBeVisible();
  });
});
