import path from 'path';
import puppeteer from 'puppeteer';
import {
    WebpackConfigurator,
    serve,
    IServer,
    waitForPageError,
    consoleError,
    consoleLog,
    getEntryCode,
} from '@wixc3/windmill-utils';
import chalk from 'chalk';
import axe from 'axe-core';
import { createMemoryFs } from '@file-services/memory';
import nodeFs from '@file-services/node';

const ownPath = path.resolve(__dirname, '..');
export const impactLevels: axe.ImpactValue[] = ['minor', 'moderate', 'serious', 'critical'];
export interface Result {
    simulation: string;
    result?: axe.AxeResults;
    error?: Error;
}

function getWebpackConfig(projectPath: string, webpackConfigPath: string): WebpackConfigurator {
    return WebpackConfigurator.load(
        {
            plugins: [],
        },
        webpackConfigPath
    )
        .setEntry('test', nodeFs.join(projectPath, 'test/test.js'))
        .addHtml({
            template: path.join(ownPath, '/templates', 'index.template'),
            title: 'Accessibility',
        })
        .suppressReactDevtoolsSuggestion();
}

function formatResults(results: Result[], impact: axe.ImpactValue): { message: string; hasError: boolean } {
    const msg: string[] = [];
    let hasError = false;
    let index = 0;
    results.forEach((res) => {
        msg.push(`${chalk.bold(`${index + 1}`)}. Testing component ${res.simulation}...`);
        if (res.error) {
            hasError = true;
            msg.push(`Error while testing component - ${JSON.stringify(res.error)}`);
        } else if (res.result) {
            if (res.result.violations.length) {
                (res.result.violations as axe.AxeResults['violations']).forEach((violation) => {
                    const impactLevel = impact;

                    if (
                        violation.impact &&
                        impactLevels.indexOf(violation.impact) >= impactLevels.indexOf(impactLevel)
                    ) {
                        hasError = true;
                        violation.nodes.forEach((node) => {
                            const selector = node.target.join(' > ');
                            const compName = `${res.simulation} - ${selector}`;
                            msg[index] += `\n  ${chalk.red(compName)}: (Impact: ${violation.impact as string})\n  ${
                                node.failureSummary as string
                            }`;
                        });
                    } else {
                        msg[index] += chalk.green(' No errors found.');
                    }
                });
            } else {
                msg[index] += chalk.green(' No errors found.');
            }
        }
        index++;
    });
    return { message: msg.join('\n'), hasError };
}

export async function a11yTest(
    simulationFilePaths: string[],
    impact: axe.ImpactValue,
    projectPath: string,
    webpackConfigPath: string,
    debug: boolean
): Promise<void> {
    let server: IServer | null = null;
    let browser: puppeteer.Browser | null = null;
    consoleLog('Running a11y test...');

    try {
        const memFs = createMemoryFs({
            simulation: {
                'simulations.js': getEntryCode(simulationFilePaths),
            },
            test: {
                'test.js': `
                    import {getSimulations} from '../simulation/simulations';
                    import {test} from '@wixc3/windmill-a11y';
                    
                    async function runTests() {
                        const simulations = (await getSimulations()).map((sim) => sim.default);
                        test(simulations);
                    }

                    runTests().catch((err) => {
                        throw err;
                    });

                `,
            },
        });

        server = await serve({
            memFs,
            webpackConfigurator: getWebpackConfig(projectPath, webpackConfigPath),
            projectPath,
        });
        // We don't want to be headless and we want to have devtools open if debug is true
        browser = await puppeteer.launch({ headless: !debug, devtools: debug });
        const page = await browser.newPage();
        const getResults = new Promise<Result[]>((resolve) => {
            page.exposeFunction('puppeteerReportResults', resolve).catch((err) => {
                throw err;
            });
        });

        page.on('dialog', (dialog) => {
            dialog.dismiss().catch((err) => {
                throw err;
            });
        });

        await page.goto(server.getUrl());

        const results = await Promise.race([waitForPageError(page), getResults]);
        const { message, hasError } = formatResults(results, impact);
        if (hasError) {
            process.exitCode = 1;
            consoleError(message);
        } else {
            consoleLog(message);
        }
    } catch (error) {
        consoleError((error as Error).toString());
        process.exitCode = 1;
    } finally {
        if (browser) {
            try {
                if (!debug) {
                    await browser?.close();
                }
            } catch (_) {
                // Ignore the error since we're already handling an exception.
            }
        }
        if (server && !debug) {
            server.close();
        }

        if (!debug) {
            process.exit();
        }
    }
}
