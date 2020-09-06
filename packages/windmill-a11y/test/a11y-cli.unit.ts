import { expect } from 'chai';
import { dirname, resolve, join } from 'path';
import { spawnSync } from 'child_process';

const cliSrcPath = require.resolve('../bin/windmill-a11y.js');
const mockRepoRoot = dirname(require.resolve('@wixc3/windmill-mock-repo/package.json'));

const runA11y = (args: string[] = []) =>
    spawnSync('node', [cliSrcPath, ...args.map((arg) => `"${arg}"`)], {
        cwd: resolve(mockRepoRoot),
        shell: true,
        encoding: 'utf8',
    });

describe('The a11y cli', function () {
    this.timeout(20_000);

    it('should exit with exitCode 1 while running on mock-repo, an innaccesible project', () => {
        const { stdout, status } = runA11y();

        expect(stdout).to.include('Running a11y test');
        expect(status).to.equal(1);
    });

    it('should not error while running on non-ssr-comp, an accessible component', () => {
        const { stdout, status } = runA11y(['non-ssr-comp.sim.ts']);

        expect(stdout).to.include('Running a11y test');
        expect(stdout).to.include('Testing component NonSSRComp');
        expect(stdout).to.include('No errors found');
        expect(status).to.equal(0);
    });

    it('should not error on mock-repo, an innaccesible project, when configured as non-a11y-compatible', () => {
        const configPath = join(mockRepoRoot, 'configs/non-a11y-config.ts');
        const { stdout, status } = runA11y(['--config', `${configPath}`]);

        expect(stdout).to.include('Running a11y test');
        expect(stdout).to.include('Skipping a11y test for'); // currently printing the file path, which is different on CI, so just verify that we're skipping...
        expect(status).to.equal(0);
    });

    it('should not error on the image-without-alt-sim when configured as non-a11y-compatible', () => {
        const configPath = join(mockRepoRoot, 'configs/non-a11y-sim-config.ts');
        const sim = 'image-without-alt.sim.ts';
        const simPath = join(mockRepoRoot, '_wcs', 'simulations', 'Image', sim);

        const { stdout, status } = runA11y(['--config', `${configPath}`, `${sim}`]);

        expect(stdout).to.include(`Skipping a11y test for simulation: ${simPath}.`);
        expect(status).to.equal(0);
    });

    it('should error when a simulation config does not match an existing simulation', () => {
        const configPath = join(mockRepoRoot, 'configs/missing-sim-config.ts');
        const missingSimPath = '_wcs/simulations/Image/this-sim-does-not-exist.ts';
        const sim = 'image-without-alt.sim.ts';

        const { stderr, status } = runA11y(['--config', `${configPath}`, `${sim}`]);

        expect(stderr).to.include(
            `Simulation config for simulation path "${missingSimPath}" does not have a matching simulation.`
        );
        expect(status).to.equal(1);
    });
});
