import { test, expect } from './fixtures'; // replacement for an initial '@playwright/test'; 
import { TAGS } from './tags';

test.describe('search from a home page', { tag: TAGS.smoke }, () => {
    
    test.beforeEach(async ({ homePage, lang }) => {
        await homePage.selectLanguage(lang);
    });

    // параметры для групп тестов
    const searchCases = [
        { param: 'Combination Pliers', expectedResult: 1 },
        { param: 'Pliers', expectedResult: 4 },
        { param: '111111111111', expectedResult: 0 },
    ];

    // первая группа параметризированных тестов
    for (const searchCase of searchCases) {
        test(`search for "${searchCase.param}"`, async ({ homePage }) => {
            await homePage.searchFor(searchCase.param);
            // повторяет, пока число не совпадёт или не выйдет время
            await expect(homePage.cards).toHaveCount(searchCase.expectedResult);
        });
    }

    // вторая группа параметризированных тестов
    for (const searchCase of searchCases) {
        test(`search for "${searchCase.param}" but everything is OOS`, async ({ homePage }) => {
            await homePage.searchForSomethingButOOS(searchCase.param);
            await expect(homePage.cards).toHaveCount(searchCase.expectedResult);
            await expect(homePage.getOOSProductTiles()).toHaveCount(searchCase.expectedResult);
        });
    }
});