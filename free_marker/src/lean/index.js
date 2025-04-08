import fs from 'fs/promises';
import collector from '../lean/collector';
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
        this.objectOfUsageAnalysis = {}

    }


    // 初始化，取得所有檔案的路徑
    async init() {
        this.files = await glob(`${this.srcPath}/**/*.js`, {absolute: true});
        console.log('🗂️ 開始處理檔案...');
    }

    // 彙整所有 JS 檔案中的 class 方法資訊
    async buildFunctionGraph() {
        for (const file of this.files) {
            const _path = path.resolve(this.srcPath, file)
            console.log(`📄 正在收集檔案：${_path}`);
            const obj = await new collector(_path).collectFunctions();
            this.objectOfFunctions = {...this.objectOfFunctions, ...obj}
        }
        await Util.persistJsonFilePrettier('./temp/all_function.json',this.objectOfFunctions)
    }

    // 檢查每個檔案中是否有呼叫函式
    async scanUsage() {
        for (const file of this.files) {
            const _path = path.resolve(this.srcPath, file)

            const regexPatterns = [
                /\/component\/[^/]+\/[^/]+\.js$/,            // .../component/*/*.js
                /\/store\/[^/]+\/index\.js$/,                // .../store/*/index.js
                /\/store\/[^/]+\/Modularized.*\.js$/,        // .../store/*/Modularized*.js
                /\/src\/index\.js$/,                         // .../src/index.js
                /\/src\/BaseApp\.js$/,                       // .../src/BaseApp.js
                /\/store\/index\.js$/                        // .../store/index.js
            ];


            if (!regexPatterns.some(regex => regex.test(_path))) {
                console.log(`📄 不匹配：${_path}`);
                continue
            }
            console.log(`📄 正在分析檔案：${_path}`);
            const content = await fs.readFile(_path, 'utf-8');
            const keywordsOfUsage = _.keys(this.objectOfFunctions).filter(keyword => content.includes(`.${keyword}(`));
            keywordsOfUsage.forEach(key => Util.appendMapOfKeyArray(this.objectOfUsageAnalysis, key, _path));
            keywordsOfUsage.forEach(key => delete this.objectOfFunctions[key]);

            delete this.objectOfFunctions['constructor'];
            delete this.objectOfFunctions['getRenderView'];
        }
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

            // 產生 lines（展開每一組 range，例如 [301,303] -> [301,302,303]）
            const linesExpanded = _(items)
                .flatMap(({lineRange}) => _.range(lineRange[0], lineRange[1] + 1))
                .uniq()
                .sortBy()
                .value();

            return {path, lineRange, names, lines: linesExpanded};
        });
        await Util.persistJsonFilePrettier(filePath, this.listOfAnalysis)
    }

    cleanFilesByAnalyze = async (analyze) => {
        for (const {path, lines} of analyze) {
            try {
                const content = await fs.readFile(path, 'utf8');
                const allLines = content.split('\n');

                const cleaned = _(allLines)
                    .map((line, index) => ({line, index: index + 1})) // 行號從 1 開始
                    .filter(({index}) => !lines.includes(index))
                    .map('line')
                    .value();

                await fs.writeFile(path, cleaned.join('\n'), 'utf8');
                console.log(`✅ 已清理: ${path}`);
            } catch (error) {
                console.error(`❌ 無法處理檔案: ${path}`, error);
            }
        }
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

    // 執行所有流程
    async run() {
        await this.init();
        await this.buildFunctionGraph();
        await this.scanUsage();
        await Util.persistJsonFilePrettier('./temp/unused_functions.json', this.objectOfFunctions);
        await this.saveAnalyzedReportAsJSON(this.objectOfFunctions, './temp/list_of_analysis.json');
        await this.saveUsedAnalyzedReportAsJSON(this.objectOfUsageAnalysis, './temp/map_of_usage.json');
        // await this.cleanFilesByAnalyze(this.listOfAnalysis);
    }
}
