import fs from 'fs';
import path from 'path';

export function registerRequireHooks() {
    require('@ts-tools/node/r');
    require('@stylable/node/register');
}
