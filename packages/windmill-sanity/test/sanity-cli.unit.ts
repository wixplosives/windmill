import { expect } from 'chai';
import { dirname, resolve, join } from 'path';
import { spawnSync } from 'child_process';

const cliSrcPath = require.resolve('../bin/windmill-sanity.js');
const mockRepoRoot = dirname(require.resolve('@wixc3/windmill-mock-repo/package.json'));

const runSanity = (args: string[] = []) =>
    spawnSync('node', [cliSrcPath, ...args.map((arg) => `"${arg}"`)], {
        cwd: resolve(mockRepoRoot),
        shell: true,
        encoding: 'utf8',
    });

describe('The sanity cli', function () {
    this.timeout(20_000);

    it('should error while running on mock-repo, a repo with non-hydratable components', () => {
        const { stdout, status } = runSanity();

        expect(stdout).to.include('Running sanity tests...');
        expect(status).to.equal(1);
    });

    it('should error while running on non-ssr-comp', () => {
        const { stdout, status } = runSanity(['non-ssr-comp.sim.ts']);

        expect(stdout).to.include('Running sanity tests...');
        expect(status).to.equal(1);
    });

    it('should error while running on non-hydratable-comp', () => {
        const { stdout, status } = runSanity(['non-hydratable-sim.sim.ts']);

        expect(stdout).to.include('Running sanity tests...');
        expect(status).to.equal(1);
    });

    it('should not error while running on image comp, a ssr-compatible comp', () => {
        const { stdout, status } = runSanity(['image-with-alt.sim.ts']);

        expect(stdout).to.include('Running sanity tests...');
        expect(status).to.equal(0);
    });

    it('should load a config and call any hooks defined in the config', () => {
        const configPath = join(mockRepoRoot, 'test-a11y-config.js');
        const { stdout, status } = runSanity(['--config', `${configPath}`, 'image-with-alt.sim.ts']);

        expect(stdout).to.include('This is a hook that gets called before loading your simulations');
        expect(status).to.equal(0);
    });
});
