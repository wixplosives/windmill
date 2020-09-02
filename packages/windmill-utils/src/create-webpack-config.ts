import type webpack from 'webpack';
import type { ISimulation } from '@wixc3/wcs-core';
import type { SimulationConfig } from './types';

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

export type Simulation = ISimulation<Record<string, unknown>>;

export interface SimulationWithSSRComp {
    simulation: Simulation;
    simulationRenderedToString?: string;
}

export interface ISimulationsToString {
    [simulationFilePath: string]: string;
}

export function getEntryCode(simulationConfigs: SimulationConfig[]): string {
    const entryCode = [
        `
    export async function getSimulations() { 
        const simulations = [];`,
    ];
    for (const [index, config] of simulationConfigs.entries()) {
        entryCode.push(`const simulation${index} = await import(${JSON.stringify(config.simulationGlob)});`);

        entryCode.push(`simulations.push(simulation${index}.default);`);
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
