import puppeteer from 'puppeteer';
import { sleep } from './sleep';
import { consoleLog } from './index';
import { consoleError } from './console';
// eslint-disable-next-line @typescript-eslint/no-var-requires
const { patchConsole } = require('../patch-console');

export function waitForPageError(page: puppeteer.Page): Promise<never> {
    // We don't need to handle `disconnected` event because any of the
    // Puppeteer functions we're awaiting on will throw on disconnect anyway.

    return new Promise((_, reject) => {
        page.on('pageerror', e => {
            reject(e);
        });

        page.on('error', e => {
            reject(new Error(`Page crashed ${e}`));
        });
    });
}

export function logConsoleMessages(page: puppeteer.Page) {
    // eslint-disable-next-line @typescript-eslint/no-misused-promises
    page.on('console', async msg => {
        const msgArgs = await Promise.all(msg.args().map(a => a.jsonValue()));
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
    puppeteerOptions
}: {
    testPageUrl: string;
    noSandbox?: boolean;
    puppeteerOptions?: puppeteer.LaunchOptions;
}) {
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

        page.on('dialog', dialog => {
            dialog.dismiss().catch(err => consoleError(err));
        });

        logConsoleMessages(page);

        const numFailedTests = await Promise.race([
            waitForPageError(page),
            loadTestPage(page, testPageUrl, loadTimeout).then(() =>
                Promise.race([waitForTestResults(page), failIfTestsStall(page, testTimeout)])
            )
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