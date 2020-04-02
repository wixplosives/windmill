import { Command } from 'commander';
import { a11yTest, impactLevels } from './';
import { cliInit, getWebpackConfigPath } from '@windill/node-utils';
import { findSimulations, consoleError } from '@windmill/utils';

const projectPath = process.cwd();
cliInit(projectPath);
const program = new Command();
const webpackConfigPath = getWebpackConfigPath(projectPath);

program
    .description('run accessibility tests on simulations')
    .option(
        '-i, --impact <i>',
        `Only display issues with impact level <i> and higher. Values are: ${impactLevels.join(', ')}`
    )
    .action(options => {
        const simulations = findSimulations();
        const impact = options.impact || 'minor';
        if (!impactLevels.includes(impact)) {
            throw new Error(`Invalid impact level ${impact}`);
        }

        a11yTest(simulations, impact, webpackConfigPath).catch(err => consoleError(err));
    });

program.parse(process.argv);
