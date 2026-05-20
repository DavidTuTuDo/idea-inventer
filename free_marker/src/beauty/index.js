import fs from "fs";
import path from "path";
import { exec } from "child_process";
import { promisify } from "util";
import _ from "lodash";
import { utiller as Util } from "utiller"

const execAsync = promisify(exec);

export default class PrettierRunner {
    /**
     * @param {string} targetPath 要格式化的目錄或檔案路徑
     */
    constructor(targetPath = "./src") {
        this.targetPath = targetPath;
        this.supportedExtensions = /\.(js|ts|jsx|tsx|json|css|scss|md|html|less)$/;
    }

    /**
     * 取得所有支援的檔案 (支援單一檔案或目錄遞迴)
     */
    getAllFiles(dirPath) {
        // 1. 防呆：檢查路徑是否存在
        if (!fs.existsSync(dirPath)) {
            console.warn(`⚠️ 找不到指定路徑: ${dirPath}`);
            return [];
        }

        const stat = fs.statSync(dirPath);

        // 2. 新增邏輯：如果傳入的本身就是一個檔案，驗證副檔名後直接回傳
        if (stat.isFile()) {
            return this.supportedExtensions.test(dirPath) ? [dirPath] : [];
        }

        // 3. 如果是目錄，執行遞迴尋找
        let results = [];
        for (const item of fs.readdirSync(dirPath)) {
            const fullPath = path.join(dirPath, item);
            const childStat = fs.statSync(fullPath);

            if (childStat.isDirectory()) {
                results = results.concat(this.getAllFiles(fullPath));
            } else if (this.supportedExtensions.test(fullPath)) {
                results.push(fullPath);
            }
        }

        return results;
    }

    /**
     * 分批執行 prettier --write
     * @param {number} batchSize 每批要處理幾個檔案
     */
    async formatAll(batchSize = 500) {
        const targetFiles = this.getAllFiles(this.targetPath);

        if (Util.isEmpty(targetFiles)) {
            console.log(`📂 沒有找到可格式化的檔案於 ${this.targetPath}`);
            return;
        }

        console.log(`✨ Prettier 將格式化 ${targetFiles.length} 筆檔案，分批大小為 ${batchSize}...`);

        const fileBatches = _.chunk(targetFiles, batchSize);
        const root = path.resolve("./");
        const prettierOptions = [
            "--config", `${root}/.prettierrc.json`,
            "--write"
        ];

        for (const [i, batch] of fileBatches.entries()) {
            const fileList = batch.map((f) => `"${f}"`).join(" ");
            console.log(`📦 處理第 ${i + 1} 批，共 ${fileBatches.length} 批，檔案數：${batch.length}`);

            try {
                const { stdout, stderr } = await execAsync(`npx prettier ${prettierOptions.join(" ")} ${fileList}`);
                if (stdout) console.log(stdout);
                if (stderr) console.error(stderr);
            } catch (error) {
                console.error("❌ Prettier 發生錯誤：", error.message);
            }
        }

        console.log("✅ 所有檔案已完成格式化。");
    }
}
