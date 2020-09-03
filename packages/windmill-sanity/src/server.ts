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
    SimulationConfig,
} from '@wixc3/windmill-utils';
import { createMemoryFs } from '@file-services/memory';
import nodeFs from '@file-services/node';
import { renderToString } from 'react-dom/server';
import { simulationToJsx, ISimulation } from '@wixc3/wcs-core';
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

const renderSimulationsToString = (
    simulationConfigs: SimulationConfig[]
): { simulationsRenderedToString: ISimulationsToString; failedSSR: boolean; errors: unknown[] } => {
    const simulationsRenderedToString: ISimulationsToString = {};
    const errors = [];
    let failedSSR = false;

    for (const simulationConfig of simulationConfigs) {
        if (simulationConfig.ssrCompatible) {
            try {
                // eslint-disable-next-line
                const sim: ISimulation<Record<string, unknown>> = require(simulationConfig.simulationGlob).default;

                if (sim) {
                    try {
                        simulationsRenderedToString[simulationConfig.simulationGlob] = renderToString(
                            simulationToJsx(sim)
                        );
                    } catch (e) {
                        failedSSR = true;

                        errors.push(
                            `\n${chalk.red("Couldn't render simulation")} "${chalk.underline(sim.name)}" ${chalk.yellow(
                                'to string.'
                            )} Windmill will continue, but will skip hydration tests for this component, as this error means that this component is not SSR-compatible. For debugging purposes, the error has been printed below.`
                        );
                        // eslint-disable-next-line @typescript-eslint/restrict-template-expressions
                        errors.push(`\n${chalk.red('Error:')}`, e);
                    }
                }
            } catch (e) {
                errors.push(
                    `\n${chalk.yellow("Couldn't require simulation")} "${chalk.underline(
                        simulationConfig
                    )}" ${chalk.yellow(
                        'in node.'
                    )} Windmill will continue, but will skip hydration tests for this component, as this error means that either: \n\t${chalk.cyan(
                        'a)'
                    )} this component is not SSR-compatible, or \n\t${chalk.cyan(
                        'b)'
                    )} require hooks haven't been configured for your project. \n\nPlease check the Windmill documentation for more information. For debugging purposes, the error has been printed below.`
                );
                // eslint-disable-next-line @typescript-eslint/restrict-template-expressions
                errors.push(`\n${chalk.red('Error:')}`, e);
            }
        } else {
            consoleLog(`Skipping SSR test for simulation: ${simulationConfig.simulationGlob}.`);
        }
    }

    return { simulationsRenderedToString, failedSSR, errors };
};

export async function sanityTests(
    simulationConfigs: SimulationConfig[],
    projectPath: string,
    webpackConfigPath: string,
    debug: boolean
): Promise<void> {
    let server: IServer | null = null;
    let browser: puppeteer.Browser | null = null;
    consoleLog('Running sanity tests...');

    const { simulationsRenderedToString, failedSSR, errors } = renderSimulationsToString(simulationConfigs);

    try {
        const memFs = createMemoryFs({
            simulation: {
                'simulations.js': getEntryCodeWithSSRComps(simulationConfigs, simulationsRenderedToString),
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
                    import mocha from 'mocha/mocha.js';

                    mocha.setup({
                        ui: 'bdd',
                        reporter: 'spec',
                        color: true
                    });

                    // This needs to be accessible by Puppeteer.
                    window.mochaStatus = {
                        completed: 0,
                        failed: 0,
                        finished: false,
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

        consoleError(...errors);

        if (numFailedTests || failedSSR) {
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
