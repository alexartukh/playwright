import { createBdd } from 'playwright-bdd';
import { test, expect } from '../tests/fixtures';
import { parsePrice } from '../tests/utils';

const bdd = createBdd(test); // шаги получают твои фикстуры: page, homePage, productDetailsPage...

bdd.Given('the shop is open in English', async ({ homePage }) => {
    await homePage.selectLanguage('en');
});

bdd.When('I add search result {int} for {string} to the cart',
    async ({ page, homePage, productDetailsPage }, position: number, query: string) => {
        await page.goto(homePage.url);
        await homePage.searchFor(query);
        await homePage.cards.nth(position - 1).click(); // в сценарии считаем с 1, в коде с 0
        await productDetailsPage.addToNonEmptyCartWithDefaultQuantity(String(position)); // счётчик корзины = номер добавления
    });

bdd.When('I open the cart', async ({ productDetailsPage }) => {
    await productDetailsPage.goToCartViaHeader();
});

bdd.Then('the cart has {int} lines', async ({ page }, count: number) => {
    await expect(page.locator('app-cart tbody tr')).toHaveCount(count);
});

bdd.Then('the cart total equals the sum of the line totals', async ({ page }) => {
    const rows = page.locator('app-cart tbody tr');
    let sum: number = 0;
    for (let idx = 0; idx < await rows.count(); idx++) {
        const price = await rows.nth(idx).locator('td:nth-child(4)').innerText();
        sum += parsePrice(price);
    }
    const total = parsePrice(await page.locator('app-cart tfoot tr td:nth-child(4)').innerText());
    expect(total).toBeCloseTo(sum, 2);
});
