// tests/e2e/helpers.js
require('dotenv').config({ path: '.env.test' });

const EMAIL    = process.env.TEST_EMAIL;
const PASSWORD = process.env.TEST_PASSWORD;

// Fluxo de login: onboarding step-q1 → link "Já tenho conta" → step-login → submit
async function login(page) {
  await page.goto('/onboarding.html');
  await page.waitForSelector('#link-ja-tenho-conta', { timeout: 10000 });
  await page.click('#link-ja-tenho-conta');
  // Aguarda o step de login ficar visível (classe step--visible)
  await page.waitForFunction(() => {
    const el = document.getElementById('step-login');
    return el && el.classList.contains('step--visible');
  }, { timeout: 8000 });
  await page.fill('#login-email', EMAIL);
  await page.fill('#login-senha', PASSWORD);
  await page.click('#btn-login-direto');
  await page.waitForURL(/index\.html|pagamento\.html/, { timeout: 20000 });
}

// Logout via botão em config.html (usa onclick="logout()")
async function logout(page) {
  await page.goto('/config.html');
  await page.waitForSelector('.btn-logout', { timeout: 10000 });
  await page.click('.btn-logout');
  await page.waitForURL(/onboarding\.html/, { timeout: 10000 });
}

module.exports = { login, logout, EMAIL, PASSWORD };
