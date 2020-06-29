import NonSSRenderableComp from '@wixc3/windmill-mock-repo/_wcs/simulations/non-ssr-comp/non-ssr-comp.sim';
import { checkIfSimulationCanBeSSRendered } from '../../src';

describe('checkIfSimulationCanBeSSRendered', () => {
    checkIfSimulationCanBeSSRendered(NonSSRenderableComp);
});
