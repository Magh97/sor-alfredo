import { test, expect } from '@playwright/test';

test.describe('Full Restaurant Flow', () => {
  test('admin can browse catalog', async ({ page }) => {
    await page.goto('/login');
    await page.getByPlaceholder('admin@restaurant.com').fill('admin@restaurant.com');
    await page.getByPlaceholder('••••••••').fill('password123');
    await page.getByRole('button', { name: 'Entrar' }).click();
    await expect(page).toHaveURL(/\/admin/);

    await page.getByText('Catálogo').click();
    await expect(page).toHaveURL(/\/admin\/catalog/);
    await expect(page.getByText('Productos')).toBeVisible();
    await expect(page.getByText('Guacamole con totopos')).toBeVisible();
  });

  test('admin can manage users', async ({ page }) => {
    await page.goto('/login');
    await page.getByPlaceholder('admin@restaurant.com').fill('admin@restaurant.com');
    await page.getByPlaceholder('••••••••').fill('password123');
    await page.getByRole('button', { name: 'Entrar' }).click();

    await expect(page).toHaveURL(/\/admin\/users/);
    await expect(page.getByText('Administrador')).toBeVisible();
    await expect(page.getByText('Mesero 1')).toBeVisible();
    await expect(page.getByText('Cajero 1')).toBeVisible();
  });

  test('admin can view config', async ({ page }) => {
    await page.goto('/login');
    await page.getByPlaceholder('admin@restaurant.com').fill('admin@restaurant.com');
    await page.getByPlaceholder('••••••••').fill('password123');
    await page.getByRole('button', { name: 'Entrar' }).click();

    await page.getByText('Configuración').click();
    await expect(page).toHaveURL(/\/admin\/config/);
    await expect(page.getByText('Información del Restaurante')).toBeVisible();
    await expect(page.getByText('Cambiar Contraseña')).toBeVisible();
  });

  test('admin can view reports', async ({ page }) => {
    await page.goto('/login');
    await page.getByPlaceholder('admin@restaurant.com').fill('admin@restaurant.com');
    await page.getByPlaceholder('••••••••').fill('password123');
    await page.getByRole('button', { name: 'Entrar' }).click();

    await page.getByText('Reportes').click();
    await expect(page).toHaveURL(/\/admin\/reports/);
    await expect(page.getByText('Ventas')).toBeVisible();
    await expect(page.getByText('Productos')).toBeVisible();
  });

  test('mesero can view tables', async ({ page }) => {
    await page.goto('/login');
    await page.getByPlaceholder('admin@restaurant.com').fill('mesero1@restaurant.com');
    await page.getByPlaceholder('••••••••').fill('password123');
    await page.getByRole('button', { name: 'Entrar' }).click();

    await expect(page).toHaveURL(/\/mesero/);
    await expect(page.getByText('Mesas').first()).toBeVisible();
  });

  test('cajero can access cash register', async ({ page }) => {
    await page.goto('/login');
    await page.getByPlaceholder('admin@restaurant.com').fill('cajero1@restaurant.com');
    await page.getByPlaceholder('••••••••').fill('password123');
    await page.getByRole('button', { name: 'Entrar' }).click();

    await expect(page).toHaveURL(/\/caja/);
    await expect(page.getByText('Órdenes')).toBeVisible();
  });

  test('waiter cannot access admin routes', async ({ page }) => {
    await page.goto('/login');
    await page.getByPlaceholder('admin@restaurant.com').fill('mesero1@restaurant.com');
    await page.getByPlaceholder('••••••••').fill('password123');
    await page.getByRole('button', { name: 'Entrar' }).click();

    await page.goto('/admin/users');
    await expect(page).toHaveURL(/\/login/);
  });

  test('KDS screen renders correctly', async ({ page }) => {
    await page.goto('/kds');
    await expect(page.getByText("Alfredo's Cocina")).toBeVisible();
  });
});
