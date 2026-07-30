import { test, expect } from '@playwright/test';

test.describe('Authentication', () => {
  test('admin login redirects to /admin/users', async ({ page }) => {
    await page.goto('/login');
    await page.getByPlaceholder('admin@restaurant.com').fill('admin@restaurant.com');
    await page.getByPlaceholder('••••••••').fill('password123');
    await page.getByRole('button', { name: 'Entrar' }).click();
    await expect(page).toHaveURL(/\/admin\/users/);
    await expect(page.getByText("Alfredo's")).toBeVisible();
  });

  test('mesero login redirects to /mesero/orders', async ({ page }) => {
    await page.goto('/login');
    await page.getByPlaceholder('admin@restaurant.com').fill('mesero1@restaurant.com');
    await page.getByPlaceholder('••••••••').fill('password123');
    await page.getByRole('button', { name: 'Entrar' }).click();
    await expect(page).toHaveURL(/\/mesero\/orders/);
    await expect(page.getByText("Alfredo's")).toBeVisible();
  });

  test('cajero login redirects to /caja/orders', async ({ page }) => {
    await page.goto('/login');
    await page.getByPlaceholder('admin@restaurant.com').fill('cajero1@restaurant.com');
    await page.getByPlaceholder('••••••••').fill('password123');
    await page.getByRole('button', { name: 'Entrar' }).click();
    await expect(page).toHaveURL(/\/caja\/orders/);
    await expect(page.getByText("Alfredo's")).toBeVisible();
  });

  test('shows error on invalid credentials', async ({ page }) => {
    await page.goto('/login');
    await page.getByPlaceholder('admin@restaurant.com').fill('wrong@email.com');
    await page.getByPlaceholder('••••••••').fill('wrong');
    await page.getByRole('button', { name: 'Entrar' }).click();
    await expect(page.getByText(/inválidas/i)).toBeVisible();
  });

  test('redirects to login when accessing protected route without auth', async ({ page }) => {
    await page.goto('/admin');
    await expect(page).toHaveURL(/\/login/);
  });

  test('mesero cannot access admin routes', async ({ page }) => {
    await page.goto('/login');
    await page.getByPlaceholder('admin@restaurant.com').fill('mesero1@restaurant.com');
    await page.getByPlaceholder('••••••••').fill('password123');
    await page.getByRole('button', { name: 'Entrar' }).click();
    await expect(page).toHaveURL(/\/mesero/);

    await page.goto('/admin/users');
    await expect(page).toHaveURL(/\/login/);
  });

  test('cajero cannot access admin routes', async ({ page }) => {
    await page.goto('/login');
    await page.getByPlaceholder('admin@restaurant.com').fill('cajero1@restaurant.com');
    await page.getByPlaceholder('••••••••').fill('password123');
    await page.getByRole('button', { name: 'Entrar' }).click();
    await expect(page).toHaveURL(/\/caja/);

    await page.goto('/admin');
    await expect(page).toHaveURL(/\/login/);
  });

  test('logout clears session and redirects to login', async ({ page }) => {
    await page.goto('/login');
    await page.getByPlaceholder('admin@restaurant.com').fill('admin@restaurant.com');
    await page.getByPlaceholder('••••••••').fill('password123');
    await page.getByRole('button', { name: 'Entrar' }).click();
    await expect(page).toHaveURL(/\/admin/);

    await page.getByText('Cerrar Sesión').click();
    await expect(page).toHaveURL(/\/login/);

    await page.goto('/admin');
    await expect(page).toHaveURL(/\/login/);
  });
});
