import { expect } from 'chai';
import { WindmillConfig, flattenConfig, defaultConfig } from '@wixc3/windmill-utils';

const mockSimulationFilePaths = [
    'simulations/sim-1.sim.ts',
    'simulations/sim-2.sim.ts',
    'simulations/sim-3.sim.ts',
    'simulations/sim-4.sim.ts',
];

describe('Flatten config', () => {
    it('should apply the project config to each simulation and return an array of simulation configs', () => {
        const mockProjectConfig: WindmillConfig = {
            a11yImpactLevel: 'moderate',
            accessible: false,
            reactStrictModeCompatible: false,
            ssrCompatible: false,
            errorOnConsole: false,
        };

        const flattenedConfig = flattenConfig(mockSimulationFilePaths, mockProjectConfig);

        expect(flattenedConfig.length).to.equal(4);

        for (const [index, simConfig] of flattenedConfig.entries()) {
            expect(simConfig.a11yImpactLevel).to.equal(mockProjectConfig.a11yImpactLevel);
            expect(simConfig.accessible).to.equal(mockProjectConfig.accessible);
            expect(simConfig.reactStrictModeCompatible).to.equal(mockProjectConfig.reactStrictModeCompatible);
            expect(simConfig.ssrCompatible).to.equal(mockProjectConfig.ssrCompatible);
            expect(simConfig.errorOnConsole).to.equal(mockProjectConfig.errorOnConsole);
            expect(simConfig.simulationFilePath).to.equal(mockSimulationFilePaths[index]);
        }
    });

    it('should return a default config for each simulation if not provided a base config', () => {
        const flattenedConfig = flattenConfig(mockSimulationFilePaths);

        expect(flattenedConfig.length).to.equal(4);

        for (const [index, simConfig] of flattenedConfig.entries()) {
            expect(simConfig.a11yImpactLevel).to.equal(defaultConfig.a11yImpactLevel);
            expect(simConfig.accessible).to.equal(defaultConfig.accessible);
            expect(simConfig.reactStrictModeCompatible).to.equal(defaultConfig.reactStrictModeCompatible);
            expect(simConfig.ssrCompatible).to.equal(defaultConfig.ssrCompatible);
            expect(simConfig.errorOnConsole).to.equal(defaultConfig.errorOnConsole);
            expect(simConfig.simulationFilePath).to.equal(mockSimulationFilePaths[index]);
        }
    });

    it('should have rules default to true', () => {
        const mockProjectConfig: WindmillConfig = {};

        const flattenedConfig = flattenConfig(['some-sim'], mockProjectConfig)[0];

        expect(flattenedConfig.a11yImpactLevel).to.equal(defaultConfig.a11yImpactLevel);
        expect(flattenedConfig.accessible).to.equal(true);
        expect(flattenedConfig.reactStrictModeCompatible).to.equal(true);
        expect(flattenedConfig.ssrCompatible).to.equal(true);
        expect(flattenedConfig.errorOnConsole).to.equal(true);
    });

    it('should merge simulation configuration and project configuration, and only apply simulation config to the proper sim', () => {
        const simPaths = ['some-sim-1', 'some-sim-2'];
        const mockProjectConfig: WindmillConfig = {
            accessible: false,
            simulationConfigs: [{ simulationGlob: simPaths[0], accessible: true }],
        };

        const flattenedConfig = flattenConfig(simPaths, mockProjectConfig);

        expect(flattenedConfig.length).to.equal(2);
        expect(flattenedConfig[0].simulationFilePath).to.equal(simPaths[0]);
        expect(flattenedConfig[0].accessible).to.equal(true, `Simulation config did not apply over project config`);
        expect(flattenedConfig[1].accessible).to.equal(false); // project config
    });

    it('should throw an error when a simulation config does not match a simulation', () => {
        const simPaths = ['some-sim-1', 'some-sim-2'];
        const nonExistingPath = 'non-existing-sim-path';
        const mockProjectConfig: WindmillConfig = {
            accessible: false,
            simulationConfigs: [{ simulationGlob: nonExistingPath, accessible: true }],
        };

        expect(() => flattenConfig(simPaths, mockProjectConfig)).to.throw(
            `Simulation config for simulation path "${nonExistingPath}" does not have a matching simulation.`
        );
    });

    it('should match with a supplied glob, and return configs with resolved file paths', () => {
        const simPaths = ['some-sim-1', 'some-sim-2', 'not-matching-sim'];
        const glob = 'some-sim-*';
        const mockProjectConfig: WindmillConfig = {
            accessible: false,
            simulationConfigs: [{ simulationGlob: glob, accessible: true }],
        };

        const flattenedConfig = flattenConfig(simPaths, mockProjectConfig);

        expect(flattenedConfig.length).to.equal(3);
        expect(flattenedConfig[0].simulationFilePath).to.equal(simPaths[0]);
        expect(flattenedConfig[0].accessible).to.equal(true);
        expect(flattenedConfig[1].simulationFilePath).to.equal(simPaths[1]);
        expect(flattenedConfig[1].accessible).to.equal(true);
        expect(flattenedConfig[2].simulationFilePath).to.equal(simPaths[2]);
        expect(flattenedConfig[2].accessible).to.equal(false);
    });

    it('globs should override in order of appearance', () => {
        const simPaths = ['some-sim-1', 'some-sim-2', 'not-matching-sim'];
        const glob = 'some-sim-*';
        const glob2 = 'some-sim-*';
        const mockProjectConfig: WindmillConfig = {
            simulationConfigs: [
                { simulationGlob: glob, accessible: true },
                { simulationGlob: glob2, accessible: false },
            ],
        };

        const flattenedConfig = flattenConfig(simPaths, mockProjectConfig);

        expect(flattenedConfig.length).to.equal(3);
        expect(flattenedConfig[0].simulationFilePath).to.equal(simPaths[0]);
        expect(flattenedConfig[0].accessible).to.equal(false);
        expect(flattenedConfig[1].simulationFilePath).to.equal(simPaths[1]);
        expect(flattenedConfig[1].accessible).to.equal(false);
        expect(flattenedConfig[2].simulationFilePath).to.equal(simPaths[2]);
        expect(flattenedConfig[2].accessible).to.equal(defaultConfig.accessible);
    });
});
