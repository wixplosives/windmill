import { hydrationTest } from '@wixc3/windmill-sanity';
import { eventListenerTest } from '@wixc3/windmill-sanity';
import type { SimulationWithSSRComp, SimulationConfig } from '@wixc3/windmill-utils/src';

export async function runTests(getSimulations: () => Promise<SimulationWithSSRComp[]>): Promise<void> {
    const simulationsData = await getSimulations();

    for (const simulationData of simulationsData) {
        const config: SimulationConfig = simulationData.config;

        // check for string 'undefined' because the values have been serialized
        if (simulationData.simulationRenderedToString && simulationData.simulationRenderedToString !== 'undefined') {
            hydrationTest(
                simulationData.simulation,
                simulationData.simulationRenderedToString,
                !config.reactStrictModeCompatible
            );
        }

        eventListenerTest(simulationData.simulation);
    }

    // eslint-disable-next-line
    const mocha = require('mocha/mocha.js');
    /* eslint-disable */

    mocha
        .run()
        .on('test end', () => (window as any).mochaStatus.completed++)
        // eslint-disable-next-line
        .on('fail', () => (window as any).mochaStatus.failed++)
        // eslint-disable-next-line
        .on('end', () => ((window as any).mochaStatus.finished = true));
    /* eslint-enable */
}
