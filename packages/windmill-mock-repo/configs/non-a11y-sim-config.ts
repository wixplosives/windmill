import type { WindmillConfig } from '@wixc3/windmill-utils/src';

export const windmillConfig: WindmillConfig = {
    simulationConfigs: [
        {
            simulationGlob: '**/image-without-alt.sim.ts',
            accessible: false,
        },
    ],
};
