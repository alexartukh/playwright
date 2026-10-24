import { Page, Locator, expect } from '@playwright/test';

export class ProductDetailsPage {
    readonly page: Page;
    readonly addToCartButton: Locator;
    readonly cartCounter: Locator;
    readonly nextPageSelector: Locator;

    constructor(page: Page) {
        this.page = page;
        this.addToCartButton = page.locator('button#btn-add-to-cart');
        this.cartCounter = page.locator('span#lblCartCount');
        this.nextPageSelector = page.locator('aw-wizard-navigation-bar');
    }

    async addToEmptyCartWithDefaultQuantity() {
        await this.addToCartButton.click();
        await expect(this.cartCounter).toHaveText('1');
    }

    async goToCartViaHeader() {
        await this.cartCounter.click();
        await expect(this.nextPageSelector).toBeVisible();
    }

}