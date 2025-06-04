import { test, expect } from '@playwright/test';

test('Login con credenziali corrette e Logout', async ({ page }) => {
  await page.goto('http://93.144.54.60:5173/');
  await page.getByRole('button', { name: 'Accedi/Registrati' }).click();
  await page.getByRole('textbox', { name: 'Email' }).click();
  await page.getByRole('textbox', { name: 'Email' }).fill('testuser@example.com');
  await page.getByRole('textbox', { name: 'Password' }).click();
  await page.getByRole('textbox', { name: 'Password' }).fill('Str0ngP@ssw0rd!');
  await page.getByRole('button', { name: 'Entra' }).click();
  await page.waitForTimeout(1000);
  await page.getByRole('navigation').getByRole('button').filter({ hasText: /^$/ }).click();
  await page.getByRole('button', { name: 'Logout' }).click();
});

