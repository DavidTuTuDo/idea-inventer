/**
 * app-builder.ts
 *
 * 功能說明：
 * AppBuilder 繼承 ComponentBuilder，負責產生完整 App 架構的程式碼。
 * 包含 i18n、Router、Cookie、Style、Less、Webpack 等系統級檔案。
 *
 * 主要職責：
 * - buildI18n(): 產生多國語言的 i18n class files
 * - buildRouterFile(): 產生路由的 BaseMyRouter.js
 * - buildAppIndexFiles(): 產生 BaseApp.js (包含 Provider, Routes, Store 注入)
 * - buildCookieFiles(): 產生加密 Cookie 的 BaseCookie.js
 * - buildStyleFiles(): 產生 app/common/mobile style files
 * - buildLessFiles() / overrideLessFile(): 管理 Less 樣式檔案
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
import ComponentBuilder from "./component-builder";
import ClassGenerator from "./class-generator";
import CodegenNode from "./codegen-node";
import beauty from "./beauty";

class AppBuilder extends ComponentBuilder {

    constructor(props) {
        super(props);
        /** 印為繼承component */
    }

    /**
     * 為自定義套件產生 index.js 進入點。
     * 只處理有標記 index: true 的套件，在 genRootPath 下建立對應的 class 檔案。
     *
     * @param {Array} packages - 套件設定陣列，需含 index、root、getName() 等屬性
     * @returns {Promise<void>}
     */
    async buildCustomizeFiles(packages) {
        for (const _package of packages) {
            if (!Util.isEqual(_package.index, true)) continue;
            const packageName = _package.getName();
            const generator = new ClassGenerator(Util.joinRespectingDot(this.genRootPath, _package.root, _package.getName(), 'index.js'), this.nodeOfAncestor);
            generator.appendClass(_.upperFirst(packageName));
            await generator.persist();
        }
    }

    /**
     * 產生完整的多國語言 i18n 檔案結構。
     * 掃描所有 component 節點的 defaultValue、confirmDialog、helperVisual 等屬性，
     * 收集成 key-value 對照表後寫入各語言目錄下的 BaseMyI18n / ModularizedMyI18n / index.js。
     * 同時處理模組元件的 i18n 合併，以及 eslint 設定檔的同步。
     *
     * @returns {Promise<void>}
     */
    async buildI18n() {

        /**type用來歸類class append 的內容 field|comment|*/
        function appendMapOfKeyValue(key, value, type = 'field') {
            arrayOfI18nKeyValue.push({key, value, type})
        }

        /** 把type=array的 defaultValue，再透過遞迴抓出來定義出新的i18n變數名稱 */
        function recursiveOfDoingSomethingMinor(arrayOfDefaultValue, child, sign = '') {
            if (!Array.isArray(arrayOfDefaultValue)) {
                return;
            }

            for (const obj of arrayOfDefaultValue) {
                for (const keyOfMajor in obj) {
                    const valueOfMajor = obj[keyOfMajor];
                    if (Array.isArray(valueOfMajor)) {
                        const latest = Util.camel(sign, keyOfMajor, `${_.indexOf(arrayOfDefaultValue, obj)}`);
                        recursiveOfDoingSomethingMinor(valueOfMajor, child, latest)
                    }

                    if (Util.isObject(valueOfMajor)) {
                        for (const keyOfMinor in valueOfMajor) {
                            const valueOfMinor = valueOfMajor[keyOfMinor];
                            if (Array.isArray(valueOfMinor)) {
                                const latest = Util.camel(sign, keyOfMinor);
                                recursiveOfDoingSomethingMinor(valueOfMinor, child, latest);
                            }

                            if (Util.isString(valueOfMinor)) {
                                appendMapOfKeyValue(Util.camel(
                                        child.getPreciseAttributeGenealogyName(),
                                        keyOfMajor, keyOfMinor, `${_.indexOf(arrayOfDefaultValue, obj)}`),
                                    valueOfMinor)
                            }
                        }
                    }

                    if (Util.isString(valueOfMajor) && !Util.isEqual(keyOfMajor, 'value')) {
                        appendMapOfKeyValue(Util.camel(
                            child.getPreciseAttributeGenealogyName(),
                            sign,
                            keyOfMajor,
                            `${_.indexOf(arrayOfDefaultValue, obj)}`), valueOfMajor)
                    }

                }
            }
        }

        /**
         * 讓18n.js 可以有mapValue轉換如下
         *
         *     infoOfCopyRightContentProjectId2 = "12345";
         *
         *     infoOfCopyRightContentProjectTitle2 = "專案二";
         *
         *     infoOfCopyRightContentProjectImage2 = "https://s.yimg.com/cv/apiv2/social/images/yahoo_default_logo-1200x1200.png";
         *
         *     infoOfCopyRightContentProjectTrait2 = "模擬考題";
         *
         *     infoOfCopyRightContentProjectDescriptions2Statement0 = "描述一二三四五六";
         *
         *     infoOfCopyRightContentProjectDescriptions2Statement1 = "描述一二三四五六";
         *
         *     infoOfCopyRightContentProjectId3 = "123456";
         *
         */

        function recursiveOfDoingSomethingMajor(child) {

            function handleHelperVisual(object, position = 'start') {
                if (object && Util.isEqual(object.type, 'text'))
                    appendMapOfKeyValue(child.getFieldNameOfVisualHelper(object, position), object.content);
            }


            if (child.hasDefaultValue()) {

                switch (child.getType()) {
                    case 'string':
                        appendMapOfKeyValue(Util.camel(child.getPreciseAttributeGenealogyName()), `${child.getDefaultValue()}`);
                        break;
                    case 'array':
                        recursiveOfDoingSomethingMinor(child.isSelected() ? child.select.values : child.getDefaultValue(), child);
                        break;
                    case 'arrayOfField':
                        recursiveOfDoingSomethingMinor(child.getDefaultValue(), child)
                        break;

                }
            }

            if (child.hasConfirmDialog()) {
                const alert = child.getAlertDialog();
                appendMapOfKeyValue(child.getFieldNameOfDialogContent(), alert.content);
                appendMapOfKeyValue(child.getFieldNameOfDialogTitle(), alert.title);
            }

            if (child.hasInputFieldDialog()) {
                const input = child.getAlertDialog().textInput;
                appendMapOfKeyValue(child.getFieldNameOfDialogInputValue(), input.value);
                appendMapOfKeyValue(child.getFieldNameOfDialogInputLabel(), input.label);
            }

            if (child.hasHelperVisual()) {
                handleHelperVisual(child.getHelperVisual().start, 'start')
                handleHelperVisual(child.getHelperVisual().end, 'end')
            }

            /**
             2023.08.19 description放進去會爆量，先不處理，因為目前也只有editor頁面會出現
             if(child.hasDescription()){
             appendMapOfKeyValue(Util.camel('description','of',child.getPreciseAttributeGenealogyName()), child.getDescription());
             }
             */
            if (child.hasChildren()) {
                for (const grandson of child.getPreciseAttributeChildren()) {
                    recursiveOfDoingSomethingMajor(grandson);
                }
            }
        }

        /**
         * 清除i18n們
         * await Util.deleteSelfByPath(Util.joinRespectingDot(this.genSourcePath, 'i18n'), true); */
        const arrayOfI18nKeyValue = [];

        for (const component of _.orderBy(this.nodeOfAncestor.components, ['isCommonModule'])) {
            appendMapOfKeyValue(component.getName(), `${component.getName()}${component.isPreciselyEditableComponent() ? '-editor' : ''} 需要的字串`, 'comment')

            appendMapOfKeyValue(component.getStruct().getFieldNameOfPageTitle(), component.title);

            for (const child of component.getStruct().getPreciseAttributeChildren()) {
                /** ref 的東西就不要錯頻道，本來屬於episode, 結果跑去main(因為main ref:episode)*/
                if (!child.isReferenceNode())
                    recursiveOfDoingSomethingMajor(child);
            }

            _.each(component.getCustomTextOfI18n(), (value, key) => {
                appendMapOfKeyValue(Util.camel(component.getStruct().getName(), 'custom', key), value);
            })

        }

        const mapOfI18nStmtsOfCommonModule = {};
        for (const _module of _.filter(this.nodeOfAncestor.components, (com) => com.isModuleComponent() && !com.isExtraComponent)) {
            for (const lang of LANGUAGES_OF_SUPPORT) {
                const destination = Util.joinRespectingDot(PATH_OF_COMPONENT_MODULE, `${_module.getName()}/web/src/i18n/${lang}/${FILE_EXTENSION_OF_I18N}`)
                if (Util.isPathExist(destination))
                    Util.appendMapOfKeyArray(mapOfI18nStmtsOfCommonModule, lang, Util.getFileContextInRaw(destination));
            }
        }

        /** 為了視覺上合理化 */
        const arrayOfI18nReverse = _.reverse(arrayOfI18nKeyValue)
        for (const lang of LANGUAGES_OF_SUPPORT) {
            const classNameOfBase = `BaseMyI18n`;
            const classNameOfModularized = `${KEYWORD_OF_MODULARIZED}MyI18n`;
            const classNameOfIndex = `I18n`;

            const base = new ClassGenerator(Util.joinRespectingDot(this.genSourcePath, `i18n`, lang, `${classNameOfBase}.js`), this.nodeOfAncestor);
            base.appendClass(classNameOfBase, {name: 'BaseI18n', from: `../../base/BaseI18n`});
            const modularized = new ClassGenerator(Util.joinRespectingDot(this.genSourcePath, `i18n`, lang, `${classNameOfModularized}.js`), this.nodeOfAncestor)
            modularized.appendClass(classNameOfModularized, {name: classNameOfBase, from: `./${classNameOfBase}`});
            if (!Util.isEmpty(mapOfI18nStmtsOfCommonModule[lang]))
                modularized.appendBatchLinesIntoFieldSection(['\n\n', ...mapOfI18nStmtsOfCommonModule[lang].join('\n\n')]);
            const index = new ClassGenerator(Util.joinRespectingDot(this.genSourcePath, `i18n`, lang, `index.js`), this.nodeOfAncestor)
            index.appendClass(classNameOfIndex, {name: classNameOfModularized, from: `./${classNameOfModularized}`});
            index.setSingleton(true);

            _.each(arrayOfI18nReverse, (object, index, all) => {
                switch (object.type) {
                    case 'field':
                        base.appendField(object.key, JSON.stringify(object.value));
                        break;
                    case 'comment':
                        base.appendComment(object.value, 'field');
                        break;
                }
            })
            await base.persist();
            await modularized.persist();
            await index.persist();
        }

        Util.copySingleFile(Util.joinRespectingDot(this.freeMarkerRootPath, 'template.i18n.index.js'),
            Util.joinRespectingDot(this.genSourcePath, 'i18n', 'index.js'), undefined, true);

        Util.copySingleFile(Util.joinRespectingDot(this.freeMarkerRootPath, 'web.eslint.config.cjs'),
            Util.joinRespectingDot(this.genRootPath, 'eslint.config.cjs'), undefined, true);


        /** 把專案裡的i18n/index複製到當前gen/i18n/index, 不然rapid build會有bug
         for (const sourceFile of Util.findFilePathBy(this.projectPlatformPath,
         (each) => Util.has(LANGUAGES_OF_SUPPORT, each.folderName) && Util.isEqual('index', each.fileName))) {
         let ignoreThisRun = false;
         const from = sourceFile.path;
         const dest = Util.joinRespectingDot(this.genRootPath, Util.getRelativePath(sourceFile.path, this.projectPlatformPath));
         Util.copySingleFile(from, dest, '', true);
         } */

        arrayOfI18nKeyValue.length = 0;
        /** 讓Rapid Build不會產生重疊的行為 */

    }

    /**
     * 產生加密 Cookie 管理的 BaseCookie.js 與 index.js。
     * 收集所有 component 定義的 cookies 以及標記 useCache 的節點，
     * 為每個 cookie 產生 set/get/has/remove 四個操作函式。
     * 使用 universal-cookie 套件配合 AES 加密。
     *
     * @returns {Promise<void>}
     */
    async buildCookieFiles() {

        const self = this;

        function getCookiesOfModules() {
            const cookies = [];
            for (const component of self.getComponents()) {
                cookies.push(...component.getCookies())
            }
            return cookies;
        }

        function getNodesOfUseCache() {
            const nodes = [];
            for (const component of self.getComponents())
                nodes.push(...component.getNodesBy((node) => node.useCache))
            return nodes;
        }

        const cookies = getCookiesOfModules();

        const extra = getNodesOfUseCache().map((node) => {
            const clone = _.clone(node);/** 因為只有改field，這不會影響到*/
            clone.name = node.getNameOfHierarchicalOfCookieUsage();
            clone.type = "string";
            clone.description = '因為useCache&&TextField，所以 autogen 的 cookie';
            return clone;
        })

        for (const node of extra) console.log(`${node.name} is node ==>`, CodegenNode.isCodegenNode(node))
        console.log('size ==>', _.size(extra));
        console.log('names ==>', extra.map(each => each.name));

        if (_.size(cookies) > 0 || _.size(extra) > 0) {
            const baseCookieGenerator = new ClassGenerator(Util.joinRespectingDot(this.genSourcePath, `cookie`, `BaseCookie.js`), this.nodeOfAncestor);
            baseCookieGenerator.appendClass('BaseCookie', {name: 'Cookie', from: `../base/BaseCookie`});
            baseCookieGenerator.appendImport(`Cookies`, `universal-cookie`);
            baseCookieGenerator.appendImport(`Config`, `../config`);
            baseCookieGenerator.appendField(`cookie`, ` new Cookies(null, { path: '/' })`);
            baseCookieGenerator.appendField('password', 'Config.password');

            for (const cookie of [...cookies, ...extra]) {
                baseCookieGenerator.appendField(cookie.name, JSON.stringify({
                        key: cookie.name,
                        defaultValue: cookie.defaultValue
                    }), [], [cookie.description ?? '']
                )

                baseCookieGenerator.appendFunction(Util.camel(`set`, cookie.name), [`${cookie.name}`, `options`], [], [`options相關設定值參考https://www.npmjs.com/package/universal-cookie`],
                    `if(${cookie.name} === undefined) { this.${Util.camel(`remove`, cookie.name)}(); return }`,
                    cookie.isObject() ? `${cookie.name} = JSON.stringify(${cookie.name})` : ``,
                    `this.cookie.set(`,
                    `this.getEternalEncryptStringOfCookieName(this.${cookie.name}.key, this.password),`,
                    `Util.getEncryptStringV2(${cookie.name}, this.password), {path: "/", ...options})`
                )

                baseCookieGenerator.appendFunction(Util.camel(`get`, cookie.name), ['options = {}'], [], [],
                    `const value = this.cookie.get(`,
                    `this.getEternalEncryptStringOfCookieName(this.${cookie.name}.key, this.password), options)`,
                    `if(Util.isEmpty(value)) return ${cookie.isObject() ? '{}' : ''}`,
                    `const decrypt = Util.getDecryptStringV2(value, this.password)`,
                    cookie.isObject() ? `return JSON.parse(decrypt)` : `return decrypt`
                )

                baseCookieGenerator.appendFunction(Util.camel(`has`, cookie.name), [], [], [],
                    `return !!this.cookie.get(this.getEternalEncryptStringOfCookieName(
                    this.${cookie.name}.key, 
                                this.password))`,
                )

                baseCookieGenerator.appendFunction(Util.camel(`remove`, cookie.name), ['option'], [], [],
                    `this.cookie.remove(`,
                    `this.getEternalEncryptStringOfCookieName(this.${cookie.name}.key, this.password),{path:"/",...option})`)

            }
            baseCookieGenerator.appendFunction('getAllCookies', ['options = {}'], [], [], 'return this.cookie.getAll(options)')
            const indexCookieGenerator = new ClassGenerator(Util.joinRespectingDot(this.genSourcePath, `cookie`, `index.js`), this.nodeOfAncestor);
            indexCookieGenerator.appendClass('Cookie', {name: `BaseCookie`, from: './BaseCookie'});
            indexCookieGenerator.setSingleton(true);

            await indexCookieGenerator.persist();
            await baseCookieGenerator.persist();
        }
    }

    /**
     * 透過 Mustache 模板產生 package.json、webpack.config.js、babel.config.js。
     *
     * @returns {Promise<void>}
     */
    async buildWebpackNPackageJson() {
        await this.appendMustacheFile('web.package.json.mustache', Util.joinRespectingDot(this.genRootPath,
            `package.json`
        ), {
            projectName: this.nodeOfAncestor.name,
            projectVersion: this.nodeOfAncestor.version,
            projectDescription: this.nodeOfAncestor.description
        });
        await this.appendMustacheFile('webpack.config.js.mustache', Util.joinRespectingDot(this.genRootPath,
            `webpack.config.js`), { titleOfProject: this.nodeOfAncestor.getTitle() });
        await this.appendMustacheFile('web.babel.config.js', Util.joinRespectingDot(this.genRootPath,
            `babel.config.js`
        ));
    }

    /**
     * 產生 dist/index.html 靜態檔案，注入專案名稱與 Google Search Console 驗證碼。
     *
     * @returns {Promise<void>}
     */
    async buildHtmlIndexAssetsFile() {
        const path = Util.persistByPath(Util.joinRespectingDot(this.genRootPath, 'dist'));
        await this.appendMustacheFile(
            'index.html.mustache',
            Util.joinRespectingDot(path, 'index.html'),
            { title: this.nodeOfAncestor.title, verification: this.nodeOfAncestor.verification }
        );
    }

    /**
     * 產生 Client 端呼叫 Cloud Functions 的 API class。
     * 掃描所有 httpOnCall 類型的 cloudFunctions，產生 BaseMyCloudFunctions.js。
     *
     * @returns {Promise<void>}
     */
    async buildCloudFunctionsApi() {
        const baseFunctionGenerator = new ClassGenerator(Util.joinRespectingDot(this.genSourcePath,
            `functions`, `BaseMyCloudFunctions.js`), this.nodeOfAncestor);
        baseFunctionGenerator.appendClass(
            `BaseMyCloudFunctions`, {name: `ClientRemoteApi`, from: '../base/ClientRemoteApi'}
        )

        for (const _func of this.getAllCloudFunctions()) {
            if (Util.isEqual(_func.getType(), 'httpOnCall')) {
                baseFunctionGenerator.appendAsyncFunction(
                    `${_.lowerFirst(_func.getType())}${_.upperFirst(_func.getName())}`,
                    ['view', 'data'],
                    [], [`payload:${JSON.stringify(_func.payload ?? 'needless payload')}`],
                    `return await this.runUIAsyncCloudFunctionsTask('${_func.getName()}', data, view);`
                )
            }
        }
        baseFunctionGenerator.needIndexFile(`MyCloudFunctions`, [], true);
        await baseFunctionGenerator.persist();
    }

    /**
     * 產生路由管理的 BaseMyRouter.js。
     * 為每個有 path 的 component 產生 gotoXxxPage 與 getUrlOfXxxPage 函式，
     * 支援 detail page、login-only、preset attributes、disposable renew 等特性。
     *
     * @returns {Promise<void>}
     */
    async buildRouterFile() {
        function getStmtsOfLoginStmts(component) {
            const stmts = []
            if (component.loginOnlyPage) {
                stmts.push(
                    'if(!UserInfoRef.isLoginWithSucceed() && component !== undefined) {',
                    'component.enableLoginConfirmDialog()',
                    'return;}',
                )
            }
            return stmts;
        }

        function getStmtsOfRenewStore(nodeOfComponent, attrs) {
            const stmts = [];
            const nameOfStore = nodeOfComponent.isEditableComponent ?
                nodeOfComponent.getStruct().getOriginalName() : nodeOfComponent.getStruct().getName();
            if (nodeOfComponent.disposablePage) {
                stmts.push(`if(!this.isGotoSameRoute(route))`)
                stmts.push(`this.App().getStore().${Util.camel('renew', nameOfStore)}()`);
            }

            for (const attr of attrs)
                stmts.push(`this.App().get${_.upperFirst(nodeOfComponent.getStruct().getName())}Store().${attr.getFunctionNameOfSetter()}(${attr.getFieldName()})`);

            stmts.push(`this.App().get${_.upperFirst(nodeOfComponent.getStruct().getName())}Store().initial(presetObj)`)
            return stmts;
        }

        function appendGotoFunction(generator, nodeOfComponent, isDetail = false) {
            function getArrayWithDefaultValue(array) {
                _.remove(array, (each) => Util.isUndefinedNullEmpty(each))
                return array.map((each) => `${each} = ''`)
            }

            const route = Util.joinRespectingDot(nodeOfComponent.getPathOfRouterString(),
                isDetail ? `\$\{${nodeOfComponent.getFieldNameOfDetailUid()}\}` : '',
                nodeOfComponent.routeHash ? '${Util.getRandomHashV2(15)}' : ''
            )

            const attrs = nodeOfComponent.getPresetAttributes();

            const params = ['component', ...getArrayWithDefaultValue([...nodeOfComponent.getParamsInPath(), ...[isDetail ? nodeOfComponent.getFieldNameOfDetailUid() : undefined], ...attrs.map(attr => attr.getFieldName())]), 'presetObj = {}'];

            generator.appendFunction({
                    name: Util.camel('goto', nodeOfComponent.name,
                        nodeOfComponent.isPreciselyEditableComponent() ? 'editor' : '',
                        isDetail ? 'detail' : '', 'page'),
                    arrow: true
                },
                params,
                [],
                [],
                ...getStmtsOfLoginStmts(nodeOfComponent),
                `const route = \`${route}\``,
                ...getStmtsOfRenewStore(nodeOfComponent, attrs),
                `this.routeTo(component, route);`,
                `this.setCurrentRoute(route)`,
                `return new URL(route, Config.host).href;`,
            )


            generator.appendFunction({
                    name: Util.camel('getUrlOf', nodeOfComponent.name,
                        nodeOfComponent.isPreciselyEditableComponent() ? 'editor' : '',
                        isDetail ? 'detail' : '', 'page'),
                    arrow: true
                },
                _.tail(params),
                [],
                [],
                `const route = \`${route}\``,
                `return new URL(route, Config.host).href;`
            )

        }

        const baseRouterGenerator = new ClassGenerator(Util.joinRespectingDot(this.genSourcePath,
            `router`,
            `BaseMyRouter.js`
        ), this.nodeOfAncestor);
        baseRouterGenerator.appendClass(
            `BaseMyRouter`, {name: `BaseRouter`, from: '../base/BaseRouter'}
        );
        baseRouterGenerator.appendImport('UserInfoRef', '../base/BaseUserInfo');
        baseRouterGenerator.appendImport('Config', '../config');
        // baseRouterGenerator.appendImport('{ Application }', '../');

        for (const component of this.nodeOfAncestor.components) {
            if (!component.hasPath()) continue;

            appendGotoFunction(baseRouterGenerator, component);
            if (component.detailPage) {
                appendGotoFunction(baseRouterGenerator, component, true);
            }
        }
        baseRouterGenerator.needIndexFile('Router', [], true);
        await baseRouterGenerator.persist();
    }

    /**
     * 產生 BaseApp.js，即整個 App 的根元件。
     * 組合 Provider（MobX store 注入）、BrowserRouter（路由）、Routes 與每個 component 的 wrapper。
     * 同時產生 getStoreObject、getXxxStore、getRenderView 等管理函式。
     *
     * @returns {Promise<void>}
     */
    async buildAppIndexFiles() {
        /** 產生出key, 這樣每次path的param有改變,都會reload page*/
        function getPropOfKey(component) {
            const params = component.getParamsInPath();
            if (component.detailPage) params.push(component.getFieldNameOfDetailUid());

            const paramsOfProp = params.map((each) => `\$\{${each}\}`);
            if (!component.disableKeyOfRoute && _.size(paramsOfProp) > 0) {
                return {key: `###\`${paramsOfProp.join('')}\``}
            } else {
                return {}
            }
        }

        const appGenerator = new ClassGenerator(Util.joinRespectingDot(this.genSourcePath, `BaseApp.js`), this.nodeOfAncestor);
        appGenerator.appendImport(`{StyledEngineProvider}`, '@mui/material/styles');
        appGenerator.appendImport(`{Provider}`, `mobx-react`);
        appGenerator.appendImport(`Store`, `./store`);
        appGenerator.appendImport(`Config`, `./config`);
        appGenerator.appendImport(`ImpComponent`, `./base/ImpComponent`);
        appGenerator.appendImport(`{inject,observer}`, `mobx-react`);
        appGenerator.appendImport(`React`, `react`);
        appGenerator.appendImport(`{Route, Routes, BrowserRouter, useNavigate, useLocation, useParams, Navigate}`, `react-router-dom`);
        appGenerator.appendClass(`BaseApp`,{name: 'CoreApp', from: './base/CoreApp'});
        for (const component of this.getGenComponent()) {
            appGenerator.appendInClassHead(`import ${_.upperFirst(component)} from './component/${component}'`);
        }

        const stmtsOfRenderView = [];
        const childrenStmt = [];
        for (const component of this.nodeOfAncestor.components) {
            if (!component.hasPath()) continue;

            /** 網址會用到的參數 */
            const params = component.getParamsInPath();
            if (component.detailPage) params.push(component.getFieldNameOfDetailUid());

            const nameOfComponent = _.upperFirst(component.getStruct().getName());
            const wrapper = `${nameOfComponent}Wrapper`;
            const observed = `Observed${nameOfComponent}`;
            const props = { ...component.extra, ...getPropOfKey(component), navigate: `###useNavigate()`, location: `###useLocation()` };
            for(const param of params) props[param] = `###${param}`;
            if (component.isNavigatorView) props["ref"] = "###self.navigatorRef";
            if (component.isCopyRightView) props["ref"] = "###self.copyRightRef";
            const renderStmts = this.getJSXStrings({
                generator: appGenerator,
                tag: observed,
                props,
                simpleProps: ["...props"]
            });
            this.removeJSXSign(renderStmts);

            const path = Util.joinRespectingDot(component.path, component.detailPage ? `:${component.getFieldNameOfDetailUid()}?` : '');

            if (!component.isNavigatorView && !component.isCopyRightView) {
                childrenStmt.push(...this.getJSXStrings({
                    tag: `Route`,
                    generator: appGenerator,
                    props: {
                        path: component.routeHash ? `${path}/*` : path,
                        element: `###<${wrapper} />`
                        /** component: `###${_.upperFirst(component.name)}`, */
                    }
                }));
            }

            const stmtsOfParams = _.size(params) > 0 ? `const {${params.join(',')}} = useParams();` : '';
            stmtsOfRenderView.push(`
            const ${observed} = observer(${nameOfComponent});
            const ${wrapper} = inject('${_.lowerFirst(nameOfComponent)}')((props) => {
            ${stmtsOfParams} return ${renderStmts.join('')} })`)
        }

        childrenStmt.push(...this.getJSXStrings({
            tag: `Route`,
            generator: appGenerator,
            props: { path: "*", element: `###<Navigate to="/" replace />` }
        }));

        const routerStmt = this.getJSXStrings({
            tag: 'Routes',
            generator: appGenerator,
            // props: {history: `###this.history`},
            contents: [...childrenStmt, `{this.getExtraPages()}`]
        })

        const providerStmt = this.getJSXStrings({
            tag: 'Provider',
            generator: appGenerator,
            simpleProps: ['...this.getStoreObject()'],
            contents: [this.nodeOfAncestor.hasNavigationView() ? '<NavigatorWrapper />' : '', ...routerStmt,
                this.nodeOfAncestor.hasCopyRightView() ? '<InfoOfCopyRightWrapper />' : '']
        })

        const whole = this.getJSXStrings({
            tag: 'StyledEngineProvider',
            props: {injectFirst: true},
            generator: appGenerator,
            contents: [...providerStmt]
        });

        const entire = this.getJSXStrings({
            tag: 'BrowserRouter',
            generator: appGenerator,
            contents: [...whole]
        });

        this.removeJSXSign(entire);

        appGenerator.appendFunction('getStoreObject', [], [], [],
            'const stores = {}',
            ...this.getGenStores().map(store => {
                return `stores['${store}'] = this.store.${store}`
            }), 'return stores')

        for (const storeName of this.getGenStores()) {
            appGenerator.appendFunction(Util.camel('get', storeName, 'store'), [], [], [],
                `return this.store.${storeName}`
            )}

        appGenerator.appendFunction(Util.camel('get', 'store'), [], [], [],
            `return this.store`
        )

        appGenerator.appendFunction({
            name: `getNavigatorRef`,
            arrow: true
        }, [], [], [], `return this.navigatorRef.current`);
        if (this.nodeOfAncestor.hasNavigationView())
            appGenerator.appendConstructor(`this.navigatorRef = React.createRef()`);
        if (this.nodeOfAncestor.hasCopyRightView())
            appGenerator.appendConstructor(`this.copyRightRef = React.createRef()`);
        if (!this.isProduction())
            appGenerator.appendConstructor(`if (process.env.NODE_ENV === 'development') {
            window.store = this.store;
            window._userInfo = require('./base/BaseUserInfo.js').default;
            }`);

        appGenerator.appendFunction({ name: `getRenderView`, arrow:true }, [],
          [], [], 'console.log(`🛑🛑🛑🛑 注意！root re-render()`)','const self = this;',...stmtsOfRenderView,`return (${entire.join("")})`);

        await appGenerator.needIndexFile('App', [], false, [
                `const self = new App()`,
                `self.mount()`,
                `Util.setEnvironment(Config.env)`,
                `export {self as Application};`
            ],
            true);
        await appGenerator.persist();
    }

    /**
     * classNameInfos: [ {name:navigator,classnames:['List','Wrap'] }]
     * */
    async buildStyleFiles(classNameInfos) {
        const types = [`app`, `common`, `mobile`];
        for (const type of types) {
            let origins = {};
            const sourceFilePath = Util.joinRespectingDot(this.projectPlatformSourcePath, `style`, `${type}.style.js`)
            if (fs.existsSync(sourceFilePath)) {
                const obj = require(libpath.resolve(sourceFilePath)).default;
                origins = obj;
            }

            const generator = new ClassGenerator(Util.joinRespectingDot(this.genSourcePath, 'style', `${type}.style.js`), this.nodeOfAncestor)
            generator.appendClass(`${_.upperFirst(type)}Style`);
            for (const info of classNameInfos) {

                for (const className of info.classNames) {
                    const node = className.node;
                    const type = className.type;
                    const name = node.getClassNameOfLessUsage(type);
                    if (origins && origins[name]) {
                        generator.appendField(name, JSON.stringify(origins[name]));
                        delete origins[name];
                    } else {
                        generator.appendField(name, `{}`);
                    }
                }
                const isEditPage = info.component.isPreciselyEditableComponent();
                generator.appendBatchLinesIntoFieldSection(`\n\n/** => following for ${info.component.getName()} ${isEditPage ? 'editor' : ''} component  */\n\n`)
                generator.needSignature(false);
                generator.setSingleton(true);
            }
            if (!Util.isEmpty(origins)) {
                for (const name in origins) {

                    /** 要檢查homeless的每一個 是不是沒定義過, 沒定義過就會是一個空物件 */
                    if (!Util.isEqual(origins[name], {}))
                        generator.appendField(name, JSON.stringify(origins[name]));
                }
                generator.appendBatchLinesIntoFieldSection(`\n\n/** following for homeless */\n\n`)
            }
            await generator.persist();
        }

        /** template.style.index.js */
        Util.copySingleFile(Util.joinRespectingDot(this.freeMarkerRootPath, 'template.style.index.js'),
            Util.joinRespectingDot(this.genSourcePath, 'style', 'index.js'), undefined, true);
    }

    /**
     * 解析現有的 LESS 檔案，將所有開發者寫過的 CSS Class 屬性萃取成一個物件集合 (Dictionary)。
     * 這可以用來保留開發者先前的修改，避免重新 Generate Code 時被覆蓋遺失。
     *
     * @param {string} path - 目標 LESS 檔案路徑或包含 less/styles.less 的目錄路徑
     * @returns {Object} lessAttributeObj - 解析後的屬性物件對照表
     *
     * 回傳範例：
     * {
     *   "LoginContainer": {
     *       complete: 'LoginContainer:hover', // 完整的 className 包含 pseudo-class 或 extend
     *       precise: 'LoginContainer',        // 純淨的 className
     *       raw: 'color: red; @media @mobile { padding: 10px; }', // 最原始未被拆解的 CSS 內容
     *       attributeObj: {                   // 依據裝置拆解出來的樣式
     *           default: 'color: red;',
     *           mobile: 'padding: 10px;'
     *       },
     *       isModified: true                  // 判斷此區塊是否被實質修改過 (非空區塊或帶有 pseudo-class)
     *   }
     * }
     */
    getObjectOfExistedLessAttribute(path = this.projectPlatformSourcePath) {

        /**
         * 將原始 CSS 區塊字串拆解並分類到對應的裝置屬性中
         * 2026.05.12 修正 @media mobile{ 裡面還能有括號 -->{} }
         * @param {string} raw - 原始 CSS 區塊字串，例如: "color: red; @media @mobile { padding: 10px; }"
         * @returns {Object} 範例: { default: 'color: red;', mobile: 'padding: 10px;' }
         */
        function rawToAttributeObj(raw) {
            const object = {};

            // 預處理：先過濾掉所有註解 (包含 /* ... */ 與 // ...)，避免註解內的文字與大括號干擾解析
            // 預處理：先過濾掉所有註解
            const cleanRaw = raw
                .replace(/\/\*[\s\S]*?\*\//g, '') // 移除區塊註解 /**/
                // 【修正重點】移除單行註解 //，並使用 (?<!:) 確保雙斜線前面不是冒號 (避開 https://)
                .replace(/(?<!:)\/\/.*$/gm, '');

            // 陣列的第一個元素通常是遇到 @media 之前的預設樣式 (default)
            // (這裡對應原本先以 '@media' 切割的邏輯，直接擷取前半段，並把換行等格式壓平為單行字串)
            const firstMediaIndex = cleanRaw.indexOf('@media');

            if (firstMediaIndex !== -1) {
                object['default'] = Util.toOneLineString(cleanRaw.slice(0, firstMediaIndex));
            } else {
                /** 如果結果如果有'}'會Ｇ掉，必須是simple string */
                object["default"] = Util.getNormalizedStringNotEndWith(Util.toOneLineString(cleanRaw), "}");
                return object;
            }

            // 處理 @media 之後的每一段 (裝置特定樣式)
            let currentIndex = firstMediaIndex;

            while (currentIndex < cleanRaw.length) {
                const mediaIndex = cleanRaw.indexOf('@media', currentIndex);
                if (mediaIndex === -1) break;

                const braceStartIndex = cleanRaw.indexOf('{', mediaIndex);
                if (braceStartIndex === -1) break;

                // 抓取 @ 後面的單字 (例如 mobile)
                const mediaDeclaration = cleanRaw.slice(mediaIndex, braceStartIndex);
                const platformMatch = mediaDeclaration.match(/@media\s+@(\w+)/);
                const platform = platformMatch ? platformMatch[1] : null;

                // 抓取 {} 裡面的樣式內容 (改用括號計數法，解決巢狀結構 Regex 會錯亂的問題)
                let openBraces = 0;
                let braceEndIndex = -1;

                for (let i = braceStartIndex; i < cleanRaw.length; i++) {
                    if (cleanRaw[i] === '{') openBraces++;
                    if (cleanRaw[i] === '}') {
                        openBraces--;
                        if (openBraces === 0) {
                            braceEndIndex = i;
                            break;
                        }
                    }
                }

                // 如果有抓到對應的裝置與大括號內的設定
                if (braceEndIndex !== -1) {
                    const statement = cleanRaw.slice(braceStartIndex + 1, braceEndIndex);
                    if (platform) {
                        const parsedStatement = Util.toOneLineString(statement);
                        // 加上 trim() 檢查是否為空字串，非空才放進物件中
                        if (parsedStatement.trim() !== '') {
                            object[platform] = parsedStatement;
                        }
                    }
                    currentIndex = braceEndIndex + 1;
                } else break;
            }

            return object;
        }

        /**
         * 檢查某個解析出來的 attributeObj 是否「全部都是空的」
         * @param {Object} attributeObj - 例如 { default: '', mobile: '', desktop: '' }
         * @returns {boolean}
         */
        function isEmptyAttribute(attributeObj) {
            let isEmpty = true;
            for (const key in attributeObj) {
                if (!Util.isEmpty(attributeObj[key])) { // 只要有一個裝置(或 default) 裡面有寫樣式，就不算空
                    isEmpty = false;
                    break;
                }
            }
            return isEmpty;
        }

        const lessAttributeObj = {};

        // 判斷傳入的路徑是目錄還是已指定副檔名的 .less 檔案，若是目錄則預設找 less/styles.less
        const srcLessPath = Util.isEqual('less', Util.getExtensionFromPath(path)) ? path : Util.joinRespectingDot(path, `less`, `styles.less`)

        if (Util.isEmptyFile(srcLessPath)) {
            Util.appendInfo(`4842454 ${srcLessPath} is not exist!!!`);
            return undefined; // 檔案不存在或為空直接返回 undefined
        }

        // 將系統支援的所有裝置轉為 Regex 用的字串，例如 "(mobile|tablet|desktop)"
        const stringOfPlatforms = _.map(LESS_MODULES, 'name').map((each) => `(${each})`).join("|");

        if (fs.existsSync(srcLessPath)) {
            const stub = Util.getFileContextInRaw(srcLessPath).split('\n');

            /**
             * 過濾掉不需處理的行數 (注意!! _.remove 會直接 mutate 原本的 array)
             * 移除：註解 (/**)、空白行、import (@import)、以及頂層的裝置變數宣告 (@mobile: ~'...';)
             */
            _.remove(stub, (each) => (
                _.startsWith(each.trim(), '/**')
                || Util.isEqual(each.trim(), '')
                || _.startsWith(each.trim(), '@import')
                || Util.startWithRegex(each.trim(), `@(${stringOfPlatforms})\:`)
            ))

            // 將過濾後純淨的 LESS 陣列接合回字串
            const pureLessStringFile = stub.join('\n');

            // 找出所有開頭為 `.ClassName {` 或 `.ClassName:extend(...) {` 的定義
            const regexOfClassName = new RegExp(`^\\..+\\s{`, `gm`)

            /**
             * 從擷取到的符合字串中，拆解出 precise (純 className) 與 complete (完整包含 pseudo/extend 的字串)
             * 例如：拿到 ".ExamFilterSlider:extend(.CenterInParent) {"
             */
            const classNames = pureLessStringFile.match(regexOfClassName).map((each) => {
                // 去除開頭的 '.' 以及結尾的 '{'，剩下 "ExamFilterSlider:extend(.CenterInParent)"
                const normalize = Util.getNormalizedStringNotEndWith(Util.getNormalizedStringNotStartWith(each, '.'), '{').trim()

                // 以冒號切割，取得最精確的 class 名稱 "ExamFilterSlider"
                const precise = normalize.split(':')[0];
                return {
                    complete: normalize, /** 例如: ExamFilterRandomTestRangeOfYearSlider:extend(.CenterInParent all) */
                    precise: precise,    /** 例如: ExamFilterRandomTestRangeOfYearSlider */
                }
            });

            // 依據每個 className 定義將檔案拆分成多個區塊 (block)
            const blocks = Util.toObjectMap(pureLessStringFile.split(regexOfClassName), {to: 'raw'});
            // split 切割後的第一個元素通常是 class 宣告前的無意義區塊或空白，需移除
            blocks.shift();

            // 將 classNames 與對應的 CSS blocks 組合起來 (zip) 並合併為單一物件
            const styles = _.zip(classNames, blocks).map((each) => Util.merO(...each));

            // 針對每個組合好的 style 物件，進一步解析裡面的 RWD 屬性
            for (const style of styles) {
                const attributeObj = rawToAttributeObj(style.raw);
                /** 產出類似 { default:'color: red;', mobile:'', desktop:''} 的結構 */

                // 判斷是否為「編輯器」(Editor) 專用的 ClassName
                const isEditorClassName = Util.has(style.precise, 'Editor');

                lessAttributeObj[style.precise] = {
                    ...style,
                    attributeObj,
                    /**
                     * isModified 代表這個 className 區塊「是否曾被開發者實質編輯過」。
                     * - 若是 Editor className：只要裡面屬性不是全空的 (isEmptyAttribute === false) 就視為修改過。
                     * - 若是一般 className：除了屬性不能全空外，如果 complete 與 precise 不同 (表示開發者加上了 :hover 等偽類或繼承)，也算被修改過。
                     */
                    isModified: isEditorClassName ? !isEmptyAttribute(attributeObj)
                        : (!isEmptyAttribute(attributeObj) || !Util.isEqual(style.complete, style.precise)),
                }
            }
        }
        return lessAttributeObj;
    }

    /**
     * 將已解析的 LESS 屬性物件組合成含 @media 裝置斷點的 CSS 字串。
     * 若 existedObj 有被修改過，會帶入先前的 default 與各裝置樣式。
     *
     * @param {Object} existedObj - 含 isModified、attributeObj 的 LESS 解析結果
     * @returns {string} 組合後的 CSS 字串，如 "color:red; @media @mobile {...}"
     */
    getVarietyDeviceStmts(existedObj) {
        const sign = `/** empty style */`;
        const stmts = [];
        const isModifiedObject = existedObj && existedObj.isModified && existedObj['attributeObj']
        for (const module of LESS_MODULES) {
            const existed = isModifiedObject && existedObj['attributeObj'][module.name];
            stmts.push(`@media @${module.name} {${existed ? existedObj['attributeObj'][module.name] : sign}}`);
        }

        if (isModifiedObject) {
            stmts.unshift(existedObj['attributeObj']['default'])
        }

        return stmts.join('');
    }

    /**
     * 重建所有全新的 LESS 樣式檔案 (styles.less)
     * 會將「預設的 LESS 函式庫」、「裝置/變數宣告」、「舊有開發者寫過的樣式」以及「最新產生的 Component class 名稱」合併成一隻完整的 styles.less 檔案。
     * @param {Array} classNameInfos - 元件的 className 資訊陣列。
     * 範例：[ { component: componentNode, classNames: [{ node, type }] } ]
     */
    async buildAllNewBrandLessFiles(classNameInfos) {
        const self = this;
        const classNames = [];

        // 1. 取得 free_marker/less/libs 底下的所有 .less 共用函式庫（如 reset, variables）
        function getLessLibs() {
            return Util.findFilePathBy(Util.joinRespectingDot(self.freeMarkerRootPath, 'less', 'libs'),
                (file) => Util.isEqual(file.extension, 'less'))
                .map((file) => file.fileNameExtension);
        }

        // 2. 準備產生一個新的 styles.less
        const generator = new ClassGenerator(Util.joinRespectingDot(this.genSourcePath, 'less', `styles.less`), this.nodeOfAncestor);

        // 將第三方 less libs 寫入檔案標頭 (@import "./libs/xxx.less";)
        for (const nameExtension of getLessLibs()) {
            generator.appendInClassHead(`@import "./libs/${nameExtension}";`)
        }

        // 寫入 RWD 等裝置變數宣告 (@mobile: ~'...'; @tablet: ~'...';)
        generator.appendInClassHead(this.getAnnouncementsOfLessDevice().join('\n'))

        // 3. 收集所有的既有 less 檔案來源（包含專案主路徑以及各個 Module Component 中的 less）
        const filesOfLess = [this.projectPlatformSourcePath, ...this.nodeOfAncestor.getLessFilesOfModuleComponent().map((file) => file.absolute)];

        // 解析並合併所有「已經存在的 LESS 屬性設定」（例如開發者手動在 LESS 寫好的 CSS rules），回傳成一個物件對照表
        const existedLessAttributeObj = Util.merO(...filesOfLess.map((each) => this.getObjectOfExistedLessAttribute(each)));
        console.log(existedLessAttributeObj);
        /**
         * 4. 依照每個元件傳入的 classNames，將對應的 styles 寫入 styles.less 中。
         * classNameInfos: [ {component:componentNode, classNames:[ {node, type} ,...] }...]
         * */
        for (const info of classNameInfos) {
            const isEditPage = info.component.isPreciselyEditableComponent(); // 判斷是否為「精確編輯模式」的元件
            generator.appendInClassTail(`/** following for ${info.component.getName()} ${isEditPage ? 'editor' : ''} component used  */\n\n`);

            for (const className of info.classNames) {
                const node = className.node;
                const type = className.type;

                // 取得這個 node 確切的 class name (如：.LoginContainer)
                const preciselyClazzName = node.getClassNameOfLessUsage(className.type);

                // 從剛才解析的歷史資料中，找出舊檔案是否已經有這個 class name 的設定，如果有就帶過來避免遺失開發者的手工樣式
                const existObj = existedLessAttributeObj[preciselyClazzName]; /** 從file裡面找出定義過的屬性敘述*/
                classNames.push(_.upperFirst(preciselyClazzName));

                if (isEditPage) {
                    // 如果是編輯頁面元件，使用 LESS 的 :extend() 繼承原本的基礎樣式，再加上自己的裝置屬性
                    const original = node.getOriginalClassNameOfLessUsage(type);
                    const extendStmt = (type === 'default' && node.isTextFieldView()) ? `BaseEditorTextField` : `${original.value}`
                    const stmt = `.${preciselyClazzName}:extend(.${extendStmt}){${this.getVarietyDeviceStmts(existObj)}}`;
                    generator.appendInClassTail(`${stmt}`);
                } else {
                    // 一般頁面的元件，直接寫入樣式
                    // 若有舊有設定 (existObj) 就使用舊有的完整 class 名稱 (如包含 pseudo class)，否則就使用 preciselyClazzName
                    generator.appendInClassTail(`.${existObj ? existObj.complete : preciselyClazzName} \n                        {${this.getVarietyDeviceStmts(existObj)}}`);
                }

                // 處理完畢後，從暫存的舊資料物件中移除。等跑完迴圈，剩下的就會是已經不再屬於任何元件的 "homeless" 屬性
                delete existedLessAttributeObj[preciselyClazzName];
            }
        }

        // 5. 處理 Homeless (孤兒) 的屬性 (舊檔案中有寫這個樣式，但不在目前產出的元件名單內)
        if (_.size(existedLessAttributeObj) > 0) {
            generator.appendInClassTail(`/** ======== following for homeless ========= */\n\n`);
            for (const clazzName in existedLessAttributeObj) {
                const object = existedLessAttributeObj[clazzName];
                // 如果這個 homeless 屬性真的有被修改填寫內容，才把它加進來保留
                if (object.isModified) {
                    generator.appendInClassTail(`.${object.complete} {${this.getVarietyDeviceStmts(existedLessAttributeObj[clazzName])}}`);
                }
            }
        }
        await new beauty(generator.filePath).formatAll();


        // 6. 收尾寫檔
        generator.needSignature(false);
        generator.disableDefaultImports(); // 因為是 LESS 檔，不需要 JS 的 default imports
        await generator.persist();

        // 將這一次用到的所有 className 寫出成一份 classNameMap.json (可能是給其他工具查表用的)
        await Util.persistJsonFilePrettier(Util.joinRespectingDot(this.genRootPath, 'classNameMap.json'), Util.generateUniqueCodeMap(classNames));

        // 重新透過 Mustache 樣板建立 less/index.js，用來當作所有 LESS 的 entry 進入點
        await Util.deleteFileOrFolder(Util.joinRespectingDot(this.projectPlatformSourcePath, 'less', 'index.js'));
        await this.appendMustacheFile('less.index.mustache', Util.persistByPath(Util.joinRespectingDot(this.genSourcePath, 'less', 'index.js')));
        Util.appendInfo(`persist ./less/index.js succeed`);
    }

    /** 拿到[... '@mobile' ,'@table'] 的陣列 */
    getAnnouncementsOfLessDevice() {
        const announcements = [];
        for (const model of LESS_MODULES) {
            announcements.push(`@${model.name}: ~"${model.rule}";`);
        }
        return announcements;
    }

    /** 拿到less file 但是去掉 @mobile, @tablet 這類宣告*/
    getStringOfRemoveDeviceInfo(string) {
        const stringOfPlatforms = _.map(LESS_MODULES, 'name').map((each) => `(${each})`).join("|");
        const stub = string.split('\n');
        _.remove(stub, (each) => Util.startWithRegex(each.trim(), `@(${stringOfPlatforms})\:`))
        return stub.join('\n');
    }

    /** 把less的 device宣告更新 */
    refactorLessDeviceInfo(file) {
        const stub = this.getStringOfRemoveDeviceInfo(Util.getFileContextInRaw(file.absolute));
        const latest = [...this.getAnnouncementsOfLessDevice(), stub].join('\n');
        Util.appendFile(file.absolute, latest, false, true);
    }

    /** free_marker/template/.  */
    async overrideLessFile() {
        const less = Util.joinRespectingDot(this.freeMarkerRootPath, `less`);
        const files = Util.findFilePathBy(less);
        _.forEach(_.filter(files, (file) => Util.isEqual(file.extension, 'less')),
            (file) => this.refactorLessDeviceInfo(file)
        );

        const to = Util.joinRespectingDot(this.genSourcePath, 'less');
        await Util.copyFromFolderToDestFolder(less, to);
    }

}

export default AppBuilder;
