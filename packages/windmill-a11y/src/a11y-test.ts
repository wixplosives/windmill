import { ISimulation, renderSimulation } from '@wixc3/wcs-core';
import { run } from 'axe-core';
import type { IA11yTestResult } from '@wixc3/windmill-utils/src';

/*
 * Must be run in the browser, as axe-core depends on it.
 */
export const checkIfSimulationIsAccessible = async (
    simulation: ISimulation<Record<string, unknown>>
): Promise<IA11yTestResult> => {
    const { canvas, cleanup } = renderSimulation(simulation);

    const results = await run(canvas);

    cleanup();

    if (results.violations.length) {
        return {
            passed: false,
            violations: results.violations,
        };
    }

    return { passed: true };
};
