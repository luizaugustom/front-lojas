import { test, expect, type Page } from '@playwright/test';

/**
 * Cobertura E2E da navegação do hub de Configurações.
 *
 * Estes testes assumem que a API (`api-lojas` em :3002) e o front (`next dev` em :3001)
 * estão disponíveis com os helpers de teste habituais. Quando o ambiente não oferecer
 * credenciais/mocks suficientes, o cenário é marcado como `test.skip()` para preservar
 * a cobertura dos cenários viáveis.
 */

const EMPRESA_LOGIN = process.env.E2E_EMPRESA_LOGIN ?? 'empresa@montshop.app';
const EMPRESA_PASSWORD = process.env.E2E_EMPRESA_PASSWORD ?? 'senha123';
const VENDEDOR_LOGIN = process.env.E2E_VENDEDOR_LOGIN ?? 'vendedor@montshop.app';
const VENDEDOR_PASSWORD = process.env.E2E_VENDEDOR_PASSWORD ?? 'senha123';

const SETTINGS_HUB_TITLE = 'Configurações';
const VISIBLE_CATEGORIES_FOR_EMPRESA = [
  'Empresa',
  'Dados Fiscais',
  'Certificado Digital',
  'Catálogo',
  'Mensagens Automáticas',
  'WhatsApp',
  'Parcelamento',
  'Boletos',
  'Taxas de Cartão',
  'Notificações',
];

const isEmpresaAuthConfigured = process.env.E2E_SKIP_AUTH !== 'true';
const isVendedorAuthConfigured =
  isEmpresaAuthConfigured &&
  process.env.E2E_HAS_VENDEDOR_USER === 'true';

async function loginAs(
  page: Page,
  login: string,
  password: string,
): Promise<void> {
  await page.goto('/login');
  await page.getByLabel('Login').fill(login);
  await page.getByLabel('Senha').fill(password);
  await page.getByRole('button', { name: /entrar/i }).click();
  await page.waitForURL(/\/dashboard|\/settings|\/$/, { timeout: 15_000 });
}

test.describe('Configurações - navegação do hub', () => {
  test.beforeEach(() => {
    test.skip(!isEmpresaAuthConfigured, 'Credenciais E2E_EMPRESA_* não configuradas no CI.');
  });

  test('hub exibe 10 cards navegáveis para empresa e navega para /settings/empresa', async ({
    page,
  }) => {
    await loginAs(page, EMPRESA_LOGIN, EMPRESA_PASSWORD);
    await page.goto('/settings');

    await expect(
      page.getByRole('heading', { name: SETTINGS_HUB_TITLE, level: 1 }),
    ).toBeVisible();

    const cards = page.locator('[data-settings-card]');
    await expect(cards).toHaveCount(VISIBLE_CATEGORIES_FOR_EMPRESA.length);

    for (const title of VISIBLE_CATEGORIES_FOR_EMPRESA) {
      const card = cards.filter({ hasText: title }).first();
      await expect(card).toBeVisible();
      await expect(card).toHaveAttribute('data-locked', 'false');
    }

    // Administração não deve aparecer para o papel empresa
    await expect(
      cards.filter({ hasText: 'Administração' }),
      'papel empresa não deve ver Administração',
    ).toHaveCount(0);

    await page.getByRole('link', { name: 'Empresa' }).first().click();
    await page.waitForURL(/\/settings\/empresa$/);

    await expect(
      page.getByRole('heading', { name: 'Empresa', level: 1 }),
    ).toBeVisible();

    // Breadcrumb "Configurações > Empresa" presente
    await expect(
      page.getByRole('navigation', { name: 'Trilha de navegação' }),
    ).toContainText('Configurações');
    await expect(
      page.getByRole('navigation', { name: 'Trilha de navegação' }),
    ).toContainText('Empresa');

    // Menu local persistente (≥lg) está visível e lista as categorias
    const localNav = page.getByRole('navigation', { name: 'Submenu de configurações' });
    await expect(localNav).toBeVisible();
    for (const title of VISIBLE_CATEGORIES_FOR_EMPRESA) {
      await expect(localNav).toContainText(title);
    }
  });

  test('viewport mobile (<lg) usa Select para trocar de categoria', async ({ page }) => {
    await page.setViewportSize({ width: 360, height: 800 });

    await loginAs(page, EMPRESA_LOGIN, EMPRESA_PASSWORD);
    await page.goto('/settings/empresa');

    const select = page.locator('#settings-mobile-nav');
    await expect(select).toBeVisible();

    // O menu lateral (≥lg) deve estar oculto neste viewport
    await expect(
      page.getByRole('navigation', { name: 'Submenu de configurações' }),
    ).toBeHidden();

    // Trocar para "Catálogo" via Select
    await select.selectOption('catalogo');
    await page.waitForURL(/\/settings\/catalogo$/);

    await expect(
      page.getByRole('heading', { name: /cat[áa]logo|p[áa]gina de cat[áa]logo/i }).first(),
    ).toBeVisible();

    // Trocar para "Notificações"
    await select.selectOption('notificacoes');
    await page.waitForURL(/\/settings\/notificacoes$/);
  });

  test('rota legada /settings/card-rates redireciona para /settings/taxas-cartao', async ({
    page,
  }) => {
    await loginAs(page, EMPRESA_LOGIN, EMPRESA_PASSWORD);
    await page.goto('/settings/card-rates');

    await page.waitForURL(/\/settings\/taxas-cartao$/, { timeout: 10_000 });
    expect(page.url()).toMatch(/\/settings\/taxas-cartao$/);
  });

  test('Catálogo bloqueado exibe lockReason e não dispara mutações', async ({ page }) => {
    // Empresa com plano BASIC e catalogPageAllowed = false garante bloqueio.
    const companyFixture = {
      id: 'company-basic',
      name: 'Empresa Básica',
      plan: 'BASIC',
      catalogPageAllowed: false,
      autoMessageAllowed: false,
      boletoAllowed: false,
      isActive: true,
    };

    await loginAs(page, EMPRESA_LOGIN, EMPRESA_PASSWORD);

    // Intercepta a busca de empresa usada pelo hub/shell para garantir
    // que o snapshot reflita um plano BASIC sem autorização.
    await page.route('**/company/my-company', async (route) => {
      const request = route.request();
      if (request.method() === 'GET') {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify(companyFixture),
        });
        return;
      }
      await route.continue();
    });

    // Qualquer chamada de atualização da página de catálogo deve ser contada.
    const catalogUpdateRequests: string[] = [];
    await page.route('**/company/my-company/catalog-page', async (route) => {
      const req = route.request();
      catalogUpdateRequests.push(`${req.method()} ${req.url()}`);
      if (req.method() === 'GET') {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({
            catalogPageUrl: '',
            catalogPageEnabled: false,
            catalogPageAllowed: false,
          }),
        });
        return;
      }
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ ok: true }),
      });
    });

    await page.goto('/settings/catalogo');

    // Como o shell bloqueia categorias bloqueadas, a subrota exibe o estado
    // de bloqueio (lockReason) em vez de montar o formulário.
    const lockAlert = page.getByRole('alert').filter({
      hasText: /cat[áa]logo|plano PRO|bloquead/i,
    });
    await expect(lockAlert).toBeVisible();
    await expect(lockAlert).toContainText(/plano PRO/i);

    // Garantia extra: nenhuma mutação para /catalog-page partiu do cliente.
    const mutations = catalogUpdateRequests.filter((entry) =>
      /(^|\s)(PATCH|POST|PUT|DELETE)\s/.test(entry),
    );
    expect(
      mutations,
      'subrota bloqueada não deve disparar PATCH/POST/PUT/DELETE',
    ).toEqual([]);

    // Voltar via hub continua mostrando o card como bloqueado.
    await page.goto('/settings');
    const catalogCard = page
      .locator('[data-settings-card]')
      .filter({ hasText: 'Catálogo' })
      .first();
    await expect(catalogCard).toHaveAttribute('data-locked', 'true');
  });

  test.describe('vendedor sem acesso', () => {
    test.skip(
      !isVendedorAuthConfigured,
      'Helpers E2E para vendedor não configurados no CI atual.',
    );

    test('empresa em papel vendedor: hub redireciona e /settings/empresa fica bloqueado', async ({
      page,
    }) => {
      await loginAs(page, VENDEDOR_LOGIN, VENDEDOR_PASSWORD);
      await page.goto('/settings');

      // Vendedor não tem nenhuma categoria; o hub exibe estado vazio ou redireciona.
      const cards = page.locator('[data-settings-card]');
      const empty = page.getByText(/nenhuma categoria|indispon[ií]vel/i).first();
      const eitherEmptyOrZero = (await cards.count()) === 0 || (await empty.isVisible());
      expect(eitherEmptyOrZero).toBeTruthy();

      // Tentar entrar direto em /settings/empresa: shell mostra bloqueio.
      await page.goto('/settings/empresa');
      const lockMessage = page
        .getByRole('alert')
        .filter({ hasText: /indispon[ií]vel|n[ãa]o est[áa] dispon[ií]vel/i });
      await expect(lockMessage).toBeVisible();
    });
  });
});
