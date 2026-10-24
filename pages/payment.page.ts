import { Page, Locator, expect } from '@playwright/test';

export class PaymentPage {
    readonly page: Page;
    readonly paymentMethod: Locator;
    readonly ccNumber: Locator;
    readonly expiration: Locator;
    readonly cvv: Locator;
    readonly holder: Locator;
    readonly finishButton: Locator;
    readonly successMessage: Locator;
    readonly nextPageConfirmationMessage: Locator;

    constructor(page: Page) {
        this.page = page;

        this.paymentMethod = page.locator('select#payment-method');
        this.ccNumber = page.locator('input#credit_card_number');
        this.expiration = page.locator('input#expiration_date');
        this.cvv = page.locator('input#cvv');
        this.holder = page.locator('input#card_holder_name');
        this.finishButton = page.locator('button[data-test="finish"]'); 
        this.successMessage = page.locator('div[data-test="payment-success-message"]');
        this.nextPageConfirmationMessage = page.locator('div#order-confirmation');
    }

    async useCC(ccNumber:string, expiration:string, cvv:string, holder:string) {
        await this.paymentMethod.selectOption('credit-card');
        await this.ccNumber.fill(ccNumber);
        await this.expiration.fill(expiration);
        await this.cvv.fill(cvv);
        await this.holder.fill(holder);
        await this.finishButton.click();
        await expect(this.successMessage).toBeVisible({ timeout: 15000 }); // slow response from a server side         
    }

    async placeOrder() {
        await this.finishButton.click();
        await expect(this.nextPageConfirmationMessage).toBeVisible();
    }
    
}