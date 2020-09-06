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
    projectPath: string;
    webpackConfigPath: string;
    hooks: [() => void];
    simulationFilePattern: string[];
    ignorePaths: string[];
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
