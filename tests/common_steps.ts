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
    await expect(page.getByText('Payment was successful')).toBeVisible();
    await page.locator('button[data-test="finish"]').click();
    await expect(page.locator('div#order-confirmation')).toContainText('Your invoice number is');
}

export async function enterBillingAddress(page: Page) {
    // step 3 (billing address)
    await page.locator('select#country').selectOption('UA');
    await page.locator('input#postal_code').fill('14034');
    await page.locator('input#house_number').fill('2');
    await page.locator('input#street').fill('Berezovskogo');
    await page.locator('input#city').fill('Chernihiv');
    await page.locator('button[data-test="proceed-3"]').click();
    await expect(page.locator('select#payment-method')).toBeVisible();
}

export async function addToCartWithDefaultQuantity(page: Page) {
    // PDP
    await page.locator('button#btn-add-to-cart').click();
    await expect(page.locator('span#lblCartCount')).toHaveText('1');
    await page.locator('span#lblCartCount').click();
    await expect(page.locator('aw-wizard-navigation-bar')).toContainText('Payment');
}

export async function goHomeAndUseFirstAvailableProduct(page: Page) {
    // home
    await page.goto('https://practicesoftwaretesting.com/');
    const firstExisting = page.locator('a.card').filter({ hasNotText: 'Out of stock' }).first();
    await firstExisting.click();
    await expect(page.locator('#quantity-input')).toBeVisible();
}
