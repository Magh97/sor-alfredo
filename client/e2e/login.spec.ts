import { test, expect } from '@playwright/test';

test.describe('Login', () => {
  test('redirects to /admin after admin login', async ({ page }) => {
    await page.goto('/login');
    await page.getByPlaceholder('admin@restaurant.com').fill('admin@restaurant.com');
    await page.getByPlaceholder('••••••••').fill('password123');
    await page.getByRole('button', { name: 'Entrar' }).click();
    await expect(page).toHaveURL(/\/admin/);
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
});
