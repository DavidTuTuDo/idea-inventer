/**
 * remote-function-handler.ts
 *
 * 功能說明：
 * RemoteFunctionHandler 負責產生節點對應的所有 Firestore CRUD API 函式。
 * 包含 fetch、submit、update、delete、upsert、atomically 等操作。
 *
 * 主要職責：
 * - buildFetchSubmitApi(): 根據節點類型 (array/object/cheap) 產生對應的 API
 * - buildListenerFunction(): 產生 Firestore 即時監聽的函式
 * - 處理 Storage 上傳/刪除的 API 產生
 * - 支援 batch 操作、pagination、fatherHood 關聯
 */

import { exceptioner as ERROR, utiller as Util } from "utiller";
import _ from "lodash";
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
import BaseBuilder from "./base-builder";

class RemoteFunctionHandler extends BaseBuilder {

    generator = undefined;

    constructor(props, classGenerator) {
        super(props);
        this.generator = classGenerator;
    }

    getClassName() {
        return 'RemoteFunctionHandler';
    }

    /**
     * 根據平台決定是否在參數中加入 view。
     * Web 平台會加入 view 參數，admin/functions 則不加。
     *
     * @param {boolean} [isString=false] - true 回傳字串格式，false 回傳陣列格式
     * @returns {string|string[]}
     *
     * @example
     * handler.appendParamIfPlatformEqualsWeb(true);   // Web: ',view'  Admin: ''
     * handler.appendParamIfPlatformEqualsWeb(false);   // Web: ['view'] Admin: []
     */
    appendParamIfPlatformEqualsWeb(isString = false) {
        if (_.isEqual(this.platform, 'web')) {
            return isString ? ',view' : ['view'];
        }
        return isString ? '' : [];
    }

    buildListenerFunction(node, recursively = false) {
        const defaultParam = node.getParamsInPath();
        const pathStmt = `const path = \`${node.getPathOfRouterString()}\``;

        if (node.isCollection()) {
            for (const child of node.getPreciseAttributeChildren()) {
                if (recursively && child.hasChildren()) this.buildListenerFunction(child);
            }

            if ((node.isObject() && node.hasPath()) || node.isCheapArray()) {
                this.generator.appendFunction(Util.camel(`listen`, node.getFieldName()),
                    [...defaultParam, `callback = (status, data, error) => {}`],
                    [], [node.isCheapArray() ? 'attention! this is cheap array' : '', `status => 回傳值會有 local|server|cache`],
                    `${pathStmt}
                        return this.listenObject(path, callback);`
                )
            } else if (node.isPathArray()) {
                this.generator.appendFunction(Util.camel(`listen`, node.getFieldName()),
                    [...defaultParam, `callback = (status,changes,error) => {}`, `condition = (stmt) => stmt`], [],
                    [`status:['added','modified','removed'], 回傳的就是function of unsubscribe`],
                    `${pathStmt}
                        return this.listenItems(path,callback,condition);`
                );
                this.generator.appendFunction(Util.camel(`listen`, node.getName(), 'item'),
                    [...defaultParam, 'id', `callback = (status, data, error) => {}`]
                    , [], [`status => 回傳值會有 local|server|`],
                    `${pathStmt}
                        return this.listenItem(path,id,callback);`
                );

                if (this.isWebPlatform() && node.isRestfulBean()) {
                    this.generator.appendFunction(Util.camel(`restful`, `listen`, node.getName(), 'item'),
                        [...defaultParam, `id`, `callback = (result) => result`, 'view']
                        , [], [],
                        `${pathStmt}
                        return this.restfulListenItem(path,id,callback,view);`
                    );
                }
            }
        }
    }

    /**
     * 產生節點對應的所有 CRUD API 函式，包含 fetch、submit、update、delete、upsert、
     * atomically 等操作，同時處理 cheap array、path array、object、storage 等不同情境。
     *
     * @param {CodegenNode} node - 要產生 API 的節點
     * @param {boolean} [recursively=false] - 是否遞迴處理子節點
     * @returns {void}
     *
     * @example
     * const handler = new RemoteFunctionHandler(props, generator);
     * handler.buildFetchSubmitApi(arrayNode, true);
     * // => 產生 fetchQuestions, submitQuestionItem, deleteQuestionItem, updateQuestions 等方法
     */
    buildFetchSubmitApi = (node, recursively = false) => {
        const self = this;
        const generator = self.generator;

        function appendViewInParamStmt(comma = true) {
            return self.isWebPlatform() ? `${comma ? ',' : ''}view` : ``;
        }

        function houseKeepingStmt() {
            if (self.isWebPlatform()) {
                return [`if(this.hasParent())`,
                    `this.getParentNode().${node.getFunctionNameRemoveItems()}(this)`];
            } else
                return [];
        }

        function getFetchStmt() {
            if (self.isWebPlatform()) return [`this.clean()`, `this.initial(item)`];
            return [];
        }

        function getConditionStmts(isFetchAll = false) {
            const stmts = [];
            if (self.isWebPlatform())
                stmts.push(...node.getConditions().map((each) => `${each}`));
            if (!isFetchAll && self.isWebPlatform()) {
                if (node.hasPaginate())
                    stmts.push(`{type:'limit',params:[${node.getNameOfBaseClassName()}.${FIELD_NAME_OF_SIZE_PER_PAGE}]}`)
                else
                    stmts.push(`{type:'limit',params:[${node.getNameOfBaseClassName()}.${FIELD_NAME_OF_MAX_SIZE_OF_REQUEST}]}`)
            }
            return stmts.join(',');
        }

        function generateApiFunction(node, name, logicStmts = [], type, isAsync = true, storageUsage = false) {
            const preStmts = [`const self = this`];
            /** asString => 就是把 `${variable}` => '${variable}' 免得造成unknown issue */
            const asString = Util.isOrEquals(type, "fetch batch items", "batch submit parent");
            preStmts.push(storageUsage ? `const folder = \`${node.getStorageFolderOfRouterString()}\`` :
              `let path = ${asString ? `\'${node.getPathOfRouterString()}/\${id}\'` : `\`${node.getPathOfRouterString()}\``}`
            );
            let stmts = [];
            if (isAsync) {
                stmts.push(`const task = async () => {`)
                stmts.push(...logicStmts);
                stmts.push(`}`);
                if (self.isWebPlatform())
                    stmts.push(`return await self.runUIAsyncTask(task, '${type}', ${storageUsage ? 'folder' : 'path'}${appendViewInParamStmt()},'${name}')`)
                else
                    stmts.push(`return await task()`);
            } else {
                stmts.push(...logicStmts);
            }

            const comment = `${node.getPreciseAttributeParentName()}-${node.getName()}:${type}`;
            const pramsOfWhole = self.getParamsInFunctionByPlatform(node, type, storageUsage);
            const stmtsOfWhole = [...preStmts, ...stmts];
            if (isAsync) {
                generator.appendAsyncFunction(name, pramsOfWhole, [], [comment],
                    ...stmtsOfWhole)
            } else {
                generator.appendFunction({name,arrow:true}, pramsOfWhole, [], [comment],
                    ...stmtsOfWhole)
            }
        }

        if (node.isCollection()) {
            const contents = [];

            if (generator === undefined)
                throw new ERROR(8016)

            for (const child of node.getPreciseAttributeChildren()) {
                if (!child.isColumnAttribute()) continue;
                if (node.isReferenceNode()) continue;
                if (child.isDisableOfColumn()) continue;


                if (child.hasStorageFolder()) {
                    const params = this.isWebPlatform() ? [child.getName()] :
                        Util.compactConsecutive([child.getNodeOfStruct().getName(), child.getPreciseAttributeParentName(), child.getName()]);

                    generateApiFunction(
                        child, Util.camel('uploadFileOf', ...params),
                        [
                            `return await self.uploadStorageFile(blob, folder, '${child.fileMaximum}', ${self.isWebPlatform() ? '{ ...options, view }' : 'options'});`
                        ], `upload storage file`, true, true);

                    generateApiFunction(
                        child, Util.camel('uploadFilesOf', ...params),
                        [
                            `return await self.uploadStorageFiles(blobs, folder, '${child.fileMaximum}', ${self.isWebPlatform() ? '{ ...options, view }' : 'options'});`
                        ], `upload storage files`, true, true);

                    generateApiFunction(
                        child, Util.camel('deleteStorageFilesOf', ...params),
                        [
                            `return await self.deleteStorageFiles(folder);`
                        ], `delete storage files`, true, true);
                }
                contents.push(`${child.getFieldName()} : ${this.getPreciseValue(child)}`);
            }
            const updateStmt = `updateTime : this._firebase().getServerTimeSymbol()`;
            if (!node.isCheapArray()) contents.push(`${updateStmt},`);

            const content = self.isWebPlatform() ? `...Util.merO({${updateStmt}},this.columnData(obj))` : `${contents.map(each => each).join('\n')}`;
            const stmts = `const commitment = \{ ${content}`;

            if (node.hasPath()) {
                /** 有path 才代表 這是一個遠端也有的物件 */
                const functionNameOfNormalize = node.getFunctionNameOfNormalize();
                generator.appendFunction({ name: functionNameOfNormalize, arrow: true }, ['obj', 'update = false'], [], [],
                    stmts, '}',
                    'this.handleCommitment(update, commitment, obj)',
                    'return commitment'
                );

                if (node.isCheapArray()) {
                    function needView() {
                        if (self.isWebPlatform()) {
                            return 'view,';
                        }
                        return '';
                    }

                    generateApiFunction(
                        node,
                        node.getFunctionNameOfFetchDocumentIds(),
                        [
                            `path = this.buildPath(path, ${node.getName()})`,
                            `return this.fetchIdsOfDocument(path)`],
                        `fetch cheap ids of array`);

                    generateApiFunction(
                        node, Util.camel('submit', node.getFieldName()),
                        [
                            `path = this.buildPath(path, ${node.getName()})`,
                            `const commitments = items.map((item) => this.${functionNameOfNormalize}({...item }))`,
                            `return await self.submitObject(path,{
                                    ${ID_OF_DEFAULT_CHEAP_ARRAY}:commitments,
                                    updateTime:this._firebase().getServerTimeSymbol(),
                            })`],
                        `submit items of cheap`)

                    generateApiFunction(
                        node,
                        node.getFunctionNameOfFetch(),
                        [
                            `path = this.buildPath(path, ${node.getName()})`,
                            `const result = await self.fetchObject(path)`,
                            `return result.${ID_OF_DEFAULT_CHEAP_ARRAY} ?? []`],
                        `fetch items of cheap`);

                    generateApiFunction(
                        node,
                        node.getFunctionNameOfSubmitItem(),
                        [
                            `path = this.buildPath(path, ${node.getName()})`,
                            `const hasParent = this.getParentNode && this.getParentNode()`,
                            `const all = hasParent ? this.getParentNode().${self.getFunctionNameOfSimpleGetter(node.getFieldName())}() : await self.${node.getFunctionNameOfFetch()}()`,
                            `all.push(this.${functionNameOfNormalize}({...item,id}))`,
                            `await self.${node.getFunctionNameOfSubmit()}(${needView()} all, id)`,
                            `const result = hasParent ? this.getParentNode().push${_.upperFirst(node.getName())}(item) : true`,
                            `return result;`
                        ],
                        `submit item of cheap`);

                    generateApiFunction(
                        node,
                        node.getFunctionNameOfDeleteItem(),
                        [
                            `path = this.buildPath(path, ${node.getName()})`,
                            `const hasParent = this.getParentNode && this.getParentNode()`,
                            `const all = hasParent ? this.getParentNode().${Util.camel('get', node.getFieldName())}() : await self.${node.getFunctionNameOfFetch()}()`,
                            `await self.${node.getFunctionNameOfSubmit()}(${needView()} _.without(all, item), id)`,
                            `return hasParent ? this.getParentNode().${Util.camel('remove', node.getFieldName())}(item) : true`,
                        ],
                        `delete item of cheap`);


                    generateApiFunction(
                        node,
                        node.getFunctionNameOfDelete(),
                        [
                            `path = this.buildPath(path, ${node.getName()})`,
                            `return await self.deleteObject(path);`],
                        `delete cheap`,
                    )

                    generateApiFunction(
                        node,
                        Util.camel(`fetch`, `size`, `of`, node.getFieldName()),
                        [
                            `path = this.buildPath(path, ${node.getName()})`,
                            `return _.size(await self.${node.getFunctionNameOfFetch()}(${self.getStringOfArgumentInFunction(node, 'fetch')}))`],
                        `fetch size of cheap`)


                } else if (node.isPathArray()) {
                    if (self.isWebPlatform())
                        generator.appendField(FIELD_NAME_OF_MAX_SIZE_OF_REQUEST, node.getMaxSizePerRequest(), [], [], 'static')

                    if (self.isWebPlatform() && node.hasPaginate()) {
                        generator.appendField(FIELD_NAME_OF_SIZE_PER_PAGE, node.getPaginateSize(), [], [], 'static')

                        generateApiFunction(
                            node,
                            node.getFunctionNameOfNextFetch(),
                            [
                                `const startAfterConditions = this.getStartAfterConditions(lastItem);`,
                                `return await this.${node.getFunctionNameOfFetch()}(${this.getArgumentsInFunction(node, 'fetch without condition')}, ...startAfterConditions, ...conditions)`],
                            `fetch next items`);

                    }

                    /** 基礎fetch都會限制單筆在50個以內，需要一個fetch pure all的函式處理特殊狀況 */
                    generateApiFunction(
                      node,
                      node.getFunctionNameOfPureFetch(),
                      [`return await self.fetchItems(path, ...conditions,${getConditionStmts(true)})`],
                      `fetch items of pure`);

                    generateApiFunction(
                        node,
                        Util.camel('get', node.getName(), 'item', 'doc', 'ref'),
                        [`return this.reference(path, id, {asDoc:true})`],
                        `fetch item's doc ref`,
                        false,
                    )

                    generateApiFunction(
                        node,
                        Util.camel(node.getFunctionNameOfFetch(), 'of', 'limitation'),
                        [`return await this.fetchItemsOfLimitation(path, action, fieldName, ...valuesOfComparison)`],
                        `fetch items of limitation`
                    )

                    generateApiFunction(
                        node,
                        node.getFunctionNameOfFetch(),
                        [`return await self.fetchItems(path, ...conditions,${getConditionStmts()})`],
                        `fetch items`);

                    generateApiFunction(
                      node,
                      node.getFunctionNameOfFetchBatch(),
                      [
                        ` /** item = {${node.getParamsOfBatchFetch().join(",")}} */`,
                          `const references = items.map(({${node.getParamsOfBatchFetch().join(",")}}) => this.reference(${node.getBatchFetchOfRefStmt()}))`,
                          `return await self.fetchBatchItems(path, ...references)`],
                      `fetch batch items`);

                    const childrenOfHasFatherHood = node.getPreciseAttributeChildren().filter((child) => child.hasFatherHood);
                    for (const child of childrenOfHasFatherHood) {
                        const segments = Util.extractStaticSegments(child.getPath());
                        const nameOfChild = child.getName();
                        const father = _.head(segments);
                        const son = _.last(segments);
                        generateApiFunction(
                          node,
                          node.getFunctionNameOfBatchSubmitParentItems(child),
                          [
                              `${this.isWebPlatform() ? `const api = new ${_.upperFirst(child.getName())}()` : ""}`,
                              `const commitments = items.map((item) => {
                               return {
                                 ${father} : self.${functionNameOfNormalize}(item.${father}),
                                 ${son} : item.${son}.map((${nameOfChild}) => ${this.isWebPlatform() ? "api" : "this"}.${child.getFunctionNameOfNormalize()}(${nameOfChild}))
                             }
                             });`,
                              `return await self.submitBatchParentItems(${JSON.stringify(segments)},commitments,batchCount)`],
                          "batch submit parent");

                        generateApiFunction(
                          node,
                          node.getFunctionNameOfBatchDeleteParentItems(child),
                          [
                              `return await self.deleteBatchParentItems(${JSON.stringify(segments)}, idsOf${_.upperFirst(node.getName())} , batchCount)`],
                          "batch delete parent");
                    }

                    generateApiFunction(
                        node,
                        node.getFunctionNameOfModify(),
                        [`return await self.modifyItemsOfPaginate(path, job, conditions, size)`],
                        `modify items`);

                    generateApiFunction(
                        node,
                        node.getFunctionNameOfFetchItem(),
                        ['const item =  await self.fetchItem(path, id)',
                            ...getFetchStmt(),
                            `return item`],
                        `fetch item`)

                    /** admins only , delete collection all */
                    generateApiFunction(
                        node,
                        Util.camel(`delete`, node.getFieldName()),
                        [`return await self.deleteItems(path, items)`],
                        'delete items')

                    generateApiFunction(
                        node,
                        Util.camel(`delete`, `whole`,node.getFieldName()),
                        [`return await self.deleteWholeItems(path)`],
                        'delete whole items')

                    generateApiFunction(
                        node,
                        Util.camel(`delete`, `eligible`, node.getFieldName()),
                        [`return await self.deleteEligibleItems(path, ...conditions)`],
                        'delete eligible items')

                    generateApiFunction(
                        node,
                        node.getFunctionNameOfSubmitItem(),
                        [
                            `const commitment = this.${functionNameOfNormalize}(item)`,
                            `return await self.submitItem(path, commitment, id);`],
                        'submit item')

                    generateApiFunction(
                        node,
                        node.getFunctionNameOfUpdateItem(),
                        [
                            `const commitment = this.${functionNameOfNormalize}(item, true)`,
                            `return await self.updateItem(path, commitment, id)`],
                        'update item')

                    generateApiFunction(
                        node,
                        node.getFunctionNameOfUpsertItem(),
                        [
                            `const commitment = this.${functionNameOfNormalize}(item, true)`,
                            `return await self.upsertItem(path, commitment, id)`],
                        'upsert item')

                    generateApiFunction(
                        node,
                        node.getFunctionNameOfUpdateItemAtomically(),
                        [`return await self.updateItemAtomically(path,predicate,id)`],
                        'update item atomically')

                    generateApiFunction(
                        node,
                        node.getFunctionNameOfUpsertItemAtomically(),
                        [`return await self.upsertItemAtomically(path,predicate,id)`],
                        'upsert item atomically')

                    generateApiFunction(
                        node,
                        node.getFunctionNameOfDeleteItem(),
                        [`const result = await self.deleteItem(path, id)`,
                            ...houseKeepingStmt(),
                            `return result`],
                        'delete item')

                    generateApiFunction(
                        node,
                        node.getFunctionNameOfSubmit(),
                        [`const commitments = items.map((item) => this.${functionNameOfNormalize}(item))`,
                            `return await self.submitItems(path, ...commitments)`],
                        `submit items`)

                    generateApiFunction(
                        node,
                        Util.camel('update', node.getFieldName()),
                        [
                            `const commitments = items.map(item => this.${functionNameOfNormalize}(item, true))`,
                            `return await self.updateItems(path, commitments)`],
                        `update items`)

                    generateApiFunction(
                        node,
                        Util.camel('update', 'eligible', node.getFieldName()),
                        [
                            `return await self.updateEligibleItems(path, obj2Update, ...conditions)`],
                        `update eligible items`);

                    generateApiFunction(
                        node,
                        Util.camel(`fetch`, `size`, `of`, node.getFieldName()),
                        [`return await self.fetchSizeOfCollection(path)`],
                        `fetch size`)

                    generateApiFunction(
                        node,
                        node.getFunctionNameOfFetchDocumentIds(),
                        [
                            `return this.fetchIdsOfDocument(path)`],
                        `fetch ids of array`);

                    for (const child of node.getPreciseColumnChildren()) {
                        if (child.hasIncrementUsage()) {
                            generateApiFunction(
                                node,
                                Util.camel('update', 'increment', child.getFieldName()),
                                [
                                    `return await self.updateItem(path,{${child.getFieldName()}: self.getObjectOfIncrement(${child.getDeltaOfIncrement()})}, id)`
                                ],
                                `increment attr of item`);
                        }
                    }
                } else if (node.isObject()) {
                    const web = `Util.merO(self.columnData(), object) : self.columnData()`
                    const admin = `Util.merO(self.${functionNameOfNormalize}({}), object) : self.${functionNameOfNormalize}({})`

                    generateApiFunction(
                        node,
                        Util.camel('get', node.getName(), 'doc', 'ref'),
                        [`return this.reference(path)`],
                        `get object doc ref`,
                        false)

                    generateApiFunction(
                        node,
                        Util.camel(node.getFunctionNameOfSubmit()),
                        [
                            `const commitment = this.${functionNameOfNormalize}(object)`,
                            `return await self.submitObject(path, commitment)`],
                        `submit object`)

                    generateApiFunction(
                        node,
                        node.getFunctionNameOfFetch(),
                        [
                            `const object = await self.fetchObject(path)`,
                            `${this.isWebPlatform() ? 'this.clean()' : ''}`,
                            `${this.isWebPlatform() ? 'this.initial(object)' : ''}`,
                            `return object.exists ? ${this.isWebPlatform() ? web : admin}`
                        ],
                        `fetch object`)

                    generateApiFunction(
                        node,
                        Util.camel('update', node.getFieldName()),
                        [
                            `const commitment = this.${functionNameOfNormalize}(object, true)`,
                            `return await self.updateObject(path, commitment)`],
                        `update object`);

                    generateApiFunction(
                        node,
                        Util.camel('upsert', node.getFieldName()),
                        [
                            `const commitment = this.${functionNameOfNormalize}(object, true)`,
                            `return await self.upsertObject(path, commitment)`],
                        `upsert object`);

                    generateApiFunction(
                        node,
                        Util.camel('update', node.getFieldName(), 'atomically'),
                        [`return await self.updateObjectAtomically(path,predicate)`],
                        `update object atomically`);

                    generateApiFunction(
                        node,
                        Util.camel('upsert', node.getFieldName(), 'atomically'),
                        [`return await self.upsertObjectAtomically(path,predicate)`],
                        `upsert object atomically`);

                    generateApiFunction(
                        node,
                        node.getFunctionNameOfDelete(),
                        [`return await self.deleteObject(path)`],
                        `delete object`);

                    for (const child of node.getPreciseColumnChildren()) {
                        if (child.hasIncrementUsage()) {
                            generateApiFunction(
                                node,
                                Util.camel('submit', 'increment', child.getFieldName()),
                                [
                                    `return await self.updateObject(path,{${child.getFieldName()}: self.getObjectOfIncrement(${node.getDeltaOfIncrement()})})`
                                ],
                                `increment attr of object`);
                        }
                    }
                } else {
                    throw new ERROR(8015, node.getType());
                }
            }
        }

        /** 不能讓reference node 再去產生 store Apiu相關的 attribute */
        if (!node.isReferenceNode() && recursively) {
            for (const child of node.getPreciseAttributeChildren()) {
                this.buildFetchSubmitApi(child, recursively);
            }
        }
    }
}

export default RemoteFunctionHandler;
