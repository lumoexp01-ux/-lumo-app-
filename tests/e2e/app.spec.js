// tests/e2e/app.spec.js — Tela principal, FAB, tela vermelha, navegação
const { test, expect } = require('@playwright/test');
const { login } = require('./helpers');

test.describe('App principal', () => {

  test.beforeEach(async ({ page }) => {
    await login(page);
    if (page.url().includes('pagamento.html')) {
      test.skip();
    }
  });

  test('exibe nível do usuário no rank-card', async ({ page }) => {
    const nivelEl = page.locator('#rank-nivel');
    await nivelEl.waitFor({ timeout: 10000 });
    const texto = await nivelEl.textContent();
    const niveis = ['Soldado','Cabo','Sargento','Tenente','Capitão','Major','Coronel','General','Rei','Monge','Lenda','Lumo'];
    expect(niveis.some(n => texto?.toUpperCase().includes(n.toUpperCase()))).toBeTruthy();
  });

  test('badge de dias exibe número válido', async ({ page }) => {
    const badge = page.locator('#badge-dias');
    await badge.waitFor({ timeout: 10000 });
    const texto = await badge.textContent();
    const numero = parseInt(texto ?? '-1');
    expect(numero).toBeGreaterThanOrEqual(0);
  });

  test('FAB está visível na tela principal', async ({ page }) => {
    const fab = page.locator('button.fab');
    await fab.waitFor({ timeout: 8000 });
    await expect(fab).toBeVisible();
  });

  test('tela vermelha ativa via ativarTelaVermelha()', async ({ page }) => {
    // Chama a função diretamente — evita dependência da interação com o menu do FAB
    await page.waitForFunction(() => typeof ativarTelaVermelha === 'function', { timeout: 8000 });
    await page.evaluate(() => ativarTelaVermelha());
    const overlay = page.locator('#overlay-vermelho');
    await expect(overlay).toBeVisible({ timeout: 3000 });
  });

  test('tela vermelha desativa ao clicar no overlay', async ({ page }) => {
    await page.waitForFunction(() => typeof ativarTelaVermelha === 'function', { timeout: 8000 });
    await page.evaluate(() => ativarTelaVermelha());
    const overlay = page.locator('#overlay-vermelho');
    await overlay.waitFor({ timeout: 3000 });
    await overlay.click();
    await expect(overlay).toBeHidden({ timeout: 3000 });
  });

  test('navega para config e volta sem tela preta', async ({ page }) => {
    await page.goto('/config.html');
    await page.waitForSelector('.btn-logout', { timeout: 8000 });
    await page.goBack();
    await page.waitForLoadState('domcontentloaded');
    const opacity = await page.evaluate(() =>
      parseFloat(window.getComputedStyle(document.body).opacity)
    );
    expect(opacity).toBeCloseTo(1, 1);
  });

  test('navega para gatilhos e volta sem tela preta', async ({ page }) => {
    await page.goto('/triggers.html');
    await page.waitForLoadState('domcontentloaded');
    await page.goBack();
    await page.waitForLoadState('domcontentloaded');
    const opacity = await page.evaluate(() =>
      parseFloat(window.getComputedStyle(document.body).opacity)
    );
    expect(opacity).toBeCloseTo(1, 1);
  });

});
