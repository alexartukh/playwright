import { test, expect } from './fixtures'; // replacement for an initial '@playwright/test'; 

test.describe('aria tests', { tag: '@smoke' }, () => {
    test.beforeEach(async ({ homePage, lang }) => {
        await homePage.selectLanguage(lang);
    });

    test('aria test for a homepage', async ({ page, homePage }) => {
        page.goto(homePage.url);
        // текущее дерево как строка YAML
        const tree = await page.locator('body').ariaSnapshot();   
        // скопировать в тест и подрезать лишнее
        console.log(tree);                                                
    });

    test('aria test for a product details page', async ({ page, homePage }) => {
        homePage.goHomeAndUseFirstAvailableProduct();
        const tree = await page.locator('body').ariaSnapshot();
        console.log(tree);                                                
    });
});
