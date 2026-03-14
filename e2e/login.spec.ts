import { test, expect } from '@playwright/test';

test.describe('Login', () => {
  test('deve exibir a página de login', async ({ page }) => {
    await page.goto('/login');
    await expect(page).toHaveTitle(/Montshop/i);
    await expect(page.getByRole('heading', { name: 'Montshop' })).toBeVisible();
    await expect(page.getByLabel('Login')).toBeVisible();
    await expect(page.getByLabel('Senha')).toBeVisible();
  });
});
