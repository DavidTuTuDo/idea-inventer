import fs from 'fs/promises';
import _ from 'lodash';

export default class ImportCleaner {
    constructor(filePath) {
        this.filePath = filePath;
        this.lines = [];
        this.imports = [];
        this.cleanedLines = [];
        this.annotationLine = null;
        this.firstNonImportCodeLine = null;
        this.listOfWhite = ['React']; // 白名單，這些變數的 import 不會被刪除
        this.removedImports = [];     // 儲存被刪除的 import 原始內容
    }

    async clean() {
        await this.loadFile();
        this.findFirstAnnotationOrCode();
        this.extractImports();
        const usedVars = this.detectUsedVariables();
        this.rewriteImports(usedVars);
        await this.writeCleanedFile();

        return {
            [this.filePath]: this.removedImports
        };
    }

    async loadFile() {
        const content = await fs.readFile(this.filePath, 'utf-8');
        this.lines = content.split('\n');
    }

    findFirstAnnotationOrCode() {
        // 找出第一個不是 import 的程式碼行數（遇到 @ 或 class）
        this.annotationLine = this.lines.findIndex(line => /^\s*@/.test(line));
        const firstCodeLine = this.lines.findIndex(line =>
            /^(\s*@|\s*class\s+|\s*(?:async\s+)?function\s+|\s*const\s+|\s*let\s+|\s*var\s+)/.test(line)
        );

        this.firstNonImportCodeLine =
            this.annotationLine >= 0 && firstCodeLine >= 0
                ? Math.min(this.annotationLine, firstCodeLine)
                : Math.max(this.annotationLine, firstCodeLine);

        if (this.firstNonImportCodeLine === -1) {
            this.firstNonImportCodeLine = this.lines.length;
        }
    }

    extractImports() {
        const lines = this.lines;
        let currentImport = '';
        let startLine = null;

        lines.forEach((line, index) => {
            if (index >= this.firstNonImportCodeLine) return;
            if (/^\s*import\b/.test(line)) {
                if (currentImport) {
                    this.imports.push({start: startLine, end: index - 1, code: currentImport});
                }
                currentImport = line;
                startLine = index;
                if (/;\s*$/.test(line)) {
                    this.imports.push({start: startLine, end: index, code: currentImport});
                    currentImport = '';
                    startLine = null;
                }
            } else if (currentImport) {
                currentImport += '\n' + line;
                if (/;\s*$/.test(line)) {
                    this.imports.push({start: startLine, end: index, code: currentImport});
                    currentImport = '';
                    startLine = null;
                }
            }
        });
        if (currentImport) {
            this.imports.push({start: startLine, end: this.firstNonImportCodeLine - 1, code: currentImport});
        }
    }

    detectUsedVariables() {
        const fullCodeExcludingImports = this.lines
            .filter((line, index) => !this.imports.some(imp => index >= imp.start && index <= imp.end))
            .join('\n');

        const usedVars = new Set();

        this.imports.forEach(imp => {
            const cleanedCode = imp.code.replace(/\n/g, ' ');
            const matches = cleanedCode.match(/import\s+([\s\S]+?)\s+from\s+["'][^"']+["']/);
            if (!matches) return;
            const rawVars = matches[1].trim();
            let vars = [];

            if (rawVars.startsWith('{')) {
                vars = rawVars
                    .slice(1, -1)
                    .split(',')
                    .map(x => x.trim().split(' as ').pop().trim());
            } else if (rawVars.includes(' as ')) {
                vars = [rawVars.split(' as ').pop().trim()];
            } else {
                vars = [rawVars];
            }

            vars.forEach(v => {
                const regex = new RegExp(`\\b${_.escapeRegExp(v)}\\b`, 'g');
                if (regex.test(fullCodeExcludingImports)) {
                    usedVars.add(v);
                }
            });
        });

        return usedVars;
    }

    rewriteImports(usedVars) {
        const lines = [...this.lines];

        this.imports.forEach(imp => {
            const rawLines = lines.slice(imp.start, imp.end + 1).join('\n');
            const cleanedCode = rawLines.replace(/\n/g, ' ');
            const match = cleanedCode.match(/import\s+([\s\S]+?)\s+from\s+(["'][^"']+["']);?/);
            if (!match) return;

            const [full, bindingPart, source] = match;
            const isDestructured = bindingPart.trim().startsWith('{');
            const vars = isDestructured
                ? bindingPart
                    .trim()
                    .slice(1, -1)
                    .split(',')
                    .map(x => x.trim())
                    .filter(Boolean)
                : [bindingPart.trim()];

            // 檢查是否在白名單中
            const whiteListedVars = vars.filter(v => this.listOfWhite.includes(v));

            // 如果白名單變數存在，不進行刪除處理
            if (whiteListedVars.length > 0) {
                return;
            }

            const kept = vars.filter(v => {
                const alias = v.includes(' as ') ? v.split(' as ')[1].trim() : v;
                return usedVars.has(alias);
            });

            if (kept.length === 0) {
                // 全部未使用 -> 刪除整段 import
                this.removedImports.push(rawLines.trim());
                for (let i = imp.start; i <= imp.end; i++) {
                    lines[i] = null;
                }
                return;
            }

            // 重寫 import 保留使用到的
            let newImport = '';
            if (isDestructured) {
                newImport = `import { ${kept.join(', ')} } from ${source};`;
            } else {
                newImport = `import ${kept[0]} from ${source};`;
            }

            if (newImport !== rawLines.trim()) {
                this.removedImports.push(rawLines.trim());
            }

            lines[imp.start] = newImport;
            for (let i = imp.start + 1; i <= imp.end; i++) {
                lines[i] = null;
            }
        });

        this.cleanedLines = lines.filter(line => line !== null);
    }

    async writeCleanedFile() {
        const newContent = this.cleanedLines.join('\n');
        await fs.writeFile(this.filePath, newContent, 'utf-8');
    }
}
