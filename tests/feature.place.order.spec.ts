import { test, expect } from './fixtures'; // replacement for an initial '@playwright/test'; 
import { getRandomEmail, makeAttachment } from './utils';
import { TAGS } from './tags';

test.describe('place order', () => {
    test.describe.configure({ mode: 'default' });

    test.beforeEach(async ({ homePage, lang }) => {
        await homePage.selectLanguage(lang);
    });

    test('place order as a registered user', { tag: TAGS.advanced }, async ({ page, homePage, loginPage, productDetailsPage, billingPage, paymentPage }, testInfo) => {
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
        await loginPage.login(email, password);

        // home
        await homePage.goHomeAndUseFirstAvailableProduct();

        // PDP
        await productDetailsPage.addToEmptyCartWithDefaultQuantity();
        await productDetailsPage.goToCartViaHeader();

        // cart
        await page.locator('button[data-test="proceed-1"]').click();
        await expect(page.locator('[data-test="proceed-2"]')).toBeVisible();

        // step 2 (login or guest)
        await page.locator('[data-test="proceed-2"]').click();
        await expect(page.locator('[data-test="proceed-3"]')).toBeVisible();

        // step 3 (billing address)
        await billingPage.fillAddress('US', '60601', '100');
        await billingPage.continue();

        // step 4 (payment)
        await paymentPage.useCC('4111-1111-1111-1111', '12/2027', '123', 'ALEX ARTUKH');
        await paymentPage.placeOrder();

        // Thanks for your order! Your invoice number is INV-2026000018.
        const line = await page.locator('div#order-confirmation').innerText();

        await makeAttachment(testInfo, 'order', `Res = ${line}`);
    });

    //
    //
    //

    test('place order as a guest', { tag: TAGS.smoke }, async ({ page, homePage, productDetailsPage, billingPage, paymentPage }, testInfo) => {
        const email = getRandomEmail();

        // log for UI mode
        await makeAttachment(testInfo, 'init', `login = ${email}`);

        // home
        await homePage.goHomeAndUseFirstAvailableProduct();

        // PDP
        await productDetailsPage.addToEmptyCartWithDefaultQuantity();
        await productDetailsPage.goToCartViaHeader();

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
        await billingPage.fillAddress('US', '60601', '100');
        await billingPage.continue();

        // step 4 (payment)
        await paymentPage.useCC('4111-1111-1111-1111', '12/2027', '123', 'ALEX ARTUKH');
        await paymentPage.placeOrder();

        // Thanks for your order! Your invoice number is INV-2026000018.
        const line = await page.locator('div#order-confirmation').innerText();
        await makeAttachment(testInfo, 'order', `Res = ${line}`);
    });
});