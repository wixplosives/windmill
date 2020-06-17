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
        const { stdout, status } = runA11y(['basic-sim.sim.ts']);

        expect(stdout).to.include('Running a11y test');
        expect(stdout).to.include('Testing component NonSSRComp');
        expect(stdout).to.include('No errors found');
        expect(status).to.equal(0);
    });

    it.only('should load a config and call any hooks', () => {
        const configPath = join(mockRepoRoot, 'test-a11y-config.js');
        const { stdout, stderr, status } = runA11y([`--config ${configPath} basic-sim.sim.ts`]);
        console.log('stderr:', stderr);
        console.log('stdout:', stdout);

        expect(stdout).to.include('This is a hook that gets called before loading your simulations');
        expect(stdout).to.include('Testing component NonSSRComp');
        expect(stdout).to.include('No errors found');
        expect(status).to.equal(0);
    });
});
