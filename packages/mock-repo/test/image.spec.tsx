import { expect } from 'chai';
import React from 'react';
import { Image } from '../src';
import { render } from '@windmill/utils';

describe('Image', () => {
    it('renders an image with src', () => {
        const src = 'some-src.url';

        const { container } = render(<Image src={src} />);
        const image = container.children[0] as HTMLImageElement;

        expect(image.src).to.equal(src);
    });

    it('renders an image with alt', () => {
        const alt = 'A short description';

        const { container } = render(<Image src="" alt={alt} />);
        const image = container.children[0] as HTMLImageElement;

        expect(image.alt).to.equal(alt);
    });
});
