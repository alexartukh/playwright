import { test, expect } from './fixtures'; // replacement for an initial '@playwright/test'; 

test.describe('aria tests', { tag: '@smoke' }, () => {
    test.beforeEach(async ({ homePage, lang }) => {   
        await homePage.selectLanguage(lang); 
    });

function getUiLabels(tree: string): string[] {
    const uiRoles = ['heading', 'slider', 'combobox', 'button', 'textbox', 'option'];   // интерфейс, не данные каталога
    const labels: string[] = [];
    for (const line of tree.split('\n')) {
        const matchRes = line.match(/^\s*- (\w+) "(.*)"/); // роль и имя в кавычках
        if (matchRes && uiRoles.includes(matchRes[1])) {
            labels.push(matchRes[2]);
        }
    }
    return labels;
}

    test("Human readable labels for a homepage's filter", async ({ page }) => {

        const tree = await page.locator('div#filters').ariaSnapshot();   
        const lines = getUiLabels(tree);

        const knownIssues = [
            'ngx-slider',
            'ngx-slider-max',
            'sort',
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
