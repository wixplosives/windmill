import { checkIfSimulationIsAccessible } from '../a11y-test';
import axe from 'axe-core';
import { ISimulation } from '@wixc3/wcs-core';
// import 'simulation/simulations.js';

export interface IResult {
    simulation: string;
    result?: axe.AxeResults;
    error?: Error;
}

async function createTestsFromSimulations() {
    const simulations: ISimulation<Record<string, unknown>>[] = [];
    // TODO: This should be unknown
    // eslint-disable-next-line
    const simulationFiles: any[] = await Promise.all((window as any).simulations);

    for (const simulationFile of simulationFiles) {
        // eslint-disable-next-line
        const simulation: ISimulation<Record<string, unknown>> = simulationFile.default;

        simulations.push(simulation);
    }

    return simulations;
}

async function test() {
    const simulations = await createTestsFromSimulations();
    const results: IResult[] = [];

    for (const simulation of simulations) {
        try {
            const result = await checkIfSimulationIsAccessible(simulation);
            results.push({ simulation: simulation.name, result });
        } catch (error) {
            results.push({ simulation: simulation.name, error: error as Error });
        }
    }

    // eslint-disable-next-line
    (window as any).puppeteerReportResults(results);
}

test().catch((err) => {
    throw err;
});
