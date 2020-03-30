import { createSimulation } from '@wixc3/wcs-core';
import { Button } from '../../../src/button/button';

export default createSimulation({
    name: 'Link Button',
    componentType: Button,
    props: {
        children: 'Link Button'
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
    }
});
