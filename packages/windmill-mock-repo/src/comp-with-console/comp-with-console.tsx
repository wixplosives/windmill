/* eslint-disable no-console */
import React from 'react';

export const CompWithConsoleLog: React.FC = () => {
    console.log('Console logging');

    return <div>Console log component</div>;
};

export const CompWithConsoleError: React.FC = () => {
    console.error('Console erroring');

    return <div>Console error component</div>;
};
