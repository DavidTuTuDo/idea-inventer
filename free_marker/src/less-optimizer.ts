import { promises as fs } from 'fs';
import * as path from 'path';

export default class LessOptimizer {
    private filePath: string;
    private referencedClasses: Set<string> = new Set();

    constructor(filePath: string) {
        this.filePath = filePath;
    }

    public async process(): Promise<void> {
        try {
            if (!this.filePath) throw new Error('請提供檔案位置參數！');

            const ext: string = path.extname(this.filePath).toLowerCase();
            if (ext !== '.less') throw new Error(`檔案 [${this.filePath}] 不是 .less 格式！`);

            console.log(`⏳ 正在讀取並處理：${this.filePath} ...`);
            const code: string = await fs.readFile(this.filePath, 'utf8');

            const optimizedCode: string = this._optimize(code);

            // 直接將優化後的程式碼寫回原本的路徑覆寫
            await fs.writeFile(this.filePath, optimizedCode, 'utf8');
            console.log(`✅ 減肥成功！已直接覆蓋原始檔案：${this.filePath}`);

        } catch (error: unknown) {
            if (error instanceof Error && (error as any).code === 'ENOENT') {
                console.error(`❌ 錯誤：找不到檔案 [${this.filePath}]！請確認路徑。`);
            } else if (error instanceof Error) {
                console.error(`❌ 執行發生例外: ${error.message}`);
            } else {
                console.error(`❌ 發生未知的錯誤:`, error);
            }
        }
    }

    private _optimize(content: string): string {
        if (!content) return '';

        // 1. 拔除所有註解
        const cleanContent: string = this._removeComments(content);
        // 2. 蒐集有免死金牌的 class
        this._collectReferences(cleanContent);

        // 3. 進入遞迴清洗引擎
        let result: string = this._processBlocks(cleanContent);

        // 4. 格式美化 (壓縮多餘空行)
        result = result.replace(/^[ \t]+$/gm, '');
        result = result.replace(/\n{3,}/g, '\n\n');

        return result.trim() + '\n';
    }

    private _removeComments(content: string): string {
        let text: string = content.replace(/\/\*[\s\S]*?\*\//g, '');
        text = text.replace(/(?<!:)\/\/.*$/gm, '');
        return text;
    }

    private _collectReferences(content: string): void {
        this.referencedClasses.clear();
        const refRegex: RegExp = /:extend\(\s*\.([a-zA-Z0-9_-]+)[^)]*\)|\.([a-zA-Z0-9_-]+)\s*(?:\([^)]*\))?\s*;/g;
        for (const match of content.matchAll(refRegex)) {
            if (match[1]) this.referencedClasses.add(match[1]);
            if (match[2]) this.referencedClasses.add(match[2]);
        }
    }

    /**
     * 🌟 全新遞迴解析引擎：能完美分辨 CSS 屬性與巢狀區塊，由內而外清洗
     */
    private _processBlocks(content: string): string {
        let result: string = '';
        let currentBlock: string = '';
        let braceLevel: number = 0;
        let outOfBlock: string = '';

        let inString: boolean = false;
        let stringChar: string = '';

        for (let i = 0; i < content.length; i++) {
            const char: string = content[i];

            // 字串防護，確保不把 content: "{}" 誤認為區塊起點
            if (!inString && (char === '"' || char === "'")) {
                inString = true;
                stringChar = char;
            } else if (inString && char === stringChar) {
                if (i > 0 && content[i - 1] !== '\\') inString = false;
            }

            if (!inString && char === '{') {
                if (braceLevel === 0) {
                    let lastSemicolon: number = -1;
                    let tempInString: boolean = false;
                    let tempStringChar: string = '';
                    let bracketLevel: number = 0;

                    // 尋找最後一個「真正的分號」來保護前面正常的 CSS 屬性或全域變數
                    for (let j = 0; j < outOfBlock.length; j++) {
                        const c = outOfBlock[j];
                        if (!tempInString && (c === '"' || c === "'")) {
                            tempInString = true;
                            tempStringChar = c;
                        } else if (tempInString && c === tempStringChar) {
                            tempInString = false;
                        } else if (!tempInString && c === '[') {
                            bracketLevel++;
                        } else if (!tempInString && c === ']') {
                            bracketLevel--;
                        } else if (!tempInString && bracketLevel === 0 && c === ';') {
                            lastSemicolon = j;
                        }
                    }

                    if (lastSemicolon !== -1) {
                        result += outOfBlock.substring(0, lastSemicolon + 1);
                        currentBlock = outOfBlock.substring(lastSemicolon + 1) + '{';
                    } else {
                        currentBlock = outOfBlock + '{';
                    }
                    outOfBlock = '';
                } else {
                    currentBlock += '{';
                }
                braceLevel++;

            } else if (!inString && char === '}') {
                braceLevel--;
                if (braceLevel === 0) {
                    currentBlock += '}';

                    // 擷取並【遞迴清洗】這個大括號裡面的所有內容
                    const innerContent: string = currentBlock.slice(currentBlock.indexOf('{') + 1, -1);
                    const cleanedInner: string = this._processBlocks(innerContent);

                    // 如果清洗過後的內容長度為空，代表這是一個空區塊
                    const isEmpty: boolean = cleanedInner.trim().length === 0;

                    // 判斷這個區塊是不是 .ClassName
                    const headerMatch: RegExpMatchArray | null = currentBlock.match(/^([\s\S]*?\.([a-zA-Z0-9_-]+)[\s\S]*?)\{/);

                    if (headerMatch) {
                        const header: string = headerMatch[1];
                        const className: string = headerMatch[2];
                        const isReferenced: boolean = this.referencedClasses.has(className);
                        const hasExtend: boolean = header.includes(':extend');

                        if (isEmpty && !isReferenced && !hasExtend) {
                            result += '\n'; // 條件1：本身是空的且沒有免死金牌，整段刪掉
                        } else {
                            // 保留下來，並且拼湊「已經被清洗乾淨的內容 (cleanedInner)」
                            const startIdx = currentBlock.indexOf('{') + 1;
                            const prefix = currentBlock.slice(0, startIdx);
                            result += prefix + cleanedInner + '}';
                        }
                    } else {
                        // 非 Class 區塊 (例如 @media, 或是 &)
                        if (isEmpty) {
                            result += '\n'; // 條件4：空值的 {} 直接刪掉
                        } else {
                            const startIdx = currentBlock.indexOf('{') + 1;
                            const prefix = currentBlock.slice(0, startIdx);
                            result += prefix + cleanedInner + '}';
                        }
                    }
                    currentBlock = '';
                } else {
                    currentBlock += '}';
                }
            } else {
                if (braceLevel === 0) {
                    outOfBlock += char; // 蒐集括號外部的字元 (包含 CSS 屬性)
                } else {
                    currentBlock += char;
                }
            }
        }

        result += outOfBlock;
        return result;
    }
}
