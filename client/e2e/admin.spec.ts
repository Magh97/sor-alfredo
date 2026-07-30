import { test, expect } from '@playwright/test';

test.describe('Admin Management', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/login');
    await page.getByPlaceholder('admin@restaurant.com').fill('admin@restaurant.com');
    await page.getByPlaceholder('••••••••').fill('password123');
    await page.getByRole('button', { name: 'Entrar' }).click();
    await expect(page).toHaveURL(/\/admin\/users/);
  });

  test('admin can view users list', async ({ page }) => {
    await expect(page.getByText('Administrador')).toBeVisible();
    await expect(page.getByText('Mesero 1')).toBeVisible();
    await expect(page.getByText('Cajero 1')).toBeVisible();
  });

  test('admin can browse catalog with products', async ({ page }) => {
    await page.getByText('Catálogo').click();
    await expect(page).toHaveURL(/\/admin\/catalog/);
    await expect(page.getByText('Guacamole con totopos')).toBeVisible();
    await expect(page.getByText('Productos')).toBeVisible();
  });

  test('admin can create a new product', async ({ page }) => {
    await page.getByText('Catálogo').click();
    await page.getByRole('button', { name: /Nuevo Producto/ }).click();

    await page.getByPlaceholder('Nombre').fill('Test Product E2E');
    await page.getByPlaceholder('Precio base').fill('99');
    await page.getByRole('button', { name: /Crear/ }).click();

    await expect(page.getByText('Test Product E2E')).toBeVisible();
  });

  test('admin can view categories tab', async ({ page }) => {
    await page.getByText('Catálogo').click();
    await page.getByText('Categorías').click();
    await expect(page.getByText('Entradas')).toBeVisible();
    await expect(page.getByText('Platos Fuertes')).toBeVisible();
  });

  test('admin can view modifiers tab', async ({ page }) => {
    await page.getByText('Catálogo').click();
    await page.getByText('Modificadores').click();
    await expect(page.getByText('Sin cebolla')).toBeVisible();
    await expect(page.getByText('Extra queso')).toBeVisible();
  });

  test('admin can view config page', async ({ page }) => {
    await page.getByText('Configuración').click();
    await expect(page.getByText('Información del Restaurante')).toBeVisible();
    await expect(page.getByText('Cambiar Contraseña')).toBeVisible();
  });

  test('admin can view reports page', async ({ page }) => {
    await page.getByText('Reportes').click();
    await expect(page).toHaveURL(/\/admin\/reports/);
    await expect(page.getByText('Ventas')).toBeVisible();
    await expect(page.getByText('Productos')).toBeVisible();
  });
});
