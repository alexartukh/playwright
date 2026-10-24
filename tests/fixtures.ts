import { test as base } from '@playwright/test';

// новый test = старый + параметр lang
export const test = base.extend<{ lang: string }>({   
    // значение по умолчанию 'en', можно менять из конфига
    lang: ['en', { option: true }],
});

export { expect } from '@playwright/test';