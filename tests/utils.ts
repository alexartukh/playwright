import { TestInfo, expect } from '@playwright/test';

export function getRandomEmail(): string {
    return `alex_${Date.now()}@example.com`;
}

export async function makeAttachment(testInfo: TestInfo, attachmentName: string, body: string) {
    await testInfo.attach(attachmentName, {
        body: body,
        contentType: 'text/plain'
    });
}

export function parsePrice(text: string): number {
    const matchRes = text.match(/^\$([\d.]+)$/);
    expect(matchRes, `cannot parse price "${text}"`).not.toBeNull();
    return Number(matchRes![1]);
}
