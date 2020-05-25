import ReactDOM from 'react-dom';

const mountedContainers = new Set<HTMLElement>();

const createContainer = () => {
    const container = document.createElement('div');
    document.body.appendChild(container);
    mountedContainers.add(container);
    return container;
};

export const render = (jsx: JSX.Element): { container: HTMLDivElement } => {
    const container = createContainer();
    ReactDOM.render(jsx, container);
    return { container };
};
