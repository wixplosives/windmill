import React from 'react';
import { Main } from '@windmill/mock-repo';

export interface AppProps {
    text: string;
}

export const App: React.FunctionComponent<AppProps> = ({ text }) => <Main text={text} />;
