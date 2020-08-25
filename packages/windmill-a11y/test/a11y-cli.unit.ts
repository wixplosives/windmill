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

    it('should load a config and call any hooks defined in the config', () => {
        const configPath = join(mockRepoRoot, 'test-a11y-config.js');
        const { stdout, status } = runA11y(['--config', `${configPath}`, 'non-ssr-comp.sim.ts']);

        expect(stdout).to.include('This is a hook that gets called before loading your simulations');
        expect(stdout).to.include('Testing component NonSSRComp');
        expect(stdout).to.include('No errors found');
        expect(status).to.equal(0);
    });

    it('should ignore simulation files when using --exclude', () => {
        const sim = 'image-with-alt.sim.ts';
        const { stderr, status } = runA11y(['--exclude', `**/${sim}`, `${sim}`]);

        expect(stderr).to.include(`Could not find any simulations matching the pattern: ${sim}`);
        expect(status).to.equal(1);
    });
});
