import { createSimulation } from '@wixc3/wcs-core';
import { Button } from '../../../src/button/button';
import { setup } from '../setup';

export default createSimulation({
    name: 'Regular Button',
    componentType: Button,
    props: {
        children: 'Regular Button'
    },
    environmentProps: {
        canvasHeight: 'auto',
        canvasWidth: 'auto',
        canvasPadding: {
            left: 20,
            top: 20,
            right: 20,
            bottom: 20
        }
    },
    setup
});
