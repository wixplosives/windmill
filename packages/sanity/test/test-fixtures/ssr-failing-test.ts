import NonSSRenderableComp from '@windmill/mock-repo/_wcs/simulations/non-ssr-compatible-component/basic-sim';
import { checkIfSimulationCanBeSSRendered } from '../../src';

describe('checkIfSimulationCanBeSSRendered', () => {
    checkIfSimulationCanBeSSRendered(NonSSRenderableComp);
});