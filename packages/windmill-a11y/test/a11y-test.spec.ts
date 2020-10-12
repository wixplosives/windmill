import { expect } from 'chai';
import SimulationForImageWithoutAlt from '@wixc3/windmill-mock-repo/_wcs/simulations/Image/image-without-alt.sim';
import SimulationForImageWithAlt from '@wixc3/windmill-mock-repo/_wcs/simulations/Image/image-with-alt.sim';
import { checkIfSimulationIsAccessible } from '../src';

describe('checkIfSimulationIsAccessible', function () {
    this.timeout(5_000);

    it('reports errors for an inaccessible component', async () => {
        const result = await checkIfSimulationIsAccessible(SimulationForImageWithoutAlt);

        expect(result.passed).to.equal(false);
        expect(result.violations?.length).to.equal(1);
    });

    it('does not report errors for an accessible component', async () => {
        const result = await checkIfSimulationIsAccessible(SimulationForImageWithAlt);

        expect(result.passed).to.equal(true);
        expect(result.violations).to.equal(undefined);
    });
});
