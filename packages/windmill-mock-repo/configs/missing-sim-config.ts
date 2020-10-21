import type { WindmillConfig } from '@wixc3/windmill-utils';

export const windmillConfig: WindmillConfig = {
    simulationConfigs: [
        {
            simulationGlob: '_wcs/simulations/Image/this-sim-does-not-exist.ts',
            accessible: false,
        },
    ],
};
