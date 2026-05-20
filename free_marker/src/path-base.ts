/**
 * path-base.ts
 *
 * 功能說明：
 * PathBase 是所有 Builder 類別的路徑管理基底。
 * 負責初始化專案的目錄結構、解析 source.js、管理 component module 的載入。
 *
 * 主要職責：
 * - 管理 genRootPath, freeMarkerRootPath, projectRootPath 等核心路徑
 * - 執行 workOfPrior()：在 enrich 之前處理 independence 節點的合併
 * - 載入 common module (account, dionysus, epay...) 並注入到 source
 * - 提供 Mustache 模板渲染能力
 * - 取得所有 Store / Component / CloudFunction / Enum 的彙整資料
 */

import { exceptioner as ERROR, utiller as Util } from "utiller";
import _ from "lodash";
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
import ClassGenerator from "./class-generator";

class PathBase {

    classGenerator;
    genRootPath; // gen/web
    genSourcePath; // gen/web/src
    freeMarkerRootPath; // ./template
    freeMarkerSourcePlatformPath; // ./template/src/admin
    freeMarkerSourceCommonPath; // ./template/src/common
    projectRootPath; // exam/
    projectPlatformPath; // exam/web
    projectPlatformSourcePath; // exam/web/src
    projectCommonSourcePath; // exam/common/src
    nodeOfAncestor; //source.js
    structs;
    env = 'dev'; //dev, prod
    platform; // web, admin,functions, platform
    genComponentRootPath; // gen/app/src/component
    genStoreRootPath; // gen/app/src/store
    props;
    pathOfSourceJS;
    freeMarkerSourcePath;

    getProps = () => {
        return {
            nodeOfAncestor: this.nodeOfAncestor,
            genRootPath: this.genRootPath,
            platform: this.platform,
            freeMarkerRootPath: this.freeMarkerRootPath,
            projectRootPath: this.projectRootPath,
            ...this.props
        }
    }

    constructor(props) {
        this.props = props;
        if (!Util.isOrEquals(props.platform, 'web', 'admin', 'functions')) {
            throw new ERROR(8018, `platform ==> ''${props.platform}''`)
        }
        const platform = props.platform;
        this.platform = platform;
        this.freeMarkerRootPath = props.freeMarkerRootPath;
        this.freeMarkerSourcePath = Util.joinRespectingDot(this.freeMarkerRootPath, 'src');
        this.freeMarkerSourcePlatformPath = Util.joinRespectingDot(this.freeMarkerSourcePath, platform);
        this.freeMarkerSourceCommonPath = Util.joinRespectingDot(this.freeMarkerSourcePath, `common`);

        this.projectRootPath = props.projectRootPath;
        this.projectPlatformPath = Util.joinRespectingDot(this.projectRootPath, platform); // exam/web/src

        this.projectPlatformSourcePath = Util.joinRespectingDot(this.projectRootPath, platform, 'src');
        this.genRootPath = Util.joinRespectingDot(props.genRootPath, platform);
        this.genSourcePath = Util.joinRespectingDot(this.genRootPath, 'src');
        this.genComponentRootPath = Util.joinRespectingDot(this.genSourcePath, 'component')
        this.genStoreRootPath = Util.joinRespectingDot(this.genSourcePath, 'store')
        this.pathOfSourceJS = Util.joinRespectingDot(this.projectRootPath, FILENAME_OF_SOURCE_JS);
        this.projectCommonSourcePath = Util.joinRespectingDot(this.projectRootPath, 'common', 'src');

        this.nodeOfAncestor = props.nodeOfAncestor ? props.nodeOfAncestor : CodegenNode.enrich(this.workOfPrior(this.pathOfSourceJS));
        this.env = props.env;
        this.initialize(props);
        /** 這就是 source.js 的進入點 */
    }

    initialize(props) {
        if (Util.isUndefinedNullEmpty(props.nodeOfAncestor))
            Util.appendError(`4848744656 nodeOfAncestor|為空值，現在是 ${this.getClassName()}`)
    }

    getClassName() {
        return 'PathBase';
    }

    reNewNodeOfAncestor() {
        this.nodeOfAncestor = CodegenNode.enrich(this.workOfPrior(this.pathOfSourceJS));
    }

    /** 把source在Codegen.enrich之前就取代掉independence的節點，未來還能發想更多功能 */
    workOfPrior(pathOfSource) {
        console.info(`6666666666 => 這裡應該只准近來乙次 => ${this.getClassName()}`)

        function append() {
            const nodes = _.filter(arrayOfEachNode, (each) => each.independence);
            for (const node of nodes) {
                const nameOfReference = node.raw.ref;
                if (Util.isEmpty(nameOfReference)) throw new ERROR(9999, `8487896 node has independence(true), but forget to ref='{nameOfNode}' `)
                const nodeOfReference = mapOfIndexing[nameOfReference];
                if (_.isUndefined(nodeOfReference))
                    throw new ERROR(9999, `8487897 node has independence(true) & ref(${nodeOfReference}), but node(${nodeOfReference}) is not exist in project`)
                Util.merge(node.raw, Util.cloneDeep(nodeOfReference));
                delete node.raw.independence;
                delete node.raw.ref;
            }
        }

        function mapping(...nodes) {
            for (const node of nodes) {
                arrayOfEachNode.push({
                    name: node.name,
                    independence: node.independence,
                    raw: node
                })
                if (!!node.name) mapOfIndexing[node.name] = node;
                if (Array.isArray(node.children)) mapping(...node.children);
            }
        }

        function whatever() {
            mapping(...source.components.map(component => component.struct))
        }

        function getAllowListOfModuleComponent(source) {
            const list = Util.getNamesOfFolderChild(PATH_OF_COMPONENT_MODULE).map((each) => _.trim(each));
            return _.filter(list, (each) => !Util.has(source.modulesOfIgnore, each, true));
        }

        const source = require(libpath.resolve(pathOfSource)).default;

        /** 把common module[account, dionysus, epay...]加入 */
        for (const file of Util.findFilePathBy(PATH_OF_COMPONENT_MODULE,
            (each) => Util.isEqual(each.fileNameExtension, FILENAME_OF_SOURCE_JS))) {
            if (Util.has(getAllowListOfModuleComponent(source), file.dirName, true)) {
                /** require的default在一個process只會被new一次，為了設計build queue['project-kh-high','project-yueh-pu']，使用了clone */
                const module = _.clone(require(file.absolute).default);
                if (Util.has(source.components.map((each) => each.name), module.name)) continue;
                /** 必免重復的component 被匯入 */
                const componentsOfExtra = Array.isArray(module.componentsOfExtra) ?
                    module.componentsOfExtra.map((component) => {
                        return {...component, isExtraComponent: true};
                    }) : [];
                delete module.componentsOfExtra;
                for (const rawOfComponent of [module, ...componentsOfExtra]) {
                    /** rawOfComponent 代表沒有被enrich過 */
                    rawOfComponent.isCommonModule = true;
                    source.components.push(rawOfComponent);
                }
            }
        }

        const arrayOfEachNode = []; //[ {name:string,independence:boolean,raw:node} ]
        const mapOfIndexing = {} //{ ...name:node }
        whatever();
        append();

        /** 把component props改變 */
        source.components = source.components.map((component) => {
            const obj = Util.isObject(source.setsOfComponentProp) && source.setsOfComponentProp[component.name];
            return obj ? {...component, ...obj} : component;
        });

        return source;
    }


    isProduction() {
        return Util.isEqual(this.env, 'prod');
    }

    getStructs() {
        return this.nodeOfAncestor.components.map(component => component.struct);
    }

    getComponents() {
        return this.nodeOfAncestor.components;
    }

    isFunctionsPlatform() {
        return Util.isEqual(this.platform, 'functions')
    }

    isWebPlatform() {
        return Util.isEqual(this.platform, 'web')
    }

    isAdminPlatform() {
        return Util.isEqual(this.platform, 'admin')
    }

    isUnInstallProject() {
        return !Util.isPathExist(Util.joinRespectingDot(this.genRootPath, `node_modules`));
    }

    isAdminORFunctionsPlatform() {
        return this.isAdminPlatform() || this.isFunctionsPlatform();
    }

    async appendMustacheFile(templateFileName, destFileName, param = {}) {
        const filePath = libpath.resolve(destFileName);
        Util.appendFile(
            filePath,
            this.getStringFromMustache(templateFileName, param),
            true,
            true);
    }

    getAllCloudFunctions() {
        const source = this.nodeOfAncestor;
        const functions = source.getCloudFunctions();
        for (const component of _.filter(source.getComponents(), (each) => !each.isPreciselyEditableComponent())) {
            const bunchOfCloudFunction = component.getCloudFunctions();
            if (Array.isArray(bunchOfCloudFunction)) {
                functions.push(...bunchOfCloudFunction.map((each) => {
                    each.isCommonModule = true;
                    return each;
                }))
            } else new ERROR(9999, `546564512 ${component.name} 的 cloudFunctions格式不對！`)
        }
        return functions;
    }

    getAllEnums() {
        const source = this.nodeOfAncestor;
        const all = {...source.enums}
        for (const component of _.filter(source.getComponents(), (each) => !each.isPreciselyEditableComponent())) {
            const enums = component.enums;
            if (!Util.isUndefinedNullEmpty(enums)) _.assign(all,enums)
        }
        return all;
    }

    getStringFromMustache(templateFileName, variable = {}) {
        return mustache.render(Util.getFileContextInRaw(Util.joinRespectingDot(this.freeMarkerRootPath, templateFileName)), this.getMustacheRenderValues(variable));
    }

    getMustacheRenderValues = ({
                                   isCheapArray = false,
                                   isSelected = false,
                                   hasPath,
                                   name,
                                   fieldName,
                                   defaultValue,
                                   fieldUrl,
                                   functionName,
                                   className,
                                   titleOfProject,
                                   projectName,
                                   title,
                                   verification,
                                   projectVersion,
                                   projectDescription,
                                   fieldClass,
                                   hasPaginate,
                                   paginateSize,
                                   argumentString,
                                   paramString,
                                   stringOfParamInFetch,
                                   stringOfArgumentInFetch,
                                   stringOfParamInSubmitItems,
                                   stringOfArgumentInSubmitItems,
                                   stringOfParamInSubmitItem,
                                   stringOfArgumentInSubmitItem,
                                   superUserUid,
                                   isTimePickerView,
                                   disableOfHtmlScale,
                               }) => {
        return {
            hasPath,
            name,
            isCheapArray,
            fieldName,
            isSelected,
            functionName: functionName ? functionName : _.upperFirst(fieldName),
            modifiedFunctionName: `Modified${_.upperFirst(fieldName)}`,
            modifiedFieldName: `${Util.camel(`modified`, fieldName)}`,
            defaultValue,
            fieldUrl,
            title,
            verification,
            className,
            projectName,
            projectVersion,
            projectDescription,
            fieldClass,
            hasPaginate,
            paginateSize,
            argumentString,
            paramString,
            stringOfParamInFetch,
            stringOfArgumentInFetch,
            stringOfParamInSubmitItems,
            stringOfArgumentInSubmitItems,
            stringOfParamInSubmitItem,
            stringOfArgumentInSubmitItem,
            superUserUid,
            isTimePickerView,
            titleOfProject,
            disableOfHtmlScale
        }
    }

    /** 找到目錄下的folder,是這用來gen stores的 index file,有點偷懶, 應該要從source去組合出來 */
    getGenUnion(...folder) {
        let path = Util.joinRespectingDot(this.genRootPath, 'src', ...folder)

        return _.filter(Util.getChildPathByPath(path),
            each => each.isDirectory).map(each => each.dirName);
    }

    getGenStores() {
        return this.getAllStore();
    }

    getGenComponent() {
        const components = this.getComponents().map((each) => Util.camel(each.getNodeOfStruct().getName()));
        return _.without(components, SIGN_OF_EMPTY_STORE);
    }

    getAllStore() {
        const total = [];

        function appendStore(node, list = []) {
            if (CodegenNode.isCodegenNode(node) &&
                node.isCollection() &&
                !node.isReferenceNode() &&
                !Util.isEqual(node.getName(), SIGN_OF_EMPTY_STORE)) {

                list.push(node.getStoreFolderName())
                for (const child of node.getChildren()) {
                    appendStore(child, list);
                }
            }
            return list;
        }

        for (const node of this.getStructs().filter(each => !each.isPreciselyEditableComponent())) {
            total.push(...appendStore(node))
        }
        return total;
    }

}

export default PathBase;
