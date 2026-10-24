import { Page, Locator, expect } from '@playwright/test';

export class LoginPage {
    readonly page: Page;
    readonly url: string;

    readonly loginInput: Locator;
    readonly passwordInput: Locator;
    readonly loginButton: Locator;
    readonly nextPageElement: Locator;

    constructor(page: Page) {
        this.page = page;
        this.url = 'https://practicesoftwaretesting.com/auth/login';

        this.loginInput = page.locator('input#email');
        this.passwordInput = page.locator('input#password');
        this.loginButton = page.locator('input[data-test="login-submit"]');
        this.nextPageElement = page.locator('a[routerlink="profile"]');
    }

    async login(email:string, password:string) {
        await this.page.goto(this.url);
        await this.loginInput.fill(email);
        await this.passwordInput.fill(password);
        await this.loginButton.click();
        await expect(this.nextPageElement).toBeVisible();
    }
}