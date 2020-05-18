import webpack from 'webpack';
import { join } from 'path';
import { IMemFileSystem } from '@file-services/memory';

export interface OverrideConfig {
    entry: string[];
    context: string;
    plugins: webpack.Plugin[];
}

export function createPreviewConfig(
    overrideConfig: OverrideConfig,
    webpackConfig: webpack.Configuration,
    memFs: IMemFileSystem
): webpack.Configuration {
    const { module = { rules: [] }, plugins = [], resolve = {}, devtool } = webpackConfig;

    return {
        context: overrideConfig.context,
        mode: 'development',
        output: {
            libraryTarget: 'umd',
            library: 'webpackModuleSystem',
            crossOriginLoading: 'anonymous',
            path: memFs.resolve('dist'),
        },
        optimization: {
            namedModules: true,
        },
        resolve,
        module: {
            ...module,
            strictExportPresence: false,
            rules: [...module.rules],
        },
        plugins: [...plugins, ...overrideConfig.plugins],
        devtool,
    };
}

export function getEntryCode(entryFiles: string[]) {
    const entryCode = ['window.simulations = []'];
    for (const [index, moduleFilePath] of entryFiles.entries()) {
        entryCode.push(`const simulation${index} = import(${JSON.stringify(moduleFilePath)});`);
        entryCode.push(`window.simulations.push(simulation${index})`);
    }

    return entryCode.join('\n');
}
