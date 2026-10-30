# Playwright E2E tests for Toolshop

A learning project: end-to-end tests written with [Playwright](https://playwright.dev) and TypeScript
for the public demo shop [practicesoftwaretesting.com](https://practicesoftwaretesting.com) (Toolshop by Testsmith).

The goal is to learn Playwright, not to cover the shop with tests.
The tests are built around a small set of real user journeys:
search, login, cart calculations, and placing an order as a registered user and as a guest,
plus accessibility and visual checks.

## Running

```bash
npm install

npx playwright test                         # all tests, all projects (2 browsers x 2 languages)
npx playwright test --ui                    # UI mode: run, watch, debug
npx playwright test --project=Chrome-EN     # one browser and one language
npx playwright test --grep @smoke           # only tests tagged @smoke
npx playwright test --grep @screentest      # only visual (screenshot) tests
npx playwright test --grep @a11y            # only accessibility tests
npx playwright test --repeat-each=10        # hunt for flaky tests
npx playwright test --trace=on              # record traces for every test
npx playwright show-report                  # open the HTML report (needed to view traces)
npm run lint                                # ESLint with type-aware rules
```

Tests also run automatically on every push via GitHub Actions (`.github/workflows/playwright.yml`):
lint first, then only the small `@smoke` set in one project (`--grep @smoke --project=Chrome-EN`).
The full suite runs locally — see the tags below for the reasons.

## Tags

Tags are defined once as constants in `tests/tags.ts` (a typo such as `TAGS.smok` does not compile).

| Tag | Meaning | Where it runs |
|---|---|---|
| `@smoke` | minimal "the shop is alive" set: search, guest order | CI and locally |
| `@advanced` | needs a logged-in user or many requests to the shop | locally only — the demo site's Cloudflare bot protection blocks login and account pages for GitHub-hosted runners |
| `@screentest` | visual comparison with baseline images | locally only — baselines exist only for Chrome on Windows |
| `@a11y` | accessibility: UI labels and axe-core | locally |

## Project structure

```
pages/                                         Page objects (one class per screen)
  home.page.ts                                 language switch, search, product tiles
  login.page.ts                                login form
  product.details.page.ts                      add to cart, go to cart
  billing.address.page.ts                      billing address step (with postcode autofill)
  payment.page.ts                              payment step, order confirmation
tests/
  fixtures.ts                                  custom fixtures (extended `test`)
  utils.ts                                     helpers: unique e-mail, text attachments
  tags.ts                                      tag constants with their meaning
  feature.search.spec.ts                       parameterized search tests, mocked "out of stock"
  feature.login.spec.ts                        login via form and via API
  feature.place.order.spec.ts                  full order: registered user and guest
  feature.cart.spec.ts                         cart total = sum of the line totals
  feature.aria.spec.ts                         accessibility checks: UI labels + axe-core (WCAG)
  feature.screenshot.tests.spec.ts             visual check of stacked toast notifications
  feature.screenshot.tests.spec.ts-snapshots/  baseline images (per project and OS)
playwright.config.ts                           projects, workers, retries, reporter
```

## Playwright features used

### Locators and waiting
- Locators as lazy "search recipes": nothing is searched until an action or assertion uses them.
- Auto-waiting in actions (`click`, `fill`, `selectOption`): wait until the element is visible, enabled and stable.
- Stable selectors via `data-test` attributes instead of long CSS paths and translated texts.
- `filter({ has })` / `filter({ hasNot })` to select product tiles with / without the "out of stock" badge.

### Assertions
- Web-first assertions with retries: `toBeVisible`, `toBeEnabled`, `toHaveText`, `toHaveCount`, `toHaveURL`, `not.toHaveValue`.
- Difference between `await expect(locator)...` (retries) and `expect(value)...` (checked once).
- Every page-object step ends by waiting for an element of the **next** screen,
  to avoid the "old page" trap (a check passing instantly on the page we are leaving).
- `expect(...).toPass()` for retrying a whole block of code.
- Visual comparison with `toHaveScreenshot`: two stacked toast notifications are compared with a baseline image.
  Each toast has an animated progress bar, so a pixel-perfect match is impossible — the check uses a tolerance
  (`maxDiffPixelRatio`). Clicks are deliberately spaced in time so the toasts also disappear one by one.
  Baselines exist only for Chrome on Windows (`-Chrome-EN-win32`, `-Chrome-DE-win32`), so the visual tests
  are tagged `@screentest` and do not run in the Linux CI.
- Cart total check: three products are added, the line totals are summed and compared with the cart total.
  Prices are parsed strictly (an unparsable price fails the test instead of being silently skipped),
  and money is compared with `toBeCloseTo(sum, 2)` because of floating-point arithmetic (`0.1 + 0.2 !== 0.3`).
- Accessibility tree check with `locator.ariaSnapshot()`: every **UI label** in the filter panel (headings, buttons,
  sliders, sort options) must look human-readable — a simple rule: text meant for a person contains capital letters.
  Catalog data (brand and category names) is excluded, because other users of the public demo site keep creating
  test brands like `tf-brand-1793100787096`. Known defects are kept in an explicit list, so the test passes today
  and fails as soon as a **new** technical label appears.
- Automated WCAG check with [axe-core](https://github.com/dequelabs/axe-core) (`@axe-core/playwright`):
  the filter panel is analysed against WCAG 2 A/AA rules; known violations are listed by rule id,
  any new violation fails the test and its full details are attached to the report.
  The two checks complement each other: axe finds broken markup, but it cannot tell that a label such as
  `ngx-slider` is meaningless — the label check does.

### Network
- `page.waitForResponse` — wait for a specific API response; the wait is started **before** the action that triggers the request.
- `page.route` — intercepting requests:
  - `route.abort()` — simulate a failed request;
  - `route.fulfill()` — answer instead of the server;
  - `route.fetch()` + `route.fulfill()` — take the real server response and modify it
    (all products in a search result are marked as out of stock).
- `request` fixture — calling the shop REST API without a browser (user registration and login).

### Fixtures
- Option fixture `lang` with a value set per project.
- Page objects provided as fixtures (`homePage`, `loginPage`, `productDetailsPage`, `billingPage`, `paymentPage`).
- `registeredUser` — a new user created via `POST /users/register`, no browser involved.
- `loggedInUser` — logs in via `POST /users/login` and puts the token into `localStorage`
  with `page.addInitScript`, so the browser tab starts already logged in.
- Fixture lifecycle: setup → `use()` (the test runs inside) → teardown.

### Organizing tests
- Page Object Model: locators as `readonly` fields, user actions as methods, `page` passed once in the constructor.
- Four projects — two browser engines x two shop languages: `Chrome-EN`, `Chrome-DE`, `Firefox-EN`, `Firefox-DE`.
  Chrome (Blink) runs as the installed Google Chrome (`channel: 'chrome'`), Firefox (Gecko) as Playwright's own build.
- Parameterized tests: a `for...of` loop over test data, unique test titles.
- `test.describe` groups, `test.beforeEach` hooks, `test.describe.configure({ mode: 'default' })`.
- Tags (`@smoke`, `@advanced`, `@screentest`, `@a11y`) as constants in `tests/tags.ts`, filtering with `--grep` / `--grep-invert`.
- Unique test data per run (`Date.now()` in e-mail addresses) — tests do not depend on each other.

### Debugging and reporting
- UI mode, Trace Viewer (actions, DOM snapshots, network, console), HTML report.
- `testInfo.attach` — test data (e-mail, order number, cart numbers) attached to the report.
- `screenshot: 'only-on-failure'` — a screenshot of every failed test in the report and in the CI artifact.
- `--repeat-each` to reproduce flaky tests, together with `--trace=retain-on-failure` to keep traces of the failed attempts.
- `retries` — a test that passes on retry is reported as **flaky**, not as passed.

### Configuration
- `workers: 1` — tests run one by one (the public server does not handle parallel orders well).
- `retries: 2` — protection against occasional server errors.
- GitHub Actions CI with the HTML report uploaded as a build artifact; only Chrome and Firefox are installed,
  and the browser installation step has its own 10-minute timeout.

### Code quality
- ESLint with `typescript-eslint` and `eslint-plugin-playwright`, run locally and as the first CI step.
- `@typescript-eslint/no-floating-promises` — catches a missing `await` (the most common Playwright mistake).
- `@typescript-eslint/await-thenable` — catches `await` on something that is not a promise.
- `playwright/expect-expect` — catches a test without any assertion.
- `playwright/valid-test-tags` is switched off: it can only check tags written as string literals,
  while this project takes them from the `TAGS` constants, which TypeScript already checks.
- `tsconfig.json` used only for type checking (`noEmit`); Playwright compiles the tests itself.

## Things found about the shop

Real behaviour discovered with traces while writing the tests:

- **Postcode autofill.** After country, postal code and house number are entered, the shop calls
  `GET /postcode-lookup` and overwrites street, city and state with generated (fake) data.
  Typing your own values races with this response.
- **Server-side address check.** `POST /invoices` rejects (HTTP 422) any address that does not match
  the autofill data — even a real one. The tests therefore wait for the lookup and keep the autofilled values.
- **Silent order failure.** When the order is rejected, the page shows no error and simply stays on the payment step.
- **Shared accounts get locked.** The default demo accounts are often locked by other people's failed logins,
  so the tests create a fresh user every time.
- **Parallel orders fail.** Two orders at the same time from the same machine often fail, hence `workers: 1`.
- **Slow payment check.** `POST /payment/check` sometimes takes several seconds, so that step has a longer timeout.
- **Bot protection.** Requests from GitHub-hosted runners to the login and account pages get a Cloudflare
  "Performing security verification" page instead of the shop. These tests are tagged `@advanced` and run locally;
  CI runs only the small `@smoke` set in one project to keep the traffic low.

### Accessibility and localization

Found by comparing the accessibility trees (`ariaSnapshot()`) of the English and German versions and by axe-core:

- **Untranslated categories.** In the German shop the product categories stay in English (`Hand Tools`, `Hammer`, `Wrench`, ...).
- **Technical names instead of labels.** The price sliders are announced as `ngx-slider` / `ngx-slider-max`
  (the name of the UI component), the sort drop-down as `sort`, and its first option has no text at all.
- **Bare numbers on the price scale.** A screen reader reads the slider scale as `0 200 1 100` —
  numbers without units or meaning.
- **Icon-only button.** The button that clears the search is labelled just `X`; a screen reader user hears the letter, not the action.
- **Broken list structure** (axe rule `list`, impact *serious*). The category sub-lists are `<ul>` elements that
  contain a `<fieldset>` directly instead of `<li>` items, so a screen reader cannot announce the list properly.
