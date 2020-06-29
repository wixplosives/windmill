import glob from 'glob';
import fs from '@file-services/node';
import { Command } from 'commander';
import { getWebpackConfigPath } from '@wixc3/windmill-node-utils';
import { consoleError, WindmillConfig } from '@wixc3/windmill-utils';
import { sanityTests } from './server';

const program = new Command();

process.on('unhandledRejection', printErrorAndExit);

program
    .description('run sanity tests on simulations')
    .option('-p, --project <p>', `Project path`)
    .option('-d, --debug', `Debug mode`)
    .option('-w, --webpack <w>', `webpack path`)
    .option('-c, --config <c>', `Config file path`)
    .parse(process.argv);

const { args, project, webpack, debug, config } = program;

const projectPath = (project as string) || process.cwd();
const webpackConfigPath = (webpack as string) || getWebpackConfigPath(projectPath);
const windmillConfigPath = (config as string) || fs.findClosestFileSync(projectPath, 'windmill.config.js');

let windmillConfig: WindmillConfig | undefined = undefined;
if (windmillConfigPath) {
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    windmillConfig = require(windmillConfigPath) as WindmillConfig;
}

// TODO: Duplicate code here (also in cli.ts of sanity) - abstract as much of this cli stuff as possible
if (windmillConfig?.hooks) {
    for (const hook of windmillConfig.hooks) {
        hook();
    }
}

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
