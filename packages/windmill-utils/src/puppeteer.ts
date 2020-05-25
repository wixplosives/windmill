import puppeteer from 'puppeteer';
import { sleep } from './sleep';
import { consoleLog } from './index';
import { consoleError } from './console';

const { patchConsole } = require('../patch-console') as { patchConsole: () => void };

export function waitForPageError(page: puppeteer.Page): Promise<never> {
    // We don't need to handle `disconnected` event because any of the
    // Puppeteer functions we're awaiting on will throw on disconnect anyway.
    return new Promise((_, rej) => page.once('pageerror', rej).once('error', rej));
}

export function logConsoleMessages(page: puppeteer.Page): void {
    // eslint-disable-next-line @typescript-eslint/no-misused-promises
    page.on('console', async (msg) => {
        const msgArgs = await Promise.all(msg.args().map((a) => a.jsonValue()));
        consoleLog(...msgArgs);
    });
}

async function loadTestPage(page: puppeteer.Page, testPageUrl: string, timeout: number) {
    await page.evaluateOnNewDocument(patchConsole);
    await page.goto(testPageUrl, { timeout });

    if (await page.evaluate(`typeof mochaStatus === 'undefined'`)) {
        throw new Error(`Variable mochaStatus not found on ${testPageUrl}`);
    }
}

async function waitForTestResults(page: puppeteer.Page) {
    await page.waitForFunction('mochaStatus.finished');
    return page.evaluate('mochaStatus.numFailedTests');
}

async function failIfTestsStall(page: puppeteer.Page, timeout: number) {
    let numCompletedTests = 0;

    // eslint-disable-next-line no-constant-condition
    while (true) {
        await sleep(timeout);
        const newVal = (await page.evaluate('mochaStatus.numCompletedTests')) as number;
        if (newVal > numCompletedTests) {
            numCompletedTests = newVal;
        } else {
            throw new Error(`Tests are stuck for ${timeout}ms`);
        }
    }
}

export async function runTestsInPuppeteer({
    testPageUrl,
    noSandbox,
    preNavigationHook,
    puppeteerOptions,
}: {
    testPageUrl: string;
    noSandbox?: boolean;
    preNavigationHook?: (page: puppeteer.Page) => Promise<void>;
    puppeteerOptions?: puppeteer.LaunchOptions;
}): Promise<number> {
    const loadTimeout = 20000;
    const testTimeout = 5000;
    const viewportWidth = 800;
    const viewportHeight = 600;

    let browser: puppeteer.Browser | undefined;
    try {
        const args = noSandbox ? ['--no-sandbox', '--disable-setuid-sandbox'] : [];
        browser = await puppeteer.launch({ headless: true, args, ...puppeteerOptions });
        const page = await browser.newPage();
        await page.setViewport({ width: viewportWidth, height: viewportHeight });

        if (preNavigationHook) {
            await preNavigationHook(page);
        }

        page.on('dialog', (dialog) => {
            dialog.dismiss().catch((err) => consoleError(err));
        });

        logConsoleMessages(page);

        const numFailedTests = await Promise.race([
            waitForPageError(page),
            loadTestPage(page, testPageUrl, loadTimeout).then(
                () => Promise.race([waitForTestResults(page), failIfTestsStall(page, testTimeout)]) as Promise<number>
            ),
        ]);

        return numFailedTests;
    } finally {
        try {
            if (browser) {
                await browser.close();
            }
        } catch (_) {
            // If the main code throws and browser.close() also throws, we don't want
            // to override the original exception.
        }
    }
}
