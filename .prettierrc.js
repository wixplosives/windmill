module.exports = {
    printWidth: 120,
    singleQuote: true,
    tabWidth: 4,
    overrides: [
        {
            files: ['*.json', '*.md', '*.yml'],
            options: {
                tabWidth: 2,
            },
        },
    ],
};
