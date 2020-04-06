import React from 'react';
import ReactDOM from 'react-dom';
import chai, { expect } from 'chai';
import sinon from 'sinon';
import sinonChai from 'sinon-chai';
import { ISimulation, simulationToJsx } from '@wixc3/wcs-core';

const hydrate = ReactDOM.hydrate || ReactDOM.render;

chai.use(sinonChai);

async function getSimulationsFromFileArray(simulationFileArray: string[]) {
    const simulations: ISimulation<Record<string, unknown>>[] = [];

    for (const simulationFile of simulationFileArray) {
        const simulationModule = await (window as any).modules[simulationFile]();
        const simulation: ISimulation<Record<string, unknown>> = simulationModule.default;

        simulations.push(simulation);
    }

    return simulations;
}

// eslint-disable-next-line @typescript-eslint/require-await
export const hydrationTest = async (): Promise<void> => {
    // eslint-disable-next-line @typescript-eslint/no-misused-promises
    describe('Hydration test', async () => {
        let consoleSpy: sinon.SinonSpy<Parameters<Console['log']>, ReturnType<Console['log']>>;
        let errorSpy: sinon.SinonSpy<Parameters<Console['error']>, ReturnType<Console['error']>>;
        const root = document.getElementById('root') as HTMLElement;
        let index = 0;
        const componentStrings = (window as any).components;
        const simulationsJSON = window.localStorage.getItem('simulations');
        const simulationFileArray = simulationsJSON && JSON.parse(simulationsJSON);

        const simulations = await getSimulationsFromFileArray(simulationFileArray);

        for (const simulation of simulations) {
            // eslint-disable-next-line
            describe(`Simulation: ${simulation.name}`, (done) => {
                beforeEach(() => {
                    consoleSpy = sinon.spy(console, 'log');
                    errorSpy = sinon.spy(console, 'error');
                });

                afterEach(() => {
                    consoleSpy.restore();
                    errorSpy.restore();
                });

                const testMessage = `should ${ReactDOM.hydrate ? 'hydrate' : 'render'} simulation: "${simulation.name}"
                        in strict mode without errors`;
                it(testMessage, () => {
                    // Set root's HTML to the SSR component
                    root.innerHTML = componentStrings[index];
                    console.log('componentStrings:', componentStrings);

                    hydrate(<React.StrictMode>{simulationToJsx(simulation)}</React.StrictMode>, root);

                    ReactDOM.unmountComponentAtNode(root);
                    index++;
                    // If args is not a primitive, it's not really of interest to us, since any React errors will be
                    // strings. Therefore it's fine to print [object Object] in other cases
                    const consoleArgs = consoleSpy.getCall(0) ? consoleSpy.getCall(0).args[0] : '';
                    const errorArgs = errorSpy.getCall(0) ? errorSpy.getCall(0).args[0] : '';
                    // tslint:disable-next-line:no-unused-expression
                    expect(consoleSpy, `console was called with:\n ${consoleArgs}`).to.not.be.called;
                    // tslint:disable-next-line:no-unused-expression
                    expect(errorSpy, `console error was called with:\n ${errorArgs}`).to.not.be.called;
                    done();
                });
            });
        }
    });
};
