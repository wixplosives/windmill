import { checkIfSimulationIsAccessible } from '../a11y-test';
import type { Result } from '../server';
import type { Simulation } from '@wixc3/windmill-utils';

export async function test(simulations: Simulation[]): Promise<void> {
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
    (window as any).testReportResults(results);
}
