import { test, expect } from './fixtures'; // replacement for an initial '@playwright/test'; 
import { makeAttachment } from './utils';

test.describe('login as a registered user', { tag: '@smoke' }, () => {
  test.beforeEach(async ({ homePage, lang }) => {
    await homePage.selectLanguage(lang);
  });

  test('login like API user', async ({ registeredUser, loginPage }, testInfo) => {
    const email = registeredUser.email;
    const password = registeredUser.password;

    await makeAttachment(testInfo, 'init', `login = ${email}, password = ${password}`);

    await loginPage.login(email, password);
  });
});
