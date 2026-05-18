/**
 * build-application.ts
 *
 * 功能說明：
 * BuildApplication 是對外的 API 門面 (Facade)，封裝了所有建置流程。
 * 外部只需 new BuildApplication({ projectRootPath }) 即可取用所有 build 方法。
 *
 * 主要職責：
 * - buildWeb(): 執行 Web 平台的完整 build
 * - deployWebProd(): 部署 Web 到 Production
 * - buildCloudFunctions(): 編譯 Cloud Functions
 * - deployFunctionsToProd(): 部署 Functions 到 Production
 * - deployAdmin(): 編譯並部署 Admin 後台
 * - persistent(): 將開發者修改的程式碼回寫到 template
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
import ProjectFileHandler from "./project-file-handler";
import beauty from "./beauty";

class BuildApplication {

    genRootPath;
    /** ./gen/ 寫在 source.js */
    projectRootPath;
    /** 放source.js 的folder */
    freeMarkerRootPath;

    constructor(object = {projectRootPath: './'}) {
        if (!Util.isPathExist(object.projectRootPath)) {
            throw new ERROR(9999, `${object.projectRootPath} 48784546 這個專案位置不存在`)
        }

        this.projectRootPath = libpath.resolve(object.projectRootPath);
        this.freeMarkerRootPath = libpath.resolve(PATH_OF_FREE_MARKER_TEMPLATE);

        const context = require(Util.joinRespectingDot(this.projectRootPath, FILENAME_OF_SOURCE_JS)).default;
        if (_.isEmpty(context.genRootPath)) {
            throw new ERROR(9999, `${this.projectRootPath}/'${FILENAME_OF_SOURCE_JS}' 裡面沒有attribute ==> genRootPath`)
        }
        this.genRootPath = libpath.resolve(context.genRootPath);
        this.init();
    }


    init() {
        if (!fs.existsSync(Util.joinRespectingDot(this.projectRootPath, FILENAME_OF_SOURCE_JS))) {
            throw new ERROR(8019, `you should put ${FILENAME_OF_SOURCE_JS} in ${libpath.resolve(this.projectRootPath)}`)
        }
    }

    getBuildObject = (platform = 'web', env = 'dev') => {
        return {
            freeMarkerRootPath: this.freeMarkerRootPath,
            genRootPath: this.genRootPath,
            projectRootPath: this.projectRootPath,
            platform,
            env,
        }
    }

    async buildWeb() {
        const web = new ProjectFileHandler(this.getBuildObject('web'));
        await web.activate();
        Util.appendInfo(`buildWeb() succeed`);
    }

    async deployFunctionsToProd() {
        const functions = new ProjectFileHandler(this.getBuildObject('functions', 'prod'));
        await functions.cleanGenDirectory();
        await functions.activate();
        await functions.leanCodeOfSource()
        await functions.deployFunctionsToProd();
        Util.appendInfo(`deployFunctionsToProd() succeed`);
    }

    async deployFunctionsWithoutBuild() {
        const functions = new ProjectFileHandler(this.getBuildObject('functions'));
        await functions.leanCodeOfSource();
        await functions.deployFunctionsToProd();
        Util.appendInfo(`deployFunctionsWithoutBuild() succeed`);
    }

    /** buildWebpackOnly：只想透過source code編譯出bundle，目前用於做downsize處理，如果沒有做過web build,但 buildWebpackOnly = true 會報錯 */
    async deployWebProd(deploy = true, buildWebpackOnly = false) {
        const web = new ProjectFileHandler(this.getBuildObject('web', 'prod'));
        if (!buildWebpackOnly) {
            await web.cleanGenDirectory();
            if (deploy)
                await web.incrementProjectVersion();
            Util.appendInfo(web.nodeOfAncestor.version);
            await web.activate();
        }

        await web.buildProdWebDistToProjectThanDeploy(deploy);
        Util.appendInfo(`deployWebProd() succeed`);

    }

    async deployWebProdWithoutBuild() {
        const web = new ProjectFileHandler(this.getBuildObject('web', 'prod'));
        await web.buildProdWebDistToProjectThanDeploy(true, true);
        Util.appendInfo(`deployWebProdWithoutBuild() succeed`);
    }


    async buildCloudFunctions(deploy = true) {
        const functions = new ProjectFileHandler(this.getBuildObject('functions'));
        functions.setFunctionNeedDeploy(deploy);
        await functions.activate();
        Util.appendInfo(`buildCloudFunctions() succeed`);
    }

    /** 就是改code 不要rebuild細節 直接打包到部署目錄*/
    async refreshFunctionsFolder(deploy = true) {
        const functions = new ProjectFileHandler(this.getBuildObject('functions'));
        functions.setFunctionNeedDeploy(deploy);
        await functions.functionsGenerateRelease()
        Util.appendInfo(`refreshFunctionsFolder() succeed`);
    }

    async generateReleaseFunctionsModule() {
        const functions = new ProjectFileHandler(this.getBuildObject('functions'));
        await functions.functionsGenerateRelease();
        await functions.copyFunctionsModuleToDestFolder();
        Util.appendInfo(`generateReleaseFunctionsModule() succeed`);
    }

    async removeEmptyFolder() {
        const web = new ProjectFileHandler(this.getBuildObject('web'));
        await web.removeEmptyFolder();
        Util.appendInfo(`removeEmptyFolder() succeed`);
    }

    async buildLessFilesOnly() {
        const web = new ProjectFileHandler(this.getBuildObject('web'));
        await web.forNewLess();
        Util.appendInfo(`buildLessFilesOnly() succeed`);
    }

    async deployAdmin(deployToRemote = true) {
        const admin = new ProjectFileHandler(this.getBuildObject('admin'));
        if (!deployToRemote)
            admin.disableRulesRemoteDeploy();

        await admin.activate();
        Util.appendInfo(`buildAdmin() succeed`);
    }

    async buildIndexRule() {
        const handler = new ProjectFileHandler(this.getBuildObject('admin'))
        await handler.generateFireIndexRules();
        Util.appendInfo(`buildIndexRule() succeed`);

    }

    async buildLessToCss() {
        const handler = new ProjectFileHandler(this.getBuildObject('web'))
        await handler.buildLessToCss()
        Util.appendInfo(`buildLessToCss() succeed`);

    }

    async test() {
        const handler = new ProjectFileHandler(this.getBuildObject('web'));
        Util.appendInfo(`test() succeed`);

    }

    async buildStorageRule() {
        const handler = new ProjectFileHandler(this.getBuildObject('admin'))
        await handler.generateStorageRules();
        Util.appendInfo(`buildStorageRule() succeed`);
    }


    async overrideFiles(platform = 'web') {
        const handler = new ProjectFileHandler(this.getBuildObject(platform));
        Util.appendInfo(
            `build ${platform}/src/base/... succeed!`
        );
    }

    async persistent(platform = 'web') {
        const handler = new ProjectFileHandler(this.getBuildObject(platform));
        await handler.persistModuleComponentFiles()
        handler.persistBaseFilesToFreeMarkerTemplate();
        await handler.rewriteModulesI18nFiles();
        await handler.persistCustomizePackages()
        await handler.persistImageFolder();
        handler.persistIndexAndLessFiles();
        handler.persistLessLibs();
        await new beauty(libpath.resolve(this.projectRootPath)).formatAll();
        await new beauty(libpath.resolve(PATH_OF_COMPONENT_MODULE)).formatAll();
        Util.appendInfo(`persistent() succeed`);
    }

    async modifiedI18n(platform = 'web') {
        const handler = new ProjectFileHandler(this.getBuildObject(platform));
        await handler.rewriteModulesI18nFiles();
        Util.appendInfo(`modifiedI18n() succeed`);
    }

    async leanCodeOfProjectSrc(platform = 'web') {
        const handler = new ProjectFileHandler(this.getBuildObject(platform));
        await handler.leanCodeOfSource();
        Util.appendInfo(`leanCode() succeed`);
    }

}

export default BuildApplication;
