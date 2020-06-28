import webpack from 'webpack';
import { ISimulation } from '@wixc3/wcs-core';

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

export interface ISimulationWithSSRComp {
    simulation: ISimulation<Record<string, unknown>>;
    simulationRenderedToString?: string;
}

export interface ISimulationsToString {
    [simulationFilePath: string]: string;
}

export function getEntryCode(entryFiles: string[]): string {
    const entryCode = [
        `
    export async function getSimulations() { 
        const simulations = [];`,
    ];
    for (const [index, moduleFilePath] of entryFiles.entries()) {
        entryCode.push(`const simulation${index} = await import(${JSON.stringify(moduleFilePath)});`);

        entryCode.push(`simulations.push({simulation: simulation${index}}.default)`);
    }

    entryCode.push(`return simulations; }`);

    return entryCode.join('\n');
}

export function getEntryCodeWithSSRComps(
    entryFiles: string[],
    simulationsRenderedToString: ISimulationsToString
): string {
    const entryCode = [
        `
    export async function getSimulations() { 
        const simulations = [];`,
    ];
    for (const [index, moduleFilePath] of entryFiles.entries()) {
        entryCode.push(`const simulation${index} = await import(${JSON.stringify(moduleFilePath)});`);
        entryCode.push(
            // eslint-disable-next-line
            `simulations.push({simulation: simulation${index}.default, simulationRenderedToString: '${simulationsRenderedToString[moduleFilePath]}'})`
        );
    }

    entryCode.push(`return simulations; }`);

    return entryCode.join('\n');
}
