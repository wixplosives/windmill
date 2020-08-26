import type { ImpactValue } from 'axe-core';
import { a11yTest, impactLevels } from './server';
import { CLI, printErrorAndExit } from '@wixc3/windmill-cli';

const cli = new CLI();

cli.program
    .description('run accessibility tests on simulations')
    .option(
        '-i, --impact <i>',
        `Only display issues with impact level <i> and higher. Values are: ${impactLevels.join(', ')}`
    );

const { simulations, program, windmillConfig, webpackConfigPath, projectPath, debug } = cli.start();
const { impact: impactLevel } = program;

const impact = ((impactLevel as string) || windmillConfig?.a11yImpactLevel || 'minor') as ImpactValue;

if (!impactLevels.includes(impact)) {
    printErrorAndExit(`Invalid impact level ${String(impact)}`, debug);
}

a11yTest(simulations, impact, projectPath, webpackConfigPath as string, debug).catch((err) => {
    printErrorAndExit(err, debug);
});
