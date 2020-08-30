import { createSimulation } from '@wixc3/wcs-core';
import { LegacyComp } from '../../../src';

export default createSimulation({
    name: 'CompWithLegacyRef',
    componentType: LegacyComp,
    props: {},
});
