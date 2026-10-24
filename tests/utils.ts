import { TestInfo } from '@playwright/test';

export function getRandomEmail():string {
    return `alex_${Date.now()}@example.com`;
}

export async function makeAttachment(testInfo: TestInfo, attachmentName: string, body: string) {
    await testInfo.attach(attachmentName, {
        body: body,
        contentType: 'text/plain'
    });
}
