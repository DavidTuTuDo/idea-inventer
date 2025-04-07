import fs from 'fs/promises';
import collector from '../lean/collector';
import path from 'path';
import { glob } from 'glob';
import _ from 'lodash';

export default class Lean {
    constructor(srcPath) {
        this.srcPath = path.resolve(srcPath);
        this.objectOfFunctions = {}; // 存儲函式名稱及其資訊
        this.files = []; // 檔案路徑集合

    }


    // 初始化，取得所有檔案的路徑
    async init() {
        this.files = await glob(`${this.srcPath}/**/*.js`, { absolute: true });
        console.log('🗂️ 開始處理檔案...');
    }

    // 彙整所有 JS 檔案中的 class 方法資訊
    async buildFunctionGraph() {
        for (const file of this.files) {
            const _path = path.resolve(this.srcPath, file)
            console.log(`📄 正在收集檔案：${_path}`);
            const obj = await new collector(_path).collectFunctions();
            this.objectOfFunctions = { ...this.objectOfFunctions, ...obj}
        }
    }

    // 檢查每個檔案中是否有呼叫函式
    async scanUsage() {
        for (const file of this.files) {
            const _path = path.resolve(this.srcPath, file)

            const regexPatterns = [
                /\/component\/[^/]+\/[^/]+\.js$/,          // 匹配 .../component/*/*.js
                /\/store\/[^/]+\/index\.js$/,              // 匹配 .../store/*/index.js
                /\/store\/[^/]+\/Modularized.*\.js$/       // 匹配 .../store/*/Modularized*.js
            ];

            if(!regexPatterns.some(regex => regex.test(_path))) {
                console.log(`📄 不匹配：${_path}`);
                continue
            }
            console.log(`📄 正在分析檔案：${_path}`);
            const content = await fs.readFile(_path, 'utf-8');
            const keywordsOfUsage = _.keys(this.objectOfFunctions).filter(keyword => content.includes(`.${keyword}(`));
            keywordsOfUsage.forEach(key => delete this.objectOfFunctions[key]);
        }
    }

    saveObjectAsJSON = async (object, filePath) => {
        try {
            // 將物件轉換為格式化的 JSON 字串
            const jsonString = JSON.stringify(object, null, 2);
            // 確保資料夾存在
            await fs.mkdir('./temp', { recursive: true });
            // 儲存為檔案
            await fs.writeFile(filePath, jsonString);
            console.log(`✅ JSON 檔案已儲存為 ${filePath}`);
        } catch (err) {
            console.error('❌ 寫檔錯誤:', err);
        }
    };

    // 執行所有流程
    async run() {
        await this.init();
        await this.buildFunctionGraph();
        await this.scanUsage();
        await this.saveObjectAsJSON(this.objectOfFunctions,'./temp/unused.json');
    }
}
