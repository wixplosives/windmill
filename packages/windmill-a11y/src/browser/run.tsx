import { checkIfSimulationIsAccessible } from '../a11y-test';
import axe from 'axe-core';
import { ISimulation } from '@wixc3/wcs-core';

export interface IResult {
    simulation: string;
    result?: axe.AxeResults;
    error?: Error;
}

const simulationsJSON = window.localStorage.getItem('simulations');
const simulationFileArray = simulationsJSON ? (JSON.parse(simulationsJSON) as string[]) : [];

async function createTestsFromSimulations() {
    const simulations: ISimulation<Record<string, unknown>>[] = [];

    for (const simulationFile of simulationFileArray) {
        // eslint-disable-next-line
        const simulationModule = await (window as any).modules[simulationFile]();
        // eslint-disable-next-line
        const simulation: ISimulation<Record<string, unknown>> = simulationModule.default;

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
