module.exports = {
    presets: [
        "@babel/preset-env"
    ],
    plugins: [
        [
            "@babel/plugin-proposal-decorators",
            {
                "legacy": true
            }
        ],
        ["@babel/transform-runtime", {
            "regenerator": true
        }],
        ["@babel/plugin-proposal-class-properties",
            {
                "loose": false
            }
        ]
    ]

};
