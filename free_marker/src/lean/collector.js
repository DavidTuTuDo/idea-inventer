import fs from 'fs/promises';
import path from 'path';
import * as parser from '@babel/parser';
import traverse from '@babel/traverse';

export default class FunctionCollector {
    constructor(filePath) {
        this.filePath = path.resolve(filePath); // 絕對路徑
        this.objectOfFunctions = {}; // 儲存所有函式名稱和行數
    }

    // 解析代碼
    parseCode(code) {
        return parser.parse(code, {
            sourceType: 'module',
            plugins: ['jsx', 'classProperties', 'asyncGenerators', 'objectRestSpread', 'decorators-legacy'],
        });
    }

    // 彙整類別中的所有函數
    async collectFunctions() {
        const code = await fs.readFile(this.filePath, 'utf-8'); // 讀取檔案內容
        const ast = this.parseCode(code); // 解析成AST

        // 使用traverse遍歷AST
        traverse(ast, {
            ClassMethod: (path) => {
                const functionName = path.node.key.name;
                const lineRange = [path.node.loc.start.line, path.node.loc.end.line];
                this.objectOfFunctions[functionName] = {
                    lineRange,
                    path: this.filePath,
                };
            },
            FunctionDeclaration: (path) => {
                const functionName = path.node.id.name;
                const lineRange = [path.node.loc.start.line, path.node.loc.end.line];
                this.objectOfFunctions[functionName] = {
                    lineRange,
                    path: this.filePath,
                };
            },
            ArrowFunctionExpression: (path) => {
                if (path.parent.type === 'VariableDeclarator') {
                    const functionName = path.parent.id.name;
                    const lineRange = [path.node.loc.start.line, path.node.loc.end.line];
                    this.objectOfFunctions[functionName] = {
                        lineRange,
                        path: this.filePath,
                    };
                }
            },
            FunctionExpression: (path) => {
                if (path.parent.type === 'VariableDeclarator') {
                    const functionName = path.parent.id.name;
                    const lineRange = [path.node.loc.start.line, path.node.loc.end.line];
                    this.objectOfFunctions[functionName] = {
                        lineRange,
                        path: this.filePath,
                    };
                }
            },
            'ArrowFunctionExpression|FunctionDeclaration|FunctionExpression': (path) => {
                // 這裡會處理函數類型
                // 同樣的處理邏輯對於箭頭函數、函數聲明和函數表達式
                const functionName = path.node.id ? path.node.id.name : 'anonymous';
                const lineRange = [path.node.loc.start.line, path.node.loc.end.line];
                if (functionName !== 'anonymous') {
                    this.objectOfFunctions[functionName] = {
                        lineRange,
                        path: this.filePath,
                    };
                }
            }
        });

        // 列印出所有函數名稱和行數
        // console.log('Found functions:', this.objectOfFunctions);

        return this.objectOfFunctions; // 返回收集到的函數
    }
}
