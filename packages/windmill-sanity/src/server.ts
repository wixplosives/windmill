import path from 'path';
import puppeteer from 'puppeteer';
import {
    WebpackConfigurator,
    serve,
    IServer,
    consoleLog,
    getEntryCode,
    runTestsInPuppeteer,
} from '@wixc3/windmill-utils';
import { createMemoryFs } from '@file-services/memory';
import nodeFs from '@file-services/node';

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

export async function sanityTests(
    simulationFilePaths: string[],
    projectPath: string,
    webpackConfigPath: string,
    debug: boolean
): Promise<void> {
    let server: IServer | null = null;
    let browser: puppeteer.Browser | null = null;
    consoleLog('Running sanity tests...');

    try {
        const memFs = createMemoryFs({
            simulation: {
                'simulations.js': getEntryCode(simulationFilePaths),
            },
            test: {
                'test.js': `
                    import { hydrationTest } from '@wixc3/windmill-sanity';
                    import { renderToString } from 'react-dom/server';
                    import { simulationToJsx } from '@wixc3/wcs-core';
                    import { getSimulations } from '../simulation/simulations';
                    
                    async function runTests() {
                        const simulations = (await getSimulations()).map((sim) => sim.default);
                        for (const simulation of simulations) {
                            const simulationJsx = simulationToJsx(simulation);
                            const simulationString = renderToString(simulationJsx);
                            hydrationTest(simulation, simulationString);
                        }
                        
                        mocha.run()
                            .on('test end', () => window.mochaStatus.numCompletedTests++)
                            .on('fail',     () => window.mochaStatus.numFailedTests++)
                            .on('end',      () => window.mochaStatus.finished = true);
                    }

                    runTests().catch((err) => {
                        throw err;
                    });
                `,
            },
            'mocha-setup': {
                'setup.js': `
                    // Mocha officially supports this import in browser environment
                    require('mocha/mocha.js');

                    mocha.setup('bdd');
                    // mocha.cleanReferencesAfterRun(false);

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
        // We don't want to be headless and we want to have devtools open if debug is true
        browser = await puppeteer.launch({ headless: !debug, devtools: debug });
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
