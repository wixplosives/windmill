import { Command } from 'commander';
import { a11yTest, impactLevels } from './server';
import { cliInit, getWebpackConfigPath } from '@windmill/node-utils';
import { findSimulations, consoleError } from '@windmill/utils';

cliInit();
const program = new Command();

process.on('unhandledRejection', printErrorAndExit);

program
    .description('run accessibility tests on simulations')
    .option(
        '-i, --impact <i>',
        `Only display issues with impact level <i> and higher. Values are: ${impactLevels.join(', ')}`
    )
    .option('-p, --project <p>', `Project path`)
    .option('-w, --webpack <w>', `webpack path`)
    .action((options) => {
        const projectPath = options.project || process.cwd();
        const webpackConfigPath = options.webpack || getWebpackConfigPath(projectPath);

        if (!webpackConfigPath) {
            printErrorAndExit('Could not find a webpack config.');
        }

        const simulations = findSimulations(projectPath);

        if (simulations.length === 0) {
            printErrorAndExit(`Could not find any simulations under: ${projectPath}`);
        }

        const impact = options.impact || 'minor';
        if (!impactLevels.includes(impact)) {
            printErrorAndExit(`Invalid impact level ${impact}`);
        }

        a11yTest(simulations, impact, projectPath, webpackConfigPath).catch((err) => {
            printErrorAndExit(err);
        });
    });

program.parse(process.argv);

function printErrorAndExit(message: unknown) {
    consoleError(message);
    process.exit(1);
}
