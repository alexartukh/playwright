# Playwright E2E tests for Toolshop

A learning project: end-to-end tests written with [Playwright](https://playwright.dev) and TypeScript
for the public demo shop [practicesoftwaretesting.com](https://practicesoftwaretesting.com) (Toolshop by Testsmith).

The goal is to learn Playwright, not to cover the shop with tests.
The tests are built around a small set of real user journeys:
search, login, and placing an order as a registered user and as a guest.

## Running

```bash
npm install

npx playwright test                         # all tests, all projects (EN + DE)
npx playwright test --ui                    # UI mode: run, watch, debug
npx playwright test --project=EN            # one language only
npx playwright test --grep @smoke           # only tests tagged @smoke
npx playwright test --grep @screentest      # only visual (screenshot) tests
npx playwright test --repeat-each=10        # hunt for flaky tests
npx playwright test --trace=on              # record traces for every test
npx playwright show-report                  # open the HTML report (needed to view traces)
npm run lint                                # ESLint with type-aware rules
```

Tests also run automatically on every push via GitHub Actions (`.github/workflows/playwright.yml`):
lint first, then all tests except the visual ones (`--grep-invert @screentest`).

## Project structure

```
pages/                        Page objects (one class per screen)
  home.page.ts                  language switch, search, product tiles
  login.page.ts                 login form
  product.details.page.ts       add to cart, go to cart
  billing.address.page.ts       billing address step (with postcode autofill)
  payment.page.ts               payment step, order confirmation
tests/
  fixtures.ts                 custom fixtures (extended `test`)
  utils.ts                    helpers: unique e-mail, text attachments
  feature.search.spec.ts      parameterized search tests, mocked "out of stock"
  feature.login.spec.ts       login via form and via API
  feature.place.order.spec.ts full order: registered user and guest
  feature.screenshot.tests.spec.ts                visual check of stacked toast notifications
  feature.screenshot.tests.spec.ts-snapshots/     baseline images (per project and OS)
playwright.config.ts          projects, workers, retries, reporter
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
  Baselines exist only for Windows (`-win32`), so the visual tests are excluded from the Linux CI via the `@screentest` tag.

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
- Projects `EN` and `DE`: the same tests run in two shop languages.
- Parameterized tests: a `for...of` loop over test data, unique test titles.
- `test.describe` groups, `test.beforeEach` hooks, `test.describe.configure({ mode: 'default' })`.
- Tags (`@smoke`, `@screentest`) and filtering with `--grep` / `--grep-invert`.
- Unique test data per run (`Date.now()` in e-mail addresses) — tests do not depend on each other.

### Debugging and reporting
- UI mode, Trace Viewer (actions, DOM snapshots, network, console), HTML report.
- `testInfo.attach` — test data (e-mail, order number) attached to the report.
- `--repeat-each` to reproduce flaky tests; `trace: 'retain-on-failure'` to keep traces of failed attempts.
- `retries` — a test that passes on retry is reported as **flaky**, not as passed.

### Configuration
- `workers: 1` — tests run one by one (the public server does not handle parallel orders well).
- `retries: 2` — protection against occasional server errors.
- GitHub Actions CI with the HTML report uploaded as a build artifact.

### Code quality
- ESLint with `typescript-eslint` and `eslint-plugin-playwright`, run locally and as the first CI step.
- `@typescript-eslint/no-floating-promises` — catches a missing `await` (the most common Playwright mistake).
- `@typescript-eslint/await-thenable` — catches `await` on something that is not a promise.
- `playwright/expect-expect` — catches a test without any assertion.
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
