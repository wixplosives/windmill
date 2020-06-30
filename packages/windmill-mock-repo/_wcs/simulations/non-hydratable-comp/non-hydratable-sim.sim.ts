import { createSimulation } from '@wixc3/wcs-core';
import { NonHydratableComp } from '../../../src';

export default createSimulation({
    name: 'NonHydratableComp',
    componentType: NonHydratableComp,
    props: {},
});
