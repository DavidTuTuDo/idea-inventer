import fs from 'fs';
import path from 'path';
import { exec } from 'child_process';
import { promisify } from 'util';
import _ from 'lodash';

const execAsync = promisify(exec);

export default class PrettierRunner {
  /**
   * @param {string} targetPath 要格式化的目錄
   */
  constructor(targetPath = './src') {
    this.targetPath = targetPath;
    this.supportedExtensions = /\.(js|ts|jsx|tsx|json|css|scss|md|html)$/;
  }

  /**
   * 遞迴取得所有支援的檔案
   */
  getAllFiles(dirPath) {
    let results = [];

    for (const item of fs.readdirSync(dirPath)) {
      const fullPath = path.join(dirPath, item);
      const stat = fs.statSync(fullPath);

      if (stat.isDirectory()) {
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
    const allFiles = this.getAllFiles(this.targetPath);

    if (_.isEmpty(allFiles)) {
      console.log(`📂 沒有找到可格式化的檔案於 ${this.targetPath}`);
      return;
    }

    const targetFiles = _.filter(allFiles, (file) => !file.endsWith('.less'));

    if (_.isEmpty(targetFiles)) {
      console.log(`📂 沒有找到可格式化的檔案（排除 .less）於 ${this.targetPath}`);
      return;
    }

    console.log(`✨ Prettier 將格式化 ${targetFiles.length} 筆檔案（已排除 .less），分批大小為 ${batchSize}...`);

    const fileBatches = _.chunk(targetFiles, batchSize);

    for (const [i, batch] of fileBatches.entries()) {
      const fileList = batch.map((f) => `"${f}"`).join(' ');
      console.log(`📦 處理第 ${i + 1} 批，共 ${fileBatches.length} 批，檔案數：${batch.length}`);

      const prettierOptions = [
        '--write',
        '--bracket-same-line',
        '--print-width 180',
        '--trailing-comma none',
        '--tab-width 4'
      ];

      try {
        const { stdout, stderr } = await execAsync(`npx prettier ${prettierOptions.join(' ')} ${fileList}`);
        if (stdout) console.log(stdout);
        if (stderr) console.error(stderr);
      } catch (error) {
        console.error('❌ Prettier 發生錯誤：', error.message);
      }
    }

    console.log('✅ 所有檔案已完成格式化。');
  }
}
