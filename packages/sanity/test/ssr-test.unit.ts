import { expect } from 'chai';
import { ssrTestWithFailingComp, ssrTestWithPassingComp } from './test-fixtures/mocha-wrapper';

describe('checkIfSimulationCanBeSSRendered', () => {
    it('throws for a component that cannot render in node', done => {
        ssrTestWithFailingComp(flag => {
            expect(flag, 'Test did not fail with invalid component').to.equal(-1);
            done();
        });
    });

    it('does not throw for a component that can render in node', done => {
        ssrTestWithPassingComp(flag => {
            expect(flag, 'Test did not pass with valid component').to.equal(1);
            done();
        });
    });
});
