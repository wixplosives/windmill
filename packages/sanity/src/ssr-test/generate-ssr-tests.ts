// import path from 'path';

// const ssrTestPath = path.resolve('./run-ssr-test.js');

export const generateSSRTests = (simulationFilePaths: string[]) => {
    const ssrTests = [];

    for (const simulationFilePath of simulationFilePaths) {
        ssrTests.push(generateTestFile(simulationFilePath));
    }

    return ssrTests;
};

const generateTestFile = (simulationFilePath: string) => {
    return `
  import { checkIfSimulationCanBeSSRendered } from '@windmill/ssr';
  import simulation from '${simulationFilePath}';
    console.log(checkIfSimulationCanBeSSRendered)
  checkIfSimulationCanBeSSRendered(simulation);
  `;
};
