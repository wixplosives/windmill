import type webpack from 'webpack';
import type { ISimulation } from '@wixc3/wcs-core';
import type { SimulationConfig, FlattenedSimulationConfig } from './types';

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
    config: Required<SimulationConfig>;
    simulationRenderedToString?: string;
}

export interface ISimulationsToString {
    [simulationFilePath: string]: string;
}

export function getEntryCode(simulationConfigs: FlattenedSimulationConfig[]): string {
    const entryCode = [
        `
    export async function getSimulations() { 
        const simulations = [];`,
    ];
    for (const [index, config] of simulationConfigs.entries()) {
        entryCode.push(`const simulation${index} = await import(${JSON.stringify(config.simulationFilePath)});`);

        entryCode.push(`simulations.push(simulation${index}.default);`);
    }

    entryCode.push(`return simulations; }`);

    return entryCode.join('\n');
}

export function getEntryCodeWithSSRComps(
    simulationConfigs: FlattenedSimulationConfig[],
    simulationsRenderedToString: ISimulationsToString
): string {
    const entryCode = [
        `
    export async function getSimulations() { 
        const simulations = [];`,
    ];
    for (const [index, config] of simulationConfigs.entries()) {
        entryCode.push(`const simulation${index} = await import(${JSON.stringify(config.simulationFilePath)});`);
        entryCode.push(
            // eslint-disable-next-line
            `simulations.push({simulation: simulation${index}.default, simulationRenderedToString: '${
                simulationsRenderedToString[config.simulationFilePath]
            }', config: ${JSON.stringify(config)}})`
        );
    }

    entryCode.push(`return simulations; }`);

    return entryCode.join('\n');
}
