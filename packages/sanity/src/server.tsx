// import path from 'path';
// import { WebpackConfigurator, runTestsInPuppeteer, serve, IServer, getEntryCode } from '@windmill/utils';
// import { renderInjector } from '@windmill/scripts';
// import VirtualModulesPlugin from 'webpack-virtual-modules';

// const ownPath = path.resolve(__dirname, '..');

// function getWebpackConfig(simulations: string[], projectPath: string, webpackConfigPath: string, ssrComps: string[]) {
//     const virtualEntryPlugin = new VirtualModulesPlugin({
//         './@windmill-a11y.js': getEntryCode(simulations, renderInjector),
//     });

//     return WebpackConfigurator.load(
//         {
//             entry: simulations,
//             context: projectPath,
//             plugins: [virtualEntryPlugin],
//         },
//         webpackConfigPath
//     )
//         .addEntry('meta', path.join(ownPath, 'hydration-test', 'test-page.js'))
//         .addEntry('meta', path.join(ownPath, 'hydration-test', 'index.js'))
//         .addHtml({
//             template: path.join(ownPath, '/templates', 'index.template'),
//             components: JSON.stringify(ssrComps),
//         })
//         .suppressReactDevtoolsSuggestion()
//         .getConfig();
// }

// export async function hydrationTest(simulations: string[], projectPath: string, webpackConfigPath: string) {
//     let server: IServer | null = null;
//     try {
//         const ssrComps = renderMetadata();
//         server = await serve({
//             webpackConfig: getWebpackConfig(simulations, projectPath, webpackConfigPath, ssrComps),
//         });
//         const numFailedTests = await runTestsInPuppeteer({
//             testPageUrl: server.getUrl(),
//         });
//         if (numFailedTests) {
//             process.exitCode = 1;
//         }
//     } catch (error) {
//         process.exitCode = 1;
//         if (error) {
//             process.stderr.write(error.toString() + '\n');
//         }
//     } finally {
//         if (server) {
//             server.close();
//         }
//         process.exit();
//     }
// }
