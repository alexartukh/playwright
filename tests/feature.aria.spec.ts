import { test, expect } from './fixtures'; // replacement for an initial '@playwright/test'; 

test.describe('aria tests', { tag: '@smoke' }, () => {
    test.beforeEach(async ({ homePage, lang }) => {   
        await homePage.selectLanguage(lang); 
    });

    function getARIALinesWithText(tree:string):string[] {
        const controlLines = tree.split('\n').flatMap((line) => {
            const matchRes = line.match(/"(.*)"/);
            if (matchRes) {
                return matchRes[1];
            }
            else {
                return [];
            }
        });
        return controlLines;
    }

    test("Human readable labels for a homepage's filter", async ({ page }) => {

        const tree = await page.locator('div#filters').ariaSnapshot();   
        const lines = getARIALinesWithText(tree);

        const knownIssues = [
            'ngx-slider',
            'ngx-slider-max',
            'sort',
            // it looks like data created by other users of the public demo site (may disappear after a database reset)
            'ss2',
            'used shoelaces',
        ];

        const issues:string[] = [];
        for (let i = 0; i < lines.length; i++) {
            if (!lines[i].match(/[A-Z]/) && !knownIssues.includes(lines[i])) {
                issues.push(lines[i]);
            }
        }
        expect(issues, 'labels that do not look human-readable').toEqual([]);
    });
});
