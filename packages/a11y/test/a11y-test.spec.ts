import { expect } from 'chai';
import SimulationForImageWithoutAlt from '@windmill/mock-repo/_wcs/simulations/Image/image-without-alt';
import SimulationForImageWithAlt from '@windmill/mock-repo/_wcs/simulations/Image/image-with-alt';
import { checkIfSimulationIsAccessible } from '../src';

describe('checkIfSimulationIsAccessible', () => {
    it('reports errors for an inaccessible component', async () => {
        const results = await checkIfSimulationIsAccessible(SimulationForImageWithoutAlt);

        expect(results.violations.length).to.equal(1);
    });

    it('does not report errors for an accessible component', async () => {
        const results = await checkIfSimulationIsAccessible(SimulationForImageWithAlt);

        expect(results.violations.length).to.equal(0);
    });
});
