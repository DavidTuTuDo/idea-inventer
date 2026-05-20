/**
 * component-builder.ts
 *
 * 功能說明：
 * ComponentBuilder 負責產生 React Component 的 Base class 程式碼。
 * 將 source.js 中的 view 結構轉譯為 JSX 字串。
 *
 * 主要職責：
 * - buildBaseComponent(): 產生 Component 的 Base class (getStore, componentDidMount, renderView)
 * - getJSXStrings(): 將節點的 view 資訊轉換為 JSX 字串陣列
 * - getJSXStringsByNode(): 處理每個子節點的 JSX 產生 (包含 array/object/ref 等情境)
 * - appendRenderViewFunctions(): 遞迴產生所有 renderView 函式
 * - 管理 className 記錄 (供 Less 樣式產生使用)
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

class ComponentBuilder extends BaseBuilder {

    hasRootRenderViewFunction = false;
    classNames = [];
    componentDidMountStmt = [];
    componentDetachStmt = [];

    constructor(props) {
        super(props);
    }

    getClassName() {
        return 'ComponentBuilder';
    }

    importComponentDefault(generator) {
        generator.appendImport(`Cookie`, '../../cookie');
        generator.appendImport(`Router`, '../../router');
        generator.appendImport(`Config`, '../../config');
        // generator.appendImport(`{Application}`, '../../');
        generator.appendImport('UserInfoRef', '../../base/BaseUserInfo');
        generator.appendImport(`React`, 'react');
        generator.appendImport(`i18n`, '../../i18n');
    }

    appendStmtIntoComponentDidMount(...stmt) {
        this.componentDidMountStmt.push(...stmt);
    }

    appendStmtIntoComponentDetach(...stmt) {
        this.componentDetachStmt.push(...stmt);
    }

    /**
     * 產生 Component 的 Base class，包含 getStore、componentDidMount、renderView、
     * URL 參數處理、Event 訂閱、Navigator、PageTitle 等完整的 Component 機制。
     * 若為 moduleComponent 會額外產生 Modularized class。
     *
     * @param {CodegenNode} componentNode - component 節點
     * @returns {Promise<{ classNames: Array, events: Array }>} 產生的 class 名稱與事件列表
     *
     * @example
     * const result = await componentBuilder.buildBaseComponent(componentNode);
     * // => 產生 BaseExamComponent.js、index.js、可能的 ModularizedExamComponent.js
     */
    async buildBaseComponent(componentNode) {

        const baseComponentName = componentNode.getStruct().getName();
        if (Util.isEqual(baseComponentName, SIGN_OF_EMPTY_STORE)) {
            return;
        }

        const baseClassName = `Base${_.upperFirst(baseComponentName)}Component`;
        const moduleClassName = `${KEYWORD_OF_MODULARIZED}${_.upperFirst(baseComponentName)}Component`;

        const className = `${_.upperFirst(baseComponentName)}Component`;
        const folderName = baseComponentName;

        const baseGenerator = new ClassGenerator(Util.joinRespectingDot(this.genComponentRootPath, folderName, `${baseClassName}.js`), this.nodeOfAncestor);
        /**  baseGenerator.insertBatchLines(this.getComponentClassBody(baseClassName)); */
        // baseGenerator.appendImport(`{styled, alpha}`, '@mui/material/styles');
        baseGenerator.appendClass(baseClassName,
            (componentNode.isPreciselyEditableComponent() || componentNode.needEditorBase) ? {
                name: 'BaseEditorComponent',
                from: '../../base/BaseEditorComponent'
            } : {
                name: 'ImpComponent',
                from: '../../base/ImpComponent'
            }
        );

        baseGenerator.appendFunction('getComponentName', [], [], [], `return '${className}'`)

        this.importComponentDefault(baseGenerator);
        baseGenerator.appendImport('Style', '../../style');

        const paramsInPath = [];/**{name:functionName}*/
        for (const param of componentNode.getParamsInRouter()) {
            const fieldNameOfParam = this.getNormalizeFieldOfParamInPath(param);
            const functionNameOfParamConstraint = Util.camel('isValidOf', fieldNameOfParam);
            baseGenerator.appendConstructor(`
            if (this.propsMobX())
            this.${fieldNameOfParam} = this.isComponentView()? this.propsMobX().${fieldNameOfParam} : this.propsMobX().${param}`);
            paramsInPath.push({functionNameOfParamConstraint, param: fieldNameOfParam});
            baseGenerator.appendConstructor(`Util.appendInfo(\`param of url => ${fieldNameOfParam}:$\{this.${fieldNameOfParam}\}\`)`);
            baseGenerator.appendFunction(functionNameOfParamConstraint, [param], [], [],
                'return false;'
            )
        }
        baseGenerator.appendField(`nameOfComponent`, `'${componentNode.getName()}'`, [], [], 'static')

        if (_.size(paramsInPath) > 0) {
            /** 這個邏輯必須在fetch之前 */
            this.appendStmtIntoComponentDidMount(`if(!this.isComponentView() && !Util.and(${paramsInPath.map((each) => `this.${each.functionNameOfParamConstraint}(this.${each.param})`).join(',')}))
                this.getStore().setErrorMsg('網址參數異常')`)
        }

        if (componentNode.detailPage) {
            baseGenerator.appendFunction('isDetailPage', [], [], [],
                'return true');

            baseGenerator.appendFunction(componentNode.getFunctionNameOfDetailUidGetter(), [], [], [],
                `return this.${componentNode.getFieldNameOfDetailUid()}`);

            this.appendStmtIntoComponentDidMount(`
            if (this.propsMobX())
            this.${componentNode.getFieldNameOfDetailUid()} = this.propsMobX().${componentNode.getFieldNameOfDetailUid()};
            if(!this.isComponentView() && Util.isUndefinedNullEmpty(this.${componentNode.getFieldNameOfDetailUid()}))
                this.getStore().setErrorMsg('網址參數異常');`);
        }

        if (Util.isEqual(componentNode.getName(), componentNode.getParentNode().getNavigationComponentName())) {
            baseGenerator.appendFunction('isNavigationView', [], [], [],
                `return true`
            )
        }

        this.appendRenderViewFunctions(componentNode.getStruct(), baseGenerator, componentNode.isPreciselyEditableComponent());

        if (componentNode.hasPageTitle()) {
            this.appendStmtIntoComponentDidMount(`this.invalidatePageTitle()`);
        }
        this.appendStmtIntoComponentDidMount(`if(this instanceof ImpComponent && Util.isFunction(this.exeAsyncT)) this.exeAsyncT(this.initialize())`)
        baseGenerator.appendFunction(
            {name: `invalidatePageTitle`, arrow: true}, ['title'], [], [],
            `this.setPageFullTitle(title ?? this.getStore().${this.getFunctionNameOfSimpleGetter(componentNode.getStruct().getFieldNameOfPageTitle(), false)})`
        )
        const nodesUseCache = componentNode.getNodesBy(node => node.useCache);
        const cookieCaller = (node) => Util.camel(`get`, node.getNameOfHierarchicalOfCookieUsage());
        const setterCaller = node => `set${_.upperFirst(node.getName())}`
        this.appendStmtIntoComponentDidMount(...nodesUseCache.map((node) => `this.getStore().${setterCaller(node)}(Cookie.${cookieCaller(node)}())`));

        baseGenerator.appendFunction({name: `isEnableInitFetch`, arrow: true}, [], [], [],
            `return this.enableInitFetch`);
        baseGenerator.appendField('enableInitFetch', true)
        baseGenerator.appendFunction({
            name: `setEnableInitFetch`,
            arrow: true
        }, ['enable'], [], [], `this.enableInitFetch = enable`);
        baseGenerator.appendFunction({name: `initialize`, arrow: true, async: true}, [], [], [],
            `const store = this.getStore();
                     let result;
                    await store.onInitialFetchBeginning();
                    try {
                        if (store.isFetchAbleToGo() && this.isEnableInitFetch()) 
                            result = await store.fetch(this);
                        else result = undefined;
                    } catch (error) {
                        store.setHasNextPageBehavior(false);
                        this.onInitialErrorHappened(error);
                    } finally {
                        Util.appendInfo("${componentNode.getName()} page initial fetch completed");
                        await UserInfoRef.waitLoginCompleted();
                        await store.onInitialFetchCompleted(result);
                        store.setInitialFetchCompleted(true);
                        if(this.isDialogComponent()) this.getStore().initial(this.getComponentInstance()?.${componentNode.getFunctionNameOfDialogPesetObj(baseComponentName)}?.())
                    }
                 `);



        /** 2022.04.25本來以為離開頁面就要清空所有, 但這樣ios swipe-back 體驗會變得很糟糕
         this.appendStmtIntoComponentDetach(`this.getStore().clean()`);
         for (const child of componentNode.getStruct().getChildren()) {
         if (child.isPathArray()) {
         this.appendStmtIntoComponentDetach(`this.getStore().${child.getFunctionNameOfClearCondition()}()`);
         }

         if (child.hasPaginate()) {
         this.appendStmtIntoComponentDetach(`this.getStore().${Util.camel('set', 'next', child.getName(), 'page', 'mode')}('paging')`);
         this.appendStmtIntoComponentDetach(`this.getStore().${Util.camel('clean', child.getName(), 'Next', 'Ids')}()`);
         }
         }
         */

        function getStmtsOfGetStore() {
            const stmts = [];
            stmts.push(`const store = this.isComponentView() ? this.propsMobX().${FIELD_NAME_OF_INJECT_STORE} : this.propsMobX().${componentNode.getPreciseStoreName()}`)
            stmts.push(`store.setComponent(this)`)
            stmts.push(`return store;`)
            return stmts;
        }

        baseGenerator.appendFunction({arrow: true, name: 'getStore'}, [], [], [],
            ...getStmtsOfGetStore())

        baseGenerator.appendFunction('componentDidMount',
            [], [], [], `super.componentDidMount()`, ...this.componentDidMountStmt);

        baseGenerator.appendFunction('componentWillUnmount',
            [], [], [], `super.componentWillUnmount()`, ...this.componentDetachStmt);

        baseGenerator.appendFunction('isDisposableComponent',
            [], [], [], `return ${componentNode.disposablePage}`);
        /** index.js */
        if (Util.isEqual(componentNode.getName(), componentNode.getParentNode().getNavigationComponentName())) {
            baseGenerator.appendFunction('isNavigator', [], [], [], 'return true');
        }

        if (Util.isEqual(componentNode.getName(), 'infoOfCopyRight')) {
            baseGenerator.appendFunction('isCPRT', [], [], [], 'return true');
        }

        if (componentNode.isModuleComponent()) {
            const moduleGenerator = new ClassGenerator(Util.joinRespectingDot(this.genComponentRootPath, folderName, `${moduleClassName}.js`), this.nodeOfAncestor);
            moduleGenerator.appendClass(moduleClassName, {
                name: baseClassName,
                from: `./${baseClassName}`
            })
            moduleGenerator.needSignature(false);
            moduleGenerator.needIndexFile(className);
            this.importComponentDefault(moduleGenerator);
            await moduleGenerator.persist();
        } else {
            baseGenerator.needIndexFile(className)
            /**
             * 2026.01.15 在BaseApp裡面用observable注入，不用inject惹
             * baseGenerator.needIndexFile(className, [`inject('${componentNode.getStruct().getName()}')`, `observer`])
             */

        }
        await baseGenerator.persist();
        return {classNames: this.classNames, events: componentNode.getEvents()};
    }

    /**
     * {
     *     generator:'ClassGenerator',
     *     tag:'tag',
     *      contentless: 直接給 /> 做結尾,不然都會預設 </View>
     *      props:{...name:object},
     *      contents:['cotent1','content2']
     *      children: ['ccc'],
     *      classNameType:['ListWrap','List','Wrap','Default']
     * }
     *
     * ////////////// sample: ///////////////
     praam :{
     tag: node.view,
     simpleProps = [...string], 就是沒有key的prop {...params};
     props: { style: {height: 80},className:'className' }, ### means 不需要 single quatation
     contents: [`Util.appendInfo()`,`Util.appendError()`],
     children:['children1','children2'],
     typeOfClass: 'component'|'store'|'others'
     }

     * output:
     <Paper
     {...children}
     style={{ height: 80 }}
     className={"className"} >
     {Util.appendInfo()}
     {Util.appendError()}
     </Paper>
     */

    /**
     * 將節點的 view 資訊轉換為 JSX 字串陣列。
     * 處理 props 的值正規化（支援 ###、物件、陣列、字串、數字、布林值）、
     * simpleProps、contents、children、VIEW_IMPORTS 的自動 import。
     *
     * @param {{ tag: string, props?: Object, simpleProps?: string[], contents?: string[], children?: string[], generator?: ClassGenerator, customViewNode?: CodegenNode, typeOfClass?: string }} param
     * @returns {string[]} JSX 字串陣列
     *
     * @example
     * const jsx = builder.getJSXStrings({
     *   tag: 'Paper',
     *   props: { style: { height: 80 }, className: 'myClass' },
     *   contents: ['{self.getTitle()}'],
     *   generator: gen,
     *   typeOfClass: 'component'
     * });
     * // => ['<Paper', 'style={{...}}', 'className={"myClass"}>', '{self.getTitle()}', '</Paper>']
     */
    getJSXStrings(param) {

        /**
         * 遞迴地將值轉換為特定字串格式。
         * @param {*} value 要正規化的值
         * @param {boolean} [isNested=false] 標記此調用是否為巢狀物件或陣列的內部元素
         * @returns {string} 正規化後的字串
         */
        function normalize(value, isNested = false) {
            let result;

            // --- 1. 處理基本類型：數字 / 布林值 / 字串 ---
            if (Util.isNumber(value) || Util.isBoolean(value)) {
                // 巢狀時不加 {}，頂層時加上 {}
                result = isNested ? `${value}` : `{${value}}`;
            } else if (Util.isString(value)) {
                if (value.startsWith("###")) {
                    const cleaned = Util.getStringOfDropHeadSign(value, "#");
                    // 處理 ### 字串：巢狀時不加 {}，頂層時加上 {}
                    result = isNested ? cleaned : `{${cleaned}}`;
                } else {
                    // 處理普通字串：巢狀時不加 {} (JSON.stringify 會自動加上 "")，頂層時加上 {}
                    const stringified = JSON.stringify(value);
                    result = isNested ? stringified : `{${stringified}}`;
                }
            }

            // 如果結果已經在基本類型中確定，直接返回
            if (result !== undefined) {
                return result;
            }

            // --- 2. 處理陣列 (遞迴點 1) ---
            if (Array.isArray(value)) {
                // 對陣列中的每個元素遞迴調用 normalize，並標記 isNested = true
                // 陣列總是使用 [] 包圍
                const stmts = value.map(val => normalize(val, true));
                return `[${stmts.join(',')}]`;
            }

            // --- 3. 處理物件 (遞迴點 2) ---
            if (Util.isObject(value)) {
                const stmts = Object.entries(value).map(([key, val]) => {
                    let normalizedVal;

                    // 檢查值是否為特殊字串：物件內 ### 字串的終止條件，保持不變
                    if (Util.isString(val) && val.startsWith("###")) {
                        // 在物件內部，特殊字串始終不加 {} (因為父層的 {} 已經被 ' : ' 隔開)
                        normalizedVal = Util.getStringOfDropHeadSign(val, "#");
                    } else {
                        // 對於所有其他類型，進行遞迴調用，並標記 isNested = true
                        normalizedVal = normalize(val, true);
                    }

                    return `'${key}' : ${normalizedVal}`;
                });

                // 關鍵修正：物件的包裝邏輯
                if (isNested) {
                    // 如果是巢狀物件，只返回單層括號 {...}
                    return `{${stmts.join(",")}}`;
                } else {
                    // 只有頂層物件才返回雙層括號 {{...}}
                    return `{{${stmts.join(",")}}}`;
                }
            }

            // --- 4. 處理其他類型 (如 null, undefined, Symbol 等) ---
            // 這些類型通常需要被 JSON.stringify 處理
            const stringified = JSON.stringify(value);
            // 巢狀時不加 {}，頂層時加上 {}
            return isNested ? stringified : `{${stringified}}`;
        }

        function appendViewsImport() {
            const generator = param.generator;
            const node = param.customViewNode;
            if (!generator) return;

            if (_.isEqual(param.typeOfClass, 'component')) {
                for (const _import of VIEW_IMPORTS) {
                    if (Util.has(_import.views, param.tag)) {
                        param.generator.appendImport(_import.object ? `{${param.tag}}` : param.tag,
                            `${_import.from}${_import.simplePath ? `` : `/${param.tag}`}`)
                        break;
                    }
                }
            }

        }

        const props = param.props ?? {};
        const simpleProps = param.simpleProps ?? [];
        const contents = param.contents ? param.contents : [];
        const children = param.children ? param.children : [];
        const stmt = [];
        // const tag = _.isEqual("Typography", param.tag) ? "div" : param.tag;
        const tag = param.tag;
        if (_.isEqual(tag, 'React.Fragment')) {
            delete props['className'];
            delete props['style'];
        }

        stmt.push(`<${tag}`);
        stmt.push('\n');
        appendViewsImport();
        for (const child of children) {
            stmt.push(`{...${child}}`);
            stmt.push('\n');
        }

        for (const key in props) {
            const value = props[key];

            stmt.push(`${key}=${normalize(props[key])}\n`);
        }

        for (const prop of simpleProps) {
            stmt.push(`{${prop}}`)
        }

        if (Util.isEmpty(contents)) {
            stmt.push(`/>`);
            stmt.push('\n');
            return stmt;
        }

        stmt.push(`>`);
        stmt.push('\n');

        for (const content of contents) {
            stmt.push(`${content}`);
            stmt.push('\n');
        }

        stmt.push(SIGN_OF_JSX_CONTENT);
        stmt.push('\n\n');
        stmt.push(`</${tag}>`);
        stmt.push('\n\n');
        return stmt;
    }

    /** 把組合出className必備存起來
     *  {node,type: 'wrap'|'default'|'List'|'listWrap'|'Label'}
     *  後續要產生出less style才有根據
     *  {node, type: 'list'}
     *  */
    storeClassName(info = {}) {
        this.classNames.push(info);
    }

    getJSXStringsByNode = (generator, node, propsOfExtra) => {
        /**
         contentStmts 是指 ===>  <View > {contentStmts} <View>
         如果子節點是object或是array, 就產生出{this.getObjectOrArrayView(param)}
         如果子節點是string或是number, 就產生出{string}
         **/
        const self = this;

        /** */
        function getJsxViewStmt(node) {
            const props = {}
            const param = node.getObservableName();
            if (!Util.isUndefinedNullEmpty(param)) {
                props[param] = `###${param}`
            }

            if (node.isViewPropsFunctionality()) {
                props[STRING_OF_INJECT_PARAM] = `###${STRING_OF_INJECT_PARAM}`;
            }
            let viewJsxStmt = [];

            if (node.isReferenceStructNode()) {
                props.component = '###this';
                props.isComponentView = '###true';
                props[FIELD_NAME_OF_INJECT_STORE] = `###this.getStore().get${node.getClassName()}()`;
                /** 找出paramsInPath */
                for (const param of node.getParamsInRouter()) {
                    const fieldName = self.getNormalizeFieldOfParamInPath(param);
                    const functionNameOfInject = Util.camel('getInjectPropOf', fieldName);
                    generator.appendFunction(functionNameOfInject, [], [], [], `Util.appendInfo('${functionNameOfInject}() not implemented')`);
                    props[fieldName] = `###self.${functionNameOfInject}()`;
                }

                if (node.needImplementAction()) {
                    /** 產生component底下所有的onClick injectStyle override method */
                    for (const method of node.getNodeOfComponent().getFunctionMethods()) {
                        props[method.functionName] = `###self.${method.functionName}()`;
                        generator.appendFunction(method.functionName, [], [], method.comments ?? [],
                            `/** component view override method param content (${method.params.join(',')}), 
                            回傳 typeof === function, 就可以覆蓋原本的實作 */`);
                    }
                }
                const className = _.upperFirst(node.getName());
                generator.appendImport(className, `../${node.getName()}`)
                viewJsxStmt = self.getJSXStrings({
                    generator,
                    customViewNode: node,
                    tag: className,
                    typeOfClass: 'component',
                    props: {...props, ...propsOfExtra},
                })
            } else {
                viewJsxStmt = self.getJSXStrings({
                    generator,
                    customViewNode: node,
                    tag: node.getViewClassNameOfRenderView(),
                    typeOfClass: 'component',
                    props: {...props, ...propsOfExtra},
                })
            }
            return viewJsxStmt;
        }

        /** 就是把標註為 outer 的 child 放在同一個view的層級 */
        function getOuterChildJSXStrings(node) {
            const contentStmts = [];
            for (const child of node.getChildren()) {
                if (child.isOuter()) {
                    contentStmts.push(...getJsxViewStmt(child))
                }
            }
            return contentStmts;
        }

        /** 就是把標註為 outer 的 child 放在同一個view的層級 */
        function getListOuterChildJSXStrings(node) {

            const contentStmts = [];
            for (const child of node.getChildren()) {
                if (child.isListOuter()) {
                    contentStmts.push(...getJsxViewStmt(child))
                }
            }
            return contentStmts;
        }

        function getStmtsOfRenderEmptyView(node) {
            const stmts = []
            if (node.needEmptyTip()) {
                generator.appendImport(`ListEmptyTrigger`, `../../base/ListEmptyTrigger`);
                stmts.push(`<ListEmptyTrigger hasPath={${node.hasPath()}} component={self} size={_.size(${node.getFieldName()})}  />`)
            }
            return stmts;
        }

        function getStmtsOfSelectImageButton(node) {
            const stmts = []
            const parent = node.getPreciseAttributeParentName();
            const child = node.getChildNodeOfImage();
            const me = _.upperFirst(node.getFieldName());
            if (node.needAddImageButton()) {
                stmts.push(`{self.renderSelectImageButtonView({`,
                    `needWaterMark:${child.needWatermark ? 'true' : 'false'},`,
                    `folderName:'${child.getStorageFolderName()}',`,
                    `asyncTaskOfBeforeSubmit:(localUrls) => ${parent}.set${me}(...localUrls.map(url => {return {${child.getName()}:url}})),`,
                    `asyncTaskOfAfterSubmit:(remoteUrls) => ${parent}.set${me}(...remoteUrls.map(url => {return {${child.getName()}:url}})),`,
                    `})}`)
            }
            return stmts;
        }

        /** 產生出在component裡面的store getter , 這段邏輯只能擺在這裡, 不然非collection的屬性, 會產生不出來*/
        if (node.hasValidParent() && node.isAttribute() && !node.isArrayItem()) {
            function getGetterContentsOfFunction(_node) {
                const asPrice = node.isNumber() && node.price;
                const asFormat = !_node.isPickerView() && _node.isTimeStamp() && _node.hasFormat();
                const asComputed = _.isEqual(_node.computed, true);
                const stmtOfHead = _node.getPreciseAttributeParentName();
                const stmtOfGetter = `${_node.getFunctionNameInStoreGetter()}()`;
                const stringOfParam = `${stmtOfHead}.${stmtOfGetter}`;
                if (asFormat) return `return Util.getCustomFormatOfDatePresent(${stringOfParam},'${node.getFormat()}')`
                else if (asComputed && asPrice) return `return Util.formatPrice(${stmtOfHead}.${_node.getFunctionNameInStoreComputedGetter()})`
                else if (asComputed) return `return ${stmtOfHead}.${_node.getFunctionNameInStoreComputedGetter()}`
                else if (asPrice) return `return Util.formatPrice(${stringOfParam})`;
                else return `return ${stringOfParam}`
            }

            const computed = _.isEqual(node.computed, true);
            generator.appendFunction(node.getFunctionNameUsingInComponentGetter(),
                [`${node.getPreciseAttributeParentName()}`], [], [`${computed ? `必須在 store/${node.getPreciseAttributeParentName()}/index.js實作 @computed get ${node.getFunctionNameInStoreComputedGetter()}()` : ''}`],
                getGetterContentsOfFunction(node));
        }

        if (node.hasCustomViewDialog()) {
            const component = node.getSpecificComponent(node.alertDialog.customView);
            generator.appendImport(component.getName(), `../${component.getNodeOfStruct().getName()}`);
            const name = component.getName();
            if (node.alertDialog.callback)
                generator.appendAsyncFunction(node.getFuncNameOfDialogCallback(name), ["...param"], [],
                  [`callback function of '${name}' used as dialog`],
                  [`Util.appendInfo('${name} callback with following param', ...param)`]);
        }

        function getStmtsOfInjectListStyle(node) {
            return node.needInjectListStyle() ? `...self.${node.getFunctionNameOfInjectStyle('List')}(${node.getPreciseAttributeParentName()}),` : '';
        }

        function getStmtOfDisableObservable(node) {
            const arrayItemNode = node.getArrayItemNode();
            return [`this.${arrayItemNode.getViewClassNameOfRenderView()}({${node.getName()}})`];
        }

        /** type是array就必須的包上一成List,可以調整物件方向 */
        if (node.isArray()) {
            const clazzName = node.getClassNameOfLessUsage('list');
            this.storeClassName({node, type: 'list'});
            node.plural = node.plural ?? 's';
            const props = {
                className: clazzName,
                style: `###{${getStmtsOfInjectListStyle(node)}...${JSON.stringify(node.getListStyle())},...Style.${clazzName}}`,
                ...node.getListProps(),
            }

            const itemViewProps = {};
            itemViewProps['key'] = node.getUniqueIdStmt();
            itemViewProps[`${node.getName()}`] = `###${node.getName()}`
            const arrayItemNode = node.getArrayItemNode();
            let arrayItemViewStmts = node.disableObservable ? getStmtOfDisableObservable(node) :this.getJSXStrings({
                generator,
                customViewNode: arrayItemNode,
                typeOfClass: 'component',
                tag: `${arrayItemNode.getViewClassNameOfRenderView()}`,
                props: itemViewProps,
            })

            let arrayStmts = this.getJSXStrings({
                generator,
                tag: node.getListView(),
                props,
                typeOfClass: 'component',
                contents: [`{${node.getFieldName()}.map((${node.getName()}, index) => `,
                    ...arrayItemViewStmts, `)}`, ...node.getListContents(), ...getStmtsOfRenderEmptyView(node), ...getStmtsOfSelectImageButton(node)]
            })

            if (!node.isPreciselyEditableComponent() && node.needLoadingSkeleton()) {

                const clazzName = node.getClassNameOfLessUsage('skeleton');
                this.storeClassName({node, type: 'skeleton'});
                const props = {
                    variant: node.getVariantOfSkeleton(),
                    className: clazzName,
                    animation: 'wave',
                    height: 80,
                    width:'100%'
                };

                const stmtOfSkeleton = this.getJSXStrings({
                    generator,
                    tag: 'Skeleton',
                    typeOfClass: 'component',
                    props: props
                });

                arrayStmts = [`self.shouldDisplayLoadingArea(${node.getFieldName()}) ?`, ...stmtOfSkeleton, ` : `, ...arrayStmts]
            }

            function getStmtsOfInjectListWrapStyle(node) {
                return node.needInjectListWrapStyle() ? `...self.${node.getFunctionNameOfInjectStyle('ListWrap')}(${node.getPreciseAttributeParentName()}),` : '';
            }

            if (node.hasListWrap()) {
                const clazzName = node.getClassNameOfLessUsage('listWrap');
                this.storeClassName({node, type: 'listWrap'});

                return this.getJSXStrings(
                    {
                        generator,
                        tag: node.getListWrapView(),
                        typeOfClass: 'component',
                        props: {
                            className: clazzName,
                            style: `###{${getStmtsOfInjectListWrapStyle(node)}...${JSON.stringify(node.getListWrapStyle())},...Style.${clazzName}}`,
                            ...node.getListWrapProps(),
                        },
                        contents: [...node.getListWrapContents(), ...getListOuterChildJSXStrings(node), ...arrayStmts]
                    }
                )
            }
            return arrayStmts;
        }

        const contentStmts = [];
        for (const child of node.getPreciseViewChildren()) {
            if (!child.isView()) continue;
            if (child.isOuter()) continue;
            if (child.isListOuter()) continue;

            function appendParamStmt(node) {
                if (node.isViewPropsFunctionality()) {
                    return `(${STRING_OF_INJECT_PARAM}) => `
                }
                return ''
            }

            if (child.needIndependClick()) {
                generator.appendField(child.getFieldNameOfRef(), 'React.createRef()');
                child.appendViewProps({ref: `###self.${child.getFieldNameOfRef()}`})
            }
            if (child.isViewDefinedInProps()) {
                /** label = <Typography /> */
                node.props[child.injectViewProp.name] = `###${appendParamStmt(child)}${getJsxViewStmt(child).join('\n')}`;
                continue;
            }

            if (node.isContainer()) {
                if (child.isIncestView()) {
                    contentStmts.push(`{/* ${child.getName()}, incest view */}`);
                }
                contentStmts.push(...getJsxViewStmt(child))
            }
        }

        const className = node.getClassNameOfLessUsage('default');
        this.storeClassName({node, type: 'default'});
        const props = {
            className,
            ...node.getViewProps(),
        };
        const simpleProps = node.getSimpleProps();

        if (node.isArray()) {
            props.key = `${node.getUniqueIdStmt()}`;
        }
        if(node.isArrayItem() && node.disableObservable) props.key = node.getUniqueIdStmt();
        let origin = this.getJSXStrings({
            tag: node.getView(true),
            generator,
            props: {...props, ...propsOfExtra},
            simpleProps,
            typeOfClass: 'component',
            contents: [...contentStmts, ...node.getContents(generator)],
        });

        if (node.isTimeDatePickerView() || node.isTimeDateRangePickerView()) {
            origin = this.getJSXStrings({
                tag: `LocalizationProvider`,
                generator,
                props: {dateAdapter: `###AdapterDayjs`},
                typeOfClass: 'component',
                contents: [...origin],
            })
        }

        if (node.hasWrap()) {
            const clazzName = node.getClassNameOfLessUsage('wrap');
            this.storeClassName({node, type: 'wrap'});

            const propOfWrap = {
                className: `${clazzName}`,
                style: `###{...${JSON.stringify(node.getWrapStyle())},...Style.${clazzName}}`,
                ...node.getWrapProps(),
            }

            const rule = node.getRuleOfOuter();
            const content = node.virtual ? [] : origin;
            origin = this.getJSXStrings({
                tag: node.getWrapView(),
                generator,
                props: {...propOfWrap, ...propsOfExtra},
                typeOfClass: 'component',
                contents: _.isEqual(rule, 'start') ? [...getOuterChildJSXStrings(node), ...content, ...node.getWrapContents(generator)] :
                    [...content, ...getOuterChildJSXStrings(node), ...node.getWrapContents(generator)]
            })
        }

        if (node.isWrapByAppBarView() && node.isScrollingHideDependOnRootNode()) {
            origin = this.getJSXStrings({
                tag: 'ScrollingHideWrap',
                typeOfClass: 'component',
                props: { ...props, ...propsOfExtra, hidden: `###self.getStore().getWhetherAlwaysHidden()` },
                simpleProps: ['...self.propsMobX()'],
                contents: [...origin]
            })
        }
        return origin;
    }

    /** @deprecated 使用 normalizeJSXString 代替，功能相同。stmt:Array<String> */
    removeJSXSign(stmt) {
        this.normalizeJSXString(stmt);
    }

    /**
     * 為編輯頁面的節點產生 CRUD 操作的回呼函式。
     * 根據節點類型（array with path / array without path / object with path）
     * 產生 itemEditor 與 collectionEditor 函式，包含 duplicate、recover、update、delete、create、batchUpdate 等操作。
     *
     * @param {CodegenNode} node - 要處理的節點
     * @param {ClassGenerator} generator - 用來附加函式的 generator
     * @returns {void}
     */
    generateEditFunctionCallback(node, generator) {
        if (node.isArray()) {
            const parentName = node.getPreciseAttributeParentName();
            if (node.hasPath()) {
                generator.appendFunction(node.getFunctionNameOfItemEditor(), [node.getName()], [], [],
                    `const self =this`,
                    `return  async (type) => {
                switch (type) {`,
                    `case 'duplicate':`,
                    `/** 快速複製一個相同屬性的項目,除了id以外 */`,
                    `const parentNode = ${node.getName()}.getParentNode()`,
                    `if(parentNode !== undefined) {`,
                    `const clonedObject = Util.cloneDeep(${node.getName()}.columnData())`,
                    `delete clonedObject.id`,
                    `await parentNode.${node.getFunctionNameOfSubmit()}(self, clonedObject)`,
                    `}`,
                    `break;`,
                    `case 'recover':`,
                    `await ${node.getName()}.${node.getFunctionNameOfFetchItem()}(self)`,
                    `break;`,
                    `case 'update':`,
                    `await ${node.getName()}.${node.getFunctionNameOfUpdateItem()}(self)`,
                    `break;`,
                    `case 'delete':`,
                    `await ${node.getName()}.${node.getFunctionNameOfDeleteItem()}(self)`,
                    `break;`,
                    `default:`,
                    `Util.appendError(\`${node.getName()}  3032 can't not happen this type => \${type}\`)`,
                    `}`,
                    `}`
                )

                generator.appendFunction(node.getFunctionNameOfCollectionEditor(), [parentName], [], [],
                    `const self=this`,
                    `return  async (type) => {`,
                    `switch (type) {`,
                    `case 'create':`,
                    `/** 新增一筆空資料 */`,
                    `await ${parentName}.${node.getFunctionNameOfSubmit()}(self, {})`,
                    `break;`,
                    `case 'batchUpdate':`,
                    `await ${parentName}.${node.getFunctionNameOfBatchUpdate()}(self)`,
                    `break;`,
                    `default:`,
                    `Util.appendError(\`${node.getName()} 3033 can't not happen this type => \${type}\`)`,
                    `}`,
                    `}`
                )
            } else {
                generator.appendFunction(node.getFunctionNameOfItemEditor(), [node.getName()], [], ['因為沒有path, 所以其實只會是local sync task'],
                    `return  async (type) => {
                switch (type) {`,
                    `case 'delete':`,
                    `${node.getName()}.remove()`,
                    `break;`,
                    `default:`,
                    `Util.appendError(\`${node.getName()} 3034 can't not happen this type => \${type}\`)`,
                    `}`,
                    `}`
                )

                function appendStatementAtoEFunctions() {
                    const parentName = node.getPreciseAttributeParentName();
                    const stmts = [`case 'createA-E':`,
                        `${parentName}.${Util.camel(`push`, node.getFieldName())}(
                    {statement:' A '},
                    {statement:' B '},
                    {statement:' C '},
                    {statement:' D '},
                    {statement:' E '},
                    )`,
                        `break;`]
                    return stmts;
                }

                function appendStatement1to5Functions() {
                    const parentName = node.getPreciseAttributeParentName();
                    const stmts = [`case 'create1-5':`,
                        `${parentName}.${Util.camel(`push`, node.getFieldName())}(
                    {statement:' 1 '},
                    {statement:' 2 '},
                    {statement:' 3 '},
                    {statement:' 4 '},
                    {statement:' 5 '},
                    )`,
                        `break;`]
                    return stmts;
                }

                generator.appendFunction(node.getFunctionNameOfCollectionEditor(), [parentName], [], ['因為沒有path, 所以其實只會是local sync task'],
                    `return  async (type) => {`,
                    `switch (type) {`,
                    `case 'create':`,
                    `${parentName}.${Util.camel(`push`, node.getName())}()`,
                    `break;`,
                    `case 'clearAll':`,
                    `${parentName}.${Util.camel(`clean`, node.getFieldName())}()`,
                    `break;`,
                    ...appendStatementAtoEFunctions(),
                    ...appendStatement1to5Functions(),
                    `default:`,
                    `Util.appendError(\`${node.getName()} 3035 can't not happen this type => \${type}\`)`,
                    `}`,
                    `}`,
                )
            }
        } else if (node.isObject() && node.hasPath()) {
            generator.appendFunction(node.getFunctionNameOfCollectionEditor(), [node.getName()], [], [],
                `const self = this`,
                `return  async (type) => {`,
                `switch (type) {`,
                `case 'submit':`,
                `await ${node.getName()}.${node.getFunctionNameOfSubmit()}(self)`,
                `break;`,
                `case 'recover':`,
                `await ${node.getName()}.${node.getFunctionNameOfFetch()}(self)`,
                `break;`,
                `default:`,
                `Util.appendError(\`${node.getName()} 3035 can't not happen this type => \${type}\`)`,
                `}`,
                `}`,
            )
        }
    }

    /**
     * 移除 JSX 字串陣列中的 SIGN_OF_JSX_CONTENT 佔位符。
     *
     * @param {string[]} strings - 要清理的 JSX 字串陣列
     * @returns {void} 直接修改傳入的陣列
     *
     * @example
     * const stmts = ['<div>', SIGN_OF_JSX_CONTENT, '</div>'];
     * builder.normalizeJSXString(stmts);
     * // stmts => ['<div>', '</div>']
     */
    normalizeJSXString(strings) {
        _.remove(strings, (each) => _.isEqual(each, SIGN_OF_JSX_CONTENT));
    }

    existedFunctions = new Set();
    existedMethods = new Set();

    /**
     * 遍歷節點樹，為每個 view 節點產生對應的 renderView 箭頭函式（包含 observer 裝飾器）。
     * 處理 root renderView、method 註冊、import、paginate、array item view、
     * 以及過濾重複和 reference struct 節點。
     *
     * @param {CodegenNode} node - 要處理的節點
     * @param {ClassGenerator} generator - 用來附加函式的 generator
     * @param {boolean} isEditPage - 是否為編輯頁面（會額外產生 edit callback）
     * @returns {void}
     *
     * @example
     * builder.appendRenderViewFunctions(componentNode.getStruct(), generator, false);
     */
    appendRenderViewFunctions(node, generator, isEditPage) {

        const self = this;

        function normalize(...strings) {
            const _self = strings;
            _.remove(_self, (each) => _.isEqual(each, SIGN_OF_JSX_CONTENT));
            return `return ( ${_self.join('')})`;
        }

        function appendFunctionWithFields(node) {

            function getStringOfParamOfRenderView(node) {
                const params = [node.getObservableName()];
                _.remove(params, (each) => Util.isUndefinedNullEmpty(each))
                if (node.isViewPropsFunctionality()) {
                    params.push(STRING_OF_INJECT_PARAM);
                }
                return params.join(',');
            }

            generator.appendFunction({
                  name: node.getViewClassNameOfRenderView(),
                  arrow: true,
                  ...( !(node.isArrayItem() && node.disableObservable) && { decorator: 'observer' })
              }, [`{${getStringOfParamOfRenderView(node)}}`], [], [], ...getContentStmt(node, generator)
            );

        }

        function getContentStmt(node, _generator) {
            return [
                'const self = this',
                ...node.getSelfVariableStmts(),
                normalize(...self.getJSXStringsByNode(_generator, node))];
        }

        function appendViewFunctionClass(node) {
            appendFunctionWithFields(node);
        }

        if (isEditPage) {
            this.generateEditFunctionCallback(node, generator);
        }

        if (!this.hasRootRenderViewFunction) {
            generator.appendFunction({ name: "renderView", arrow: true }, [], [], [],
                `console.log('🔥🔥 ${node.getName()} component 出現 re-render()')`,
                `const ${node.getName()} = this.getStore()`,
                ...getContentStmt(node, generator));
            this.hasRootRenderViewFunction = true;
        }

        function persistMethod(generator, method) {
            const functionName = method.functionName;
            if (self.existedMethods.has(functionName)) return;

            generator.appendFunction(
                method.functionName,
                method.params,
                [],
                method.comments ?? [],
                `Util.appendInfo('${method.functionName} not override')`
            );
            self.existedMethods.add(functionName);
        }

        function shouldSkipChild(child, functionName) {
            /** 檢查是否應該跳過該子節點 */
            if (self.existedFunctions.has(functionName)) return true;  // 重複定義的 view 只出現一次
            if (child.isReferenceStructNode()) return true;       // 避免遞迴 build
            return false;
        }

        function handlePaginateConfig(child, generator, self) {
            /** 處理分頁相關配置 */
            if (!child.isArray() || !child.hasPaginate()) return;

            generator.appendFunction(
                'getThresholdOfScrollToBottom', [], [], [],
                `return ${child.getPaginateThreshold()}`
            );

            self.appendStmtIntoComponentDidMount('const view = this;');
            generator.appendConstructor(
                `this.registerScrollToBottomJob(this.getStore().${child.getFunctionNameOfFetch()})`
            );


        }

        function handleArrayChild(child, generator) {
            /** 處理陣列型態的子節點 */
            if (!child.isArray()) return;

            /**
             * 因為 type='array'，必須讓 Array 產出一個 itemView
             * 但 getJSXStringsByNode 邏輯太嚴謹，所以先用 clone 偽裝成一個 object 去 generate
             */
            appendViewFunctionClass(child.getArrayItemNode());
        }

        // 主程序邏輯
        for (const method of node.getFunctionMethods()) {
            persistMethod(generator, method);
        }

        for (const child of node.getPreciseViewChildren()) {
            const functionName = child.getViewClassNameOfRenderView();

            if (shouldSkipChild(child, functionName)) continue;

            // 處理方法註冊
            for (const method of child.getFunctionMethods()) {
                persistMethod(generator, method);
            }

            // 處理 imports
            for (const _import of child.getStmtsOfImport()) {
                generator.appendImport(_import.part, _import.from);
            }

            // 處理分頁配置
            handlePaginateConfig(child, generator, self);

            // 處理陣列子節點
            handleArrayChild(child, generator);

            // 遞迴處理視圖
            appendViewFunctionClass(child);
            if (child.hasViewChildren()) {
                this.appendRenderViewFunctions(child, generator, isEditPage);
            }

            self.existedFunctions.add(functionName);
        }
    }

}

export default ComponentBuilder;
