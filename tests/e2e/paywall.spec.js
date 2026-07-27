// tests/e2e/paywall.spec.js — Tela de pagamento
const { test, expect } = require('@playwright/test');
const { login } = require('./helpers');

test.describe('Paywall', () => {

  test.beforeEach(async ({ page }) => {
    await login(page);
    // Se foi para index, força navegação para pagamento para testar a tela
    if (page.url().includes('index.html')) {
      await page.goto('/pagamento.html');
    }
  });

  test('exibe botão de cartão', async ({ page }) => {
    if (!page.url().includes('pagamento.html')) return;
    const btn = page.locator('#btn-assinar');
    await btn.waitFor({ timeout: 8000 });
    await expect(btn).toBeVisible();
  });

  test('exibe botão PIX', async ({ page }) => {
    if (!page.url().includes('pagamento.html')) return;
    const btn = page.locator('#btn-pix');
    await btn.waitFor({ timeout: 8000 });
    await expect(btn).toBeVisible();
  });

  test('modal PIX abre ao clicar em PIX', async ({ page }) => {
    if (!page.url().includes('pagamento.html')) return;
    await page.locator('#btn-pix').waitFor({ timeout: 8000 });
    await page.click('#btn-pix');
    const overlay = page.locator('#pix-overlay');
    await expect(overlay).toHaveClass(/visible/, { timeout: 3000 });
  });

  test('modal PIX exibe planos mensal e anual', async ({ page }) => {
    if (!page.url().includes('pagamento.html')) return;
    await page.locator('#btn-pix').waitFor({ timeout: 8000 });
    await page.click('#btn-pix');
    await expect(page.locator('#pix-btn-anual')).toBeVisible();
    await expect(page.locator('#pix-btn-mensal')).toBeVisible();
    // Verifica que os botões têm conteúdo de preço (R$)
    await expect(page.locator('#pix-btn-anual')).toContainText('R$');
    await expect(page.locator('#pix-btn-mensal')).toContainText('R$');
  });

  test('modal PIX fecha ao clicar no X', async ({ page }) => {
    if (!page.url().includes('pagamento.html')) return;
    await page.locator('#btn-pix').waitFor({ timeout: 8000 });
    await page.click('#btn-pix');
    await page.click('#pix-fechar');
    const overlay = page.locator('#pix-overlay');
    await expect(overlay).not.toHaveClass(/visible/, { timeout: 3000 });
  });

});
