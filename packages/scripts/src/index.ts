import { findSimulations } from './find-simulations';
import path from 'path';
// eslint-disable-next-line no-console
console.log(findSimulations(path.join(process.cwd(), '../mock-repo')));
