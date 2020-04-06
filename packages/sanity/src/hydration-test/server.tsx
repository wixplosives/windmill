import { renderToString } from 'react-dom/server';
import path from 'path';
import { WebpackConfigurator, runTestsInPuppeteer, serve, IServer, getEntryCode } from '@windmill/utils';
import { renderInjector } from '@windmill/scripts';
import VirtualModulesPlugin from 'webpack-virtual-modules';
import { ISimulation, simulationToJsx } from '@wixc3/wcs-core';

const ownPath = path.resolve(__dirname, '..');

function getWebpackConfig(
    simulationFilePaths: string[],
    projectPath: string,
    webpackConfigPath: string,
    ssrComps: string[]
) {
    const virtualEntryPlugin = new VirtualModulesPlugin({
        './@windmill-a11y.js': getEntryCode(simulationFilePaths, renderInjector),
    });

    return WebpackConfigurator.load(
        {
            entry: simulationFilePaths,
            context: projectPath,
            plugins: [virtualEntryPlugin],
        },
        webpackConfigPath
    )
        .setEntry('meta', path.join(ownPath, 'hydration-test', 'test-page.js'))
        .addEntry('meta', path.join(ownPath, 'hydration-test', 'index.js'))
        .addHtml({
            template: path.join(ownPath, '../templates', 'index.template'),
            components: JSON.stringify(ssrComps),
        })
        .suppressReactDevtoolsSuggestion()
        .getConfig();
}

export async function hydrationTest(
    simulationFilePaths: string[],
    simulations: ISimulation<Record<string, unknown>>[],
    projectPath: string,
    webpackConfigPath: string
) {
    let server: IServer | null = null;
    try {
        const ssrComps: string[] = [];

        for (const simulation of simulations) {
            ssrComps.push(renderToString(simulationToJsx(simulation)));
        }

        server = await serve({
            webpackConfig: getWebpackConfig(simulationFilePaths, projectPath, webpackConfigPath, ssrComps),
        });
        const numFailedTests = await runTestsInPuppeteer({
            testPageUrl: server.getUrl(),
            puppeteerOptions: {
                headless: false,
            },
            preNavigationHook: async (page) => {
                await page.evaluateOnNewDocument((simulations) => {
                    localStorage.clear();
                    localStorage.setItem('simulations', simulations);
                }, JSON.stringify(simulationFilePaths));
            },
        });
        if (numFailedTests) {
            process.exitCode = 1;
        }
    } catch (error) {
        process.exitCode = 1;
        if (error) {
            process.stderr.write(error.toString() + '\n');
        }
    } finally {
        if (server) {
            server.close();
        }
        process.exit();
    }
}
