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
import { IResult } from './browser/run';
import chalk from 'chalk';
import axe from 'axe-core';
import { createMemoryFs, IMemFileSystem } from '@file-services/memory';
import nodeFs from '@file-services/node';

const ownPath = path.resolve(__dirname, '..');
export const impactLevels: axe.ImpactValue[] = ['minor', 'moderate', 'serious', 'critical'];

function getWebpackConfig(
    simulations: string[],
    projectPath: string,
    webpackConfigPath: string,
    memFs: IMemFileSystem
) {
    return (
        WebpackConfigurator.load(
            {
                entry: simulations,
                context: projectPath,
                plugins: [],
            },
            webpackConfigPath,
            memFs
        )
            // .setEntry('test', path.join(ownPath, 'esm/browser/run'))
            .setEntry('simulation', nodeFs.join(__dirname, 'simulation'))
            .addHtml({
                template: path.join(ownPath, '/templates', 'index.template'),
                title: 'Accessibility',
            })
            .suppressReactDevtoolsSuggestion()
    );
}

function formatResults(results: IResult[], impact: axe.ImpactValue): { message: string; hasError: boolean } {
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
                            msg[index] += `\n  ${chalk.red(compName)}: (Impact: ${violation.impact})\n  ${
                                node.failureSummary
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
) {
    let server: IServer | null = null;
    let browser: puppeteer.Browser | null = null;
    consoleLog('Running a11y test...');

    try {
        const memFs = createMemoryFs({
            simulation: {
                'simulations.js': getEntryCode(simulationFilePaths),
            },
        });

        server = await serve({
            memFs,
            webpackConfigurator: getWebpackConfig(simulationFilePaths, projectPath, webpackConfigPath, memFs),
            projectPath,
        });
        // We don't want to be headless and we want to have devtools open if debug is true
        browser = await puppeteer.launch({ headless: !debug, devtools: debug });
        const page = await browser.newPage();
        const getResults = new Promise<IResult[]>((resolve) => {
            page.exposeFunction('puppeteerReportResults', resolve).catch((err) => {
                throw err;
            });
        });

        page.on('dialog', (dialog) => {
            dialog.dismiss().catch((err) => {
                throw err;
            });
        });

        await page.evaluateOnNewDocument((simulations) => {
            localStorage.clear();
            localStorage.setItem('simulations', simulations);
        }, JSON.stringify(simulationFilePaths));

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
        consoleError(error.toString());
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
