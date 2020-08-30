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

    it('should error while running on a component using legacy API', () => {
        const { stdout, status } = runSanity(['comp-with-legacy-ref.sim.ts']);

        expect(stdout).to.include('Running sanity tests...');
        expect(status).to.equal(1);
    });

    it('should not error while running on image comp, a ssr-compatible comp', () => {
        const { stdout, status } = runSanity(['image-with-alt.sim.ts']);

        expect(stdout).to.include('Running sanity tests...');
        expect(status).to.equal(0);
    });

    it('should not error when configured tp be "nonSSRCompatible" in the windmill config', () => {
        const configPath = join(mockRepoRoot, 'non-ssr-config.ts');
        const { stdout, status } = runSanity(['--config', `${configPath}`]);

        expect(stdout).to.include(
            'Skipping sanity tests for project, due to "nonSSRCompatible" set as "true" in the config file.'
        );
        expect(stdout).to.not.include('Running sanity tests...');
        expect(status).to.equal(0);
    });

    it('should not error while running on a component using legacy API when "nonReactStrictModeCompliant" is set to "true"', () => {
        const configPath = join(mockRepoRoot, 'non-strict-mode-config.ts');
        const { stdout, status } = runSanity(['--config', `${configPath}`, 'comp-with-legacy-ref.sim.ts']);

        expect(stdout).to.include('Running sanity tests...');
        expect(status).to.equal(0);
    });
});
