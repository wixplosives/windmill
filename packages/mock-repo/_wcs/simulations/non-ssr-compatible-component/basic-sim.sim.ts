import { createSimulation } from '@wixc3/wcs-core';
import { NonSSRComp } from '../../../src';

export default createSimulation({
    name: 'NonSSRComp',
    componentType: NonSSRComp,
    props: {},
});
