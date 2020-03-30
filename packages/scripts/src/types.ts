import webpack from 'webpack';

export interface IStartWebpackServerParams {
    entry: string[];
    projectPath: string;
    webpackConfigPath: string;
    publicPath?: string;
}

export interface IWcsConfig {
    webpackConfig: webpack.Configuration;
}

export type WebpackConfigFile = webpack.Configuration | IWcsConfig;
