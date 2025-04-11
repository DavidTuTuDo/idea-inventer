import path from 'path';
import * as parser from '@babel/parser';
import traverse from '@babel/traverse';
import _ from 'lodash';
import {utiller as Util} from 'utiller';

export default class FunctionCollector {
    constructor(filePath,content) {
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
     * 從絕對路徑中取出 "src/" 之後的部分（包含前置 /）
     * @param {string} fullPath - 完整的絕對檔案路徑
     * @returns {string} - 以 / 開頭、從 src/ 之後開始的相對路徑
     */
    getPathAfterSrc = (fullPath) => {
        const parts = _.split(fullPath, path.sep);
        const indexOfSrc = _.findLastIndex(parts, part => part === 'src');
        if (indexOfSrc === -1) return ''; // 找不到 src，回傳空字串

        const relativeParts = _.slice(parts, indexOfSrc + 1);
        return _.join(relativeParts, '/');
    }

    // 彙整類別中的所有函數
    async collectFunctions() {
        const code = this.content; // 讀取檔案內容
        const ast = this.parseCode(code); // 解析成AST

        // 使用traverse遍歷AST
        traverse(ast, {
            ClassMethod: (path) => {
                const functionName = path.node.key.name;
                const lineRange = [path.node.loc.start.line, path.node.loc.end.line];
                this.objectOfFunctions[`${this.getPathAfterSrc(this.filePath)}${Util.getSeparatorOfUnique()}${functionName}`] = {
                    lineRange,
                    path: this.filePath,
                    name: functionName,
                    used: false,
                    scan: false,
                };
            },
            FunctionDeclaration: (path) => {
                const functionName = path.node.id.name;
                const lineRange = [path.node.loc.start.line, path.node.loc.end.line];
                this.objectOfFunctions[`${this.getPathAfterSrc(this.filePath)}${Util.getSeparatorOfUnique()}${functionName}`]  = {
                    lineRange,
                    path: this.filePath,
                    name: functionName,
                    used: false,
                    scan: false,
                };
            },
            ArrowFunctionExpression: (path) => {
                if (path.parent.type === 'VariableDeclarator') {
                    const functionName = path.parent.id.name;
                    const lineRange = [path.node.loc.start.line, path.node.loc.end.line];
                    this.objectOfFunctions[functionName] = {
                        lineRange,
                        path: this.filePath,
                        name: functionName,
                        used: false,
                        scan: false,
                    };
                }
            },
            FunctionExpression: (path) => {
                if (path.parent.type === 'VariableDeclarator') {
                    const functionName = path.parent.id.name;
                    const lineRange = [path.node.loc.start.line, path.node.loc.end.line];
                    this.objectOfFunctions[`${this.getPathAfterSrc(this.filePath)}${Util.getSeparatorOfUnique()}${functionName}`]  = {
                        lineRange,
                        path: this.filePath,
                        name: functionName,
                        used: false,
                        scan: false
                    };
                }
            },
            'ArrowFunctionExpression|FunctionDeclaration|FunctionExpression': (path) => {
                // 這裡會處理函數類型
                // 同樣的處理邏輯對於箭頭函數、函數聲明和函數表達式
                const functionName = path.node.id ? path.node.id.name : 'anonymous';
                const lineRange = [path.node.loc.start.line, path.node.loc.end.line];
                if (functionName !== 'anonymous') {
                    this.objectOfFunctions[`${this.getPathAfterSrc(this.filePath)}${Util.getSeparatorOfUnique()}${functionName}`]  = {
                        lineRange,
                        path: this.filePath,
                        name: functionName,
                        used: false,
                        scan: false
                    };
                }
            }
        });

        // 列印出所有函數名稱和行數
        // console.log('Found functions:', this.objectOfFunctions);

        return this.objectOfFunctions; // 返回收集到的函數
    }
}
