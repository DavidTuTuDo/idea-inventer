import path from 'path';
import * as parser from '@babel/parser';
import traverse from '@babel/traverse';
import _ from 'lodash';
import { utiller as Util } from 'utiller';

export default class FunctionCollector {
    constructor(filePath, content) {
        this.filePath = path.resolve(filePath); // 絕對路徑
        this.content = content;
        this.objectOfFunctions = {}; // 儲存所有函式名稱和行數
    }

    // 解析代碼
    parseCode(code) {
        return parser.parse(code, {
            sourceType: 'module',
            plugins: ['jsx', 'classProperties', 'asyncGenerators', 'objectRestSpread', 'decorators-legacy'],
        });
    }

    /**
     * 新增函數資訊到 objectOfFunctions
     */
    addFunction(name, loc) {
        const key = `${Util.getPathAfterSrc(this.filePath)}${Util.getSeparatorOfUnique()}${name}`;
        const lineRange = [loc.start.line, loc.end.line];

        this.objectOfFunctions[key] = {
            lineRange,
            path: this.filePath,
            name,
            used: false,
            scan: false,
        };
    }

    // 彙整類別中的所有函數
    async collectFunctions() {
        const ast = this.parseCode(this.content); // 解析成 AST

        traverse(ast, {
            // 類別中的方法（傳統寫法）
            ClassMethod: (path) => {
                const functionName = path.node.key.name;
                this.addFunction(functionName, path.node.loc);
            },

            // 類別中的 arrow function（例如 React class component 中寫法）
            ClassProperty: (path) => {
                const isArrowFunction = path.node.value?.type === 'ArrowFunctionExpression';
                if (isArrowFunction) {
                    const functionName = path.node.key.name;
                    this.addFunction(functionName, path.node.loc);
                }
            },

            // 外部的 function 宣告
            FunctionDeclaration: (path) => {
                const functionName = path.node.id?.name;
                if (functionName) {
                    this.addFunction(functionName, path.node.loc);
                }
            },

            // 外部的 arrow function，例如 const a = () => {}
            ArrowFunctionExpression: (path) => {
                if (path.parent.type === 'VariableDeclarator') {
                    const functionName = path.parent.id?.name;
                    if (functionName) {
                        this.addFunction(functionName, path.node.loc);
                    }
                }
            },

            // 外部的傳統 function expression，例如 const a = function() {}
            FunctionExpression: (path) => {
                if (path.parent.type === 'VariableDeclarator') {
                    const functionName = path.parent.id?.name;
                    if (functionName) {
                        this.addFunction(functionName, path.node.loc);
                    }
                }
            },
        });

        // 列印出所有函數名稱和行數
        // console.log('Found functions:', this.objectOfFunctions);
        return this.objectOfFunctions;
    }
}
