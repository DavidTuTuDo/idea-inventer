// ⭐️ 關鍵修正一：使用 CommonJS 語法 (require)
const { Linter } = require('eslint');
const pluginImport = require('eslint-plugin-import');

// ⭐️ 關鍵修正二：require Babel 解析器物件
const babelParser = require('@babel/eslint-parser');

/**
 * @type {Linter.FlatConfig[]}
 */
module.exports = [
    {
        // 1. 設置要檢查的檔案範圍 (僅限 JS/JSX)
        // 既然您不是 TS 專案，我們將其範圍縮小
        files: ['**/*.js', '**/*.jsx'],

        // 2. 啟用並配置 'eslint-plugin-import'
        plugins: {
            import: pluginImport,
        },

        // 3. 設置解析器選項
        languageOptions: {
            // 由於您使用的是 @babel/eslint-parser，這個設定可能不會被它使用，
            // 但作為 Linter 設定的一部分，可以保留
            ecmaVersion: 2020,
            sourceType: 'module',

            // ⭐️ 關鍵修正三：設定 parser 為 require 的物件
            parser: babelParser,

            parserOptions: {
                ecmaFeatures: {
                    jsx: true,
                },
                // 這是 @babel/eslint-parser 專用的配置
                requireConfigFile: false, // 假設您不想強制要求獨立的 babel.config.js
                babelOptions: {
                    // 如果是 React 專案，通常需要這個 preset
                    presets: ["@babel/preset-react"],
                },
            },
        },

        // 4. 設定規則 (導入相關)
        rules: {
            'import/no-unresolved': 'error',
            'import/no-cycle': [
                'error',
                {
                    maxDepth: 10,
                }
            ],
            'import/no-duplicates': 'warn',
        },

        // 5. 設定 'eslint-plugin-import' 的解析器設定 (僅針對 JS/JSX)
        settings: {
            'import/resolver': {
                node: {
                    extensions: ['.js', '.jsx']
                }
            }
        }
    }
];
