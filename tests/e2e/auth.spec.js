// tests/e2e/auth.spec.js
const { test, expect } = require('@playwright/test');
const { login, logout } = require('./helpers');

test.describe('Auth', () => {

  test('redireciona para onboarding sem sessão', async ({ page }) => {
    await page.goto('/index.html');
    await page.waitForURL(/onboarding\.html/, { timeout: 12000 });
    await expect(page).toHaveURL(/onboarding\.html/);
  });

  test('login com e-mail e senha', async ({ page }) => {
    await login(page);
    await expect(page).toHaveURL(/index\.html|pagamento\.html/);
  });

  test('mantém sessão ao recarregar', async ({ page }) => {
    await login(page);
    await page.reload();
    await page.waitForURL(/index\.html|pagamento\.html/, { timeout: 15000 });
    await expect(page).toHaveURL(/index\.html|pagamento\.html/);
  });

  test('logout redireciona para onboarding', async ({ page }) => {
    await login(page);
    await logout(page);
    await expect(page).toHaveURL(/onboarding\.html/);
  });

});
