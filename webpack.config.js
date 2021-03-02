const { StylableWebpackPlugin } = require('@stylable/webpack-plugin');
const { join, dirname } = require('path');
const TsconfigPathsPlugin = require('tsconfig-paths-webpack-plugin');

const rootTsconfigPath = require.resolve('./tsconfig.json');
const monorepoRoot = dirname(rootTsconfigPath);

const plugins = [new StylableWebpackPlugin()];

module.exports = {
    // root of the monorepo, so that paths in output will be clickable
    context: monorepoRoot,

    // works great. with the default 'eval', imports are not mapped.
    devtool: 'source-map',

    output: {
        path: join(__dirname, 'umd'),
    },

    module: {
        rules: [
            {
                test: /\.tsx?$/,
                exclude: /\.d\.ts$/,
                loader: '@ts-tools/webpack-loader',
                options: {
                    configFilePath: require.resolve('./tsconfig.json'),
                },
            },
            {
                test: /\.css$/,
                exclude: /\.st\.css$/,
                use: ['style-loader', 'css-loader'],
            },
            {
                test: /\.(png|jpg|gif|svg|woff2|ttf)$/i,
                loader: 'url-loader',
                options: {
                    limit: 2048,
                },
            },
        ],
        noParse: [require.resolve('typescript/lib/typescript.js')],
    },
    resolve: {
        extensions: ['.ts', '.tsx', '.js', '.json'],
        plugins: [new TsconfigPathsPlugin({ configFile: rootTsconfigPath })],
    },
    plugins,
};
