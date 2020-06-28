import { hydrationTest } from '@wixc3/windmill-sanity';
import { eventListenerTest } from '@wixc3/windmill-sanity';
import { ISimulationWithSSRComp } from '@wixc3/windmill-utils/src';

export async function runTests(getSimulations: () => Promise<ISimulationWithSSRComp[]>): Promise<void> {
    const simulationsData = await getSimulations();
    for (const simulationData of simulationsData) {
        if (simulationData.simulationRenderedToString) {
            hydrationTest(simulationData.simulation, simulationData?.simulationRenderedToString);
        }

        eventListenerTest(simulationData.simulation);
    }

    mocha
        .run()
        // eslint-disable-next-line
        .on('test end', () => (window as any).mochaStatus.numCompletedTests++)
        // eslint-disable-next-line
        .on('fail', () => (window as any).mochaStatus.numFailedTests++)
        // eslint-disable-next-line
        .on('end', () => ((window as any).mochaStatus.finished = true));
}
