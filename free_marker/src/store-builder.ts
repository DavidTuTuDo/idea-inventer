/**
 * store-builder.ts
 *
 * 功能說明：
 * StoreBuilder 負責產生 MobX Store 的 Base class 程式碼。
 * 包含欄位宣告、setter/getter、fetch/submit API、AutoComplete、i18n、paginate 等完整機制。
 *
 * 主要職責：
 * - buildBaseStore(): 遞迴產生每個 collection 節點的 Store class
 * - buildStoreIndexFiles(): 產生 Store 的根 index file (BaseStore.js)
 * - buildFieldAttribute(): 處理每個欄位的 observable 宣告與初始化邏輯
 * - importStoreDefault(): 注入 MobX、UserInfoRef、Cookie 等共用 import
 * - 使用 mapOfStoreBeenBuild 避免重複編譯
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
import BaseBuilder from "./base-builder";
import ClassGenerator from "./class-generator";
import RemoteFunctionHandler from "./remote-function-handler";

class StoreBuilder extends BaseBuilder {

    constructor(props) {
        super(props);
    }

    getClassName() {
        return 'StoreBuilder';
    }

    /**
     * 根據 type 從 Mustache 模板產生對應的 Store 函式字串（setter/getter/action 等）。
     *
     * @param {string} type - 欄位類型（string/number/boolean/array/object/timestamp 等）
     * @param {Object} [object={}] - 傳入 Mustache 模板的變數
     * @returns {string} 產生的函式內容字串
     *
     * @example
     * const functions = builder.getFunctionsDependOnFieldType('array', { name: 'questions', fieldName: 'questions', ... });
     */
    getFunctionsDependOnFieldType(type, object = {}) {
        return this.getStringFromMustache(`store_${type}.mustache`, object);
    }

    async buildStoreIndexFiles() {
        /** 產生 store再project的index file */
        const BaseStoreFileName = 'BaseStore';
        const stores = this.getGenStores();
        const baseGenerator = new ClassGenerator(Util.persistByPath(Util.joinRespectingDot(this.genStoreRootPath, `${BaseStoreFileName}.js`)), this.nodeOfAncestor);
        baseGenerator.appendClass(BaseStoreFileName);
        for (const store of stores) {
            baseGenerator.appendImport(_.upperFirst(store), `./${store}`);
            baseGenerator.appendFunction(
                {name: Util.camel('renew', store), arrow: true},
                [], [], [],
                `this.${store}.clean()`,
                // `this.${store} = new ${_.upperFirst(store)}()`,
            )
        }
        baseGenerator.appendConstructor(...stores.map(child => `this.${child} = new ${_.upperFirst(child)}(props)`))
        baseGenerator.needIndexFile('Store');
        await baseGenerator.persist();
    }

    /** 用來記錄哪些store已經buildStore()了，避免duplicated build */
    mapOfStoreBeenBuild = {};

    async buildFieldAttribute(generator, node) {
        const self = this;

        const propsStmt = [];
        for (const child of node.getPreciseAttributeChildren()) {
            if (child.useAsMuiImport()) {
                generator.appendImport(child.getDefaultValue(), `@mui/icons-material/${child.getDefaultValue()}`);
                continue
            }

            const propStmt = [];
            const fieldName = child.getFieldName();
            const defaultValue = child.getDefaultValueByType();
            generator.appendField(fieldName, defaultValue, ['observable'], [`${child.getDescription()}`]);
            generator.appendBatchLinesIntoFunctionSection(
                this.getFunctionsDependOnFieldType(child.type,
                    {
                        name: child.getName(),
                        fieldName,
                        hasPath: child.hasPath(),
                        isCheapArray: child.isCheapArray(),
                        type: child.type,
                        defaultValue,
                        isSelected: child.isSelected(),
                        paramString: this.getParamsOfDefaultValueOfWeb(child.getParamsInPath(), child).join(','),
                        argumentString: child.getStringOfArgumentsOfPath(),
                        stringOfParamInFetch: this.getParamsInFunctionByPlatform(child, 'fetch', false, false, true),
                        stringOfArgumentInFetch: this.getArgumentsInFunction(child, 'fetch'),
                        stringOfParamInSubmitItems: this.getParamsInFunctionByPlatform(child, child.isCheapArray() ? 'submit items of cheap' : 'submit items', false, false, true),
                        stringOfArgumentInSubmitItems: this.getArgumentsInFunction(child, child.isCheapArray() ? 'submit items of cheap' : 'submit items'),
                        stringOfParamInSubmitItem: this.getParamsInFunctionByPlatform(child, 'submit item', false, false, true),
                        stringOfArgumentInSubmitItem: this.getArgumentsInFunction(child, 'submit item'),
                        hasPaginate: child.hasPaginate(),
                        paginateSize: child.getPaginateSize(),
                        fieldClass: child.getClassName(),
                        isTimePickerView: child.isTimeDatePickerView() || child.isTimeDateRangePickerView()
                    }));
            if (child.isBelong2TimeStamp()) continue;

            if (child.isString()) propStmt.push(`if(obj && _.isString(obj.${fieldName}))`);
            else if(child.isNumber()) propStmt.push(`if(obj && _.isNumber(obj.${fieldName}))`);
            else if (child.isBoolean()) propStmt.push(`if(obj && _.isBoolean(obj.${fieldName}))`);
            else if (child.isArrayOfField()) propStmt.push(`if(obj && _.isArray(obj.${fieldName}))`);
            else if (child.isObjectOfEmpty()) propStmt.push(`if(obj && _.isObject(obj.${fieldName}))`);
            else propStmt.push(`if(obj && !Util.isUndefinedNullEmpty(obj.${fieldName}))`);
            propStmt.push(`{`);
            if (child.isArray()) {
                if (child.useAutoFuse())
                    propStmt.push(`this.${child.getFunctionNameOfAutoCompletedSuggestInitial()}(obj.${fieldName})`);/** node是故意的*/
                else if (!child.hasPaginate()) {
                    /** 因為invalidate做在pushXXX裏面 所以才會出現initial 要pushXXX,在悅譜-我的最愛 有這個奇怪的設計 hack */
                    propStmt.push(`this.${child.getFunctionNameOfSetter()}(...obj.${fieldName})`);
                }

                if (child.isReferenceNode() && !child.independence)
                    generator.appendImport(child.getClassName(), `../${child.ref.getStoreFolderName()}`)
                else {
                    generator.appendImport(child.getClassName(), `../${child.getStoreFolderName()}`)
                    await this.buildBaseStore(child)
                }
            } else if (child.isObject()) {
                if (child.isReferenceNode() && !child.independence) {
                    generator.appendImport(child.getClassName(), `../${child.ref.getStoreFolderName()}`)
                    continue;
                }
                generator.appendImport(child.getClassName(), `../${child.getStoreFolderName()}`)
                propStmt.push(`this.set${_.upperFirst(fieldName)}(obj.${fieldName})`);
                await this.buildBaseStore(child)
            } else {
                if (child.isNumber())
                    propStmt.push(`this.${child.getFunctionNameOfSetter()}(Util.getNumberOfNormalize(obj.${fieldName}))`);
                else if (child.isString())
                    propStmt.push(`this.${child.getFunctionNameOfSetter()}(Util.getStringOfNormalize(obj.${fieldName}))`);
                else if (child.isArrayOfField())
                    propStmt.push(`this.${child.getFunctionNameOfSetter()}(...obj.${fieldName})`);
                else
                    propStmt.push(`this.${child.getFunctionNameOfSetter()}(obj.${fieldName})`);
            }

            propStmt.push(`}`);
            propsStmt.push(...propStmt);

            if (child.isTimeStamp()) {
                generator.appendImport('dayjs', `dayjs`)
            }

        }
        return propsStmt;
    }

    /**
     * 過迴式產生 Store 的 Base class，包含欄位、setter/getter、fetch/submit API、
     * AutoComplete、i18n、paginate、listener 等完整的 Store 機制。
     * 使用 mapOfStoreBeenBuild 避免重複編譯。
     *
     * @param {CodegenNode} node - 要產生 Store 的節點（必須是 collection 類型）
     * @returns {Promise<void>}
     *
     * @example
     * await storeBuilder.buildBaseStore(questionNode);
     * // => 產生 BaseQuestionStore.js 和 index.js
     */
    buildBaseStore = async (node) => {
        const self = this;

        function getChildFetchStmtV2() {
            const stmts = _.map(node.getPreciseAttributePathChildren(), (child) => {
                const functionNameOfDecorate = Util.camel('enrich', child.getFieldName());
                baseGenerator.appendFunction(functionNameOfDecorate, [`content`], [], [`when '${child.getFieldName()}' fetch from remote, the entry of hack`], [`return content`])
                return child.isDisableInitFetch() ? '' : `async () => { 
                result.${child.getFieldName()} = self.${functionNameOfDecorate}(${getInitFetchStmtV2(child)});
                self.initial(result,false);
                }`
            })
            return `${_.filter(stmts, (stmt) => !_.isEmpty(stmt)).join(',')}`
        }

        function getCountOfThread(node) {
            const count = _.round(_.divide(_.size(node.getPreciseAttributePathChildren()), 2));
            return count > 1 ? count+1 : 2;
        }

        function enrichStmtsOfObject(node, stmts) {
            const contents = [
                `{`,
                (node.hasPath() && !node.isDisableInitFetch()) ? `...(await this.${node.getFunctionNameOfFetch()}(${self.getStringOfArgumentInFunction(node, 'fetch')})),` : `...{}`,
                `}`,
            ];
            contents.push(`await new InfinitePool(${getCountOfThread(node)}).runByEachTask([
                      ${getChildFetchStmtV2()}
                    ])`)
            stmts.push(...self.getDecorateFetchStrings(node.isObject(), ...contents));
        }

        function getInitFetchStmtV2(node) {
            let defaultStmt = `this.${node.getFieldName()} /** prepare with default value */`;

            const ruleOfRequiredAsyncTask = node.isPathArray() || node.isObject();
            if (ruleOfRequiredAsyncTask) {
                defaultStmt = node.isObject() ? `await new ${node.getClassName()}().fetch(view)` :
                    `await this.${Util.camel('fetch', node.getFieldName())}(view)`
                /** ${node.getFieldName()} 是在 array.mustache gen出來的 */


                if (node.isFetchOnlyLogin()) {
                    defaultStmt = `UserInfoRef.isLoginWithSucceed() ? ${defaultStmt}: this.${node.getFieldName()}`
                }

                if (node.isDisableInitFetch()) {
                    defaultStmt = `this.${node.getFieldName()} /** node.isDisableInitFetch() */`
                }
            }
            return defaultStmt;
        }

        /** 2023/02/05 在宣告時就把物件包成store了
         function getDefaultValueSetterStmts(node) {
         const stmts = [];
         for (const child of node.getPreciseAttributeChildren()) {
         if (child.isCollection()) {
         stmts.push(`this.${Util.camel(`set`, child.getFieldName())}(
         ${child.isArray() ? '...' : ''}this.${child.getFieldName()})`)
         }
         }
         return stmts;
         }
         */

        function getStmtOfFetchByDetail(node) {
            const stmts = []
            if (node.needDetail) {
                stmts.push(
                    `if(view.isDetailPage()){`,
                    `const item = await this.${node.getFunctionNameOfFetchItem()}(view, view.${node.getFunctionNameOfDetailUidGetter()}());`,
                    `return item.exists ? [item] : []`,
                    `}`)
            }
            return stmts;
        }

        function appendI18nFieldSetterGetter(generator, fieldName) {
            generator.appendField(fieldName,
                `i18n.location().${fieldName}`,
                ['observable']
            );
            generator.appendFunction(self.getFunctionNameOfSimpleSetter(fieldName), ['param'], ['action'],
                [], `this.${fieldName} = param`);

            generator.appendFunction(self.getFunctionNameOfSimpleGetter(fieldName), [], [],
                [], `return this.${fieldName}`);
        }

        function getStmtsOfFetch(node) {
            const stmts = [];
            switch (node.getType()) {
                case 'object':
                    enrichStmtsOfObject(node, stmts);
                    break
                case 'array':
                    if (node.isPathArray()) {
                        stmts.push(...getStmtOfFetchByDetail(node));
                        stmts.push(`return await this.${node.getFunctionNameOfFetch()}(${self.getStringOfArgumentInFunction(node, 'fetch')})`);
                    } else if (node.isCheapArray()) {
                        stmts.push(
                            `return await this.${node.getFunctionNameOfFetch()}(${self.getStringOfArgumentInFunction(node, 'fetch')}, ${STRING_OF_ID_OF_DEFAULT_CHEAP_ARRAY})`);
                    } else {
                        throw new ERROR(9999, '48144544142854 不能跑進來這裡')
                    }
                    break
                default:
                    throw new ERROR(9999, '4845441351854 不能跑進來這裡')
            }
            return stmts;
        }

        const folderName = node.getStoreFolderName();

        if (_.isUndefined(this.mapOfStoreBeenBuild[folderName])) {
            this.mapOfStoreBeenBuild[folderName] = true;
        } else {
            /** 這個store已經編譯過了 */
            Util.appendInfo(`87841234323 ${folderName} 已經編譯過了`)
            return;
        }


        const className = node.getStoreClassName();
        const baseClassName = `Base${className}Store`;
        const moduleClassName = `${KEYWORD_OF_MODULARIZED}${className}Store`;
        const indexClassName = `${className}Store`;
        const baseGenerator = new ClassGenerator(Util.joinRespectingDot(this.genStoreRootPath, folderName, `${baseClassName}.js`), this.nodeOfAncestor);
        baseGenerator.appendClass(baseClassName, {name: `BaseStore`, from: '../../base/BaseStore'});
        /** 加上 ref 是因為怕會和 UserInfoStore 打架 */
        baseGenerator.appendFunction(`getClassName`, [], [], [], `return '${baseClassName}'`);
        const propsStmt = [];
        if (node.hasAttributeChildren()) {
            const propStmt = await (this.buildFieldAttribute(baseGenerator, node));
            propsStmt.push(...propStmt);
        }

        if (node.isStructNode()) {
            for (const param of node.getParamsInRouter()) {
                baseGenerator.appendFunction({name: Util.camel(`getParamOf`, param, `InPath`), arrow: true}, [], [], [],
                    `return this.getComponent(true).${this.getNormalizeFieldOfParamInPath(param)}`
                )
            }

            if (node.getNodeOfComponent().detailPage) {
                baseGenerator.appendFunction({name: node.getFunctionNameOfDetailUidGetter(), arrow: true}, [], [], [],
                    `return this.getComponent(true).${node.getFunctionNameOfDetailUidGetter()}()`
                )
            }

            /** page title 的部分 */
            appendI18nFieldSetterGetter(baseGenerator, node.getFieldNameOfPageTitle());
        }


        /** 這邊專門處理remote fetch 的邏輯 */
        new RemoteFunctionHandler(self.props, baseGenerator).buildFetchSubmitApi(node);
        new RemoteFunctionHandler(self.props, baseGenerator).buildListenerFunction(node);

        if (node.isObject() || node.isPathArray()) {
            baseGenerator.appendAsyncFunction(`fetch`, this.getParamsInFunctionByPlatform(node, 'fetch'),
                [], [], ...getStmtsOfFetch(node));
        }

        if (node.isArray()) {
            baseGenerator.appendFunction('remove', [], [], ['type是array, 才會被gen出的method'],
                `if(this.getParentNode())`,
                `this.getParentNode().remove${_.upperFirst(node.getFieldName())}(this)`
            )

            baseGenerator.appendFunction('moveSelfToAside', ['toTail = true'], ['action'], ['把自己移動到array的頭或尾'],
                `if(this.getParentNode()){`,
                `const items = this.getParentNode().get${_.upperFirst(node.getFieldName())}();`,
                `this.getParentNode().set${_.upperFirst(node.getFieldName())}(...Util.getArrayOfMoveSpecificItemToAside(items, this, toTail))}`,
            )
        }
        const stmtsOfRangeNormalize = [];
        for (const child of node.getPreciseAttributeChildren()) {
            if (child.isPathArray()) {
                const fieldName = Util.camel('conditions', 'of', child.getName());
                baseGenerator.appendField(fieldName, '[]')
                baseGenerator.appendFunction(Util.camel('set', child.getName(), 'conditions'), ['conditions'], [], [],
                    `if(_.isArray(conditions))`,
                    `this.${fieldName} = conditions`)
                baseGenerator.appendFunction(child.getFunctionNameOfClearCondition(), [], [], [],
                    `this.${fieldName}.length = 0`)
                baseGenerator.appendFunction(child.getFunctionNameOfPushCondition(), ['condition'], [], [],
                    `this.${fieldName}.push(condition)`)
                baseGenerator.appendFunction(child.getFunctionNameOfGetCondition(), [], [], [],
                    `return this.${fieldName}`)
            }

            if (child.isTimeDateRangePickerView()) {
                stmtsOfRangeNormalize.push(`result.${child.getFieldName()} = [this.normalizeAsDayjs(result.${child.getFieldNameOfStart()}),this.normalizeAsDayjs(result.${child.getFieldNameOfEnd()})];`)
            }

            if (child.isAutoCompleteView()) {
                baseGenerator.appendImport(`Fuse`, 'fuse.js');
                baseGenerator.appendFunction(child.getFunctionNameOfAutoCompletedSuggestInitial(), ['array'], [], [],
                    `this.${child.getFieldNameOfFuse()} = new Fuse(array, { shouldSort: true, includeScore: true, keys: ["label", "value"] });`,
                    `this.${Util.camel('set', child.getFieldNameOfSuggest())}s(...array)`
                )

                baseGenerator.appendFunction({
                        name: child.getFunctionNameOfAutoCompleteInvalidate(),
                        async: true
                    }, ['keyword'], [], [],
                    `if (!_.isUndefined(keyword) && this.${child.getFieldNameOfFuse()}) {`,
                    `Util.executeTimeoutTask(async () => {`,
                    `const suggests = this.${child.getFieldNameOfFuse()}.search(keyword).map(each => each.item);`,
                    `this.${Util.camel('set', child.getFieldNameOfSuggest())}s(...suggests) },300,'ID_OF_ASYNC_HANDLE_${_.toUpper(child.getFieldName())}')}`
                )

            }

            if (child.hasConfirmDialog()) {
                _.each([child.getFieldNameOfDialogTitle(),
                    child.getFieldNameOfDialogContent()], (fieldName) => {
                    appendI18nFieldSetterGetter(baseGenerator, fieldName);
                })
            }

            if (child.hasInputFieldDialog()) {
                _.each([child.getFieldNameOfDialogInputValue(),
                    child.getFieldNameOfDialogInputLabel()], (fieldName) => {
                    appendI18nFieldSetterGetter(baseGenerator, fieldName);
                })
            }
        }

        if (_.size(stmtsOfRangeNormalize) > 0) {
            baseGenerator.appendFunction('decorate', ['result'], [], [],
                ...stmtsOfRangeNormalize, 'return result')
        }

        const types = [
            {
                name: `columnData`,
                fetcher: (node) => _.filter(node.getPreciseColumnChildren(), (child) => !child.isDisableOfColumn())
            }, {
                name: `data`,
                join: true,
                fetcher: (node) => _.filter(node.getPreciseAttributeChildren(), child => !child.isColumn() || child.isDisableOfColumn())
            }
        ];

        types.map(type => {
            baseGenerator.appendFunction({ name: type.name, arrow: true }, [`obj = this`], [], [],
                'return {',
                type.fetcher(node).map((child) => `${child.getFieldName()}:${this.getPreciseValue(child)}`).join('\n'),
                `${type.join ? `...this.columnData(obj)` : ''}`,
                '}');
        });

        if (_.isEqual(folderName, SIGN_OF_EMPTY_STORE)) {
            return;
        }

        baseGenerator.appendFunction('clean', [], ['action'], [],
            // `Util.appendInfo('🧹 ${className} store info clean 🧹')`,
            `super.clean()`,
            ...node.getPreciseAttributeChildren()
                .map((child) => {
                        if (child.isArray()) {
                            const stmts = [`this.${child.getFieldName()} = ${child.getDefaultValueByType()}`]
                            if (child.isPathArray()) {
                                stmts.push(`this.${child.getFunctionNameOfClearCondition()}()`);
                            }
                            if (child.hasPaginate()) {
                                stmts.push(`this.${Util.camel('set', 'next', child.getName(), 'page', 'mode')}('paging')`);
                                stmts.push(`this.${Util.camel('clean', child.getName(), 'Next', 'Ids')}()`);
                                stmts.push(`this.${Util.camel('last', 'item', 'of', child.getName())} = undefined`);
                            }
                            return stmts.join('\n');
                        } else if (child.isObject()) {
                            return `this.${child.getFieldName()}.clean()`;
                        } else if (child.useAsMuiImport()) {
                            return ``;
                        } else {
                            return `this.${child.getFieldName()} = ${child.getDefaultValueByType()}`;
                        }
                    }
                ))

        baseGenerator.appendFunction('refreshLocally', [], ['action'], ['用來做i18n功能'],
            `super.refreshLocally()`,
            ...node.getPreciseAttributeChildren()
                .map((child) => {
                        if(!child.l10n) return ''
                        else if(child.isCheapArray() || child.isPathArray())
                            return `_.each(this.${child.getFunctionNameOfGetters()}() , (item) => item.refreshLocally())`
                         else if (child.isArray())
                            return `this.${child.getFunctionNameOfSetter()}(...Util.getArrayOfMappingRef(this.${child.getFieldName()},${child.getDefaultValueByType()}))`;
                         else if (child.isObject())
                            return `this.${child.getFieldName()}.refreshLocally()`;
                         else if (child.isString() && !Util.isUndefinedNullEmpty(child.getDefaultValue()))
                                return `this.${child.getFieldName()} = ${child.getDefaultValueByType()}`;
                         else return '';
                    }
                ))


        /** 因為defaultValue沒有被store包裝過, 所以建構子要弄一下
         ** 2023/02/05 在宣告時就把物件包成store了
         baseGenerator.appendFunction('setDefaultValues', [], [], [],
         ...getDefaultValueSetterStmts(node)
         )
         * */
        baseGenerator.appendFunction(`initial`, ['obj', 'notify = true'], ['action'], [],
            `super.initial(obj)`,
            ...propsStmt, `if(notify) this.onInitialCompleted(obj).catch((error) => console.log('88967 ${this.getClassName()}' , error.message))`);
        baseGenerator.appendConstructor(
            `makeObservable(this)`,
            `this.initial(props)`);
        this.importStoreDefault(baseGenerator);

        if (node.isModuleComponent()) {
            const moduleGenerator = new ClassGenerator(Util.joinRespectingDot(this.genStoreRootPath, folderName, `${moduleClassName}.js`), this.nodeOfAncestor);
            moduleGenerator.appendClass(moduleClassName, {name: baseClassName, from: `./${baseClassName}`});
            moduleGenerator.needIndexFile(`${indexClassName}`);
            moduleGenerator.needSignature(false);
            this.importStoreDefault(moduleGenerator);
            await moduleGenerator.persist();
        } else {
            baseGenerator.needIndexFile(`${indexClassName}`);
        }
        await baseGenerator.persist();
    }

    importStoreDefault(generator) {
        generator.appendImport(`{
        makeAutoObservable, makeObservable, action, 
        observable, comparer, computed, autorun, runInAction,toJS}`,
            'mobx')
        generator.appendImport('UserInfoRef', '../../base/BaseUserInfo');
        generator.appendImport(`Cookie`, '../../cookie');
        generator.appendImport(`Router`, '../../router');
        generator.appendImport(`i18n`, '../../i18n');
        generator.appendImport(`Config`, '../../config');
        /** generator.appendImport(`{Application}`, '../../');
         * lint檢查-> error Dependency cycle
         * */
    }

    getDecorateFetchStrings(isObject = false, ...contents) {
        let normalize = contents;
        if (isObject) {
            normalize = [
                `const self = this`,
                `const result = `, ...normalize,
                `this.fromJson(result)`,
            ]
        }
        normalize = [
            ...normalize,
            'return result',
        ]
        return normalize
    }
}

export default StoreBuilder;
