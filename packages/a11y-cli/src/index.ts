import path from 'path';
import puppeteer from 'puppeteer';
import { WebpackConfigurator, serve, IServer, waitForPageError, consoleError, consoleLog } from '@windmill/utils';
import { IResult } from './browser/run';
import VirtualModulesPlugin from 'webpack-virtual-modules';
import chalk from 'chalk';
import axe from 'axe-core';
import { getEntryCode, renderInjector } from '@windmill/scripts';
import webpack from 'webpack';

const ownPath = path.resolve(__dirname, '..');
export const impactLevels: axe.ImpactValue[] = ['minor', 'moderate', 'serious', 'critical'];

function getWebpackConfig(simulations: string[], webpackConfigPath: string) {
    const virtualEntryPlugin = new VirtualModulesPlugin({
        './@windmill-a11y.js': getEntryCode(simulations, renderInjector)
    });

    return WebpackConfigurator.load(webpackConfigPath)
        .addEntry('tests', path.join(ownPath, 'esm/browser/run'))
        .addHtml({
            template: path.join(ownPath, '/templates', 'index.template'),
            title: 'Accessibility'
        })
        .addPlugin(virtualEntryPlugin as webpack.Plugin)
        .suppressReactDevtoolsSuggestion()
        .getConfig();
}

function formatResults(results: IResult[], impact: axe.ImpactValue): { message: string; hasError: boolean } {
    const msg: string[] = [];
    let hasError = false;
    let index = 0;
    results.forEach(res => {
        msg.push(`${index + 1}. Testing component ${res.comp}...`);
        if (res.error) {
            hasError = true;
            msg.push(`Error while testing component - ${res.error}`);
        } else if (res.result) {
            if (res.result.violations.length) {
                (res.result.violations as axe.AxeResults['violations']).forEach(violation => {
                    const impactLevel = res.impact ? res.impact : impact;

                    if (
                        violation.impact &&
                        impactLevels.indexOf(violation.impact) >= impactLevels.indexOf(impactLevel)
                    ) {
                        hasError = true;
                        violation.nodes.forEach(node => {
                            const selector = node.target.join(' > ');
                            const compName = `${res.comp} - ${selector}`;
                            msg[index] += `\n  ${chalk.red(compName)}: (Impact: ${violation.impact})\n  ${
                                node.failureSummary
                            }`;
                        });
                    } else {
                        msg[index] += ' No errors found.';
                    }
                });
            } else {
                msg[index] += ' No errors found.';
            }
        }
        index++;
    });
    return { message: msg.join('\n'), hasError };
}

export async function a11yTest(simulations: string | string[], impact: axe.ImpactValue, webpackConfigPath: string) {
    let server: IServer | null = null;
    let browser: puppeteer.Browser | null = null;
    consoleLog('Running a11y test...');
    try {
        server = await serve({
            webpackConfig: getWebpackConfig(simulations, webpackConfigPath)
        });
        browser = await puppeteer.launch();
        const page = await browser.newPage();
        // eslint-disable-next-line @typescript-eslint/no-misused-promises
        const getResults = new Promise<any[]>(resolve => page.exposeFunction('puppeteerReportResults', resolve));
        page.on('dialog', dialog => {
            dialog.dismiss().catch(err => consoleError(err));
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
