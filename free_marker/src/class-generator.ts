/**
 * class-generator.ts
 *
 * 功能說明：
 * ClassGenerator 負責產生 JavaScript class 原始碼檔案。
 * 它管理 import 語句、class 宣告、field 區塊、function 區塊的組合與輸出。
 * 支援「快速開發模式」，在 ENABLE_FAST_DEVELOP_MODE 下只更新已變動的檔案。
 *
 * 主要職責：
 * - 依據 signature 標記 (SIGN_OF_FIELD_START, SIGN_OF_FUNCTION_START) 分區管理程式碼
 * - 提供 appendClass, appendField, appendFunction, appendImport 等 API
 * - persist() 將產生的程式碼寫入檔案系統
 * - 支援 singleton 模式、index file 產生、signature 合併
 */

import { exceptioner as ERROR, utiller as Util } from "utiller";
import _ from "lodash";
import fs from "fs";
import libpath from "path";
import mustache from "mustache";
import { configerer } from "configerer";
import {
    ENABLE_FAST_DEVELOP_MODE, TARGET_COMPONENT_FAST_DEVELOP_MODE, setFastDevelopMode,
    SIGN_OF_FUNCTION_START, SIGN_OF_FIELD_START, SIGN_OF_RESTFUL_API_START,
    SIGN_OF_COLLECTION_START, SIGN_OF_JSX_CONTENT, SignOfInValidNode,
    KEYWORD_OF_MODULARIZED, PATH_OF_FREE_MARKER_TEMPLATE, PATH_OF_COMPONENT_MODULE,
    FILENAME_OF_SOURCE_JS, ID_OF_DEFAULT_CHEAP_ARRAY, STRING_OF_ID_OF_DEFAULT_CHEAP_ARRAY,
    FIELD_NAME_OF_INJECT_STORE, TYPES_OF_PROPS_VIEW, LANGUAGES_OF_SUPPORT,
    STRING_OF_INJECT_PARAM, FIELD_NAME_OF_MAX_SIZE_OF_REQUEST, FIELD_NAME_OF_SIZE_PER_PAGE,
    SIGN_OF_EMPTY_STORE, FILE_EXTENSION_OF_I18N, MAXIMUM_DOCUMENTS_PER_FETCH,
    SIGN_OF_IMPORT_MUI, LESS_MODULES, VIEW_IMPORTS
} from "./constants";
import CodegenNode from "./codegen-node";

class ClassGenerator {

    /** 為了讓import 不用擔心複數宣告 就用Object,empty 裡面放不需要變數宣告的import 例如 import from Firebase/database, 最後再一次gen*/
    imports = {all: {}, empty: []};
    hasConstructor = false;
    constructorStmt = [];
    hasExtends = false
    filePath = ``;
    classes = [];
    isSingletonFile = false;
    disableExportStmt = false;
    signature = true;
    needDefaultImports = true;
    needCreatedIndexFile = false;
    indexClassName = 'Index';
    indexFileMacros = [];
    indexFileSingleton = false;
    indexFileTailStmts = [];
    indexDisableExportStmt = false;

    constructor(path, node) {
        this.filePath = path;
        this.classes = [];
        this.node = node;
        if (!fs.existsSync(this.filePath)) {
            Util.persistByPath(path)
        }
        this.context = Util.getFileContextInRaw(this.filePath).split('\n');
    }

    async cleanBuild() {
        await Util.deleteSelfByPath(this.filePath, true);
        Util.persistByPath(this.filePath);
    }

    appendField(fieldName, defaultValue, macros = [], comments = [], type = '') {
        const stmt = [];
        for (const comment of comments) {
            if (Util.isUndefinedNullEmpty(comment)) continue;
            stmt.push(`\n`);
            stmt.push(`/** ${comment} */`);
        }
        for (const m of macros) {
            stmt.push(`\n`);
            stmt.push(`@${m}`);
        }
        stmt.push(`\n`);
        stmt.push(`${type} ${fieldName} = ${defaultValue};`);
        stmt.push(`\n`);
        Util.insertToArray(this.context, this.getIndexOfFieldSign(), ...stmt);
    }


    /** type =>|field|function|api|default ， 端看要加在哪個自定義區塊*/
    appendComment(stmt, type = 'default') {
        let index = -1;
        stmt = `\n/** ${stmt} */`
        switch (type) {
            case 'field':
                index = this.getIndexOfFieldSign();
                break;
            case 'function':
                index = this.getIndexOfFunctionSign();
                break;
            case 'api':
                index = this.getIndexOfRestfulApiSign();
                break;
        }
        if (index > 0)
            Util.insertToArray(this.context, index, stmt);
        else
            this.context.push(stmt);
    }

    appendSeparator(sep) {
        const stmt = [];
        stmt.push('\n');
        stmt.push(sep);
        Util.insertToArray(this.context, this.getIndexOfFunctionSign(), ...stmt);
    }

    /**
     * 組裝一個函式的完整程式碼內容（包含註解、裝飾器、參數、函式本體），返回字串陣列。
     * 支援箭頭函式、async、decorator、simple 等模式。
     *
     * @param {{ name: string, arrow?: boolean, async?: boolean, simple?: boolean, decorator?: string|boolean }} func - 函式設定
     * @param {string[]} [params=[]] - 參數列表
     * @param {string[]} [macros=[]] - 裝飾器列表
     * @param {string[]} [comments=[]] - 註解列表
     * @param {...string} contents - 函式內容行
     * @returns {string[]} 組裝後的程式碼字串陣列
     *
     * @example
     * const stmts = generator.getFunctionContent(
     *   { name: 'fetchData', async: true, arrow: true },
     *   ['id', 'options'],
     *   ['action'],
     *   ['從遠端取得資料'],
     *   'const result = await api.fetch(id, options);',
     *   'return result;'
     * );
     */
    getFunctionContent(func, params = [], macros = [], comments = [], ...contents) {
        /** 應該要檢查file 沒有class的話, 要跳出Error提示 */
        const functionName = func.name;
        const arrow = func?.arrow ?? false;
        const isAsync = func?.async ?? false;
        const simple = func?.simple ?? false;
        const decorator = func?.decorator ?? false;
        const stmt = [];
        stmt.push(`\n`);

        for (const comment of comments) {
            if (!Util.isEmpty(comment)) {
                stmt.push(`\n`);
                stmt.push(`/** ${comment} */`);
            }
        }

        for (const m of macros) {
            if (!Util.isEmpty(m)) {
                stmt.push(`\n`);
                stmt.push(`@${m}`);
            }
        }
        stmt.push(`\n`);

        _.remove(params, param => Util.isEmptyString(param));

        if (arrow || decorator) {
            /** arrow function 不支援 super QQ 08/03 的筆記有紀錄 */
            stmt.push(`${functionName} = ${isAsync ? 'async' : ''}${decorator ? `${decorator} (` : ``}(${Util.isEmpty(params) ? '' : params.join(' ,')}) => ${simple ? '':'{'}`);
        } else
            stmt.push(`${isAsync ? 'async ' : ' '}${functionName}(${Util.isEmpty(params) ? '' : params.join(' ,')}) {`);

        if (Util.isEqual(decorator, 'inject')) {
            this.appendImport(`{inject}`, `mobx-react`)
        }

        if (Util.isEqual(decorator, 'observer')) {
            this.appendImport(`{observer}`, `mobx-react`);
        }

        for (let content of contents) {
            if (!Util.isEmpty(content)) {
                stmt.push(`\n`);
                stmt.push(`${content}`);
            }
        }

        stmt.push(`\n`);
        stmt.push(arrow && simple ? `` : `}`);
        if (decorator) stmt.push(`)`);
        return stmt;
    }

    /**
     func = {
     name: functionName
     arrow: true,箭頭函數, 可以省去this的領域問題
     decorator: 有沒有需要修飾 像是observer(({store}) => ...functionStmt)
     async: 註記是否需要非同步
     simple: true, 如果arrow=true 又不要{} 例如：XXX = (...param) => logic()
     }
     */
    appendFunction(func, params = [], macros = [], comments = [], ...contents) {
        const stmts = this.getFunctionContent(
            Util.isString(func) ? {name: func} : func
            , params, macros, comments, ...contents);
        Util.insertToArray(this.context, this.getIndexOfFunctionSign(), ...stmts)
    }

    /**
     * 產生 Cloud Function 的完整程式碼語句，包含 exports、try-catch、logger、fingerprint 驗證等。
     * 支援 httpOnCall、httpOnRequest、schedule 三種類型。
     *
     * @param {CodegenNode} func - Cloud Function 節點（包含 getType()、getCloudFunctionInfo() 等方法）
     * @param {...string} extra - 額外要附加在尾部的語句
     * @returns {void}
     *
     * @example
     * generator.appendCloudFunctionStatement(cloudFuncNode);
     * // 產生類似：
     * // exports.checkoutByECPay = onCall(async (request) => {
     * //   let result = {};
     * //   let succeed = true;
     * //   try { ... } catch (error) { ... }
     * //   return { succeed, data: result };
     * // })
     */
    appendCloudFunctionStatement(func, ...extra) {
        const self = this;

        function getStringOfFunctionFinally() {
            const _stmts = [];

            if (Util.isEqual(func.getType(), 'httpOnRequest')) {
                if (needRegularResponse())
                    _stmts.push('response.send({succeed,data:result});');
                else {
                    _stmts.push('response.send(result);');
                }
            }

            if (Util.isEqual(func.getType(), 'httpOnCall')) {
                _stmts.push('return {succeed,data:result};');
            }
            return _stmts.join('\n');
        }

        function needRegularResponse() {
            return Util.isEqual(func.isRegularResponse, true);
        }

        function getStmtsByType(argumentz) {
            const _stmts = [`let result = {};`,
                `let succeed = true;`,
                `try {`];
            if (Util.isOrEquals(func.getType(), 'httpOnCall', 'httpOnRequest'))
                _stmts.push(`logger.info('functions(${fieldName}) data from client => ', request); `);

            if (Util.isEqual(func.getType(), 'httpOnCall')) {
                _stmts.push(`const {data, auth:session} = request; `);
                _stmts.push(`if(Util.isEmpty(data.fingerprint)) throw new Error('E0001-${fieldName} 你是壞狗，不可以玩伺服器');`);
                _stmts.push(`${fieldName}.setFingerprint(data.fingerprint); `);
            }

            _stmts.push(`result = await ${fieldName}.${functionNameOfHandleBy}(${argumentz.join(',')});`);
            _stmts.push(...[`} catch (error) {`,
                `succeed = false;`,
                `result = error.message;`,
                `logger.error(result);`,
                `}`,
                `${getStringOfFunctionFinally()}`
            ]);
            return _stmts;
        }

        const { functionName, fieldName, functionNameOfHandleBy, typeOfFunction, params,argumentz } = func.getCloudFunctionInfo()
        let stmts = [];
        stmts.push(`\n/** payload:${JSON.stringify(func.payload ?? 'needless payload')} */\n`)
        stmts.push(`exports.${functionName} = ${typeOfFunction}async (${params.join(',')}) => {`)
        stmts.push(...getStmtsByType(argumentz));
        stmts.push(`})`);
        this.appendInClassTail(this.context, ...stmts, ...extra)
    }

    appendAsyncFunction(functionName, params = [], macros = [], comments = [], ...contents) {
        this.appendFunction({
            name: functionName,
            async: true,
        }, params, macros, comments, ...contents)
    }

    appendConstructor(...stmt) {
        this.hasConstructor = true;
        this.constructorStmt.push(...stmt);

    }

    getIndexOf(stmt) {
        return _.findIndex(this.context, (per) => {
            return Util.isEqual(per, stmt);
        });

    }

    /**
     * 在當前檔案的 context 中加入一個 class 定義，包含 field、function、restful API 的分區標記。
     * 若有 extendz 物件，會自動處理 import 和繼承語法。
     * 若有 macros，會配對相應的 mobx-react import。
     *
     * @param {string} className - class 名稱
     * @param {{ name: string, from?: string }|string|undefined} extendz - 繼承設定（物件或字串）
     * @param {...string} macros - 裝飾器列表（如 'observable'、'inject("store")'）
     * @returns {void}
     *
     * @example
     * // 基本 class
     * generator.appendClass('MyStore');
     * // 繼承 class
     * generator.appendClass('MyStore', { name: 'BaseStore', from: './BaseStore' });
     * // 帶 macro 的 class
     * generator.appendClass('MyComponent', 'BaseComponent', 'observable');
     */
    appendClass(className, extendz, ...macros) {
        /** 應該要檢查file is not empty 的話, 要跳出Error提示 */
        const stmt = [];
        stmt.push('\n');
        stmt.push('\n');
        for (const macro of macros) {
            stmt.push('\n');
            stmt.push(`@${macro}`);
        }
        stmt.push('\n');
        if (Util.isObject(extendz)) {
            this.appendImport(extendz.name, extendz.from ? extendz.from : `.\/${extendz.name}`);
            stmt.push(`class ${className}${extendz ? ` extends ${extendz.name}` : ' '} {`);
        } else {
            stmt.push(`class ${className}${extendz ? ` extends ${extendz}` : ' '} {`);
        }
        stmt.push(`\n`);
        stmt.push(SIGN_OF_FIELD_START);
        stmt.push(`\n`);
        stmt.push(`\n`);
        stmt.push(SIGN_OF_FUNCTION_START);
        stmt.push(`\n`);
        stmt.push(`\n`);
        stmt.push(SIGN_OF_RESTFUL_API_START);
        stmt.push(`\n`);
        stmt.push(`\n`);

        stmt.push(`}`);
        stmt.push(`\n`);
        stmt.push(`\n`);
        this.context.push(...stmt);
        this.classes.push(className);
        this.hasExtends = !!extendz;

        /** 有marco,就要配搭相對應的import */
        for (const macro of macros) {
            if (Util.has(macro, 'inject')) {
                this.appendImport(`{inject}`, `mobx-react`)
            } else if (Util.has(macro, 'observer')) {
                this.appendImport(`{observer}`, `mobx-react`);
            }
        }
    }

    hasClass() {
        return (_.size(this.classes)) >= 1;
    }

    /** 產出index.js 他會繼承當前的class */
    needIndexFile(classNameOfFile = 'Index', indexFileMacro = [], singleton = false, extraTailStmts = [], disableExportStmt = false) {
        this.indexClassName = classNameOfFile;
        this.indexFileMacros = indexFileMacro;
        this.indexFileSingleton = singleton;
        this.indexFileTailStmts = extraTailStmts;
        this.needCreatedIndexFile = true;
        this.indexDisableExportStmt = disableExportStmt
    }

    getMainClassName() {
        if (this.classes.length > 0) {
            return this.classes[0];
        }
        return 'empty';
    }

    importDefaultModule() {
        this.appendImport('libpath', 'path');
        this.appendImport('{ utiller as Util, exceptioner as ERROR, pooller as InfinitePool }', 'utiller');
    }

    /**
     * 將所有組裝完成的程式碼寫入檔案，包含 import、constructor、export 和簽名。
     * 在 FAST_DEVELOP_MODE 下會根據規則過濾檔案建立，避免全量重建。
     * 若有設定 needCreatedIndexFile，會同時產生對應的 index.js 檔案。
     *
     * @returns {Promise<void>}
     *
     * @example
     * const gen = new ClassGenerator('/path/to/BaseMyStore.js', node);
     * gen.appendClass('BaseMyStore', { name: 'BaseStore' });
     * gen.appendField('items', '[]');
     * gen.appendFunction('fetchItems', ['id'], [], [], 'return await api.fetch(id);');
     * gen.needIndexFile('MyStore', [], true);
     * await gen.persist();
     * // => 產生 BaseMyStore.js 和 index.js
     */

    async persist() {
        if (ENABLE_FAST_DEVELOP_MODE) {
            const folderName = Util.getFolderNameOfFilePath(this.filePath);
            const fileNameExtension = Util.getFileNameExtensionFromPath(this.filePath);
            const fileName = Util.getFileNameFromPath(this.filePath)
            const ruleOfAllowFile = Util.or(
                (_.startsWith(fileName, `Base${Util.upperFirst(TARGET_COMPONENT_FAST_DEVELOP_MODE)}`)),/** BaseXXX 必須建立 */
                (_.startsWith(fileName, `${KEYWORD_OF_MODULARIZED}${Util.upperFirst(TARGET_COMPONENT_FAST_DEVELOP_MODE)}`) &&
                    Util.isEmptyFile(this.filePath)), /** 不存在的 ModularizedXXX 才建立,FAST MODE不會override files */
                (_.startsWith(folderName, TARGET_COMPONENT_FAST_DEVELOP_MODE) &&
                    Util.isEqual(fileName, 'index') &&
                    Util.isEmptyFile(this.filePath)), /** 不存在的 {TARGET_COMPONENT_FAST_DEVELOP_MODE}/index.js 才建立,FAST MODE不會override files */
                Util.isEqual(folderName, 'style'),
                Util.isEqual(folderName, 'less'),
                Util.isEqual(folderName, 'src'),
                Util.isEqual(folderName, 'store'),
                Util.isEqual(fileName, 'BaseCookie'), /** rapid mode 只針對concrete file */
                Util.isEqual(fileName, 'BaseMyRouter'), /** rapid mode 只針對concrete file */
                Util.isEqual(folderName, 'config') && !_.isEqual(fileNameExtension, 'index.js'),
                (Util.isOrEquals(folderName, ...LANGUAGES_OF_SUPPORT) && !_.isEqual(fileNameExtension, 'index.js')),
            )

            if (!ruleOfAllowFile) {
                console.log(`78673843 FAST MODE=>檔案不會建立, folderName=>'${folderName}':'${this.filePath}'`)
                /** 當fast build的時候, 只保留/style/. /less/. /TARGET_COMPONENT_FAST_DEVELOP_MODE開頭/.  */
                return;
            }
        }

        const stmts = [];
        if (_.size(this.classes) === 1) {
            if (!this.disableExportStmt) {
                if (this.isSingletonFile) {
                    stmts.push(`export default new ${this.classes[0]}()`);
                } else {
                    stmts.push(`export default ${this.classes[0]}`);
                }
            }
        } else if (_.size(this.classes) > 1) {
            stmts.push(`export { ${this.classes.map((clazz => `${clazz} as ${clazz}`)).join(',')}}`);
        }

        if (this.hasClass()) {
            this.appendFunction('constructor', ['props'],
                [], [], this.hasExtends ? 'super(props)' : '', ...this.constructorStmt);
        }

        if (this.needDefaultImports)
            this.importDefaultModule();
        for (const key in this.imports.all) {
            this.appendInClassHead(`import ${key} from '${this.imports.all[key]}'`);
        }
        for (const name of this.imports.empty) {
            this.appendInClassHead(`import '${name}'`);
        }

        this.appendInClassTail(stmts);
        if (this.signature)
            this.appendInClassHead(`/**${(this.node && !this.node.hideGeneratedAnnouncement) ? 'this code are generated, modify is no sense.' : ''}\n\tauthor:David Tu, \n\temail:freshingmoon0725@gmail.com \n\tupdateTime:${Util.getCurrentTimeFormat()} \n*/`);

        Util.appendFile(this.filePath, _.join(this.context, ''), true, true);

        if (this.needCreatedIndexFile) {
            const index = new ClassGenerator(Util.joinRespectingDot(Util.getFileDirPath(this.filePath), 'index.js'), this.node);
            index.imports = _.clone(this.imports);
            // index.appendImport(this.getMainClassName(), `./${this.getMainClassName()}`);
            index.appendClass(this.indexClassName, {name: this.getMainClassName()}, ...this.indexFileMacros);
            index.setSingleton(this.indexFileSingleton);
            index.needSignature(false);
            index.disableExportStmt = this.indexDisableExportStmt;
            for (const tail of this.indexFileTailStmts) {
                index.appendInClassTail(tail);
            }
            await index.persist();
        }
    }

    /** import `${parts}` from `${from}`,如果parts是{name}, 記得括號內不要有空格*/
    appendImport(parts, from) {
        if (Util.isEmpty(parts)) {
            this.imports.empty.push(from);
        } else {
            this.imports.all[parts] = from;
        }

        /** 因為import 可以支援沒有變數的宣告 例如 => import from Firebase/firestore */

    }

    appendInClassHead(...stmt) {
        const stmts = [];
        stmts.push(...stmt);
        stmts.push('\n');
        Util.insertToArray(this.context, 0, ...stmts);
    }

    appendInClassTail(...stmt) {
        const stmts = [];
        stmts.push(...stmt);
        stmts.push('\n');
        this.context.push(...stmts);
    }

    getClasses() {
        return this.classes;
    }

    /** this is not allow to growing */
    getIndexOfRestfulApiSign() {
        return this.getIndexOf(SIGN_OF_RESTFUL_API_START);
    }

    getIndexOfFunctionSign() {
        return this.getIndexOf(SIGN_OF_FUNCTION_START);
    }

    getIndexOfFieldSign() {
        return this.getIndexOf(SIGN_OF_FIELD_START);
    }

    appendBatchLinesIntoFunctionSection(lines) {
        Util.insertToArray(this.context, this.getIndexOfFunctionSign(), ...lines);
    }

    insertBatchLinesIntoRestfulApiSection(lines) {
        Util.insertToArray(this.context, this.getIndexOfRestfulApiSign(), ...lines);
    }

    appendBatchLinesIntoFieldSection(lines) {
        Util.insertToArray(this.context, this.getIndexOfFieldSign(), ...lines);
    }

    insertBatchLines(lines) {
        Util.insertToArray(this.context, 0, ...lines);
    }

    setSingleton(singleton = true) {
        this.isSingletonFile = singleton;
    }

    needSignature(need) {
        this.signature = need;
    }

    disableDefaultImports() {
        this.needDefaultImports = false;
    }


}

export default ClassGenerator;
