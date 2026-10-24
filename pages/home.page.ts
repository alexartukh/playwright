import { Page, Locator, expect } from '@playwright/test';

export class HomePage {
    readonly page: Page;
    readonly url: string;

    readonly cards: Locator;
    readonly oosSection: Locator;
    readonly pdpQuantity: Locator;

    constructor(page: Page) {
        this.page = page;
        this.url = 'https://practicesoftwaretesting.com/';

        this.cards = page.locator('a.card');
        this.oosSection = page.locator('[data-test="out-of-stock"]');
        this.pdpQuantity = page.locator('#quantity-input');
    }

    async goHomeAndUseFirstAvailableProduct() {
        await this.page.goto(this.url);
        const firstExisting = this.cards.filter({ hasNot: this.oosSection }).first();
        await firstExisting.click();
        await expect(this.pdpQuantity).toBeVisible();
    }
}