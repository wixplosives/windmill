import type { WindmillConfig } from '@wixc3/windmill-utils';

export const windmillConfig: WindmillConfig = {
    simulationConfigs: [
        {
            simulationGlob: '**/image-without-alt.sim.ts',
            accessible: false,
        },
    ],
};
