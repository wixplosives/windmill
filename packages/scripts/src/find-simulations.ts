import fs from 'fs';
import path from 'path';
import { getFileExtname } from './helpers';

const ignoredSubPaths = ['/node_modules/'];
const simulationExtensions = ['.sim.ts', '.sim.tsx'];

const isTypeScriptFile = (filePath: string) => filePath.endsWith('.ts') || filePath.endsWith('.tsx');

function predicate(filePath: string) {
    return !ignoredSubPaths.find(path => filePath.includes(path)) && isTypeScriptFile(filePath);
}

const defaultIgnoredDirectoryNames = new Set(['node_modules', '.git']);

const defaultDirectoryFilter = (_directoryPath: string, directoryName: string) =>
    !defaultIgnoredDirectoryNames.has(directoryName);

function traverseFs(
    directoryPath: string,
    filterFile: (filePath: string, fileName: string) => boolean = () => true,
    filterDirectory = defaultDirectoryFilter,
    directories: string[] = [],
    files: string[] = []
) {
    const { readdirSync } = fs;
    directories.push(directoryPath);
    for (const item of readdirSync(directoryPath, { withFileTypes: true })) {
        const itemName = item.name;
        const itemPath = path.join(directoryPath, itemName);
        if (item.isDirectory() && filterDirectory(itemPath, itemName)) {
            traverseFs(itemPath, filterFile, filterDirectory, directories, files);
        } else if (item.isFile() && filterFile(itemPath, itemName)) {
            files.push(itemPath);
        }
    }

    return {
        directories,
        files
    };
}

export const findSimulations = (directory: string = process.cwd()) => {
    const fileSystemContents = traverseFs(directory, predicate);
    const simFilePaths = fileSystemContents.files.filter(filePath =>
        simulationExtensions.includes(getFileExtname(filePath))
    );

    return simFilePaths;
};
