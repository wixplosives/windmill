import type webpack from 'webpack';
import type axe from 'axe-core';

export interface IStartWebpackServerParams {
    entry: string[];
    testPath: string;
    projectPath: string;
    webpackConfigPath: string;
    publicPath?: string;
}

export interface IWcsConfig {
    webpackConfig: webpack.Configuration;
}

export interface IA11yTestResult {
    passed: boolean;
    violations?: axe.Result[];
}

export type WebpackConfigFile = webpack.Configuration | IWcsConfig;

export interface BaseConfig {
    /** axe-core a11y violation impact level. Defaults to 'minor'. */
    a11yImpactLevel: axe.ImpactValue;
    /** Should a11y tests be run? Defaults to true */
    accessible: boolean;
    /** Should windmill-sanity check for ssr compatibility? Defaults to true */
    ssrCompatible: boolean;
    /** Should windmill-sanity render simulations in React strict mode? Defaults to true */
    reactStrictModeCompatible: boolean;
    /** Should windmill-sanity error when simulations console log or console error? Defaults to true */
    errorOnConsole: boolean;
}

// We don't expect users to supply everything
export type WindmillConfig = Partial<BaseWindmillConfig>;

export interface BaseWindmillConfig extends Partial<BaseConfig> {
    /** The base path for the project. Default is process.cwd() */
    projectPath: string;
    /** Path to a webpack config file. By default, windmill looks in the root
     * of the project for a webpack.config.js file.
     */
    webpackConfigPath: string;
    /** functions that will be called before requiring your simulations in node. */
    hooks: [() => void];
    /** An array of file patterns to match against in case you've decided to
     * follow a pattern other than the default `*.sim.ts` or `*.sim.tsx`. */
    simulationFilePattern: string[];
    /** An array of globs for simulations that should be ignored completely from windmill tests.  */
    ignorePaths: string[];
    /** Configuration at the component level.  */
    simulationConfigs: SimulationConfig[];
}

export interface SimulationConfig extends Partial<BaseConfig> {
    /**
     * A glob for matching simulations. Can be specific, for matching a
     * single simulation. i.e. '**\/_wcs/simulations/my-comp.sim.ts'. Or can be more
     * general, for matching all simulations of a certain component i.e. '**\/Image/*.sim.ts'. */
    simulationGlob: string;
}

export interface FlattenedSimulationConfig extends Partial<SimulationConfig> {
    /**
     * The resolved file path */
    simulationFilePath: string;
}
