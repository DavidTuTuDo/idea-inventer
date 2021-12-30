const path = require('path');
const UglifyJsPlugin = require('uglifyjs-webpack-plugin');
const webpack = require('webpack');
const BundleAnalyzerPlugin = require("webpack-bundle-analyzer").BundleAnalyzerPlugin;

const self = {
    entry: path.resolve(__dirname, './src/index.js'),
    module: {
        rules: [
            {
                test: /\.(js|jsx)$/,
                exclude: /node_modules/,
                use: ['babel-loader'],
            },
            {
                test: /\.css$/,
                exclude: /node_modules/,
                use: ['style-loader', 'css-loader']
            },
        ]
    },
    resolve: {
        extensions: ['*', '.js', '.jsx', '.css'],
        fallback: {
            fs: false,
            child_process: false,
            path: require.resolve("path-browserify"),
            crypto: require.resolve('crypto-browserify'),
            buffer: require.resolve("buffer/"),
            url: false,
            http: false,
            https: false,
            zlib: false,
            assert: false,
            util: false,
            stream: false,
            constants: false,
            events: false,
            os: false,
        }
    },
    output: {
        path: path.resolve(__dirname, './dist'),
        filename: 'bundle.js',
        publicPath: '/'

    },

    plugins: [
        new webpack.IgnorePlugin({
            resourceRegExp: /^\.\/.+/,
            contextRegExp: /pdf-parse/
        }),
        new webpack.HotModuleReplacementPlugin(),
    ],
    devServer: {
        contentBase: path.resolve(__dirname, './dist'),
        hot: true,
        inline: true,
        port: 8080,
        host: '0.0.0.0',
        historyApiFallback: true
    },
};

if(process.env.self_debug === undefined){
    self.plugins.push(new webpack.DefinePlugin({
        'process': {env: {is_node: false, self_debug: true}}
    }))

    if(process.env.self_debug) {
        self.plugins.push(
            new BundleAnalyzerPlugin({
                //  可以是`server`，`static`或`disabled`。
                //  在`server`模式下，分析器將啟動HTTP伺服器來顯示軟體包報告。
                //  在“靜態”模式下，會生成帶有報告的單個HTML檔案。
                //  在`disabled`模式下，你可以使用這個外掛來將`generateStatsFile`設定為`true`來生成Webpack Stats JSON檔案。
                analyzerMode: "server",
                //  將在“伺服器”模式下使用的主機啟動HTTP伺服器。
                analyzerHost: "127.0.0.1",
                //  將在“伺服器”模式下使用的埠啟動HTTP伺服器。
                analyzerPort: 8866,
                //  路徑捆綁，將在`static`模式下生成的報告檔案。
                //  相對於捆綁輸出目錄。
                reportFilename: "report.html",
                //  模組大小預設顯示在報告中。
                //  應該是`stat`，`parsed`或者`gzip`中的一個。
                //  有關更多資訊，請參見“定義”一節。
                defaultSizes: "parsed",
                //  在預設瀏覽器中自動開啟報告
                openAnalyzer: true,
                //  如果為true，則Webpack Stats JSON檔案將在bundle輸出目錄中生成
                generateStatsFile: false,
                //  如果`generateStatsFile`為`true`，將會生成Webpack Stats JSON檔案的名字。
                //  相對於捆綁輸出目錄。
                statsFilename: "stats.json",
                //  stats.toJson（）方法的選項。
                //  例如，您可以使用`source：false`選項排除統計檔案中模組的來源。
                //  在這裡檢視更多選項：https：  //github.com/webpack/webpack/blob/webpack-1/lib/Stats.js#L21
                statsOptions: null,
                logLevel: "info"}
            ))
    }
} else {
    self.plugins.push(new webpack.DefinePlugin({
        'process': {env: {is_node: false, self_debug: false}}
    }))
}

module.exports = self;

