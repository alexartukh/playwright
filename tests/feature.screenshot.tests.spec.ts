import { test, expect } from './fixtures'; // replacement for an initial '@playwright/test'; 

test.describe('Screenshot tests', { tag: '@screentest' }, () => {
    test.beforeEach(async ({ homePage, lang }) => {
        await homePage.selectLanguage(lang);
    });

    test('add to cart many times', async ({ page, homePage, productDetailsPage }) => {
        // home
        await homePage.goHomeAndUseFirstAvailableProduct();

        // PDP
        await productDetailsPage.addToEmptyCartWithDefaultQuantity();
        await page.waitForTimeout(1500); // intentional: toasts must appear at different times to disappear one by one
        await productDetailsPage.addToNonEmptyCartWithDefaultQuantity('2');
 
        // Если быстро добавлять продукты, то на экране будет несколько зеленых подтверждений в правом верхнем углу
        // нужно визуально проверить, что их там несколько

        const toasts = page.locator('div#toast-container div[role="alert"]');
        // их 2 одновременно
        await expect(toasts).toHaveCount(2);

        const toastContainer = page.locator('div#toast-container');
        const screenshotOptions = {
            maxDiffPixelRatio: 0.10,
            // maxDiffPixelRatio: 0.0, // A 100% match does not work because each toast has a progress bar (animated)  
        };
        await expect(toastContainer).toHaveScreenshot('toasts-stack.png', screenshotOptions);

        // они исчезли по одному
        await expect(toasts).toHaveCount(1);
        await expect(toasts).toHaveCount(0);
    });
});
