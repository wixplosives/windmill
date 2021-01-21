import type { ImpactValue } from 'axe-core';
import { CLI, printErrorAndExit } from '@wixc3/windmill-node-utils';
import { flattenConfig } from '@wixc3/windmill-utils';
import { a11yTest, impactLevels } from './server';

const cli = new CLI();

cli.program
    .description('run accessibility tests on simulations')
    .option(
        '-i, --impact <i>',
        `Only display issues with impact level <i> and higher. Values are: ${impactLevels.join(', ')}`
    );

const { simulations, program, windmillConfig, webpackConfigPath, projectPath, debug } = cli.start();
const { impact: impactLevel } = program.opts();

const impact = ((impactLevel as string) || windmillConfig?.a11yImpactLevel || 'minor') as ImpactValue;

if (!impactLevels.includes(impact)) {
    printErrorAndExit(`Invalid impact level ${String(impact)}`, debug);
}

const flattenedConfig = flattenConfig(simulations, windmillConfig);

a11yTest(flattenedConfig, impact, projectPath, webpackConfigPath as string, debug).catch((err) => {
    printErrorAndExit(err, debug);
});
