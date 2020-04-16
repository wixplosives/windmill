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
} from '@windmill/utils';
import { IResult } from './browser/run';
import VirtualModulesPlugin from 'webpack-virtual-modules';
import chalk from 'chalk';
import axe from 'axe-core';
import { renderInjector } from '@windmill/scripts';

const ownPath = path.resolve(__dirname, '..');
export const impactLevels: axe.ImpactValue[] = ['minor', 'moderate', 'serious', 'critical'];

function getWebpackConfig(simulations: string[], projectPath: string, webpackConfigPath: string) {
    const virtualEntryPlugin = new VirtualModulesPlugin({
        './@windmill-a11y.js': getEntryCode(simulations, renderInjector),
    });

    return WebpackConfigurator.load(
        {
            entry: simulations,
            context: projectPath,
            plugins: [virtualEntryPlugin],
        },
        webpackConfigPath
    )
        .setEntry('test', path.join(ownPath, 'esm/browser/run'))
        .addHtml({
            template: path.join(ownPath, '/templates', 'index.template'),
            title: 'Accessibility',
        })
        .suppressReactDevtoolsSuggestion()
        .getConfig();
}

function formatResults(results: IResult[], impact: axe.ImpactValue): { message: string; hasError: boolean } {
    const msg: string[] = [];
    let hasError = false;
    let index = 0;
    results.forEach((res) => {
        msg.push(`${chalk.bold(`${index + 1}`)}. Testing component ${res.simulation}...`);
        if (res.error) {
            hasError = true;
            msg.push(`Error while testing component - ${res.error}`);
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
    webpackConfigPath: string
) {
    let server: IServer | null = null;
    let browser: puppeteer.Browser | null = null;
    consoleLog('Running a11y test...');
    try {
        server = await serve({
            webpackConfig: getWebpackConfig(simulationFilePaths, projectPath, webpackConfigPath),
        });
        browser = await puppeteer.launch();
        const page = await browser.newPage();
        // eslint-disable-next-line @typescript-eslint/no-misused-promises
        const getResults = new Promise<IResult[]>((resolve) => page.exposeFunction('puppeteerReportResults', resolve));
        page.on('dialog', (dialog) => {
            dialog.dismiss().catch((err) => consoleError(err));
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
                await browser?.close();
            } catch (_) {
                // Ignore the error since we're already handling an exception.
            }
        }
        if (server) {
            server.close();
        }
        process.exit();
    }
}
