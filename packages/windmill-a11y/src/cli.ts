import { Command } from 'commander';
import { a11yTest, impactLevels } from './server';
import { cliInit, getWebpackConfigPath } from '@wixc3/windmill-/node-utils';
import { consoleError } from '@wixc3/windmill-/utils';
import glob from 'glob';

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
    .parse(process.argv);

const { args, project, webpack, impactLevel } = program;

const projectPath = project || process.cwd();
const webpackConfigPath = webpack || getWebpackConfigPath(projectPath);

if (!webpackConfigPath) {
    printErrorAndExit('Could not find a webpack config.');
}

const simulations: string[] = [];
const defaultSimulationPattern = ['*.sim.ts', '*.sim.tsx'];

if (args.length > 0) {
    for (const arg of args) {
        for (const foundFile of glob.sync(arg, { absolute: true, cwd: projectPath, matchBase: true })) {
            simulations.push(foundFile);
        }
    }

    if (simulations.length === 0) {
        printErrorAndExit(`Could not find any simulations matching the pattern: ${args}`);
    }
} else {
    for (const simPattern of defaultSimulationPattern) {
        for (const foundFile of glob.sync(simPattern, { absolute: true, cwd: projectPath, matchBase: true })) {
            simulations.push(foundFile);
        }
    }

    if (simulations.length === 0) {
        printErrorAndExit(`Could not find any simulations matching the pattern: ${defaultSimulationPattern}`);
    }
}

const impact = impactLevel || 'minor';
if (!impactLevels.includes(impact)) {
    printErrorAndExit(`Invalid impact level ${impact}`);
}

a11yTest(simulations, impact, projectPath, webpackConfigPath).catch((err) => {
    printErrorAndExit(err);
});

function printErrorAndExit(message: unknown) {
    consoleError(message);
    process.exit(1);
}
