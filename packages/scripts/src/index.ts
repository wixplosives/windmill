import { findSimulations } from './find-simulations';
import path from 'path';
import { createWebpackServer } from './create-webpack-server';
import puppeteer from 'puppeteer';
import { loadScript } from './helpers';
import { runTestsInPuppeteer } from '@windmill/utils';

const mockRepoPath = path.join(process.cwd(), '../mock-repo');
const ownPath = path.resolve(__dirname, '..');
const test = path.join(ownPath, 'src/test');
const simulations = findSimulations(mockRepoPath);
// eslint-disable-next-line no-console
console.log(simulations);

const src = `test.js`;

const runScript = async () => {
    const thing = await createWebpackServer({
        entry: [...simulations, test],
        testPath: test,
        projectPath: mockRepoPath,
        webpackConfigPath: path.join(mockRepoPath, 'webpack.config.js')
    });

    const result = await runTestsInPuppeteer({
        testPageUrl: 'http://localhost:8081/main',
        puppeteerOptions: { headless: false }
    });
    console.log('result:', result);

    // const browser = await puppeteer.launch({ headless: false });
    // const page = await browser.newPage();
    // await page.goto('http://localhost:8081/main');
    // await page.evaluate(simulations => {
    //     window.localStorage.setItem('simulations', simulations);

    //     const script = document.createElement('script');
    //     // eslint-disable-next-line @typescript-eslint/no-explicit-any
    //     script.src = (window as any).modules['/Users/kieranw/Documents/code/windmill/packages/scripts/src/test']();
    //     script.crossOrigin = 'anonymous';
    //     document.head.appendChild(script);
    // }, JSON.stringify(simulations));
};

runScript()
    .then(res => {
        // eslint-disable-next-line no-console
        console.log(res);
    })
    // eslint-disable-next-line no-console
    .catch(err => console.error(err));
