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
