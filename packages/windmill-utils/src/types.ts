import type webpack from 'webpack';
import type { ImpactValue } from 'axe-core';

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

export type WebpackConfigFile = webpack.Configuration | IWcsConfig;

export interface WindmillConfig {
    projectPath: string;
    webpackConfigPath: string;
    hooks: [() => void];
    simulationFilePattern: string[];
    a11yImpactLevel: ImpactValue;
}
