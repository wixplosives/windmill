import glob from 'glob';
import fs from '@file-services/node';
import type { ImpactValue } from 'axe-core';
import { Command } from 'commander';
import { getWebpackConfigPath } from '@wixc3/windmill-node-utils';
import { consoleError } from '@wixc3/windmill-utils';
import { a11yTest, impactLevels } from './server';
import type { WindmillConfig } from './types';

const program = new Command();

process.on('unhandledRejection', printErrorAndExit);

program
    .description('run accessibility tests on simulations')
    .option(
        '-i, --impact <i>',
        `Only display issues with impact level <i> and higher. Values are: ${impactLevels.join(', ')}`
    )
    .option('-p, --project <p>', `Project path`)
    .option('-d, --debug', `Debug mode`)
    .option('-w, --webpack <w>', `webpack path`)
    .option('-c, --config <c>', `Config file path`)
    .parse(process.argv);

const { args, project, webpack, impactLevel, debug, config } = program;
const projectPath = (project as string) || process.cwd();
const windmillConfigPath = (config as string) || fs.findClosestFileSync(projectPath, 'windmill.config.js');

let windmillConfig: WindmillConfig | undefined = undefined;
if (windmillConfigPath) {
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    windmillConfig = require(windmillConfigPath) as WindmillConfig;
}

if (windmillConfig?.hooks) {
    for (const hook of windmillConfig.hooks) {
        hook();
    }
}

const webpackConfigPath = (webpack as string) || windmillConfig?.webpackConfigPath || getWebpackConfigPath(projectPath);

if (!webpackConfigPath) {
    printErrorAndExit('Could not find a webpack config.');
}

const simulations: string[] = [];
const simulationFilePattern = windmillConfig?.simulationFilePattern || ['*.sim.ts', '*.sim.tsx'];
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
    for (const simPattern of simulationFilePattern) {
        for (const foundFile of glob.sync(simPattern, globOptions)) {
            simulations.push(foundFile);
        }
    }

    if (simulations.length === 0) {
        printErrorAndExit(`Could not find any simulations matching the pattern: ${simulationFilePattern.join(', ')}`);
    }
}

const impact = ((impactLevel as string) || windmillConfig?.a11yImpactLevel || 'minor') as ImpactValue;
if (!impactLevels.includes(impact)) {
    printErrorAndExit(`Invalid impact level ${impact}`);
}

a11yTest(simulations, impact, projectPath, webpackConfigPath as string, debug).catch((err) => {
    printErrorAndExit(err);
});

function printErrorAndExit(message: unknown): void {
    consoleError(message);
    if (!debug) {
        process.exit(1);
    }
}
