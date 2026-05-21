/**
 * project-file-handler.ts
 *
 * 功能說明：
 * ProjectFileHandler 是最大的 Builder，負責整個專案的檔案操作、部署、編譯流程。
 * 它組合了 StoreBuilder、ComponentBuilder、AppBuilder 的能力來執行完整的 code generation。
 *
 * 主要職責：
 * - activate(): 執行完整的 build 流程 (Store → Component → App → Style → Config → Rules)
 * - 產生 Firestore Security Rules (generateFirestoreRules)
 * - 產生 Firebase Indexes (generateFireIndexRules)
 * - 產生 Storage Rules (generateStorageRules)
 * - 產生 Cloud Functions 的 server-side code
 * - 管理 persistent / deploy / clean 等生命週期
 * - 支援 web / admin / functions 三個平台的差異化處理
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
import PathBase from "./path-base";
import StoreBuilder from "./store-builder";
import ComponentBuilder from "./component-builder";
import RemoteFunctionHandler from "./remote-function-handler";
import AppBuilder from "./app-builder";
import ClassGenerator from "./class-generator";
import CodegenNode from "./codegen-node";
import Lean from "./lean";
import beauty from "./beauty";

class ProjectFileHandler extends PathBase {
    private deployRemoteRules: boolean;
    private needDeployCloudFunctions: boolean;

    constructor(props) {
        super(props);
        this.initial();
    }

    getClassName() {
        return 'ProjectFileHandler';
    }

    initial() {
        this.deployRemoteRules = true;
        this.needDeployCloudFunctions = true;
        this.enrichComponentStructs(this.isWebPlatform());
    }

    refresh() {
        this.reNewNodeOfAncestor();
        this.initial();
    }

    disableRulesRemoteDeploy() {
        this.deployRemoteRules = false;
    }

    async buildDistAssetFolder() {

        const imagesOfModules = this.nodeOfAncestor.getListOfModuleComponent().map(module => Util.joinRespectingDot(PATH_OF_COMPONENT_MODULE, `${module}/web/images`));
        const imageSourceFolders = [...imagesOfModules, Util.joinRespectingDot(this.projectPlatformPath, 'images')];
        for (const imageSourceFolder of imageSourceFolders) {

            if (fs.existsSync(imageSourceFolder)) {
                await Util.copyFromFolderToDestFolder(imageSourceFolder,
                    Util.persistByPath(Util.joinRespectingDot(this.genRootPath, 'dist', 'images')));
            }
        }
    }

    async persistImageFolder() {
        const images = Util.joinRespectingDot(this.genRootPath, 'dist', 'images');
        if (fs.existsSync(images)) {
            await Util.copyFromFolderToDestFolder(images,
                Util.persistByPath(Util.joinRespectingDot(this.projectPlatformPath, 'images'))
            );
        }
    }

    async leanCodeOfSource() {
        Util.appendInfo('4844151512 leanCodeOfSource ==> destination :', this.genSourcePath);
        const lean = new Lean(this.genSourcePath, ['console.log'], 'react');
        await lean.run();
    }

    async rewriteModulesI18nFiles() {

        /** stmt = main-editor 需要的字串
         *
         * return {
         *     comment: 'main-editor 需要的字串',
         *     name : main-editor',
         * }
         * */
        function getComponentNameByStmt(stmt) {
            const segments = _.split(stmt, ' ');
            return {name: segments[1], comment: _.trim(stmt)};
        }

        /**
         [
         'pageTitleOfMain = "悅譜-首頁";'
         'mainTitleOfHotRhythm = "熱門歌曲";'
         'mainHotRhythmName = "如果不可以";'
         'mainHotRhythmSinger = "明悅";'
         ]
         */
        function getObjectOfKeyMapBySlice(array) {
            const result = {}
            if (_.size(array) > 0) {
                const latest = _.each(array, (raw, index, array) => {
                    if (!_.endsWith(_.trim(raw), ';')) {
                        array[index] = `${raw} ${array[index + 1]}`;
                        array[index + 1] = '?;';
                    }
                })
                const segments = _.remove(latest, (each) => !Util.isEqual(each, '?;'));
                /** Util.appendFile('./watchdog1.txt', segments.join('\n,'), true, true); */
                const content = _.map(segments, each => `"${Util.replaceAllWithSets(each, {
                    from: ' = ',
                    to: '":'
                }, {from: ';', to: ''})}`).join(',\n');
                /** Util.appendFile('./watchdog2.txt', content, true, true); */
                return JSON.parse(`{${content}}`);
            }
            return result;
        }

        /**
         *  return : [
         *     {
         *      name: 'portfolio',
         *      comment: '/** portfolio 需要的字串 ',
         *          i18n: {
         *              pageTitleOfPortfolio: '歌曲列表',
         *                  portfolioRhythmUuidOfSong: '-1',
         *                  portfolioRhythmUuidOfSinger: '-1'
         *          }
         *      },
         *     {
         *      name: 'historyRhythm',
         *          comment: '/** historyRhythm 需要的字串 ',
         *      i18n: { pageTitleOfHistoryRhythm: '歷史搜尋' }
         *     }
         * ]
         */
        function getObjectOfComponentI18n(pathOfi18nFile) {
            /** 取得字串 */
            const segments = _.remove(Util.getSegmentsOfEachLine(Util.getFileContextInRaw(pathOfi18nFile)).map((statement) => _.trim(statement)),
                (each) => !Util.isUndefinedNullEmpty(each));

            /** 藉由'/**'ˊ找到每個component的f起始index  例:[0,3,5,11,15] */
            const itemsOfLatest = _.slice(segments, _.indexOf(segments, SIGN_OF_FIELD_START) + 1, _.indexOf(segments, SIGN_OF_FUNCTION_START));

            /** 藉由index組合出slice array ['/** exam 的需要字串',`aa='bb'`.`bb='cc'`] */
            const indexes = [0, ...Util.findIndexes(itemsOfLatest, (item) => _.startsWith(item, '/** ')), itemsOfLatest.length];

            /** 取得slice array [['XXX需要的字串'],[aa='bb';],[cc='dd';]],*/
            const slices = Util.getSlicesByIndexes(itemsOfLatest, indexes);

            const sum = [];/** {navigator:{aa:'bb',cc:'dd'}}*/
            for (const slice of slices) {
                const stmtOfComponent = slice.shift();
                /** console.log(stmtOfComponent, slice); */
                sum.push({
                    ...getComponentNameByStmt(stmtOfComponent),
                    i18n: getObjectOfKeyMapBySlice(slice)
                })
            }
            return sum;
        }

        /**
         *object {
         *   name: 'navigator',
         *   comment: '/** navigator 需要的字串 ',
         * i18n:{
         *
         *     navigatorToolBarTitle: '明悅科技',
         *
         *    navigatorToolBarCompleteLabelOfInput: '沒有解釋',
         *
         *    navigatorToolBarLogin: '登入',
         *
         *     navigatorKeywordId: 'contents'
         *     }
         */
        function getStringOfModularizedStatement(object) {
            const stmts = [];
            stmts.push(...['\n', object.comment]);
            _.each(object.i18n, (value, key) => {
                stmts.push(`${key} = ${JSON.stringify(value)};`)
                // stmts.push(`${key} = "${value.split('\n').join(`\/n`)}";`)
            })
            return stmts.join('\n');
        }

        if (!this.isWebPlatform()) {
            return;
        }

        const modules = _.filter(this.nodeOfAncestor.getComponents(),
            (component) => component.isModuleComponent() && !component.isExtraComponent).map(each => each.getName());
        /** 拿到 module components ['account', 'navigator']*/

        for (const lang of LANGUAGES_OF_SUPPORT) {
            const modularized = Util.joinRespectingDot(this.genSourcePath, 'i18n', lang, 'ModularizedMyI18n.js');
            const base = Util.joinRespectingDot(this.genSourcePath, 'i18n', lang, 'BaseMyI18n.js');

            const sumsOfModules = getObjectOfComponentI18n(modularized);
            const sumsOfBase = getObjectOfComponentI18n(base);
            for (const nameOfComponent of modules) {

                const filtersOfBase = _.filter(sumsOfBase, (obj) => _.startsWith(obj.name, nameOfComponent));
                const filtersOfModule = _.filter(sumsOfModules, (obj) => _.startsWith(obj.name, nameOfComponent));

                const destination = Util.joinRespectingDot(PATH_OF_COMPONENT_MODULE, `${nameOfComponent}/web/src/i18n/${lang}/${FILE_EXTENSION_OF_I18N}`)
                await Util.deleteSelfByPath(destination, true);
                await Util.persistByPath(destination);
                for (const filterOfBase of filtersOfBase) {
                    const targetWriteIntoModuleI18n = filterOfBase;
                    const filterOfModule = _.find(filtersOfModule, (each) => Util.isEqual(each.name, filterOfBase.name));
                    if (filterOfModule)
                        targetWriteIntoModuleI18n.i18n = Util.merO(filterOfBase.i18n, filterOfModule.i18n);
                    /** Util.appendInfo(`\n語言:${lang}`, `\n模組:${nameOfComponent}`, `\ncontent:`, targetWriteIntoModuleI18n); */
                    /** write into module i18n */
                    Util.appendFile(destination, getStringOfModularizedStatement(targetWriteIntoModuleI18n), false, false);
                    Util.appendInfo(`檔案寫入至 ${destination}`);
                }
            }
        }
    }

    async buildConfig() {

        const sourceObj = this.nodeOfAncestor;
        const baseConfigGenerator = new ClassGenerator(Util.joinRespectingDot(this.genSourcePath, `config`, `BaseConfig.js`), this.nodeOfAncestor);
        baseConfigGenerator.appendClass(`BaseConfig`,{name: 'CommonConfig', from: '../base/CommonConfig'});
        const watermarkObj = Util.merO({
            type: 'string',
            src: 'defaultTexts',
            alpha: 0.35,
            position: 'lowerRight',
            color: '#000',
            textStyle: '20px roboto',
        }, sourceObj.watermark);
        baseConfigGenerator.appendField(`platform`, JSON.stringify(this.platform));
        baseConfigGenerator.appendField(`env`, JSON.stringify(this.env));
        baseConfigGenerator.appendField(`host`, JSON.stringify(this.isProduction() ? sourceObj.host.prod : sourceObj.host.dev));
        baseConfigGenerator.appendField(`watermark`, JSON.stringify(watermarkObj));
        baseConfigGenerator.appendField(`superUserUid`, JSON.stringify(sourceObj.superUserUid));
        baseConfigGenerator.appendField(`locateOfFunctions`, JSON.stringify(sourceObj.locationOfFunctions));
        baseConfigGenerator.appendField(`locateOfFirestore`, JSON.stringify(sourceObj.locationOfFirestore));
        baseConfigGenerator.appendField(`locateOfStorage`, JSON.stringify(sourceObj.locationOfStorage));
        baseConfigGenerator.appendField(`nameOfBrand`, JSON.stringify(sourceObj.title), [], []);
        baseConfigGenerator.appendField(`colorX`, JSON.stringify(sourceObj.colorX), [], []);
        if (sourceObj.liffId) baseConfigGenerator.appendField(`liffId`, JSON.stringify(sourceObj.liffId));
        if (sourceObj.liffChannelId) baseConfigGenerator.appendField(`liffChannelId`, JSON.stringify(sourceObj.liffChannelId));

        const enums = this.getAllEnums();
        for (const key in enums) {
            const objOfMain = enums[key];
            const lang = Object.fromEntries(Object.entries(objOfMain).map(([key, { label }]) => [key, label]));
            const value = Object.fromEntries(Object.entries(objOfMain).map(([key, { value }]) => [key, value]));
            const field = _.upperFirst(key);
            baseConfigGenerator.appendField(`LangOf${field}`, JSON.stringify(lang));
            baseConfigGenerator.appendField(key, JSON.stringify(value));
             baseConfigGenerator.appendFunction(
                { name: `LabelOf${field}`, arrow: true, simple: true }, ['value'], [], [],
                `this.getLabelByValue(this.${key},this.LangOf${field},value)`);
        }

        const version = Util.getStringOfVersionIncrement(Util.getVersionOfJsFile(this.pathOfSourceJS));
        baseConfigGenerator.appendField(`VERSION_OF_PACKAGE_JSON`, JSON.stringify(version));
        Util.appendInfo(`75645461 VERSION_OF_PACKAGE_JSON ==> ${version}`);

        switch (this.platform) {
            case 'admin':
            case 'functions':
                baseConfigGenerator.appendField(`email`, JSON.stringify(sourceObj.email));
                baseConfigGenerator.appendField(`ECPAY_SANDBOX`, JSON.stringify(this.isProduction() ? sourceObj.ecpay.prod : sourceObj.ecpay.dev));
                baseConfigGenerator.appendField(`LINEPAY_SANDBOX`, JSON.stringify(this.isProduction() ? sourceObj.linepay.prod : sourceObj.linepay.dev));
                baseConfigGenerator.appendField(`admin`, JSON.stringify(sourceObj.admin));
                baseConfigGenerator.appendField(`server`, JSON.stringify(sourceObj.server));
                break;
            case 'web':
                baseConfigGenerator.appendField(`useXTunnelDev`, sourceObj.useXTunnelDev);
                baseConfigGenerator.appendField(`firebase`, JSON.stringify(sourceObj.firebase));
                if (sourceObj.hasCookiePassword())
                    baseConfigGenerator.appendField(`password`, JSON.stringify(sourceObj.password));
                const trueOrFalse = sourceObj.navigation && sourceObj.navigation.isScrollingHide
                baseConfigGenerator.appendField(`isScrollingHide`, JSON.stringify(trueOrFalse));
                baseConfigGenerator.appendField(`useCartie`, JSON.stringify(Util.isEqual(sourceObj.useCartie, true)));
                break;
        }

        for (const cloud of this.getAllCloudFunctions()) {
            if (Util.isOrEquals(cloud.type, 'httpOnCall', 'httpOnRequest')) {
                baseConfigGenerator.appendField(`urlOf${Util.upperFirst(cloud.name)}`,
                    `'${new URL(sourceObj.getHostOfCloudFunction(cloud)).href}' /** ${cloud.type} */`)
            }
        }

        await baseConfigGenerator.needIndexFile('Config', [], true);
        await baseConfigGenerator.persist();
    }

    /**
     * 持久化模組元件相關檔案
     * 將在 genSourcePath 中產生好、屬於特定「業務模組」(例如 epay, account) 的檔案
     * 拷貝(分配)回各自獨立的模組資料夾 (PATH_OF_COMPONENT_MODULE) 內。
     * 包括 Component、Store、Functions，以及抽取該模組專屬的 LESS 樣式。
     */
    async persistModuleComponentFiles() {
        const self = this;

        /**
         * 內部輔助函式：負責尋找並將檔案複製回對應模組的資料夾
         * @param {string} module - 模組名稱 (例如 'account')
         * @param {string} folder - 來源資料夾名稱 (例如 'component', 'store')
         * @param {function} predict - 產生目標路徑的 callback 函式
         */
        function persist(module = 'epay', folder = 'store', predict = (file) => Util.appendInfo(file.fileName)) {

            // 檢查某個雲端函式資料夾 (dirName) 是否屬於該模組 (針對 Functions 平台)
            function isFunctionBelong2Module(dirName) {
                const path = Util.joinRespectingDot('./modules', module, FILENAME_OF_SOURCE_JS);
                const source = require(`./${path}`).default;
                return Array.isArray(source.cloudFunctions) ? Util.has(source.cloudFunctions.map(each => each.name), dirName) : false;
            }

            // 尋找目標檔案條件：
            // 1. 如果是 function 平台，判斷該 func 是否歸屬於此 module；否則判斷目錄名稱是否以該 module 名稱開頭。
            // 2. 檔案名稱必須以 KEYWORD_OF_MODULARIZED 開頭 (代表是被模組化拆分出來的檔案)。
            const filesOfDestination = Util.findFilePathBy(Util.joinRespectingDot(self.genSourcePath, folder),
              (each) => (self.isFunctionsPlatform() ? isFunctionBelong2Module(each.dirName) : _.startsWith(_.toLower(each.dirName), _.toLower(module))) &&
                _.startsWith(each.fileName, KEYWORD_OF_MODULARIZED));

            // 將找到的模組檔案複製到各個模組資料夾中
            for (const file of filesOfDestination) {
                const pathOfDestination = Util.joinRespectingDot(PATH_OF_COMPONENT_MODULE, predict(file));

                // 使用 Conservative(保守) 方式複製，通常會判斷開發者手動修改的地方並保留
                if (Util.isFileEditSucceed(file.absolute)) Util.copySingleFileConservative(pathOfDestination, file);
            }
        }

        // 如果產生出的暫存原始碼資料夾不存在，就直接跳過
        if (!fs.existsSync(this.genSourcePath)) {
            Util.appendInfo(`468456146 ${this.genSourcePath} is note created, ignore`);
            return
        }

        // 走訪所有的模組名單
        for (const module of this.nodeOfAncestor.getListOfModuleComponent()) {

            // Web 平台：分配 component 與 store 檔案
            if (this.isWebPlatform()) {
                persist(module, 'component', (file) => `${module}/web/src/component/${file.dirName}/${file.fileNameExtension}`);
                persist(module, 'store', (file) => `${module}/web/src/store/${file.dirName}/${file.fileNameExtension}`);
            }

            // 確保這個模組有對應的普通(非編輯用)元件實體，若無則跳過 (可能是純資料設定)
            const componentOfModule = _.find(this.getComponents(), (each) => !each.isPreciselyEditableComponent() && Util.isEqual(module, each.getName()));
            if (Util.isUndefinedNullEmpty(componentOfModule)) continue;

            // Functions 平台：分配 Cloud Function 相關檔案
            if (this.isFunctionsPlatform())
                persist(module, 'func', (file) => `${module}/functions/src/func/${file.dirName}/${file.fileNameExtension}`);

            /**
             * 獨立處理該模組專屬的 LESS 樣式檔
             * 會自動找出開頭為該模組名稱的 css class (例如 .AccountContainer)，
             * 抽取出來寫進各模組內部的 less/styles.less。
             */
            const instance = new AppBuilder(this.getAppBuildParam());
            const attrs = instance.getObjectOfExistedLessAttribute(this.genSourcePath);
            if (attrs) {
                Util.persistJsonFilePrettier('./temp/getObjectOfExistedLessAttribute.json', attrs).then();
                // 篩選出 classname 開頭與該 module 名稱相符的樣式
                const lessees = _.filter(attrs, (value, key, collection) => _.startsWith(key, _.upperFirst(module)))
                // 刪除模組中舊的 less 目錄
                await Util.deleteSelfByPath(Util.joinRespectingDot(PATH_OF_COMPONENT_MODULE, `${module}/web/src/less`));

                // 建立產生器來製作此模組的專屬 styles.less
                const generator = new ClassGenerator(Util.joinRespectingDot(PATH_OF_COMPONENT_MODULE, `${module}/web/src/less/styles.less`), this.nodeOfAncestor);

                // 加入 RWD 裝置變數宣告 (@mobile, @tablet)
                for (const model of LESS_MODULES) {
                    generator.appendInClassHead(`@${model.name}: ~"${model.rule}";`);
                }
                generator.needSignature(false);
                generator.disableDefaultImports();

                // 將篩選出來的 class 屬性寫入模組 less 中
                for (const less of lessees) {
                    generator.appendInClassTail(`.${less.complete} 
                        {${instance.getVarietyDeviceStmts(less)}}`);
                }

                // 寫檔儲存
                await generator.persist();
            }
        }
    }

    persistBaseFilesToFreeMarkerTemplate() {
        try {
            if (!fs.existsSync(this.genSourcePath)) {
                Util.appendInfo(`${this.genSourcePath} is note created, ignore`);
                return
            }

            for (const file of Util.findFilePathBy(Util.joinRespectingDot(this.genSourcePath, 'base'))) {
                if (Util.isEmptyFile(file.absolute)) {
                    Util.appendInfo(`${file.absolute} is empty file, do not copy`)
                    continue;
                }

                if (_.startsWith(_.toLower(file.fileName), 'common')) {
                    /** back-up to common */
                    const pathOfDestination = Util.joinRespectingDot(this.freeMarkerSourceCommonPath, 'src', 'base', file.fileNameExtension);
                    Util.copySingleFileConservative(pathOfDestination, file);
                } else {
                    /** back-up to platform src */
                    const pathOfDestination = Util.joinRespectingDot(this.freeMarkerSourcePlatformPath, 'src', 'base', file.fileNameExtension);
                    Util.copySingleFileConservative(pathOfDestination, file);

                    /** 因為admin 和 functions 共用 baseFirebase,FirebaseHelper，所以有以下balence措施 */
                    if ((this.isFunctionsPlatform() || this.isAdminPlatform()) &&
                        Util.isOrEquals(file.fileName, 'BaseFirebase', 'FirebaseHelper', 'GCPHelper')) {
                        const pathOfDestination = Util.joinRespectingDot(Util.getPathOfReplaceLastDir(this.freeMarkerSourcePlatformPath, this.isFunctionsPlatform() ? 'admin' : 'functions'), 'src', 'base', file.fileNameExtension);
                        Util.copySingleFileConservative(pathOfDestination, file);
                    }
                }
            }
            Util.appendInfo(`persist free-marker base files succeed`);
        } catch (error) {
            /** 偷懶 hack */
            Util.appendError(error);
        }
    }

    async persistCustomizePackages() {
        const packages = this.nodeOfAncestor.getCustomizePackages().filter((each) => Util.isEqual(each.platform, this.platform));
        for (const folder of packages) {
            const genExtraFolderPath = Util.joinRespectingDot(this.genRootPath, folder.root, folder.getName());
            if (fs.existsSync(genExtraFolderPath)) {
                const destFolderPath = Util.joinRespectingDot(this.projectPlatformPath, folder.root, folder.getName());
                await Util.deleteSelfByPath(destFolderPath, true)
                Util.persistByPath(destFolderPath);
                await Util.copyFromFolderToDestFolder(genExtraFolderPath, destFolderPath);
                Util.appendInfo(`customize folder,persist to ${destFolderPath} succeed`);
            }
        }
    }

    /** 將less/libs/ 底下全部都back-up到 template */
    persistLessLibs() {
        const files = Util.findFilePathBy(Util.joinRespectingDot(this.genSourcePath, 'less', 'libs'), (file) => Util.isEqual('less', file.extension));
        const to = Util.joinRespectingDot(this.freeMarkerRootPath, 'less', 'libs');
        for (const less of files) {
            Util.copySingleFile(less.path, to, less.fileNameExtension, true);
        }
    }

    persistIndexAndLessFiles(...exclude) {
        const files = Util.findFilePathBy(this.genSourcePath,
            (each) => {
                return (
                    Util.isEqual(each.fileNameExtension, `index.js`) ||
                    Util.isEqual(each.fileNameExtension, `test.js`) ||
                    Util.isEqual(each.extension, `less`) ||
                    Util.isEqual(each.fileNameExtension, `app.style.js`) ||
                    Util.isEqual(each.fileNameExtension, `mobile.style.js`) ||
                    Util.isEqual(each.fileNameExtension, `common.style.js`) ||
                    (Util.isEqual(each.folderName, 'i18n') && _.isEqual(each.fileNameExtension, `index.js`))
                )
            },
            'node_modules');
        /** _.isEqual(each.fileNameExtension, `styles.less`)
         *
         * 如果這樣寫less watcher 會找不到 @import /libs/, 而報錯導致build中斷
         * 所以把libs都一起hard save
         */


        for (const file of files) {

            if (_.isEqual(file.fileNameExtension, `index.js`) && !Util.isFileEditSucceed(file.path))
                continue;

            if (Util.isEmptyFile(file.path))
                continue;

            if (Util.has(exclude, file.fileNameExtension)) continue;
            const from = file.absolute;
            const dest = Util.joinRespectingDot(this.projectPlatformSourcePath, from.split(`src`).pop());


            Util.persistByPath(dest);
            Util.copySingleFile(from, dest, '', true);
            Util.appendInfo(`persist ${from} succeed`);
        }
    }

    /** 就是把像是index file, 這樣的手寫檔案放到 genSrc,的相對位置
     * exclude = {
     *      type:
     *      keyword:
     * }
     *     type:fileName,extension, fileNameExtension,
     *     keyword: image, svg, image.svg
     * */
    overrideEachFilesFromFolder(...excludes) {
        const normalizedExcludes = excludes.map((ex) => {
            if (Util.isString(ex)) {
                return { type: 'fileNameExtension', keyword: ex };
            }
            return ex;
        });

        const pathsOfModuleComponent = this.nodeOfAncestor
          .getListOfModuleComponent()
          .map(each => Util.joinRespectingDot(PATH_OF_COMPONENT_MODULE, each, this.platform));

        const fromSourcePaths = [
            this.projectPlatformPath,
            this.freeMarkerSourcePlatformPath,
            this.freeMarkerSourceCommonPath,
            ...pathsOfModuleComponent
        ];

        for (const sourcePath of fromSourcePaths) {
            const fileList = Util.findFilePathBy(sourcePath);

            for (const sourceFile of fileList) {
                const { fileNameExtension } = sourceFile;

                // 提前過濾掉 JS 原始碼檔案
                if (fileNameExtension === FILENAME_OF_SOURCE_JS) continue;

                // 檢查是否符合排除條件
                const isExcluded = normalizedExcludes.some(({ type, keyword }) =>
                  sourceFile[type] === keyword
                );
                if (isExcluded) continue;

                const from = sourceFile.path;
                const relativePath = Util.getRelativePath(libpath.resolve(from), libpath.resolve(sourcePath));
                console.log('845684 from:',from,'\n' +'dest:',sourcePath);

                const dest = Util.joinRespectingDot(this.genRootPath, relativePath);
                const destFolder = libpath.dirname(dest);

                // 確保目的資料夾存在
                if (!fs.existsSync(destFolder)) {
                    Util.appendError(`overrideIndexFiles warning, dest folder not exist
destFolder => '${destFolder}' || sourceFile => '${from}'`);
                    fs.mkdirSync(destFolder, { recursive: true });
                }

                // 執行複製
                Util.copySingleFile(from, dest, '', true);
                Util.appendInfo(`成功複製檔案至 ${dest}`);
            }
        }
    }

    /** *
     * 遞迴的讀取一個node,如果有children就會形成遞迴
     * @param node
     * @param condition 符合條件的node
     * @param task 當條件符合時, 要處理的非同步事項
     * @returns {Promise<void>}
     */
    async recursiveDoingOfNode(node, condition = (node) => node, task = async (node) => node) {
        if (node !== undefined && condition(node)) {
            await task(node);
        }

        if (node.hasChildren()) {
            for (const child of node.getChildren())
                await this.recursiveDoingOfNode(child, condition, task);
        }
    }

    /** *
     * 把所有component 遞迴的讀取一個node,如果有children就會形成遞迴
     * @param node
     * @param condition 符合條件的node
     * @param task 當條件符合時, 要處理的非同步事項
     * @returns {Promise<void>}
     */
    async recursiveDoingOfNodeEachStruct(condition = (node) => node, task = async (node) => node) {
        for (const component of this.nodeOfAncestor.getComponents()) {
            await this.recursiveDoingOfNode(component.getStruct(), condition, task);
        }
    }

    async generateStorageRules(deploy = true) {
        const fileName = 'storage.rules';
        const path = Util.persistByPath(Util.joinRespectingDot(this.genRootPath, fileName))

        const base = this.getStringFromMustache('template.storage.mustache',
            {superUserUid: this.nodeOfAncestor.getStorageSuperUserUid()}).split('\n');
        const permissions = {};
        /** storageFolderPath : permission */
        const task = async (node) => {
            const folderName = node.getStorageFolderName();
            const hasPerm = node.hasPermission();

            // 如果該 folder 已存在且 node 本身沒權限，則不執行更新
            if (permissions[folderName] && !hasPerm) return;

            // 取得基礎權限：優先取專屬權限，否則取預設權限
            const permission = hasPerm ? node.getStoragePermission() : node.getDefaultStoragePermission();

            // 注入寫入限制條件
            permission.write = `${permission.write} && request.resource.size < ${Util.getNumOfFileS(node.fileMaximum)}`;

            // 存回全體變數
            permissions[folderName] = permission;
        };
        await this.recursiveDoingOfNodeEachStruct((node) => node.hasStorageFolder(), task)
        const stmts = [];
        for (const name in permissions) {
            const _stmt = [];
            const normalize = name.split('\/').map((word) => word.startsWith(':') ? `{${Util.getNormalizedStringNotStartWith(word, ':')}}` : word).join('\/');
            _stmt.push(`match ${Util.joinRespectingDot('/', normalize)}/{fileId} {`);
            const permission = permissions[name];
            for (const type in permission) {
                _stmt.push(`allow ${type}: if ${permission[type]}`)
            }
            _stmt.push(`}`);
            stmts.push(_stmt.join('\n'));
        }
        Util.insertToArray(base, Util.getIndexOfContext(base, SIGN_OF_COLLECTION_START), ...stmts);
        await this.buildDeployDocument('storage.rules', base.join('\n'), 'storage', deploy)
    }

    async buildDeployDocument(fileName, conclusion, commandLine = 'firestore:indexes', deploy, prettier = false) {
        const path = Util.persistByPath(Util.joinRespectingDot(this.genRootPath, fileName))
        Util.appendFile(path, conclusion, true, true);
        if (prettier)
            await Util.prettier(path);
        if (deploy) {
            Util.copySingleFile(path, this.nodeOfAncestor.getDirectoryName(), fileName, true);
            await this.executeCommandToFirebaseRemote(`firebase deploy --only ${commandLine}`)
        }
    }

    /** 每次deploy 都要記得切換成對應的project */
    async executeCommandToFirebaseRemote(command) {
        await Util.executeCommandLine(`cd ${this.nodeOfAncestor.getDirectoryName()} && firebase use ${this.nodeOfAncestor.getIdOfProject()} && ${command}`);
    }

    async buildProdWebDistToProjectThanDeploy(deploy = true, npmBuild = true) {
        await Util.deleteSelfByPath(Util.joinRespectingDot(this.genSourcePath, 'test.js'), true);
        await this.leanCodeOfSource();
        if (npmBuild) await Util.executeCommandLine(`cd ${this.genRootPath} && npm run build`)
        const pathOfDestination = Util.joinRespectingDot(this.nodeOfAncestor.getDirectoryName(), 'public');
        const pathOfDistFrom = Util.joinRespectingDot(this.genRootPath, 'dist');
        await this.buildDistAssetFolder();
        Util.persistByPath(pathOfDestination);
        Util.cleanAllFiles(pathOfDestination);
        await Util.copyFromFolderToDestFolder(pathOfDistFrom, pathOfDestination, true, false);
        if (deploy) await this.executeCommandToFirebaseRemote(`firebase deploy --only hosting`)
    }

    async generateFireIndexRules(deploy = true) {
        const indexes = [];
        const fieldOverrides = [];
        const task = async (node) => {
            if(!node.hasPath()) return;
            const attrsAsIndexUsage = {}
            if (_.size(node.idxes) > 0) {
                const all = node.idxes.map(each => ({
                    collectionGroup: Util.getFileNameExtensionFromPath(node.getPath()),
                    queryScope: "COLLECTION",
                    fields: each.map(field => {
                        attrsAsIndexUsage[field.name] = true;
                        const obj = {}
                        obj.fieldPath = field.name;
                        obj[`${field.type}`] = field.rule;
                        return obj;
                    })
                }))
                indexes.push(...all);
            }
            const ignores = node.getPreciseAttributeChildren().filter((each) => each.ignoreI);
            fieldOverrides.push(...ignores.map(ignore => ({
                collectionGroup: Util.getFileNameExtensionFromPath(node.getPath()),
                fieldPath: ignore.getFieldName(),
                indexes: []
                /** 不指定collection的做法 -> indexes: [_.isEqual(ignore.getType(), 'array') ? { arrayConfig: 'NONE' } : { order: 'NONE' }] */
            })))
        }
        await this.recursiveDoingOfNodeEachStruct(((node) => node.hasPath() && node.isArray()), task)
        try {
            await this.buildDeployDocument('firestore.indexes.json', JSON.stringify({indexes,fieldOverrides}), 'firestore:indexes', deploy,true)
        } catch (error) {
            console.log(error.message);
        }

    }

    getFirebaseRuleOfMatchRoute(node) {
        const path = node.getPath();
        const wildcard = `{${node.getName()}}`;
        const normalize = path.split('\/').map((word) => word.startsWith(':') ? `{${Util.getNormalizedStringNotStartWith(word, ':')}}` : word).join('\/');
        if (node.isObject()) return Util.joinRespectingDot('/', node.getNormalizePathOfObjectApi(normalize));
        else if (node.isArray()) return Util.joinRespectingDot('/', normalize, wildcard);
        else throw new ERROR(9999, `cant happened this condition ,name:${node.getName()}, type:${node.getType()}`);
    }

    async generateFireStoreRules(deploy = true) {
        const self = this;
        const base = Util.getFileContextInRaw(Util.joinRespectingDot(this.freeMarkerRootPath, 'template.firestore.rules')).split('\n');
        const stmts = [];

        /** type => update|create|delete|read */
        function appendGetAfterStmts(type, node) {
            const disable = true;
            if (disable) return '';

            if (Util.isOrEquals(type, 'update')) {
                const path = Util.joinRespectingDot('/databases/$(database)/documents', Util.getStringOfPop(self.getFirebaseRuleOfMatchRoute(node), `\/`),
                    `$(request.resource.id)`)
                const getAfter = `getAfter(${path})`;
                const stmt = `&& ${getAfter}.data.updateTime == request.time`;
                return stmt;
            }
            return '';
        }

        const task = async (node) => {
            const _stmts = [];
            const permission = node.getPermission();
            for (const each in permission) {
                _stmts.push(`allow ${each}: if ${permission[each]} ${appendGetAfterStmts(each, node)};`)
            }
            stmts.push(`match ${self.getFirebaseRuleOfMatchRoute(node)} {`, ..._stmts, '}');
        }
        await this.recursiveDoingOfNodeEachStruct((node) => !Util.isEmpty(node.getPath()) && !node.isObjectOfEmpty(), task)
        Util.insertToArray(base, Util.getIndexOfContext(base, SIGN_OF_COLLECTION_START), ...stmts);
        await this.buildDeployDocument('firestore.rules', base.join('\n'), 'firestore:rules', deploy)
    }

    async forAdmin() {
        Util.persistByPath(this.genRootPath);
        await this.appendMustacheFile('admin.package.json.mustache', Util.joinRespectingDot(this.genRootPath,
            `package.json`), {
            projectName: this.nodeOfAncestor.name,
            projectVersion: this.nodeOfAncestor.version,
            projectDescription: this.nodeOfAncestor.description
        });

        Util.copySingleFile(Util.joinRespectingDot(this.freeMarkerRootPath, 'node.babel.config.js'), this.genRootPath, 'babel.config.js', true);
        Util.copySingleFile(Util.joinRespectingDot(this.freeMarkerRootPath, 'node.terser.config.js'), this.genRootPath, 'terser.config.js', true);

        const apiGenerator = new ClassGenerator(Util.joinRespectingDot(this.genSourcePath, `api`, `BaseAdminRemoteApi.js`), this.nodeOfAncestor);
        apiGenerator.appendClass('BaseAdminRemoteApi', {name: 'CommonRemoteApi', from: '../base/CommonRemoteApi'});
        apiGenerator.needIndexFile('AdminRemoteApi',[], true);

        const listenerGenerator = new ClassGenerator(Util.joinRespectingDot(this.genSourcePath, `listener`, `BaseAdminListenerApi.js`), this.nodeOfAncestor);
        listenerGenerator.appendClass('BaseAdminListenerApi', {
            name: 'CommonRemoteApi',
            from: '../base/CommonRemoteApi'
        });
        listenerGenerator.needIndexFile('AdminListenerApi');

        for (const component of this.nodeOfAncestor.getComponents()) {
            new RemoteFunctionHandler(this.getProps(), apiGenerator).buildFetchSubmitApi(component.getStruct(), true)
            new RemoteFunctionHandler(this.getProps(), listenerGenerator).buildListenerFunction(component.getStruct(), true)
        }

        await listenerGenerator.persist();
        await apiGenerator.persist();
        await this.generateStorageRules(this.deployRemoteRules);
        await this.generateFireStoreRules(this.deployRemoteRules);
        await this.generateFireIndexRules(this.deployRemoteRules);
    }

    /**
     * 結合專有名詞（如 SimpleGrid、SimpleSwitch、AccordionDetails 等）的節點重新設定 view，
     * 並根據需要加入子節點、import、props 等。
     * 遞迴處理所有 children，對每個有特殊 view 的節點進行行為豐富化。
     *
     * @param {CodegenNode[]} nodes - 要處理的節點陣列
     * @returns {void}
     *
     * @example
     * handler.enrichNodeWithCustomViewDefined(structNode.getChildren());
     * // => 處理 AccordionDetails → 加入 Accordion wrap、Summary、icon import
     * // => 處理 SimpleGrid → 轉換為 Paper + Grid container 配置
     */
    enrichNodeWithCustomViewDefined(nodes) {
        function handleSizeOfTimeDatePicker(node) {
            if (node.hasSize()) {
                switch (node.getSize()) {
                    case 'small':
                        node.appendViewProps({slotProps: {textField: {size: 'small'}}})
                        break;
                }
            }
        }

        for (const node of nodes) {

            if (Util.isOrEquals(node.getName(), 'updateTime', 'exist', 'exists')) {
                throw new ERROR(9999, `46468464121, ${node.getName()} 是保留字,不能當作屬性`)
            }

            if (node.isPathArray()) {
                const children = node.getPreciseAttributeChildren().map(child => child.getName().trim());
                if (!Util.has(children, 'id')) {
                    node.appendChildrenWithJsons({
                        name: 'id',
                        type: 'string',
                        column: true,
                        incest: node.incest,
                        defaultValue: node.isCheapArray() ? 'contents' : '',
                        description: node.isCheapArray() ? '注意!這裡的id是指cheap array的document id' : '我是unique id,不能被更改',
                        readOnly: true,
                    })
                }
            }

            if (node.view === "AccordionDetails") {
                node.wrapView = "Accordion";
                node.ruleOfOuter = "start";
                node.appendChildrenWithJsons({
                    outer: true,
                    name: "summary",
                    view: "AccordionSummary",
                    needParam:true,
                    props:{expandIcon: `###<${node.icon} />`},
                    children: [{
                        view: "Typography",
                        name: `titleOf${Util.upperFirst(node.getName())}`,
                        type: "string",
                        incest: { view: false, attribute: true },
                        defaultValue: node.title
                    }]
                });
                this.appendMuiIconImport(node, node.getIcon());
            }

            if (node.isTimeDateRangePickerView()) {

                if (node.hasFormat())
                    node.appendViewProps({format: `${node.getFormat()}`})

                if (node.hasLabel()) {
                    const labels = node.getLabel();
                    if (!Array.isArray(labels) || _.size(labels) < 2) throw new ERROR(9999, '746465574 range pick label should be an array');

                    const start = node.getFieldNameOfLabel('start');
                    const end = node.getFieldNameOfLabel('end');
                    node.getParentNode().appendChildrenWithJsons(
                        {
                            name: start,
                            type: 'string',
                            l10n: true,
                            incest: node.incest,
                            defaultValue: _.head(labels)
                        },
                        {
                            name: end,
                            type: 'string',
                            l10n: true,
                            incest: node.incest,
                            defaultValue: _.last(labels)
                        }
                    )

                    node.appendViewProps({
                        localeText: `###{start:${node.getPreciseAttributeParentName()}.${Util.camel('get', start)}(), 
                    end:${node.getPreciseAttributeParentName()}.${Util.camel('get', end)}()}`
                    })

                    handleSizeOfTimeDatePicker(node);
                }

                if (node.hasFormat())
                    node.appendViewProps({format: `${node.getFormat()}`})

                node.getParentNode().appendChildrenWithJsons(
                    {
                        name: node.getFieldNameOfStart(),
                        type: 'timestamp',
                        incest: node.incest,
                        belong2TimeDatePicker: true,
                        column: true
                    },
                    {
                        name: node.getFieldNameOfEnd(),
                        type: 'timestamp',
                        incest: node.incest,
                        belong2TimeDatePicker: true,
                        column: true
                    }
                )

                node.column = false;
            }

            if (node.isTimeDatePickerView()) {
                if (node.hasLabel()) {
                    const label = node.getFieldNameOfLabel();
                    node.getParentNode().appendChildrenWithJsons(
                        {
                            name: label,
                            type: 'string',
                            l10n: true,
                            incest: node.incest,
                            defaultValue: node.getLabel(),
                        }
                    )
                    node.appendViewProps({label: `###${node.getPreciseAttributeParentName()}.${Util.camel('get', label)}()`})
                }

                if (node.hasFormat())
                    node.appendViewProps({format: `${node.getFormat()}`})

                handleSizeOfTimeDatePicker(node);
            }

            if (node.isFloatBackgroundView()) {
                const clone = Util.cloneDeep(node.raw);
                if (!node.getParentNode().hasWrap()) {
                    node.getParentNode().setWrapView('div');
                }
                clone.view = 'img';
                clone.wrapView = 'div';
                const float = {
                    name: 'floatArea',
                    outer: true,
                    view: 'div',
                    type: 'object',
                    children: [
                        clone
                    ]
                }
                node.getParentNode().appendChildrenWithJson(float);
                node.getParentNode().deleteChildrenByNode(node);
            }

            if (node.isArrowOptionView()) {
                const name = node.getName();
                node.setView("div");
                node.setName(Util.camel("area", "of", name));
                if (node.needWrap) node.setWrapView("div");
                node.needParam = true;
                node.click = true;
                node.appendChildrenWithJsons(
                  {
                      name: Util.camel("option", "of", name, "title"),
                      type: `string`,
                      defaultValue: node.defaultTitle,
                      view: "Typography",
                      singleLine: true,
                      description: node.description,
                      incest: { view: false, attribute: true }

                  },
                  {
                      name: Util.camel("option", "of", name, "content"),
                      type: `string`,
                      defaultValue: node.defaultContent ?? '',
                      view: "Typography",
                      singleLine: true,
                      description: node.description,
                      incest: { view: false, attribute: true }
                  },

                  node.useSwitch ? {
                      name: Util.camel("enable", "of", name),
                      needParam: true,
                      view: "Switch",
                      type: 'boolean', // 是attribute child才會被hasInputDialog()才會被呼叫到=>'hack'
                      defaultValue: name.defaultValue,
                      incest: { view: false, attribute: true },
                      description: `關於${name} 的開關功能`
                  }:{
                      name: Util.camel("arrow", "of", name),
                      needParam: true,
                      view: "IconButton",
                      icon: "NavigateNext",
                      type: 'string', // 是attribute child才會被hasInputDialog()才會被呼叫到=>'hack'
                      incest: { view: false, attribute: true },
                      description: `點及後可以進如到詳細頁面`,
                      alertDialog: _.clone(node.alertDialog),
                      props: {
                          edge: "start",
                          color: "inherit"
                      }
                  }
                );
                delete node.alertDialog;
            }

            if (node.isCustomImageButton()) {
                node.setView('IconButton');
                node.needParam = true;
                node.appendChildrenWithJsons({
                    name: `imgOf${Util.upperFirst(node.getName())}`,
                    view: `img`,
                    type: `string`,
                    imgPreview: false,
                    incest: node.incest,
                    defaultValue: `${node.getDefaultValue()}`
                })
            }

            if (node.isTimeDatePickerView() || node.isTimeDateRangePickerView()) {
                node.appendImportStmt({part: '{AdapterDayjs}', from: '@mui/x-date-pickers/AdapterDayjs'});
            }

            if (node.isSimpleSwitch()) {
                node.setView('FormControlLabel');
                node.appendChildrenWithJsons(
                    {
                        injectViewProp: {
                            name: 'control'
                        },
                        view: 'Switch',
                        name: node.getFieldNameOfToggle(),
                        type: 'boolean',
                        incest: node.incest,
                    },
                    {
                        injectViewProp: {
                            name: 'label',
                        },
                        incest: node.incest,
                        view: 'Typography',
                        defaultValue: node.labelOfSwitch,
                        name: node.getFieldNameOfLabel(),
                        l10n: true,
                        type: 'string',
                    })
            }

            if (node.isSimpleGrid()) {
                node.setView('Paper');
                node.setListView('Grid');
                node.appendListProps(
                    {container: true},
                    {spacing: 1}
                )
                node.setClick(true);
                node.appendWrapProps(
                    {item: true},
                    {size: `###${node.getName()}.getXs()`} // mui7之後改成xs -> size
                )
                node.setWrapView('Grid');
                node.appendChildrenWithJsons(
                    {
                        column: true,
                        name: 'route',
                        type: 'string',
                        incest: node.incest,
                        description: '點擊後的導頁'
                    },
                    {
                        column: true,
                        name: 'xs',
                        type: 'number',
                        defaultValue: 1,
                        incest: node.incest,
                        description: '按鈕的比重'
                    },
                    {
                        column: true,
                        name: 'indexOfSequence',
                        type: 'number',
                        incest: node.incest,
                        description: '用來調整順序orderBy'
                    },
                    {
                        column: true,
                        name: 'title',
                        type: 'string',
                        view: 'Typography',
                        incest: node.incest,
                        description: '用來顯示標題'
                    },
                    {
                        column: true,
                        name: 'subTitle',
                        type: 'string',
                        view: 'Typography',
                        incest: node.incest,
                        description: '用來顯示標題'
                    },
                )
            }

            /** 因為belongAutoComplete()是包在AutoComplete裏面的TextField*/
            if (node.hasLabelView()) {
                if (Util.isUndefinedNullEmpty(node.wrapView))
                    node.isSimpleSelected() ? (Util.isUndefinedNullEmpty(node.listWrapView) ? node.setListWrapView('div') : '') :
                        (Util.isUndefinedNullEmpty(node.wrapView) ? node.setWrapView('div') : '')

                if (node.hasLabelViewIcon()) {
                    node.appendChildrenWithJsons({
                        name: `btnOf${Util.upperFirst(node.getName())}`,
                        needParam: true,
                        outer: !node.isSimpleSelected(),
                        listOuter: !!node.isSimpleSelected(),
                        incest: {view: false, attribute: true},
                        view: 'IconButton',
                        injectStyle: node.injectStyle,
                        props: node.labelView.labelIcon.props ?? {},
                        children: [
                            {
                                name: `icon`,
                                view: node.labelView.labelIcon.view,
                            }
                        ]
                    })
                }

                if (node.hasDefaultValueOfLabelView())
                    node.appendChildrenWithJsons({
                        name: node.getFieldNameOfLabel(),
                        type: `string`,
                        view: `Typography`,
                        outer: !node.isSimpleSelected(),
                        listOuter: !!node.isSimpleSelected(),
                        l10n: true,
                        click: node.click,
                        injectStyle: node.injectStyle,
                        incest: {view: false, attribute: true},
                        defaultValue: node.labelView.defaultValue,
                    });

            }

            if (node.isSimperSwiper()) {
                const functionNameOfSwipe = node.getFunctionNameOfSwiper();
                const functionNameOfSlide = node.getFunctionNameOfSwipeSlide();
                node.setView('SwiperSlide');
                node.appendImportStmt({part: '', from: 'swiper/css'});
                node.appendImportStmt({part: '', from: 'swiper/css/pagination'});
                node.appendImportStmt({part: '{Pagination, Autoplay}', from: 'swiper/modules'});
                node.disableObservable = true;
                node.appendListProps({
                    onSwiper: `###(swiper) => {self.${functionNameOfSwipe}(swiper)}`
                });
                node.appendListProps({
                    onSlideChange: `###() => {self.${functionNameOfSlide}()}`
                })

                if (node.hasAutoPlayMechanism()) {
                    node.appendListProps({autoplay: node.autoplay})
                }

                node.appendMethods({
                        functionName: functionNameOfSwipe,
                        params: ['swiper']
                    },
                    {
                        functionName: functionNameOfSlide,
                        params: [],
                    }
                )

                node.setListView('Swiper');
                node.disableListEmptyTip();
                node.appendListProps(
                    {modules: `###[Pagination, Autoplay]`},
                    {navigation: true},
                    {pagination: {clickable: true}},
                    {scrollbar: {draggable: true}},
                )

                node.appendChildrenWithJsons({
                        column: true,
                        name: 'route',
                        type: 'string',
                        incest: node.incest,
                        description: '點擊圖片後的導頁',
                    },
                    {
                        column: true,
                        name: 'image',
                        view: 'img',
                        needWatermark: true,
                        description: '顯示的頁面',
                        wrapView: 'div',
                        click: true,
                        incest: node.incest,
                        type: 'string',
                    }
                );
            }

            const objectOfAppend = {
                label: {
                    name: 'label',
                    type: 'string',
                    l10n: true,
                    description: `作為UI顯示用的顯示字樣`
                },
                value: {
                    name: 'value',
                    type: 'string',
                    description: `作為邏輯判斷的依據`,
                }
            }

            if (node.isSimpleSelected()) {
                node.setType('array');
                node.plural = node.plural ?? 's';
                node.disableObservable = true;
                node.getParentNode().appendChildrenWithJsons({
                    name: `${node.getFieldNameOfSelected()}`,
                    type: node.useStringAsValue() ? 'string' : 'number', /** succeed, fail */
                    column: true,
                    defaultValue: node.getSelectedDefaultValue(),
                    description: `用來註明'${node.getName()} 的 selected欄位'`,
                    incest: node.incest,
                })

                node.setDefaultValue(node.getDefaultValueOfSimpleSelected())
                node.setColumn(false);
                switch (node.getTypeOfSimpleSelected()) {
                    case 'spinner':
                        node.setListView('TextField');
                        if (node.hasSize()) /** 只有outlined 才有size的概念 */
                        node.appendListProps({size: `${node.getSize()}`});
                        if (node.hasColor()) node.appendListProps({color: node.get});
                        if (node.hasVariant()) node.appendListProps({variant: node.getVariant()});
                        if (node.disableBorder()) {
                            node.appendListProps({
                                sx: {
                                    "& fieldset": {border: 'none'},
                                }
                            })
                        }
                        node.setView('MenuItem');
                        node.appendListProps({select: true})
                        this.enrichTextFieldBehavior(node, 'list');
                        break;
                    case 'button':
                        node.setListView('ButtonGroup');
                        node.setView('Button');
                        node.setClick(true);
                        break;
                    case 'radio':
                        node.setListView('RadioGroup');
                        node.setView('FormControlLabel');
                        objectOfAppend.label.view = 'Typography';
                        objectOfAppend.label.injectViewProp = {};
                        objectOfAppend.label.injectViewProp.name = 'label';
                        objectOfAppend.value.view = 'Radio';
                        objectOfAppend.value.injectViewProp = {};
                        objectOfAppend.value.injectViewProp.name = 'control';
                        objectOfAppend.incest = node.incest;
                        break;
                }
                for (const key in objectOfAppend)
                    node.appendChildrenWithJsons(objectOfAppend[key]);

            } else if (node.isTabItemView()) {
                objectOfAppend.type = {
                    name: 'type',
                    type: 'string',
                    description: `因為tab的value是number,不方便作為邏輯一目瞭然的判斷,增加type的選項`,
                }
                objectOfAppend.incest = node.incest;
                objectOfAppend.value.type = 'number';
                objectOfAppend.value.defaultValue = node.getValueOfTabDefault();
                node.click = true;
                for (const key in objectOfAppend) {
                    node.appendChildrenWithJsons(objectOfAppend[key]);
                }
            }

            if (node.hasAlertMenu()) {
                if (node.withoutWrapView()) {
                    node.setWrapView('React.Fragment');
                }
                node.appendWrapContents(this.getContentOfAlertMenu(node, node.alertMenu));
            }

            this.enrichNodeWithCustomViewDefined(node.getChildren());
        }
    }

    appendMuiIconImport(node, icon) {
        node.appendImportStmt({part: icon, from: `@mui/icons-material/${icon}`})
    }

    stmtsOfClickCaution = [`event.stopPropagation()`,
        `if(self.getStore().isAppLoading()) return self.showWarningSnackMessage(i18n.location().toastOfPageIsLoading)`];

    /* typeOfView 可以是 default | list | wrap */
    enrichTextFieldBehavior(node, typeOfView = 'default') {
        const self = this;

        const getContentsOfClickBehavior = (node, functionNameOfCustom) => {
            const stmts = [];
            if (node.hasAlertDialog()) {
                stmts.push(`objectOfParam.view = event;`);
                stmts.push(...self.stmtsOfClickCaution);
                stmts.push(`${node.getFieldNameOfAlertDialog()}.current.open();`);
            }
            stmts.push(`self.${functionNameOfCustom ?? node.getFunctionNameOfClicked(typeOfView)}(objectOfParam);`);
            return stmts.join(`\n`);
        };

        const arrayOfProps = [];
        if (!node.isBelong2AutoComplete() && node.hasLabel()) {
            const label = node.getFieldNameOfLabel('sticky');
            node.getParentNode().appendChildrenWithJsons({
                name: label,
                l10n: true,
                type: 'string', /** succeed, fail */
                defaultValue: node.getLabel(),
                incest: node.incest,
            })

            /** 因為editor後 會把Typography 改成 TextField, 但是 store沒有gen出 getLabelOf${name} 的實作 */
            arrayOfProps.push({
                label: node.isPreciselyEditableComponent() ? node.getDescription() :
                    `###${node.getPreciseAttributeParentName()}.${Util.camel('get', label)}()`
            })
        }

        if (node.hasHelperText()) {
            const fieldNameOfHelperText = node.getFieldNameOfHelperText();
            node.getParentNode().appendChildrenWithJsons(
                {
                    name: fieldNameOfHelperText,
                    type: 'string',
                    editIgnore: true,
                    l10n: true,
                    incest: node.incest,
                    defaultValue: node.getHelperText()
                }
            )

            arrayOfProps.push({
                helperText: `###${node.getPreciseAttributeParentName()}.${Util.camel('get', fieldNameOfHelperText)}()`
            })
        }

        if (node.hasHelperVisual()) {
            const appendContentOfObjectOfProps = (view, position) => {
                if (_.isUndefined(view)) return;
                const hasAlertMenu = !Util.isUndefinedNullEmpty(view.alertMenu);
                const hasClick = _.isEqual(view.click, true);
                let contentOfVisual;
                let contentOfClicked;

                switch (view.type) {
                    case 'icon':
                        self.appendMuiIconImport(node, view.content);
                        contentOfVisual = `<${view.content} />`;
                        break;
                    case 'text':
                        contentOfVisual = `<div >{i18n.location().${node.getFieldNameOfVisualHelper(view, position)}}</div>`;
                        break;
                    default:
                        throw new ERROR(9999, `78751564165156 un support type of ${view.type}`);
                }

                if (hasAlertMenu) {
                    contentOfClicked = self.getStmtsOfAlertMenu(node).join('\n');
                } else if (hasClick) {
                    const functionNameOfVisualIconClick = node.getFunctionNameOfClicked(position, _.isEqual(view.type, 'icon') ? view.content : 'text');
                    node.appendMethods({
                        functionName: functionNameOfVisualIconClick,
                        params: ['param'],
                        comments: ['AlertMenu點擊事件 => 必須 return async () => {instance = param.object}']
                    });
                    contentOfClicked = getContentsOfClickBehavior(node, functionNameOfVisualIconClick);
                }

                if (hasAlertMenu || hasClick) {
                    node.appendImportStmt({part: 'IconButton', from: '@mui/material/IconButton'});
                    contentOfVisual = `<IconButton onClick={(event, value) => {${contentOfClicked}}} edge="${position}">${contentOfVisual}</IconButton>`;
                }

                const adornment = Util.getObject(`${position}Adornment`,`###(<InputAdornment position="${position}">${contentOfVisual}${hasAlertMenu ? self.getContentOfAlertMenu(node, view.alertMenu, Util.camel(`helperVisual`, position)) : ''}</InputAdornment>)`);
                arrayOfProps.push({ slotProps: { input: adornment } });
            };

            const visual = node.getHelperVisual();
            node.appendImportStmt({part: 'InputAdornment', from: '@mui/material/InputAdornment'});
            appendContentOfObjectOfProps(visual.start, 'start');
            appendContentOfObjectOfProps(visual.end, 'end');
        }

        const typeMaps = {
            'email': { id: 'email-address', name: 'email', type: 'email', autoComplete: 'email' },
            'name': { id: 'full-name', name: 'name', type: 'text', autoComplete: 'name' },
            'tel': { id: 'phone-number', name: 'phone', type: 'tel', autoComplete: 'tel' },
            'address': { id: 'address', name: 'address', type: 'text', autoComplete: 'address-line1' },
            'postal-code': { id: 'postal-code', name: 'postalCode', type: 'text', autoComplete: 'postal-code' },
            'username': { id: 'username', name: 'username', type: 'text', autoComplete: 'username' },
            'password': { id: 'password', name: 'password', type: 'password', autoComplete: 'current-password' }
        };

        const config = typeMaps[node.getTypeOfTextField()];
        if (config) {
            arrayOfProps.push(
                { id: config.id },
                { name: config.name },
                { type: config.type },
                { slotProps: { input: { autoComplete: config.autoComplete, inputProps: { autoComplete: config.autoComplete } } } }
            );
        } else {
            arrayOfProps.push({ type: 'text' });
        }

        Util.mergeArrayByKey(arrayOfProps);
        const nameOfDisabled = Util.camel(node.getName(), 'disabled');
        node.getParentNode().appendChildrenWithJsons(
            {
                name: nameOfDisabled,
                type: 'boolean',
                editIgnore: true,
                defaultValue: !!(node.computed === true || node.disabled === true),
                incest: node.incest,
            }
        )
        if (!node.isPreciselyEditableComponent())
            arrayOfProps.push({ disabled: `###${node.getPreciseAttributeParentName()}.${Util.camel('get', nameOfDisabled)}()` });

        if (node.hasTypeOfTextField()) arrayOfProps.push({ type: node.getTypeOfTextField() });
        else if (node.isNumber()) arrayOfProps.push({ type: 'text' });


        switch (typeOfView) {
            case 'default':
                node.appendViewProps(...arrayOfProps);
                break;
            case 'list':
                node.appendListProps(...arrayOfProps);
                break;
        }
    }

    getStmtsOfAlertMenu(node) {
        const stmts = [];
        stmts.push(`objectOfParam.view = event`)
        stmts.push(`${node.getFieldNameOfAlertMenu()}.current.setAnchor(event.currentTarget);`)
        stmts.push(`${node.getFieldNameOfAlertMenu()}.current.open();`)
        stmts.push(`self.${node.getFunctionNameOfClicked()}(objectOfParam)`)
        return stmts;
    }

    /** sign用來標記helperVisual */
    getContentOfAlertMenu(node, alertMenu = [], sign = '') {
        const stringsOfItem = [];
        const implementsOfClicked = []
        for (const item of alertMenu.items) {
            const functionName = node.getFunctionNameOfClicked(Util.camel(item.name, sign));
            implementsOfClicked.push(`{ "onClick":self.${functionName}(objectOfParam)}`);
            node.appendMethods({functionName, params: ['param'], comments: ['AlertMenu點擊事件 => 必須 return async () => {instance = param.object}']});
            const objectOfItem = {};
            objectOfItem.label = item.label;
            objectOfItem.icon = item.icon;
            objectOfItem.id = item.id;
            objectOfItem.loginOnly = item.loginOnly ?? false;
            objectOfItem.notice = item.notice;

            Util.removeAttributeBy(objectOfItem);
            /** 清除掉value為undefined,因為JSON.parse會過不了 */
            stringsOfItem.push(JSON.stringify(objectOfItem));
            if (Util.isString(item.icon)) node.getPreciseAttributeParent().appendChildrenWithJsons({
                name: `iconOf${Util.upperFirst(node.getName())}4Imp${Util.indexOf(alertMenu.items, item)}`,
                type: SIGN_OF_IMPORT_MUI,
                defaultValue: item.icon,
            });
        }

        const nameOfImpl = `implementsOfAlertItemClicked${Util.upperFirst(sign)}`;

        const fieldNameOfItems = `itemsOf${Util.upperFirst(node.getName())}${Util.upperFirst(sign)}`;
        node.listOfImplementsOfAlertItemClicked.push({name: `${nameOfImpl}`, stmts: implementsOfClicked.join(`,`)})
        node.getPreciseAttributeParent().appendChildrenWithJsons({
            name: fieldNameOfItems,
            type: 'arrayOfField',
            l10n: true,
            incest: node.incest,
            defaultValue: JSON.parse(`[${stringsOfItem.join(',')}]`),
        })

        const content = `{self.renderAlertMenu({ref:${node.getFieldNameOfAlertMenu()},
                component:self,items:${node.getPreciseAttributeParentName()}.get${Util.upperFirst(fieldNameOfItems)}().map((item, index) => ({...item, ...${nameOfImpl}[index]}))})}`
        return content;
    }

    /**
     * @param onChangeStmtsOnly 因為這個function有可能會append到onClick的stmts，但是onChange也會單獨用到，避免重複邏輯被寫在一起(this.stmtsOfClickCaution)，這個tag
     * */
    getStmtOfEventInValidate(node, functionName,onChangeStmtsOnly = false) {
        const stmts = [];
        stmts.push(`objectOfParam.view = event;`);
        if (onChangeStmtsOnly) stmts.push(...this.stmtsOfClickCaution);
        if (node.isAttribute() && !node.disableOnChangeSetter) {
            let paramStmt = '';
            if (node.isSwitchView()) {
                paramStmt = `self.getCheckStateByEvent(event)`;
            } else if(node.isSimpleSelected() && !node.isButton()){
                stmts.push(`const latest = ${node.useStringAsValue() ? `event.target.value;` : `Util.toNumber(event.target.value);`}`)
                stmts.push(`objectOfParam.value = latest;`)
                stmts.push(`objectOfParam.event = event;`)
                stmts.push(`${node.getPreciseAttributeParentName()}.${node.getFunctionNameOfSelectSetter()}(latest)`)
            }else if (node.isTextFieldView()) {
                const latest = () => node.hasInputRegEx() ? `self.getLatestValueByEvent(event).replace(${node.getInputRegEx()},'')` : 'self.getLatestValueByEvent(event)';
                stmts.push(`const latestValue = ${node.isNumber() ? `self.handleNumber(event, ${node.getFieldName()})` : `${latest()}`}`);
                if (node.useCache) stmts.push(`Cookie.${Util.camel(`set`, node.getNameOfHierarchicalOfCookieUsage())}(latestValue)`)
                paramStmt = `latestValue`;
                if (node.isBelong2AutoComplete())
                    stmts.push(`self.exeAsyncT(${node.getPreciseAttributeParentName()}.${node.getPreciseViewParent().getFunctionNameOfAutoCompleteInvalidate()}(latestValue))`)
            } else if (node.isSliderView()) {
                paramStmt = `self.getLatestValueByEvent(event)`;
            } else if (node.isAutoCompleteView()) {
                stmts.push(`objectOfParam.value = value`)
                stmts.push(`${node.getPreciseAttributeParentName()}.${Util.camel('set', node.getName())}(value)`)
                stmts.push(`${node.getPreciseAttributeParentName()}.${Util.camel('set', node.getFieldNameOfSelected())}(self.getNumberOfSelected(value))`)
                /**
                 const nodeOfInput = _.find(node.getPreciseAttributeParent().getPreciseAttributeChildren(), (each) => each.isBelong2AutoComplete(), 0);
                 stmts.push(`${node.getPreciseAttributeName()}.${Util.camel('set', nodeOfInput.getName(), node.getName())}(value.getValue())`)
                 */
            } else if (node.isCheckboxView()) {
                stmts.push(`objectOfParam.value = value`)
                stmts.push(`${node.getPreciseAttributeParentName()}.${Util.camel('set', node.getFieldName())}(value)`)
            } else if (node.isSimpleSelected() && node.isButton()) {
                stmts.push(`objectOfParam.object = ${node.getName()}`)
            } else if (node.isTimeDatePickerView()) {
                /**
                 * const YMDHM = Util.getCurrentTimeFormatYMDHM(event.valueOf())`);
                 */
                stmts.length = 0;
                stmts.push(`const dayjs = event`);
                stmts.push(`objectOfParam.value = dayjs`)
                paramStmt = `dayjs`;
            } else if (node.isTimeDateRangePickerView()) {
                stmts.length = 0;
                stmts.push(`const dayjses = event`);
                stmts.push(`objectOfParam.value = dayjses`);
                stmts.push(`${node.getPreciseAttributeParentName()}.${Util.camel('set', node.getFieldName())}(dayjses)`)
                stmts.push(`${node.getPreciseAttributeParentName()}.${Util.camel('set', node.getFieldNameOfStart())}(Util.head(dayjses))`);
                stmts.push(`${node.getPreciseAttributeParentName()}.${Util.camel('set', node.getFieldNameOfEnd())}(Util.last(dayjses))`);
            } else {
                /** throw new ERROR(9999, `8787465452 還沒支援的元件 'name:${node.getName()} view:${node.getView()}' `) */
            }

            if (!Util.isUndefinedNullEmpty(paramStmt))
                stmts.push(`${node.getPreciseAttributeParentName()}.${node.getFunctionNameOfSetter()}(${paramStmt})`);
        }
        stmts.push(`self.${functionName}(${node.isSimpleSelected() ? "value, objectOfParam" : "objectOfParam"})`);
        return stmts.join('\n');
    }

    /**
     * 針對 view 的種類，增加與 Store 互動的規則。
     * 包含 onClick/onChange 事件、value binding、inject style/view/props、
     * AudioPlayer、Button/IconButton、AutoComplete 等元件的行為推導。
     *
     * @param {CodegenNode[]} nodes - 要豐富化行為的節點陣列
     * @returns {void}
     *
     * @example
     * handler.enrichNodesOfBehavior(structNode.getChildren());
     * // => TextField 加上 onChange、label、disabled
     * // => Button 加上 onClick、icon import
     */
    enrichNodesOfBehavior(nodes) {

        function appendPropsOfNode(node, functionOfView, props = [], methods = [], nodesOfParent = []) {

            for (const type of TYPES_OF_PROPS_VIEW) {
                if (functionOfView(type, node)) {
                    switch (type) {
                        case 'list':
                            node.appendListProps(...props)
                            break;
                        case 'listWrap':
                            node.appendListWrapProps(...props)
                            break;
                        case 'wrap':
                            node.appendWrapProps(...props)
                            break;
                        case 'default':
                            node.appendViewProps(...props)
                            break;
                    }
                    node.appendMethods(...methods);
                    for (const _node of nodesOfParent)
                        node.getParentNode().appendChildrenWithJsons(_node)
                }
            }
        }

        function injectStyleBehavior(node) {
            const clazzNameOFDefault = node.getClassNameOfLessUsage();
            const params = [node.getObservableName(true)].filter(each => !Util.isUndefinedNullEmpty(each));

            if (node.needInjectStyle()) {
                const injectFunctionName = node.getFunctionNameOfInjectStyle();
                node.appendMethods({ functionName: injectFunctionName, params });
                node.appendViewProps({style: `###{...self.${injectFunctionName}(${params.join(',')}),...${JSON.stringify(node.getStyle())}, ...Style.${clazzNameOFDefault}}`});
            } else {
                node.appendViewProps({style: `###{...${JSON.stringify(node.getStyle())}, ...Style.${clazzNameOFDefault}}`});
            }

            /** 這個做法有點危險, 如果裏面是指標, 那之前所有的內容都會被更改 */
            const clazzNameOfWrap = node.getClassNameOfLessUsage('wrap');
            if (node.needInjectWrapStyle()) {
                const injectFunctionName = node.getFunctionNameOfInjectStyle('Wrap');
                node.appendMethods({ functionName: injectFunctionName, params });
                node.appendWrapProps({style: `###{...self.${injectFunctionName}(${params.join(',')}),...${JSON.stringify(node.getWrapStyle())}, ...Style.${clazzNameOfWrap}}`});
            } else {
                node.appendWrapProps({style: `###{...${JSON.stringify(node.getWrapStyle())}, ...Style.${clazzNameOfWrap}}`});
            }

            if (node.needInjectListStyle()) {
                node.appendMethods({
                    functionName: node.getFunctionNameOfInjectStyle('List'),
                    params: [node.getPreciseAttributeParentName()]
                });
            }

            if (node.needInjectListWrapStyle()) {
                node.appendMethods({
                    functionName: node.getFunctionNameOfInjectStyle('ListWrap'),
                    params: [node.getPreciseAttributeParentName()]
                });
            }
        }

        function applyInjectBehavior(node) {
            const params = [node.getObservableName(true)].filter(each => !Util.isUndefinedNullEmpty(each));

            if (node.needInjectView()) {
                const nameOfInjectView = node.getFunctionNameOfInjectView();
                node.appendMethods({ functionName: nameOfInjectView, params });
                node.appendContents(`{this.${nameOfInjectView}(${params.join(',')})}`);
            }

            if (node.needInjectWrapView()) {
                const nameOfInjectWrapView = node.getFunctionNameOfInjectWrapView();
                node.appendMethods({ functionName: nameOfInjectWrapView, params });
                node.appendWrapContents(`{this.${nameOfInjectWrapView}(${params.join(',')})}`);
            }

            if (node.needInjectProps()) {
                const functionNameOfInjectProps = node.getFunctionNameOfInjectProps();
                node.appendSimpleProps(`...self.${functionNameOfInjectProps}(${params.join(',')})`);
                node.appendMethods({ functionName: functionNameOfInjectProps, params });
            }
        }

        function applyValueProps(node) {
            if (node.isSimpleSelected()) {
                node.appendListProps({value: `###Util.toString(${node.getPreciseAttributeParentName()}.${node.getFunctionNameOfSelectGetter()}())`});
                node.appendViewProps({value: `###${node.getName()}.value`});
                node.appendContents(`{${node.getName()}.label}`);
            } else if (node.isChipView()) {
                node.appendViewProps({label: `###${node.getName()}`});
            } else if (node.isQRCodeView() || node.isTextFieldView() || node.isRadioView() || node.isSliderView() || node.isTimeDatePickerView() || node.isTimeDateRangePickerView()) {
                node.appendViewProps({value: `###${node.getName()}`});
            } else if (node.isSwitchView() || node.isCheckboxView()) {
                node.appendViewProps({checked: `###${node.getName()}`});
            } else if (node.isAudioPlayer() || node.isImageView() || node.isAvatarView()) {
                node.appendViewProps({src: `###${node.getName()}`});
            } else if (node.isTabItemView()) {
                node.appendViewProps({label: `###${node.getName()}.getLabel()`}, {value: `###${node.getName()}.getValue()`});
            } else if (node.isBadgeView()) {
                node.appendViewProps({badgeContent: `###${node.getName()}`});
            } else if (node.isTimeDatePickerView() || node.isTimeDateRangePickerView() || node.isAutoCompleteView() || node.isIconButton()) {
                /** 不要出現 self.handleTextString() */
            } else if (node.isStringOrNumberAttribute()) {
                node.appendContents(`{self.handleTextString(${node.getFieldName()})}`);
            }
        }

        const applyAudioPlayerBehavior = (node) => {
            if (!node.isAudioPlayer()) return;
            const params = ['param'];
            const endMethod = node.getFunctionNameOfPlayEnd();
            const errMethod = node.getFunctionNameOfPlayError();
            const playMethod = node.getFunctionNameOfOnPlay();

            [endMethod, errMethod, playMethod].forEach(functionName =>
                node.appendMethods({ functionName, params })
            );

            node.appendViewProps(
                { onError: `###(param) => self.${errMethod}(param)` },
                { onEnded: `###(param) => self.${endMethod}(param)` },
                { onPlay: `###(param) => self.${playMethod}(param)` }
            );
        };

        const applyButtonBehavior = (node) => {
            if (!(node.isChipView() || node.isButton() || node.isIconButton())) return;

            node.setClick(true);
            if (!Util.isUndefinedNullEmpty(node.getDefaultValue())) node.l10n = true;

            if (node.hasIcon()) {
                this.appendMuiIconImport(node, node.getIcon());
                switch (node.getView()) {
                    case 'Button':
                        const obj = {};
                        obj[`${Util.camel(node.getAnchorOfButton(), 'icon')}`] = `###<${Util.upperFirst(node.getIcon())} />`;
                        node.appendViewProps(obj);
                        break;
                    case 'IconButton':
                        if (node.needBadge()) {
                            node.needParam = true;
                            node.appendChildrenWithJsons({
                                name: `${Util.camel('badge', 'of', node.getName())}`,
                                incest: {view: false, attribute: true},
                                needParam: true,
                                defaultValue: 0,
                                props: node.propsOfBadge,
                                view: 'Badge',
                                type: 'number',
                                children: [{ name: 'icon', needParam: true, props: node.propsOfIcon, view: node.getIcon() }]
                            });
                        } else {
                            node.appendChildrenWithJsons({ name: 'icon', props: node.propsOfIcon, view: node.getIcon() });
                        }
                        break;
                }
            }
        };

        const applyAutoCompleteBehavior = (node) => {
            if (!node.isAutoCompleteView()) return;
            const name = node.getFieldNameOfSuggest();
            const plural = 's';
            const fieldName = `${name}s`;
            const label = node.getFieldNameOfLabel();
            node.getParentNode().appendChildrenWithJsons({
                    name,
                    type: `array`,
                    plural,
                    incest: node.incest,
                    path: node.path,
                    permission: node.permission,
                    disableOfColumn: node.isDisableOfColumn(),
                    autoFuse: node.useAutoFuse(),
                    cheap: true,
                    column: false,
                    children: [
                        { type: 'string', name: 'value', column: true, description: '本質內容' },
                        { type: 'string', name: 'label', column: true, description: '顯示在屏幕上' },
                        { type: 'number', name: 'type', column: true, description: '用來當作額router' },
                        { name: 'popularLevel', type: 'number', column: true, defaultValue: 1, description: 'order時候,會desc,讓最熱門的項目留在最上方' },
                        { type: 'string', name: 'uid', column: true, description: '用來放document id,由type 判斷路由' },
                        { type: 'string', name: 'extra', column: true, description: '用來放解釋|額外資訊, 也許type很快就忘了起初的定義' }
                    ]
                },
                {
                    name: Util.camel(`key`, 'of', node.getName()),
                    type: 'boolean',
                    incest: node.incest,
                    description: `用來force ${node.getName()} re-render`
                }
            );

            node.getParentNode().appendChildrenWithJson({
                name: node.getFieldNameOfSelected(),
                type: `number`,
                column: true,
                incest: node.incest,
            });

            node.column = false;
            node.appendChildrenWithJsons({
                name: Util.camel(`input`, 'of', node.getName()),
                incest: {view: false, attribute: true},
                view: 'TextField',
                type: 'string',
                column: true,
                size: node.getSize(),
                search: node.search,
                description: node.label,
                belong2AutoComplete: true,
                injectViewProp: { name: 'renderInput', functionalized: true },
                helperVisual: node.helperVisual,
                helpText: node.helpText,
            });

            const stmtOfSuggestGetter = `${node.getPreciseAttributeParentName()}.${Util.camel(`get`, fieldName)}()`;
            node.appendViewProps(
                { freeSolo: true },
                { options: `###${stmtOfSuggestGetter}` },
                { filterOptions: `###(options, state) => options` },
                { isOptionEqualToValue: `###(option, value) => true` },
                { key: `###${node.getPreciseAttributeParentName()}.${Util.camel(`get`, `key`, 'of', node.getName())}()` },
                { getOptionLabel: `###(option) => option.label?? ''` },
                { value: `###self.getSelectedSuggest(${node.getPreciseAttributeParentName()}.${Util.camel(`get`, node.getFieldNameOfSelected())}(), ${stmtOfSuggestGetter})` }
            );

            if (node.hasSize()) {
                node.appendViewProps({size: node.getSize()});
            }

            if (!node.hasLabelView()) {
                node.getParentNode().appendChildrenWithJsons({
                    name: label,
                    type: `string`,
                    incest: node.incest,
                    l10n: true,
                    description: node.label,
                });

                node.appendViewProps({
                    noOptionsText: `###${node.getPreciseAttributeParentName()}.${Util.camel(`get`, label)}()`
                });
            }
        };

        for (const node of nodes) {

            if (node.isTimeStamp()) {
                node.getParentNode().appendChildrenWithJsons({
                    name: `${node.getFieldNameOfValue()}`,
                    type: 'number',
                    belong2TimeStamp: true,
                    defaultValue: -1,
                    incest: node.incest,
                    description: `用來放${node.getName()}的number值，方便比較(Util.orderBy)用`
                })
            }

            if (node.isTypographyView()) {
                node.appendViewProps({whiteSpace: 'pre-line'})
                node.appendViewProps({variant: 'inherit'})
            }

            if (node.isSwitchView()) {
                const nameOfDisabled = Util.camel(node.getName(), "disabled");
                node.getParentNode().appendChildrenWithJsons(
                  {
                      name: nameOfDisabled,
                      type: "boolean",
                      defaultValue: node.disabled,
                      incest: node.incest
                  });
                node.appendViewProps({ disabled: `###${node.getPreciseAttributeParentName()}.${Util.camel("get", nameOfDisabled)}()` });
            }

            if (node.isTextFieldView()) {

                if (!node.hasLabel() && node.hasDescription()) {
                    node.label = node.description;
                }

                if (node.disableBorder()) {
                    node.appendViewProps({
                        sx: {
                            "& fieldset": {border: 'none'},
                        }
                    })
                }

                this.enrichTextFieldBehavior(node, 'default');

                if (node.isString() && !node.isSingleLine() && !node.search) {
                    node.appendViewProps({multiline: '###true'});
                }

                if (node.search) {
                    /** <form action={.} />*/
                    node.setWrapView('form');
                    node.appendWrapProps({action: '.'})

                    /** onSearchPress() */
                    node.appendViewProps({
                        onKeyPress: `###(event, value) => {
                        if(Util.isEqual(event.key ,'Enter')){
                            event.preventDefault();
                            self.${node.getFunctionNameOfSearchPressed()}(${node.getFieldName()},${node.getPreciseAttributeParentName()})
                        } 
                    }`
                    })

                    node.appendMethods({
                        functionName: node.getFunctionNameOfSearchPressed(),
                        params: [node.getFieldName(), node.getPreciseAttributeParentName()],
                        loginOnly: node.hasLoginRequiredDialog(),
                    })

                    /** TextField type={`search`} */
                    /** node.appendViewProps({type: 'search'}) */
                }
            }

            if (node.isChipView()) {
                if (node.hasDeletedView()) {
                    this.appendMuiIconImport(node, node.getIconOfDeleted());
                    node.appendViewProps({deleteIcon: `###<${node.getIconOfDeleted()} />`});
                }
                if (node.hasIcon()) {
                    this.appendMuiIconImport(node, node.getIcon());
                    node.appendViewProps({icon: `###<${node.getIcon()} />`});
                }
            }

            /** 這裡就是放contents的邏輯 <View > {...contents}<View>,*/
            if (node.isImageView()) {
                if(!node.isClickView() && node.imgPreview)
                    node.appendViewProps({ onClick: `###(param) => self.openImageDialog(${node.getName()})` });
            }

            if (node.isCheckboxView()) {
                if (node.hasLabel()) {
                    if (Util.isUndefinedNullEmpty(node.wrapView))
                        node.setWrapView('div');

                    node.appendChildrenWithJsons({
                        name: node.getFieldNameOfLabel(),
                        type: `string`,
                        view: `Typography`,
                        outer: true,
                        l10n: true,
                        click: node.click,
                        injectStyle: node.injectStyle,
                        incest: {view: false, attribute: true},
                        defaultValue: node.label,
                    });
                }

                const nameOfDisabled = Util.camel(node.getName(), "disabled");
                node.getParentNode().appendChildrenWithJsons(
                    {
                        name: nameOfDisabled,
                        type: "boolean",
                        defaultValue: node.disabled,
                        incest: node.incest
                    });
                node.appendViewProps({ disabled: `###${node.getPreciseAttributeParentName()}.${Util.camel("get", nameOfDisabled)}()` });

                if (node.hasIcon()) {
                    this.appendMuiIconImport(node, node.getIcon());
                    this.appendMuiIconImport(node, node.getCheckedIcon());
                    node.appendViewProps({icon: `###<${node.getIcon()} />`}, {
                        checkedIcon: `###<${node.getCheckedIcon()} />`
                    })
                }

            }

            if (node.hasSize())
                node.appendViewProps({size: `${node.getSize()}`})

            if (node.hasMargin())
                node.appendViewProps({margin: `${node.getMargin()}`})

            if (node.isWrapByAppBarView()) {
                node.appendChildrenWithJsons(
                    {
                        name: `whetherAlwaysHidden`,
                        needParam: true,
                        type: 'boolean',
                        defaultValue: false,
                        incest: {view: false, attribute: true},
                        description: '是否keep navigator hidden的開關'
                    }
                );
            }

            if (node.isWrapByAppBarView() && !node.isScrollingHideDependOnRootNode()) {
                node.appendWrapProps({position: 'static'})
            }

            applyButtonBehavior(node);

            if (node.isRestfulBean()) {
                node.appendChildrenWithJsons({
                    name: 'status',
                    column: true,
                    description: '我是server處理完的結果, 回傳succeed/fail',
                    type: 'string', /** succeed, fail */
                    incest: node.incest,

                }, {
                    name: 'message',
                    column: true,
                    description: '我是server處理完的結果, 如果fail,reason就寫在這裡',
                    type: 'string', /** fail reason */
                    incest: node.incest,
                })

            }

            if (node.needVisibleHook()) {
                const nameOfHook = Util.camel(`is`, node.getName(), 'visible');
                node.getParentNode().appendChildrenWithJsons({
                    name: nameOfHook,
                    type: `boolean`,
                })

                node.appendWrapProps(
                    {anchor: `${node.getAnchorOfDrawer()}`},
                    {open: `###${node.getPreciseAttributeParentName()}.${Util.camel('get', nameOfHook)}()`},
                    {onClose: `###() => ${node.getPreciseAttributeParentName()}.${Util.camel('set', nameOfHook)}(false)`},
                    {onOpen: `###() => ${node.getPreciseAttributeParentName()}.${Util.camel('set', nameOfHook)}(true)`}
                )
            }
            applyValueProps(node);

            if (node.needWatermark) {
                node.getParentNode().appendChildrenWithJsons({
                    name: `${Util.camel(node.name, 'origin')}`,
                    type: `string`,
                    column: true,
                    incest: node.incest,
                })
            }

            if (node.hasAlertDialog()) {
                if (node.withoutWrapView())
                    node.setWrapView('React.Fragment');
            }

            if (node.isViewPropsFunctionality()) {
                node.simpleProps.push(`...${STRING_OF_INJECT_PARAM}`);
            }

            if (node.needTestButton()) {
                node.getParentNode().appendChildrenWithJsons({
                    view: 'Button',
                    type: 'string',
                    name: 'testUsage',
                    click: true,
                    variant: 'outlined',
                    defaultValue: '測試按鈕',
                    incest: node.incest,
                })
            }

            applyAutoCompleteBehavior(node);

            const funcName = node.isSimpleSelected() ? node.getFunctionNameOfOnSelectedChange() : node.getFunctionNameOfOnChanged();
            appendPropsOfNode(node, node.needOnChangeBehavior,
                [{onChange: `###(event, value) => {${this.getStmtOfEventInValidate(node, funcName, true)}}`}],
                [{
                    functionName: funcName,
                    params: node.isSimpleSelected() ? ["value", `param`] : ["param"],
                    loginOnly: node.hasLoginRequiredDialog(),
                }],
            )

            const propsOfTab = node.isTabListView('list') && node.beingScrollable() ?
                [{variant: "scrollable"}, {scrollButtons: true}, {allowScrollButtonsMobile: true}] : [{centered: true}]

            appendPropsOfNode(node, node.isTabListView,
                [
                    ...propsOfTab,
                    {value: `###${node.getParentNode().getName()}.getValueOf${Util.upperFirst(node.getName())}ClickedTab()`}], [],
                [
                    {
                        name: `valueOf${Util.upperFirst(node.getName())}ClickedTab`,
                        type: `number`,
                        defaultValue: node.getValueOfTabDefault(),
                    }
                ]
            )

            applyAudioPlayerBehavior(node);

            if (node.isClickView()) this.onClickBehavior(node);
            if (node.hasWrapClick()) this.onClickBehavior(node, 'wrap');

            if (!node.isPathArray() && node.listEmptyTip.isDefaultValue) {
                node.disableListEmptyTip()
            }
            injectStyleBehavior(node);
            applyInjectBehavior(node);
            if (node.hasVariant())
                node.appendViewProps({variant: node.getVariant()})

            if (node.hasColor()) {
                node.appendViewProps({color: node.getColor()})
            }
            this.enrichNodesOfBehavior(node.getChildren());
        }
    }

    onClickBehavior(node, type = 'default') {
        const functionNameOfClicked = node.getFunctionNameOfClicked(type);
        node.appendMethods({
            functionName: functionNameOfClicked,
            params: ['param'],
            loginOnly: node.hasLoginRequiredDialog(),
        })
        let funcOfAppendProp;
        switch (type) {
            case 'default':
                funcOfAppendProp = node.appendViewProps.bind(node);
                break;
            case 'wrap':
                funcOfAppendProp = node.appendWrapProps.bind(node);
                break;
            case 'list':
                funcOfAppendProp = node.appendListProps.bind(node);
                break;
            default:
                throw new ERROR(9999, `830918901231298 unknown type => ${type}, from node => ${node.getName()}`);
        }


        if (node.hasDeletedView()) {
            node.appendMethods({
                functionName: node.getFunctionNameOfDeleted(),
                params: ['param'],
                loginOnly: node.hasLoginRequiredDialog(),
            });
        }
        const onClickStmts = [`objectOfParam.view = event;`, ...this.stmtsOfClickCaution];
        const onDeleteStmts = [`objectOfParam.view = event;`, ...this.stmtsOfClickCaution];
        if (node.hasLoginRequiredDialog()) {
            onClickStmts.push(
                `if(!UserInfoRef.isLoginWithSucceed()) {
                        self.enableLoginConfirmDialog();
                        return;
                    }`)
        }
        if (node.hasConfirmDialog()) {
            const stmts = [`${node.getFieldNameOfAlertDialog()}.current.open();`]
            node.isAlertDialog4Deleted() ? onDeleteStmts.push(...stmts) : onClickStmts.push(...stmts);
        } else if (node.isTabItemView()) {
            onClickStmts.push(`objectOfParam.changed = !Util.isEqual(self.getStore().getValueOf${Util.upperFirst(node.getName())}ClickedTab(), ${node.getName()}.getValue()); /** tab是否有改變，還點擊同一個 */`)
            onClickStmts.push(`self.getStore().setValueOf${Util.upperFirst(node.getName())}ClickedTab(${node.getName()}.getValue())`)
            onClickStmts.push(`${this.getStmtOfEventInValidate(node, functionNameOfClicked)}`)
        } else if (node.hasCustomViewDialog()) {
            const stmts = [`${node.getFieldNameOfAlertDialog()}.current.open();`]
            node.isAlertDialog4Deleted() ? onDeleteStmts.push([...stmts, `self.${node.getFunctionNameOfDeleted()}(objectOfParam)`]) :
                onClickStmts.push(...stmts, `self.${functionNameOfClicked}(objectOfParam)`);
        } else if (node.hasAlertMenu()) {
            onClickStmts.push(...this.getStmtsOfAlertMenu(node))
        } else {
            onClickStmts.push(`${this.getStmtOfEventInValidate(node, functionNameOfClicked)}`)
        }

        if (node.hasDeletedView() && node.isAlertDialog4Deleted()) {
            onClickStmts.push(`${this.getStmtOfEventInValidate(node, functionNameOfClicked)}`)
            funcOfAppendProp({onDelete: `###(event, value) => {${onDeleteStmts.join('\n')}}`})
            funcOfAppendProp({onClick: `###(event, value) => {${onClickStmts.join('\n')}}`})
        } else if (node.hasDeletedView() && node.isAlertDialog4Click()) {
            /** alertDialog 不是為了deleted*/
            onDeleteStmts.push(...[`objectOfParam.view = event;`, `self.${node.getFunctionNameOfDeleted()}(objectOfParam)`])
            funcOfAppendProp({onClick: `###(event, value) => {${onClickStmts.join('\n')}}`});
            funcOfAppendProp({onDelete: `###(event, value) => {${onDeleteStmts.join('\n')}}`})
        } else {
            funcOfAppendProp({onClick: `###(event, value) => {${onClickStmts.join('\n')}}`})
        }
    }

    enrichReferenceNode(nodes) {
        for (const node of nodes) {
            if (node && node.isReferenceNode()) {

                const nodeOfReference = node.getNodeOfReference();
                node.ref = nodeOfReference;

                if (node.imitate) {
                    const nodeOfImitate = _.clone(nodeOfReference);
                    /**  clone 的物件 */
                    nodeOfImitate.ref = nodeOfReference;
                    nodeOfImitate.nodeOfOrigin = node;
                    nodeOfImitate.incest = node.incest;
                    nodeOfImitate.disableInitFetch = node.isDisableInitFetch()
                    /**  source.js 上的點 */
                    Util.replaceArrayByContentIndex(node.getParent().getChildren(), node, nodeOfImitate);
                }
            }
            this.enrichReferenceNode(node.getChildren());
        }
    }

    async forCloudFunctions() {
        Util.persistByPath(this.genRootPath);
        await this.appendMustacheFile('functions.package.json.mustache', Util.joinRespectingDot(this.genRootPath,
            `package.json`), {
            projectName: this.nodeOfAncestor.name,
            projectVersion: this.nodeOfAncestor.version,
            projectDescription: this.nodeOfAncestor.description
        });

        Util.copySingleFile(Util.joinRespectingDot(this.freeMarkerRootPath, 'node.babel.config.js'),
            this.genRootPath, 'babel.config.js', true);
        Util.copySingleFile(Util.joinRespectingDot(this.freeMarkerRootPath, 'node.terser.config.js'),
            this.genRootPath, 'terser.config.js', true);

        Util.copySingleFile(Util.joinRespectingDot(this.freeMarkerRootPath, 'template.function.index.js'),
            this.genRootPath, 'index.js', true);

        const apiGenerator = new ClassGenerator(Util.joinRespectingDot(this.genSourcePath, `api`, `BaseAdminRemoteApi.js`), this.nodeOfAncestor);
        apiGenerator.appendClass('BaseAdminRemoteApi', {name: 'CommonRemoteApi', from: '../base/CommonRemoteApi'});
        apiGenerator.needIndexFile('AdminRemoteApi', [], true);

        for (const component of this.nodeOfAncestor.getComponents()) {
            new RemoteFunctionHandler(this.getProps(), apiGenerator).buildFetchSubmitApi(component.getStruct(), true)
        }

        await apiGenerator.persist();
        const appGenerator = new ClassGenerator(Util.joinRespectingDot(this.genSourcePath, 'app.js'), this.nodeOfAncestor);
        appGenerator.appendImport('* as logger', 'firebase-functions/logger');
        appGenerator.appendImport('{setGlobalOptions}', 'firebase-functions/v2');
        appGenerator.appendImport('{onCall, onRequest}', "firebase-functions/v2/https")
        appGenerator.appendImport('{onSchedule}', "firebase-functions/v2/scheduler")
        appGenerator.appendInClassHead(...[`setGlobalOptions({ region: "${this.nodeOfAncestor.locationOfFunctions}" })\n`, 'Util.disableLogMessagePersistent()'])

        // appGenerator.appendImport('firebase', './base/FirebaseHelper');
        // appGenerator.appendImport('admin', 'firebase-admin')
        for (const func of this.getAllCloudFunctions()) {
            await this.buildFunctionImplement(func);
            const functionName = func.getName();
            const fieldName = _.upperFirst(functionName);
            appGenerator.appendImport(fieldName, `./func/${functionName}`)
            appGenerator.appendCloudFunctionStatement(func);
        }
        await appGenerator.persist();
    }

    async buildFunctionImplement(func) {
        const {
            functionName,
            fieldName,
            functionNameOfHandleBy,
            typeOfFunction,
            params,
            argumentz
        } = func.getCloudFunctionInfo()
        const baseClass = `Base${fieldName}`;
        const generator = new ClassGenerator(Util.joinRespectingDot(this.genSourcePath, 'func', func.getName(), `${baseClass}.js`), this.nodeOfAncestor);
        generator.appendClass(baseClass, {name: `BaseFunction`, from: '../../base/BaseFunction'})
        generator.appendAsyncFunction(functionNameOfHandleBy,
            [...argumentz], [], [typeOfFunction.startsWith('onCall') ? `session === firebase auth` : '', `payload:${JSON.stringify(func.payload ?? 'needless payload')}`]);
        generator.appendFunction({ name: 'getName', arrow: true, simple: true }, [], [], [], `'${func.getName()}'`)
        if (func.isCommonModule) {
            const moduleClassName = `${KEYWORD_OF_MODULARIZED}${fieldName}`;
            const moduleGenerator = new ClassGenerator(Util.joinRespectingDot(this.genSourcePath, 'func', func.getName(), `${moduleClassName}.js`), this.nodeOfAncestor);
            moduleGenerator.appendClass(moduleClassName, {name: baseClass, from: `./${baseClass}`});
            moduleGenerator.needSignature(false);
            moduleGenerator.appendAsyncFunction(functionNameOfHandleBy, [...argumentz], [], []);
            moduleGenerator.needIndexFile(`${fieldName}`, [], true);
            await moduleGenerator.persist();
        } else {
            generator.needIndexFile(fieldName, [], true);
        }

        await generator.persist();
    }

    enrichComponentStructs = (needEditComponent = false) => {

        function getStmtsOfAfterSubmit(node) {
            if (node.needWatermark) {
                return `asyncTaskOfAfterSubmit:(remoteUrls) => {
                ${node.getPreciseAttributeParentName()}.${Util.camel('set', node.getName())}(remoteUrls[0].watermark);
                ${node.getPreciseAttributeParentName()}.${Util.camel('set', node.getName(), 'origin')}(remoteUrls[0].origin);
                }`
            } else {
                return `asyncTaskOfAfterSubmit:(remoteUrls) => ${node.getPreciseAttributeParentName()}.${Util.camel('set', node.getName())}(remoteUrls[0])`;
            }
        }

        function getEditorComponents() {
            /** 先把edit component 做好放到components */
            const editorComponents = [];
            for (let component of source.getComponents()) {
                if (component.needEditPage()) {
                    const editorComponent = Util.cloneDeep(component);
                    editorComponent.setTitle(`${editorComponent.getTitle()}`);
                    editorComponent.setEvents([]);
                    editorComponent.setIsEditableComponent(true)
                    editorComponent.setPath(editorComponent.getPath() + `editor`);
                    editorComponent.getStruct().setOriginalName(editorComponent.getStruct().getName());
                    editorComponent.getStruct().setNameModified(true);
                    editorComponent.getStruct().setName(Util.camel(editorComponent.getStruct().getName(), 'editor'))
                    toEditorPageStruct(editorComponent.getStruct());
                    editorComponents.push(editorComponent);
                }
            }
            return editorComponents;
        }

        function toEditorPageStruct(node) {

            if (node.isColumnAttribute() && !node.isCollection()) {
                if (node.isImageView()) {
                    node.needImageDialog = false;
                    node.appendViewProps({
                        onClick: `###(param) => self.onImageEditorClicked({
                         needWatermark:${node.needWatermark ? 'true' : 'false'},
                         folderName:'${node.getStorageFolderName()}',
                         asyncTaskOfBeforeSubmit:(localUrls) => ${node.getPreciseAttributeParentName()}.${Util.camel('set', node.getName())}(localUrls[0]),
                         ${getStmtsOfAfterSubmit(node)}
                        })`
                    })

                    /** 為了讓url顯示出來,加快編輯速度 */
                    const parent = node.getParentNode();
                    if (parent.isArray()) {
                        parent.appendChildrenWithJsons({
                            name: node.getName(),
                            view: 'TextField',
                            incest: node.incest,
                            column: true,
                            shadow: true,
                            description: `${node.getName()} 的實體位置`,
                            type: node.getType(),
                            viewProps: [{variant: `outlined`}],
                        });
                    }
                } else {
                    /** 這裡目前就是指 type === string | number*/
                    node.setViewModified(true);
                    node.setOriginalView(node.getView());
                    node.setView('TextField');
                    node.appendViewProps({variant: `outlined`});
                    if (node.isReadOnly()) node.appendViewProps({InputProps: {readOnly: true,}})
                }
            }
            node.setClick(false);
            if (node.isView() && node.isAttribute() && !node.isCollection() && !node.isColumnAttribute()) delete node.view;
            /** 就是把不是遠端欄位的UI給刪掉 */

            if (node.isColumnArray() || node.isPathArray()) {
                node.disableSelectedArray();
                if (Util.isOrEquals(node.getListView(), 'Swiper', 'TextField', 'FormControlLabel', 'RadioGroup', 'Grid')) node.setListView('div');
                if (Util.isOrEquals(node.getView(), 'SwiperSlide', 'MenuItem', 'FormControlLabel', 'RadioGroup', 'Grid')) node.setView('div');
                node.setWrapView('div');
                node.appendWrapContents([`{this.renderItemEditorView(
                   ${node.getFunctionNameOfItemEditorWithParam()} , ${Util.toString(node.hasPath())}
                ,'${node.getPreciseAttributeParentName()}-${node.getName()}')}`]);
                const style = {borderStyle: 'solid', borderWidth: '1px', margin: '10px', borderRadius: '10px'}
                node.appendWrapStyle({...style, borderColor: 'red'});
                node.appendListStyle({...style, borderColor: 'blue'});
                node.appendListContents([`{this.renderCollectionEditorView(
                   ${node.getFunctionNameOfCollectionEditorWithParam()}, ${Util.toString(node.hasPath())}
                ,'${node.getPreciseAttributeParentName()}-${node.getName()}')}`]);
            } else if (node.isObject() && node.hasPath()) {
                node.setWrapView('div');
                const style = {borderStyle: 'solid', borderWidth: '1px', margin: '10px', borderRadius: '10px'}
                node.appendWrapStyle({...style, borderColor: 'green'});
                node.appendWrapContents([`{this.renderObjectEditorView(
                   ${node.getFunctionNameOfCollectionEditorWithParam()}, ${Util.toString(node.hasPath())}
                ,'${node.getPreciseAttributeParentName()}-${node.getName()}')}`]);
            }

            for (const child of node.getChildren()) if (!child.editIgnore) toEditorPageStruct(child);
        }

        const source = this.nodeOfAncestor;
        const getNodes = () => source.getComponents().map(component => component.getStruct())
        this.enrichNodeWithCustomViewDefined(getNodes());
        if (needEditComponent && _.isEqual(this.env, 'dev')) source.getComponents().push(...getEditorComponents());
        /** 編輯模式只有在dev */
        this.enrichNodesOfBehavior(getNodes());
        this.enrichReferenceNode(getNodes())
    }

    getAppBuildParam = () => {
        return {nodeOfAncestor: this.nodeOfAncestor, ...this.getProps()}
    }

    async forNewLess() {
        Util.appendInfo(this.nodeOfAncestor.components.map((each) => {
            return {name: each.getName(), editor: each.isPreciselyEditableComponent(), module: each.isModuleComponent()}
        }))
        await Util.cleanChildFiles(this.genRootPath, (each) => true, 'node_modules');

        const totalClassNames = [];
        for (let component of this.nodeOfAncestor.components) {
            const {classNames, events} = await new ComponentBuilder(this.getProps()).buildBaseComponent(component);
            _.remove(classNames, (each) => !_.isEqual(component, each.node.getNodeOfComponent()))
            /** 表示這可能是reference node產生出來className, 所以要filter */
            totalClassNames.push({component, classNames});
        }
        await new AppBuilder(this.getProps()).buildAllNewBrandLessFiles(totalClassNames);
    }

    async forWeb() {
        const totalClassNames = [];
        const totalEvents = [];
        for (let component of this.nodeOfAncestor.components) {
            const result = await new ComponentBuilder(this.getProps()).buildBaseComponent(component);
            if (result !== undefined) {
                const classNames = result.classNames;
                const events = result.events;
                _.remove(classNames, (each) => !_.isEqual(component, each.node.getNodeOfComponent()))
                /** 表示這可能是reference node產生出來className, 所以要filter */
                totalClassNames.push({component, classNames});
                totalEvents.push(...events);
            }

            if (!component.isPreciselyEditableComponent() && component.getStruct().isAttribute())
                await new StoreBuilder(this.getProps()).buildBaseStore(component.getStruct());
        }
        /** 因為 用到 method getGenStores(),stores 要等 gen出來才知道, 必須放在這邊 */
        await new StoreBuilder(this.getProps()).buildStoreIndexFiles();
        await new AppBuilder(this.getProps()).buildAllNewBrandLessFiles(totalClassNames);
        await new AppBuilder(this.getProps()).buildStyleFiles(totalClassNames);
        await new AppBuilder(this.getProps()).buildAppIndexFiles();
        await new AppBuilder(this.getProps()).buildI18n();
        await new AppBuilder(this.getProps()).buildRouterFile();
        await new AppBuilder(this.getProps()).buildCookieFiles();
        await this.buildDistAssetFolder();
        if (!ENABLE_FAST_DEVELOP_MODE) {
            await new AppBuilder(this.getProps()).buildWebpackNPackageJson();
            await new AppBuilder(this.getProps()).buildCloudFunctionsApi();
            await new AppBuilder(this.getProps()).buildHtmlIndexAssetsFile();
        }
        await this.buildTemplateHtml();
    }

    async buildTemplateHtml() {
        await this.appendMustacheFile('template.html.mustache', Util.joinRespectingDot(this.genRootPath,
            'template.html'), {
            disableOfHtmlScale: this.nodeOfAncestor.disableOfHtmlScale,
            verification: this.nodeOfAncestor.verification
        });
    }

    async buildLessToCss() {
        const files = Util.findFilePathBy(this.genSourcePath, (file) => _.isEqual(file.extension, 'less'));
        for (const each of files) {
            await Util.executeCommandLine(`lessc ${each.absolute} ${Util.joinRespectingDot(each.dirPath, `${each.fileName}.css`)}`);
        }
    }

    buildCustomizePackages = async () => {
        await new AppBuilder(this.getProps()).buildCustomizeFiles(
            this.nodeOfAncestor.getCustomizePackages().filter((each) => _.isEqual(each.platform, this.platform)));
    }
    setFunctionNeedDeploy(need = true) {
        this.needDeployCloudFunctions = need;
    }

    async deployFunctionsToProd() {
        const clouds = this.getAllCloudFunctions();
        const command = _.filter(clouds, (cloud) => cloud.deployToRemote).map(cloud => `functions:${cloud.getName()}`).join(',');
        await this.executeCommandToFirebaseRemote(`firebase deploy --only "${command}" --force`)
    }

    async cleanGenDirectory() {
        await Util.cleanAllFiles(this.genRootPath);
    }

    async incrementProjectVersion() {
        const origin = this.nodeOfAncestor.version;
        const stringOfLatestVersion = Util.isValidVersionOfString(origin) ? Util.getStringOfVersionIncrement(origin) : '1.0.1';
        this.nodeOfAncestor.version = stringOfLatestVersion;
        await Util.rewriteAttributeOfSourceJs(this.pathOfSourceJS, {version: stringOfLatestVersion});
    }

    /**
     * 執行全量或快速編譯流程。
     * 在 production 或未安裝專案時強制全量編譯，
     * 否則根據 rapidBuild 設定只編譯指定的 component。
     *
     * @returns {Promise<void>}
     *
     * @example
     * const handler = new ProjectFileHandler(buildObject);
     * await handler.activate();
     * // => 根據 source.js 的 rapidBuild 設定執行全量或快速編譯
     */
    async activate() {
        const self = this;
        let enableOfRapid = this.isProduction() || this.isUnInstallProject() ? false : !!this.nodeOfAncestor.rapidBuild.enable;
        const components = this.nodeOfAncestor.rapidBuild.componentName;

        if (this.isAdminPlatform() || this.isFunctionsPlatform())
            enableOfRapid = false;

        if (!enableOfRapid) {
            return await self.execute();
        }


        if (this.isWebPlatform() && enableOfRapid) {
            ENABLE_FAST_DEVELOP_MODE = true;
            /** typeof [array] 會 return object */
            switch (typeof components) {
                case 'object':
                    if (Array.isArray(components))
                        for (const component of components) {
                            TARGET_COMPONENT_FAST_DEVELOP_MODE = component;
                            await self.execute()
                            await self.refresh()
                        }
                    break;
                case 'string':
                    TARGET_COMPONENT_FAST_DEVELOP_MODE = components;
                    await self.execute();
                    break;
                default :
                    throw new ERROR(9999, `84515156 enable rapid build, but componentName is not valid`);
            }
        }
    }

    /** 增加「全端工程師」快捷好用的alias */
    generateShellScript = async () => {
        // 1. 基礎參數整理
        const projectSlug = this.nodeOfAncestor.idOfProject; // e.g., 'yueh-pu'

        // 2. 格式化變數名稱：將 'yueh-pu' 轉為 'YuehPu'，確保 Alias 名稱合法
        const variable = _.upperFirst(_.camelCase(projectSlug));
        const dirOfAliasFile = `/Users/davidtu/shell-script/temp`;
        Util.persistByPath(dirOfAliasFile); // 確保資料夾存在
        const filePath = `${dirOfAliasFile}/commandOf${variable}.sh`;

        // 3. 預定義路徑，方便維護
        const rootPath = '/Users/davidtu';
        const projectPath = `${rootPath}/cross-achieve/legacy/${projectSlug}`;
        const webGenPath = `${rootPath}/cross-achieve/legacy/idea-inventer/gen/${projectSlug}/web`;
        const adminGenPath = `${rootPath}/cross-achieve/legacy/idea-inventer/gen/${projectSlug}/admin`;
        const functionsGenPath = `${rootPath}/cross-achieve/legacy/idea-inventer/gen/${projectSlug}/functions`;
        const nodeJS = `${rootPath}/.nvm/versions/node/v20.19.5/bin/node --require @babel/register`;
        // 4. 組合 Script 內容 (保持整潔的縮排)
        // 移除 #!/bin/sh，因為 alias 腳本需要被 source 才能生效，直接執行無效
        const scriptContent = [
            `# --- Generated Aliases for ${projectSlug} ---`,
            `# 載入方式: source ${filePath}`,
            ``,
            `# 快速跳轉目錄`,
            `alias cd${variable}='cd "${projectPath}"'`,
            `alias go2_${variable}_admin='cd "${adminGenPath}"'`,
            `alias go2_${variable}_web='cd "${webGenPath}"'`,
            `alias go2_${variable}_functions='cd "${functionsGenPath}"'`,
            ``,
            `# 執行與部署指令 (使用直接 cd 路徑更為穩健)`,
            `alias deploy${variable}Functions='cd "${projectPath}" && firebase deploy --only functions'`,
            `alias emulator${variable}Functions='cd "${projectPath}" && firebase emulators:start --only functions'`,
            `alias simulate${variable}Web='cd "${webGenPath}" && ns'`,
            `alias exe${variable}Admin='cd "${adminGenPath}" && self_debug=true is_node=true ${nodeJS} src/index.js'`,
            `# ------------------------------`
        ].join('\n');

        Util.appendFile(filePath, scriptContent, false, true);

        console.log(`✅ Alias updated: ${filePath}`);
        console.log(`💡 請在終端機執行 \`source ${filePath}\` 以啟用快捷指令`);
    }

    /**
     * 執行實際的平台編譯流程，根據平台類型（web/admin/functions）分派。
     * 包含清理 gen 目錄、執行對應的 forWeb/forAdmin/forCloudFunctions、
     * 複製檔案、安裝依賴、清除空資料夾、轉換 Less 等。
     *
     * @returns {Promise<void>}
     *
     * @example
     * await handler.execute();
     * // => 清理 gen 目錄 -> forWeb() -> buildConfig() -> overrideFiles -> npm install -> format
     */
    async execute() {

        function isRapidModeCleanFileAllowRule(file) {
            return Util.or(
                (_.startsWith(file.dirName, TARGET_COMPONENT_FAST_DEVELOP_MODE) &&
                    _.startsWith(file.fileName, `Base${Util.upperFirst(TARGET_COMPONENT_FAST_DEVELOP_MODE)}`)),
                _.isEqual(file.dirName, 'less'),
                _.isEqual(file.dirName, 'style'),
                (_.isEqual(file.dirName, 'cookie') && _.isEqual(file.fileNameExtension, 'BaseCookie.js')),
                (_.isEqual(file.dirName, 'router') && _.isEqual(file.fileNameExtension, 'BaseMyRouter.js')),
                (_.isEqual(file.dirName, 'config') && !_.isEqual(file.fileName, 'index')),
                (_.isEqual(file.dirName, 'store') && _.isEqual(file.fileName, 'BaseStore')),
                (_.isEqual(file.dirName, 'store') && _.isEqual(file.fileNameExtension, 'index.js')),
                (_.isEqual(file.dirName, 'src') && _.isEqual(file.fileNameExtension, 'BaseApp.js')),
                (_.isEqual(file.dirName, 'src') && _.isEqual(file.fileName, 'index')),
                (Util.isOrEquals(file.dirName, ...LANGUAGES_OF_SUPPORT) && !_.isEqual(file.fileName, 'index')),
            )
        }

        Util.appendInfo(`441548741532 編譯內容為：`)
        Util.appendInfo(this.nodeOfAncestor.components.map((each) => {
            return {
                name: each.getName(),
                struct: each.getNodeOfStruct().getName(),
                editor: each.isPreciselyEditableComponent(),
                module: each.isModuleComponent(),
                extra: each.isExtraComponent,
                path: each.getPath()
            }
        }))

        try {
            if (!_.isEmpty(this.nodeOfAncestor.email))
                await Util.executeCommandLine(`firebase login:use ${this.nodeOfAncestor.email}`)
        } catch (error) {
            Util.appendInfo(`156651343 firebase login:use 同一個帳號會報錯，可忽略 其他部分請參考 ${error.message}`);
        }

        await Util.cleanChildFiles(this.genRootPath, (each) => ENABLE_FAST_DEVELOP_MODE ?
            isRapidModeCleanFileAllowRule(each) : true, 'node_modules');


        switch (this.platform) {
            case 'web':
                await this.forWeb();
                break;
            case 'admin':
                await this.forAdmin();
                break;
            case 'functions':
                await this.forCloudFunctions();
                break;
            default:
                throw new ERROR(8014, `type ==> ${this.platform}`)
        }

        await this.buildCustomizePackages();
        await this.buildConfig();
        if (!ENABLE_FAST_DEVELOP_MODE)
            this.overrideEachFilesFromFolder(
                `common.style.js`
                , `app.style.js`
                , `mobile.style.js`
                , `styles.less`
                , {
                    type: 'extension',
                    keyword: 'svg'
                }, {
                    type: 'extension',
                    keyword: 'css'
                }, {
                    type: 'extension',
                    keyword: 'map'
                }, {
                    type: 'extension',
                    keyword: 'png'
                }, {
                    type: 'extension',
                    keyword: 'stmts'
                }, ...this.getIgnoredFilesByPlatform()
            );

        if (this.isWebPlatform()) {
            await new AppBuilder(this.getProps()).overrideLessFile();
        }

        await this.runInstallIfNeed();
        await this.functionsGenerateRelease();
        await this.buildLessToCss();
        await this.removeEmptyFolder();
        await new beauty(this.genSourcePath).formatAll();
        Util.exeAsyncT(this.generateShellScript());
    }

    async functionsGenerateRelease() {
        if (this.needDeployCloudFunctions && this.isFunctionsPlatform()) {
            await Util.deleteSelfByPath(Util.joinRespectingDot(this.genSourcePath, 'test.js'), true);
            await Util.deleteSelfByPath(Util.joinRespectingDot(this.genRootPath, 'release'), true);
            await Util.generatePackage(this.genRootPath, false);
            /** 會產生出 release folder */
            await this.copyFunctionsModuleToDestFolder();
        }
    }

    async copyFunctionsModuleToDestFolder() {
        const deployPathOfFunction = Util.persistByPath(Util.joinRespectingDot(this.nodeOfAncestor.getDirectoryName(), 'functions'));
        Util.cleanAllFiles(deployPathOfFunction);
        Util.renameFile(Util.joinRespectingDot(this.genRootPath, 'release', 'lib', 'app.js'), 'index');
        await Util.copyFromFolderToDestFolder(Util.joinRespectingDot(this.genRootPath, 'release'), deployPathOfFunction);
    }

    getIgnoredFilesByPlatform() {
        const fileNames = [];
        switch (this.platform) {
            case 'functions':
                break;
            case 'web':
            case 'admin':
                break;
        }
        return fileNames;
    }

    isComponentOrStoreIndexFile(file) {
        const isUnderComponentOrStore = Util.isUnderTargetPath(file.absolute, 'component') ||
            Util.isUnderTargetPath(file.absolute, 'store');
        const isIndexJsFile = _.isEqual(file.fileNameExtension, 'index.js');
        return (isUnderComponentOrStore && isIndexJsFile);
    }

    async removeEmptyFolder() {
        for (const file of Util.findFilePathBy(this.genSourcePath)) {
            const folderOfFather = Util.getFileDirPath(file.absolute);

            if (Util.isEmptyFile(file.absolute)) {

                if (Util.isOrEquals(file.extension, 'map', 'css')) {
                    /** 這兩個檔案類別是auto gen,所以為空值挺正常的 */
                    continue;
                }

                Util.appendInfo(`${file.absolute} is empty file, so that kill ${folderOfFather}`)
                await Util.deleteSelfByPath(folderOfFather, true);
                continue;
            }

            if (this.isComponentOrStoreIndexFile(file) &&
                Util.getFileCountsOfFolder(folderOfFather) < 2) {
                Util.appendInfo(`${file.absolute} is component|store, file counts < 2, so that kill ${folderOfFather}`)
                await Util.deleteSelfByPath(folderOfFather, true);
            }
        }
    }

    async runInstallIfNeed() {
        if (this.isUnInstallProject())
            await Util.executeCommandLine(`cd ${this.genRootPath} && npm install --force`);
    }

}

export default ProjectFileHandler;
