import Mocha from 'mocha';
import path from 'path';

// The purpose of creating our own reporter is to completely silence
// the console.logs of this nested Mocha test suite. We only want to see
// the passes and failures of the suite that uses this file.
class MyReporter extends Mocha.reporters.Base {
    constructor(runner: Mocha.Runner) {
        super(runner);
        Mocha.reporters.Base.call(this, runner);
    }
}

const runTest = (mocha: Mocha, getPassFlag: (flag: number) => void) => {
    let passFlag = 1; // Default is passing
    mocha
        .run()
        .on('fail', () => {
            passFlag = -1; // If a test fails, set the flag to -1
        })
        .on('end', () => {
            getPassFlag(passFlag); // Return the flag once all tests are done
        });
};

// Invoking this method runs our ssr-test in the mocha environment
export const ssrTestWithFailingComp = (getPassFlag: (flag: number) => void) => {
    const pathToFailingTest = path.dirname(require.resolve('./ssr-failing-test.ts'));
    const failingMocha = new Mocha({ reporter: MyReporter });
    failingMocha.addFile(pathToFailingTest + '/ssr-failing-test.ts');

    runTest(failingMocha, getPassFlag);
};

export const ssrTestWithPassingComp = (getPassFlag: (flag: number) => void) => {
    const pathToPassingTest = path.dirname(require.resolve('./ssr-passing-test.ts'));
    const passingMocha = new Mocha({ reporter: MyReporter });
    passingMocha.addFile(pathToPassingTest + '/ssr-passing-test.ts');

    runTest(passingMocha, getPassFlag);
};
