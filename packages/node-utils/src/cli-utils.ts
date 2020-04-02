import { registerRequireHooks } from './';
import path from 'path';

export function cliInit(projectPath: string): void {
    registerRequireHooks(projectPath);
}

export function getWebpackConfigPath(projectPath: string): string {
    return path.join(projectPath, './webpack.config.js');
}
