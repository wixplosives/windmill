import type { WindmillConfig } from '@wixc3/windmill-utils/src';

export const windmillConfig: WindmillConfig = {
    simulationConfigs: [
        {
            simulationGlob: '_wcs/simulations/Image/this-sim-does-not-exist.ts',
            accessible: false,
        },
    ],
};
