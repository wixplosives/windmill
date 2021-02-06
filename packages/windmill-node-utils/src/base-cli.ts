import glob from 'glob';
import fs from '@file-services/node';
import { Command } from 'commander';
import { consoleError, WindmillConfig } from '@wixc3/windmill-utils';

export function printErrorAndExit(message: unknown, debug: boolean): void {
    consoleError(message);
    if (!debug) {
        process.exit(1);
    }
}

export class CLI {
    public program;
    public simulations: string[];

    constructor() {
        this.program = new Command();
        this.simulations = [];

        process.on('unhandledRejection', (err) => printErrorAndExit(err, false));

        this.program
            .option('-p, --project <p>', `Project path`)
            .option('-d, --debug', `Debug mode`)
            .option('-w, --webpack <w>', `webpack path`)
            .option('-c, --config <c>', `Config file path`)
            .option('-x, --exclude <x>', `Test glob to exclude`);
    }

    public start(): {
        program: Command;
        simulations: string[];
        windmillConfig: WindmillConfig | undefined;
        webpackConfigPath: string;
        projectPath: string;
        debug: boolean;
    } {
        this.program.parse();
        const { project, webpack, debug, config, exclude } = this.program.opts();
        const { args } = this.program;
        const projectPath = (project as string) || process.cwd();
        const windmillConfigPath = (config as string) || fs.findClosestFileSync(projectPath, 'windmill.config.js');

        let windmillConfig: WindmillConfig | undefined = undefined;
        if (windmillConfigPath) {
            // eslint-disable-next-line @typescript-eslint/no-var-requires
            windmillConfig = (require(windmillConfigPath) as { windmillConfig: WindmillConfig }).windmillConfig;
        }

        if (windmillConfig?.hooks) {
            for (const hook of windmillConfig.hooks) {
                hook();
            }
        }

        const webpackConfigPath =
            (webpack as string) ||
            windmillConfig?.webpackConfigPath ||
            fs.findClosestFileSync(projectPath, 'webpack.config.js');

        if (!webpackConfigPath) {
            printErrorAndExit('Could not find a webpack config.', debug);
        }

        const simulationFilePattern = windmillConfig?.simulationFilePattern || ['*.sim.ts', '*.sim.tsx'];
        const ignorePaths = windmillConfig?.ignorePaths ? windmillConfig?.ignorePaths : exclude ? [exclude] : [];
        const globOptions: glob.IOptions = { absolute: true, cwd: projectPath, matchBase: true, ignore: ignorePaths };

        if (args.length > 0) {
            for (const arg of args) {
                for (const foundFile of glob.sync(arg, globOptions)) {
                    this.simulations.push(foundFile);
                }
            }

            if (this.simulations.length === 0) {
                printErrorAndExit(`Could not find any simulations matching the pattern: ${args.join(', ')}`, debug);
            }
        } else {
            for (const simPattern of simulationFilePattern) {
                for (const foundFile of glob.sync(simPattern, globOptions)) {
                    this.simulations.push(foundFile);
                }
            }

            if (this.simulations.length === 0) {
                printErrorAndExit(
                    `Could not find any simulations matching the pattern: ${simulationFilePattern.join(', ')}`,
                    debug
                );
            }
        }

        return {
            program: this.program as Command,
            simulations: this.simulations,
            windmillConfig,
            webpackConfigPath: webpackConfigPath as string,
            projectPath,
            debug: !!debug,
        };
    }
}
