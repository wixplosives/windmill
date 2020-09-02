import { flattenConfig, defaultConfig } from '../src';
import type { WindmillConfig } from '../src';
import { expect } from 'chai';

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
        };

        const flattenedConfig = flattenConfig(mockSimulationFilePaths, mockProjectConfig);

        expect(flattenedConfig.length).to.equal(4);

        for (const [index, simConfig] of flattenedConfig.entries()) {
            expect(simConfig.a11yImpactLevel).to.equal(mockProjectConfig.a11yImpactLevel);
            expect(simConfig.accessible).to.equal(mockProjectConfig.accessible);
            expect(simConfig.reactStrictModeCompatible).to.equal(mockProjectConfig.reactStrictModeCompatible);
            expect(simConfig.ssrCompatible).to.equal(mockProjectConfig.ssrCompatible);
            expect(simConfig.simulationGlob).to.equal(mockSimulationFilePaths[index]);
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
            expect(simConfig.simulationGlob).to.equal(mockSimulationFilePaths[index]);
        }
    });

    it('should have rules default to true', () => {
        const mockProjectConfig: WindmillConfig = {};

        const flattenedConfig = flattenConfig(['some-sim'], mockProjectConfig)[0];

        expect(flattenedConfig.a11yImpactLevel).to.equal(defaultConfig.a11yImpactLevel);
        expect(flattenedConfig.accessible).to.equal(true);
        expect(flattenedConfig.reactStrictModeCompatible).to.equal(true);
        expect(flattenedConfig.ssrCompatible).to.equal(true);
    });

    it('should merge simulation configuration and project configuration, and only apply simulation config to the proper sim', () => {
        const simPaths = ['some-sim-1', 'some-sim-2'];
        const mockProjectConfig: WindmillConfig = {
            accessible: false,
            simulationConfigs: [{ simulationGlob: simPaths[0], accessible: true }],
        };

        const flattenedConfig = flattenConfig(simPaths, mockProjectConfig);

        expect(flattenedConfig.length).to.equal(2);
        expect(flattenedConfig[0].simulationGlob).to.equal(simPaths[0]);
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
});
