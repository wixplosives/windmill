import fs from '@file-services/node';
import { registerRequireHooks } from './require-hooks/require-hooks';

export function cliInit(): void {
    registerRequireHooks();
}

export function getWebpackConfigPath(projectPath: string): string | undefined {
    return fs.findClosestFileSync(projectPath, 'webpack.config.js');
}
