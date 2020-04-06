import Mocha from 'mocha';
import { generateSSRTests } from './generate-ssr-tests';
import { createMemoryFs } from '@file-services/memory';
import { IDirectoryContents } from '@file-services/types';
import temp from 'temp';
import { consoleError } from '@windmill/utils/src';
import path from 'path';
import fs from 'fs';

const mocha = new Mocha();

// Grab the ssr-test.js file
const pathToTest = require.resolve('./run-ssr-test.js');
mocha.addFile(pathToTest);

const formatTestFiles = (testFiles: string[]): string[] => {
    const filePaths = [];

    const testsPath = temp.mkdirSync('tests');

    for (const [index, file] of testFiles.entries()) {
        const fileName = `test-${index + 1}.ts`;
        const filePath = path.join(testsPath, fileName);

        fs.writeFileSync(filePath, file);
        filePaths.push(filePath);
    }

    return filePaths;
};

// Invoking this method runs our ssr-test in the mocha environment
const runSSRTest = (simulationFilePaths: string[]) => {
    const testFiles = generateSSRTests(simulationFilePaths);

    temp.track();

    const filePaths = formatTestFiles(testFiles);

    for (const file of filePaths) {
        mocha.addFile(file);
    }

    mocha // Run the ssr-test file
        .run((failures: number) => {
            process.exitCode = failures ? -1 : 0;
        });
};

export default runSSRTest;
