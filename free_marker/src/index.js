import {exceptioner as ERROR, utiller as Util} from 'utiller';
import _ from 'lodash';
import fs from 'fs';
import libpath from 'path';
import mustache from 'mustache';


/** author:明悅
 *  create time:Wed Mar 17 2021 13:17:01 GMT+0800 (Taipei Standard Time)
 */

const SIGN_OF_FUNCTION_START = `\/** -------------------- functions -------------------- **\/`;
const SIGN_OF_FIELD_START = `\/** -------------------- fields -------------------- **\/`;
const SIGN_OF_RESTFUL_API_START = `\/** -------------------- async api -------------------- **\/`;
const SIGN_OF_COLLECTION_START = `/** --- documents--- **/`;
const SIGN_OF_JSX_CONTENT = `<!-- jsx content -->`;
const SURE_TO_PERSIST_VERY_IMPORTANT = true;
// const SURE_TO_PERSIST_VERY_IMPORTANT = false;
// const CURRENT_PLATFORM = 'web';
const CURRENT_PLATFORM = 'admin';

class CodegenNode {

    node;
    password;
    components;
    path;
    /** 用來當作Router的導頁網址, 如果用在struct裡面就是當作remote fetchObject */
    /** path:`/purchaseSucceed/:transactionId?/:orderId?` ?代表這個值可有可無 */

    permission = {};
    /** 當struct 裡面的物件有 path時, 就對應有一個collection/document,
     * 用來描述 create,update,delete,read, 沒有描述就是isAdmin() */

    params;
    /** 目前用來做events 帶的參數 */

    host;
    /** 網域名稱啦 */

    disableFetch
    /** 有些store的field不需要在new的時候就fetch, 就設定為true*/

    events;
    /** 用來定義可以發送的event, 製造interface */

    platform;

    cookies;
    /** {name,type:object|string }對應到web使用的cookie, 好處是cookie會加密 */

    wrap;
    /** 在view外面包一層div,作為彈性的使用 */

    wrapContents;
    /** 當view有被wrap包住時,可以用wrapContent加上 ['{this.getTailView()}']*/

    outer;
    /** 搭配wrap服用的屬性, 可以放在wrap那一個圖層的效果 */

    props;
    /** 用在加上view額外的props,<div ...props/> */

    injectStyle;
    /** 如果有style的屬性需要透過邏輯判斷,就設為true,這樣會產出method */

    contents;
    /** 放在<div>content</div>*/

    navigation;
    /** 可以指定component為navigatorView 放置於頂部的view */

    incest;
    /** 支援父類是string 或是 number(非資料結構), 但是仍然有children的情形,
     在view和store上面也會產生出same generation的概念,
     incest只支援一層
     */

    needParam;
    /** 單純的view有時候會需要param作為顯示的判斷*/

    name;

    view;

    type;

    style;

    wrapView;
    /**  可以指定wrap的type default是div*/
    extra;
    /**  extra => 用於component mount 後,其所帶入的值 */

    children;

    plural;
    /** 用於產出合理的function name,可以有 object,array,number,string 如果type是 array, 就必些要有 plural */

    title;

    url;
    /** 如果物件有對應到資料庫,就可以指定 */

    parent;

    click;

    defaultValue;
    /** 可以指定attribute的default value */

    struct;

    admin;

    /** 當有些按鈕需要確認的dialog, { content:string, title:string }, 必須搭配wrap:true 使用 */
    alertDialog;

    /** 放admin的json file*/

    extraPackages;

    /** 如果src目錄下要有完全手寫的package,就夾在這裡面, 這個folder底下所有的檔案都會被persistent */


    /** 'contents', 'style', 'extra', 'firebase', 'parent', 'props', 'admin','server' 都不會被包成CodeGenNode */


    constructor(node) {
        this.node = node;
        const self = this;
        for (const key in node) {
            self[key] = node[key];
        }
    }

    /** 這些屬性不可以enrich */
    static doNotEnrichAttribute() {
        return ['disableFetch', 'permission', 'alertDialog', 'wrapContents', 'contents', 'style',
            'extra', 'firebase', 'parent', 'props', 'admin', 'server', 'params', 'host']
    }

    isDisableFetch() {
        return this.disableFetch ? this.disableFetch : false;
    }

    getExtraPackage() {
        return _.isEmpty(this.extraPackages) ? [] : this.extraPackages;
    }

    getEventParams() {
        return this.params ? this.params : [];
    }

    hasAlertDialog() {
        return this.alertDialog && _.isObject(this.alertDialog);
    }

    getFieldName() {
        return this.name + (this.plural ? this.plural : '');
    }

    getWrapView() {
        if (this.wrapView) {
            return this.wrapView;
        }
        return 'div';
    }

    getType() {
        return this.type;
    }

    getView() {
        return this.view;
    }

    getEvents() {
        return this.events ? this.events : [];
    }

    getPermission() {
        const defaultPermission = {
            update: 'isAdmin()',
            delete: 'isAdmin()',
            create: 'isAdmin()',
            read: 'isAdmin()'
        }
        const customize = this.permission ? this.permission : {};
        return {...defaultPermission, ...customize};
    }

    isState() {
        return true;
        /** 本來想區分store為 state 或是 object, 但好像還沒想齊全, 故先全部當成state
         return !!this.state && this.state;
         */
    }

    getAlertDialogVariable() {
        return Util.camel(this.getName(), this.getView(), 'alertDialog', 'ref');
    }

    getViewParamVariable() {
        return Util.camel(this.getName(), this.getView(), 'View', 'Param');
    }

    getVariableStmts() {
        const stmt = [];
        if (this.hasAlertDialog()) {
            stmt.push(`const ${this.getAlertDialogVariable()} = React.createRef()`);
            stmt.push(`let ${this.getViewParamVariable()}`);
        }
        return stmt;
    }

    hasCookies() {
        return !!this.cookies && _.size(this.cookies) > 0;
    }

    needInjectStyle() {
        return !!this.injectStyle && this.injectStyle;
    }

    hasPath() {
        return !!this.path && !_.isEmpty(this.path);
    }

    getContents() {
        if (!!this.contents && _.isArray(this.contents)) {
            return this.contents
        }
        return [];
    }

    getNavigationComponentName() {
        let name = ''
        if (this.hasNavigation()) {
            name = this.navigation.view;
        }
        return name;
    }

    getWrapContents() {
        const stmt = [];
        const wrapContents = this.wrapContents ? this.wrapContents : [];

        stmt.push(...wrapContents);

        if (this.hasAlertDialog()) {
            stmt.push(`{
            this.renderAlertDialog(
            ${this.getAlertDialogVariable()},
            ${JSON.stringify(this.alertDialog.title)},
            ${JSON.stringify(this.alertDialog.content)},
            () => this.${this.getFunctionNameOfClicked()}({view:${this.getViewParamVariable()},object:${this.getParamOfRenderView()}})
            )}`)
        }
        return stmt;
    }

    hasWrap() {
        return !!this.wrap && this.wrap
    }

    hasNavigation() {
        return !!this.navigation && !!this.navigation.view

    }

    isOuter() {
        return !!this.outer && this.outer
    }

    /** 就是指number, string 這類的物件啦 */
    isViewValue() {
        // return Util.isOrEquals(this.type, 'string', 'number');
        return this.isView() && this.isAttribute() && !this.isArrayOrObject();
    }

    /**
     支援如果物件是string 或是 number(非資料結構), 但是有children的情形,
     使用情境就是兩個平輩的attribute,要放在同一個block
     */
    hasIncestAttribute() {
        const one = !this.isArrayOrObject()
        const two = this.hasWrap();
        let three = false;
        for (const child of this.getChildren()) {
            if (child.isIncestAttributeAndView()) {
                three = true;
                break;
            }
        }
        return one && two && three;
    }

    /**
     支援如果物件是string 或是 number(非資料結構), 但是有children的情形,
     使用情境就是兩個平輩的attribute,要放在同一個block
     */
    isIncest() {
        if (!this.isView() || !this.isAttribute()) {
            throw new ERROR(8012);
        }

        return !!this.incest && this.incest
    }

    /** 應該畫面時做的component 對應到的 物件, 都是根據父類再繼續點下去 例如 parent.child
     * 但設計了incestAttribute(), 要把grandson,和child 歸為同一個generation
     *
     * precise代表的是正確的父子關係,例如incest value, 如果要找到正確的父類, 就要透過 Precise
     * */
    getPreciseParent() {
        let parent = this.getParentObject();

        if (this.isIncestAttributeAndView()) {
            return parent.getParentObject();
        }
        while (parent && !parent.isAttribute()) {
            parent = parent.getParentObject();
            if (parent === undefined) break;
        }
        return parent;
    }

    getPreciseParentName() {
        return this.getPreciseParent().getName();
    }

    /** 想要強調 incest 必須是 view,也是attribute */
    isIncestAttributeAndView() {
        return this.isAttribute() && this.isView() && this.isIncest();
    }

    getIncestAttributeTillGrandson() {
        const incest = [];
        for (const child of this.getChildren()) {
            for (const grandson of child.getChildren()) {
                if (grandson.isIncestAttributeAndView()) {
                    incest.push(grandson);
                }
            }
        }
        return incest;
    }

    getPreciseAttributeChildren() {
        const incest = this.getIncestAttributeTillGrandson();
        return [..._.filter(this.getChildren(), (child) => child.isAttribute()), ...incest];
    }

    getPreciseViewChildren() {
        const incest = this.getIncestChild();
        return [..._.filter(this.getChildren(), (child) => child.isView()), ...incest];
    }


    getIncestChild() {
        const incest = [];
        for (const child of this.getChildren()) {
            if (child.isIncestAttributeAndView()) {
                incest.push(child);
            }
        }
        return incest;
    }

    /** 表示這會在component裡面產生邏輯 */
    isView() {
        return !!this.view;
    }

    /** 表示這會在store裡面產生邏輯 */
    isAttribute() {
        return !!this.type;
    }

    getViewProps() {
        if (!!this.props)
            return this.props;
        return {};
    }

    getClickParamStmt() {
        /** 不知道為什麼當初要設計成擋住 */
        if (!this.isAttribute())
            return '';

        let object = '';
        if (this.type === 'array')
            object = this.name;
        else if (!_.isEmpty(this.getParentObject())) {
            object = this.getParentObject().name;
        }

        if (!_.isEmpty(object)) {
            return `,object:${object}`;
        }
        return '';
    }

    hasCookiePassword() {
        return !!this.password && _.size(this.password) > 0;
    }


    hasTitle() {
        return (!_.isUndefined(this.title));
    }

    pure() {
        return this.node;
    }

    hasChildren() {
        return (_.isArray(this.children) && this.children.length > 0);
    }

    getChildren() {
        return _.isArray(this.children) ? this.children : [];
    }


    hasParent() {
        return this.parent !== undefined;
    }

    isClickView() {
        return !!this.view && !!this.click;
    }

    getFunctionNameOfClicked() {
        return Util.camel(`on`, this.name, this.view, 'clicked');
    }

    getPath() {
        return this.path;
    }

    /** 得到 /username/${username}/id/${id} 這樣的字串 */
    getPathOfRouterString() {
        if (!this.hasPath()) return '';

        const params = this.getParamsOfPath();
        const path = [];
        for (const segment of this.getPath().split('/')) {
            if (_.startsWith(segment, ':'))
                path.push(`\$\{${params.shift()}\}`);
            else
                path.push(segment);
        }

        return path.join('/');
    }

    /** /id/:id/userId/:id 把這種概念的param 給拉出來 */
    getParamsOfPath(platform) {
        if (!this.hasPath()) return [];

        const params = [];
        for (const segment of this.path.split('/')) {
            if (_.startsWith(segment, ':')) {
                let param = Util.getNormalizedStringNotEndWith(Util.getNormalizedStringNotStartWith(segment, ':'), '?')
                if (_.isEqual(platform, 'web')) {
                    param += '= UserInfoRef.getUid()';
                }
                params.push(param);
            }

        }
        return params;
    }

    /** 會一直往上找parent 直到符合predicate,不然就回傳 undefined */
    getParentBy(predicate = (parent) => (true)) {
        let currentNode = parent;
        while (!!currentNode) {
            if (predicate(currentNode)) {
                return currentNode;
            }
            currentNode = currentNode.parent;
        }
        return undefined;
    }

    /** 為了組合出 uniq 的 view className,最後有加上reverse的調整 */
    getReverseOrderOfParentNames() {
        const names = [];
        let currentNode = this.parent;
        while (!!currentNode) {
            /** 如果到達 struct 層級, 就停止了 */
            if (currentNode.struct)
                break;

            if (currentNode.name)
                names.push(currentNode.name)

            currentNode = currentNode.parent;
        }
        return _.reverse(names);
    }

    isStructChildren() {
        return (this.getPreciseParent().struct);
    }

    /** 因為array 的 child 如果找parent, 會是一個array的node, 沒有有用的資訊, 所以要再往上找*/
    getParentObject() {
        if (this.parent === undefined) {
            return new CodegenNode({name: '我是祖先'});
        }

        if (_.isArray(this.parent)) {
            return this.parent.parent;
        }
        return this.parent;
    }


    isArray() {
        return (this.type === 'array');
    }

    isArrayOrObject() {
        return this.isArray() || this.isObject()
    }

    isRootPath() {
        return this.path && _.isEqual(this.path, '/')
    }

    getClassName() {
        return _.upperFirst(this.name);
    }

    hasURL() {
        return !_.isEmpty(this.url);
    }

    getURL() {
        return this.url;
    }

    isObject() {
        return (this.type === 'object');
    }

    needParentParam() {
        return !!this.needParam && this.needParam
    }

    getDefaultValueByType() {
        if (this.defaultValue) {
            return JSON.stringify(this.defaultValue);
        }

        if (this.type === 'string') {
            return `''`;
        }

        if (this.type === 'array') {
            return `[]`;
        }

        if (this.type === 'object') {
            return `new ${_.upperFirst(this.name)}()`;
        }

        if (this.type === 'number') {
            return `-1`;
        }
    }

    getFunctionNameInStoreGetter() {
        return Util.camel('get', this.getFieldName());
    }

    /** 這個目的就是在View再運用store的值可以上一層加上封裝, 不用為了UI 去更改到store的邏輯, 這樣就會很乾淨*/
    getFunctionNameUsingInComponentGetter() {
        return Util.camel('get', this.getPreciseParent().getName(), this.getFieldName());
    }

    getParamOfRenderView() {
        let param = '';

        if (this.isAttribute() || this.needParentParam()) {
            param = this.getPreciseParent().getName();
        }
        return param;
    }

    getFunctionNameOfRenderViewWithParam() {
        const functionName = this.getFunctionNameOfRenderView();
        let param = '';
        let parent = this.getPreciseParent();
        if (this.isAttribute() || this.needParentParam()) {
            param = parent.getName();
        }
        return `${functionName}(${param})`;

    }

    getFunctionNameOfRenderView() {
        return Util.camel(`render`,
            this.getPreciseParent().getName(),
            this.getFieldName(), 'view');
    }

    getFunctionNameOfSetter() {
        if (this.isArray()) {
            return Util.camel('push', this.getFieldName());
        }
        return Util.camel('set', this.getFieldName());
    }

    getStatementOfComponentKey() {
        return this.getPreciseAttributeChildren().map((child) =>
            `\$\{${child.getPreciseParent().getName()}.${child.getFunctionNameInStoreGetter()}()\}`).join('')
    }

    getName() {
        return this.name;
    }

    getPlatform() {
        /** */
        return this.platform;
    }

    getComponents() {
        if (this.components && _.isArray(this.components))
            return this.components
        else
            return [];
    }

    static enrich(node, parent) {
        let involution = new CodegenNode(node);
        if (_.isArray(node)) {
            /** 隨便改變物件的型態,未來會出現各種bug */
            involution = [];
            for (const child of node) {
                child.parent = parent;
                involution.push(this.enrich(child, involution));
            }
        } else if (_.isObject(node)) {
            for (const key in node) {
                /** 'contents', 'style', 'extra', 'firebase', 'parent', 'props' 是個例外, 要排除掉*/
                if (Util.isOrEquals(key, ...this.doNotEnrichAttribute()))
                    involution[key] = node[key];
                else if (_.isObject(node[key]) || _.isArray(node[key])) {
                    const obj = node[key];
                    obj.parent = parent;
                    involution[key] = this.enrich(obj, involution);
                }
            }
        }
        return involution;
    }

    getStruct() {
        return this.struct;
    }

    static isCodegenNode(node) {
        return node instanceof CodegenNode;
    }

}

class ClassGenerator {

    /** 為了讓import 不用擔心複數宣告 就用Object,empty 裡面放不需要變數宣告的import 例如 import from Firebase/database, 最後再一次gen*/
    imports = {all: {}, empty: []};

    hasConstructor = false;
    constructorStmt = [];
    hasExtends = false
    filePath = ``;
    classes = [];
    isSingletonFile = false;
    signature = true;
    needDefaultImports = true;


    needCreatedIndexFile = false;
    indexClassName = 'Index';
    indexFileMacros = [];
    indexFileSingleton = false;
    indexFileTailStmts = [];

    constructor(path) {
        this.filePath = path;
        this.classes = [];

        if (!fs.existsSync(this.filePath)) {
            Util.persistByPath(path)
        }
        this.context = Util.getFileContextInRaw(this.filePath).split('\n');
    }

    appendField(fieldName, defaultValue, macros = []) {
        const stmt = [];
        for (const m of macros) {
            stmt.push(`\n`);
            stmt.push(`@${m}`);
        }
        stmt.push(`\n`);
        stmt.push(`${fieldName} = ${defaultValue};`);
        stmt.push(`\n`);
        Util.insertToArray(this.context, this.getIndexOfFieldSign(), ...stmt);
    }

    appendSeparator(sep) {
        const stmt = [];
        stmt.push('\n');
        stmt.push(sep);
        Util.insertToArray(this.context, this.getIndexOfFunctionSign(), ...stmt);
    }

    /**
     *
     * @param functionName
     * @param params, string[]
     * @param macros, string[]
     * @param comments, string[]
     * @param contents, triple dot
     *
     */
    getFunctionContent(functionName, params = [], macros = [], comments = [], ...contents) {
        /** 應該要檢查file 沒有class的話, 要跳出Error提示 */
        const stmt = [];
        stmt.push(`\n`);

        for (const comment of comments) {
            stmt.push(`\n`);
            stmt.push(`/** ${comment} */`);
        }

        for (const m of macros) {
            stmt.push(`\n`);
            stmt.push(`@${m}`);
        }
        stmt.push(`\n`);
        stmt.push(`${functionName}(${_.isEmpty(params) ? '' : params.join(' ,')}) {`);
        for (let content of contents) {
            stmt.push(`\n`);
            stmt.push(`${content}`);
        }
        stmt.push(`\n`);
        stmt.push(`}`);
        return stmt;
    }

    appendFunction(functionName, params = [], macros = [], comments = [], ...contents) {
        const stmts = this.getFunctionContent(functionName, params, macros, comments, ...contents);
        Util.insertToArray(this.context, this.getIndexOfFunctionSign(), ...stmts)
    }

    appendAsyncFunction(functionName, params = [], macros = [], comments, ...contents) {
        const stmts = this.getFunctionContent(`async ${functionName}`, params, macros, comments, ...contents);
        Util.insertToArray(this.context, this.getIndexOfRestfulApiSign(), ...stmts)
    }


    appendConstructor(...stmt) {
        this.hasConstructor = true;
        this.constructorStmt.push(...stmt);
    }

    getIndexOf(stmt) {
        return _.findIndex(this.context, (per) => {
            return _.isEqual(per, stmt);
        });
    }

    /** extendz:{name,from} 如果沒有from, 就會直接 './{extendz.name}' */
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
        if (_.isObject(extendz)) {
            this.appendImport(extendz.name, extendz.from ? extendz.from : `.\/${extendz.name}`);
            stmt.push(`class ${className}${extendz ? ` extends ${extendz.name}` : ' '} {`);
        } else {
            stmt.push(`class ${className}${extendz ? ` extends ${extendz}` : ' '} {`);
        }

        stmt.push(`\n`);
        stmt.push(SIGN_OF_FIELD_START);
        stmt.push(`\n`);
        stmt.push(SIGN_OF_FUNCTION_START);
        stmt.push(`\n`);
        stmt.push(SIGN_OF_RESTFUL_API_START);
        stmt.push(`\n`);
        stmt.push(`}`);
        stmt.push(`\n`);

        this.context.push(...stmt);
        this.classes.push(className);
        this.hasExtends = !!extendz;
    }


    hasClass() {
        return (_.size(this.classes)) >= 1;
    }

    /** 產出index.js 他會繼承當前的class */
    needIndexFile(indexClassName = 'Index', indexFileMacro = [], singleton = false, extraTailStmts = []) {
        this.indexClassName = indexClassName;
        this.indexFileMacros = indexFileMacro;
        this.indexFileSingleton = singleton;
        this.indexFileTailStmts = extraTailStmts;
        this.needCreatedIndexFile = true;
    }

    getClassName() {
        if (this.classes.length > 0) {
            return this.classes[0];
        }
        return 'empty';
    }

    importDefaultModule() {
        this.appendImport('libpath', 'path');
        this.appendImport('_', 'lodash');
        this.appendImport('{ utiller as Util, exceptioner as ERROR, pooller as InfinitePool }', 'utiller');
    }

    async persist() {
        const stmts = [];
        if (_.size(this.classes) === 1) {
            if (this.isSingletonFile) {
                stmts.push(`export default new ${this.classes[0]}()`);
            } else {
                stmts.push(`export default ${this.classes[0]}`);
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
            this.appendInClassHead(`/** this code are generated, modify is no sense. \n\tauthor:David Tu, \n\temail:freshingmoon0725@gmail.com \n\tupdateTime:${Util.getCurrentTimeFormat()} \n*/`, false);

        Util.appendFile(this.filePath, _.join(this.context, ''), true, true);

        try {
            await Util.executeCommandLine(`cd ${libpath.resolve('.')} &&  npx prettier --write ${libpath.resolve(this.filePath)}`)
        } catch (error) {
            throw new ERROR(8011, error);
        }

        if (this.needCreatedIndexFile) {
            const index = new ClassGenerator(libpath.join(Util.getFileDirPath(this.filePath), 'index.js'));
            index.appendClass(this.indexClassName, {name: this.getClassName()}, ...this.indexFileMacros);
            index.setSingleton(this.indexFileSingleton);

            /** 有marco,就要配搭相對應的import */
            for (const macro of this.indexFileMacros) {
                if (Util.has(macro, 'inject')) {
                    index.appendImport(`{inject}`, `mobx-react`)
                } else if (Util.has(macro, 'observer')) {
                    index.appendImport(`{observer}`, `mobx-react`);
                }
            }

            for (const tail of this.indexFileTailStmts) {
                index.appendInClassTail(tail);
            }

            await index.persist();
        }
    }

    /** import `${parts}` from `${from}`,如果parts是{name}, 記得括號內不要有空格*/
    appendImport(parts, from) {
        if (_.isEmpty(parts)) {
            this.imports.empty.push(from);
        } else {
            this.imports.all[parts] = from;
        }

        /** 因為import 可以支援沒有變數的宣告 例如 => import from Firebase/firestore */

    }

    appendInClassHead(stmt, needSemicolon = true) {
        const stmts = [];
        stmts.push(`${stmt}${needSemicolon ? ';' : ''}`);
        stmts.push('\n');
        Util.insertToArray(this.context, 0, ...stmts);
    }


    appendInClassTail(stmt) {
        const stmts = [];
        stmts.push(stmt);
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

    insertBatchLinesIntoFunctionSection(lines) {
        Util.insertToArray(this.context, this.getIndexOfFunctionSign(), ...lines);
    }

    insertBatchLinesIntoRestfulApiSection(lines) {
        Util.insertToArray(this.context, this.getIndexOfRestfulApiSign(), ...lines);
    }

    insertBatchLinesIntoFieldSection(lines) {
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

class BaseBuilder {

    genSourcePath; // gen/web/src
    /** 例如 component builder 的 genSourcePath => /{genRootPath}/src/component */
    genRootPath; // gen/web
    /** 很多時候要放在根目錄, 所以就在建構句 把它保留起來 */
    classGenerator;

    constructor(defaultPath = './gen') {
        this.genRootPath = defaultPath;
        this.genSourcePath = defaultPath;
    }

    appendMustacheFile(templateFileName, destFileName, param = {}) {
        Util.appendFile(
            libpath.resolve(destFileName),
            this.getStringFromMustache(templateFileName, param),
            true,
            true);
    }

    setDefaultPath(path) {
        this.genSourcePath = path;
    }

    appendDefaultPath(...path) {
        this.genSourcePath = libpath.join(this.genSourcePath, ...path);
    }

    getStringFromMustache(templateFileName, variable) {
        return mustache.render(Util.getFileContextInRaw(`./template/${templateFileName}`), this.getMustacheRenderValues(variable));
    }

    getMustacheRenderValues = ({
                                   fieldName,
                                   defaultValue,
                                   fieldUrl,
                                   functionName,
                                   className,
                                   projectName,
                                   projectVersion,
                                   projectDescription,
                                   fieldClass,
                               }) => {
        return {
            fieldName: _.lowerFirst(fieldName),
            functionName: functionName ? functionName : _.upperFirst(fieldName),
            defaultValue,
            fieldUrl,
            className,
            projectName,
            projectVersion,
            projectDescription,
            fieldClass,
        }
    }

    /** 找到目錄下的folder,是這用來gen stores的 index file,有點偷懶, 應該要從source去組合出來 */
    getGenUnion(...folder) {
        let path = libpath.join(this.genRootPath, 'src', ...folder)

        return _.filter(Util.getChildPathByPath(path),
            each => each.isDirectory).map(each => each.dirName);
    }

    getGenStores() {
        return this.getGenUnion(`store`);
    }

    getGenComponent() {
        return this.getGenUnion(`component`);
    }


}

class StoreBuilder extends BaseBuilder {

    constructor(props) {
        super(props);
        this.appendDefaultPath('src', 'store');
    }

    getFunctionsDependOnFieldType({fieldName, type, defaultValue, fieldClass}) {
        const functions = this.getStringFromMustache(`store_${type}.js`, {
            fieldName,
            defaultValue,
            fieldClass
        })
        return functions;
    }

    async buildStoreIndexFiles() {
        /** 產生 store再project的index file */
        const stores = this.getGenStores();
        const baseGenerator = new ClassGenerator(Util.persistByPath(libpath.join(this.genSourcePath, `store.js`)));
        baseGenerator.appendClass(`BaseStore`);
        for (const store of stores) {
            baseGenerator.appendImport(_.upperFirst(store), `./${store}`);
        }
        baseGenerator.appendConstructor(...stores.map(child => `this.${child} = new ${_.upperFirst(child)}()`))
        baseGenerator.needIndexFile('Store')
        await baseGenerator.persist();
    }

    async buildFieldAttribute(generator, node) {
        const propsStmt = [];
        for (const child of node.getPreciseAttributeChildren()) {
            const propStmt = [];
            const fieldName = child.getFieldName();
            const defaultValue = child.getDefaultValueByType();
            generator.appendField(fieldName, defaultValue, ['observable']);
            generator.insertBatchLinesIntoFunctionSection(
                this.getFunctionsDependOnFieldType(
                    {
                        fieldName: _.upperFirst(fieldName),
                        type: child.type,
                        defaultValue,
                        fieldClass: child.getClassName(),
                    }));
            propStmt.push(`if(obj && obj.${fieldName})`);

            if (child.isArray()) {
                propStmt.push(`this.${child.getFunctionNameOfSetter()}(...obj.${fieldName})`);
                generator.appendInClassHead(`import ${_.upperFirst(child.name)} from '../${child.name}'`)
                await this.buildBaseStore(child)
            } else if (child.isObject()) {
                generator.appendInClassHead(`import ${_.upperFirst(child.name)} from '../${child.name}'`)
                propStmt.push(`this.set${_.upperFirst(fieldName)}(obj.${fieldName})`);
                await this.buildBaseStore(child)
            } else {
                propStmt.push(`this.${child.getFunctionNameOfSetter()}(obj.${fieldName})`);
            }
            propsStmt.push(...propStmt);
        }
        return propsStmt;
    }

    async buildBaseStore(node) {

        const folderName = _.lowerFirst(node.getName());
        const baseClassName = 'Base' + _.upperFirst(folderName) + 'Store';
        const indexClassName = _.upperFirst(folderName) + 'Store';
        const baseGenerator = new ClassGenerator(libpath.join(this.genSourcePath, folderName, `${baseClassName}.js`));

        baseGenerator.appendClass(baseClassName, {name: `BaseStore`, from: '../../base/BaseStore'});
        baseGenerator.appendImport('_', 'lodash');
        /** 加上 ref 是因為怕會和 UserInfoStore 打架 */
        baseGenerator.appendImport('UserInfoRef', '../../userInfo');

        baseGenerator.appendInClassHead(`import {makeAutoObservable, makeObservable, action, observable, comparer, computed, autorun, runInAction} from "mobx"`)
        baseGenerator.appendFunction(`getClassName`, [], [], [], `return '${baseClassName}'`);
        const propsStmt = [];

        if (node.hasChildren()) {
            const propStmt = await (this.buildFieldAttribute(baseGenerator, node));
            propsStmt.push(...propStmt);
        }


        /** 這邊專門處理remote fetch 的邏輯 */
        new RemoteFunctionHandler(baseGenerator).buildFetchSubmitApi(node);
        new RemoteFunctionHandler(baseGenerator).buildListenerFunction(node);

        if (node.isObject()) {
            const contents = [
                `{`,
                node.hasPath() ? `...(await this.${Util.camel(`fetch`, node.getFieldName())}()),` : `...{},`,
                ..._.map(node.getChildren(), (child) => {
                    return child.hasPath() && !child.isDisableFetch() ? `${child.getFieldName()}: await new ${child.getClassName()}().fetch(),` : '';
                }),
                `}`,
            ]
            baseGenerator.appendAsyncFunction('fetch', [], [], [],
                ...this.getDecorateFetchStrings(node.isState(), node.isObject(), ...contents)
            )
        } else if (node.isArray()) {
            if (node.hasPath()) {
                baseGenerator.appendAsyncFunction('fetch', [], [], [],
                    `return await this.${Util.camel(`fetch`, node.getFieldName())}()`);
            }
        }

        /** ================== */

        baseGenerator.appendFunction('self', [], [], [],
            'return {',
            node.getPreciseAttributeChildren()
                .map((child) => `${child.getName()} : this.${child.getName()}`).join(','),
            '}'
        )

        baseGenerator.appendFunction('clear', [], [], [],
            ...node.getPreciseAttributeChildren().map((child) => `this.${child.getFieldName()} = ${child.getDefaultValueByType()}`)
        )

        baseGenerator.appendFunction(`initial`, ['obj'], ['action'], [], `super.initial(obj)`, ...propsStmt);
        baseGenerator.appendConstructor(`makeObservable(this)`, `this.initial(props)`);
        baseGenerator.needIndexFile(`${indexClassName}`);
        await baseGenerator.persist();
    }

    getDecorateFetchStrings(isState = true, isObject = false, ...contents) {
        let normalize = contents;
        if (isObject) {
            normalize = [
                `this.fromJson(`, ...normalize, ')',
            ]
        }
        if (isState) {
            normalize = [
                `try {`,
                'this.setState(`loading`)',
                ...normalize,
                'this.setState(`stable`)',
                `} catch (error) {`,
                `this.setErrorMsg(error.message);`,
                'this.setState(`error`);',
                `}`,
            ]
        }
        normalize = [
            ...normalize,
            'return this.self()',
        ]
        return normalize
    }
}

class RemoteFunctionHandler {

    constructor(classGenerator) {
        this.generator = classGenerator;
    }

    buildListenerFunction(node, recursively = false) {
        const defaultParam = node.getParamsOfPath();
        const pathStmt = `const path = \`${node.getPathOfRouterString()}\``;

        if (node.isArrayOrObject()) {

            for (const child of node.getPreciseAttributeChildren()) {
                if (recursively && child.hasChildren()) this.buildListenerFunction(child);
            }

            if (node.isArray() && node.hasPath()) {
                this.generator.appendFunction(Util.camel(`listen`, node.getFieldName()),
                    [...defaultParam, `callback = (changes,error) => {}`, `condition = (stmt) => stmt`], [],
                    [`type:['added','modified','removed'], 回傳的就是function of unsubscribe`],
                    `${pathStmt}
                        return this.listenItems(path,callback,condition);`
                );
                this.generator.appendFunction(Util.camel(`listen`, node.getName(), 'item'),
                    [...defaultParam, 'id', `callback = (data,error) => {}`]
                    , [], [],
                    `${pathStmt}
                        return this.listenItem(path,id,callback);`
                );
            } else if (node.isObject() && node.hasPath()) {
                this.generator.appendFunction(Util.camel(`listen`, node.getFieldName()),
                    [...defaultParam, `callback = (data,error) => {}`],
                    [], [],
                    `${pathStmt}
                           const objName = '${node.getName()}'
                        return this.listenObject(path,objName,callback);`
                )
            }
        }
    }

    buildFetchSubmitApi(node, recursively = false) {
        if (node.isArrayOrObject()) {
            const contents = [];
            const children = [];
            const generator = this.generator;
            if (generator === undefined)
                throw new ERROR(8016)

            for (const child of node.getPreciseAttributeChildren()) {
                if (_.isEqual(child, 'updateTime')) continue;
                contents.push(`const _${child.getFieldName()} = object.${child.getFieldName()} ? object.${child.getFieldName()} : ${child.getDefaultValueByType()};\/\/${child.getType()}`);
                children.push(child.getFieldName());
                if (recursively && child.hasChildren()) this.buildFetchSubmitApi(child);
            }

            contents.push(`const _updateTime = this._firebase().getServerTimeSymbol()`);
            children.push(`updateTime`);
            contents.push(`const commitment = \{${children.map(child => `${child}: _${child}`).join(',')}\}`);

            if (node.hasPath()) {
                /** 有path 才代表 這是一個遠端也有的物件 */
                const functionNameOfNormalize = Util.camel('normalize', node.getName());
                const defaultParam = node.getParamsOfPath(CURRENT_PLATFORM);
                const pathStmt = `const path = \`${node.getPathOfRouterString()}\``;
                generator.appendFunction(functionNameOfNormalize, ['object'], [], [],
                    ...contents,
                    'return commitment'
                )

                if (node.isArray()) {
                    generator.appendAsyncFunction(Util.camel(`fetch`, node.getFieldName()),
                        [...defaultParam, 'condition = (stmt) => stmt'], [], [],
                        `${pathStmt}`,
                        `return await this.fetchItems(path, condition)`)

                    generator.appendAsyncFunction(Util.camel(`fetch`, node.getName(), 'Item'),
                        [...defaultParam, 'id'], [], [],
                        `${pathStmt}`,
                        `return await this.fetchItem(path, id)`)

                    /** admins only , delete collection all */
                    generator.appendAsyncFunction(Util.camel(`delete`, node.getFieldName()),
                        [...defaultParam, 'condition = (stmt) => stmt', 'all = false'], [], [],
                        `${pathStmt}`,
                        `return await this.deleteItems(path,condition,all)`)

                    generator.appendAsyncFunction(Util.camel('submit', node.getName(), 'item'),
                        [...defaultParam, 'item'], [], [],
                        `${pathStmt}`,
                        `const commitment = this.${functionNameOfNormalize}(item)`, [],
                        `return await this.submitItem(path, commitment);`,
                    )

                    generator.appendAsyncFunction(
                        Util.camel('update', node.getName(), 'item')
                        , [...defaultParam, 'id', `content`], [], [],
                        `${pathStmt}`,
                        `return await this.updateItem(path, id , content);`,
                    );

                    generator.appendAsyncFunction(
                        Util.camel('delete', node.getName(), 'item')
                        , [...defaultParam, `id`], [], [],
                        `${pathStmt}`,
                        `return await this.deleteItem(path, id)`,
                    );

                    generator.appendAsyncFunction(Util.camel('submit', node.getFieldName()),
                        [...defaultParam, '...objects'], [], [],
                        `${pathStmt}`,
                        `const commitments = objects.map((object) => this.${functionNameOfNormalize}(object))`,
                        `return await this.submitItems(path,...commitments)`
                    )

                    generator.appendAsyncFunction(Util.camel(`fetch`, `size`, `of`, node.getFieldName()),
                        [...defaultParam],
                        [], [],
                        `${pathStmt}`,
                        `return await this.fetchSizeOfCollection(path)`
                    )

                } else if (node.isObject()) {
                    contents.push(`await this.submitObject(path, commitment,'${node.getName()}')`);
                    generator.appendAsyncFunction(Util.camel('submit', node.getFieldName(), 'object'),
                        [...defaultParam, 'object'], [], [],
                        `${pathStmt}`,
                        `const commitment = this.${functionNameOfNormalize}(object)`,
                        `return await this.submitObject(path, commitment,'${node.getName()}')`,
                    );

                    generator.appendAsyncFunction(Util.camel('fetch', node.getFieldName()),
                        [...defaultParam,], [], [],
                        `${pathStmt}`,
                        `return await this.fetchObject(path,'${node.getName()}')`
                    );

                    generator.appendAsyncFunction(Util.camel('update', node.getFieldName()),
                        [...defaultParam, 'object'], [], [],
                        `${pathStmt}`,
                        `return await this.updateObject(path, object, '${node.getName()}')`
                    );

                    generator.appendAsyncFunction(Util.camel('delete', node.getFieldName()),
                        [...defaultParam], [], [],
                        `${pathStmt}`,
                        `return await this.deleteObject(path, '${node.getName()}')`
                    );
                } else {
                    throw new ERROR(8015, node.getType());
                }
            }
        }
    }
}

class ComponentBuilder extends BaseBuilder {

    hasRootRenderViewFunction = false;
    classNames = {};
    componentDidMountStmt = [];
    componentDetachStmt = [];


    constructor(props) {
        super(props);
        this.appendDefaultPath('src', 'component');
    }

    importComponentDefault(generator) {
        generator.appendImport(`Cookie`, '../../cookie');
        generator.appendImport(`Router`, '../../router');
        generator.appendImport(`{Application}`, '../../');
        generator.appendImport(`React`, 'react');
    }

    appendStmtIntoComponentDidMount(...stmt) {
        this.componentDidMountStmt.push(...stmt);
    }

    appendStmtIntoComponentDetach(...stmt) {
        this.componentDetachStmt.push(...stmt);
    }

    async buildBaseComponent(componentNode) {
        const baseClassName = `Base${_.upperFirst(componentNode.name)}Component`;
        const className = `${_.upperFirst(componentNode.name)}Component`;
        const folderName = componentNode.name;

        const baseGenerator = new ClassGenerator(libpath.join(this.genSourcePath, folderName, `${baseClassName}.js`));
        /**  baseGenerator.insertBatchLines(this.getComponentClassBody(baseClassName)); */

        baseGenerator.appendClass(baseClassName, {
            name: 'BaseComponent',
            from: '../../base/BaseComponent'
        });

        this.importComponentDefault(baseGenerator);
        baseGenerator.appendImport('{Paper,Card,Avatar,AppBar,Toolbar,Typography,Button,IconButton,Drawer}', '@material-ui/core')
        baseGenerator.appendImport('MenuIcon', `@material-ui/icons/menu`);
        baseGenerator.appendImport('Style', '../../style')


        for (const param of componentNode.getParamsOfPath()) {
            const normalizeParam = Util.getNormalizedStringNotEndWith(param, '?');
            const paramOf = Util.camel('param', 'of', normalizeParam);
            baseGenerator.appendConstructor(`this.${paramOf}= this.props.match.params.${normalizeParam}`);
            baseGenerator.appendConstructor(`Util.appendInfo(this.${paramOf})`);
        }


        if (_.isEqual(componentNode.getName(), componentNode.getParentObject().getNavigationComponentName())) {
            baseGenerator.appendFunction('isNavigationView', [], [], [],
                `return true`
            )
        }

        for (const event of componentNode.getEvents()) {

            baseGenerator.appendImport('EventBus', '../../base/CommonEventBus')
            const eventName = event.getName();
            const eventParams = event.getEventParams();

            const functionNameOfImpl = Util.camel('on', eventName, 'receive');
            const functionOfSubscribe = Util.camel('subscribe', eventName);
            const functionOfUnsubscribe = Util.camel('unsubscribe', eventName);

            baseGenerator.appendFunction(
                functionNameOfImpl, [...eventParams], [], [],
                `Util.appendError('${functionNameOfImpl} not implemented')`
            )

            baseGenerator.appendFunction(
                functionOfSubscribe, [], [], [],
                `EventBus.self().on('${eventName}', this.${functionNameOfImpl})`,
            )

            baseGenerator.appendFunction(
                functionOfUnsubscribe, [], [], [],
                `EventBus.self().detach('${eventName}', this.${functionNameOfImpl})`,
            )
            this.appendStmtIntoComponentDidMount([`this.${functionOfSubscribe}()`]);
            this.appendStmtIntoComponentDetach([`this.${functionOfUnsubscribe}()`])
        }

        this.appendRenderViewFunctions(componentNode.struct, baseGenerator);

        if (componentNode.hasTitle()) {
            baseGenerator.appendField(`stringOfPageTitle`, `"${componentNode.title}"`)
            this.appendStmtIntoComponentDidMount(`document.title = this.stringOfPageTitle`);
        }

        if (this.containedFetchAttribute(componentNode.struct)) {
            this.appendStmtIntoComponentDidMount(
                `this.getStore().fetch().then()`
            )
        }

        baseGenerator.appendFunction('getStore', [], [], [],
            `return this.props.${componentNode.struct.getName()}`)

        baseGenerator.appendFunction('componentDidMount',
            [], [], [], `super.componentDidMount()`, ...this.componentDidMountStmt);

        baseGenerator.appendFunction('componentWillUnmount',
            [], [], [], `super.componentWillUnmount()`, ...this.componentDetachStmt);

        /** index.js */
        if (_.isEqual(componentNode.getName(), componentNode.getParentObject().getNavigationComponentName())) {
            baseGenerator.appendFunction('isNavigator', [], [], [], 'return true');
        }


        baseGenerator.needIndexFile(className, [`inject('${componentNode.name}')`, `observer`])
        await baseGenerator.persist();

        return {classNames: _.values(this.classNames), events: componentNode.getEvents()};
    }

    containedFetchAttribute(node) {
        if (node && node instanceof CodegenNode && node.hasPath()) {
            return true;
        }

        for (const child of node.getChildren()) {
            const result = this.containedFetchAttribute(child)
            if (result === true) {
                return true;
            }
        }
        return false;
    }

    /**
     * {
     *      tag:'tag',
     *      props:{...name:object},
     *      contents:['cotent1','content2']
     *      children: ['ccc'],
     * }
     *
     * ////////////// sample: ///////////////
     praam :{
            tag: node.view,
            props: { style: {height: 80},className:'className' }, ### means 不需要 single quatation
            contents: [`Util.appendInfo()`,`Util.appendError()`],
            children:['children1','children2']
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

    getJSXStrings(param) {
        function normalize(value) {
            if (_.isString(value) && _.startsWith(value, `###`)) {
                return `{${Util.getStringOfDropHeadSign(value, `#`)}}`;
            }

            if (_.isBoolean(value)) {
                return `{${_.toString(value)}}`;
            }
            return `{${JSON.stringify(value)}}`;
        }

        const props = param.props;
        const contents = param.contents ? param.contents : [];
        const children = param.children ? param.children : [];

        const stmt = [];
        const tag = param.tag;
        stmt.push(`<${tag}`);
        stmt.push('\n');

        for (const child of children) {
            stmt.push(`{...${child}}`);
            stmt.push('\n');
        }

        for (const key in props) {
            if (!!!props[key]) continue

            if (_.isEqual(key, 'forEachObject'))
                stmt.push(`{${props[key]}}`)
            else
                stmt.push(`${key}=${normalize(props[key])}\n`);

            /** this is super hard-code */
            if (_.isEqual(key, 'className')) {
                this.storesClassName(props[key]);
            }
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

    /** 把所有className儲存起來,後續要產生出less才有根據 */
    storesClassName(name) {
        this.classNames[name] = name;
    }


    getJSXStringsByNode(generator, node, ...extraContents) {
        const keyValue = node.getStatementOfComponentKey();
        const className = _.upperFirst(Util.camel(...node.getReverseOrderOfParentNames(), node.getName(), node.isOuter() ? 'outer' : '', node.getView()));

        const props = {
            className,
            ...node.getViewProps(),
        };

        if (node.needInjectStyle()) {
            const param = node.getPreciseParentName();
            const injectFunctionName = `getInjectStyleOf${_.upperFirst(node.name)}${_.upperFirst(node.view)}`;
            props.style = `###{...this.${injectFunctionName}(${param}),...Style.${className}}`;
            generator.appendFunction(injectFunctionName, [param]);

        } else {
            props.style = `###Style.${className}`;
        }

        if (node.isArray() && !_.isEmpty(keyValue)) {
            props.key = '###' + '`' + keyValue + '`';
        }

        if (node.isClickView()) {

            generator.appendFunction(node.getFunctionNameOfClicked(),
                ['param'], [], [],
                `Util.appendError('${node.getFunctionNameOfClicked()} not override')`
            )

            if (node.hasAlertDialog()) {
                props.onClick =
                    `###(param) => {
                    ${node.getViewParamVariable()} = param;
                    ${node.getAlertDialogVariable()}.current.open();
                   }`
            } else {
                props.onClick =
                    `###(param) => this.${node.getFunctionNameOfClicked()}({view:param${node.getClickParamStmt()}})`
            }
        }


        const content = [];
        if (node.isViewValue()) {
            const functionName = node.getFunctionNameUsingInComponentGetter();
            generator.appendFunction(functionName, [`${node.getPreciseParentName()}`], [], [],
                `return ${node.getPreciseParentName()}.${node.getFunctionNameInStoreGetter()}()`);
            content.push(`{this.${functionName}(${node.getPreciseParentName()})}`);
        }

        let origin = this.getJSXStrings({
            tag: node.view,
            props,
            contents: [...content, ...node.getContents(), ...extraContents],
        });

        const wrapView = node.getWrapView();
        if (node.hasWrap()) {
            const clazzName = `${className}Wrap${_.upperFirst(wrapView)}`;
            const props = {className: `${clazzName}`, style: `###Style.${clazzName}`}
            if (node.isArray() && !_.isEmpty(keyValue))
                props.key = '###' + '`' + keyValue + 'Wrap' + '`';

            for (const incest of node.getIncestChild()) {
                origin.push(`{/* ${incest.getName()}, incest attribute */}`);
                origin.push(`{this.${incest.getFunctionNameOfRenderView()}(${incest.getPreciseParent().getName()})}`);
            }

            origin = this.getJSXStrings({
                tag: wrapView,
                props,
                contents: [...origin, ...this.getOuterChildJSXStrings(generator, node), ...node.getWrapContents()],
            })
        }

        /** type是array就必須的包上一成ListWrap,可以調整物件方向 */
        if (node.isArray()) {
            const clazzName = `${className}ListWrap${_.upperFirst(wrapView)}`;
            const props = {className: clazzName, style: `###Style.${clazzName}`}
            return this.getJSXStrings({
                tag: wrapView,
                props,
                contents: [`{${node.getPreciseParent().getName()}.${node.getFunctionNameInStoreGetter()}().map( (${node.getName()}) => { return (`, ...origin, `)})}`]
            })
        } else {
            return origin;
        }

    }

    /** 就是把標註為 outer 的 child 放在同一個view的層級 */
    getOuterChildJSXStrings(generator, node) {
        const stmt = [];
        for (const child of node.getChildren()) {
            if (child.isOuter())
                stmt.push(...this.getJSXStringsByStruct(child, generator, false))
        }
        return stmt;
    }

    /**
     * 要想像成針對這個節點 產生出 renderView, 如果子節點是物件或是array, 就產生出{getObjectOrArrayView(self.childName)}
     * 否則 直些產生出 jsx statement.
     */
    getJSXStringsByStruct(node, generator, notAllowOuterChild = true) {
        const childstmt = [];
        for (const child of node.getChildren()) {
            if (!child.isView()) continue;
            if (notAllowOuterChild && child.isOuter()) continue;

            if (child.isArrayOrObject()) {
                childstmt.push(`\n{this.${child.getFunctionNameOfRenderViewWithParam()}}\n`);
                generator.appendFunction(child.getFunctionNameUsingInComponentGetter(),
                    [`${child.getPreciseParentName()}`], [], [],
                    `return ${child.getPreciseParentName()}.${child.getFunctionNameInStoreGetter()}()`);
            } else {
                if (!child.isIncestAttributeAndView()) {
                    childstmt.push(`\n{this.${child.getFunctionNameOfRenderViewWithParam()}}\n`)
                }
            }
        }
        return this.getJSXStringsByNode(generator, node, ...childstmt);
    }

    /** stmt:Array<String> */
    removeJSXSign(stmt) {
        _.remove(stmt, (each) => _.isEqual(each, SIGN_OF_JSX_CONTENT));
    }

    appendRenderViewFunctions(node, builder) {
        if (!node.isView()) return;

        function normalize(...strings) {
            const self = strings;
            _.remove(self, (each) => _.isEqual(each, SIGN_OF_JSX_CONTENT));
            return `return ( ${self.join('')})`;
        }

        if (!this.hasRootRenderViewFunction) {
            builder.appendFunction('renderView', [], [], [],
                `const ${node.getName()} = this.getStore();\n\n`,
                normalize(...this.getJSXStringsByStruct(node, builder)));
            this.hasRootRenderViewFunction = true;
        }

        const existedFunctions = {};
        for (const child of node.getChildren()) {
            if (!child.isView()) continue;
            const functionName = child.getFunctionNameOfRenderView();
            /** 讓重複定義的view只出現一次, 像是space這樣的狀況*/
            if (existedFunctions[functionName]) continue;
            builder.appendFunction(functionName, [`${child.getParamOfRenderView()}`], [], [],
                'const classes = this.props.classes',
                'const self = this',
                ...this.getChildVariableStmts(node),
                normalize(...this.getJSXStringsByStruct(child, builder)));
            if (child.hasChildren()) {
                this.appendRenderViewFunctions(child, builder);
            }
            existedFunctions[functionName] = true;
        }
    }

    getChildVariableStmts(node) {
        const stmt = [];
        for (const child of node.getChildren()) {
            stmt.push(...child.getVariableStmts())

            /** 子類的type是object, 而且孫類需要需要帶入子類當參param */
            if (child.isView() && child.isObject()) {
                stmt.push(`const ${child.getFieldName()} = 
                this.${child.getFunctionNameUsingInComponentGetter()}(${node.getFieldName()})`)
            }
        }

        return stmt;
    }

    getComponentClassBody(className) {
        return mustache.render(Util.getFileContextInRaw('./template/component.js'), this.getMustacheRenderValues({className}))
    }
}

class AppBuilder extends ComponentBuilder {

    constructor(props) {
        super(props);
        /** 印為繼承component */
        this.appendDefaultPath('../');
    }

    async buildExtraPackages(currentPlatform, sourceObj) {
        for (const _package of sourceObj.getExtraPackage()) {
            const packageName = _package.getName();
            const platform = _package.getPlatform();
            console.log(platform, currentPlatform)
            if (!_.isEqual(platform, currentPlatform))
                continue;

            const indexGenerator = new ClassGenerator(libpath.join(this.genSourcePath, packageName, 'index.js'));
            indexGenerator.appendClass(_.upperFirst(packageName));
            await indexGenerator.persist();
        }
    }

    async buildEventFolder(events) {

        const normalize = Util.arrayToObjWith(events, (event) => event.getName())
        const baseEventGenerator = new ClassGenerator(libpath.join(this.genSourcePath, `event`, `BaseComponentEvent.js`));
        baseEventGenerator.appendImport('EventBus', '../base/CommonEventBus');
        baseEventGenerator.appendClass('BaseComponentEvent', {name: 'BaseEvent', from: `../base/BaseEvent`});
        for (const event in normalize) {
            const events = normalize[event];
            /** 用這個方式找到params數最多的 */
            const standard = _.last(_.sortBy(events, (event) => event.getEventParams().length));
            baseEventGenerator.appendFunction(Util.camel('emit', event),
                [...standard.getEventParams()], [], [`event for ==> ${events.map((event) => event.getParentObject().getName()).join(' ,')}`],
                `EventBus.emit('${standard.getName()}',${standard.getEventParams().join(' ,')})`);
        }
        baseEventGenerator.needIndexFile('Event', [], true)
        await baseEventGenerator.persist();

    }

    async buildCookieFiles(sourceObj) {

        if (sourceObj.hasCookies()) {
            const baseCookieGenerator = new ClassGenerator(libpath.join(this.genSourcePath, `cookie`, `BaseCookie.js`));
            baseCookieGenerator.appendClass('BaseCookie', {name: 'Cookie', from: `../base/BaseCookie`});
            baseCookieGenerator.appendImport(`Cookies`, `universal-cookie`);
            baseCookieGenerator.appendImport(`Config`, `../config`);
            baseCookieGenerator.appendField(`cookie`, `new Cookies()`);
            baseCookieGenerator.appendField('password', 'Config.password');
            for (const cookie of sourceObj.cookies) {
                baseCookieGenerator.appendField(cookie.name, JSON.stringify({
                        key: cookie.name,
                        defaultValue: cookie.defaultValue
                    })
                )
                baseCookieGenerator.appendFunction(Util.camel(`set`, cookie.name), [`${cookie.name}`, `options`], [], [],
                    `if(${cookie.name} === undefined) { this.${Util.camel(`remove`, cookie.name)}(); return }`,
                    cookie.isObject() ? `${cookie.name} = JSON.stringify(${cookie.name})` : ``,
                    `this.cookie.set(`,
                    `this.getEternalEncryptStringOfCookieName(this.${cookie.name}.key, this.password),`,
                    `Util.getEncryptString(${cookie.name}, this.password), {path: "/", ...options})`
                )

                baseCookieGenerator.appendFunction(Util.camel(`get`, cookie.name), ['options = {}'], [], [],
                    `const value = this.cookie.get(`,
                    `this.getEternalEncryptStringOfCookieName(this.${cookie.name}.key, this.password), options)`,
                    `if(_.isEmpty(value)) return undefined`,
                    `const decrypt = Util.getDecryptString(value, this.password)`,
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
            const indexCookieGenerator = new ClassGenerator(libpath.join(this.genSourcePath, `cookie`, `index.js`));
            indexCookieGenerator.appendClass('Cookie', {name: `BaseCookie`, from: './BaseCookie'});
            indexCookieGenerator.setSingleton(true);

            await indexCookieGenerator.persist();
            await baseCookieGenerator.persist();
        }
    }

    async buildWebpackNPackageJson(sourceObj) {
        this.appendMustacheFile('web.package.json', libpath.join(this.genRootPath,
            `package.json`
        ), {
            projectName: sourceObj.name,
            projectVersion: sourceObj.version,
            projectDescription: sourceObj.description
        });
        this.appendMustacheFile('webpack.config.js', libpath.join(this.genRootPath,
            `webpack.config.js`
        ));
        this.appendMustacheFile('babel.config.js', libpath.join(this.genRootPath,
            `babel.config.js`
        ));
    }

    async buildHtmlIndexAssetsFile() {
        const path = Util.persistByPath(libpath.join(this.genRootPath, 'dist'));
        this.appendMustacheFile('index.html', libpath.join(path, 'index.html'));
    }

    async buildRouterFile(sourceObj) {
        const baseRouterGenerator = new ClassGenerator(libpath.join(this.genSourcePath,
            `router`
            ,
            `BaseRouter.js`
        ));
        baseRouterGenerator.appendClass(
            `BaseRouter`
        );
        for (const component of sourceObj.components) {
            if (!component.hasPath()) continue;
            baseRouterGenerator.appendFunction(Util.camel('goto', component.name, 'page'),
                ['component', ...component.getParamsOfPath()],
                [],
                [],
                'const { history } = component.props',
                `history.push(\`${component.getPathOfRouterString()}\`)`)
        }

        baseRouterGenerator.needIndexFile('Router', [], true);
        await baseRouterGenerator.persist();
    }

    async buildAppIndexFiles(sourceObj) {
        const appGenerator = new ClassGenerator(libpath.join(this.genSourcePath, `app.js`));
        appGenerator.appendImport(`{Provider}`, `mobx-react`);
        appGenerator.appendImport(` ReactDOM`, `react-dom`);
        appGenerator.appendImport(`{Route, Router, Switch}`, `react-router-dom`);
        appGenerator.appendImport(`{RouterStore, syncHistoryWithStore}`, `mobx-react-router`);
        appGenerator.appendImport(`{createBrowserHistory}`, `history`);
        appGenerator.appendImport(`React`, `react`);
        appGenerator.appendImport(`Store`, `./store`);
        appGenerator.appendImport(``, `./less`);
        appGenerator.appendClass(`BaseApp`);
        appGenerator.appendFunction(`mount`, [], [], [],
            `ReactDOM.render(this.getRenderView(),
                    document.getElementById('app'))`);
        appGenerator.appendField(`store`, `new Store()`);
        appGenerator.appendField(`history`, `syncHistoryWithStore(createBrowserHistory(), new RouterStore())`);
        appGenerator.appendField(`extraPages`, '[]');
        appGenerator.appendFunction(`pushPage`, [`page`], [], [], `this.extraPages.push(page)`)
        appGenerator.appendFunction(`getExtraPages`, [], [], [],
            `/** --- push <Router /> in to pages */`, `return this.extraPages`);
        for (const component of this.getGenComponent()) {
            appGenerator.appendInClassHead(`import ${_.upperFirst(component)} from './component/${component}'`);
        }

        const childrenStmt = [];
        for (const component of sourceObj.components) {
            if (!component.hasPath()) continue;

            const renderStmts = this.getJSXStrings({
                    tag: _.upperFirst(component.name),
                    props: {...component.extra},
                    children: ['props'],
                }
            );
            this.removeJSXSign(renderStmts);

            childrenStmt.push(...this.getJSXStrings({
                tag: `Route`,
                props: {
                    exact: component.isRootPath() ? true : undefined,
                    path: component.path,
                    render: `###(props) =>
                     ${renderStmts.join('')}`,
                    /** component: `###${_.upperFirst(component.name)}`, */
                },
            }))
        }
        const switchStmt = this.getJSXStrings({
            tag: 'Switch',
            contents: [...childrenStmt, `{this.getExtraPages()}`]
        });

        const routerStmt = this.getJSXStrings({
            tag: 'Router',
            props: {history: `###this.history`},
            contents: [...switchStmt]
        })

        const providerStmt = this.getJSXStrings({
            tag: 'Provider',
            props: {
                forEachObject: '...this.getStoreObject()'
            },
            contents: [sourceObj.hasNavigation() ? '{this.getNavigationView(this.history)}' : '', ...routerStmt]
        })

        const whole = providerStmt;
        this.removeJSXSign(whole);
        if (sourceObj.hasNavigation())
            appGenerator.appendFunction('getNavigationView', ['history'], [], [], `return (${this.getNavigationStmt(sourceObj.navigation).join('')})`)

        appGenerator.appendFunction('getStoreObject', [], [], [],
            'const stores = {}',
            ...this.getGenStores().map(store => {
                return `stores['${store}'] = this.store.${store}`
            }),
            'return stores'
        )

        for (const storeName of this.getGenStores()) {
            appGenerator.appendFunction(Util.camel('get', storeName, 'store'), [], [], [],
                `return this.store.${storeName}`
            )
        }

        appGenerator.appendFunction(`getRenderView`, [], [], [], `return (${whole.join('')})`)
        await appGenerator.needIndexFile('App', [], false, [`new App().mount()`, `module.hot.accept()`]);


        await appGenerator.persist();
    }

    getNavigationStmt(navigation) {
        const stmt = [];
        if (navigation && navigation.view) {
            stmt.push(...this.getJSXStrings({
                /** 因為import 是大寫, 所以這裡只好hack*/
                tag: _.upperFirst(navigation.view),
                props: {history: `###history`}
            }));
            this.removeJSXSign(stmt);
        }
        return stmt;
    }

    async buildStyleFiles(classNameInfos, sourcePath) {
        const types = [`app`, `common`, `mobile`];
        for (const type of types) {
            let origins = {};
            const sourceFilePath = libpath.join(sourcePath, `style`, `${type}.style.js`)
            if (fs.existsSync(sourceFilePath)) {
                const obj = require(libpath.resolve(sourceFilePath)).default;
                origins = obj;
            }

            const generator = new ClassGenerator(libpath.join(this.genSourcePath, 'style', `${type}.style.js`))
            generator.appendClass(`${_.upperFirst(type)}Style`);
            for (const info of classNameInfos) {
                for (const className of info.classNames) {
                    if (!!origins[className]) {
                        generator.appendField(className, JSON.stringify(origins[className]));
                        delete origins[className];
                    } else {
                        generator.appendField(className, `{}`);
                    }
                }
                generator.insertBatchLinesIntoFieldSection(`\n\n/** following for ${info.component.name} */\n\n`)
                generator.setSingleton(true);
            }
            if (!_.isEmpty(origins)) {
                for (const name in origins) {
                    generator.appendField(name, JSON.stringify(origins[name]));
                }
                generator.insertBatchLinesIntoFieldSection(`\n\n/** following for unknown */\n\n`)
            }
            await generator.persist();
        }
    }

    /** {[...{component,names}], srcPath}
     * srcPath 就是 keep file 的根目錄
     * */
    async buildLessFile(classNameInfos, srcPath) {
        /** 先把舊的整理過, 除掉 comment的字樣line */
        const types = [`app`, `common`, `mobile`];
        for (const type of types) {
            const srcLessPath = libpath.join(srcPath, `less`, `${type}.less`)
            const lessAttriutesFromSrc = [];
            if (fs.existsSync(srcLessPath)) {
                const stub = Util.getFileContextInRaw(srcLessPath).split('\n');
                _.remove(stub,
                    (each) => (_.startsWith(each, '/** ') ||
                        _.isEqual(each.trim(), '')))
                lessAttriutesFromSrc.push(...(stub.join('').split('}')))
                /** 移除掉最後一個,因為split */
                lessAttriutesFromSrc.pop();
            }

            const generator = new ClassGenerator(libpath.join(this.genSourcePath, 'less', `${type}.less`));
            for (const info of classNameInfos) {
                generator.appendInClassTail(`/** => following for ${info.component.name} component used <= */\n\n`);
                for (const className of info.classNames) {
                    /** 注意!! 是用 remove,會mutate 原本的 array */
                    const srcAttribute = _.remove(lessAttriutesFromSrc,
                        (each) => {
                            return _.startsWith(each, `.${className} {`) || _.startsWith(each, `.${className}:`)
                        })

                    if (srcAttribute.length > 1)
                        throw new ERROR(7003, `origin ==> ${Util.deepFlat(srcAttribute)}`)

                    generator.appendInClassTail(_.isEmpty(srcAttribute) ? `.${className} { /** style */ }\n\n` : `${srcAttribute[0]}}\n\n`);
                }
            }

            if (lessAttriutesFromSrc.length > 0) {
                generator.appendInClassTail(`/** ======== following for  ========= */\n\n`);
                for (const lasting of lessAttriutesFromSrc) {
                    generator.appendInClassTail(`${lasting} }\n\n`);
                }
            }

            generator.needSignature(false);
            generator.disableDefaultImports();
            await generator.persist();

            if (!fs.existsSync(libpath.join(srcPath, 'less', 'index.js'))) {
                this.appendMustacheFile('less.index.js',
                    Util.persistByPath(libpath.join(this.genSourcePath, 'less', 'index.js'))
                );
                Util.appendInfo(`persist ./less/index.js succeed`);
            }
        }
    }
}

class ProjectFileHandler {

    genRootPath; // gen/web
    genSourcePath; // gen/web/src

    projectRootPath; // exam/
    projectPlatformSourcePath; // exam/web/src
    projectCommonSourcePath; // exam/common/src
    nodeOfAncestor; //source.js

    platform; // web, admin, app

    constructor(props, platform = 'web') {
        this.projectRootPath = props.projectRootPath;
        this.projectPlatformSourcePath = libpath.join(this.projectRootPath, platform, 'src');
        this.genRootPath = libpath.join(props.genRootPath, platform);
        this.genSourcePath = libpath.join(this.genRootPath, 'src');
        this.projectCommonSourcePath = libpath.join(props.projectRootPath, 'common', 'src');
        this.nodeOfAncestor = CodegenNode.enrich(require(libpath.resolve(libpath.join(this.projectRootPath, `source.js`))).default);
        this.platform = platform;
        /** 這就是 source.js 的進入點 */

    }

    buildDistAssetFolder() {
        const imageSrcFolder = libpath.join(this.projectPlatformSourcePath, 'images');
        if (fs.existsSync(imageSrcFolder)) {
            Util.copyFromFolderToDestFolder(imageSrcFolder,
                Util.persistByPath(libpath.join(this.genRootPath, 'dist', 'images')));
        }
    }

    persistImageFolder() {
        const images = libpath.join(this.genSourcePath, 'images');
        if (fs.existsSync(images)) {
            Util.copyFromFolderToDestFolder(images,
                Util.persistByPath(libpath.join(this.projectPlatformSourcePath, 'images'))
            );
        }
    }

    async buildConfig(sourceObj) {
        const baseConfigGenerator = new ClassGenerator(libpath.join(this.genSourcePath, `config`, `BaseConfig.js`));
        baseConfigGenerator.appendClass(`BaseConfig`);
        switch (this.platform) {
            case 'admin':
                baseConfigGenerator.appendField(`admin`, JSON.stringify(sourceObj.admin));
                baseConfigGenerator.appendField(`server`, JSON.stringify(sourceObj.server));
                baseConfigGenerator.appendField(`host`, JSON.stringify(sourceObj.host));

                break;
            case 'web':
                baseConfigGenerator.appendField(`host`, JSON.stringify(sourceObj.host));
                baseConfigGenerator.appendField(`firebase`, JSON.stringify(sourceObj.firebase));
                if (sourceObj.hasCookiePassword())
                    baseConfigGenerator.appendField(`password`, JSON.stringify(sourceObj.password));
                break;
        }
        await baseConfigGenerator.needIndexFile('Config', [], true);
        await baseConfigGenerator.persist();
    }

    buildBaseClasses() {
        const from = libpath.join(this.projectPlatformSourcePath, 'base');
        const to = libpath.join(this.genSourcePath, 'base');

        if (!fs.existsSync(from)) {
            Util.appendInfo(`from:${from} is not existed, /src/base ignore this run`);
            return;
        }

        Util.persistByPath(to);
        Util.copyFromFolderToDestFolder(from, to);
    }

    persistBaseFiles() {
        try {

            if (!fs.existsSync(this.genSourcePath)) {
                Util.appendInfo(`${this.genSourcePath} is note created, ignore`);
                return
            }

            for (const file of Util.findFilePathBy(libpath.join(this.genSourcePath, 'base'))) {
                if (Util.isEmptyFile(file.absolute)) {
                    Util.appendInfo(`${file.absolute} is empty file, do not copy`)
                    continue;
                }

                if (_.startsWith(_.toLower(file.fileName), 'common')) {
                    /** back-up to common*/
                    const projectCommonSourceBasePath = libpath.join(this.projectCommonSourcePath, 'base');
                    Util.persistByPath(projectCommonSourceBasePath);

                    const existSourceFile = libpath.join(projectCommonSourceBasePath, file.fileNameExtension);
                    if (fs.existsSync(existSourceFile) &&
                        Util.getFileLastModifiedTime(existSourceFile) > file.lastModifiedTime) {
                        Util.appendInfo(`${existSourceFile} is the latest, ignore this run`);
                        continue;
                    }

                    Util.copySingleFile(file.absolute,
                        libpath.join(projectCommonSourceBasePath, file.fileNameExtension), undefined, true)

                } else {
                    /** back-up to platform src*/
                    const projectPlatformSourceBasePath = libpath.join(this.projectPlatformSourcePath, 'base');
                    Util.persistByPath(projectPlatformSourceBasePath);
                    Util.copySingleFile(file.absolute,
                        libpath.join(projectPlatformSourceBasePath, file.fileNameExtension), undefined, true)
                }
            }
            Util.appendInfo(`persist base files succeed`);
            return false;
        } catch (error) {
            /** 偷懶 hack */
            Util.appendError(error);
        }
    }

    persistExtraPackages(sourceObj) {
        for (const _package of sourceObj.getExtraPackage()) {
            const packageName = _package.getName();
            const folderPath = libpath.join(this.genSourcePath, packageName);
            if (fs.existsSync(folderPath)) {
                const destFolderPath = libpath.join(this.projectPlatformSourcePath, packageName);
                Util.persistByPath(destFolderPath);
                Util.copyFromFolderToDestFolder(folderPath, destFolderPath);
                Util.appendInfo(`extraPackage ,persist to ${destFolderPath} succeed`);
            }
        }
    }

    persistIndexAndLessFiles(...exclude) {
        const files = Util.findFilePathBy(this.genSourcePath,
            (each) => {
                return (
                    _.isEqual(each.fileNameExtension, `index.js`) ||
                    _.isEqual(each.extension, `less`) ||
                    _.isEqual(each.fileNameExtension, `app.style.js`) ||
                    _.isEqual(each.fileNameExtension, `mobile.style.js`) ||
                    _.isEqual(each.fileNameExtension, `common.style.js`)
                )
            },
            'node_modules');


        for (const file of files) {
            if (_.isEqual('', Util.getFileContextInRaw(file.path).trim())) {
                Util.appendInfo(`path ${file.path} is empty file, file would not persist`);
                return
            }
            if (Util.has(exclude, file.fileNameExtension)) continue;
            const from = file.absolute;
            const dest = libpath.join(this.projectPlatformSourcePath, from.split(`src`).pop());
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
    overrideEachFilesFromSrcFolder(...excludes) {
        /** 順序會影響檔案覆蓋的順序 */
        const fromSourcePath = [this.projectPlatformSourcePath, this.projectCommonSourcePath];

        for (const _path of fromSourcePath) {
            for (const file of Util.findFilePathBy(_path)) {

                let ignoreThisRun = false;
                for (let exclude of excludes) {
                    if (_.isString(exclude)) {
                        exclude = {type: 'fileNameExtension', keyword: exclude}
                    }

                    if (_.isEqual(file[exclude.type], exclude.keyword)) {
                        ignoreThisRun = true;
                        break;
                    }

                }
                if (ignoreThisRun) continue;
                const from = file.absolute;
                const dest = libpath.join(this.genSourcePath, from.split(`src`).pop());

                if (fs.existsSync(Util.getFileDirPath(dest)))
                    Util.copySingleFile(from, dest, '', true);
                else {
                    Util.appendError(`overrideIndexFiles fail ,dest,${dest};;; || from,${from}`);
                }
            }
        }
    }

    overrideExtraPackages(sourceObj) {
        for (const _package of sourceObj.getExtraPackage()) {
            const packageName = _package.getName();
            const folderPath = libpath.join(this.projectPlatformSourcePath, packageName);
            if (fs.existsSync(folderPath)) {
                const destFolderPath = libpath.join(this.genSourcePath, packageName);
                Util.persistByPath(destFolderPath);
                Util.copyFromFolderToDestFolder(folderPath, destFolderPath);
                Util.appendInfo(`extraPackage ,override to ${destFolderPath} succeed`);
            }
        }
    }

    fetchCollection(node, stmts = []) {
        const path = node.getPath();
        if (!_.isEmpty(path)) {

            const _stmts = [];
            const normalize = path.split('\/')
                .map((word) => word.startsWith(':') ? `{${Util.getNormalizedStringNotStartWith(word, ':')}}` : word).join('\/');
            const permission = node.getPermission();
            for (const each in permission) {
                _stmts.push(`allow ${each}: if ${permission[each]};`)
            }

            const wildcard = `{${node.getName()}}`;
            if (node.isObject()) {
                stmts.push(`match ${libpath.join('/', normalize, 'attrs', wildcard)} {`, ..._stmts, '}');
            } else if (node.isArray()) {
                stmts.push(`match ${libpath.join('/', normalize, wildcard)} {`, ..._stmts, '}');
            } else {
                throw new ERROR(9999, `cant happened this condition`);
            }
        }

        if (node.hasChildren()) {
            for (const child of node.getChildren())
                this.fetchCollection(child, stmts);
        }
    }

    async generateFireStoreRules() {
        const path = Util.persistByPath(libpath.join(this.genRootPath, 'firestore.rules'))
        const base = Util.getFileContextInRaw('./template/template.firestore.rules').split('\n');
        const stmts = [];
        for (const component of this.nodeOfAncestor.getComponents()) {
            this.fetchCollection(component.getStruct(), stmts);
        }
        Util.insertToArray(base, Util.getIndexOfContext(base, SIGN_OF_COLLECTION_START), ...stmts);
        Util.appendFile(path, base.join('\n'), true, true);
    }

    async forAdmin() {
        Util.persistByPath(this.genRootPath);
        Util.copySingleFile('./template/admin.package.json', this.genRootPath, 'package.json', true);
        Util.copySingleFile('./template/babel.config.js', this.genRootPath, 'babel.config.js', true);

        const apiGenerator = new ClassGenerator(libpath.join(this.genSourcePath, `api`, `BaseAdminRemoteApi.js`));
        apiGenerator.appendClass('BaseAdminRemoteApi', {name: 'CommonRemoteApi', from: '../base/CommonRemoteApi'});
        apiGenerator.needIndexFile('AdminRemoteApi');

        const listenerGenerator = new ClassGenerator(libpath.join(this.genSourcePath, `listener`, `BaseAdminListenerApi.js`));
        listenerGenerator.appendClass('BaseAdminListenerApi', {
            name: 'CommonRemoteApi',
            from: '../base/CommonRemoteApi'
        });
        listenerGenerator.needIndexFile('AdminListenerApi');

        for (const component of this.nodeOfAncestor.getComponents()) {
            new RemoteFunctionHandler(apiGenerator).buildFetchSubmitApi(component.getStruct(), true)
            new RemoteFunctionHandler(listenerGenerator).buildListenerFunction(component.getStruct(), true)
        }

        await listenerGenerator.persist();
        await apiGenerator.persist();
        await this.generateFireStoreRules();
    }

    async forWeb() {
        const source = this.nodeOfAncestor;
        const totalClassNames = [];
        const totalEvents = [];

        for (let component of source.components) {
            await new StoreBuilder(this.genRootPath).buildBaseStore(component.struct);
            const {classNames, events} = await new ComponentBuilder(this.genRootPath).buildBaseComponent(component);
            totalClassNames.push({component, classNames});
            totalEvents.push(...events);
        }

        /** 因為 用到 method getGenStores(),stores 要等 gen出來才知道, 必須放在這邊 */
        await new StoreBuilder(this.genRootPath).buildStoreIndexFiles();
        await new AppBuilder(this.genRootPath).buildWebpackNPackageJson(source);
        await new AppBuilder(this.genRootPath).buildRouterFile(source);
        await new AppBuilder(this.genRootPath).buildCookieFiles(source);
        await new AppBuilder(this.genRootPath).buildEventFolder(totalEvents);
        await new AppBuilder(this.genRootPath).buildLessFile(totalClassNames, this.projectPlatformSourcePath);
        await new AppBuilder(this.genRootPath).buildStyleFiles(totalClassNames, this.projectPlatformSourcePath);
        await new AppBuilder(this.genRootPath).buildHtmlIndexAssetsFile();
        await new AppBuilder(this.genRootPath).buildAppIndexFiles(source);
        this.buildDistAssetFolder();
    }

    async execute() {
        if (SURE_TO_PERSIST_VERY_IMPORTANT) {
            this.persistIndexAndLessFiles();
            this.persistBaseFiles();
            this.persistExtraPackages(this.nodeOfAncestor)
            this.persistImageFolder();
        }

        await Util.cleanChildFiles(this.genRootPath, (each) => true, 'node_modules');
        switch (this.platform) {
            case 'web':
                await this.forWeb();
                break;
            case 'admin':
                await this.forAdmin();
                break;
            default:
                throw new ERROR(8014, `type ==> ${this.platform}`)
                break;
        }

        await new AppBuilder(this.genRootPath).buildExtraPackages(this.platform, this.nodeOfAncestor);
        this.buildBaseClasses();
        await this.buildConfig(this.nodeOfAncestor);
        this.overrideExtraPackages(this.nodeOfAncestor)
        this.overrideEachFilesFromSrcFolder(
            `common.style.js`
            ,
            `app.style.js`
            ,
            `mobile.style.js`
            ,
            `common.less`
            ,
            `app.less`
            ,
            `mobile.less`
            ,
            {
                type: 'extension',
                keyword: 'svg'
            },
            {
                type: 'extension',
                keyword: 'png'
            }
        );
        await this.runInstallIfNeed();
    }

    async runInstallIfNeed() {
        if (!fs.existsSync(libpath.join(this.genRootPath,
            `node_modules`
        )))
            await Util.executeCommandLine(
                `cd ${this.genRootPath} && npm install`
            );
    }
}

export {
    ClassGenerator as ClassGenerator
}

(async () => {
    const genRootPath = libpath.resolve(
        `./../gen`
    );

    const projectRootPath = libpath.resolve(
        `./src/exam`
    );

    switch (CURRENT_PLATFORM) {
        case 'web':
            const web = new ProjectFileHandler({genRootPath, projectRootPath}, 'web');
            await web.execute();
            Util.appendInfo(
                `web done`
            );
            break;
        case 'admin':
            const admin = new ProjectFileHandler({genRootPath, projectRootPath}, 'admin');
            await admin.execute();
            Util.appendInfo(
                `admin done`
            );
            break;
    }

})();
