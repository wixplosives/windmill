import SimulationForImageWithAlt from '@windmill/mock-repo/_wcs/simulations/Image/image-with-alt';
import { checkIfSimulationCanBeSSRendered } from '../../src';

describe('checkIfSimulationCanBeSSRendered', () => {
    checkIfSimulationCanBeSSRendered(SimulationForImageWithAlt);
});
