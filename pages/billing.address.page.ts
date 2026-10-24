import { Page, Locator, expect } from '@playwright/test';

export class BillingAddressPage {
    readonly page: Page;
    readonly country: Locator;
    readonly postalCode: Locator;
    readonly houseNumber: Locator;
    readonly proceed: Locator;
    readonly nextPageSelector: Locator;

    constructor(page: Page) {
        this.page = page;
        this.country = page.locator('select#country');
        this.postalCode = page.locator('input#postal_code');
        this.houseNumber = page.locator('input#house_number');
        this.proceed = page.locator('button[data-test="proceed-3"]');
        this.nextPageSelector = page.locator('select#payment-method');
    }

    async fillAddress(country: string, postcode: string, house: string) {
        const lookup = this.page.waitForResponse(r =>
            r.url().includes('/postcode-lookup') &&
            r.url().includes(`postcode=${postcode}`)
        );

        await this.country.selectOption(country);
        await this.postalCode.fill(postcode);
        await this.houseNumber.fill(house);
        await lookup;
    }

    async continue() {
        await expect(this.proceed).toBeEnabled();
        await this.proceed.click();
        await expect(this.nextPageSelector).toBeVisible();
    }
}