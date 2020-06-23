import glob from 'glob';
import { Command } from 'commander';
import { cliInit, getWebpackConfigPath } from '@wixc3/windmill-node-utils';
import { consoleError } from '@wixc3/windmill-utils';
import { sanityTests } from './server';

cliInit();
const program = new Command();

process.on('unhandledRejection', printErrorAndExit);

program
    .description('run sanity tests on simulations')
    .option('-p, --project <p>', `Project path`)
    .option('-d, --debug', `Debug mode`)
    .option('-w, --webpack <w>', `webpack path`)
    .parse(process.argv);

const { args, project, webpack, debug } = program;

const projectPath = (project as string) || process.cwd();
const webpackConfigPath = (webpack as string) || getWebpackConfigPath(projectPath);

if (!webpackConfigPath) {
    printErrorAndExit('Could not find a webpack config.');
}

const simulations: string[] = [];
const defaultSimulationPattern = ['*.sim.ts', '*.sim.tsx'];
const globOptions: glob.IOptions = { absolute: true, cwd: projectPath, matchBase: true };

if (args.length > 0) {
    for (const arg of args) {
        for (const foundFile of glob.sync(arg, globOptions)) {
            simulations.push(foundFile);
        }
    }

    if (simulations.length === 0) {
        printErrorAndExit(`Could not find any simulations matching the pattern: ${args.join(', ')}`);
    }
} else {
    for (const simPattern of defaultSimulationPattern) {
        for (const foundFile of glob.sync(simPattern, globOptions)) {
            simulations.push(foundFile);
        }
    }

    if (simulations.length === 0) {
        printErrorAndExit(
            `Could not find any simulations matching the pattern: ${defaultSimulationPattern.join(', ')}`
        );
    }
}

sanityTests(simulations, projectPath, webpackConfigPath as string, debug).catch((err) => {
    printErrorAndExit(err);
});

function printErrorAndExit(message: unknown): void {
    consoleError(message);
    if (!debug) {
        process.exit(1);
    }
}
