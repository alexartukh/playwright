import { test, expect } from './fixtures'; // replacement for an initial '@playwright/test'; 

test.beforeEach(async ({ homePage, lang }) => {
    await homePage.selectLanguage(lang);
});

const searchCases = [
    { param: "Combination Pliers", expectedResult: 1 },
    { param: "Pliers", expectedResult: 4 },
    { param: "111111111111", expectedResult: 0 },
];

for (const searchCase of searchCases) {
    test(`search for "${searchCase.param}"`, async ({ homePage }) => {
        await homePage.searchFor(searchCase.param);
        // повторяет, пока число не совпадёт или не выйдет время
        await expect(homePage.cards).toHaveCount(searchCase.expectedResult);  
    });
}
