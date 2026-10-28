import { test, expect } from './fixtures'; // replacement for an initial '@playwright/test'; 
import { makeAttachment } from './utils';
import { TAGS } from './tags';

test.describe('login as a registered user', { tag: TAGS.advanced }, () => {
    test.beforeEach(async ({ homePage, lang }) => {
        await homePage.selectLanguage(lang);
    });

    test('registration via API and login manually', async ({ registeredUser, loginPage }, testInfo) => {
        const email = registeredUser.email;
        const password = registeredUser.password;

        await makeAttachment(testInfo, 'init', `login = ${email}, password = ${password}`);

        await loginPage.login(email, password);
        await expect(loginPage.getMyAccountProfileElement()).toBeVisible();
    });

    // подключение loggedInUser обеспечивает то, что My Account будет открыт для залогиненого юзера
    test('registration and login via API', async ({ page, loggedInUser, loginPage }) => {
        await page.goto('https://practicesoftwaretesting.com/account');
        await expect(loginPage.getMyAccountProfileElement()).toBeVisible();
    });
});
