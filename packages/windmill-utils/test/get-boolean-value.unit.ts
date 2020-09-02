import { getBooleanValue } from '../src';
import { expect } from 'chai';

describe('Get boolean value', () => {
    it('should return a boolean value of "false" for undefined', () => {
        const val = getBooleanValue(undefined);

        expect(val).to.deep.equal(false);
    });

    it('should default to false', () => {
        const val = getBooleanValue(undefined, true);

        expect(val).to.deep.equal(true);
    });

    it('should only use default value when passed undefined', () => {
        const val = getBooleanValue(false, true);

        expect(val).to.deep.equal(false);
    });

    it('should return a boolean value of true for true', () => {
        const val = getBooleanValue(true);

        expect(val).to.deep.equal(true);
    });

    it('default value should not override true', () => {
        const val = getBooleanValue(true, false);

        expect(val).to.deep.equal(true);
    });
});
