import {exceptioner as ERROR, utiller as Util} from 'utiller';
import _ from 'lodash';
import fs from 'fs';
import libpath from 'path';
import mustache from 'mustache';
import {configer} from "configer";

/** author:明悅
 *  create time:Wed Mar 17 2021 13:17:01 GMT+0800 (Taipei Standard Time)
 */

const SIGN_OF_FUNCTION_START = `\/** -------------------- functions -------------------- **\/`;
const SIGN_OF_FIELD_START = `\/** -------------------- fields -------------------- **\/`;
const SIGN_OF_RESTFUL_API_START = `\/** -------------------- async api -------------------- **\/`;
const SIGN_OF_COLLECTION_START = `/** --- documents--- **/`;
const SIGN_OF_JSX_CONTENT = `<!-- jsx content -->`;
const SignOfInValidNode = 'SignOfInValidNode';

class CodegenNode {

    node;
    password;
    components;

    storageSuperUserUid = "uid";
    /** storage因為沒有辦法進去firestore去拿isAdmin, 必須hardcode uid*/

    restful = false;
    /** 就是這個物件會多出 有 status, message, 讓server處理可以加上狀態, 以便在client顯示出提示
     * 會在store裡多這兩個屬性
     * {
     *     status:succeed || fail
     *     message: fail reason
     * }
     * */

    paginate;
    /** {threshold:10, size:6} ,array專用 可以指定page size, 觸及底部的threshold(就是距離底部多少就要觸發下一頁,預設是1) */

    preConditions = [];
    /** startAfter(),where,這邊指的就是firestore裡的 Query operators*/
    afterConditions = [];

    textOfWatermark;
    /** 用來當作浮水印的字樣 */

    needWatermark;
    /** 表示上傳時需要浮水印功能,目前只能用在img上 */

    directory;
    /** 用來提示deploy 的 folder path*/

    ref;
    /** 用來標記這個node的內容, 免得重複的再type一遍 */

    independence;
    /** 用來標記這個node的如果是ref, 而且還是獨立的一個store */

    mother;
    /** 註記陣列的位址, 用來獲得 indexOfCollection*/

    indexOfCollection;
    /** enrich的時候, 因為遞迴是由最小單位, 被enrich的 parent 的address還沒被產生出來, 所以先記parent的index,然後把parent指為[]  */


    isScrollingHide;
    /** 註記AppBar 要隨著scroll hide */

    readOnly = false;
    /** 用來標示這個遠端的欄位在client端只能讀取, TextField也會readOnly */

    storageFolder = 'public';
    /** 用來標記圖片上傳到storage哪個資料夾 */

    path;
    /** 用來當作Router的導頁網址, 如果用在struct裡面就是當作remote api的url */
    /** path:`/purchaseSucceed/:transactionId?/:orderId?` ?代表這個值可有可無 */

    column;
    /** 表示這個欄位是一個對應到遠端的欄位, 其他欄位也許是為了UI而增加的 */

    permission = {};
    /** 當struct 裡面的物件有 path時, 就對應有一個collection/document,
     * 用來描述 create,update,delete,read, 沒有描述就是isAdmin()
     *
     * isSelf(uid)
     * isSignIn()
     * alwaysFalse()
     * alwaysTrue()
     * isAdmin()
     *
     * 支援邏輯符號
     *
     * isAdmin() || isSelf(uid)
     *
     * */

    editIgnore;
    /** 用來提示這個node不要被editlize給處理到 */

    editor;
    /** 用來提示這個component需要產生編輯頁面 */

    originalView;
    /** 當被改成editMode之後 還是要有可以找到原始的view, 因為我會把type是string||number 強制把view改成TextField */

    originalName;
    /** 當被改成editMode之後 還是要有可以找到名字 */

    viewModified;
    /**  在editMode下, 如果被改過View, 這邊就會是true */

    nameModified;
    /** 在editMode下, 如果被改過View, 這邊就會是true */

    editPage = false;
    /** 用來註記是一個editPage */

    params;
    /** 目前用來做events 帶的參數 */

    description;
    /** 解釋這個node欄位的意義, 也能當作TextField的解釋 */

    host;
    /** 網域名稱啦 */

    initFetchOnlyLogin;
    /** 有些store的field不需要在new的時候就fetch, 就設定為true*/

    events;
    /** 用來定義可以發送的event, 製造interface */

    platform;

    cookies;
    /** {name,type:object|string }對應到web使用的cookie, 好處是cookie會加密 */

    wrap;
    /** 在view外面包一層div,作為彈性的使用 */
    /** 當view的種類不是container(paper,card,div之類的), 但是getPreciseViewChild()還有child時, 就自動放到 wrap 裡面*/

    outer;
    /** 搭配wrap服用的屬性, 可以放在wrap那一個圖層的效果 */

    props = {};
    /** 用在加上view額外的props,<div ...props/> */

    wrapProps = {};
    /** 當wrap是true時,用在加上wrap額外的props,<div ...props/> */

    listProps = {};
    /** 用在加上Array的Container額外的props,<div ...props/> */

    listWrapProps = {};
    /** 用在加上Array Container額外再包一層的props,<div ...props/> */

    injectStyle;
    /** 如果有style的屬性需要透過邏輯判斷,就設為true,這樣會產出method */

    injectProps;
    /** 如果有props的屬性需要透過邏輯判斷,就設為true,這樣會產出method */

    navigation;
    /** 可以指定component為navigatorView 放置於頂部的view,以及設定是否isScrollingHide */

    incest = {view: false, attribute: false};
    /** 支援父類是string 或是 number(非資料結構), 但是仍然有children的情形,
     在view和store上面也會產生出same generation的概念, incest只支援一層, 假父類必須有wrap
     */

    contents = [];
    /** 放在<div>content</div>*/

    listContents = [];
    /** list item 之外可以再放一些stmt */

    listWrapContents = [];
    /** list wrap 之外可以再放一些stmt */

    wrapContents = [];
    /** 當view有被wrap包住時,可以用wrapContent加上 ['{this.getTailView()}']*/

    needParam;
    /** view有時候會需要param作為顯示的判斷*/

    name;

    view;

    type;
    /** array,arrayItem,object,number,string*/

    style = {};

    wrapStyle = {};

    listStyle = {};

    listWrapStyle = {};

    listView;
    /**  可以指定Array的ContainerView,有時候需要改變direction,需要靠這個container*/

    listWrapView;
    /**  可以指定Array ContainerView 再包一層*/

    wrapView;
    /**  可以指定wrap的type default是div*/
    extra;
    /**  extra => 用於component mount 後,其所帶入的值 */

    children = [];

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

    customizes = [];

    /** 如果src目錄下要有完全手寫的package,就夾在這裡面, 這個folder底下所有的檔案都會被persistent */

    constructor(node) {
        this.node = node;
        const self = this;
        for (const key in node) {
            self[key] = node[key];
        }
    }

    getDirectoryName() {
        return this.directory;
    }

    isRestfulBean() {
        return this.restful;
    }

    getStyle() {
        return this.style;
    }

    appendStyle(style) {
        this.style = {...this.style, ...style}
    }

    isArrayItem() {
        return _.isEqual(this.type, 'arrayItem');
    }

    getRootNode() {
        const node = this.getParentBy((node) => node.isRootNode());
        return node;
    }

    getStorageSuperUserUid() {
        return this.storageSuperUserUid;
    }

    getPreConditions() {
        return this.preConditions;
    }

    getAfterConditions() {
        return this.afterConditions;
    }

    getStructNode() {
        const node = this.getParentBy((node) => node.isStructNode());
        return node;
    }

    isStructNode() {
        return !!this.struct;
    }

    isRootNode() {
        return !!this.components;
    }

    getStorageFolderName() {
        return this.storageFolder;
    }

    hasStorageFolder() {
        return !!this.storageFolder;
    }

    getFunctionNameOfNextPage() {
        return Util.camel('fetch', 'next', 'page', this.getFieldName());
    }

    isCollectionPath() {
        if (this.hasPath()) {
            const segments = _.split(Util.getNormalizedStringNotStartWith(this.getPath(), '/'), '/');
            return Util.isOdd(segments.length);
        }
        return undefined;
    }

    setStyle(style) {
        this.style = style;
    }

    getWrapStyle() {
        return this.wrapStyle;
    }

    getPaginateSize() {
        return this.paginate.size;
    }

    getPaginateThreshold() {
        return this.paginate.threshold;
    }

    hasPaginate() {
        return !!this.paginate && _.isObject(this.paginate);
    }

    appendWrapStyle(style) {
        this.wrapStyle = {...this.wrapStyle, ...style}
    }

    setWrapStyle(style) {
        this.wrapStyle = style;
    }

    getListStyle() {
        return this.listStyle;
    }

    setListStyle(style) {
        this.listStyle = style;
    }

    appendListStyle(style) {
        this.listStyle = {...this.listStyle, ...style}
    }

    getListWrapStyle() {
        return this.listWrapStyle;
    }

    setListWrapStyle(style) {
        this.listWrapStyle = style;
    }

    appendListWrapStyle(style) {
        this.listWrapStyle = {...this.listWrapStyle, ...style}
    }

    getFunctionNameOfItemEditorWithParam() {
        return `self.${this.getFunctionNameOfItemEditor()}(${this.getName()})`;
    }

    getFunctionNameOfCollectionEditorWithParam() {
        return `self.${this.getFunctionNameOfCollectionEditor()}(
        ${this.isObject() ? this.getName() : this.getPreciseAttributeParent().getName()}
        )`;
    }

    hasValidViewParent() {
        return this.isValidNode(this.getPreciseViewParent());
    }

    hasValidAttributeParent() {
        return this.isValidNode(this.getPreciseAttributeParent());
    }

    /** 像是編輯一個item, 這種屬許item等級的作業, item自己做的事情 */
    getFunctionNameOfItemEditor() {
        return Util.camel('on', this.getName(), 'Item', 'Editor', 'Clicked', 'AsyncTask');
    }

    /** 像是新增一個item, 這種屬許array等級的作業, 一個Array只會有一個新增 */
    getFunctionNameOfCollectionEditor() {
        return Util.camel('on', this.getName(), 'Editor', 'Clicked', 'AsyncTask');
    }

    isContainer() {
        return this.view && Util.isOrEquals(_.toLower(this.view), 'grid', 'div', 'card', 'paper'
            , 'drawer', 'toolbar', 'appbar', 'iconbutton', 'list', 'listitem');
    }

    isScrollingHideDependOnRootNode() {
        const rootNode = this.getRootNode()
        return rootNode.navigation && rootNode.navigation.isScrollingHide;
    }

    isReadOnly() {
        return this.readOnly
    }

    setIsEditPage(edit) {
        this.editPage = edit;
    }

    getUniqueIdStmt() {
        if (this.hasPath()) {
            return `###${this.getName()}.getId()`;
        } else {
            if (this.isArray())
                return `###\`${this.getClassNameOfLessUsage()}\$\{_.indexOf(${this.getFieldName()},${this.getName()})}\``;
            else
                return `${Util.getRandomHash('20')}`
        }
    }

    isEditPage() {
        return !!this.editPage;
    }

    isColumnAttribute() {
        return this.hasPath() || (this.isAttribute() && !!this.column);
    }

    isViewModified() {
        return !!this.viewModified;
    }

    isNameModified() {
        return !!this.nameModified;
    }

    getFunctionNameOfFetch() {
        return Util.camel(`fetch`, this.getFieldName())
    }

    getFunctionNameOfFetchItem() {
        return Util.camel(`fetch`, this.getName(), 'item')
    }

    getFunctionNameOfUpdateItem() {
        return Util.camel('update', this.getName(), 'item');
    }

    getFunctionNameOfDeleteItem() {
        return Util.camel('delete', this.getName(), 'item')
    }

    getFunctionNameOfSubmitItem() {
        return Util.camel('submit', this.getName(), 'item');
    }

    getFunctionNameOfSubmit() {
        return Util.camel('submit', this.getName());
    }

    getFunctionNameOfBatchUpdate() {
        return Util.camel('update', this.getFieldName());
    }

    setViewModified(modified) {
        this.viewModified = modified;
    }

    setNameModified(modified) {
        this.nameModified = modified;
    }

    setOriginalName(name) {
        this.originalName = name;
    }

    setOriginalView(view) {
        this.originalView = view;
    }

    getOriginalView() {
        return this.originalView;
    }

    getOriginalName() {
        return this.originalName;
    }

    getDescription() {
        return this.description ? this.description : 'no comments';
    }

    /** 這些屬性不可以enrich */
    static doNotEnrichAttribute() {
        return ['paginate', 'afterConditions', 'preConditions', 'watermark', 'listStyle', 'wrapStyle', 'editIgnore', 'initFetchOnlyLogin', 'permission', 'alertDialog',
            'wrapContents', 'listContents', 'listWrapContents', 'contents', 'style', 'extra', 'firebase', 'mother', 'parent',
            'listProps', 'listWrapProps', 'wrapProps', 'props', 'admin', 'server', 'params', 'host']
    }

    setListContents(contents) {
        this.listContents = contents;
    }

    appendListContents(...contents) {
        this.listContents.push(...contents);
    }

    hasPermission() {
        return !!this.permission && !_.isEmpty(this.permission);
    }

    getListContents() {
        return this.listContents ? this.listContents : [];
    }

    setListWrapContents(contents) {
        this.listWrapContents = contents;
    }

    appendListWrapContents(...contents) {
        this.listWrapContents.push(...contents);
    }

    getListWrapContents() {
        return this.listWrapContents ? this.listWrapContents : [];
    }

    setWrapContents(contents) {
        this.wrapContents = contents;
    }

    appendWrapContents(...contents) {
        this.wrapContents.push(...contents);
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

    needEditPage() {
        return this.editor && !!this.editor;
    }

    isFetchOnlyLogin() {
        return this.initFetchOnlyLogin ? this.initFetchOnlyLogin : false;
    }

    getCustomizePackages() {
        return _.isEmpty(this.customizes) ? [] : this.customizes;
    }

    getEventParams() {
        return this.params ? this.params : [];
    }

    hasAlertDialog() {
        return this.alertDialog && _.isObject(this.alertDialog);
    }

    setContents(contents = []) {
        this.contents = [];
    }

    setIsWrap(wrap) {
        this.wrap = wrap
    }

    clearContents() {
        this.contents = [];
    }

    /** array => Questions, object => Question*/
    getFieldName() {
        return this.name + (this.plural ? this.plural : '');
    }

    getWrapView() {
        if (this.wrapView) {
            return this.wrapView;
        }
        return 'div';
    }

    setWrapView(view) {
        this.wrapView = view;
    }

    getListView() {
        if (this.listView) {
            return this.listView;
        }
        return 'div';
    }

    getListWrapView() {
        if (this.listWrapView) {
            return this.listWrapView;
        }
        return 'div';
    }

    setListView(view) {
        this.listView = view;
    }

    getType() {
        return this.type;
    }

    setView(view) {
        this.view = view;
    }

    getView() {
        return this.view;
    }

    getEvents() {
        return this.events ? this.events : [];
    }

    setEvents(events) {
        this.events = events;
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

    getStoragePermission() {
        const customize = this.permission ? this.permission : {};
        const result =  {...this.getDefaultStoragePermission(), ...customize};
        return result
    }

    getDefaultStoragePermission() {
        return {
            write: 'isAdmin()',
            read: 'alwaysTrue()',
        };
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

    isAppBarView() {
        return _.isEqual(this.getView(), 'AppBar');
    }

    getSelfVariableStmts() {
        const stmt = [];
        if (this.hasAlertDialog()) {
            stmt.push(`const ${this.getAlertDialogVariable()} = React.createRef()`);
            stmt.push(`let ${this.getViewParamVariable()}`);
        }

        if (this.isAppBarView() && this.isScrollingHideDependOnRootNode()) {
            stmt.push(`const ScrollingHideWrap = self.HideOnScroll`);
        }

        if (this.isArray()) {
            stmt.push(`const ${this.getFunctionNameOfRenderItemView()} = self.${this.getFunctionNameOfRenderItemView()}`);
        } else {
            const exist = {}
            for (const child of this.getPreciseViewChildren()) {
                const view = child.getFunctionNameOfRenderView();
                if (!!!exist[view])
                    stmt.push(`const ${view} = self.${view}`)
                exist[view] = true;
            }
        }

        const parent = this.getPreciseAttributeParent();
        /** 把自己先轉變成參數,準備帶進去view 或是 ui裡面 像是navigator裡面 */
        if (!this.isArrayItem() && this.isAttribute() && this.hasValidAttributeParent()) {
            /** 因為是最小單位,所以父類帶進去得值必須是單數(不加上plural) */
            stmt.push(`const ${this.getFieldName()} = 
            this.${this.getFunctionNameUsingInComponentGetter()}(${parent.getName()})`)
        }

        return stmt;
    }

    hasCookies() {
        return !!this.cookies && _.size(this.cookies) > 0;
    }

    needInjectStyle() {
        return !!this.injectStyle && this.injectStyle;
    }

    needInjectProps() {
        return !!this.injectProps && this.injectProps;
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

    isNumber() {
        return _.isEqual(this.type, 'number');
    }

    isString() {
        return _.isEqual(this.type, 'string');
    }

    appendChildren(...child) {
        this.children.push(...child);
    }

    getNavigationComponentName() {
        let name = ''
        if (this.hasNavigation()) {
            name = this.navigation.view;
        }
        return name;
    }

    hasWrap() {
        return !!this.wrapView && !_.isEmpty(this.wrapView);
    }

    hasListWrap() {
        return !!this.listWrapView && !_.isEmpty(this.listWrapView);
    }

    hasNavigation() {
        return !!this.navigation && !!this.navigation.view

    }

    isOuter() {
        return !!this.outer && this.outer
    }

    isImageView() {
        return this.isAttribute() && _.isEqual(this.view, 'img');
    }

    isTextField() {
        return this.isAttribute() && _.isEqual(this.view, 'TextField');
    }

    /** 就是指number, string 這類的物件啦 */
    isStringOrNumberAttribute() {
        return this.isView() && this.isAttribute() && !this.isCollection();
    }


    /** 應該畫面時做的component 對應到的 物件, 都是根據父類再繼續點下去 例如 parent.child
     * 但設計了incestAttribute(), 要把grandson,和child 歸為同一個generation
     *
     * precise代表的是正確的父子關係,例如incest value, 如果要找到正確的父類, 就要透過 Precise
     * */

    getPreciseViewParent() {
        return this.getPreciseParent((node) => node.isIncestView(), (node) => node.isView());
    }

    getPreciseAttributeParent() {
        return this.getPreciseParent((node) => node.isIncestAttribute(), (node) => node.isAttribute());
    }

    getPreciseParent(isIncest, isNode) {
        let parent = this.getParentObject();

        if (isIncest(this)) {
            parent = parent.getParentObject();
        }
        while (parent && !isNode(parent)) {
            parent = parent.getParentObject();
            if (parent === undefined || parent.name === SignOfInValidNode) break;
        }
        return parent;
    }


    isIncestAttribute() {
        return this.incest && this.incest.attribute;
    }

    /** parent 是 array 的意思 */
    isChildOfArray() {
        if (!this.hasValidParent()) return false;
        const parent = this.getPreciseAttributeParent();
        return _.isEqual(parent.getType(), 'array');
    }

    hasValidParent() {
        const parent = this.getPreciseAttributeParent();
        return this.isValidNode(parent);
    }

    isValidNode(node) {
        return !!node && !_.isEqual(node.name, SignOfInValidNode);
    }

    isIncestView() {
        return this.incest && this.incest.view;
    }

    hasViewChildren() {
        const children = this.getPreciseViewChildren();
        return children.length > 0;
    }

    hasAttributeChildren() {
        const children = this.getPreciseAttributeChildren();
        return children.length > 0;
    }

    getPreciseAttributeChildren() {
        return this.getPreciseChildren((node) => node.isAttribute(), (node) => node.isIncestAttribute())
    }

    getPreciseColumnChildren() {
        return this.getPreciseChildren((node) => node.isColumnAttribute(), (node) => node.isIncestAttribute())

    }

    getPreciseViewChildren() {
        return this.getPreciseChildren((node) => node.isView(), (node) => node.isIncestView())
    }

    getPreciseChildren(isNode, isIncest) {
        const children = [];
        for (const child of this.getChildren()) {
            if (!isIncest(child) && isNode(child))
                children.push(child);

            for (const grandson of child.getChildren()) {
                if (isIncest(grandson) && isNode(grandson)) {
                    children.push(grandson)
                }
            }
        }
        return children;
    }

    getPreciseAttributeParentName() {
        return this.getPreciseAttributeParent().getName();
    }

    /** 表示這會在component裡面產生邏輯 */
    isView() {
        return !!this.view;
    }

    /** 表示這會在store裡面產生邏輯 */
    isAttribute() {
        return !!this.type;
    }

    getWrapProps() {
        if (!!this.wrapProps)
            return this.wrapProps;
        return {};
    }

    getListProps() {
        if (!!this.listProps)
            return this.listProps;
        return {};
    }

    setListProps(props = {}) {
        this.listProps = props;
    }

    appendListProps(...props) {
        for (const prop of props) {
            this.listProps[Util.getObjectKey(prop)] = Util.getObjectValue(prop);
        }
    }

    getListWrapProps() {
        if (!!this.listWrapProps)
            return this.listWrapProps;
        return {};
    }

    setListWrapProps(props = {}) {
        this.listWrapProps = props;
    }

    appendListWrapProps(...props) {
        for (const prop of props) {
            this.listWrapProps[Util.getObjectKey(prop)] = Util.getObjectValue(prop);
        }
    }

    setViewProps(props = {}) {
        this.props = props;
    }

    getViewProps() {
        if (!!this.props)
            return this.props;
        return {};
    }

    appendViewProps(...props) {
        for (const prop of props) {
            this.props[Util.getObjectKey(prop)] = Util.getObjectValue(prop);
        }
    }

    getClickParamStmt() {
        let object = '';
        if (Util.isOrEquals(this.type, 'arrayItem', 'array'))
            object = this.getName();
        else if (this.isAttribute() || this.needParentParam()) {
            object = this.getPreciseAttributeParent().getName();
        }

        if (!_.isEmpty(object)) {
            return `,object:${object}`;
        }
        return '';
    }

    hasCookiePassword() {
        return !!this.password && _.size(this.password) > 0;
    }

    getStoreFolderName() {
        return Util.camel(_.reverse(this.getPreciseAttributeGenealogyNodes()).map((node) => node.getName()));
    }

    getStoreClassName() {
        return _.upperFirst(this.getStoreFolderName());
    }

    hasTitle() {
        return (!_.isUndefined(this.title));
    }

    setTitle(title) {
        this.title = title;
    }

    getTitle() {
        return this.title ? this.title : '';
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

    setChildren(children) {
        this.children = children;
    }

    hasParent() {
        return this.parent !== undefined;
    }

    getFunctionNameRemoveItems() {
        return `remove${_.upperFirst(this.getFieldName())}`;
    }

    /** original 就是找到hack之前的組合 */
    organizeClassNameWithParent(type = 'default', original = false) {
        const nodes = _.reverse(this.getPreciseViewGenealogyNodes());
        const parentNames = original ? nodes.map((node) => node.isNameModified() ? node.getOriginalName() : node.getName()) : nodes.map((node) => node.getName())

        let viewName = !original ? this.getView() : this.isViewModified() ? this.getOriginalView() : this.getView()
        let prefix = type;

        switch (type) {
            case "default":
                prefix = '';
                viewName = !original ? this.getView() : this.isViewModified() ? this.getOriginalView() : this.getView();
                break;
            case 'wrap':
                viewName = this.getWrapView();
                break;
            case 'list':
                viewName = this.getListView();
                break;
            case 'listWrap':
                viewName = this.getListWrapView();
                break;
            default:
                throw new ERROR(8017, `type can't be ==> ${type}`)
        }
        return Util.upperCamel(prefix, ...parentNames, this.isOuter() ? 'outer' : '', viewName);
    }

    /** 放在css用來做key => ExamEditorQuestionCard */
    getClassNameOfLessUsage(type = 'default') {
        return this.organizeClassNameWithParent(type, false)
    }

    /** 當edit mode的時候, 為了要讓editMode下的元件屬性在less可以繼承 mainMode */
    getOriginalClassNameOfLessUsage(type = 'default') {
        if (this.isViewModified() && _.isEmpty(this.getOriginalView())) {
            /** 表示本來這個元件不是View, 不會有OriginalClassName */
            return {exists: false, value: undefined};
        }
        return {
            exists: true, value: this.organizeClassNameWithParent(type, true)
        };
    }

    isClickView() {
        return !!this.view && !!this.click;
    }

    setClick(click) {
        this.click = click
    }

    getFunctionNameOfClicked() {
        return Util.camel(`on`, this.name, this.view, 'clicked');
    }

    getPath() {
        return this.path;
    }

    setPath(path) {
        this.path = path;
    }

    isEditPageDependOnParent() {
        const struct = this.getStructNode();
        return struct.isEditPage();
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
    getParentBy(predicate = (node) => (true)) {
        let currentNode = this;
        while (this.isValidNode(currentNode)) {
            if (predicate(currentNode)) break;
            currentNode = currentNode.getParentObject();
        }
        return currentNode;
    }

    getFunctionNameOfInjectStyle() {


        return `getInjectStyleOf${_.upperFirst(this.getPreciseAttributeParent().getName())}${_.upperFirst(this.getName())}${_.upperFirst(this.getView())}`
    }

    getFunctionNameOfInjectProps() {
        return `getInjectPropsOf${_.upperFirst(this.getPreciseAttributeParent().getName())}${_.upperFirst(this.getName())}${_.upperFirst(this.getView())}`
    }

    /** 找出祖譜 */
    getGenealogyNodes(validate, getParent, excludeSelf = false) {
        const nodes = [];
        let current = this;

        if (excludeSelf) {
            current = getParent(current);
        }

        while (!!current) {
            if (!this.isValidNode(current) || current.isStructNode())
                break;

            if (validate(current)) {
                nodes.push(current);
            }

            current = getParent(current);
        }
        return nodes;
    }

    getPreciseViewGenealogyNodes(excludeSelf = false) {
        return this.getGenealogyNodes((node) => node.isView(), (node) => node.getPreciseViewParent(), excludeSelf)
    }

    getPreciseAttributeGenealogyNodes(excludeSelf = false) {
        return this.getGenealogyNodes((node) => node.isAttribute(), (node) => node.getPreciseAttributeParent(), excludeSelf)
    }

    /** 因為array 的 child 如果找parent, 會是一個array的node, 沒有有用的資訊, 所以要再往上找*/
    getParentObject() {
        if (this.parent === undefined) {
            return new CodegenNode({name: SignOfInValidNode});
        }

        if (_.isArray(this.parent)) {
            if (this.indexOfCollection > -1) {
                return this.parent[this.indexOfCollection];
            }
            return this.parent.parent;
        }
        return this.parent;
    }


    isArray() {
        return _.isEqual(this.type, 'array');
    }

    isCollection() {
        return this.isArray() || this.isObject() || this.isArrayItem()
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
        return _.isEqual(this.type, 'object');
    }

    needParentParam() {
        return !!this.needParam && this.needParam
    }

    getDefaultValueByType(isAdmin) {
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
            return isAdmin ? `{}` : `new ${_.upperFirst(this.name)}()`;
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
        return Util.camel('get', this.getPreciseAttributeParent().getName(), this.getFieldName());
    }

    getParamOfRenderView() {
        let param = '';
        if (this.isAttribute() && this.isArrayItem()) {
            param = this.getName();
        } else if (this.isAttribute() || this.needParentParam()) {
            param = this.getPreciseAttributeParent().getName();
        }
        return param;
    }

    getFunctionNameOfRenderView() {
        let functionName = '';
        if (this.isArray()) {
            functionName = Util.camel(this.getPreciseAttributeParent().getName(),
                this.getFieldName(), 'view');
        } else {
            functionName = Util.camel(this.getPreciseAttributeParent().getName(),
                this.getName(), 'view');
        }
        return _.upperFirst(functionName);
    }

    getFunctionNameOfRenderItemView() {
        let functionName = Util.camel(this.getPreciseAttributeParent().getName(),
            this.getName(), 'view');
        return _.upperFirst(functionName);
    }

    getFunctionNameOfSetter() {
        return Util.camel('set', this.getFieldName());
    }

    getFunctionNameOfModifiedSetter() {
        return Util.camel('set', `modified`, this.getName());
    }

    getStatementOfComponentKey() {
        return this.getPreciseAttributeChildren().map((child) =>
            `\$\{${child.getPreciseAttributeParent().getName()}.${child.getFunctionNameInStoreGetter()}()\}`).join('')
    }

    getName() {
        return this.name;
    }

    setName(name) {
        this.name = name;
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

    static find(node, predicate) {
        const nodes = [];
        if (predicate(node)) {
            nodes.push(node)
        }
        for (const child of node.getChildren()) {
            if (node.isImitate)
                continue;

            nodes.push(...CodegenNode.find(child, predicate))
        }
        return nodes;
    }

    static finds(structs, predicate) {
        const nodes = [];
        for (const struct of structs) {
            nodes.push(...CodegenNode.find(struct, predicate))
        }
        return nodes;
    }

    static enrich(node, parent) {
        let involution = new CodegenNode(node);
        if (_.isArray(node)) {
            /** 隨便改變物件的型態,未來會出現各種bug */
            involution = [];
            involution.parent = parent;
            for (const child of node) {
                child.parent = parent;
                child.mother = node;
                involution.push(this.enrich(child, involution));
            }
        } else if (_.isObject(node)) {
            for (const key in node) {
                if (Util.isOrEquals(key, ...this.doNotEnrichAttribute()))
                    involution[key] = node[key];
                else if (_.isObject(node[key]) || _.isArray(node[key])) {
                    const obj = node[key];
                    if (_.isArray(parent)) {
                        const index = _.indexOf(node.mother, node);
                        obj.indexOfCollection = index;
                    }
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

    appendChildrenWithJson(obj) {
        const child = CodegenNode.enrich(obj);
        child.parent = this;
        this.appendChildren(child);
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

    appendField(fieldName, defaultValue, macros = [], comments = []) {
        const stmt = [];

        for (const comment of comments) {
            stmt.push(`\n`);
            stmt.push(`/** ${comment} */`);
        }

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
     * @param function {name:'doSomeThing',async:false}
     * @param params, string[]
     * @param macros, string[]
     * @param comments, string[]
     * @param contents, triple dot
     *
     */
    getFunctionContent(func, params = [], macros = [], comments = [], ...contents) {
        /** 應該要檢查file 沒有class的話, 要跳出Error提示 */
        const functionName = func.name;
        const arrow = func.arrow;
        const async = func.async;
        const decorator = func.decorator;
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

        _.remove(params, param => Util.isEmptyString(param));

        if (!!arrow || decorator) {
            /** arrow function 不支援 super QQ 08/03 的筆記有紀錄 */
            stmt.push(`${functionName} = ${async ? 'async' : ''}${decorator ? `${decorator} (` : ``}(${_.isEmpty(params) ? '' : params.join(' ,')}) => {`);
        } else
            stmt.push(`${async ? 'async ' : ' '}${functionName}(${_.isEmpty(params) ? '' : params.join(' ,')}) {`);

        for (let content of contents) {
            stmt.push(`\n`);
            stmt.push(`${content}`);
        }

        stmt.push(`\n`);
        stmt.push(`}`);

        if (decorator) {
            stmt.push(`)`);
        }
        return stmt;
    }

    /**
     func = {
        name: functionName
        arrow: 箭頭函數, 可以省去this的領域問題
        decorator: 有沒有需要修飾 像是observer(({store}) => ...functionStmt)
        async: 註記是否需要非同步
      }
     */
    appendFunction(func, params = [], macros = [], comments = [], ...contents) {
        const stmts = this.getFunctionContent(
            _.isString(func) ? {name: func} : func
            , params, macros, comments, ...contents);
        Util.insertToArray(this.context, this.getIndexOfFunctionSign(), ...stmts)
    }

    appendAsyncFunction(functionName, params = [], macros = [], comments, ...contents) {
        this.appendFunction({
            name: functionName,
            async: true
        }, params, macros, comments, ...contents)
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

    getMainClassName() {
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
            index.appendClass(this.indexClassName, {name: this.getMainClassName()}, ...this.indexFileMacros);
            index.setSingleton(this.indexFileSingleton);
            index.needSignature(false);
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
    platform; // web, admin, app
    genComponentRootPath; // gen/app/src/component
    genStoreRootPath; // gen/app/src/store

    constructor(props) {
        if (!Util.isOrEquals(props.platform, 'web', 'admin')) {
            throw new ERROR(8018, `platform ==> ''${props.platform}''`)
        }
        const platform = props.platform;
        this.platform = platform;
        this.freeMarkerRootPath = props.freeMarkerRootPath;
        this.freeMarkerSourcePath = libpath.join(this.freeMarkerRootPath, 'src');
        this.freeMarkerSourcePlatformPath = libpath.join(this.freeMarkerSourcePath, platform);
        this.freeMarkerSourceCommonPath = libpath.join(this.freeMarkerSourcePath, `common`);

        this.projectRootPath = props.projectRootPath;
        this.projectPlatformPath = libpath.join(this.projectRootPath, platform); // exam/web/src

        this.projectPlatformSourcePath = libpath.join(this.projectRootPath, platform, 'src');
        this.genRootPath = libpath.join(props.genRootPath, platform);
        this.genSourcePath = libpath.join(this.genRootPath, 'src');
        this.genComponentRootPath = libpath.join(this.genSourcePath, 'component')
        this.genStoreRootPath = libpath.join(this.genSourcePath, 'store')

        this.projectCommonSourcePath = libpath.join(props.projectRootPath, 'common', 'src');
        this.nodeOfAncestor = CodegenNode.enrich(require(libpath.resolve(libpath.join(this.projectRootPath, `source.js`))).default);
        this.strcuts = this.nodeOfAncestor.components.map(component => component.struct);
        /** 這就是 source.js 的進入點 */
    }

    appendMustacheFile(templateFileName, destFileName, param = {}) {
        Util.appendFile(
            libpath.resolve(destFileName),
            this.getStringFromMustache(templateFileName, param),
            true,
            true);
    }

    getStringFromMustache(templateFileName, variable) {
        return mustache.render(Util.getFileContextInRaw(libpath.join(this.freeMarkerRootPath, templateFileName)), this.getMustacheRenderValues(variable));
    }

    getMustacheRenderValues = ({
                                   hasPath,
                                   name,
                                   fieldName,
                                   defaultValue,
                                   fieldUrl,
                                   functionName,
                                   className,
                                   projectName,
                                   projectVersion,
                                   projectDescription,
                                   fieldClass,
                                   hasPaginate,
                                   storageSuperUserUid,
                               }) => {
        return {
            hasPath,
            name,
            fieldName,
            functionName: functionName ? functionName : _.upperFirst(fieldName),
            modifiedFunctionName: `Modified${_.upperFirst(fieldName)}`,
            modifiedFieldName: `${Util.camel(`modified`, fieldName)}`,
            defaultValue,
            fieldUrl,
            className,
            projectName,
            projectVersion,
            projectDescription,
            fieldClass,
            hasPaginate,
            storageSuperUserUid,
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

class BaseBuilder extends PathBase {

    constructor(props) {
        super(props);
    }
}

class StoreBuilder extends BaseBuilder {

    constructor(props) {
        super(props);
    }

    getFunctionsDependOnFieldType({fieldName, type, defaultValue, fieldClass, name, hasPath, hasPaginate}) {
        const functions = this.getStringFromMustache(`store_${type}.mustache`, {
            name,
            hasPath,
            fieldName,
            defaultValue,
            fieldClass,
            hasPaginate
        })
        return functions;
    }

    async buildStoreIndexFiles() {
        /** 產生 store再project的index file */
        const stores = this.getGenStores();
        const baseGenerator = new ClassGenerator(Util.persistByPath(libpath.join(this.genStoreRootPath, `store.js`)));
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
                        name: child.getName(),
                        fieldName,
                        hasPath: child.hasPath(),
                        type: child.type,
                        defaultValue,
                        hasPaginate: child.hasPaginate(),
                        fieldClass: child.getClassName(),
                    }));
            if (child.isNumber())
                propStmt.push(`if(obj && _.isNumber(obj.${fieldName}))`);
            else
                propStmt.push(`if(obj && !_.isEmpty(obj.${fieldName}))`);
            propStmt.push(`{`);

            if (child.isArray()) {
                propStmt.push(`this.${child.getFunctionNameOfSetter()}(...obj.${fieldName})`);

                if (child.ref && !child.independence)
                    generator.appendImport(child.getClassName(), `../${child.ref.getStoreFolderName()}`)
                else {
                    generator.appendImport(child.getClassName(), `../${child.getStoreFolderName()}`)
                    await this.buildBaseStore(child)
                }
            } else if (child.isObject()) {
                generator.appendImport(child.getClassName(), `../${child.getStoreFolderName()}`)
                propStmt.push(`this.set${_.upperFirst(fieldName)}(obj.${fieldName})`);
                await this.buildBaseStore(child)
            } else {
                propStmt.push(`this.${child.getFunctionNameOfSetter()}(obj.${fieldName})`);
            }
            propStmt.push(`}`);
            propsStmt.push(...propStmt);
        }
        return propsStmt;
    }

    async buildBaseStore(node) {

        function getInitFetchStmt(node) {
            let defaultStmt = `await new ${node.getClassName()}().fetch(view)`;
            if (node.isFetchOnlyLogin()) {
                defaultStmt = `UserInfoRef.isLoginInSucceed() ? ${defaultStmt}: this.${node.getFieldName()}`
            }
            return `${node.getFieldName()} : ${defaultStmt},`;

        }

        const folderName = node.getStoreFolderName();
        const className = node.getStoreClassName();
        const baseClassName = `Base${className}Store`;
        const indexClassName = `${className}Store`;
        const baseGenerator = new ClassGenerator(libpath.join(this.genStoreRootPath, folderName, `${baseClassName}.js`));
        baseGenerator.appendClass(baseClassName, {name: `BaseStore`, from: '../../base/BaseStore'});
        baseGenerator.appendImport('_', 'lodash');
        /** 加上 ref 是因為怕會和 UserInfoStore 打架 */
        baseGenerator.appendImport('UserInfoRef', '../../userInfo');
        baseGenerator.appendInClassHead(`import {makeAutoObservable, makeObservable, action, observable, comparer, computed, autorun, runInAction} from "mobx"`)
        baseGenerator.appendFunction(`getClassName`, [], [], [], `return '${baseClassName}'`);
        const propsStmt = [];

        if (node.hasAttributeChildren()) {
            const propStmt = await (this.buildFieldAttribute(baseGenerator, node));
            propsStmt.push(...propStmt);
        }

        /** 這邊專門處理remote fetch 的邏輯 */
        new RemoteFunctionHandler(baseGenerator).buildFetchSubmitApi(node);
        new RemoteFunctionHandler(baseGenerator).buildListenerFunction(node);

        if (node.isObject()) {
            const contents = [
                `{`,
                node.hasPath() ? `...(await this.${node.getFunctionNameOfFetch()}(view)),` : `...{},`,
                ..._.map(node.getPreciseAttributeChildren(), (child) => child.isCollection() ? getInitFetchStmt(child) : ``),
                `}`,
            ]
            baseGenerator.appendAsyncFunction('fetch', ['view'], [], [],
                ...this.getDecorateFetchStrings(node.isObject(), ...contents)
            )
        } else if (node.isArray()) {
            const stmts = [];
            if (node.hasPath()) {
                stmts.push(`return await this.${Util.camel(`fetch`, node.getFieldName())}(view)`)
            }

            baseGenerator.appendAsyncFunction('fetch',
                ['view'], [], [],
                ...stmts);
        }

        if (node.isArray()) {
            baseGenerator.appendFunction('remove', [], [], ['type是array, 才會被gen出的method'],
                `if(this.getParentNode())`,
                `this.getParentNode().remove${_.upperFirst(node.getFieldName())}(this)`
            )
        }

        const types = [{name: `rawData`, fetcher: (node) => node.getPreciseColumnChildren()},
            {name: `data`, fetcher: (node) => node.getPreciseAttributeChildren()}];

        types.map(type => {
            baseGenerator.appendFunction(type.name, [], [], [],
                'return {',
                type.fetcher(node).map((child) => {
                        const key = child.getFieldName();
                        let value = '';
                        if (child.isArray()) {
                            value = `this.${child.getFieldName()}.map(each => each.${type.name}())`
                        } else if (child.isObject()) {
                            value = `this.${child.getFieldName()}.${type.name}()`
                        } else {
                            value = `this.${child.getFieldName()}`;
                        }
                        return `${key}:${value}`;

                    }
                ).join(','), '}')
        })
        baseGenerator.appendFunction('clear', [], ['action'], [],
            ...node.getPreciseAttributeChildren()
                .map((child) => {
                        if (child.isArray()) {
                            return `this.${child.getFieldName()}.length = 0`
                        } else if (child.isObject()) {
                            return `this.${child.getFieldName()}.clear()`
                        } else {
                            return `this.${child.getFieldName()} = ${child.getDefaultValueByType()}`;
                        }
                    }
                ))

        baseGenerator.appendFunction(`initial`, ['obj'], ['action'], [],
            `super.initial(obj)`,
            ...propsStmt);
        baseGenerator.appendConstructor(`makeObservable(this)`, `this.initial(props)`);
        baseGenerator.needIndexFile(`${indexClassName}`);
        await baseGenerator.persist();
    }

    getDecorateFetchStrings(isObject = false, ...contents) {
        let normalize = contents;
        if (isObject) {
            normalize = [
                `const result = `, ...normalize,
                `this.fromJson(result)`
            ]
        }
        normalize = [
            ...normalize,
            'return result',
        ]
        return normalize
    }
}

class RemoteFunctionHandler {

    constructor(classGenerator, platform = 'web') {
        this.generator = classGenerator;
        this.platform = platform;
    }

    isAdminPlatform() {
        return _.isEqual('admin', this.platform);
    }

    isWebPlatform() {
        return _.isEqual('web', this.platform);
    }

    appendParamIfPlatformEqualsWeb(isString = false) {
        if (_.isEqual(this.platform, 'web')) {
            if (isString)
                return ',view';
            else
                return ['view'];
        } else {
            if (isString)
                return '';
            else
                return [];
        }
    }

    buildListenerFunction(node, recursively = false) {
        const defaultParam = node.getParamsOfPath();
        const pathStmt = `const path = \`${node.getPathOfRouterString()}\``;

        if (node.isCollection()) {
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

                if (this.isWebPlatform() && node.isRestfulBean()) {
                    this.generator.appendFunction(Util.camel(`restful`, `listen`, node.getName(), 'item'),
                        [...defaultParam, `id`, `callback = (result) => result`, 'view']
                        , [], [],
                        `${pathStmt}
                        return this.restfulListenItem(path,id,callback,view);`
                    );
                }

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

    buildFetchSubmitApi = (node, recursively = false) => {
        function getConditionStmts() {
            const stmts = [];
            stmts.push(...node.getAfterConditions().map((each) => `(stmt) => stmt.${each}`));
            if (node.hasPaginate()) {
                stmts.push(`(stmt) => stmt.limit(${node.getPaginateSize()})`)
            }
            return stmts.join(',');
        }

        function getPreConditionStmts() {
            if (node.getPreConditions().length > 0)
                return node.getPreConditions().map((each) => `(stmt) => stmt.${each}`).join(',') + ',';
            else
                return '';
        }

        const self = this;
        if (node.isCollection()) {
            const contents = [];
            const children = [];
            const generator = this.generator;

            function isWebPlatform() {
                return self.platform === 'web';
            }

            function isAdminPlatform() {
                return self.platform === 'admin';
            }

            function appendViewInParamStmt(comma = true) {
                return isWebPlatform() ? `${comma ? ',' : ''}view` : ``;
            }

            function houseKeepingStmt() {
                if (isWebPlatform()) {
                    return [`if(this.hasParent())`,
                        `this.getParentNode().${node.getFunctionNameRemoveItems()}(this)`];
                } else
                    return [];
            }

            function getFetchStmt() {
                if (isWebPlatform()) return [`this.clear()`, `this.initial(item)`];
                return [];
            }

            function generateApiFunction(name, params = [], logicStmts = [], type) {
                const defaultParam = node.getParamsOfPath(self.platform);
                const preStmts = [
                    `const self = this`,
                    `const path = \`${node.getPathOfRouterString()}\``
                ];
                const stmts = [`const task = async () => {`];
                stmts.push(...logicStmts);
                stmts.push(`}`);
                if (isWebPlatform())
                    stmts.push(`return await self.runUIAsyncTask(task, '${type}', path${appendViewInParamStmt()})`)
                else
                    stmts.push(`return await task()`);
                params = params.map(param => {
                    if (_.isEqual(param.trim(), 'id')) {
                        return `${param} = this.getId()`;
                    } else if (Util.isOrEquals(param.trim(), 'item', 'object')) {
                        return `${param} = this.rawData()`;
                    } else if (_.isEqual(param.trim(), 'restful')) {
                        return `restful = {status: 'succeed', message: 'default reason'}`;
                    }
                    return param;
                })
                generator.appendAsyncFunction(name, [...[`${appendViewInParamStmt(false)}`], ...defaultParam, ...params], [], [],
                    ...[...preStmts, ...stmts])
            }

            if (generator === undefined)
                throw new ERROR(8016)

            for (const child of node.getPreciseAttributeChildren()) {
                if (_.isEqual(child, 'updateTime')) continue;
                if (!child.isColumnAttribute()) continue;
                contents.push(`const _${child.getFieldName()} = object.${child.getFieldName()} ? 
                object.${child.getFieldName()} : ${child.getDefaultValueByType(isAdminPlatform())};\/\/${child.getType()}`);
                children.push(child.getFieldName());
            }

            contents.push(`const _updateTime = this._firebase().getServerTimeSymbol()`);
            children.push(`updateTime`);
            contents.push(`const commitment = \{${children.map(child => `${child}: _${child}`).join(',')}\}`);

            if (node.hasPath()) {
                /** 有path 才代表 這是一個遠端也有的物件 */
                const functionNameOfNormalize = Util.camel('normalize', node.getName());
                generator.appendFunction(functionNameOfNormalize, ['object'], [], [],
                    ...contents,
                    'return commitment'
                )

                if (node.isArray()) {

                    generateApiFunction(node.getFunctionNameOfFetch(),
                        ['...conditions'],
                        [`return await self.fetchItems(path, ${getPreConditionStmts()}...conditions,${getConditionStmts()})`], `fetch items`);

                    generateApiFunction(node.getFunctionNameOfFetchItem(),
                        [`id`],
                        ['const item =  await self.fetchItem(path, id)',
                            , ...getFetchStmt(),
                            `return item`], `fetch item`)

                    /** admins only , delete collection all */
                    generateApiFunction(
                        Util.camel(`delete`, node.getFieldName()),
                        ['all = false', '...conditions'],
                        [`return await self.deleteItems(path,all,...conditions)`], 'delete items')

                    generateApiFunction(
                        node.getFunctionNameOfSubmitItem(),
                        [`item`],
                        [`const commitment = this.${functionNameOfNormalize}(item)`,
                            `return await self.submitItem(path, commitment);`], 'submit item')


                    generateApiFunction(
                        node.getFunctionNameOfUpdateItem(),
                        [`id`, `item`],
                        [`return await self.updateItem(path, id , item)`], 'update item')

                    generateApiFunction(
                        node.getFunctionNameOfDeleteItem(),
                        [`id`],
                        [`const result = await self.deleteItem(path, id)`,
                            ...houseKeepingStmt(),
                            `return result`], 'delete item')

                    generateApiFunction(
                        Util.camel('submit', node.getFieldName()),
                        ['...objects'],
                        [`const commitments = objects.map((object) => this.${functionNameOfNormalize}(object))`,
                            `return await self.submitItems(path,...commitments)`], `submit items`)

                    generateApiFunction(
                        Util.camel(`fetch`, `size`, `of`, node.getFieldName()),
                        [], [`return await self.fetchSizeOfCollection(path)`], `fetch size`)

                    if (this.isAdminPlatform() && node.isRestfulBean()) {
                        generateApiFunction(
                            Util.camel(`restful`, node.getFunctionNameOfSubmitItem()),
                            ['item', 'restful'],
                            [`const commitment = this.${functionNameOfNormalize}({...item, ...restful})`,
                                `return await self.submitItem(path, commitment);`], 'submit item')
                    }


                } else if (node.isObject()) {
                    generateApiFunction(
                        Util.camel(node.getFunctionNameOfSubmit()),
                        [`object`],
                        [
                            `const commitment = this.${functionNameOfNormalize}(object)`,
                            `return await self.submitObject(path, commitment,'${node.getName()}')`], `submit object`)

                    generateApiFunction(
                        node.getFunctionNameOfFetch(),
                        [],
                        [
                            `const object = await self.fetchObject(path,'${node.getName()}')`,
                            `this.clear()`,
                            `this.initial(object)`,
                            `return object`
                        ], `fetch object`)

                    generateApiFunction(
                        Util.camel('update', node.getFieldName()),
                        [`object`],
                        [`return await self.updateObject(path, object, '${node.getName()}')`], `update object`);

                    generateApiFunction(
                        Util.camel('delete', node.getFieldName()),
                        [],
                        [`return await self.deleteObject(path, '${node.getName()}')`], `delete object`);

                } else {
                    throw new ERROR(8015, node.getType());
                }
            }
        }

        if (recursively) {
            for (const child of node.getChildren()) {
                this.buildFetchSubmitApi(child, recursively);
            }
        }
    }
}

class ComponentBuilder extends BaseBuilder {

    hasRootRenderViewFunction = false;
    classNames = [];
    componentDidMountStmt = [];
    componentDetachStmt = [];

    constructor(props) {
        super(props);
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

        const baseComponentName = componentNode.getStruct().getName();
        const baseClassName = `Base${_.upperFirst(baseComponentName)}Component`;
        const className = `${_.upperFirst(baseComponentName)}Component`;
        const folderName = baseComponentName;

        const baseGenerator = new ClassGenerator(libpath.join(this.genComponentRootPath, folderName, `${baseClassName}.js`));
        /**  baseGenerator.insertBatchLines(this.getComponentClassBody(baseClassName)); */

        baseGenerator.appendClass(baseClassName,
            componentNode.isEditPage() ? {
                name: 'BaseEditorComponent',
                from: '../../base/BaseEditorComponent'
            } : {
                name: 'BaseComponent',
                from: '../../base/BaseComponent'
            }
        );

        this.importComponentDefault(baseGenerator);
        baseGenerator.appendImport('{Grid,Paper,Card,Avatar,AppBar,Toolbar,TextField,Typography,Button,IconButton,Drawer,ListItem,List}', '@material-ui/core')
        baseGenerator.appendImport('MenuIcon', `@material-ui/icons/menu`);
        baseGenerator.appendImport('Style', '../../style');
        baseGenerator.appendImport('{observer}', 'mobx-react');
        baseGenerator.appendImport('{Fade}', 'react-slideshow-image');


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

        this.appendRenderViewFunctions(componentNode.getStruct(), baseGenerator, componentNode.isEditPage());

        if (componentNode.hasTitle()) {
            baseGenerator.appendField(`stringOfPageTitle`, `"${componentNode.getTitle()}"`)
            this.appendStmtIntoComponentDidMount(`document.title = this.stringOfPageTitle`);
        }

        if (this.containedFetchAttribute(componentNode.getStruct())) {
            this.appendStmtIntoComponentDidMount(
                `this.getStore().fetch(this).then()`
            )
        }

        this.appendStmtIntoComponentDetach(`this.getStore().clear()`);

        baseGenerator.appendFunction('getStore', [], [], [],
            componentNode.isEditPage() ? `return this.props.${componentNode.getStruct().getOriginalName()}` : `return this.props.${componentNode.getStruct().getName()}`)

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

        return {classNames: this.classNames, events: componentNode.getEvents()};
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
            const value = props[key];

            if (_.isBoolean(value)) {
                /** boolean always pass, 忘繼為什麼要 continued */
            } else {
                if (!!!props[key]) continue
            }

            if (_.isEqual(key, 'injectProps'))
                stmt.push(`{${props[key]}}`)
            else
                stmt.push(`${key}=${normalize(props[key])}\n`);
        }

        if (_.isEmpty(contents)) {
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

    /** 把組合出className必備存起來 {node,type: 'wrap'|'default'|'List'|'listWrap'} ,後續要產生出less style才有根據 */
    storeClassName(className) {
        this.classNames.push(className);
    }

    getJSXStringsByNode(generator, node, isEditPage = false) {
        /**
         contentStmts 是指 ===>  <View > {contentStmts} <View>
         如果子節點是object或是array, 就產生出{this.getObjectOrArrayView(param)}
         如果子節點是string或是number, 就產生出{string}
         **/

        function getJsxViewStmt(node) {
            const props = {}
            const param = node.getParamOfRenderView();
            if (!_.isEmpty(param)) {
                props[param] = `###${param}`
            }

            const viewJsxStmt = self.getJSXStrings({
                tag: node.getFunctionNameOfRenderView(),
                props,
            })
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


        /** type是array就必須的包上一成List,可以調整物件方向 */
        if (node.isArray()) {
            const clazzName = node.getClassNameOfLessUsage('list');
            this.storeClassName({node, type: 'list'});

            const props = {
                className: clazzName,
                style: `###{...${JSON.stringify(node.getListStyle())},...Style.${clazzName}}`,
                ...node.getListProps(),
            }

            const itemViewProps = {};
            itemViewProps['key'] = node.getUniqueIdStmt();
            itemViewProps[`${node.getName()}`] = `###${node.getName()}`
            const ArrayItemView = this.getJSXStrings({
                tag: `${node.getFunctionNameOfRenderItemView()}`,
                props: itemViewProps,
            })

            const arrayStmts = this.getJSXStrings({
                tag: node.getListView(),
                props,
                contents: [...node.getListContents(), `{${node.getFieldName()}.map((${node.getName()}) => `,
                    ...ArrayItemView, `)}`]
            })

            if (node.hasListWrap()) {
                const clazzName = node.getClassNameOfLessUsage('listWrap');
                this.storeClassName({node, type: 'listWrap'});

                return this.getJSXStrings(
                    {
                        tag: node.getListWrapView(),
                        props: {
                            className: clazzName,
                            style: `###{...${JSON.stringify(node.getListWrapStyle())},...Style.${clazzName}}`,
                            ...node.getListWrapProps(),
                        },
                        contents: [...node.getListWrapContents(), ...arrayStmts]
                    }
                )
            }
            return arrayStmts;


        }

        const contentStmts = [];
        const self = this;

        for (const child of node.getPreciseViewChildren()) {
            if (!child.isView()) continue;
            if (child.isOuter()) continue;

            if (node.isContainer()) {
                if (child.isIncestView()) {
                    contentStmts.push(`{/* ${child.getName()}, incest view */}`);
                }
                contentStmts.push(...getJsxViewStmt(child))
            }
        }

        /** 產生出 title, tile是指==> const title=this.getSomeOneTitle() <View >{title} </View> */
        if (!node.isTextField() && !node.isImageView() && node.isStringOrNumberAttribute()) {
            contentStmts.push(`{${node.getFieldName()}}`);
        }

        const className = node.getClassNameOfLessUsage('default');
        this.storeClassName({node, type: 'default'});
        const props = {
            className,
            ...node.getViewProps(),
        };

        if (node.needInjectStyle()) {
            const param = node.isArrayItem() ? node.getName() : node.getPreciseAttributeParentName();
            const injectFunctionName = node.getFunctionNameOfInjectStyle();
            props.style = `###{...self.${injectFunctionName}(${param}),...${JSON.stringify(node.getStyle())},...Style.${className}}`;
            generator.appendFunction(injectFunctionName, [param]);

        } else {
            props.style = `###{...${JSON.stringify(node.getStyle())},...Style.${className}}`;
        }

        if (node.needInjectProps()) {
            const param = node.getPreciseAttributeParentName();
            const injectProps = node.getFunctionNameOfInjectProps();
            props['injectProps'] = `...self.${node.getFunctionNameOfInjectProps()}(${param})`
            generator.appendFunction(injectProps, [param]);

        }

        if (node.isArray()) {
            props.key = `${node.getUniqueIdStmt()}`;
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
                    `###(param) => self.${node.getFunctionNameOfClicked()}({view:param${node.getClickParamStmt()}})`
            }
        }

        /** 這裡就是放contents的邏輯 <View > {...contents}<View>,*/
        if (node.isImageView()) {
            props['src'] = `###${node.getName()}`;
        } else if (node.isTextField()) {
            props['label'] = `${node.getDescription()}`;
            props['value'] = `###${node.getName()}`;
            props['onChange'] = `###(event)=>{ 
            ${node.getPreciseAttributeParentName()}.${node.getFunctionNameOfSetter()}(
            ${node.isNumber() ? '_.toNumber(event.target.value)' : 'event.target.value'}
            )}`
            if (node.isNumber()) {
                props['type'] = `number`;
                props['InputLabelProps'] = {
                    shrink: true,
                };
            }
            if (node.isString()) {
                props['multiline'] = `###true`;
            }
        }

        if (node.isAppBarView() && !node.isScrollingHideDependOnRootNode()) {
            props['position'] = 'static';
        }

        let origin = this.getJSXStrings({
            tag: node.view,
            props,
            contents: [...contentStmts, ...node.getContents()],
        });

        if (node.isAppBarView() && node.isScrollingHideDependOnRootNode()) {
            origin = this.getJSXStrings({
                tag: 'ScrollingHideWrap',
                props: {injectProps: '...self.props'},
                contents: [...origin]
            })
        }

        if (node.hasWrap()) {
            const clazzName = node.getClassNameOfLessUsage('wrap');
            this.storeClassName({node, type: 'wrap'});

            const props = {
                className: `${clazzName}`,
                style: `###{...${JSON.stringify(node.getWrapStyle())},...Style.${clazzName}}`,
                ...node.getWrapProps(),
            }

            const stmt = [];
            /** 當屬性不是資料結構, 但卻還有view的child node時, 就自動放到 wrap 裡面*/
            if (!node.isCollection() && node.hasViewChildren()) {
                for (const child of node.getPreciseViewChildren()) {
                    stmt.push(...getJsxViewStmt(child))
                }
            }

            origin = this.getJSXStrings({
                tag: node.getWrapView(),
                props,
                contents: [...node.getWrapContents(), ...getOuterChildJSXStrings(node), ...origin, ...stmt],
            })
        }

        return origin;
    }

    /** stmt:Array<String> */
    removeJSXSign(stmt) {
        _.remove(stmt, (each) => _.isEqual(each, SIGN_OF_JSX_CONTENT));
    }

    generateEditFunctionCallback(node, generator) {
        if (node.isArray()) {
            const parentName = node.getPreciseAttributeParentName();

            if (node.hasPath()) {
                generator.appendFunction(node.getFunctionNameOfItemEditor(), [node.getName()], [], [],
                    `const self =this`,
                    `return  async (type) => {
                switch (type) {`,
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
                    `await ${parentName}.${node.getFunctionNameOfSubmit()}(self)`,
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
                generator.appendFunction(node.getFunctionNameOfItemEditor(), [node.getName()], [], ['因為沒有path, 所以其實只會是SyncTask'],
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

                generator.appendFunction(node.getFunctionNameOfCollectionEditor(), [parentName], [], ['因為沒有path, 所以其實只會是SyncTask'],
                    `return  async (type) => {`,
                    `switch (type) {`,
                    `case 'create':`,
                    `${parentName}.${Util.camel(`append`, node.getName())}()`,
                    `break;`,
                    `default:`,
                    `Util.appendError(\`${node.getName()} 3035 can't not happen this type => \${type}\`)`,
                    `}`,
                    `}`,
                )
            }
        } else if (node.isObject() && node.hasPath()) {
            generator.appendFunction(node.getFunctionNameOfCollectionEditor(), [node.getName()], [], ['因為沒有path, 所以其實只會是SyncTask'],
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

    appendRenderViewFunctions(node, generator, isEditPage) {
        const self = this;

        function normalize(...strings) {
            const self = strings;
            _.remove(self, (each) => _.isEqual(each, SIGN_OF_JSX_CONTENT));
            return `return ( ${self.join('')})`;
        }

        function appendFunctionWithFields(node) {
            generator.appendFunction({
                    name: node.getFunctionNameOfRenderView(),
                    arrow: true,
                    decorator: 'observer',
                }, [`{${node.getParamOfRenderView()}}`], [], [],
                ...getContentStmt(node)
            )
        }

        function getContentStmt(node) {
            return [
                'const classes = this.props.classes',
                'const self = this',
                ...node.getSelfVariableStmts(),
                normalize(...self.getJSXStringsByNode(generator, node))];
        }

        if (!this.hasRootRenderViewFunction) {
            generator.appendFunction('renderView', [], [], [],
                `const ${node.getName()} = this.getStore()`,
                ...getContentStmt(node));
            this.hasRootRenderViewFunction = true;
        }

        if (isEditPage) {
            this.generateEditFunctionCallback(node, generator);
        }

        const existedFunctions = {};
        for (const child of node.getPreciseViewChildren()) {
            /** 產生出在component裡面的store getter , 這段邏輯只能擺在這裡, 不然非collection的屬性, 會產生不出來*/
            if (child.isAttribute()) {
                generator.appendFunction(child.getFunctionNameUsingInComponentGetter(),
                    [`${child.getPreciseAttributeParentName()}`], [], [],
                    `return ${child.getPreciseAttributeParentName()}.${child.getFunctionNameInStoreGetter()}()`);
            }


            const functionName = child.getFunctionNameOfRenderView();
            /** 讓重複定義的view只出現一次, 像是space這樣的狀況 */
            if (existedFunctions[functionName]) continue;

            if (child.isArray()) {
                if (child.hasPaginate()) {
                    generator.appendFunction(`getThresholdOfScrollToBottom`, [], [], [], `return ${child.getPaginateThreshold()}`)
                    self.appendStmtIntoComponentDidMount(`this.registerScrollToBottomJob(this.getStore().${child.getFunctionNameOfNextPage()}(this))`)
                }

                /** 讓Array先產出一個itemView, 但getJSXStringsByNode邏輯太嚴謹, 所以先用clone偽裝成一個object去generate */
                const clone = _.clone(child);
                clone.type = 'arrayItem';
                appendFunctionWithFields(clone);
            }
            appendFunctionWithFields(child);
            if (child.hasViewChildren()) {
                this.appendRenderViewFunctions(child, generator, isEditPage);
            }
            existedFunctions[functionName] = true;
        }
    }

    getComponentClassBody(className) {
        return mustache.render(Util.getFileContextInRaw('./template/component.js'), this.getMustacheRenderValues({className}))
    }

}

class AppBuilder extends ComponentBuilder {

    constructor(props) {
        super(props);
        /** 印為繼承component */
    }

    async buildCustomizeFiles(packages) {
        for (const _package of packages) {
            const packageName = _package.getName();
            const generator = new ClassGenerator(libpath.join(this.genRootPath, _package.root, _package.getName(), 'index.js'));
            generator.appendClass(_.upperFirst(packageName));
            await generator.persist();
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
            `router`,
            `BaseRouter.js`
        ));
        baseRouterGenerator.appendClass(
            `BaseRouter`
        );
        for (const component of sourceObj.components) {
            if (!component.hasPath()) continue;
            baseRouterGenerator.appendFunction(Util.camel('goto', component.name, component.isEditPage() ? 'editor' : '', 'page'),
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
                    tag: _.upperFirst(component.getStruct().getName()),
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
                injectProps: '...this.getStoreObject()'
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

    async buildStyleFiles(classNameInfos) {
        const types = [`app`, `common`, `mobile`];
        for (const type of types) {
            let origins = {};
            const sourceFilePath = libpath.join(this.projectPlatformSourcePath, `style`, `${type}.style.js`)
            if (fs.existsSync(sourceFilePath)) {
                const obj = require(libpath.resolve(sourceFilePath)).default;
                origins = obj;
            }

            const generator = new ClassGenerator(libpath.join(this.genSourcePath, 'style', `${type}.style.js`))
            generator.appendClass(`${_.upperFirst(type)}Style`);
            for (const info of classNameInfos) {

                for (const className of info.classNames) {
                    const node = className.node;
                    const type = className.type;
                    const name = node.getClassNameOfLessUsage(type);
                    if (!!origins[name]) {
                        generator.appendField(name, JSON.stringify(origins[name]));
                        delete origins[name];
                    } else {
                        generator.appendField(name, `{}`);
                    }
                }
                const isEditPage = info.component.isEditPage();
                generator.insertBatchLinesIntoFieldSection(`\n\n/** => following for ${info.component.getName()} ${isEditPage ? 'editor' : ''} component  */\n\n`)
                generator.needSignature(false);
                generator.setSingleton(true);
            }
            if (!_.isEmpty(origins)) {
                for (const name in origins) {

                    /** 要檢查homeless的每一個 是不是沒定義過, 沒定義過就會是一個空物件 */
                    if (!_.isEqual(origins[name], {}))
                        generator.appendField(name, JSON.stringify(origins[name]));
                }
                generator.insertBatchLinesIntoFieldSection(`\n\n/** following for homeless */\n\n`)
            }
            await generator.persist();
        }
    }

    /** {[...{component,names}], srcPath}
     * srcPath 就是 keep file 的根目錄
     * */
    async buildLessFile(classNameInfos) {
        /** 先取得 libs file list*/
        const libs = Util.findFilePathBy(libpath.join(this.freeMarkerRootPath, 'less', 'libs'),
            (file) => _.isEqual(file.extension, 'less'))
            .map((file) => file.fileNameExtension);


        /** 先把舊的整理過, 除掉 comment的字樣line */
        const sign = `/** style */`;
        const types = [`app`, `common`, `mobile`];
        for (const type of types) {
            const srcLessPath = libpath.join(this.projectPlatformSourcePath, `less`, `${type}.less`)
            const lessAttributesFromSrc = [];
            if (fs.existsSync(srcLessPath)) {
                const stub = Util.getFileContextInRaw(srcLessPath).split('\n');
                _.remove(stub, (each) => (_.startsWith(each, '/** ') || _.isEqual(each.trim(), '')))
                lessAttributesFromSrc.push(...(stub.join('').split('}')))
                /** 移除掉最後一個,因為split */
                lessAttributesFromSrc.pop();
            }

            /** 刪掉沒定義過less....  沒定義過的 => ' .ExamDiv { /** style */
            _.remove(lessAttributesFromSrc, (each) => (_.isEqual(each.split(`{`)[1].trim(), sign)))

            const generator = new ClassGenerator(libpath.join(this.genSourcePath, 'less', `${type}.less`));
            for (const info of classNameInfos) {
                const isEditPage = info.component.isEditPage();
                generator.appendInClassTail(`/** following for ${info.component.getName()} ${isEditPage ? 'editor' : ''} component used  */\n\n`);
                for (const className of info.classNames) {
                    /** 注意!! 是用 remove,會mutate 原本的 array */
                    const node = className.node;
                    const type = className.type;
                    const name = node.getClassNameOfLessUsage(type);
                    /** 從file裡面找出定義過的屬性敘述*/
                    const srcAttribute = _.remove(lessAttributesFromSrc, (each) => _.startsWith(each, `.${name}`))

                    if (srcAttribute.length > 1)
                        throw new ERROR(7003, `origin ==> ${Util.deepFlat(srcAttribute)}`)

                    const undefinedInFile = _.isEmpty(srcAttribute);

                    if (isEditPage) {
                        if (type === 'default' && node.isTextField()) {
                            const extendStmt = `:extend(.BaseEditorTextField all)`;
                            generator.appendInClassTail(undefinedInFile ? `.${name}${extendStmt} { ${sign} }\n\n` : `${srcAttribute[0]}}\n\n`);
                        } else {
                            const original = node.getOriginalClassNameOfLessUsage(type);
                            if (original.exists) {
                                const extendStmt = `:extend(.${original.value} all)`;
                                generator.appendInClassTail(undefinedInFile ? `.${name}${extendStmt} { ${sign} }\n\n` : `${srcAttribute[0]}}\n\n`);
                            }
                        }
                    } else
                        generator.appendInClassTail(_.isEmpty(srcAttribute) ? `.${name} { ${sign} }\n\n` : `${srcAttribute[0]}}\n\n`);
                }
            }

            if (lessAttributesFromSrc.length > 0) {
                generator.appendInClassTail(`/** ======== following for homeless ========= */\n\n`);
                lessAttributesFromSrc.map(each => generator.appendInClassTail(`${each} }\n\n`))
            }

            for (const nameExtension of libs) {
                generator.appendInClassHead(`@import "./libs/${nameExtension}";`)
            }


            generator.needSignature(false);
            generator.disableDefaultImports();
            await generator.persist();

            if (!fs.existsSync(libpath.join(this.projectPlatformSourcePath, 'less', 'index.js'))) {
                this.appendMustacheFile('less.index.mustache',
                    Util.persistByPath(libpath.join(this.genSourcePath, 'less', 'index.js'))
                );
                Util.appendInfo(`persist ./less/index.js succeed`);
            }
        }
    }

    async overrideLessFile() {
        const less = libpath.join(this.freeMarkerRootPath, `less`);
        const to = libpath.join(this.genSourcePath, 'less');
        Util.copyFromFolderToDestFolder(less, to);
    }
}

class ProjectFileHandler extends PathBase {

    constructor(props) {
        super(props);
        this.props = props;
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
        const watermarkObj = Util.mergeObject({
            type: 'string',
            src: 'defaultTexts',
            alpha: 0.35,
            position: 'lowerRight',
            color: '#000',
            textStyle: '20px roboto',
        }, sourceObj.watermark);
        baseConfigGenerator.appendField(`watermark`, JSON.stringify(watermarkObj));

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
                const trueOrFalse = sourceObj.navigation && sourceObj.navigation.isScrollingHide
                baseConfigGenerator.appendField(`isScrollingHide`, JSON.stringify(trueOrFalse));
                break;


        }
        await baseConfigGenerator.needIndexFile('Config', [], true);
        await baseConfigGenerator.persist();
    }

    persistBaseFilesToFreeMarkerTemplate() {
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
                    const projectCommonSourceBasePath = libpath.join(this.freeMarkerSourceCommonPath, 'src', 'base');
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
                    const projectPlatformSourceBasePath = libpath.join(this.freeMarkerSourcePlatformPath, 'src', 'base');
                    Util.persistByPath(projectPlatformSourceBasePath);
                    Util.copySingleFile(file.absolute,
                        libpath.join(projectPlatformSourceBasePath, file.fileNameExtension), undefined, true)
                }
            }
            Util.appendInfo(`persist free-marker base files succeed`);
            return false;
        } catch (error) {
            /** 偷懶 hack */
            Util.appendError(error);
        }
    }

    persistCustomizePackages() {
        const packages = this.nodeOfAncestor.getCustomizePackages().filter((each) => _.isEqual(each.platform, this.platform));
        for (const folder of packages) {
            const genExtraFolderPath = libpath.join(this.genRootPath, folder.root, folder.getName());
            if (fs.existsSync(genExtraFolderPath)) {
                const destFolderPath = libpath.join(this.projectPlatformPath, folder.root, folder.getName());
                Util.persistByPath(destFolderPath);
                Util.copyFromFolderToDestFolder(genExtraFolderPath, destFolderPath);
                Util.appendInfo(`extraPackage ,persist to ${destFolderPath} succeed`);
            }
        }
    }

    persistLessLibs() {
        const files = Util.findFilePathBy(libpath.join(this.genSourcePath, 'less', 'libs'), (file) => _.isEqual('less', file.extension));
        const to = libpath.join(this.freeMarkerRootPath, 'less', 'libs');
        for (const less of files) {
            Util.copySingleFile(less.path, to, less.fileNameExtension, true);
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
    overrideEachFilesFromFolder(...excludes) {
        /** 順序會影響檔案的priority */
        const fromSourcePath = [this.projectPlatformPath, this.freeMarkerSourcePlatformPath, this.freeMarkerSourceCommonPath];
        /** exam/web/ */
        for (const sourcePath of fromSourcePath) {
            for (const sourceFile of Util.findFilePathBy(sourcePath)) {

                let ignoreThisRun = false;
                for (let exclude of excludes) {
                    if (_.isString(exclude)) {
                        exclude = {type: 'fileNameExtension', keyword: exclude}
                    }

                    if (_.isEqual(sourceFile[exclude.type], exclude.keyword)) {
                        ignoreThisRun = true;
                        break;
                    }

                }
                if (ignoreThisRun) continue;

                const from = sourceFile.path;
                const dest = libpath.join(this.genRootPath, Util.getRelativePath(sourceFile.path, sourcePath));

                const destFolder = Util.getFileDirPath(dest);
                if (!fs.existsSync(destFolder)) {
                    Util.appendError(`overrideIndexFiles warning ,dest folder not exist 
                    destFolder=> ''${destFolder}'' || sourceFileName=>''${from}''`);
                    Util.persistByPath(Util.getFileDirPath(dest));
                    if (FAST_DEVELOP_MODE) {
                        Util.appendError(`fast developer won't persist folder`)
                        continue;
                    }
                }
                Util.copySingleFile(from, dest, '', true);
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
        const path = Util.persistByPath(libpath.join(this.genRootPath, fileName))

        const base = this.getStringFromMustache('template.storage.mustache',
            {storageSuperUserUid: this.nodeOfAncestor.getStorageSuperUserUid()}).split('\n');
        const permissions = {};
        /** storageFolderPath : permission */
        const task = async (node) => {
            const folderName = node.getStorageFolderName();
            if (!Util.exist(permissions[folderName])) {
                permissions[node.getStorageFolderName()] = node.hasPermission() ? node.getStoragePermission() : node.getDefaultStoragePermission();
            } else {
                if (node.hasPermission()) {
                    permissions[folderName] = node.getStoragePermission();
                }
            }
        }

        await this.recursiveDoingOfNodeEachStruct((node) => node.isImageView() && node.hasStorageFolder(), task)
        const stmts = [];
        for(const name in permissions) {
            const _stmt = [];
            _stmt.push(`match ${libpath.join('/',name)}/{fileId} {`);
            const permission = permissions[name];
            for(const type in permission) {
                _stmt.push(`allow ${type}: if ${permission[type]}`)
            }
            _stmt.push(`}`);
            stmts.push(_stmt.join('\n'));
        }
        Util.insertToArray(base, Util.getIndexOfContext(base, SIGN_OF_COLLECTION_START), ...stmts);
        Util.appendFile(path, base.join('\n'), true, true);
        if (deploy) {
            Util.copySingleFile(path, this.nodeOfAncestor.getDirectoryName(), fileName, true);
            await Util.executeCommandLine(`cd ${this.nodeOfAncestor.getDirectoryName()} && firebase deploy --only storage:rules`);
        }
    }

    async generateFireStoreRules(deploy = true) {
        const fileName = 'firestore.rules';
        const path = Util.persistByPath(libpath.join(this.genRootPath, fileName))
        const base = Util.getFileContextInRaw(libpath.join(this.freeMarkerRootPath, 'template.firestore.rules')).split('\n');
        const stmts = [];

        const task = async (node) => {
            const _stmts = [];
            const path = node.getPath();
            const normalize = path.split('\/')
                .map((word) => word.startsWith(':') ? `{${Util.getNormalizedStringNotStartWith(word, ':')}}` : word).join('\/');
            const permission = node.getPermission();
            for (const each in permission) {
                _stmts.push(`allow ${each}: if ${permission[each]};`)
            }

            const wildcard = `{${node.getName()}}`;
            if (node.isObject()) {
                stmts.push(`match ${libpath.join('/', normalize, node.isCollectionPath() ? '' : 'attrs', wildcard)} {`, ..._stmts, '}');
            } else if (node.isArray()) {
                stmts.push(`match ${libpath.join('/', normalize, wildcard)} {`, ..._stmts, '}');
            } else {
                throw new ERROR(9999, `cant happened this condition ,name:${node.getName()}, type:${node.getType()}`);
            }
        }

        await this.recursiveDoingOfNodeEachStruct((node) => !_.isEmpty(node.getPath()), task)
        Util.insertToArray(base, Util.getIndexOfContext(base, SIGN_OF_COLLECTION_START), ...stmts);
        Util.appendFile(path, base.join('\n'), true, true);

        if (deploy) {
            Util.copySingleFile(path, this.nodeOfAncestor.getDirectoryName(), fileName, true);
            await Util.executeCommandLine(`cd ${this.nodeOfAncestor.getDirectoryName()} && firebase deploy --only firestore:rules`);
        }
    }

    async forAdmin() {
        Util.persistByPath(this.genRootPath);
        Util.copySingleFile(libpath.join(this.freeMarkerRootPath, 'admin.package.json'), this.genRootPath, 'package.json', true);
        Util.copySingleFile(libpath.join(this.freeMarkerRootPath, 'babel.config.js'), this.genRootPath, 'babel.config.js', true);

        const apiGenerator = new ClassGenerator(libpath.join(this.genSourcePath, `api`, `BaseAdminRemoteApi.js`));
        apiGenerator.appendClass('BaseAdminRemoteApi', {name: 'CommonRemoteApi', from: '../base/CommonRemoteApi'});
        apiGenerator.needIndexFile('AdminRemoteApi');

        const listenerGenerator = new ClassGenerator(libpath.join(this.genSourcePath, `listener`, `BaseAdminListenerApi.js`));
        listenerGenerator.appendClass('BaseAdminListenerApi', {
            name: 'CommonRemoteApi',
            from: '../base/CommonRemoteApi'
        });
        listenerGenerator.needIndexFile('AdminListenerApi');

        this.enrichNodes(...this.nodeOfAncestor.getComponents().map(component => component.struct))
        for (const component of this.nodeOfAncestor.getComponents()) {
            new RemoteFunctionHandler(apiGenerator, this.platform).buildFetchSubmitApi(component.getStruct(), true)
            new RemoteFunctionHandler(listenerGenerator, this.platform).buildListenerFunction(component.getStruct(), true)
        }

        await listenerGenerator.persist();
        await apiGenerator.persist();
        await this.generateFireStoreRules();
    }

    enrichNodes(...nodes) {
        for (const node of nodes) {
            if (node.isArray() && node.hasPath()) {
                const children = node.getPreciseAttributeChildren().map(child => child.getName().trim());
                if (!Util.has(children, 'id')) {
                    node.appendChildrenWithJson({
                        name: 'id',
                        type: 'string',
                        column: true,
                        description: '我是uid,不能被更改',
                        readOnly: true,

                    })
                }
            }

            if (node.isRestfulBean()) {

                node.appendChildrenWithJson({
                    name: 'status',
                    column: true,
                    description: '我是server處理完的結果, 回傳succeed/fail',
                    type: 'string', /** succeed, fail */

                })

                node.appendChildrenWithJson({
                    name: 'message',
                    column: true,
                    description: '我是server處理完的結果, 如果fail,reason就寫在這裡',
                    type: 'string', /** fail reason */
                })
            }

            if (node.isImageView() && node.needWatermark) {
                node.getParentObject().appendChildrenWithJson({
                    name: `${Util.camel(node.name, 'origin')}`,
                    type: `string`,
                    column: true,
                })
            }

            if (node.ref) {
                const targetName = node.ref;
                const _nodes = CodegenNode.finds(this.strcuts, (_node) => _.isEqual(targetName, _node.getName()))
                /** 目前先抓第一個當目標*/
                if (_.isEmpty(_nodes)) {
                    throw new ERROR(7004, `not found ref, ref value is ===> ${node.ref}`);
                }

                node.ref = _nodes[0];
                node.type = node.ref.type;
                /** 因為還沒機上 view的關係 所以不會產出view
                 *
                 * node.view = node.ref.view
                 * node.listView = node.ref.listView
                 * node.wrapView = node.ref.wrapView
                 * */
                if (node.independence) {
                    for (const raw of node.ref.node.children) {
                        node.appendChildrenWithJson(raw)
                    }
                }

            }
            this.enrichNodes(...node.getChildren());
        }
    }

    async forWeb() {
        const source = this.nodeOfAncestor;
        const structs = source.getComponents().map(component => component.getStruct());

        function getStmtsOfAfterSubmit(node) {
            if (node.needWatermark) {
                return `afterSubmit:(remoteUrls) => {
                ${node.getPreciseAttributeParentName()}.${Util.camel('set', node.getName())}(remoteUrls.watermark);
                ${node.getPreciseAttributeParentName()}.${Util.camel('set', node.getName(), 'origin')}(remoteUrls.origin);
                }`
            } else {
                return `afterSubmit:(remoteUrl) => ${node.getPreciseAttributeParentName()}.${Util.camel('set', node.getName())}(remoteUrl)`;
            }
        }

        function toEditorPageMode(node) {
            if (node.isColumnAttribute() && !node.isCollection()) {
                if (node.isImageView()) {
                    node.appendViewProps({
                        onClick: `###(param) => self.onImageEditorClicked({
                         needWatermark:${node.needWatermark ? 'true' : 'false'},
                         folderName:'${node.getStorageFolderName()}',
                         beforeSubmit:(localUrl) => ${node.getPreciseAttributeParentName()}.${Util.camel('set', node.getName())}(localUrl),
                         ${getStmtsOfAfterSubmit(node)}
                        })`
                    })
                } else {
                    node.setViewModified(true);
                    node.setOriginalView(node.getView());
                    node.setViewProps({});
                    node.setView('TextField');
                    node.appendViewProps({variant: `outlined`});
                    if (node.isReadOnly()) {
                        node.appendViewProps({
                            InputProps: {
                                readOnly: true,
                            }
                        })
                    }
                }
            }

            if (node.isView() && node.isAttribute() && !node.isCollection() && !node.isColumnAttribute()) {
                /** 就是把不是遠端欄位的UI給刪掉 */
                delete node.view;
            }

            if (node.isArray()) {
                if (Util.isOrEquals(node.getListView(), 'Fade', 'Grid')) {
                    node.setListView('div');
                }

                if (Util.isOrEquals(node.getView(), 'Fade', 'Grid')) {
                    node.setView('div');
                }

                node.setWrapView('div');
                node.appendWrapContents([`{this.renderItemEditorView(
                   ${node.getFunctionNameOfItemEditorWithParam()} , ${_.toString(node.hasPath())}
                )}`]);
                const style = {borderStyle: 'solid', borderWidth: '1px', margin: '10px', borderRadius: '10px'}
                node.appendWrapStyle({...style, borderColor: 'red'});
                node.appendListStyle({...style, borderColor: 'blue'});

                node.appendListContents([`{this.renderCollectionEditorView(
                   ${node.getFunctionNameOfCollectionEditorWithParam()}, ${_.toString(node.hasPath())} 
                )}`]);
            } else if (node.isObject() && node.hasPath()) {
                node.setWrapView('div');
                const style = {borderStyle: 'solid', borderWidth: '1px', margin: '10px', borderRadius: '10px'}
                node.appendWrapStyle({...style, borderColor: 'green'});
                node.appendWrapContents([`{this.renderObjectEditorView(
                   ${node.getFunctionNameOfCollectionEditorWithParam()}, ${_.toString(node.hasPath())} 
                )}`]);
            }

            node.clearContents();

            for (const child of node.getChildren()) {
                if (!!!child.editIgnore)
                    toEditorPageMode(child);
            }
        }

        function getEditorComponents() {
            /** 先把edit component 做好放到components */
            const editorComponents = [];
            for (let component of source.components) {
                if (component.needEditPage()) {
                    if (component.needEditPage()) {
                        const editorComponent = _.cloneDeep(component);
                        editorComponent.setTitle(`${editorComponent.getTitle()} editor`);
                        editorComponent.setEvents([]);
                        editorComponent.setIsEditPage(true)
                        editorComponent.setPath(editorComponent.getPath() + `editor`);
                        editorComponent.getStruct().setOriginalName(editorComponent.getStruct().getName());
                        editorComponent.getStruct().setNameModified(true);
                        editorComponent.getStruct().setName(Util.camel(editorComponent.getStruct().getName(), 'editor'))
                        toEditorPageMode(editorComponent.getStruct());
                        editorComponents.push(editorComponent);
                    }
                }
            }
            return editorComponents;
        }

        const totalClassNames = [];
        const totalEvents = [];
        source.components.push(...getEditorComponents());
        this.enrichNodes(...structs)
        for (let component of source.components) {
            if (FAST_DEVELOP_MODE && !_.startsWith(component.getName(), TARGET_COMPONENT))
                continue;

            const {classNames, events} = await new ComponentBuilder(this.props).buildBaseComponent(component);
            totalClassNames.push({component, classNames});
            totalEvents.push(...events);

            if (!component.isEditPage() && component.getStruct().isAttribute())
                await new StoreBuilder(this.props).buildBaseStore(component.getStruct());
        }


        /** 因為 用到 method getGenStores(),stores 要等 gen出來才知道, 必須放在這邊 */
        await new StoreBuilder(this.props).buildStoreIndexFiles();
        await new AppBuilder(this.props).buildWebpackNPackageJson(source);
        await new AppBuilder(this.props).buildRouterFile(source);
        await new AppBuilder(this.props).buildCookieFiles(source);
        await new AppBuilder(this.props).buildEventFolder(totalEvents);
        await new AppBuilder(this.props).overrideLessFile();
        await new AppBuilder(this.props).buildLessFile(totalClassNames);
        await new AppBuilder(this.props).buildStyleFiles(totalClassNames);
        await new AppBuilder(this.props).buildHtmlIndexAssetsFile();
        await new AppBuilder(this.props).buildAppIndexFiles(source);
        this.buildDistAssetFolder();
    }

    buildCustomizePackages = async () => {
        await new AppBuilder(this.props).buildCustomizeFiles(
            this.nodeOfAncestor.getCustomizePackages().filter((each) => _.isEqual(each.platform, this.platform)));
    }

    async execute() {
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
        await this.buildCustomizePackages();
        await this.buildConfig(this.nodeOfAncestor);
        this.overrideEachFilesFromFolder(
            `common.style.js`
            , `app.style.js`
            , `mobile.style.js`
            , `common.less`
            , `app.less`
            , `mobile.less`
            , {
                type: 'extension',
                keyword: 'svg'
            }, {
                type: 'extension',
                keyword: 'png'
            }
        );
        await this.removeEmptyFolder();
        await this.runInstallIfNeed();
    }

    async removeEmptyFolder() {
        for (const file of Util.findFilePathBy(this.genSourcePath)) {
            if (Util.isEmptyFile(file.absolute)) {
                const shouldDeletedFolder = Util.getFileDirPath(file.absolute);
                if (fs.existsSync(shouldDeletedFolder)) {
                    await Util.deleteSelfByPath(shouldDeletedFolder, true);
                }
            }
        }
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


class BuildApplication {

    genRootPath;
    projectRootPath;
    freeMarkerRootPath;

    constructor(object = {genRootPath: './gen/', projectRootPath: './', freeMarkerRootPath: '../'}) {
        this.genRootPath = libpath.resolve(object.genRootPath);
        this.projectRootPath = libpath.resolve(object.projectRootPath);
        this.freeMarkerRootPath = libpath.resolve(object.freeMarkerRootPath);
        this.init();
    }

    init() {
        if (!fs.existsSync(libpath.join(this.projectRootPath, 'source.js'))) {
            throw new ERROR(8019, `you should put source.js in ${libpath.resolve(this.projectRootPath)}`)
        }
    }

    getBuildObject = (platform = 'web') => {
        return {
            freeMarkerRootPath: this.freeMarkerRootPath,
            genRootPath: this.genRootPath,
            projectRootPath: this.projectRootPath,
            platform
        }
    }

    async buildWeb() {
        const web = new ProjectFileHandler(this.getBuildObject('web'));
        await web.execute();
        Util.appendInfo(
            `web done`
        );
    }

    async buildAdmin() {
        const admin = new ProjectFileHandler(this.getBuildObject('admin'));
        await admin.execute();
        Util.appendInfo(
            `admin done`
        );
    }

    async buildStorageRule() {
        const handler = new ProjectFileHandler(this.getBuildObject('admin'))
        await handler.generateStorageRules();
    }

    async overrideFiles(platform = 'web') {
        const handler = new ProjectFileHandler(this.getBuildObject(platform));
        handler.overrideEachFilesFromFolder(
            `common.style.js`
            , `app.style.js`
            , `mobile.style.js`
            , `common.less`
            , `app.less`
            , `mobile.less`
            , {
                type: 'extension',
                keyword: 'svg'
            }, {
                type: 'extension',
                keyword: 'png'
            }
        );
        Util.appendInfo(
            `build ${platform}/src/base/... succeed!`
        );
    }

    async persistent(platform = 'web') {
        const handler = new ProjectFileHandler(this.getBuildObject(platform));
        handler.persistBaseFilesToFreeMarkerTemplate();
        handler.persistCustomizePackages()
        handler.persistImageFolder();
        handler.persistIndexAndLessFiles();
        handler.persistLessLibs();
    }

}

// const FAST_DEVELOP_MODE = true;
const FAST_DEVELOP_MODE = false;
const TARGET_COMPONENT = 'main';

export {BuildApplication as BuildApplication};

if (configer.DEBUG_MODE) {

    (async () => {
            const props = {
                genRootPath: '../gen',
                projectRootPath: './sample',
                freeMarkerRootPath: '/Users/davidtu/cross-achieve/high/idea-inventer/free_marker/template'
            }

            const builder = new BuildApplication(props)

            switch (Util.getNodeEnvVariable('type')) {
                case 'adminOnly':
                    await builder.buildAdmin();
                    break;
                case 'webOnly':
                    await builder.buildWeb();
                    break;
                case 'persistentBuild':
                    await builder.persistent('web');
                    await builder.persistent('admin');
                    await builder.buildWeb();
                    await builder.buildAdmin();
                    break;
                case 'persistent':
                    await builder.persistent('web');
                    await builder.persistent('admin');
                    break;
                case 'less':
                    await builder.buildWeb();
                    break;
                case 'buildAllPlatform':
                    await builder.buildWeb();
                    await builder.buildAdmin();
                    break;
                default:
                    // console.log('default')
                    await builder.buildStorageRule();
                    break
            }


        }
    )();
}
