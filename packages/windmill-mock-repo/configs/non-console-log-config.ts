import type { WindmillConfig } from '@wixc3/windmill-utils/src';

export const windmillConfig: WindmillConfig = {
    simulationConfigs: [
        {
            simulationGlob: '**/comp-with-console-log.sim.ts',
            errorOnConsole: false,
        },
    ],
};
