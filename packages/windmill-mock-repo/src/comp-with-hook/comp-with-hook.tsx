import React, { useState, useCallback } from 'react';

export const CompWithHook: React.FC = () => {
    const [state, setState] = useState<number>(1);

    function increment() {
        setState(state + 1);
    }

    const wrappedIncrement = useCallback(increment, []);

    return <div onClick={wrappedIncrement}>{state}</div>;
};
