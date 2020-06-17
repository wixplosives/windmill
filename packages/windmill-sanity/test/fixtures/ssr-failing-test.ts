import NonSSRenderableComp from '@wixc3/windmill-mock-repo/_wcs/simulations/non-ssr-compatible-component/basic-sim.sim';
import { checkIfSimulationCanBeSSRendered } from '../../src';

describe('checkIfSimulationCanBeSSRendered', () => {
    checkIfSimulationCanBeSSRendered(NonSSRenderableComp);
});
