import fs from 'fs';
import path from 'path';
import { getFileExtname } from './helpers';

const ignoredSubPaths = ['/node_modules/'];
const simulationExtensions = ['.sim.ts', '.sim.tsx'];

const isTypeScriptFile = (filePath: string) => filePath.endsWith('.ts') || filePath.endsWith('.tsx');

function predicate(filePath: string) {
    return !ignoredSubPaths.find(path => filePath.includes(path)) && isTypeScriptFile(filePath);
}

function traverseFs(
    directoryPath: string,
    predicate: (filePath: string) => boolean,
    directories: string[] = [],
    files: string[] = []
) {
    const { readdirSync, statSync } = fs;

    directories.push(directoryPath);

    for (const nodeName of readdirSync(directoryPath)) {
        const nodePath = path.join(directoryPath, nodeName);

        if (statSync(nodePath).isDirectory() && nodeName !== 'node_modules') {
            traverseFs(nodePath, predicate, directories, files);
        } else if (predicate(nodePath)) {
            files.push(nodePath);
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
