import collector from './collector';
import dissimport from './dissimport'
import path from 'path';
import {glob} from 'glob';
import _ from 'lodash';
import {utiller as Util} from 'utiller';

export default class Lean {
    constructor(srcPath) {
        this.srcPath = path.resolve(srcPath);
        this.objectOfFunctions = {}; // 存儲函式名稱及其資訊
        this.listOfFunctions = []; // 存儲函式名稱及其資訊
        this.files = []; // 檔案路徑集合
        this.listOfAnalysis = [];
        this.listOfCleanImport = {};
        this.contentsOfFiles = {};
    }

    // 初始化，取得所有檔案的路徑
    async init() {
        this.files = await glob(`${this.srcPath}/**/*.js`, {absolute: true});
        Util.cleanAllFiles('./temp')
        console.log('🗂️ 開始處理檔案...');
    }

    // 彙整所有 JS 檔案中的 class 方法資訊
    async buildFunctionGraph() {
        for (const file of this.files) {
            const _path = path.resolve(this.srcPath, file)

            /** base/* 不列入收集function名單 */
            const regexPatternsOfAncestorFunction = [
                /\/(base|i18n)\/[^/]+\.js$/,                      // .../base/*.js or .../i18n/*.js
                /\/(store|config|component)\/[^/]+\/index\.js$/  // .../store/*/index.js or .../config/*/index.js or .../component/*/index.js
            ];


            if (regexPatternsOfAncestorFunction.some(regex => regex.test(_path))) {
                console.log(`📄 不納入收集function匹配：${_path}`);
                continue
            }

            console.log(`📄 正在收集function檔案：${_path}`);
            const obj = await new collector(_path, await Util.readFileContentByPath(_path, this.contentsOfFiles)).collectFunctions();
            this.objectOfFunctions = {...this.objectOfFunctions, ...obj}
        }
        this.listOfFunctions = this.objectToArrayWithKeyField(this.objectOfFunctions);
        _.filter(this.listOfFunctions, (each) => ['fetch', 'initial', 'clean'].includes(each.name)).forEach((func) => func.recursive = true)
        await Util.persistJsonFilePrettier('./temp/list_of_function.json', this.listOfFunctions)
    }

    /**
     * 將物件轉成陣列，並將每個 key 存進 value 的指定欄位名
     * @param {Object} obj - 原始物件
     * @param {string} keyName - 要存放原始 key 的欄位名稱，預設為 'sign'
     * @returns {Array} - 轉換後的陣列
     *
     * const obj = {
     *   a: { c: 3 },
     *   b: { c: 4 }
     * };
     *
     * const result1 = objectToArrayWithKeyField(obj);
     * // 👉 [ { c: 3, sign: 'a' }, { c: 4, sign: 'b' } ]
     *
     * const result2 = objectToArrayWithKeyField(obj, 'id');
     * // 👉 [ { c: 3, id: 'a' }, { c: 4, id: 'b' } ]
     */
    objectToArrayWithKeyField = (obj, keyName = 'sign') => {
        const list = _.map(obj, (value, key) => ({
            ...value,
            [keyName]: key
        }));
        return _.compact(list);
    };


    /**
     * 從指定字串中找出 .xxx(...) 或 .xxx(...) 的函式名稱
     * @param {string} input
     * @returns {string[]} 函式名稱陣列
     *
     * const code = `
     *   doSomething();
     *   obj.sayHi;
     *   anotherFunc (123);
     *   obj.log("hi");
     *   this.handleClick
     *   doSomething()
     * `;
     *
     * console.log(extractFunctionNames(code));
     * // 👉 ['doSomething', 'sayHi', 'anotherFunc', 'log', 'handleClick']
     */
    extractFunctionNames = (input) => {
        const matches = [];

        // 捕捉 someFunction( 和 .someFunction
        const regex = /(?:\b|\.)(\w+)\s*\(?/g;

        let match;
        while ((match = regex.exec(input)) !== null) {
            matches.push(match[1]); // 擷取 function 名稱
        }

        return _.uniq(matches); // 去重複
    }


    /**
     * 擷取 JS 檔案指定行數的原始字串（含換行與跳脫字元）
     * @param {{ path: string, lineRange: [number, number] }} target
     * @returns {Promise<string>}
     */
    extractLinesFromFile = async (target) => {
        const {path: filePath, lineRange} = target;
        const [startLine, endLine] = lineRange;
        const content = await Util.readFileContentByPath(filePath, this.contentsOfFiles);
        const lines = content.split('\n');

        // 使用 lodash 取出範圍內行（注意行號為 1-based）
        const selectedLines = _.slice(lines, startLine - 1, endLine);
        return selectedLines.join('\n'); // 保留換行字元
    }

    // 檢查每個檔案中是否有呼叫函式
    scanUsage = async () => {
        const self = this;

        async function modifyObjectState(func, from) {
            if (_.isEqual(true, func.scan)) return;
            const content = await self.extractLinesFromFile(func);
            func.scan = true;
            const referencedNames = self.extractFunctionNames(content);
            func.children = referencedNames.join(' ,');
            if (!_.isEmpty(referencedNames)) {
                const functionsOfReference = _.filter(self.listOfFunctions, (func) => referencedNames.includes(func.name));
                functionsOfReference.forEach(func => func.used = true);
                /**遞迴處理主func（例如：fetch(){ one();a.two();const c = d.three; }）所引用的子func（例如one two, three）*/
                // await analyzeFunctionUsage(functionsOfReference, func.sign);
                functionsOfReference.forEach(async (_func) => await modifyObjectState(_func, func.sign));
            }
        }

        async function analyzeFunctionUsage(functionsOfUsage) {
            const latest = _.filter(functionsOfUsage, (func) => !func.used || !func.scan)
            const keywords = latest.map(each => each.name);
            for (const keyword of keywords) {
                const list = _.filter(self.listOfFunctions, (each) => _.isEqual(each.name, keyword));
                list.forEach(async (func) => await modifyObjectState(func));
            }
        }

        const namesOfMustUsed = ['constructor', 'getRenderView', 'data', 'columnData', 'clean', 'handleCommitment'];
        _.filter(this.listOfFunctions,
            (func) => /^normalize/.test(func.name) | /Conditions$/.test(func.name) | namesOfMustUsed.includes(func.name))
            .forEach((func) => func.used = true);

        for (const file of this.files) {
            const _path = path.resolve(this.srcPath, file)

            const regexPatternsCheckUsage = [
                /\/(base|i18n|router)\/[^/]+\.js$/,                      // .../base/*.js or .../i18n/*.js
                /\/(component)\/[^/]+\/[^/]+\.js$/,          // .../component/*/*.js or .../router/*/*.js
                /\/(store|config)\/[^/]+\/index\.js$/,              // .../store/*/index.js or .../config/*/index.js
                /\/store\/[^/]+\/Modularized.*\.js$/,              // .../store/*/Modularized*.js
                /\/src\/index\.js$/,                               // .../src/index.js
                /\/src\/BaseApp\.js$/,                             // .../src/BaseApp.js
                /\/store\/index\.js$/,                             // .../store/index.js
            ];

            if (!regexPatternsCheckUsage.some(regex => regex.test(_path))) {
                console.log(`📄 不納入分析匹配：${_path}`);
                continue;
            }
            console.log(`📄 正在分析檔案：${_path}`);
            const content = await Util.readFileContentByPath(_path, this.contentsOfFiles);
            // console.log('121321545 content =>',content);
            /** 範例一 const keywordsOfUsage = _.filter(_.keys(this.objectOfFunctions), keyword => new RegExp(\\.${keyword}\\(, 'g').test(content)); => xxx.functionName( */
            const functionsOfUsage = _.filter(this.listOfFunctions, func => new RegExp(`\\.${func.name}\\b`, 'g').test(content));
            /** 與範例一差異在於  ==> xxx.functionName */
            // console.log('121321545 functionsOfUsage =>',functionsOfUsage);

            await analyzeFunctionUsage.call(this, functionsOfUsage);
            functionsOfUsage.forEach(func => func.used = true);
        }
        await analyzeFunctionUsage.call(this, _.filter(this.listOfFunctions, (each) => each.recursive && !each.scan))
    }

    saveAnalyzedReportAsJSON = async (list, destination) => {
        // 2. 根據 path 分組
        const groupedByPath = _.groupBy(list, 'path');

        // 3. 建立整理後的結構
        this.listOfAnalysis = _.map(groupedByPath, (items, path) => {
            const lineRange = _.flatMap(items, 'lineRange');
            const names = _.map(items, 'name');

            // 產生 lines（展開每一組 range，例如 [301,303] -> [300,301,302,303]）300是註解行
            const linesExpanded = _(items)
                .flatMap(({lineRange}) => _.range(lineRange[0] - 1, lineRange[1] + 1))
                .uniq()
                .sortBy()
                .value();

            return {path, lineRange, names, lines: linesExpanded};
        });
        await Util.persistJsonFilePrettier(destination, this.listOfAnalysis)
    }

    cleanMultipleJsFilesAsync = async (targets) => {
        const tasks = targets.map(async ({path: filePath, lines}) => {
            try {
                const exists = await fs.stat(filePath).then(() => true).catch(() => false);
                if (!exists) {
                    console.warn(`⚠️ File not found: ${filePath}`);
                    return;
                }

                // 1. 讀取檔案內容
                const content = await Util.readFileContentByPath(filePath, this.contentsOfFiles);
                let linesArr = content.split('\n');

                // 2. 移除指定行數（轉成 0-based index）
                const lineSet = new Set(lines.map((l) => l - 1));
                linesArr = linesArr.filter((_, index) => !lineSet.has(index));

                // 3. 遞迴移除被空白行包夾的空白行
                const removeSurroundedEmptyLines = (arr) => {
                    let changed = false;
                    const result = arr.filter((line, i, array) => {
                        if (
                            line.trim() === '' &&
                            i > 0 &&
                            i < array.length - 1 &&
                            array[i - 1].trim() === '' &&
                            array[i + 1].trim() === ''
                        ) {
                            changed = true;
                            return false;
                        }
                        return true;
                    });
                    return changed ? removeSurroundedEmptyLines(result) : result;
                };

                linesArr = removeSurroundedEmptyLines(linesArr);

                // 4. 寫回檔案
                await fs.writeFile(filePath, linesArr.join('\n'), 'utf-8');
                console.log(`✅ Cleaned file: ${filePath}`);
            } catch (err) {
                console.error(`❌ Failed to process ${filePath}:`, err);
            }
        });

        await Promise.all(tasks);
    }

    /**
     * 去除物件中每個陣列屬性內的重複值
     * @param {Object} obj - 欲處理的物件
     * @returns {Object} - 處理後的物件
     */
    removeDuplicatesFromObjectArrays = (obj) => {
        return Object.fromEntries(
            Object.entries(obj).map(([key, value]) => [
                key,
                Array.isArray(value) ? _.uniq(value) : value,
            ]));
    }


    fileImportRemover = async () => {
        for (const file of this.files) {
            const _path = path.resolve(this.srcPath, file)
            console.log(`📄 正在清除沒用到的import檔案：${_path}`);
            const cleaner = new dissimport(_path);
            const object = await cleaner.clean();
            this.listOfCleanImport = {...this.listOfCleanImport, ...object};
        }
        await Util.persistJsonFilePrettier('./temp/list_of_clean_import.json', this.listOfCleanImport);
    }

    // 執行所有流程
    async run() {
        await this.init();
        await this.buildFunctionGraph();
        await this.scanUsage();
        await Util.persistJsonFilePrettier('./temp/list_functions_after_scan.json', this.listOfFunctions);
        await this.saveAnalyzedReportAsJSON(_.filter(this.listOfFunctions, (func => _.isEqual(false, func.used))), './temp/list_of_analysis.json');

        /** 以下會更動到目的檔案*/
        await this.cleanMultipleJsFilesAsync(this.listOfAnalysis);
        await this.fileImportRemover()
    }
}
