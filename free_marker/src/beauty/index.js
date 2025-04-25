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
   * 執行 prettier --write
   */
  async formatAll() {
    const allFiles = this.getAllFiles(this.targetPath);

    if (_.isEmpty(allFiles)) {
      console.log(`📂 沒有找到可格式化的檔案於 ${this.targetPath}`);
      return;
    }

    const fileList = allFiles.map(f => `"${f}"`).join(' ');
    console.log(`✨ Prettier 將格式化 ${allFiles.length} 筆檔案...`);

    try {
      const { stdout, stderr } = await execAsync(`npx prettier --write ${fileList}`);
      if (stdout) console.log(stdout);
      if (stderr) console.error(stderr);
    } catch (error) {
      console.error('❌ Prettier 發生錯誤：', error.message);
    }
  }
}
