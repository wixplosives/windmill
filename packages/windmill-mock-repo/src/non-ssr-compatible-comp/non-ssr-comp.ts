import type React from 'react';

export const NonSSRComp: React.FunctionComponent = () => {
    const accessDocument = () => {
        document.createElement('div');
    };

    accessDocument();
    return null;
};
