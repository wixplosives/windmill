import { registerRequireHooks } from './';
import path from 'path';

export function cliInit(): void {
    registerRequireHooks();
}

export function getWebpackConfigPath(projectPath: string): string {
    return path.join(projectPath, './webpack.config.js');
}
