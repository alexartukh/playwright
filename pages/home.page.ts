import { Page, Locator, expect } from '@playwright/test';

export class HomePage {
    readonly page: Page;
    readonly url: string;

    readonly languageButton: Locator;
    readonly cards: Locator;
    readonly oosSection: Locator;
    readonly searchInput: Locator;
    readonly searchButton: Locator;
    readonly nextPageSelector: Locator;

    constructor(page: Page) {
        this.page = page;
        this.url = 'https://practicesoftwaretesting.com/';

        this.languageButton = page.locator('button#language');
        this.cards = page.locator('a.card');
        this.oosSection = page.locator('[data-test="out-of-stock"]');
        this.searchInput = page.locator('#search-query');
        this.searchButton = page.locator('button[data-test="search-submit"]');
        this.nextPageSelector = page.locator('#quantity-input');
    }

    async searchFor(str:string) {
        const lookup = this.page.waitForResponse(
            (r) => { return r.url().includes('products/search') },
            { timeout: 5000 },
        );
        await this.searchInput.fill(str);
        await this.searchButton.click();
        await lookup;
    }

    async goHomeAndUseFirstAvailableProduct() {
        await this.page.goto(this.url);
        const firstExisting = this.cards.filter({ hasNot: this.oosSection }).first();
        await firstExisting.click();
        await expect(this.nextPageSelector).toBeVisible();
    }

    async selectLanguage(lang: string) {
        const langLocator = this.page.locator(`a[data-test="lang-${lang}"]`); // локатор зависит от параметра
        await this.page.goto(this.url);
        await this.languageButton.click();
        await expect(langLocator).toBeVisible();
        await langLocator.click();
    }
}