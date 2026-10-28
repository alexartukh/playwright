export const TAGS = {
    smoke: '@smoke',              // минимальный набор «сайт жив»: идёт в CI
    advanced: '@advanced',        // требует логина; сайт блокирует такие тесты из CI (Cloudflare)
    screentest: '@screentest',    // визуальные тесты; эталоны только для Chrome на Windows
    a11y: '@a11y',                // доступность: ARIA-подписи и axe-core
} as const;