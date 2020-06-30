import React, { useEffect } from 'react';

export const EventLeakComp: React.FunctionComponent = () => {
    useEffect(() => {
        window.addEventListener('click', () => {
            // whoops, I forgot to remove the event listener
        });
    });

    return <div>Click me</div>;
};
