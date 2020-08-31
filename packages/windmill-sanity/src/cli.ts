import { sanityTests } from './server';
import { CLI, printErrorAndExit, printMessageAndExit } from '@wixc3/windmill-node-utils';

const cli = new CLI();

cli.program.description('run sanity tests on simulations');

const { simulations, webpackConfigPath, projectPath, debug, windmillConfig } = cli.start();

if (windmillConfig?.nonSSRCompatible) {
    printMessageAndExit(
        'Skipping sanity tests for project, due to "nonSSRCompatible" set as "true" in the config file.',
        debug
    );
}

sanityTests(simulations, projectPath, webpackConfigPath as string, debug, windmillConfig).catch((err) => {
    printErrorAndExit(err, debug);
});
