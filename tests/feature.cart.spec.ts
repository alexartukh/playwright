import { test, expect } from './fixtures'; // replacement for an initial '@playwright/test'; 
import { makeAttachment, parsePrice } from './utils';
import { TAGS } from './tags';

test.describe('cart calculations', { tag: TAGS.advanced }, () => {
    test.beforeEach(async ({ homePage, lang }) => {
        await homePage.selectLanguage(lang);
    });

    test('correct cart total', async ({ page, homePage, productDetailsPage }, testInfo) => {
        await homePage.searchFor('Hammer');
        await homePage.cards.first().click();
        await productDetailsPage.addToEmptyCartWithDefaultQuantity();

        await page.goto(homePage.url);
        await homePage.searchFor('Hammer');
        await homePage.cards.nth(1).click();
        await productDetailsPage.addToNonEmptyCartWithDefaultQuantity('2');

        await page.goto(homePage.url);
        await homePage.searchFor('Hammer');
        await homePage.cards.nth(2).click();
        await productDetailsPage.addToNonEmptyCartWithDefaultQuantity('3');

        await productDetailsPage.goToCartViaHeader();
        const rows = page.locator('app-cart tbody tr');
        await expect(rows).toHaveCount(3);

        let aText: string = '';

        let sum: number = 0;
        const positions = await page.locator('app-cart tbody tr').count();
        for (let idx = 0; idx < positions; idx++) {
            const price = await rows.nth(idx).locator('td:nth-child(4)').innerText();
            aText += `${idx} = ${price}\n`;
            sum += parsePrice(price);
        }

        const total = await page.locator('app-cart tfoot tr td:nth-child(4)').innerText();
        aText += '-------------\n';
        aText += `TOTAL = ${total}\n`;
        const sum2 = parsePrice(total);

        await makeAttachment(testInfo, 'numbers', aText);

        expect(sum2).toBeCloseTo(sum, 2);
    });

});
