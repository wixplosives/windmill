import { expect } from 'chai';
import { dirname, resolve, join } from 'path';
import { spawnSync } from 'child_process';

const cliSrcPath = require.resolve('./fixtures/bin.js');
const mockRepoRoot = dirname(require.resolve('@wixc3/windmill-mock-repo/package.json'));

const runCli = (args: string[] = []) =>
    spawnSync('node', [cliSrcPath, ...args.map((arg) => `"${arg}"`)], {
        cwd: resolve(mockRepoRoot),
        shell: true,
        encoding: 'utf8',
    });

describe('The base cli', function () {
    this.timeout(20_000);

    it('should load a config and call any hooks defined in the config', () => {
        const configPath = join(mockRepoRoot, 'configs/test-a11y-config.js');
        const { stdout, status } = runCli(['--config', `${configPath}`, 'non-ssr-comp.sim.ts']);

        expect(stdout).to.include('This is a hook that gets called before loading your simulations');
        expect(status).to.equal(0);
    });

    it('should ignore simulation files when using --exclude', () => {
        const sim = 'image-with-alt.sim.ts';
        const { stderr, status } = runCli(['--exclude', `**/${sim}`, `${sim}`]);

        expect(stderr).to.include(`Could not find any simulations matching the pattern: ${sim}`);
        expect(status).to.equal(1);
    });
});
