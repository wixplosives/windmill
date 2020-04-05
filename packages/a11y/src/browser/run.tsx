import { checkIfSimulationIsAccessible } from '../a11y-test';
import axe from 'axe-core';
import { ISimulation } from '@wixc3/wcs-core';

export interface IResult {
    simulation: string;
    result?: axe.AxeResults;
    error?: Error;
}

const simulationsJSON = window.localStorage.getItem('simulations');
const simulationFileArray = simulationsJSON && JSON.parse(simulationsJSON);

async function createTestsFromSimulations() {
    const simulations: ISimulation<Record<string, unknown>>[] = [];

    for (const simulationFile of simulationFileArray) {
        const simulationModule = await (window as any).modules[simulationFile]();
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
            results.push({ simulation: simulation.name, error });
        }
    }

    (window as any).puppeteerReportResults(results);
}

// eslint-disable-next-line @typescript-eslint/no-non-null-assertion
// eslint-disable-next-line no-console
test().catch((err) => console.error(err));
