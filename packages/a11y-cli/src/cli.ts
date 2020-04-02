import { Command } from 'commander';
import { a11yTest, impactLevels } from './';
import { cliInit, getWebpackConfigPath } from '@windmill/node-utils';
import { consoleError } from '@windmill/utils';
import { findSimulations } from '@windmill/scripts';

const projectPath = process.cwd();
cliInit();
const program = new Command();
const webpackConfigPath = getWebpackConfigPath(projectPath);

program
    .description('run accessibility tests on simulations')
    .option(
        '-i, --impact <i>',
        `Only display issues with impact level <i> and higher. Values are: ${impactLevels.join(', ')}`
    )
    .action(options => {
        const simulations = findSimulations(projectPath);
        const impact = options.impact || 'minor';
        if (!impactLevels.includes(impact)) {
            throw new Error(`Invalid impact level ${impact}`);
        }

        a11yTest(simulations, impact, projectPath, webpackConfigPath).catch(err => consoleError(err));
    });

program.parse(process.argv);
