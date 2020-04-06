/**
 * @jest-environment node
 */
import { renderToString } from 'react-dom/server';
import { expect } from 'chai';
import { ISimulation, simulationToJsx } from '@wixc3/wcs-core';

export const checkIfSimulationCanBeSSRendered = (simulation: ISimulation<Record<string, unknown>>): void => {
    describe('SSR tests', () => {
        it('should be run in an environment without document and window', () => {
            // TODO: check node context
            expect(() => window).to.throw();
            expect(() => document).to.throw();
        });

        describe(`Simulation: ${simulation.name}`, () => {
            it(`should render simulation: "${simulation.name}" to string without throwing`, () => {
                expect(
                    () => renderToString(simulationToJsx(simulation)),
                    'RenderToString threw an error'
                ).not.to.throw();
            });
        });
    });
};
