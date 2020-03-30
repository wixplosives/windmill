const { StylableWebpackPlugin } = require('@stylable/webpack-plugin');
require('@ts-tools/node/r');

const plugins = [new StylableWebpackPlugin()];

module.exports = {
    // root of the monorepo, so that paths in output will be clickable
    context: __dirname,

    // works great. with the default 'eval', imports are not mapped.
    devtool: 'source-map',

    resolve: {
        extensions: ['.ts', '.tsx', '.mjs', '.js', '.json']
    },

    module: {
        rules: [
            {
                test: /\.tsx?$/,
                exclude: /\.d\.ts$/,
                loader: '@ts-tools/webpack-loader',
                options: {
                    configFilePath: require.resolve('./tsconfig.json')
                }
            },
            {
                test: /\.css$/,
                exclude: /\.st\.css$/,
                use: ['style-loader', 'css-loader']
            },
            {
                test: /\.(png|jpg|gif|svg|woff2|ttf)$/i,
                loader: 'url-loader',
                options: {
                    limit: 2048
                }
            }
        ],
        noParse: [require.resolve('typescript/lib/typescript.js')]
    },
    plugins
};
