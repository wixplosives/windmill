import path from 'path';
import puppeteer from 'puppeteer';
import {
    WebpackConfigurator,
    serve,
    IServer,
    consoleLog,
    runTestsInPuppeteer,
    getEntryCodeWithSSRComps,
    consoleError,
    ISimulationsToString,
} from '@wixc3/windmill-utils';
import { createMemoryFs } from '@file-services/memory';
import nodeFs from '@file-services/node';
import { renderToString } from 'react-dom/server';
import { simulationToJsx } from '@wixc3/wcs-core';
import chalk from 'chalk';

const ownPath = path.resolve(__dirname, '..');

function getWebpackConfig(projectPath: string, webpackConfigPath: string): WebpackConfigurator {
    return WebpackConfigurator.load(
        {
            plugins: [],
        },
        webpackConfigPath
    )
        .setEntry('test', nodeFs.join(projectPath, 'mocha-setup/setup.js'))
        .addEntry('test', nodeFs.join(projectPath, 'test/test.js'))
        .addHtml({
            template: path.join(ownPath, '/templates', 'index.template'),
            title: 'Sanity',
        })
        .suppressReactDevtoolsSuggestion();
}

const renderSimulationsToString = (simulationFilePaths: string[]): ISimulationsToString => {
    const simulationsAsString: ISimulationsToString = {};

    for (const simulationFilePath of simulationFilePaths) {
        try {
            // eslint-disable-next-line
            const sim = require(simulationFilePath).default;

            if (sim) {
                simulationsAsString[simulationFilePath] = renderToString(simulationToJsx(sim));
            }
        } catch (e) {
            consoleError(
                `\n${chalk.yellow("Couldn't require simulation")} "${chalk.underline(
                    simulationFilePath
                )}" ${chalk.yellow(
                    'in node.'
                )} Windmill will continue, but will skip hydration tests for this component, as this error means that either: \n\t${chalk.cyan(
                    'a)'
                )} this component is not SSR-compatible, or \n\t${chalk.cyan(
                    'b)'
                )} require hooks haven't been configured for your project. \n\nPlease check the Windmill documentation for more information. For debugging purposes, the error has been printed below.`
            );
            // eslint-disable-next-line @typescript-eslint/restrict-template-expressions
            consoleError(`\n${chalk.red('Error:')}`, e);
        }
    }

    return simulationsAsString;
};

export async function sanityTests(
    simulationFilePaths: string[],
    projectPath: string,
    webpackConfigPath: string,
    debug: boolean
): Promise<void> {
    let server: IServer | null = null;
    let browser: puppeteer.Browser | null = null;
    consoleLog('Running sanity tests...');

    const simulationsRenderedToString = renderSimulationsToString(simulationFilePaths);

    try {
        const memFs = createMemoryFs({
            simulation: {
                'simulations.js': getEntryCodeWithSSRComps(simulationFilePaths, simulationsRenderedToString),
            },
            test: {
                'test.js': `
                    import { runTests } from '@wixc3/windmill-sanity';
                    import { getSimulations } from '../simulation/simulations';
                    
                    runTests(getSimulations).catch((err) => {
                        throw err;
                    });
                `,
            },
            'mocha-setup': {
                'setup.js': `
                    // Mocha officially supports this import in browser environment
                    require('mocha/mocha.js');

                    mocha.setup({
                        ui: 'bdd',
                        reporter: 'spec',
                        color: true
                      });

                    // This needs to be accessible by Puppeteer
                    window.mochaStatus = {
                        numCompletedTests: 0,
                        numFailedTests: 0,
                        finished: false
                    };
                `,
            },
        });

        server = await serve({
            memFs,
            webpackConfigurator: getWebpackConfig(projectPath, webpackConfigPath),
            projectPath,
        });

        // We want to have devtools open if debug is true
        browser = await puppeteer.launch({ devtools: debug });
        const page = await browser.newPage();

        page.on('dialog', (dialog) => {
            dialog.dismiss().catch((err) => {
                throw err;
            });
        });

        await page.goto(server.getUrl());

        const numFailedTests = await runTestsInPuppeteer({
            testPageUrl: server.getUrl(),
        });
        if (numFailedTests) {
            process.exitCode = 1;
        }

        if (numFailedTests) {
            process.exitCode = 1;
        }
    } catch (error) {
        process.exitCode = 1;
        if (error) {
            process.stderr.write((error as Error).toString() + '\n');
        }
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
