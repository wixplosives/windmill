import webpack from 'webpack';

export interface OverrideConfig {
    plugins?: webpack.Plugin[];
}

export function createPreviewConfig(
    overrideConfig: OverrideConfig,
    webpackConfig: webpack.Configuration
): webpack.Configuration {
    return {
        ...webpackConfig,
        mode: 'development',
        output: {
            ...webpackConfig.output,
            libraryTarget: 'umd',
            library: 'webpackModuleSystem',
            crossOriginLoading: 'anonymous',
        },
        plugins: [...(webpackConfig.plugins || []), ...(overrideConfig.plugins || [])],
    };
}

export function getEntryCode(entryFiles: string[]): string {
    const entryCode = ['window.simulations = []'];
    for (const [index, moduleFilePath] of entryFiles.entries()) {
        entryCode.push(`const simulation${index} = import(${JSON.stringify(moduleFilePath)});`);
        entryCode.push(`window.simulations.push(simulation${index})`);
    }

    return entryCode.join('\n');
}
