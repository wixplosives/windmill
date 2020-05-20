import webpack from 'webpack';
import Koa from 'koa';
import koaWebpack from 'koa-webpack';
import { Log } from './log';
import { getServerUrl } from '../http';
import koaStatic from 'koa-static';
import { IMemFileSystem } from '@file-services/memory';
import { createWebpackFs } from '@file-services/webpack';
import { nodeFs } from '@file-services/node';
import { createOverlayFs } from '@file-services/overlay';
import { WebpackConfigurator } from '../webpack';

export interface IServeOptions {
    webpackConfigurator: WebpackConfigurator;
    projectPath: string;
    host?: string;
    port?: number;
    watch?: boolean;
    memFs?: IMemFileSystem;
}

export interface IServer {
    close: () => void;
    getUrl: () => string;
}

interface IServerOptions {
    middleware: Koa.Middleware & koaWebpack.CombinedWebpackMiddleware;
    staticMiddleware: Koa.Middleware;
    host: string;
    port: number;
    log: Log;
}

interface ICompilerOptions {
    webpackConfig: webpack.Configuration;
    watch: boolean;
    log: Log;
}

interface IMiddlewareOptions {
    compiler: webpack.Compiler;
    watch: boolean;
}

function createCompiler({ webpackConfig, log, watch }: ICompilerOptions) {
    webpackConfig.bail = watch;

    webpackConfig.plugins = webpackConfig.plugins || [];
    webpackConfig.plugins.push(new webpack.ProgressPlugin(log.compilationProgress));

    const compiler = webpack(webpackConfig);

    const compilerPromise = new Promise((resolve, reject) => {
        // When an error occurs either `hooks.failed` or `hooks.done` runs depending
        // on the bail mode and the type of the error. `hooks.failed` seems to be
        // specific to missing entry points.

        compiler.hooks.failed.tap('Serve', (error) => {
            log.compilationError(error);
            reject();
        });

        compiler.hooks.done.tap('Serve', (stats) => {
            log.compilationFinished(stats);
            stats.hasErrors() ? reject() : resolve();
        });
    });

    return { compiler, compilerPromise };
}

function createMiddleware({ compiler, watch }: IMiddlewareOptions) {
    return koaWebpack({
        compiler,
        devMiddleware: {
            publicPath: '/',
            logLevel: 'silent',
            watchOptions: watch ? {} : { ignored: '**/*' },
        },
        hotClient: watch
            ? {
                  hmr: false,
                  logLevel: 'error',
                  reload: true,
              }
            : false,
    });
}

function createStaticMiddleware({ compiler }: IMiddlewareOptions) {
    return koaStatic(compiler.options.context || process.cwd());
}

function createServer({
    middleware,
    staticMiddleware,
    host,
    port,
    log,
}: IServerOptions): { server: IServer; serverPromise: Promise<unknown> } {
    const server = new Koa().use(middleware).use(staticMiddleware).listen({ host, port });
    const getUrl = () => getServerUrl(server);
    const close = () => {
        middleware.close();
        server.close();
    };

    const serverPromise = new Promise((resolve, reject) => {
        server.on('listening', () => {
            log.serverListening(getUrl());
            resolve();
        });
        server.on('error', reject);
    });

    return { server: { close, getUrl }, serverPromise };
}

export async function serve(options: IServeOptions): Promise<IServer> {
    // We're not using a random port by default because Chrome and Firefox
    // block connections to some ports (e.g. 2049 - nfs, 6000 - X11) to prevent
    // cross-protocol attacks.
    const webpackConfig = options.webpackConfigurator.getConfig();
    const host = options.host || '127.0.0.1';
    const port = options.port || 0x420;

    if (webpackConfig.output) {
        webpackConfig.output.publicPath = `http://${host}:${port}/`;
    }

    const watch = options.watch || false;

    const log = new Log(watch);

    const { compiler, compilerPromise } = createCompiler({
        webpackConfig,
        watch,
        log,
    });

    if (options.memFs) {
        const webpackFs = createWebpackFs(createOverlayFs(nodeFs, options.memFs, __dirname));
        compiler.inputFileSystem = webpackFs;
        compiler.outputFileSystem = createWebpackFs(options.memFs);
    }

    const middleware = await createMiddleware({ compiler, watch });
    const staticMiddleware = createStaticMiddleware({ compiler, watch });

    const { server, serverPromise } = createServer({
        middleware,
        staticMiddleware,
        host,
        port,
        log,
    });

    try {
        if (watch) {
            await serverPromise;
        } else {
            await Promise.all([serverPromise, compilerPromise]);
        }
    } catch (error) {
        server.close();
        throw error;
    }

    return server;
}
