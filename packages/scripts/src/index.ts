import { findSimulations } from './find-simulations';
import path from 'path';
import { createWebpackServer } from './create-webpack-server';
import puppeteer from 'puppeteer';
import { loadScript } from './helpers';

const mockRepoPath = path.join(process.cwd(), '../mock-repo');
const simulations = findSimulations(mockRepoPath);
// eslint-disable-next-line no-console
console.log(simulations);

const runScript = async () => {
    const thing = await createWebpackServer({
        entry: simulations,
        projectPath: mockRepoPath,
        webpackConfigPath: path.join(mockRepoPath, 'webpack.config.js')
    });

    const browser = await puppeteer.launch({ headless: false });
    const page = await browser.newPage();
    await page.goto('http://localhost:8081/main.js');
    await page.evaluate(async () => {
        await loadScript(`http://localhost:8081/main.js`, document);
    });
};

runScript()
    // eslint-disable-next-line no-console
    .then(res => console.log(res))
    // eslint-disable-next-line no-console
    .catch(err => console.error(err));
