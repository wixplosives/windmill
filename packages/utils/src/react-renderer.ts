// comment from source: we should have an abstraction for multiple renderers. KISS
export const renderInjector = () => `
window.React = require('react');
window.ReactDOM = require('react-dom');
`;
