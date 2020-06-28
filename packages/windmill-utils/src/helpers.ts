import { posix as posixPath, win32 as win32Path } from '@file-services/path';
import { connect } from 'net';
import type { WebpackConfigFile, IWcsConfig } from './types';

export function isWindowsStyleAbsolutePath(fsPath: string): boolean {
    return !posixPath.isAbsolute(fsPath) && win32Path.isAbsolute(fsPath);
}

export function getFileExtname(filePath: string): string {
    let basePath = filePath;
    const totalExtParts = [];
    let ext = win32Path.extname(basePath);
    while (ext && ext.length > 0) {
        totalExtParts.unshift(ext);
        basePath = basePath.slice(0, -ext.length);
        ext = win32Path.extname(basePath);
    }
    return totalExtParts.join('');
}

export async function findPort(preferredPort = 8080, numOfRetries = 10): Promise<number> {
    let currentPort = preferredPort;
    do {
        try {
            await new Promise((resolve, reject) => {
                const connection = connect(currentPort);
                const onConnect = () => {
                    connection.removeListener('connect', onConnect);
                    connection.end(resolve);
                };
                const onError = () => {
                    connection.removeAllListeners();
                    reject(currentPort);
                };
                connection.on('connect', onConnect);
                connection.on('error', onError);
            });
        } catch (port) {
            return port as number;
        }
    } while (++currentPort > numOfRetries);
    throw new Error(`Port not found in range ${preferredPort} - ${currentPort}`);
}

export function isWcsConfig(config: WebpackConfigFile): config is IWcsConfig {
    return !!(config as IWcsConfig).webpackConfig;
}

export const loadScript = (src: string, document: Document): Promise<void> =>
    new Promise((resolve, reject) => {
        const script = document.createElement('script');
        script.src = src;
        script.onload = () => resolve();
        script.onerror = reject;
        script.crossOrigin = 'anonymous';
        document.head.appendChild(script);
    });
