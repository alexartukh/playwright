import { defineConfig, devices } from '@playwright/test';
import { defineBddConfig } from 'playwright-bdd';

const bddTestDir = defineBddConfig({
    features: 'features/**/*.feature',
    steps: 'steps/**/*.ts',
    importTestFrom: 'tests/fixtures.ts',     // the custom test with fixtures for the generated tests
});

export default defineConfig({
    testDir: bddTestDir,
    workers: 1,
    reporter: 'html',
    projects: [
        { name: 'Chrome-EN', use: { ...devices['Desktop Chrome'], channel: 'chrome' } },
    ],
});