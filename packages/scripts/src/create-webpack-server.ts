import { findPort, isWcsConfig } from './helpers';
import { Socket } from 'net';
import webpack from 'webpack';
import VirtualModulesPlugin from 'webpack-virtual-modules';
import { getEntryCode, createPreviewConfig } from './create-webpack-config';
import { IStartWebpackServerParams, WebpackConfigFile } from './types';
import { renderInjector } from './react-renderer';
import { preferredPort } from './constants';
import { WebpackServer } from './webpack-preview-server';

export const createWebpackServer = async ({
    entry,
    projectPath,
    webpackConfigPath,
    publicPath = 'localhost'
}: IStartWebpackServerParams) => {
    const port = await findPort(preferredPort);
    let isHealthy = true;
    const connections = new Set<Socket>();
    const userConfig = require(webpackConfigPath) as WebpackConfigFile;
    const virtualEntryPlugin = new VirtualModulesPlugin({
        './@windmill-a11y.js': getEntryCode(entry, renderInjector)
    });

    const compiler = webpack(
        createPreviewConfig(
            {
                entry,
                context: projectPath,
                publicPath: `http://${publicPath}:${port}/`,
                plugins: [virtualEntryPlugin]
            },
            isWcsConfig(userConfig) ? userConfig.webpackConfig : userConfig
        )
    );

    compiler.hooks.afterCompile.tap('afterCompile', compilation => {
        const stats = compilation.getStats();
        const hasCompilationErrors = stats.hasErrors();
        if (!isHealthy && !hasCompilationErrors) {
            isHealthy = true;
            // eslint-disable-next-line no-console
            console.log('webpack recompiled successfully');
        } else if (isHealthy && hasCompilationErrors) {
            isHealthy = false;
        }
    });

    const { runningServer: server, dispose } = WebpackServer.run(compiler, { port, contentBase: projectPath });

    server.on('connection', socket => {
        connections.add(socket);
        socket.once('close', () => connections.delete(socket));
    });

    return {
        port,
        writeModule: (newEntryFiles: string[]) => {
            virtualEntryPlugin.writeModule('./@windmill-a11y.js', getEntryCode(newEntryFiles, renderInjector));
        },
        dispose() {
            for (const connection of connections) {
                connection.destroy();
            }
            connections.clear();
            return dispose();
        }
    };
};
