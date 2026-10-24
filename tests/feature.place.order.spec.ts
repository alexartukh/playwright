import { test, expect } from './fixtures'; // replacement for an initial '@playwright/test'; 
import { makeAttachment, goHomeAndUseFirstAvailableProduct, addToCartWithDefaultQuantity, enterBillingAddress, useTestVISA } from './common_steps';
import { getRandomEmail } from './utils';

test.describe.configure({ mode: 'default' }); // тесты файла по очереди, в одном воркере

test.beforeEach(async ({ page, lang }) => {
  const langLocator = page.locator('a[data-test="lang-' + lang + '"]'); 

  await page.goto('https://practicesoftwaretesting.com/');
  await page.locator('button#language').click();
  await expect(langLocator).toBeVisible();
  await langLocator.click();
});

test('place order as a registered user', async ({ page }, testInfo) => {
  const email = getRandomEmail();
  const password = 'wordPASS123!';

  await makeAttachment(testInfo, 'init', `login = ${email}, password = ${password}`);

  // from login page to registration page
  await page.goto('https://practicesoftwaretesting.com/auth/login');
  await page.locator('a[data-test="register-link"]').click();
  await page.locator('input#first_name').fill('Alex');
  await page.locator('input#last_name').fill('Artukh');
  await page.locator('input#dob').fill('1983-04-23');
  await page.locator('select#country').selectOption('UA');
  await page.locator('input#postal_code').fill('14034');
  await page.locator('input#house_number').fill('2');
  await page.locator('input#street').fill('Berezovskogo');
  await page.locator('input#city').fill('Chernihiv');
  await page.locator('input#state').fill('Chernihiv');
  await page.locator('input#phone').fill('601267');
  await page.locator('input#email').fill(email);
  await page.locator('input#password').fill(password);
  await page.locator('[data-test="register-submit"]').click();
  await expect(page.locator('a[data-test="register-link"]')).toBeVisible();

  // login page again
  await page.locator('input#email').fill(email);
  await page.locator('input#password').fill(password);
  await page.locator('[data-test="login-submit"]').click();
  await expect(page.locator('a[routerlink="profile"]')).toBeVisible();

  // home
  await goHomeAndUseFirstAvailableProduct(page);

  // PDP
  await addToCartWithDefaultQuantity(page);

  // cart
  await page.locator('button[data-test="proceed-1"]').click();
  await expect(page.locator('[data-test="proceed-2"]')).toBeVisible();

  // step 2 (login or guest)
  await page.locator('[data-test="proceed-2"]').click();
  await expect(page.locator('[data-test="proceed-3"]')).toBeVisible();

  // step 3 (billing address)
  await enterBillingAddress(page);

  // step 4 (payment)
  await useTestVISA(page);

  // Thanks for your order! Your invoice number is INV-2026000018.
  const line = await page.locator('div#order-confirmation').innerText();
  await makeAttachment(testInfo, 'order', `Res = ${line}`);
});

test('place order as a guest', async ({ page }, testInfo) => {
  const email = getRandomEmail();

  // log for UI mode
  await makeAttachment(testInfo, 'init', `login = ${email}`);

  // home
  await goHomeAndUseFirstAvailableProduct(page);

  // PDP
  await addToCartWithDefaultQuantity(page);

  // cart
  await page.locator('button[data-test="proceed-1"]').click();
  await expect(page.locator('a[href="#guest-tab"]')).toBeVisible();

  // step 2 (login or guest)
  await page.locator('a[href="#guest-tab"]').click();
  await expect(page.locator('input#guest-last-name')).toBeVisible();
  await page.locator('input#guest-email').fill(email);
  await page.locator('input#guest-first-name').fill('Alex');
  await page.locator('input#guest-last-name').fill('Artukh');
  await page.locator('input[data-test="guest-submit"]').click();
  await expect(page.locator('[data-test="proceed-2-guest"]')).toBeVisible();
  await page.locator('[data-test="proceed-2-guest"]').click();
  await expect(page.locator('button[data-test="proceed-3"]')).toBeVisible();

  // step 3 (billing address)
  await enterBillingAddress(page);

  // step 4 (payment)
  await useTestVISA(page);

  // Thanks for your order! Your invoice number is INV-2026000018.
  const line = await page.locator('div#order-confirmation').innerText();
  await makeAttachment(testInfo, 'order', `Res = ${line}`);
});
