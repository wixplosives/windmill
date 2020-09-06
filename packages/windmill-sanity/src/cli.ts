import { sanityTests } from './server';
import { CLI, printErrorAndExit } from '@wixc3/windmill-node-utils';
import { flattenConfig } from '@wixc3/windmill-utils';

const cli = new CLI();

cli.program.description('run sanity tests on simulations');

const { simulations, webpackConfigPath, projectPath, debug, windmillConfig } = cli.start();

const flattenedConfig = flattenConfig(simulations, windmillConfig);

sanityTests(flattenedConfig, projectPath, webpackConfigPath as string, debug).catch((err) => {
    printErrorAndExit(err, debug);
});
