import { Command } from 'commander';
import { cliInit, getWebpackConfigPath } from '@windmill/node-utils';
import { consoleError } from '@windmill/utils';
import { findSimulations } from '@windmill/scripts';
import { checkIfSimulationCanBeSSRendered } from './ssr-test';

const projectPath = process.cwd();
cliInit();
const program = new Command();
const webpackConfigPath = getWebpackConfigPath(projectPath);

program
    .description('run sanity tests on simulations')
    .option('-p, --project <p>', `Project path`)
    .option('-w, --webpack <w>', `webpack path`)
    .action((options) => {
        const simulations = findSimulations(options.project || projectPath);

        hydrationTest(projectPath, simulations, webpackConfigPath);
        // a11yTest(
        //     simulations,
        //     impact,
        //     options.project || projectPath,
        //     options.webpack || webpackConfigPath
        // ).catch((err) => consoleError(err));
    });

program.parse(process.argv);
