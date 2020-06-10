import { checkIfSimulationIsAccessible } from '../a11y-test';
import { ISimulation } from '@wixc3/wcs-core';
import { Result } from '../server';

export async function test(simulations: ISimulation<Record<string, unknown>>[]): Promise<void> {
    // const simulations = await createTestsFromSimulations(simulationArray);
    const results: Result[] = [];

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
