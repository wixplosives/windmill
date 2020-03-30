/* eslint-disable @typescript-eslint/no-explicit-any */
import Server, { Configuration } from 'webpack-dev-server';
import webpack from 'webpack';

export interface RendererApi {
    addScript(src: string): void;
}

export interface PreviewServerOptions extends Configuration {
    renderHTML?(api: RendererApi): void;
}

// this class should provide an interface for displaying isolated preview (e.g remote/mobile preview), using the serveMagicHtml.
// maybe can be removed and use webpack dev server as is
export class WebpackServer extends Server {
    public static run(compiler: webpack.Compiler, options: PreviewServerOptions) {
        options.host = options.host || '';
        try {
            const server = new WebpackServer(compiler, options);
            // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
            const runningServer = server.listen(options.port!, options.host, err => {
                if (err) {
                    throw err;
                }
            });
            return { runningServer, dispose: () => new Promise(res => server.close(res)) };
        } catch (err) {
            if (err.name === 'ValidationError') {
                // eslint-disable-next-line no-console
                console.error(err);
                process.exit(1);
            }

            throw err;
        }
    }
    private options!: PreviewServerOptions;
    constructor(compiler: webpack.Compiler, options: PreviewServerOptions) {
        super(compiler, {
            hotOnly: false,
            hot: true,
            inline: true,
            headers: {
                'Access-Control-Allow-Origin': '*'
            },
            clientLogLevel: 'error',
            stats: 'errors-warnings',
            noInfo: true,
            ...options
        });
    }

    public serveMagicHtml(req: any, res: any, next: any) {
        const _path = req.path;
        try {
            const m = (this as any).middleware;
            const isFile = m.fileSystem.statSync(m.getFilenameFromUrl(`${_path}.js`)).isFile();
            if (!isFile) {
                return next();
            }
            // Serve a page that executes the javascript
            res.write(
                '<!DOCTYPE html><html><head><meta charset="utf-8"/></head><body><script type="text/javascript" charset="utf-8" src="'
            );
            res.write(_path);
            res.write('.js');
            res.write(req._parsedUrl.search || '');
            res.write('"></script>');
            res.write('<script>\n');
            res.write(`console.log(webpackModuleSystem, webpackModuleSystem.libs)`);
            res.write('\n</script>');
            res.end('</body></html>');
        } catch (err) {
            return next();
        }
    }
    /*
     * This is work around webpack-dev-server does not notify on update chunks with errors
     * since we are using this update server and catching errors in client we always send new hash and ok message
     */
    public _sendStats(this: any, sockets: any, stats: any) {
        this.sockWrite(sockets, 'hash', stats.hash);

        if (stats.errors.length > 0) {
            this.sockWrite(sockets, 'errors', stats.errors);
        } else if (stats.warnings.length > 0) {
            this.sockWrite(sockets, 'warnings', stats.warnings);
        }
        this.sockWrite(sockets, 'ok');
    }
}
