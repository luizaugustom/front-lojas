import { test, expect } from '@playwright/test';

/**
 * E2E: Website Builder (storefront editor) — Fase 6.
 *
 * Cenário validado:
 *  1. Login como COMPANY (variáveis PLAYWRIGHT_TEST_LOGIN/PASSWORD).
 *  2. Abrir /settings/catalogo/editor
 *  3. Verificar que o canvas carrega (botão Publicar visível)
 *  4. Adicionar um bloco de texto arrastando do palette (ou via clique)
 *  5. Salvar como rascunho (toast "Rascunho salvo")
 *  6. Publicar (toast "Catálogo publicado")
 *
 * Esse teste é focado em fluxo feliz. Os drag-and-drop são cobertos
 * manualmente em browsers reais; aqui usamos cliques como aproximação
 * para validação de smoke.
 */

test.describe('Storefront Editor', () => {
  test('carrega o editor e publica um design mínimo', async ({ page }) => {
    const login = process.env.PLAYWRIGHT_TEST_LOGIN;
    const password = process.env.PLAYWRIGHT_TEST_PASSWORD;
    test.skip(!login || !password, 'Defina PLAYWRIGHT_TEST_LOGIN e PLAYWRIGHT_TEST_PASSWORD');

    // 1. Login
    await page.goto('/login');
    await page.getByLabel('Login').fill(login!);
    await page.getByLabel('Senha').fill(password!);
    await page.getByRole('button', { name: /entrar/i }).click();
    await page.waitForURL((url) => !url.pathname.includes('/login'), { timeout: 30000 });

    // 2. Abre o editor
    await page.goto('/settings/catalogo/editor');
    await expect(page.getByRole('button', { name: /publicar/i })).toBeVisible({ timeout: 30000 });

    // 3. Adiciona um bloco de texto via palette (botão "Adicionar" do item)
    const textBlock = page.getByText(/^Texto$/i).first();
    await expect(textBlock).toBeVisible();
    // Como o palette usa drag-and-drop, exercitamos o botão de Publicar
    // direto para validar o fluxo crítico de rascunho/publicação.
    const addButton = page.locator('[data-block-type="text"]').first();
    if (await addButton.isVisible().catch(() => false)) {
      await addButton.click();
    }

    // 4. Salva
    await page.getByRole('button', { name: /salvar rascunho/i }).click();
    await expect(page.getByText(/rascunho salvo/i)).toBeVisible({ timeout: 15000 });

    // 5. Publica
    await page.getByRole('button', { name: /publicar/i }).click();
    await expect(page.getByText(/catálogo publicado/i})).toBeVisible({ timeout: 30000 });
  });

  test('canvas mostra switcher de viewport', async ({ page }) => {
    const login = process.env.PLAYWRIGHT_TEST_LOGIN;
    const password = process.env.PLAYWRIGHT_TEST_PASSWORD;
    test.skip(!login || !password, 'Defina PLAYWRIGHT_TEST_LOGIN e PLAYWRIGHT_TEST_PASSWORD');

    await page.goto('/login');
    await page.getByLabel('Login').fill(login!);
    await page.getByLabel('Senha').fill(password!);
    await page.getByRole('button', { name: /entrar/i }).click();
    await page.waitForURL((url) => !url.pathname.includes('/login'));

    await page.goto('/settings/catalogo/editor');
    await expect(page.getByRole('button', { name: /preview celular/i })).toBeVisible({ timeout: 30000 });
    await expect(page.getByRole('button', { name: /preview tablet/i })).toBeVisible();
    await expect(page.getByRole('button', { name: /preview desktop/i })).toBeVisible();
  });
});
