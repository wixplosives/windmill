import { Command } from 'commander';
import { a11yTest, impactLevels } from './server';
import { cliInit, getWebpackConfigPath } from '@windmill/node-utils';
import { findSimulations } from '@windmill/utils';

cliInit();
const program = new Command();

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
        const simulations = findSimulations(projectPath);

        const impact = options.impact || 'minor';
        if (!impactLevels.includes(impact)) {
            throw new Error(`Invalid impact level ${impact}`);
        }

        a11yTest(simulations, impact, projectPath, webpackConfigPath).catch((err) => {
            throw err;
        });
    });

program.parse(process.argv);
