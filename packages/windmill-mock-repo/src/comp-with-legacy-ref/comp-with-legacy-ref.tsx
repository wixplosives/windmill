import React from 'react';

export class LegacyComp extends React.Component {
    public ref: React.ReactInstance | undefined;

    // eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
    public componentDidMount() {
        // eslint-disable-next-line react/no-string-refs
        const ref = this.refs.legacy;
        this.ref = ref;
    }

    public render(): JSX.Element {
        // eslint-disable-next-line react/no-string-refs
        return <div ref="legacy">LegacyComp</div>;
    }
}
