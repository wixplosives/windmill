import React from 'react';

export const NonHydratableComp: React.FunctionComponent = () => {
    if (window) {
        return <div key="window">{`I'm on the client`}</div>;
    } else {
        return <button key="server">{`I'm on the server!`}</button>;
    }
};
