import { sanityTests } from './server';
import { CLI, printErrorAndExit } from '@wixc3/windmill-node-utils';

const cli = new CLI();

cli.program.description('run sanity tests on simulations');

const { simulations, webpackConfigPath, projectPath, debug } = cli.start();

sanityTests(simulations, projectPath, webpackConfigPath as string, debug).catch((err) => {
    printErrorAndExit(err, debug);
});
