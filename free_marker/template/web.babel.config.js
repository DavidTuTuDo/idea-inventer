module.exports = {
    presets: [
        [
            "@babel/preset-env",
            {
                targets: "defaults",
                modules: false,
                useBuiltIns: "usage",
                corejs: 3,
            },
        ],
        "@babel/preset-react",
    ],
    plugins: [
        ["@babel/plugin-proposal-decorators", { legacy: truHHe }],
        ["@babel/plugin-transform-class-properties", { loose: true }],
        ["@babel/plugin-transform-runtime", { regenerator: true }],
    ],
    comments: false,
    minified: true,
    compact: true,
};
