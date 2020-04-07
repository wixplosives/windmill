import { Command } from 'commander';
import { cliInit, getWebpackConfigPath } from '@windmill/node-utils';
import { consoleError } from '@windmill/utils';
import { findSimulations } from '@windmill/scripts';
import runSSRTests from './ssr-test/mocha-wrapper';
import { ISimulation } from '@wixc3/wcs-core';
import { hydrationTest } from './hydration-test/server';

const projectPath = process.cwd();
cliInit();
const program = new Command();
const webpackConfigPath = getWebpackConfigPath(projectPath);

program
    .description('run sanity tests on simulations')
    .option('-p, --project <p>', `Project path`)
    .option('-w, --webpack <w>', `webpack path`)
    // eslint-disable-next-line @typescript-eslint/no-misused-promises
    .action(async (options) => {
        const simulationFilePaths = findSimulations(options.project || projectPath);
        const simulations: ISimulation<Record<string, unknown>>[] = [];

        for (const simulationFilePath of simulationFilePaths) {
            simulations.push(require(simulationFilePath).default);
        }

        await runSSRTests(simulations);
        // await hydrationTest(simulationFilePaths, simulations, projectPath, webpackConfigPath);
    });

program.parse(process.argv);
