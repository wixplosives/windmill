import fs from '@file-services/node';

export function getWebpackConfigPath(projectPath: string): string | undefined {
    return fs.findClosestFileSync(projectPath, 'webpack.config.js');
}
