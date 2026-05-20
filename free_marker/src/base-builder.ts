/**
 * base-builder.ts
 *
 * 功能說明：
 * BaseBuilder 繼承 PathBase，是 StoreBuilder / ComponentBuilder 的共用基底。
 * 封裝了跨平台 (web / admin / functions) 的參數產生邏輯。
 *
 * 主要職責：
 * - 根據平台 (web/admin/functions) 產生不同的 function 參數列表
 * - 支援 30+ 種操作類型 (fetch, submit, delete, upsert, atomically...)
 * - 產生 columnData / data 的正規化值 (getPreciseValue)
 * - 管理 setter/getter 的函式名稱命名規則
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

class BaseBuilder extends PathBase {

    constructor(props) {
        super(props);
    }

    getClassName() {
        return 'BaseBuilder';
    }

    getNormalizeFieldOfParamInPath(param) {
        return Util.camel('param', 'of', param);
    }

    /**
     * @param fieldName
     * @param onlyName 只需要functionName
     * @returns {string}
     */
    getFunctionNameOfSimpleSetter(fieldName, params = [], onlyName = true) {
        const functionName = Util.camel(`set`, fieldName);
        if (onlyName)
            return functionName
        return `${functionName}(${params.join(',')})`;
    }

    /**
     * @param fieldName
     * @param onlyName 只需要functionName
     * @returns {string}
     */
    getFunctionNameOfSimpleGetter(fieldName, onlyName = true) {
        const functionName = Util.camel(`get`, fieldName);
        if (onlyName)
            return functionName;
        return `${functionName}()`;
    }

    getParamsOfDefaultValueOfWeb(params, node) {
        return params.map(param => {
            if (Util.isEqual(param.trim(), 'id')) {
                if (node.isCheapArray()) return `${param} = 'contents'`;
                else return `${param} = this.getId()`;
            } else if (Util.isOrEquals(param.trim(), 'item', 'object')) {
                return `${param} = this`;
            } else if (Util.isEqual(param.trim(), 'restful')) {
                return `restful = {status: 'succeed', message: 'default reason'}`;
            } else if (Util.isEqual(param.trim(), 'uid')) {
                return `${param} = UserInfoRef.getUid()`;
            } else if (Util.isEqual(param.trim(), 'route')) {
                return `${param} = ''`;
            } else if (Util.isEqual(param.trim(), 'conditions')) {
                return `${param} = []`;
            }
            return param;
        })
    }

    getParamsOfDefaultValue(params, node) {
        return params.map(param => {
            if (Util.isEqual(param.trim(), 'id')) {
                if (node.isCheapArray()) return `${param} = 'contents'`;
            }
            return param;
        })
    }

    /**
     * 根據平台和操作類型（fetch/submit/delete 等）產生對應的函式參數列表。
     * Web 平台會自動加上 view 參數和預設值，admin/functions 則使用純參數。
     * 支援超過 30 種操作類型（fetch items、submit item、delete cheap 等）。
     *
     * @param {CodegenNode} node - 目標節點
     * @param {string} [type='fetch'] - 操作類型
     * @param {boolean} [storageUsage=false] - 是否為 Storage 操作
     * @param {boolean} [isArgument=false] - 是否只取參數名（不帶預設值）
     * @param {Object} [mustache] - Mustache 模板用的參數
     * @returns {string[]} 參數字串陣列
     *
     * @example
     * const params = builder.getParamsInFunctionByPlatform(node, 'fetch items');
     * // Web: ['view = this.getComponent()', 'id = this.getId()', '...conditions']
     * // Admin: ['id']
     */
    getParamsInFunctionByPlatform(node, type = 'fetch', storageUsage = false, isArgument = false, mustache) {
        const self = this;


        let params = storageUsage ? node.getParamsOfStorageFolder() : node.getParamsInPath();
        switch (type) {
            case 'fetch cheap ids of array':
            case 'fetch ids of array':
                break;
            case 'fetch object':
            case 'fetch items of cheap':
            case `fetch items of pure`:
            case 'fetch items':
            case 'fetch':
                if (node.isCheapArray()) {
                    params = [...params, `${node.getName()} = 'attr'`];
                } else if (node.isPathArray()) {
                    params = [...params, `...conditions`];
                } else {
                    /** object */
                }
                break;
            case 'fetch batch items':
                params = [`...items`];
                break;
            case "batch submit parent":
                params = [`items = [{father:{id:''},child:[{id:''},{id:''}]}]`, `batchCount = 100`];
                break;
            case "batch delete parent":
                params = [`idsOf${_.upperFirst(node.getName())} = ['']`,`batchCount = 100`]
                break;
            case 'modify items':
                params = [...params, 'job = async (items) => {}', 'conditions', 'size']
                break;
            case `fetch next items`:
                params = [...params, 'lastItem', '...conditions']
                break;
            case `submit items of cheap`:
                params = ['items', ...params, `${node.getName()} = 'attr'`];
                break;
            case `submit item of cheap`:
            case `delete item of cheap`:
                params = ['item', 'id', ...params, `${node.getName()} = 'attr'`];
                break;
            case `delete cheap`:
            case `fetch size of cheap`:
                params = [...params, `${node.getName()} = 'attr'`];
                break;
            case `fetch items of limitation`:
                params = [...params, `action = 'in'`, `fieldName = 'name'`, '...valuesOfComparison'];
                break;
            case `delete items`:
                params = ['items', ...params];
                break;
            case `delete eligible items`:
                params = [...params, '...conditions'];
                break;
            case `delete whole items`:
                params = [...params];
                break;
            case `increment attr of item`:
            case `fetch item's doc ref`:
            case 'fetch item':
            case `delete item`:
                params = ['id', ...params];
                break;

            case `submit item`:
            case `upsert item`:
            case `update item`:
                params = ['item', 'id', ...params];
                break;
            case `submit items`:
                params = ['items', ...params];
                break;
            case `update items`:
                params = ['items', ...params];
                break;
            case `update eligible items`:
                params = [...params, 'obj2Update', '...conditions'];
                break;
            case `update item atomically`:
            case `upsert item atomically`:
                params = ['predicate = async (itemOfLatest, transaction,ref) => itemOfLatest', 'id', ...params]
                break;
            case `submit object`:
            case `update object`:
            case `upsert object`:
                params = ['object', ...params];
                break;
            case `update object atomically`:
            case `upsert object atomically`:
                params = [`predicate = async (objectOfLatest,transaction,ref) => objectOfLatest`, ...params]
                break;
            case `upload storage file`:
                params = ['blob', ...params, 'options'];
                break;
            case `upload storage files`:
                params = ['blobs', ...params, 'options'];
                break;
            case `delete storage files`:
                params = [...params];
                break;
            case `fetch without condition`:
            case `delete object`:
            case `increment attr of object`:
            case `fetch size`:
            case `get object doc ref`:
                break;
            default:
                throw new ERROR(9999, `65284161, 走到這裡要注意有bug type='${type}'`);
        }

        if (self.isWebPlatform()) {
            const paramsOfLatest = isArgument ? params : self.getParamsOfDefaultValueOfWeb(params, node, mustache);
            return ['view = this.getComponent()', ...paramsOfLatest];
        }
        return self.getParamsOfDefaultValue(params, node);
    }

    getArgumentsInFunction(node, type) {
        return this.getParamsInFunctionByPlatform(node, type, false, true).map((param) => param.split('=').shift());
    }

    getStringOfArgumentInFunction(node, type) {
        return this.getArgumentsInFunction(node, type).join(',');
    }

    getCommentDescription(node) {
        return `\/** ${node.getType()}:${node.getDescription()} *\/`
    }

    getPreciseValue = (child) => {
        const self = this;

        function getPreciseObj() {
            const isCloudSide = self.isAdminPlatform() || self.isFunctionsPlatform();
            return isCloudSide ? `obj.${child.getFieldName()}` : `this.getColumnData(obj.${child.getFieldName()})`
        }

        function getPreciseArray() {
            const isCloudSide = self.isAdminPlatform() || self.isFunctionsPlatform();
            return isCloudSide ? `obj.${child.getFieldName()}` : `obj.${child.getFieldName()}.map((${child.getName()}) => this.getColumnData(${child.getName()}))`
        }

        if (child.isArray())
            return `obj.${child.getFieldName()} ? ${getPreciseArray()} : ${child.getDefaultValueByType(this.isAdminORFunctionsPlatform())},${this.getCommentDescription(child)}`;
        else if (child.isObject())
            return `obj.${child.getFieldName()} ? ${getPreciseObj()} : ${child.getDefaultValueByType(this.isAdminORFunctionsPlatform())}.columnData(),${this.getCommentDescription(child)}`;
        else if (child.isTimeStamp())
            return `!_.isUndefined(obj.${child.getFieldName()}) ? this.toFireBaseTimestampObject(obj.${child.getFieldName()}) : this.getObjectOfCurrentTimeStamp(),${this.getCommentDescription(child)}`;
        else if (child.isString())
            return `Util.getStringOfNormalize(obj.${child.getFieldName()}, ${child.getDefaultValueByType(this.isAdminORFunctionsPlatform())}${child.asTrim() ? ',true' : ''}),${this.getCommentDescription(child)}`;
        else if (child.isNumber())
            return `Util.getNumberOfNormalize(obj.${child.getFieldName()}, ${child.getDefaultValueByType(this.isAdminORFunctionsPlatform())}),${this.getCommentDescription(child)}`;
        else if (child.isBoolean())
            return `Util.isBoolean(obj.${child.getFieldName()}) ? obj.${child.getFieldName()} : ${child.getDefaultValueByType(this.isAdminORFunctionsPlatform())},${this.getCommentDescription(child)}`;
        else if (child.useServerTime()) return `this._firebase().getServerTimeSymbol(),`;
        else return `obj.${child.getFieldName()} ? obj.${child.getFieldName()} : ${child.getDefaultValueByType(this.isAdminORFunctionsPlatform())},${this.getCommentDescription(child)}`;
    };
}

export default BaseBuilder;
