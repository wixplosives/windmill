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
    nonAccessible: boolean;
    nonSSRCompatible: boolean;
    nonReactStrictModeCompatible: boolean;
}

// We don't expect users to supply everything
export type WindmillConfig = Partial<BaseWindmillConfig>;

export interface BaseWindmillConfig extends Partial<BaseConfig> {
    projectPath: string;
    webpackConfigPath: string;
    hooks: [() => void];
    simulationFilePattern: string[];
    ignorePaths: string[];
    componentConfig: ComponentConfig;
    simulationConfig: SimulationConfig;
}

export interface ComponentConfig extends Partial<BaseConfig> {
    componentPath: string;
    exportName: string;
}

export interface SimulationConfig extends Partial<BaseConfig> {
    simulationPath: string;
}
