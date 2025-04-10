import fs from 'fs/promises';
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
        this.files = []; // 檔案路徑集合
        this.listOfAnalysis = [];
        this.objectOfUsageAnalysis = {};
        this.listOfHack = [];
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
            const obj = await new collector(_path).collectFunctions();

            ['fetch', 'initial'].forEach(key => obj[key] && this.listOfHack.push({...obj[key], functionName: key}));
            this.objectOfFunctions = {...this.objectOfFunctions, ...obj}
        }
        await Util.persistJsonFilePrettier('./temp/all_function.json', this.objectOfFunctions)
    }


    /**
     * 從指定字串中找出 .xxx(...) 或 .xxx(...) 的函式名稱
     * @param {string} input
     * @returns {string[]} 函式名稱陣列
     *
     * sample:
     * const str = `client.functionNameA(
     * admin.functionNameB(`;
     * const result = extractFunctionNames(str);
     * console.log(result); // ['functionNameA', 'functionNameB']
     */
    extractFunctionNames = (input) => {
        const regex = /\b(\w+)\s*\(/g;
        const matches = [];

        let match;
        while ((match = regex.exec(input)) !== null) {
            matches.push(match[1]); // 只取 function name
        }

        return _.uniq(matches); // 去重複（如果你需要）
    }


    /**
     * 擷取 JS 檔案指定行數的原始字串（含換行與跳脫字元）
     * @param {{ path: string, lineRange: [number, number] }} target
     * @returns {Promise<string>}
     */
    extractLinesFromFile = async (target) => {
        const {path: filePath, lineRange} = target;
        const [startLine, endLine] = lineRange;
        const content = await fs.readFile(filePath, 'utf-8');
        const lines = content.split('\n');

        // 使用 lodash 取出範圍內行（注意行號為 1-based）
        const selectedLines = _.slice(lines, startLine - 1, endLine);
        return selectedLines.join('\n'); // 保留換行字元
    }

    // 檢查每個檔案中是否有呼叫函式
    scanUsage = async () => {
        const self = this;

        async function modifyObjectState(func, from) {
            if (!func || _.isUndefined(func.lineRange)) return;

            const content = await self.extractLinesFromFile(func);
            // console.log(" content ==> ",content);
            const referencedNames = self.extractFunctionNames(content);
            // console.log("referencedNames ==> ",referencedNames);

            _(referencedNames)
                .filter((refName) => _.has(self.objectOfFunctions, refName))
                .forEach((refName) => {
                    Util.appendMapOfKeyArray(self.objectOfUsageAnalysis, refName, func.path);
                    delete self.objectOfFunctions[refName];
                });

            func.done = true;
            // 遞迴處理引用的 function
            if (!_.isEmpty(referencedNames)) {
                await analyzeFunctionUsage(referencedNames, from);
            }
        }

        async function analyzeFunctionUsage(keywordsOfUsage, from) {

            if (from) console.log(`analyzeFunctionUsage 從${from}裡找到了 ${JSON.stringify(keywordsOfUsage)}`)

            for (const keyword of keywordsOfUsage) {
                const func = _.get(self.objectOfFunctions, keyword);
                if (!func || _.isUndefined(func.lineRange)) continue;
                await modifyObjectState(func, from);
            }
        }

        /**
         * 手動刪除一些會造成網頁錯誤的必存method()
         * // ['hasNoticeDialog', 'getContentType', 'getObjectOfMulti', '_firebase','Alert'] 用於base/*
         */

        ['constructor', 'getRenderView', 'data', 'columnData', 'clean',  'handleCommitment'].forEach(key => delete this.objectOfFunctions[key]);
        _.keys(this.objectOfFunctions).filter(k => /^normalize/.test(k)).forEach(k => delete this.objectOfFunctions[k]);
        _.keys(this.objectOfFunctions).filter(k => /Conditions$/.test(k)).forEach(k => delete this.objectOfFunctions[k]);

        for (const file of this.files) {
            const _path = path.resolve(this.srcPath, file)

            const regexPatternsCheckUsage = [
                /\/(base|i18n)\/[^/]+\.js$/,                      // .../base/*.js or .../i18n/*.js
                /\/(component|router)\/[^/]+\/[^/]+\.js$/,          // .../component/*/*.js or .../router/*/*.js
                /\/(store|config)\/[^/]+\/index\.js$/,              // .../store/*/index.js or .../config/*/index.js
                /\/store\/[^/]+\/Modularized.*\.js$/,              // .../store/*/Modularized*.js
                /\/src\/index\.js$/,                               // .../src/index.js
                /\/src\/BaseApp\.js$/,                             // .../src/BaseApp.js
                /\/store\/index\.js$/,                             // .../store/index.js
            ];


            if (!regexPatternsCheckUsage.some(regex => regex.test(_path))) {
                console.log(`📄 不納入分析匹配：${_path}`);
                continue
            }
            console.log(`📄 正在分析檔案：${_path}`);
            const content = await fs.readFile(_path, 'utf-8');

            const keywordsOfUsage = _.filter(_.keys(this.objectOfFunctions), keyword => new RegExp(`\\.${keyword}\\(`, 'g').test(content));
            // console.log(`keyword ==>` ,keywordsOfUsage);
            await analyzeFunctionUsage.call(this, keywordsOfUsage);
            keywordsOfUsage.forEach(key => Util.appendMapOfKeyArray(this.objectOfUsageAnalysis, key, _path));
            keywordsOfUsage.forEach(key => delete this.objectOfFunctions[key]);
        }
        this.listOfHack.forEach(func => modifyObjectState(func));
    }

    saveAnalyzedReportAsJSON = async (object, filePath) => {
        const entriesWithNames = _.map(object, (value, key) => ({
            ...value,
            name: key
        }));

        // 2. 根據 path 分組
        const groupedByPath = _.groupBy(entriesWithNames, 'path');

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
        await Util.persistJsonFilePrettier(filePath, this.listOfAnalysis)
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
                const content = await fs.readFile(filePath, 'utf-8');
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

    saveUsedAnalyzedReportAsJSON = async (object, path) => {
        await Util.persistJsonFilePrettier(path, object);
    }

    async fileImportRemover() {
        for (const file of this.files) {
            const _path = path.resolve(this.srcPath, file)
            console.log(`📄 正在清除沒用到的import檔案：${_path}`);
            const cleaner = new dissimport(_path);
            await cleaner.clean();
        }

    }

    // 執行所有流程
    async run() {
        await this.init();
        // await this.buildFunctionGraph();
        // await this.scanUsage();
        // await Util.persistJsonFilePrettier('./temp/unused_functions.json', this.objectOfFunctions);
        // await Util.persistJsonFilePrettier('./temp/list_of_fetch.json', this.listOfHack);
        // await this.saveAnalyzedReportAsJSON(this.objectOfFunctions, './temp/list_of_analysis.json');
        // await this.saveUsedAnalyzedReportAsJSON(this.objectOfUsageAnalysis, './temp/map_of_usage.json');
        // await this.cleanMultipleJsFilesAsync(this.listOfAnalysis);
        await this.fileImportRemover()
    }
}
