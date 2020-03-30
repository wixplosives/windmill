import { createSimulation } from '@wixc3/wcs-core';
import { setup } from '../setup';
import { Button } from '../../../src/button/button';
import { classes as buttonVariants } from '../../../src/components/button/button-variants.st.css';

export default createSimulation({
    name: 'Primary Button',
    componentType: Button,
    props: {
        className: buttonVariants.primaryButton,
        children: 'Primary Button'
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
