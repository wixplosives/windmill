import { posix as posixPath, win32 as win32Path } from '@file-services/path';

export function isWindowsStyleAbsolutePath(fsPath: string): boolean {
    return !posixPath.isAbsolute(fsPath) && win32Path.isAbsolute(fsPath);
}

export function getFileExtname(filePath: string) {
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
