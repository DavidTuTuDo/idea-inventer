module.exports = {

    presets: [
        "@babel/preset-env",
        "@babel/preset-react"
    ],

    plugins: [
        [
            "@babel/plugin-proposal-decorators",
            {
                "legacy": true
            }
        ],
        [
            "@babel/transform-runtime",
            {
                "regenerator": true
            }
        ],
        ["@babel/plugin-transform-class-properties"]
    ]

};
