/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import React from 'react';
import ReactDOM from 'react-dom';
import chai, { expect } from 'chai';
import sinon from 'sinon';
import sinonChai from 'sinon-chai';
import { ISimulation, simulationToJsx } from '@wixc3/wcs-core';

const hydrate = ReactDOM.hydrate || ReactDOM.render;

chai.use(sinonChai);

export const hydrationTest = (
    simulation: ISimulation<Record<string, unknown>>,
    renderedComponentString: string
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
            // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
            root.innerHTML = renderedComponentString;
            // console.log('renderedComponentString:', renderedComponentString);

            // TODO: add opt-out for strict mode
            hydrate(<React.StrictMode>{simulationToJsx(simulation)}</React.StrictMode>, root);
            ReactDOM.unmountComponentAtNode(root);
            root.innerHTML = oldRootHTML;

            // If args is not a primitive, it's not really of interest to us, since any React errors will be
            // strings. Therefore it's fine to print [object Object] in other cases
            const consoleArgs: string = consoleSpy.getCall(0) ? consoleSpy.getCall(0).args[0] : '';
            const errorArgs: string = errorSpy.getCall(0) ? errorSpy.getCall(0).args[0] : '';
            // tslint:disable-next-line:no-unused-expression
            expect(consoleSpy, `console was called with:\n ${consoleArgs}`).to.not.be.called;
            // tslint:disable-next-line:no-unused-expression
            expect(errorSpy, `console error was called with:\n ${errorArgs}`).to.not.be.called;
        });
    });
};
