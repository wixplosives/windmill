import { checkIfSimulationCanBeSSRendered } from './ssr-test';
import { findSimulations } from '@windmill/scripts';

const simulationFiles = findSimulations(process.cwd());

for (const simulationFile of simulationFiles) {
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const simulation = require(simulationFile).default;
    checkIfSimulationCanBeSSRendered(simulation);
}
