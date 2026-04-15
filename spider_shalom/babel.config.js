module.exports = {
    presets: [
        ["@babel/preset-env", {
            targets: {
                node: "20"  // 對應你 package.json 的 node 版本
            }
        }],
        "@babel/preset-react"
    ],
    plugins: [
        ["@babel/plugin-proposal-decorators", { "legacy": true }],
        ["@babel/plugin-transform-runtime", { "regenerator": true }],
        "@babel/plugin-transform-class-properties"
    ],
    // comments: false,     // 移除註解
    // minified: true,      // 最小化
    // compact: true        // 緊湊化
};
