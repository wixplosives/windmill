import type { WindmillConfig } from '@wixc3/windmill-utils';

export const windmillConfig: WindmillConfig = {
    simulationConfigs: [
        {
            simulationGlob: '**/comp-with-console-error.sim.ts',
            errorOnConsole: false,
        },
    ],
};
