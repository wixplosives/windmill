import { checkIfSimulationIsAccessible } from '../a11y-test';
import type { Result } from '../server';
import type { ISimulationWithSSRComp } from '@wixc3/windmill-utils/src';

export async function test(simulationsData: ISimulationWithSSRComp[]): Promise<void> {
    const results: Result[] = [];

    for (const simulationData of simulationsData) {
        const simulation = simulationData.simulation;
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
