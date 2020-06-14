import { ISimulation, renderSimulation } from '@wixc3/wcs-core';
import axe, { run } from 'axe-core';

/*
 * Must be run in the browser, as axe-core depends on it.
 */
export const checkIfSimulationIsAccessible = async (
    simulation: ISimulation<Record<string, unknown>>
): Promise<axe.AxeResults> => {
    const { canvas, cleanup } = renderSimulation(simulation);

    const results = await run(canvas);

    cleanup();

    return results;
};
