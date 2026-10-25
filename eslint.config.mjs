import tseslint from 'typescript-eslint';
import playwright from 'eslint-plugin-playwright';

export default [
    {
        ignores: ['node_modules/**', 'playwright-report/**', 'test-results/**'],   // не проверять сгенерированное
    },
    {
        files: ['**/*.ts'],
        languageOptions: {
            parser: tseslint.parser,                                  // разбирать TypeScript
            parserOptions: {
                projectService: true,                                 // подключить типы через tsconfig.json
                tsconfigRootDir: import.meta.dirname,
            },
        },
        plugins: {
            '@typescript-eslint': tseslint.plugin,
        },
        rules: {
            '@typescript-eslint/no-floating-promises': 'error',      // промис создан, но не ждут → ошибка
            '@typescript-eslint/await-thenable': 'error',            // await на том, что не промис → ошибка
        },
    },
    {
        ...playwright.configs['flat/recommended'],                    // готовый набор правил Playwright
        files: ['tests/**/*.ts'],                                     // только для тестов
    },
];