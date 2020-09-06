import { posix as posixPath, win32 as win32Path } from '@file-services/path';
import { connect } from 'net';
import type { WebpackConfigFile, IWcsConfig, WindmillConfig, FlattenedSimulationConfig } from './types';
import type { ImpactValue } from 'axe-core';
import m from 'minimatch';

export function isWindowsStyleAbsolutePath(fsPath: string): boolean {
    return !posixPath.isAbsolute(fsPath) && win32Path.isAbsolute(fsPath);
}

export function getFileExtname(filePath: string): string {
    let basePath = filePath;
    const totalExtParts = [];
    let ext = win32Path.extname(basePath);
    while (ext && ext.length > 0) {
        totalExtParts.unshift(ext);
        basePath = basePath.slice(0, -ext.length);
        ext = win32Path.extname(basePath);
    }
    return totalExtParts.join('');
}

export async function findPort(preferredPort = 8080, numOfRetries = 10): Promise<number> {
    let currentPort = preferredPort;
    do {
        try {
            await new Promise((resolve, reject) => {
                const connection = connect(currentPort);
                const onConnect = () => {
                    connection.removeListener('connect', onConnect);
                    connection.end(resolve);
                };
                const onError = () => {
                    connection.removeAllListeners();
                    reject(currentPort);
                };
                connection.on('connect', onConnect);
                connection.on('error', onError);
            });
        } catch (port) {
            return port as number;
        }
    } while (++currentPort > numOfRetries);
    throw new Error(`Port not found in range ${preferredPort} - ${currentPort}`);
}

export function isWcsConfig(config: WebpackConfigFile): config is IWcsConfig {
    return !!(config as IWcsConfig).webpackConfig;
}

export const loadScript = (src: string, document: Document): Promise<void> =>
    new Promise((resolve, reject) => {
        const script = document.createElement('script');
        script.src = src;
        script.onload = () => resolve();
        script.onerror = reject;
        script.crossOrigin = 'anonymous';
        document.head.appendChild(script);
    });

const defaultImpactLevel: ImpactValue = 'minor';

export const defaultConfig: WindmillConfig = {
    a11yImpactLevel: defaultImpactLevel,
    accessible: true,
    reactStrictModeCompatible: true,
    ssrCompatible: true,
    errorOnConsole: true,
};

export function getBooleanValue(value: boolean | undefined, defaultValue = false): boolean {
    return value === false ? false : value === true ? true : defaultValue;
}

export function matchWithGlob(file: string, /** glob or relative/absolute path */ fileToCheck: string): boolean {
    return m(file, fileToCheck, { matchBase: true });
}

export function flattenConfig(
    simulationFilePaths: string[],
    bumpyConfig?: WindmillConfig
): FlattenedSimulationConfig[] {
    const accessible = getBooleanValue(bumpyConfig?.accessible, defaultConfig.accessible);
    const reactStrictModeCompatible = getBooleanValue(
        bumpyConfig?.reactStrictModeCompatible,
        defaultConfig.reactStrictModeCompatible
    );
    const ssrCompatible = getBooleanValue(bumpyConfig?.ssrCompatible, defaultConfig.ssrCompatible);
    const errorOnConsole = getBooleanValue(bumpyConfig?.errorOnConsole, defaultConfig.errorOnConsole);
    const a11yImpactLevel = bumpyConfig?.a11yImpactLevel || defaultConfig.a11yImpactLevel;

    const flattenedConfig: FlattenedSimulationConfig[] = [];

    // create the default config for each simulation
    for (const simulationFilePath of simulationFilePaths) {
        const defaultSimConfig: FlattenedSimulationConfig = {
            simulationFilePath,
            accessible,
            reactStrictModeCompatible,
            ssrCompatible,
            a11yImpactLevel,
            errorOnConsole,
        };

        flattenedConfig.push(defaultSimConfig);
    }

    if (bumpyConfig?.simulationConfigs) {
        for (const simConfig of bumpyConfig.simulationConfigs) {
            /**
             * Filter returns a new array, but each item is added with intact references,
             * meaning that we can simply set the values on `matchingSimConfigs` and the corresponding
             * values are changed on `flattenedConfig`.
             */
            const matchingSimConfigs = flattenedConfig.filter((c) =>
                m(c.simulationFilePath, simConfig.simulationGlob, { matchBase: true })
            );

            if (matchingSimConfigs.length) {
                for (const matchingSimConfig of matchingSimConfigs) {
                    matchingSimConfig.accessible = getBooleanValue(simConfig.accessible, matchingSimConfig.accessible);
                    matchingSimConfig.reactStrictModeCompatible = getBooleanValue(
                        simConfig.reactStrictModeCompatible,
                        matchingSimConfig.reactStrictModeCompatible
                    );
                    matchingSimConfig.ssrCompatible = getBooleanValue(
                        simConfig.ssrCompatible,
                        matchingSimConfig.ssrCompatible
                    );
                    matchingSimConfig.errorOnConsole = getBooleanValue(
                        simConfig.errorOnConsole,
                        matchingSimConfig.errorOnConsole
                    );
                    matchingSimConfig.a11yImpactLevel = simConfig.a11yImpactLevel || matchingSimConfig.a11yImpactLevel;
                }
            } else {
                throw new Error(
                    `Simulation config for simulation path "${simConfig.simulationGlob}" does not have a matching simulation.`
                );
            }
        }
    }

    return flattenedConfig;
}
