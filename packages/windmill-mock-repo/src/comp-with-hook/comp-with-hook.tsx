import React, { useState, useCallback } from 'react';

const addOne = (value: number) => value + 1;

export const CompWithHook: React.FC = () => {
    const [state, setState] = useState<number>(1);
    const increment = useCallback(() => setState(addOne), []);

    return <div onClick={increment}>{state}</div>;
};
