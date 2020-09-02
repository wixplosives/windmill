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
    accessible: boolean;
    ssrCompatible: boolean;
    reactStrictModeCompatible: boolean;
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
