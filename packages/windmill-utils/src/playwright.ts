import playwright from 'playwright-core';
import { consoleError } from './console';
import { hookPageConsole } from './hook-page-console';

export function waitForPageError(page: playwright.Page): Promise<never> {
    return new Promise((_, rej) => page.once('pageerror', rej).once('crash', rej));
}

async function waitForTestResults(page: playwright.Page) {
    await page.waitForFunction('mochaStatus.finished');
    return page.evaluate('mochaStatus.failed') as Promise<number>;
}

export async function runTestsInBrowser({
    testPageUrl,
    preNavigationHook,
    launchOptions,
}: {
    testPageUrl: string;
    preNavigationHook?: (page: playwright.Page) => Promise<void>;
    launchOptions?: playwright.LaunchOptions;
}): Promise<number> {
    const loadTimeout = 20000;
    const viewportWidth = 800;
    const viewportHeight = 600;

    const browser = await playwright.chromium.launch(launchOptions);
    try {
        const browserContext = await browser.newContext({ viewport: { width: viewportWidth, height: viewportHeight } });
        const page = await browserContext.newPage();

        if (preNavigationHook) {
            await preNavigationHook(page);
        }

        page.on('dialog', (dialog) => {
            dialog.dismiss().catch((err) => consoleError(err));
        });

        hookPageConsole(page);

        const onPageError = waitForPageError(page);
        await page.goto(testPageUrl, { timeout: loadTimeout });

        if (await page.evaluate(`typeof mochaStatus === 'undefined'`)) {
            throw new Error(`Variable mochaStatus not found on ${testPageUrl}`);
        }
        const numFailedTests = await Promise.race([waitForTestResults(page), onPageError]);

        return numFailedTests;
    } finally {
        if (browser) {
            await browser.close();
        }
    }
}
