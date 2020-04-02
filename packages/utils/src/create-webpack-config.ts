import webpack from 'webpack';
import { join } from 'path';

export interface OverrideConfig {
    entry: string[];
    context: string;
    plugins: webpack.Plugin[];
}

export function createPreviewConfig(
    overrideConfig: OverrideConfig,
    webpackConfig: webpack.Configuration
): webpack.Configuration {
    const { module = { rules: [] }, plugins = [], resolve = {}, devtool } = webpackConfig;

    return {
        context: overrideConfig.context,
        mode: 'development',
        entry: {
            main: './@windmill-a11y.js'
        },
        output: {
            libraryTarget: 'umd',
            library: 'webpackModuleSystem',
            crossOriginLoading: 'anonymous'
        },
        optimization: {
            namedModules: true
        },
        resolve,
        module: {
            ...module,
            strictExportPresence: false,
            rules: [
                ...module.rules,
                {
                    test: /@windmill-a11y\.js/,
                    use: join(__dirname, '..', 'static', 'virtual-entry-loader.js')
                }
            ]
        },
        plugins: [...plugins, ...overrideConfig.plugins],
        devtool
    };
}

export function getEntryCode(entryFiles: string[], renderer: (...args: string[]) => string) {
    const entryCode = ['window.modules = module.exports = {'];
    for (const moduleFilePath of entryFiles) {
        entryCode.push(`${JSON.stringify(moduleFilePath)}: () => import(${JSON.stringify(moduleFilePath)}),`);
    }

    entryCode.push('};');

    entryCode.push(renderer());

    return entryCode.join('\n');
}
