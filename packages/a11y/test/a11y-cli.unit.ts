import { expect } from 'chai';
import { join, resolve } from 'path';
import { spawnSync } from 'child_process';

const cliSrcPath = require.resolve('../src/cli.ts');
const mockRepoRoot = join(__dirname, '../../mock-repo');

const runA11y = () =>
    spawnSync('node', ['-r', '@ts-tools/node/r', cliSrcPath], {
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
});
