import Mocha from 'mocha';
import { checkIfSimulationCanBeSSRendered } from './ssr-test';
import { ISimulation } from '@wixc3/wcs-core';

const mocha = new Mocha({});
mocha.suite.emit(Mocha.Suite.constants.EVENT_FILE_PRE_REQUIRE, global, undefined, mocha);

// Invoking this method runs our ssr-test in the mocha environment
const runSSRTest = (simulations: ISimulation<Record<string, unknown>>[]): Promise<void> => {
    for (const simulation of simulations) {
        checkIfSimulationCanBeSSRendered(simulation);
    }

    return new Promise((resolve) => {
        mocha.run((failures: number) => {
            process.exitCode = failures ? -1 : 0;
            resolve();
        });
    });
};

export default runSSRTest;
