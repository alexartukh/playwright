import { test, expect } from '@playwright/test';

test('place order', async ({ page }, testInfo) => {

  // a timeout for the whole test
  test.setTimeout(60000);

  // log for UI mode
  await testInfo.attach('setTimeout', { 
    body: "Global timeout = 60000",
    contentType: 'text/plain'
  });

  // my account
  await page.goto('https://std131001.test/Mein-Konto', { waitUntil: 'networkidle' });
  await page.locator('input[name="kd_mail"]').fill('alex@example.com');
  await page.locator('input[name="kd_pwd"]').fill('123');
  await page.locator('input.loginBtn').click();
  await expect(page.locator('body')).toContainText('Bestellungen einsehen', { timeout: 10000 });

  // home page
  await page.goto('https://std131001.test/');
  await page.locator('a[alt="p1"]').click();

  // PDP
  await expect(page.locator('body')).toContainText('In den Warenkorb', { timeout: 10000 });
  await page.locator('input[value="In den Warenkorb"]').click();
  await page.locator('a[alt="zum Warenkorb"]').waitFor({ state: 'visible' });
  await page.locator('a[alt="zum Warenkorb"]').click({ timeout: 10000 });

  // WK
  await page.locator('input[name="button_submit"]').waitFor({ state: 'visible' });
  await page.locator('input[name="dhl_agree_checkbox"]').check();
  await page.locator('input[name="button_submit"]').click({ timeout: 10000 });
  await page.waitForTimeout(4000);
  
  // step 3
  await expect(page.locator('body')).toContainText('Adresse und Lieferung', { timeout: 10000 });
  await page.locator('input[name="best_vorname"]').waitFor({ state: 'visible' });
  await page.locator('input[name="button_submit"]').click({ timeout: 10000 });
  await page.waitForTimeout(4000);

  // step 4
  await expect(page.locator('body')).toContainText('Zahlungsart und Versand', { timeout: 10000 });
  await page.locator('input[name="bestagb"]').waitFor({ state: 'visible' });
  await page.locator('input[name="bestagb"]').check();
  await page.locator('input[name="button_submit"]').click({ timeout: 10000 });
  await page.waitForTimeout(4000);

  // step 5
  await expect(page.locator('body')).toContainText('Ein letzter Check - bitte kontrollieren Sie Ihre Angaben vor dem Absenden nochmals auf ihre Richtigkeit.', { timeout: 10000 });
  await page.locator('input[value="zahlungspflichtig bestellen"]').waitFor({ state: 'visible' });
  await page.locator('input[value="zahlungspflichtig bestellen"]').click({ timeout: 10000 });
  await page.waitForTimeout(10000);

  // thank you page
  await expect(page.locator('body')).toContainText('Vielen Dank für Ihre Bestellung', { timeout: 10000 });

  await page.locator('h5[role="heading"]').innerText().then(
    async function(headingText) {
      let m = headingText.match(/\d+$/);
      if (m) {
        let orderNumber = m[0];

        await testInfo.attach('orderNumber', { 
          body: "Order Number = " + orderNumber,
          contentType: 'text/plain'
        });

      }
    }
  )

});
