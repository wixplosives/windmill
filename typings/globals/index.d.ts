declare module '*.st.css' {
    const stylesheet: import('@stylable/runtime').RuntimeStylesheet;
    export = stylesheet;
}

declare const urlToFile: string;

declare module '*.jpg' {
    export default urlToFile;
}

declare module '*.png' {
    export default urlToFile;
}

declare module '*.gif' {
    export default urlToFile;
}
