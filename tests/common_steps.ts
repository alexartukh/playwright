import { TestInfo, Page, expect } from '@playwright/test';

export async function makeAttachment(testInfo: TestInfo, attachmentName: string, body: string) {
    await testInfo.attach(attachmentName, {
        body: body,
        contentType: 'text/plain'
    });
}

// все вынесенные шаги проверяют элемент, который должен появится на следующей странице

export async function useTestVISA(page: Page) {
    await page.locator('select#payment-method').selectOption('credit-card');
    await page.locator('input#credit_card_number').fill('4111-1111-1111-1111');
    await page.locator('input#expiration_date').fill('12/2222');
    await page.locator('input#cvv').fill('123');
    await page.locator('input#card_holder_name').fill('ALEX ARTUKH');
    await page.locator('button[data-test="finish"]').click();
    await expect(page.locator('div[data-test="payment-success-message"]')).toBeVisible({ timeout: 15000 }); // slow response from a side server
    await page.locator('button[data-test="finish"]').click();
    await expect(page.locator('div#order-confirmation')).toBeVisible();
}

export async function enterBillingAddress(page: Page) {
    const button = page.locator('button[data-test="proceed-3"]');

    // ждать начинаем ДО ввода, без await; фильтр по стране и индексу,
    // чтобы не поймать автопоиск по старому адресу из профиля
    const lookup = page.waitForResponse(r =>
        r.url().includes('/postcode-lookup') &&
        r.url().includes('country=US') &&
        r.url().includes('postcode=90012'));

    await page.locator('select#country').selectOption('US');
    await page.locator('input#postal_code').fill('90012');
    await page.locator('input#house_number').fill('100');   // этот ввод запускает автопоиск
    await lookup;                                            // ответ пришёл → сайт заполняет форму

    await expect(page.locator('input#street')).not.toHaveValue('');  // автозаполнение применилось
    await expect(page.locator('input#state')).not.toHaveValue('');
    await expect(button).toBeEnabled();                              // форма валидна

    await button.click();
    await expect(page.locator('select#payment-method')).toBeVisible();
}

export async function addToCartWithDefaultQuantity(page: Page) {
    // PDP
    await page.locator('button#btn-add-to-cart').click();
    await expect(page.locator('span#lblCartCount')).toHaveText('1');
    await page.locator('span#lblCartCount').click();
    await expect(page.locator('aw-wizard-navigation-bar')).toBeVisible();
}

export async function goHomeAndUseFirstAvailableProduct(page: Page) {
    // home
    await page.goto('https://practicesoftwaretesting.com/');
    const firstExisting = page.locator('a.card').filter({ hasNot: page.locator('[data-test="out-of-stock"]') }).first();
    await firstExisting.click();
    await expect(page.locator('#quantity-input')).toBeVisible();
}
