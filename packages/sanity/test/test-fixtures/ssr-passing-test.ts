import SimulationForImageWithAlt from '@windmill/mock-repo/_wcs/simulations/Image/image-with-alt.sim';
import { checkIfSimulationCanBeSSRendered } from '../../src';

describe('checkIfSimulationCanBeSSRendered', () => {
    checkIfSimulationCanBeSSRendered(SimulationForImageWithAlt);
});
