import React from 'react';
import ReactDOM from 'react-dom';
import chai, { expect } from 'chai';
import sinon from 'sinon';
import sinonChai from 'sinon-chai';
import { ISimulation, simulationToJsx } from '@wixc3/wcs-core';
import type { SimulationConfig } from '@wixc3/windmill-utils';

const hydrate = ReactDOM.hydrate || ReactDOM.render;

chai.use(sinonChai);

export const hydrationTest = (
    simulation: ISimulation<Record<string, unknown>>,
    renderedComponentString: string,
    config: Required<SimulationConfig>
): void => {
    describe(`${simulation.name} hydration test`, () => {
        let consoleSpy: sinon.SinonSpy<Parameters<Console['log']>, ReturnType<Console['log']>>;
        let errorSpy: sinon.SinonSpy<Parameters<Console['error']>, ReturnType<Console['error']>>;
        const root = document.getElementById('root') as HTMLElement;

        beforeEach(() => {
            consoleSpy = sinon.spy(console, 'log');
            errorSpy = sinon.spy(console, 'error');
        });

        afterEach(() => {
            consoleSpy.restore();
            errorSpy.restore();
        });

        // TODO: Allow opting out of this (i.e. certain components need to be able to say that they're not compliant)
        const testMessage = `should hydrate component: "${simulation.name}" without errors`;
        it(testMessage, () => {
            const oldRootHTML = root.innerHTML;

            // Set root's HTML to the SSR component
            root.innerHTML = renderedComponentString;

            if (config.reactStrictModeCompatible) {
                hydrate(<React.StrictMode>{simulationToJsx(simulation)}</React.StrictMode>, root);
            } else {
                hydrate(simulationToJsx(simulation), root);
            }

            ReactDOM.unmountComponentAtNode(root);
            root.innerHTML = oldRootHTML;

            // If args is not a primitive, it's not really of interest to us, since any React errors will be
            // strings. Therefore it's fine to print [object Object] in other cases

            // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
            const consoleArgs: string = consoleSpy.getCall(0) ? consoleSpy.getCall(0).args[0] : '';
            // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
            const errorArgs: string = errorSpy.getCall(0) ? errorSpy.getCall(0).args[0] : '';

            if (config.errorOnConsole) {
                expect(consoleSpy, `console was called with:\n ${consoleArgs}`).to.not.be.called;
                expect(errorSpy, `console error was called with:\n ${errorArgs}`).to.not.be.called;
            }
        });
    });
};
