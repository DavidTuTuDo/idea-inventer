/**
 * codegen-node.ts
 *
 * 功能說明：
 * CodegenNode 是整個 Code Generator 的核心資料模型。
 * 負責將 source.js 中的 JSON 節點結構「豐富化 (enrich)」成可操作的節點物件。
 * 每個節點既是 UI 組件也是資料欄位，透過遞迴樹狀結構描述整個專案的元件層級。
 *
 * 主要職責：
 * - 解析 source.js 的 JSON 結構，為每個節點建立 parent/children 關聯
 * - 根據節點 type (string, number, array, object...) 提供對應的型別判斷方法
 * - 產生 Store/Component/Router 所需的函式名稱、路徑字串、預設值
 * - 支援 ref (節點複用)、incest (層級跳轉)、cheap (成本優化) 等進階模式
 * - 管理 Firestore 權限規則、索引設定、Cloud Functions 定義
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

class CodegenNode {

    /**
    * davidtu-dev的firestore位置在nam5，這已經沒辦法改變了。只能用mailStore
    * 如果有其他專案也遇到這個問題就要在firestore新增一個firebase-id = 'deliver'
    * */
    useMailStore = false;

    /**
     * 如果是一開始就載入的component要記得useLazy=false
     * 用來降低bundle的main.js的檔案大小 => React.Lazy
     */
    useLazy = true;


    /**
     * 很多TextField都需要存在cache，或是遠端保存。
     * 1.TextField在onChange時，把直設定進去專屬的cookie位置。
     * 2.在componentDidMount時將cookie的值寫進去。（需注意override的store有沒有覆蓋再覆蓋）
     */
    useCache = false;

    /**
     * 開發期間，line dapp時，需要一個tunnel跳轉回0.0.0.0:8080 或者 0.0.0.0:5001(網頁)，節省functions一直部署到遠端做測試
     * 目前是用localXPose去起一個限時的tunnel。或者就要開另一台電腦用免費的ngrok
     * */
    useXTunnelDev = false;

    /** 如果要玩line登入(在line webview打開就能拿到userToken->無縫登入那樣)，就必須要到
     *  https://developers.line.biz 申請provider -> 再申請 login channel */
    liffId;

    /** 用來拿user idToken用的agent id */
    liffChannelId;

    /** 企業色，可以在每個專案裡面設定客製化 */
    colorX = '#1877F2';

    /** storage上傳檔案時都必須限制單個檔案大小 */
    fileMaximum = '5MB'

    /** 第一次部署functions(gen2)之後會產生一個隨機碼，這會用來組成url */
    randomHashOfFunc = 'abcdefghijk'

    /** collection寫入firestore indexes的依據 */
    idxes;

    /** 沒有要成為indexes到欄位，就放到override */
    ignoreI = false;

    /** firebase firestore 設定的伺服器位置 */
    locationOfFirestore= "us-central1";

    /** firebase functions 設定的伺服器位置 */
    locationOfFunctions= "us-central1";

    /** storage(圖片/檔案/音訊) 存放的位置，firebase有提供免費site*/
    locationOfStorage= "us-central1";

    /**
     * google all Oauth頁面都要認證，要到這個網站拿token
     * https://search.google.com/search-console/welcome
     * 例如以下：放到index.js 的 <header />
     * <meta name="google-site-verification" content="MSjPnPz3Sen5MCF1az8dkRVlm8fk80JyxvZveXYPNkM" /> */
    verification;
    /**
     * 如果  path: `/gaia/:pid`,
     * <ObservedDionysusGaia key={`${pid}`}  pid={pid} {...props} />;
     * 如果url變動了，pid就會改變，造成component re-render
     * 不想re-render，就要 disableKeyOfRoute = true;
     * */
    disableKeyOfRoute = false;

    /** 一般情況下，img點擊後都會的有的preview dialog，不想要的話就把imgPreview = false*/
    imgPreview = true;

    /** products/{productId}       ← 父 document
        └── {productId}/variants/{variantId}   ← 讓api產出batch submit product和variants */
    hasFatherHood = false;

    /** 用來取代原本component的props，屬於source級別的設定，例如 要把epay設計為首頁: epay: {path:''}*/
    setsOfComponentProp = {}
    // {
    //      componentName1:{ path: "./", }, componentName2:{title:'新的首頁名'}
    // }

    /** 如果父類是object，其子類包含object | array，就會在遠端製造出一個屬性，例如AutoComplete 會建造出 suggestXXX，這些都應該必須要有個選擇性措施去決定遠端的database，避免遠端存入過大的資料 */
    disableOfColumn = false;

    /** 讓AutoCompete初始化就使用Fuse()*/
    autoFuse = false;

    propsOfIcon = {};
    /** iconButton 有設定icon={} 時，可以inject props進去給<icon ...props /> */

    propsOfBadge = {};
    /** iconButton 有設定badge={true} 時，可以inject props進去給<Badge ...props /> */

    scrollable = false;
    /** 如果MUI Tab是可滾動的，就設為true */

    price = false
    /** 如果是幣值，就會用Util.formatPrice() */

    /** 可以在component mount之前放進去store裡面，例如list view -> detail view用同一個bean就可以不用再fetch一次 */
    presetParam = false;

    hideGeneratedAnnouncement = false;

    computed = false
    /** 在component 的get${functionName} 會產出 getComputed${node.getName()}*/

    disableOfHtmlScale = false
    /** RWD應該不准讓使用者可以縮小，所以HtmlScale會設為1，但有些只想做電腦網頁的視覺，就讓他true(大鼎初期) */

    typeOfTextField = '';
    /**
     * TextField 類型定義與自動填充配置
     *
     * 本系統提供多種 TextField 類型以支持不同的表單欄位需求，並透過瀏覽器的自動填充功能提升使用者體驗。
     *
     * 電子郵件欄位（email）用於填寫使用者的電子郵件地址，瀏覽器會記住並建議之前輸入過的 email，使用者無需重複輸入。
     *
     * 姓名欄位（name）用於填寫使用者的真實姓名，瀏覽器會記住並建議之前輸入過的姓名，方便快速填寫個人資訊。
     *
     * 電話欄位（tel）用於填寫使用者的手機或電話號碼，瀏覽器會記住並建議之前輸入過的電話號碼，提高表單填寫效率。
     *
     * 地址欄位（address）用於填寫使用者的街道地址，瀏覽器會記住並建議之前輸入過的地址，減少重複輸入的麻煩。
     *
     * 郵遞區號欄位（postal-code）用於填寫使用者的郵遞區號或郵編，瀏覽器會記住並建議之前輸入過的郵遞區號。
     *
     * 帳號名稱欄位（username）用於填寫使用者的登入帳號，瀏覽器會記住並建議之前輸入過的帳號名稱，加快登入流程。
     *
     * 密碼欄位（password）用於填寫使用者的登入密碼，系統使用 "current-password" 機制讓瀏覽器能安全地建議已儲存的密碼，同時保護使用者隱私。
     *
     * 預設欄位在沒有特定類型指定時使用，呈現為標準的文字輸入框。
     *
     * 所有欄位均配置雙層自動填充屬性（slotProps 與 inputProps），確保在各種情況下都能正確傳遞到底層的 HTML input 元素，提供最佳的跨瀏覽器相容性。
     */

    idOfProject = ''
    /** firebase上專屬的id好，這才能deploy 到雲端專案的uid，還有function組合的request/httpOnCall url都要看這個碼，早期的都是看name*/

    autoplay = {
        delay: 0,
        disableOnInteraction: false,
    };
    /** 用來作為swipe autoloop的欄位*/

    color;
    /** 用在Button Chip */

    singleLine = false;
    /** 用在TextField不要產生換行行為 */

    /**
     * 定義在structs那一層
     * { sample:'範例',example:'超級範例' }
     **/
    textsOfI18n = {};

    /** 用於時間moment的time format 例如 YY/MM/DD */
    format = '';

    virtual = false;
    /** 目前的alertDialog架構是基於一個view，但很多情況是由ref.open()去渲染出dialog，view的產生就很雞肋，所以virtual可以==true，尤其是捲軸畫面，每個item都渲染renderDialog太浪費dom了*/

    /**
     * 檢查是不是extra component，會造成 i18n duplicated
     * */
    isExtraComponent = false;

    listOfImplementsOfAlertItemClicked = [];
    /** AlertMenu的 items,在點擊後的事件實作 */

    /** 如果 Typography 只有一個value，想要偷懶的加上Label 和icon 可以這樣做 */
    labelView = {
        enable: false,
        defaultValue: ``,
        labelIcon: {
            enable: false,
            view: `PhoneOutlined`,
            props: {},
        }
    }

    defaultLabelViewIcon = {
        enable: false,
        defaultValue: ``,
        labelIcon: {
            enable: false,
            view: `PhoneOutlined`,
            props: {},
        }
    }
    email = '';
    /** firebase 的註冊帳號，用來切換身份deploy|rules */

    inputRegEx = '';
    /** TextField有時書入帶碼會是 00153，他不屬於number但卻只能輸入0-9 */

    size = '';
    /** autocomplete textField 會用到*/

    margin = '';
    /** TextField有這個欄位 */

    /** 利用outer,view child的方式,增加一個label概念 姓名: David*/

    valueOfTabDefault = '';

    useCopyRightView = {enable: true, view: 'infoOfCopyRight'};

    l10n = false;
    /** 代表這個欄位要做i18n功能,怕命名和codegen的i18n打架, 所以取名叫l10n */

    isCommonModule = false;
    /** 強轉成 component module*/

    componentsOfExtra = [];
    /** component module裡面可以再放components, 讓一系列相同概念的邏輯可放在一起 */

    deployToRemote = true;
    /** 用來控制cloudfunctions要不要部署到遠端 */

    isRegularResponse = true;
    /** 用來控制cloudfunctions傳是否為{succeed:boolean, data:Object}
     *
     * 若為false, 回傳 method();
     * */


    modulesOfIgnore = [];
    /** 要忽略的 componentModule(...epay,navigator,account) */

    alertMenu = {
        items: [] /** {icon:'MUI的icon代號',name:'download',notice:{title:'',content:''},loginOnly:false} */
    }

    icon
    /** 在iconButton 和 Button都有作用 */

    badge = false;
    /** iconButton需要Badge count 的設計 */

    iconOfDeleted
    /** 用在<Chip /> */

    checkedIcon = ''
    /** Checkbox 用到的屬性 */

    nodeOfOrigin = undefined
    /** 如果用到ref 要拿到原始節點 */

    implementActions = false;
    /** 如果ref對象是一個component,會有onClick, injectStyle事件, 可以選擇要不要產生override的method */

    imitate = false;
    /** 如果是ref,然後把整個節點給取代掉 */

    maxSizeOfFetchItem = MAXIMUM_DOCUMENTS_PER_FETCH;
    /** 一個collection 最多能拿的比數, 不然邏輯沒寫好, client端就能把一整串collection給download下來 */

    disposablePage = true;
    /**
     *  一次性(disposable)的頁面, 像是搜尋列表, 隨著param有不同的響應, 會在routeToPage時 re-new store()
     * */

    labelOfSwitch;
    /** view為simpleSwitch時, 顯示的label */

    label;
    /** 用在autoComplete TextField*/

    skeleton = {
        enable: true,
        variant: 'rectangular',
    };
    /** loading的時候出現的類似等待中的loading 樣式, 目前支援path array */

    cheap = false;
    /** type = array 而且有path 的話, 會製造出太多document, fetch all的話就會花太多費用, 像是keywords, 或是首頁的banner
     *  不需要用 firestore compound queries function 的就應該設計成這樣.
     * */

    search = false;
    /** 讓手機(android ios)keyboard產生搜尋按鈕,  產生onXXXSearchPress(), */


    /** Switch之類的元件 在onChange會更動store setter,如果要disable, 要設為true*/
    disableOnChangeSetter = false;

    injectViewProp = {
        name: '',
        functionalized: false
    }
    /** 如果child view是定義在props
     * 例如 <FormControlLabel label=<TypoGraphy item={child}/>,就要定義在這裡
     *
     * injectViewProp = {
     *  name:'label',
     *  functionalized =>  <FormControlLabel label=(param)<TypoGraphy item={child,param}/>
     * }
     *
     * */

    /** Chip,Button的畫面屬性 */
    variant;

    /** 用來至底的infoCopyRight view */
    isCopyRightView = false;

    /** 用來至頂的infoCopyRight view */
    isNavigatorView = false;

    methods = [];
    /** [...{params = [],functionName = 'string',loginOnly = false}]
     *
     * 如果要建立override的method,就在這裡加上
     * */

    /** 用套件會需要相對應的import
     * {part:'',from:'swiper/css/pagination'}
     * {part:'',from:'swiper'}
     *
     * */
    stmtsOfImport = [];

    /**
     * { testButton: true } node.getParentNode()必須是container
     */
    testButton = false;
    /** 就是在collection view 加一個測試按鈕*/

    needDetail;
    /** 當type === array, 而且想獲得uidOfDetail,必須加上這個屬性*/

    detailPage;
    /** 想要產出path/{uidOfDetail}/的概念*/

    genRootPath
    /** 專案產出的位置 */

    rapidBuild = {
        enable: false,
        componentName: 'WhatTheHell' // 可以是string | array
    }
    /** 快速 debug 的build 設定,componentName就是只會build的 component */

    shadow = false;
    /** 目前是為了用來img可以再editor模式時, 能後產生 TextField來加快編輯效率, 一個observable欄位產生出兩個響應的view */

    raw;
    /** 沒有被enrich的node*/

    ecpay = {};
    /** 放ecpay的資訊 */

    linepay = {};
    /** 放linepay secret info */

    schedule
    /** firebase-function 的規則 'every 2 minute' */

    anchor
    /** 1.用於swipeableDrawer 的開啟位置 [top,bottom,left,right]
     *  2.用於Button加上icon的位置[start,end]
     * */

    enums = {}
    /** 顧名思義 a:{b:1 c:2}*/

    cloudFunctions
    /** 用來定義serverless的functions
     *
     * type : [httpOnCall,schedule,httpOnRequest]
     *
     {
     name: 'checkoutByByECPay',//functions.pubsub.schedule('every 5 minutes').onRun(async (context) => {})
     type: 'httpOnCall',//functions.https.onCall(async (data, context) => {}) context 裏面有uid 或登入資訊
     description: '用ECPay付費',
     },
     {
     name: 'confirmedByByECPay',//functions.pubsub.schedule('every 5 minutes').onRun(async (context) => {})
     type: 'httpOnRequest',//functions.https.onCall(async (data, context) => {}) context 裏面有uid 或登入資訊
     description: 'ECPay收到款項後,回呼叫的api,裡面會將order改成succeed,扣掉庫存,消費者拿到應有的權利',
     isRegularResponse: false, //用來控制回傳不要是{succeed, data:}
     },
     {
     name: 'autoIncrementNumber',//functions.pubsub.schedule('every 5 minutes').onRun(async (context) => {})
     type: 'schedule',
     schedule: 'every 4 hours' // support hours,min,
     },

     * */

    password;

    components;
    /** source.js裡面的 requirement */

    loginOnlyPage = false;
    /** 就是進入這些頁面必須是login,寫在 BaseMyRouter裏面,component level的設定 */

    loginRequiredAlert = false;
    /** 執行按鈕按鈕需要 login 就會給提示 */

    needEditorBase = false;
    /** true 就會繼承BaseEditorComponent */

    selectImageButton = false;
    /** 產生出 add image button */

    injectView = false;
    /** 產生出 injectView function 可以override */

    injectWrapView = false
    /** 產生出 injectWrapView function 可以override */


    listEmptyTip = {enable: true, customView: undefined, stringOfTip: '', isDefaultValue: true};
    /** 當陣列需要有無資料提示時
     *
     * customView 和 stringOfTip還沒實作
     * isDefaultValue 代表在source.js裡面沒有定義過
     * */

    /** 讓一些type 是 number, 有一個懶人的increment submit method*/
    increment = {
        enable: false,
        delta: 1,
    }

    routeHash = false;
    /** 如果route後面想加個hash混淆,也能避免chrome會有cache頁面的問題 */

    index = {enable: false, rule: 'CONTAINS'}
    /** 'CONTAINS', 'DESCENDING', 'ASCENDING' */

    select; //{type:'button', defaultValue: undefined, values:[]}
    /**
     * type = spinner|button|radio
     * values= [...{label:'one',value:'1'},{label:'two',value:'2'}]
     * defaultValue= '1',
     *
     * listProps
     type== radio可以listProps ｛ row: true}

     type==spinner 可以 listProps: {
     label: "選擇科目",
     select: true,
     color: "primary",
     },
     *2022/03/31筆記有註記
     * MUI底下設計的select是看不懂被observer包裝過的元件, 所以array的子類們, 不會用observer修飾 2021/11/08 筆記有相繫
     * */

    needImageDialog = false;
    /** 點擊後自動會開啟image dialog */

    disableInitFetch = false;
    /** 取消 初始畫面就發出fetch request */

    superUserUid = "uid";
    /** storage因為沒有辦法進去firestore去拿isAdmin, 必須hardcode uid*/

    restful = false;
    /** 就是這個物件會多出 有 status, message, 讓server處理可以加上狀態, 以便在client顯示出提示
     * 會在store裡多這兩個屬性
     * {
     *     status:succeed || fail
     *     message: fail reason
     * }
     * */

    ruleOfOuter = 'start';//['start','end']

    paginate;
    /** {threshold:10, size:6} ,array專用 可以指定page size, 觸及底部的threshold(就是距離底部多少就要觸發下一頁,預設是1) */

    conditions = [];
    /** firestore compound 的query敘述句
     *
     * array裏面放的就是firestore裡的 Query operators 例：
     * key 是指 operator type, 用來sorting的
     * { type:'where', params:['year','==', 108] }
     * */

    textOfWatermark;
    /** 用來當作浮水印的字樣 */

    needWatermark;
    /** 表示上傳時需要浮水印功能,目前只能用在img上 */

    directory;
    /** 用來提示deploy 的 folder path*/

    ref;
    /** 用來標記這個node的內容, 免得重複的再type一遍 */

    independence = false
    /** 用來標記這個node的如果是ref,會在把source在Codegen.enrich之前就取代掉independence的節點 */

    mother;
    /** 註記陣列的位址, 用來獲得 indexOfCollection*/

    indexOfCollection;
    /** enrich的時候, 因為遞迴是由最小單位, 被enrich的 parent 的address還沒被產生出來, 所以先記parent的index,然後把parent指為[]  */

    isScrollingHide;
    /** 註記AppBar 要隨著scroll hide */

    readOnly = false;
    /** 用來標示這個遠端的欄位在client端只能讀取, TextField也會readOnly */

    storageFolder;
    /**  default path public 用來標記圖片上傳到storage哪個資料夾 */

    path;
    /** 用來當Router,記得記得字首要有slash */
    /** 用來當作Router的導頁網址, 如果用在struct裡面就是當作remote api的url , */
    /** path:`/purchaseSucceed/:transactionId?/:orderId?` ?代表這個值可有可無 */

    column = false;
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

    editIgnore = false;
    /** 用來提示這個node不要被editlize給處理到 */

    editor;
    /** 用來提示這個component需要產生編輯頁面(EditableComponent) */

    originalView;
    /** 當被改成editMode之後 還是要有可以找到原始的view, 因為我會把type是string||number 強制把view改成TextField */

    originalName;
    /** 當被改成editMode之後 還是要有可以找到名字 */

    viewModified;
    /**  在editMode下, 如果被改過View, 這邊就會是true */

    nameModified;
    /** 在editMode下, 如果被改過View, 這邊就會是true */

    isEditableComponent = false;
    /** 用來註記是一個edit component,edit component是指一個把一個UI改成編輯頁面的功能, 不需要再另外刻畫一個*/

    params;
    /** 目前用來做events 帶的參數 */

    description;
    /** 解釋這個node欄位的意義, 也能當作TextField的解釋 */

    host = {dev: '', prod: ''};
    /** 網域名稱啦 */

    initFetchOnlyLogin;
    /** 有些store的field不需要在new的時候就fetch, 就設定為true*/

    events;
    /** 用來定義可以發送的event, 製造interface */

    platform;

    cookies;
    /** {name,type:object|string }對應到web使用的cookie, 我設計的cookie會加密，用瀏覽器看不出個毛
     type是object 就是拿出來再幫你JSON.parse(...)
     */

    wrap;
    /** 在view外面包一層div,作為彈性的使用 */
    /** 當view的種類不是container(paper,card,div之類的), 但是getPreciseViewChild()還有child時, 就自動放到 wrap 裡面*/

    outer;
    /** 搭配wrap服用的屬性, 可以放在wrap那一個圖層的效果 */

    listOuter
    /** 搭配ListWrap服用的屬性, 可以放在ListWrap那一個圖層的效果 */

    simpleProps = [];
    /** 有些props沒有key <View {...params} 就要定義在這裡*/

    props = {};
    /** 用在加上view額外的props,<div ...props/> */

    wrapProps = {};
    /** 當wrap是true時,用在加上wrap額外的props,<div ...props/> */

    listProps = {};
    /** 用在加上Array的Container額外的props,<div ...props/> */

    listWrapProps = {};
    /** 用在加上Array Container額外再包一層的props,<div ...props/> */


    injectStyle = false;
    /** 如果有style的屬性需要透過邏輯判斷,就設為true,這樣會產出method */

    injectWrapStyle = false;
    /** 如果wrap有style的屬性需要透過邏輯判斷,就設為true,這樣會產出method */

    injectListStyle = false;
    /** 如果array有list style的屬性需要透過邏輯判斷,就設為true,這樣會產出method */

    injectListWrapStyle = false;
    /** 如果array有list wrap style的屬性需要透過邏輯判斷,就設為true,這樣會產出method */

    injectProps = false;
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

    title = '';
    /** 用在網頁上的大標題 */

    url;
    /** 如果物件有對應到資料庫,就可以指定 */

    parent;

    click = false;

    /** wrapView需要Click事件時*/
    wrapClick = false;

    deleted = false;

    defaultValue;
    /** 可以指定attribute的default value */

    struct;

    admin;

    /**
     * 目前機制有設計為1.ConfirmDialog 和 2.CustomViewDialog
     * 1.當有些按鈕需要double check, 必須搭配wrap:true 使用 alertDialog:{ content:string, title:string }
     * 2.當dialog是customView {  customView:functionName, needActionButtons:false },
     * customView 會拿到 {dialog,paramObject} 的 this.getProps(),
     * 所以可以在customView裡面控制dialog, 然後有個paramObject也會傳遞到CustomView可以用
     * paramObject預設會是點擊事件的parent node.
     *
     **/

    alertDialog;

    independentClick = false;
    /** 如果是Button 產生fieldName 給 refOfReactRef() 可以 ref.current.click()/close()*/

    defaultAlertDialog = {
        customView: undefined,
        /** 指component的className */
        needActionButtons: true,
        /** 是否需要dialog預設的按鈕功能 */
        title: '',
        content: '',
        component: this,
        /** 在dialog裡面的view 會拿不到history, 會造成無法導頁, 所以要把喚起dialog的 component instance 帶進去 */
        paramObject: 'some object',
        /** 帶入到customView 裡面的變數 */
        useRefOnly: false,
        /** dialog只需要用ref.open()，所以不用把 觸發(view) 畫出來*/
        textInput: {
            value: '', /** 輸入框的預設值 */
            enable: false,
            type: 'text', /** email,phone,*/
            label: '輸入的範例', /** */
        },
        /** 如果要產生button按下去之後，可以輸入textField的alertDialog */
        enableCancel: true,
        /** 取消鍵的控制，例如合約型態的就enable=false **/
        fullWidth: false,
        /** 讓dialog可以橫幅滿版，不然web最多到600px,mobile最多到350px **/

        presetObj: false,
        /** 像 ireneQrcode，可以透過預設參數打開畫面，不要每次都用cookie=>function實作在呼叫dialog的component
         *                 alertDialog: {
         *                     customView: "ireneQrcode",
         *                     needActionButtons: false,
         *                     presetObj: true
         *                 }
         *                 component => getPresetObjOfIreneQrcode() {
         *                    console.log(`我是被需要才被呼叫到的QQQQ`);
         *                    return { href: "https://tw.yahoo.com/?p=us", title: "測試Title", content: "測試content" };
         *                 }
         * */

        deleted: false,
        /** 放在onDeleted的邏輯裡,目前只有Chip*/

        globalOfRef: false,
        /** 把ref放到global */

        strict: false,
        /** 讓彈跳視窗不能用ESC或點擊旁處取消 */

        useCustomCancel: false,
        /** dialog都有自帶sticky button => 如果要客製化自己的cancel button(dading/establish)就要true它 */

        callback: false,
        /** dialog帶一個當前呼叫它的component內的callback function */
    };
    /** 放admin的json file*/

    customizes = [];
    /**
     *  如果src目錄下要有完全手寫的package,就夾在這裡面, 這個folder底下所有的檔案都會被persistent
     *   {name: 'template', platform: 'functions', root: './', index:true }
     *   {name: 'userInfo', platform: 'web', root: './src', index:false},
     *  index的boolean => 是指要不要gen出index.js
     **/

    /**
     * 設計那種children不能被observeble包住的狀況，他就必須待在array裏面(EX1:Swiper,EX2:Tabs|Tab)
     * (O)<Swiper
     *        items.map(item =>
     *              <SwiperSlide
     *                  ...children
     *
     *  (X) <Swiper
     *        <MainBannerImageDivWrapView />
     *
     *   <MainBannerImageDivWrapView />
     *      <SwiperSlide />
     * */
    disableObservable = false;

    border = true;
    /** TextField 的 filled會有 圓弧 */

    disabled = false;
    /** TextField 的 disabled input */

    helperText = '';

    /** TextField用的屬性，在框框開始結束增加提示文字或icon
     *  支援start和end的文字或mui icon
     *
     *
     * */
    helperVisual = {}

    defaultOfHelperVisual = {
        enable: false,
        /**
         *start: {
         type: 'icon',  使用 mui icon
         content: 'MenuRound',
         click: false,
         },
         end: {
         type: 'text',
         content: '$',
         click: false
         }
         */
    }

    belong2TimeDatePicker = false

    /** 用於註記這個TextField用來修飾AutoComplete*/
    belong2AutoComplete = false

    belong2TimeStamp = false

    /** 屬性放到firestore 會 trim()，幫助搜尋遇到空格不符合的問題 */
    trim = false;

    forceServerTime = false
    /** 有些時間欄位怕被開發者模式竄改，所以設計上傳時候用serverTime，例如createTime, updateTime */

    self = this;

    useServerTime() { return this.isTimeStamp() && Util.isEqual(this.forceServerTime, true); }

    asTrim() { return Util.isEqual(this.trim, true); }

    hasVariant() { return !Util.isEmpty(this.variant); }

    isBelong2TimeStamp() { return this.belong2TimeStamp; }

    disableBorder() { return Util.isEqual(this.border, false); }

    disableInput() { return Util.isEqual(this.disabled, true); }

    getVariant() {
        return this.variant ?? 'outlined'
    }

    getSize() { return this.size ?? 'medium'; }

    getMargin() { return this.margin ?? 'normal'; }

    getRuleOfOuter() { return this.ruleOfOuter; }

    isAlertDialogNeedGlobalRef() { return this.getAlertDialog().globalOfRef; }

    isDisposablePage() { return this.getNodeOfComponent().disposablePage; }

    getSpecificComponent(nameOfComponent) {
        const node = this.getNodeOfSource();
        return _.find(node['components'],
          (component) => Util.isEqual(component.name, nameOfComponent))
    }

    getPresetAttributes() {
        const attrs = _.filter(this.getNodeOfStruct().getPreciseAttributeChildren(), (each) => each.isPresetParam());
        return Util.isUndefinedNullEmpty(attrs) ? [] : attrs;
    }

    isBelong2TimeDatePicker() { return this.belong2TimeDatePicker; }

    hasSize() { return this.size && !Util.isEmpty(this.size); }

    hasMargin() { return this.margin && !Util.isEmpty(this.margin); }

    isBelong2AutoComplete() { return this.belong2AutoComplete; }

    hasIcon() { return !Util.isEmpty(this.icon); }

    getIcon() { return this.icon ?? ''; }

    needBadge() { return Util.isEqual(this.badge, true); }

    hasIconOfDeleted() { return !Util.isEmpty(this.iconOfDeleted); }

    getTypeOfTextField() { return this.typeOfTextField; }

    beingScrollable() { return Util.isEqual(this.scrollable, true); }

    hasTypeOfTextField() { return !Util.isEmpty(this.typeOfTextField); }

    getIconOfDeleted() {
        return this.iconOfDeleted ?? 'DeleteRounded'
    }

    isPresetParam() { return Util.isEqual(true, this.presetParam); }

    isDisableOfColumn() { return Util.isEqual(true, this.disableOfColumn); }

    hasCheckedIcon() { return !Util.isEmpty(this.checkedIcon); }

    getCheckedIcon() { return this.checkedIcon ?? ''; }

    getHelperVisual() { return Util.merO(this.defaultOfHelperVisual, this.helperVisual); }

    hasHelperVisualSupportAlertMenu() {
        const helper = this.getHelperVisual();
        const condition1 = helper.start && !Util.isUndefinedNullEmpty(helper.start.alertMenu);
        const condition2 = helper.end && !Util.isUndefinedNullEmpty(helper.end.alertMenu);
        return condition1 || condition2;
    }

    hasHelperVisual() { return this.getHelperVisual().enable; }

    getStructsOfProject() { return this.getComponentOfProject().map((component) => component.getStruct()); }

    getComponentOfProject() { return this.getNodeOfSource().getComponents(); }

    getNameOfReference() { return this.ref; }

    /**
     * 在整個專案的 structs 中，遞迴搜尋符合指定 ref 名稱的原始節點（非 ref 節點）。
     * 若找到多個同名節點會發出警告，找不到則拋出異常。
     * 注意：這不包括 common modules。
     *
     * @param {string} [nameOfRef=this.getNameOfReference()] - 要搜尋的 ref 名稱
     * @returns {CodegenNode} 找到的原始節點
     * @throws {ERROR} 當找不到指定的 ref 節點時
     *
     * @example
     * // 從當前 ref 節點找到原始定義
     * const original = refNode.getNodeOfReference();
     * // 指定名稱搜尋
     * const node = someNode.getNodeOfReference('paymentForm');
     */
    getNodeOfReference(nameOfRef = this.getNameOfReference()) {

        function findNodeOfSpecificRef(...nodes) {
            for (const node of nodes) {
                if (_.isEqual(node.name, nameOfRef) && Util.isUndefinedNullEmpty(node.ref))
                    nodesOfRef.push(node);
                if (Array.isArray(node.children))
                    findNodeOfSpecificRef(...node.children)
            }
        }

        const nodesOfRef = [];
        findNodeOfSpecificRef(...this.getStructsOfProject())
        if (_.size(nodesOfRef) > 1)
            Util.appendInfo(`44864646 指定的ref有重複得狀態，請將ref 做 naming unique, ${nameOfRef}出現在 => [${nodesOfRef.map(node => node.getParentNode().getName())}]`)

        if (_.size(nodesOfRef) === 0)
            throw new ERROR(9999, `44864641 指定的ref => ${nameOfRef} not exist in whole project`);

        return nodesOfRef.shift();
    }

    isSingleLine() { return this.singleLine; }

    useAutoFuse() { return _.isEqual(true, this.autoFuse); }

    hasInputRegEx() {
        return !Util.isEmpty(this.inputRegEx);
    }

    getInputRegEx() {
        return this.inputRegEx;
    }

    setInputRegEx(regEx) {
        this.inputRegEx = regEx;
    }

    getTextOfHelperVisual() { return this.getHelperVisual().text; }

    constructor(node) {
        this.raw = node;
        const self = this;
        for (const key in node) {
            self[key] = node[key];
        }
    }

    /**
     * 遞迴搜尋樹狀結構中的節點
     * @param {Object|Array} node - 當前節點或節點陣列
     * @param {Function} predicate - 判斷條件的 callback (node) => boolean
     * @returns {Array} 符合條件的節點陣列
     */
    getNodesBy = (predicate,node = this.getStruct()) => {
        // 防呆：如果節點為空或不是物件/陣列，直接回傳空陣列
        if (!node || typeof node !== "object") return [];

        // 如果傳入的是陣列 (例如處理 children 時)，則對每個元素遞迴並攤平結果
        if (Array.isArray(node)) {
            return node.flatMap(child => getNodesBy(predicate, child));
        }

        // 1. 檢查當前節點是否符合條件
        const isMatch = predicate(node) ? [node] : [];

        // 2. 使用可選串連 (?.) 安全地讀取 children
        // 3. 遞迴搜尋子節點，並使用 ?? 確保若沒有 children 時回傳空陣列 []
        const childrenMatches = node.children?.flatMap(child => this.getNodesBy(predicate, child)) ?? [];

        // 4. 合併並回傳結果
        return [...isMatch, ...childrenMatches];
    };

    isSelected() { return Util.isObject(this.select) && Array.isArray(this.select.values); }

    hasLabel() { return this.label && !Util.isEmpty(this.label); }

    hasFormat() { return this.format && !Util.isEmpty(this.format); }

    getFormat() { return this.format ?? `YYYY/MM/DD hh:mm`; }

    hasHelperText() { return this.helperText && !Util.isEmpty(this.helperText); }

    getHelperText() { return this.helperText ?? ''; }

    getLabel() { return this.label ?? ''; }

    hasLabelView() { return this.labelView && this.labelView.enable; }

    hasLabelViewIcon() { return this.labelView && this.labelView.labelIcon && this.labelView.labelIcon.enable; }

    hasDefaultValueOfLabelView() { return this.hasLabelView() && !Util.isEmpty(this.labelView.defaultValue); }

    getFunctionMethods() { return this.methods; }

    getStructs() { return this.getNodeOfComponent().getComponents().map(component => component.getStruct()); }

    hasTitle() { return !Util.isEmpty(this.title); }

    hasColor() { return !Util.isEmpty(this.color); }

    getColor() { return this.color ?? 'primary'; }

    hasDescription() { return !Util.isUndefinedNullEmpty(this.description); }

    getValueOfTabDefault() { return this.valueOfTabDefault; }

    getCustomTextOfI18n() { return this.getNodeOfStruct().textsOfI18n ?? {}; }

    /**
     * 根據 Cloud Function 的類型與 source 節點的伺服器設定，組裝出完整的 Cloud Function URL。
     * 內部會將 Firebase Functions 的 location 對應到縮寫碼（例如 asia-east1 → de），
     * 並搭配 randomHashOfFunc 產生 gen2 格式的 URL。
     *
     * @param {{ name: string, type: string }} cloud - Cloud Function 的設定物件
     * @returns {string} 完整的 Cloud Function URL
     *
     * @example
     * const url = node.getHostOfCloudFunction({ name: 'checkoutByECPay', type: 'httpOnCall' });
     * // => 'https://checkoutbyecpay-abcdefghijk-de.a.run.app'
     */
    getHostOfCloudFunction(cloud) {
        /** 內部對照表 */
        function getRegionShortenByLocation(location) {
            const regionMap = {
                'asia-east1': 'de',
                'asia-northeast1': 'an',
                'asia-northeast2': 'dt',
                'asia-southeast1': 'as',
                'us-central1': 'uc',
                'us-east1': 'ue',
                'us-west1': 'uw',
                'europe-west1': 'ew'
            };
            return regionMap[location] || 'de'; // 預設給台灣，因為您的 setGlobalOptions 是 asia-east1
        }

        const node = this.getNodeOfSource();
        const hash = node.randomHashOfFunc;

        // 檢查點 1: 如果 Hash 還沒設定，應該拋出提示
        if (!hash) {
            console.warn(`[Warning] Cloud Function ${cloud.name} 的 Random Hash 尚未設定，請先部署一次並更新 config。`);
            return `https://pending-deploy-${cloud.name}`;
        }

        const regionShort = getRegionShortenByLocation(node.locationOfFunctions);

        // 檢查點 2: 函數名稱處理
        // Google Cloud 會將 CamelCase 轉為 lowercase。
        // 例如：getCurrentAddress -> getcurrentaddress
        const funcName = _.toLower(cloud.name);

        return `https://${funcName}-${hash}-${regionShort}.a.run.app`;

        /** gen1 return `https://${node.locationOfFunctions}-${node.getIdOfProject()}.cloudfunctions.net`; */
        /** dev:  http://localhost:5001/${node.getName()}/${node.localeOfServer}; */
    }

    needTestButton() { return !!this.testButton; }

    isViewDefinedInProps() { return this.injectViewProp && !Util.isUndefinedNullEmpty(this.injectViewProp.name); }

    /** (params) => (params) => <CustomView {...params} />*/
    isViewPropsFunctionality() { return this.isViewDefinedInProps() && _.isEqual(this.injectViewProp.functionalized, true); }

    setType(type) { this.type = type; }

    getFunctionNameOfNormalize() { return Util.camel("normalize", this.getName()); }

    getFieldNameOfLabel(sign = '') { return Util.camel('label', 'of', this.getFieldName(), sign);}

    getFieldNameOfToggle(sign = '') {
        return Util.camel('toggle', 'of', this.getFieldName(), sign);
    }

    getFieldNameOfHelperText() { return Util.camel('helperText', 'of', this.getFieldName()); }

    needI18nBehavior() { return this.l10n; }

    getFieldNameOfSelected() { return Util.camel('selected', this.getName()); }

    getFunctionNameOfSelectSetter() { return Util.camel('set', this.getFieldNameOfSelected()); }

    needAddImageButton() { return this.isArray() && this.selectImageButton; }

    /** */
    getProjectName() {
        const root = this.getNodeOfSource();
        return root.getName();
    }

    getIdOfProject() {
        const root = this.getNodeOfSource();
        return Util.isUndefinedNullEmpty(root.idOfProject) ? root.name : root.idOfProject;
    }

    setColumn(col = false) {
        this.column = col;
    }

    setDefaultValue(value) {
        this.defaultValue = value;
    }

    getFunctionNameOfSelectGetter() { return Util.camel('get', this.getFieldNameOfSelected()); }

    getFieldNameOfPageTitle() {

        function normalize(title) {
            return _.split(title, 'Editor').shift();
        }

        return Util.camel('page', 'title', 'of', normalize(this.getPreciseAttributeGenealogyName()));
    }

    getFieldNameOfStart() { return Util.camel('start', 'of', this.getFieldName()); }

    getFieldNameOfEnd() { return Util.camel('end', 'of', this.getFieldName()); }

    isPathArray() { return this.isArray() && this.hasPath(); }

    isColumnArray() { return this.isArray() && this.column; }

    isReferenceNode() { return !!this.ref && !Util.isEmpty(this.ref); }

    hasCopyRightView() { return this.useCopyRightView.enable; }

    isReferenceImitateNode() { return this.isReferenceNode() && _.isEqual(this.getNodeOfOrigin().imitate, true); }

    needEmptyTip() { return this.listEmptyTip && this.listEmptyTip.enable; }

    /**
     * 1.可以從任何一個節點找到node of component, 然後判斷是否為editable
     * 2.設計了component module的觀念, 就是能把component當作模組使用, 增加了component 和 store 增加了 concrete class , 這樣模組化的 邏輯 就可以放到module class,
     * 3.module class 會persist到 free_marker/src/modules/{name}/XXX.js , 這樣換專案就可以無痛移植.  */
    isModuleComponent() {
        const ancestor = this.getNodeOfComponent();
        return ancestor.isCommonModule ?? false;
    }

    getListOfModuleComponent() {
        const list = Util.getNamesOfFolderChild(PATH_OF_COMPONENT_MODULE).map((each) => _.trim(each));
        return _.filter(list, (each) => !Util.has(this.modulesOfIgnore, each, true));
    }

    getFieldNameOfDialogContent() { return Util.camel('dialog', 'content', 'of', this.getPreciseAttributeGenealogyName()); }

    getFieldNameOfVisualHelper(object, position) {
        return Util.camel('text', 'of', 'visual', position, this.getPreciseAttributeGenealogyName());
    }

    getFunctionNameOfDialogContentGetterWithBracket() { return `${Util.camel('get', this.getFieldNameOfDialogContent())}()`; }

    getFunctionNameOfDialogTitleGetterWithBracket() { return `${Util.camel('get', this.getFieldNameOfDialogTitle())}()`; }

    getFunctionNameOfDialogInputValueGetterWithBracket() { return `${Util.camel('get', this.getFieldNameOfDialogInputValue())}()`; }

    getFunctionNameOfDialogInputValueSetter() { return `${Util.camel('set', this.getFieldNameOfDialogInputValue())}`; }

    getFunctionNameOfDialogInputLabelGetterWithBracket() { return `${Util.camel('get', this.getFieldNameOfDialogInputLabel())}()`; }

    getFieldNameOfDialogTitle() { return Util.camel('dialog', 'title', 'of', this.getPreciseAttributeGenealogyName()); }

    getFieldNameOfDialogInputValue() { return Util.camel('dialog', 'input', 'value', 'of', this.getPreciseAttributeGenealogyName()); }

    getFieldNameOfDialogInputLabel() { return Util.camel('dialog', 'input', 'label', 'of', this.getPreciseAttributeGenealogyName()); }

    /** exclude => 要略過的資料夾名稱 */
    getLessFilesOfModuleComponent(...exclude) {
        const modulesOfAllow = this.getListOfModuleComponent();
        const filesOfLess = modulesOfAllow.map((name) => Util.findFilePathBy(Util.joinRespectingDot(PATH_OF_COMPONENT_MODULE, name),
          (file) => _.isEqual(file.extension, 'less')))
        return _.flatten(filesOfLess);
    }

    /** 像是Switch, ToggleButton這類
     *
     * 因為我把needOnChangeBehavior這個method當作參參數傳遞, 會產生裏面呼叫的this 和 node 是不一樣的指標(例如this.view !== node.view),
     * 可能還不懂call by reference的實作, 只好把物件(node)傳遞進來     * */
    /**
     * 判斷當前節點是否需要 onChange 行為。
     * 涵蓋 Slider、Switch、TextField、Autocomplete、TabList、TimeDatePicker、
     * TimeDateRangePicker、Checkbox、RadioGroup、ButtonGroup 等元件。
     *
     * @param {string} [type='default'] - view 的類型 ('default'|'wrap'|'list'|'listWrap')
     * @param {CodegenNode} [node=this] - 要檢查的節點（支援外部傳入，避免 this 指標問題）
     * @returns {boolean} 是否需要 onChange 行為
     *
     * @example
     * if (node.needOnChangeBehavior()) {
     *   generator.appendFunction(node.getFunctionNameOfOnChanged(), ['event', 'value'], ...);
     * }
     * // 指定 wrap 類型檢查
     * if (node.needOnChangeBehavior('wrap', parentNode)) { ... }
     */
    needOnChangeBehavior(type = 'default', node = this) {
        return Util.or(
          node.isSliderView(type),
          node.isSwitchView(type),
          node.isTextFieldView(type),
          node.isAutoCompleteView(type),
          node.isTabListView(type),
          node.isTimeDatePickerView(type),
          node.isTimeDateRangePickerView(type),
          node.isCheckboxView(type),
          node.isRadioGroupView(type),
          node.isButtonGroupView(type),
        );
    }

    getDirectoryName() { return this.directory; }

    /** 就是有提供單選
     * 1.在store產生 selected{node.getName()}
     * 2.會加上onChange事件 setSelected{node.getName()}
     * 3.array裡的子類view, 不會用observer修飾, 不然會拿不到values
     * 4.selectedItem預設都是{value:'100',label:'100年'} label用來顯示標籤
     * */
    isSimpleSelected() { return this.select && Util.isOrEquals(this.select.type, 'radio', 'spinner', 'button'); }

    /**
     * 1.用string當作value，否則select建議用number作為value
     * 2. selected{name} 也會被指定為string
     * */
    useStringAsValue() {
        return Util.isString(this.getSelectedDefaultValue())
    }

    getTypeOfSimpleSelected() { return this.select.type; }

    getDefaultValueOfSimpleSelected() { return this.select.values; }

    isIndex() { return _.isEqual(this.index.enable, true); }

    getIndexRule() {
        return this.index.rule
    }

    getSelectedDefaultValue() {
        if (this.select && this.select.defaultValue) {
            return this.select.defaultValue;
        }
        return '';
    }

    isRestfulBean() { return this.restful; }

    getStyle() { return this.style; }

    appendStyle(style) {
        this.style = {...this.style, ...style}
    }

    /** arrayItem 是一個抽象的概念, 因為type='array', 必須建造出'QuestionsView(forEach邏輯)', 'QuestionView(viewModule)' */
    isArrayItem() { return _.isEqual(this.type, 'arrayItem'); }

    getNodeOfSource() { return this.getParentBy((node) => node.isRootNode()); }

    getStorageSuperUserUid() { return this.superUserUid; }

    getConditions() { return this.conditions; }

    getNodeOfComponent() { return this.getParentBy((node) => node.isComponentNode()); }

    getNodeOfStruct() {
        if (this.isComponentNode()) {
            return this.getStruct();
        }
        return this.getParentBy((node) => node.isStructNode());
    }

    getParamsInRouter(...others) {
        return this.getNodeOfComponent().getParamsInPath(...others);
    }

    getParamsOfBatchFetch() {
        return this.getParamsOfString(this.getPath(), 'id');
    }

    getBatchFetchOfRefStmt() {
        return `\`${this.getPathOfRouterString()}\`, id`;
    }

    getSignOfFetchPath() {
        return `\'${this.getPathOfRouterString()}/\${id}\'`;
    }

    getNodeOfOrigin() { return this.nodeOfOrigin ?? {}; }

    needImplementAction() { return this.isReferenceStructNode() && this.getNodeOfOrigin().implementActions; }

    isStructNode() {
        const parent = this.getParentNode();
        return parent.isComponentNode();
    }

    isRootNode() { return !!this.components; }

    getStorageFolderName() { return this.storageFolder ?? 'public'; }

    getFunctionNameOfGetCondition() { return Util.camel('get', this.getName(), 'conditions'); }

    getFunctionNameOfPushCondition() { return Util.camel('push', this.getName(), 'conditions'); }

    hasStorageFolder() { return !Util.isUndefinedNullEmpty(this.storageFolder); }

    isCollectionPath() {
        if (this.hasPath()) {
            const segments = _.split(Util.getNormalizedStringNotStartWith(this.getPath(), '/'), '/');
            return Util.isOdd(segments.length);
        }
        return undefined;
    }

    getNormalizePathOfObjectApi(path) {
        if (typeof path !== 'string') {
            throw new Error("Path must be a string.");
        }

        const segments = path.split('/').filter(Boolean); // 移除空段落

        if (segments.length % 2 === 0) {
            // 已是合法的 document path
            return segments.join('/');
        }

        // 非法 document path，補上 /attr
        return [...segments, 'attr'].join('/');
    }

    setStyle(style) {
        this.style = style;
    }

    getWrapStyle() { return this.wrapStyle; }

    getPaginateSize() {
        if (this.paginate)
            return this.paginate.size;
        return -1;
    }

    getMaxSizePerRequest() { return this.maxSizeOfFetchItem; }

    getPaginateThreshold() { return this.paginate.threshold; }

    hasPaginate() { return !!this.paginate && Util.isObject(this.paginate); }

    appendWrapStyle(style) {
        this.wrapStyle = {...this.wrapStyle, ...style}
    }

    setWrapStyle(style) {
        this.wrapStyle = style;
    }

    getListStyle() { return this.listStyle; }

    setListStyle(style) {
        this.listStyle = style;
    }

    appendListStyle(style) {
        this.listStyle = {...this.listStyle, ...style}
    }

    getListWrapStyle() { return this.listWrapStyle; }

    setListWrapStyle(style) {
        this.listWrapStyle = style;
    }

    appendListWrapStyle(style) {
        this.listWrapStyle = {...this.listWrapStyle, ...style}
    }

    getFunctionNameOfItemEditorWithParam() { return `self.${this.getFunctionNameOfItemEditor()}(${this.getName()})`; }

    getFunctionNameOfCollectionEditorWithParam() { return `self.${this.getFunctionNameOfCollectionEditor()}(
        ${this.isObject() ? this.getName() : this.getPreciseAttributeParent().getName()}
        )`; }

    hasValidViewParent() { return this.getPreciseViewParent().isValidNode(); }

    hasValidAttributeParent() { return this.getPreciseAttributeParent().isValidNode(); }

    /** 像是編輯一個item, 這種屬許item等級的作業, item自己做的事情 */
    getFunctionNameOfItemEditor() { return Util.camel('on', this.getName(), 'Item', 'Editor', 'Clicked', 'AsyncTask'); }

    /** 像是新增一個item, 這種屬許array等級的作業, 一個Array只會有一個新增 */
    getFunctionNameOfCollectionEditor() { return Util.camel('on', this.getName(), 'Editor', 'Clicked', 'AsyncTask'); }

    isContainer() { return Util.isOrEquals(_.toLower(this.getView()), 'accordionsummary','accordiondetails','accordion','grid', 'stack', 'div', 'card', 'paper', 'swiper', 'swiperslide', 'badge',
      'drawer', 'toolbar', 'appbar', 'iconbutton', 'list', 'listitem', 'menuitem', 'swipeabledrawer', 'tabs', 'react.fragment', 'LocalizationProvider'); }

    getFunctionNameOfSwiper() { return Util.camel(`on`, this.getPreciseNameOfAttributeView(), 'Swipe'); }

    getFunctionNameOfSwipeSlide() { return Util.camel(`on`, this.getPreciseNameOfAttributeView(), 'Slide'); }

    getFunctionNameOfObservableObject() { return Util.camel('get', 'observable', this.getObservableName()); }

    allowOfParam() { return (this.isAttribute() && this.hasValidAttributeParent()) || this.needParentParam() || this.isIncestAttribute(); }

    isScrollingHideDependOnRootNode() {
        const rootNode = this.getNodeOfSource()
        return rootNode.navigation && rootNode.navigation.isScrollingHide;
    }

    isReadOnly() {
        return this.readOnly
    }

    setIsEditableComponent(edit) {
        this.isEditableComponent = edit;
    }

    isDisableInitFetch() { return _.isEqual(true, this.disableInitFetch); }

    getUniqueIdStmt() {
        if (this.hasPath() && !this.isCheapArray())
            return `###${this.getName()}.getId()`;
        else
            return `###${this.getName()}.getIdOfUniqueView()`;
    }

    /** 可以從任何一個節點找到node of component, 然後判斷是否為editable */
    isPreciselyEditableComponent() {
        const nodeOfComponent = this.getNodeOfComponent();
        return nodeOfComponent.isEditableComponent;
    }

    isColumnAttribute() { return this.hasPath() || (this.isAttribute() && this.isColumn()) || this.isLabelOrValue(); }

    isColumn() { return _.isEqual(this.column, true); }

    isLabelOrValue() {
        return this.isAttribute() && Util.isOrEquals(_.toLower(this.getName()), 'value', 'label')
    }

    isTimeStamp() {
        return _.isEqual(this.type, 'timestamp')
    }

    isViewModified() { return !!this.viewModified; }

    isNameModified() { return !!this.nameModified; }

    getSelectedCustomLabelView() {
        const view = this.select.labelView;
        return view;
    }

    isButton() {
        return _.isEqual(this.getView(), 'Button')
    }

    needIndependClick() { return this.independentClick; }

    getFieldNameOfRef() { return Util.camel('ref', 'of', this.getFieldName()); }

    isIconButton() {
        return _.isEqual(this.getView(), 'IconButton')
    }

    /** 就是 <FormControlLabel label={object.label} /> 其餘的都放到 content裏面 <Button >{object.label}</Button>*/
    isLabelPropsView() {
        return Util.isOrEquals(this.getView(), 'FormControlLabel')
    }

    /** 如果node有paginate 屬性時, onBottomTab會呼叫到這一個method*/
    getFunctionNameOfFetch() {
        return Util.camel(`fetch`, this.getFieldName())
    }

    getFunctionNameOfFetchBatch() {
        return Util.camel(`fetch`, this.getName(),`batch`,`items`)
    }

    getFunctionNameOfModify() {
        return Util.camel(`modify`, this.getFieldName(), 'of', 'paginate')
    }

    /** 當有 paginate 機制, limit 就會被寫在method裏面, 需要一個fetch all的*/
    getFunctionNameOfPureFetch() { return Util.camel(`fetch`, 'Pure', this.getFieldName()); }

    getFunctionNameOfNextFetch() {
        return Util.camel(`fetch`, `next`, this.getFieldName())
    }

    getFunctionNameOfFetchItem() {
        return Util.camel(`fetch`, this.getName(), 'item')
    }

    getFunctionNameOfUpdateItem() { return Util.camel('update', this.getName(), 'item'); }

    getFunctionNameOfUpsertItem() { return Util.camel('upsert', this.getName(), 'item'); }

    getFunctionNameOfUpdateItemAtomically() { return Util.camel('update', this.getName(), 'item', 'atomically'); }

    getFunctionNameOfUpsertItemAtomically() { return Util.camel('upsert', this.getName(), 'item', 'atomically'); }

    getFunctionNameOfDeleteItem() {
        return Util.camel('delete', this.getName(), 'item')
    }

    getFunctionNameOfDelete() {
        return Util.camel('delete', this.getFieldName())
    }

    getFunctionNameOfSubmitItem() { return Util.camel('submit', this.getName(), 'item'); }

    getFunctionNameOfBatchSubmitParentItems(child) { return Util.camel('submit','batch', this.getName(),child.getName(), 'items'); }

    getFunctionNameOfBatchDeleteParentItems(child) { return Util.camel('delete','batch', this.getName(),child.getName(), 'items'); }

    getFunctionNameOfSubmit() { return Util.camel('submit', this.getFieldName()); }

    getFunctionNameOfFetchDocumentIds() { return Util.camel('fetchDocumentIds', 'of', this.getName()); }

    getFunctionNameOfGetter() { return Util.camel('get', this.getName()); }

    getFunctionNameOfGetters() { return Util.camel('get', this.getFieldName()); }

    getFunctionNameOfClean() { return Util.camel('clean', this.getFieldName()); }

    getFunctionNameOfBatchUpdate() { return Util.camel('update', this.getFieldName()); }

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

    getOriginalView() { return this.isPreciselyEditableComponent() ? this.originalView : this.view; }

    getOriginalName() { return this.isPreciselyEditableComponent() ? this.originalName : this.name; }

    getDescription() {
        if (this.description) return this.description;

        const name = this.getName();
        switch (_.toLower(name)) {
            case 'value': return `${name}邏輯處理的值`;
            case 'label': return `${name}顯示的標籤`;
            default: return `${name}沒有解釋`;
        }
    }

    /** 這些屬性不可以enrich */
    static doNotEnrichAttribute() {
        return ['idxes','enums','plural', 'example', 'propsOfIcon', 'propsOfBadge', 'COLLECTIONS', 'helperVisual', 'incest', 'label', 'labelIcon', 'useCopyRightView', 'textInput', 'labelView', 'ecpay', 'modulesOfIgnore', 'alertMenu', 'nodeOfOrigin', 'skeleton', 'simpleProps', 'select', 'methods', 'rapidBuild', 'linepay', 'listEmptyTip', 'increment', 'index', 'defaultValue', 'paginate', 'conditions', 'watermark', 'listStyle', 'wrapStyle', 'editIgnore',
            'initFetchOnlyLogin', 'permission', 'alertDialog', 'wrapContents', 'listContents', 'listWrapContents', 'contents', 'style', 'listWrapStyle', 'useCartie',
            'extra', 'firebase', 'mother', 'parent', 'listProps', 'listWrapProps', 'wrapProps', 'props', 'admin', 'server', 'params', 'host', 'payload', 'autoplay', 'textsOfI18n', 'setsOfComponentProp']
    }

    setListContents(contents) {
        this.listContents = contents;
    }

    needLoadingSkeleton() { return this.isPathArray() && this.skeleton && this.skeleton.enable; }

    getVariantOfSkeleton() {
        if (this.skeleton && this.skeleton.variant) {
            return this.skeleton.variant;
        }
        return 'rectangular';
    }

    /** 如果是dialog, 或是 pop-up 類型的view, 應該需要一個hook去開關 */
    needVisibleHook() {
        return Util.isOrEquals(this.wrapView, 'SwipeableDrawer')
    }

    getAnchorOfDrawer() {
        return this.anchor ?? 'bottom'; //[top,bottom,left,right]
    }

    getAnchorOfButton() {
        return this.anchor ?? 'start'; //[start,end]
    }

    appendListContents(...contents) {
        this.listContents.push(...contents);
    }

    getSimpleProps() { return this.simpleProps; }

    appendSimpleProps(...props) {
        this.simpleProps.push(...props);
    }

    appendContents(...contents) {
        this.contents.push(...contents);
    }

    appendMethods(...methods) {
        this.getNodeOfComponent().methods.push(...methods);
        this.methods.push(...methods);
    }

    appendImportStmt(...stmt) {
        this.stmtsOfImport.push(...stmt);
    }

    getStmtsOfImport() { return this.stmtsOfImport; }

    hasPermission() { return !!this.permission && !_.isEmpty(this.permission); }

    getListContents() { return this.listContents || []; }

    setListWrapContents(contents) {
        this.listWrapContents = contents;
    }

    appendListWrapContents(...contents) {
        this.listWrapContents.push(...contents);
    }

    getListWrapContents() { return this.listWrapContents || []; }

    setWrapContents(contents) {
        this.wrapContents = contents;
    }

    appendWrapContents(...contents) {
        this.wrapContents.push(...contents);
    }

    getFuncNameOfDialogCallback(name) {
        return Util.camel("on", name, "dialog", "submit");
    }

    getFunctionNameOfDialogPesetObj(name) {
        return  Util.camel('get', 'presetObj', 'Of', name)
    }

    /**
     * 將 AlertDialog 相關的 JSX 語句附加到 stmt 陣列中，並將對應的 import、field、function 註冊到 generator。
     * 涵蓋 ConfirmDialog（確認型）與 CustomViewDialog（客製化畫面型），
     * 同時處理 ref、textInput、strict mode、fullWidth、callback、disposable 等屬性的語句產生。
     *
     * @param {string[]} stmt - 要附加 JSX 語句的目標陣列
     * @param {ClassGenerator} generator - 用來註冊 import / field / function 的 ClassGenerator 實例
     * @returns {void}
     *
     * @example
     * // 在 getContents 或 getWrapContents 中呼叫：
     * const stmts = [];
     * node.appendAlertDialogStmts(stmts, generator);
     * // stmts 會包含 <AlertDialog ref={...} component={self} ... /> 的 JSX 語句
     */
    appendAlertDialogStmts(stmt, generator) {
        const self = this;

        function getTaskStmts() {
            if (self.hasConfirmDialog())
                return `task={ async() => self.${self.hasDeletedView() && self.isAlertDialog4Deleted() ?
                    self.getFunctionNameOfDeleted() : self.getFunctionNameOfClicked()}(objectOfParam)}`;
            /** AlertDialog是WrapView，所以getFunctionNameOfClicked會對現有的Click Instance造成影響，所以不帶入type */
        }

        function getActionButtonStmts() {
            const need = self.getAlertDialog().needActionButtons ?? true;
            return `needActionButtons={${need}}`
        }

        function getEnableCancelStmts() {
            const need = self.getAlertDialog().enableCancel ?? true;
            return `enableCancel={${need}}`
        }

        function getCustomViewStmts() {
            if (self.hasCustomViewDialog()) {
                const view = self.getAlertDialog().customView;
                const component = self.getSpecificComponent(view);
                return [`customView={${self.getAlertDialog().customView}}`, `storeX={'${component.getStruct().getName()}'}`];
            } else return [];
        }

        function getStmtCallBack() {
            if (self.hasCallbackOfDialog()) {
                return `callback={self.${self.getFuncNameOfDialogCallback(self.getAlertDialog().customView)}}`;
            }
        }

        function getParamObject() {
            const param = self.getObservableName();
            if (!Util.isUndefinedNullEmpty(param)) {
                return `paramObject={${param}}`;
            }
        }

        function getStmtOfDialogTitle() {
            const dialog = self.getAlertDialog();
            return _.isEmpty(dialog.title) ? '' : `title={${self.getObservableName()}.${self.getFunctionNameOfDialogTitleGetterWithBracket()}}`;
        }


        function getStmtOfDialogContent() {
            const dialog = self.getAlertDialog();
            return _.isEmpty(dialog.content) ? '' : `content={${self.getObservableName()}.${self.getFunctionNameOfDialogContentGetterWithBracket()}}`;
        }


        function getStmtDialogInput() {
            const stmts = [];
            if (self.hasInputFieldDialog()) {
                stmts.push(`textInput={{enable:true`);
                stmts.push(`label:${self.getObservableName()}.${self.getFunctionNameOfDialogInputLabelGetterWithBracket()}`)
                stmts.push(`value:${self.getObservableName()}.${self.getFunctionNameOfDialogInputValueGetterWithBracket()}`)
                stmts.push(`onTextFieldChange:(event, value) => {${self.getObservableName()}.${self.getFunctionNameOfDialogInputValueSetter()}(self.getLatestValueByEvent(event))}`)
                stmts.push(`type:'${self.getAlertDialog().textInput.type}'}}`);
                return stmts.join(',');
            }
            return '';
        }

        function getStmtOfFullWidth() {
            return self.hasFullWidthOfDialog() ? `fullWidth={true}` : ``;
        }

        function getStmtOfStrictMode() {
            return self.hasStrictMode() || self.hasInputFieldDialog() ? `strict={true}` : ``;
        }

        function getStmtOfCustomCancelButton() {
            return self.hasCustomCancelButton() ? `useCustomCancel={true}` : ``;
        }

        function getStmtOfDisposable() {
            if (!self.hasCustomViewDialog()) return '';
            const nodeOfSpecificComponent = self.getSpecificComponent(self.getAlertDialog().customView);
            return nodeOfSpecificComponent.isDisposablePage() ? `disposablePage={true}` : ``;
        }

        if (this.hasAlertDialog()) {
            generator.appendImport('AlertDialog', '../../base/AlertDialog');
            const nameOfRef = this.getFieldNameOfAlertDialog();
            if (this.isAlertDialogNeedGlobalRef()) {
                generator.appendField(nameOfRef, 'React.createRef()');
                generator.appendFunction(Util.camel('get', nameOfRef), [], [], [],
                    `return this.${nameOfRef}.current`)
            }

            if (this.hasCustomViewDialog() && this.getAlertDialog().presetObj)
                generator.appendFunction(this.getFunctionNameOfDialogPesetObj(self.getAlertDialog().customView), [], [], [], `return {}`);

            const stmtOfRef = this.isAlertDialogNeedGlobalRef() ? `self.${nameOfRef}` : nameOfRef
            const props = [
                `ref={${stmtOfRef}}`,
                `component={self}`
            ];
            props.push(getActionButtonStmts());
            props.push(getEnableCancelStmts());
            props.push(getTaskStmts());
            props.push(getStmtOfDisposable());
            props.push(...getCustomViewStmts());
            props.push(getStmtCallBack());
            props.push(getParamObject());
            props.push(getStmtOfStrictMode());
            props.push(getStmtDialogInput())
            props.push(getStmtOfDialogContent());
            props.push(getStmtOfDialogTitle());
            props.push(getStmtOfFullWidth());
            props.push(getStmtOfCustomCancelButton());
            _.remove(props, (each) => _.isEmpty(each))
            stmt.push(`
            <AlertDialog
            ${props.join('\n')}
            />`)
        }
    }

    needEditPage() { return !!this.editor; }

    isFetchOnlyLogin() { return this.initFetchOnlyLogin ? this.initFetchOnlyLogin : false; }

    getCustomizePackages() { return _.isEmpty(this.customizes) ? [] : this.customizes; }

    getEventParams() { return this.params || []; }

    hasInputFieldDialog() { return this.getAlertDialog().textInput.enable; }

    hasFullWidthOfDialog() { return this.getAlertDialog().fullWidth; }

    hasCallbackOfDialog() { return this.getAlertDialog().callback; }

    hasStrictMode() { return _.isEqual(this.getAlertDialog().strict, true); }

    hasCustomCancelButton() { return _.isEqual(this.getAlertDialog().useCustomCancel, true); }

    hasAlertMenu() {
        const conditionA = _.size(this.alertMenu.items) > 0;
        // const conditionB = this.isHelperVisualSupportAlertMenu();
        // return conditionA || conditionB;
        return conditionA;
    }

    getAlertDialog() { return Util.merO(this.defaultAlertDialog, this.alertDialog); }

    hasLoginRequiredDialog() { return !!this.loginRequiredAlert; }

    /** 就是點擊要再確認的那種dialog */
    hasConfirmDialog() { return !_.isEmpty(this.getAlertDialog().title); }

    /** 就是客製化view那種dialog */
    hasCustomViewDialog() { return !_.isEmpty(this.getAlertDialog().customView); }

    hasAlertDialog() { return this.hasConfirmDialog() || this.hasCustomViewDialog(); }

    setContents(contents = []) {
        this.contents = contents;
    }

    clearContents() {
        this.contents = [];
    }

    /** array => Questions, object => Question*/
    getFieldName() {
        if (this.isArrayItem()) {
            return this.name
        } else {
            return this.name + (this.plural ? this.plural : '');
        }
    }

    getWrapView(needDefault = true) {
        return needDefault ? (this.wrapView ?? 'div') : this.wrapView;
    }

    setWrapView(view) {
        this.wrapView = view;
    }

    setListWrapView(view) {
        this.listWrapView = view;
    }

    withoutWrapView() { return Util.isUndefinedNullEmpty(this.getWrapView(false)); }

    getListView() {
        return this.listView ?? 'div';
    }

    disableSelectedArray() {
        this.select = {}
    }

    getListWrapView() {
        return this.listWrapView ?? 'div';
    }

    setListView(view) {
        this.listView = view;
    }

    getType() { return this.type; }

    hasDefaultValue() { return !Util.isUndefinedNullEmpty(this.defaultValue); }

    setView(view) {
        this.view = view;
    }

    getView(raw = false) {
        return raw ? this.view : _.replace(this.view, '.', ''); /** 處理React.Fragment*/
    }

    getEvents() { return this.events || []; }

    setEvents(events) {
        this.events = events;
    }

    getPermission() {
        const defaultPermission = {
            update: 'isAdmin()',
            delete: 'isAdmin()',
            create: 'isAdmin()',
            read: 'isAdmin()',
            list: `(request.query.limit is int && request.query.limit <= ${MAXIMUM_DOCUMENTS_PER_FETCH})`
        };
        return { ...defaultPermission, ...(this.permission || {}) };
    }

    getStoragePermission() {
        return { ...this.getDefaultStoragePermission(), ...(this.permission || {}) };
    }

    getDefaultStoragePermission() { return {
        write: 'isAdmin()',
        delete: 'isAdmin()',
        read: 'alwaysTrue()',
    }; }

    isState() {
        return true;
        /** 本來想區分store為 state 或是 object, 但好像還沒想齊全, 故先全部當成state
         return !!this.state && this.state;
         */
    }

    getFunctionNameOfClearCondition() {
        return Util.camel('clean', this.getName(), 'conditions')
    }

    getFunctionNameOfAutoCompleteInvalidate() {
        return Util.camel('invalidate', this.getName(), 'suggestion')
    }

    getFieldNameOfAlertDialog() { return Util.camel(this.getName(), this.getView(), 'alertDialog', 'ref'); }

    getFieldNameOfAlertMenu() { return Util.camel(this.getName(), this.getView(), 'alertMenu', 'ref'); }

    isWrapByAppBarView() { return _.isEqual(this.getWrapView(), 'AppBar'); }

    /** isView 就是指 gen 出 view class，不然就是 component */
    /**
     * 產生 renderView 內部所需的 self 變數宣告語句。
     * 包含 AlertDialog ref、AlertMenu ref、objectOfParam、ScrollingHideWrap、
     * AutoComplete forceUpdate key、子 view 變數、以及 attribute param 的宣告。
     *
     * @returns {string[]} 一組 JavaScript 宣告語句字串
     *
     * @example
     * const stmts = node.getSelfVariableStmts();
     * // stmts => [
     * //   'const alertDialogRef = React.createRef()',
     * //   'const objectOfParam = { object: item }',
     * //   'const ItemDivView = self.ItemDivView',
     * // ]
     */
    getSelfVariableStmts() {
        const self = this;
        const stmts = [];
        const mapOfVariable = {};

        /** 定義避免重複輸出的變數處理函式 */
        const addViewVariable = (view) => {
            if (!mapOfVariable[view]) {
                stmts.push(`const ${view} = self.${view}`);
                mapOfVariable[view] = true;
            }
        };

        // --- AlertDialog 專用 Ref 產生 ---
        if (this.hasAlertDialog() && !this.isAlertDialogNeedGlobalRef()) {
            stmts.push(`const ${this.getFieldNameOfAlertDialog()} = React.createRef()`);
        }

        // --- AlertMenu 專用 Ref 產生 ---
        if (this.hasAlertMenu() || this.hasHelperVisualSupportAlertMenu()) {
            stmts.push(`const ${this.getFieldNameOfAlertMenu()} = React.createRef()`);
        }

        /** TODO(注意):objectOfParam：若有 點擊事件 objectOfParam */
        if (_.size(this.getFunctionMethods()) > 0 || this.isSimpleSelected()) {
            const content = !Util.isUndefinedNullEmpty(this.getObservableName())
              ? `object: ${this.getObservableName()}`
              : '';
            stmts.push(`const objectOfParam = { ${content} } /** {object,view} */`);
        }

        // --- AppBarView 的 ScrollingHide wrap ---
        if (this.isWrapByAppBarView() && this.isScrollingHideDependOnRootNode()) {
            stmts.push(`const ScrollingHideWrap = self.HideOnScroll`);
        }

        // --- AutoCompleteView 的強制更新 key ---
        if (this.isAutoCompleteView()) {
            stmts.push(`/** force update AutoCompleteView view usage */`);
            stmts.push(
              `const forceUpdate = Util.toString(${this.getPreciseAttributeParentName()}.${Util.camel(
                'get',
                this.getFieldNameOfSuggest()
              )}s()) + Util.getRandomHashV2()`
            );
        }

        // --- 建立 renderView 所需的子 View 變數 ---
        const children = this.getPreciseViewChildren();

        if (this.isArray() && !this.isSimpleSelected()) {
            const className = this.getArrayItemNode().getViewClassNameOfRenderView();
            addViewVariable(className);
        } else {
            for (const child of children) {
                if (!child.isReferenceStructNode()) {
                    addViewVariable(child.getViewClassNameOfRenderView());
                }
            }
        }

        // --- 如果不是 ArrayItem 且禁用 observable，補充建立子 view 變數 ---
        if (!this.isArrayItem() && this.disableObservable) {
            for (const child of children) {
                addViewVariable(child.getViewClassNameOfRenderView());
            }
        }

        // --- 實作 AlertItemClicked 的相關邏輯 ---
        for (const each of this.listOfImplementsOfAlertItemClicked) {
            stmts.push(`const ${each.name} = [${each.stmts}]`);
        }

        // --- 把自己轉為單一參數（例如傳給 navigator）---
        if (this.allowOfParam()) {
            /** 因為是最小單位, 所以父類帶進去的值必須是單數 (不加上 plural) */
            if (this.isAttribute() && !this.isArrayItem()) {
                stmts.push(
                  `const ${this.getFieldName()} = self.${this.getFunctionNameUsingInComponentGetter()}(${self.getPreciseAttributeParentName()})`
                );
            }
        }

        return stmts;
    }


    hasCookies() { return !!this.cookies && _.size(this.cookies) > 0; }

    getCookies() {
        const node = this.getNodeOfComponent();
        return Array.isArray(node.cookies) ? node.cookies : [];
    }

    needInjectStyle() { return !!this.injectStyle; }

    needInjectWrapStyle() { return !!this.injectWrapStyle; }

    needInjectListStyle() { return !!this.injectListStyle; }

    needInjectListWrapStyle() { return !!this.injectListWrapStyle; }

    needInjectView() { return !!this.injectView; }

    needInjectWrapView() { return !!this.injectWrapView; }


    needInjectProps() { return !!this.injectProps; }

    hasPath() { return !!this.path && !_.isEmpty(this.path); }

    getContents(generator) {
        const stmts = [];
        if (!!this.contents && Array.isArray(this.contents)) {
            stmts.push(...this.contents)
        }
        if (this.hasAlertDialog() && !this.hasWrap())
            this.appendAlertDialogStmts(stmts, generator);
        return stmts;
    }

    getWrapContents(generator) {
        const stmt = [];
        const wrapContents = this.wrapContents ? this.wrapContents : [];
        stmt.push(...wrapContents);
        this.appendAlertDialogStmts(stmt, generator)
        return stmt;
    }

    isNumber() { return _.isEqual(this.type, 'number'); }

    isBoolean() { return _.isEqual(this.type, 'boolean'); }

    isString() { return _.isEqual(this.type, 'string'); }

    appendChildren(...child) {
        this.children.push(...child);
    }

    getNavigationComponentName() {
        let name = ''
        if (this.hasNavigationView()) {
            name = this.navigation.view;
        }
        return name;
    }

    hasWrap() { return !!this.wrapView && !_.isEmpty(this.wrapView); }

    hasListWrap() { return !!this.listWrapView && !_.isEmpty(this.listWrapView); }

    hasNavigationView() {
        return !!this.navigation && !!this.navigation.view

    }

    getDeltaOfIncrement() { return this.increment.delta; }

    isOuter() {
        return !!this.outer && this.outer
    }

    isListOuter() {
        return !!this.listOuter && this.listOuter
    }

    isImageView(type = 'default') {
        return this.isAttributeView('img', type);
    }

    isAudioPlayer(type = 'default') {
        return this.isAttributeView('AudioPlayer', type);
    }

    isAvatarView(type = 'default') {
        return this.isAttributeView('Avatar', type);
    }

    isTextFieldView(type = 'default', node = this) {
        return this.isAttributeView('TextField', type, node);
    }

    isTypographyView(type = 'default', node = this) {
        return this.isAttributeView('Typography', type, node);
    }

    isChipView(type = 'default', node = this) {
        return this.isAttributeView('Chip', type, node);
    }

    isMenuItem(type = "default", node = this) {
        return this.isAttributeView("MenuItem", type, node);
    }

    isAlertDialog4Deleted() { return this.getAlertDialog().deleted; }

    isAlertDialog4Click() { return !this.getAlertDialog().deleted; }

    isTabItemView(type = 'default') {
        return this.isAttributeView('Tab', type);
    }

    isBadgeView(type = 'default') {
        return this.isAttributeView('Badge', type);
    }

    isTabListView(type = 'default', node = this) {
        return node.isAttributeView('Tabs', type) || node.isAttributeView('TabList', type);
    }

    isSimperSwiper(type = 'default') {
        return this.isArray() && this.isAttributeView('SimpleSwiper');
    }

    hasAutoPlayMechanism() {
        return this.autoplay && this.autoplay.delay > 0
    }

    isSimpleGrid(type = 'default') {
        return this.isArray() && this.isAttributeView('SimpleGrid', type);
    }

    isSimpleSwitch(type = 'default') {
        return this.isObject() && this.isAttributeView('SimpleSwitch', type);
    }

    isAutoCompleteView(type = 'default', node = this) {
        return node.isAttributeView('Autocomplete', type)
    }

    isRadioView(type = 'default') {
        return this.isAttributeView('Radio', type);
    }

    isRadioGroupView(type = 'default') {
        return this.isAttributeView('RadioGroup', type);
    }

    isButtonGroupView(type = 'default') {
        return this.isAttributeView('ButtonGroup', type);
    }

    isSwitchView(type = 'default', node = this) {
        return node.isAttributeView('Switch', type);
    }

    isQRCodeView(type = 'default', node = this) {
        return node.isAttributeView('QRCode', type);
    }

    isSliderView(type = 'default', node = this) {
        return node.isAttributeView('Slider', type);
    }

    isFloatBackgroundView(type = 'default') {
        return this.isAttributeView('FloatBackgroundView', type);
    }

    /**
     * onChange(event) 裡面的event = dayjs
     * 再透過這些方式取得表列 const YMDHM = Util.getCurrentTimeFormatYMDHM(event.valueOf())`);
     * */
    isTimeDatePickerView(type = 'default', node = this) {
        return node.isAttributeView('TimePicker', type) || node.isAttributeView('DatePicker', type) ||
          node.isAttributeView('DateTimePicker', type);
    }

    /** 是時間屬性的挑選器 */
    isPickerView(type = 'default', node = this) {
        return this.isTimeDateRangePickerView(type, node) || node.isTimeDatePickerView(type, node);
    }

    /**
     {
     name: 'trivago',
     type: 'timestamp',
     column: true,
     view: 'DateRangePicker',
     label: ['開始日期','結束日期']
     }
     */
    isTimeDateRangePickerView(type = 'default', node = this) {
        return node.isAttributeView('DateTimePickerTimeRangePicker', type) ||
          node.isAttributeView('DateTimeRangePicker', type) || node.isAttributeView('DateRangePicker', type);
    }

    isCheckboxView(type = 'default', node = this) {
        return node.isAttributeView('Checkbox', type)
    }

    isAccordion(type = 'default', node = this) {
        return node.isAttributeView('Accordion', type)
    }

    isCustomImageButton(type = 'default') {
        return _.isEqual(this.getView(), 'CustomImageButton');
    }

    /** useSwitch:true, 改用Switch
     *  defaultTitle,   預設標題
     *  defaultContent, 中間的解釋
     * */
    isArrowOptionView(type = 'default') {
        return _.isEqual(this.getView(), 'ArrowOption')
    }

    isAttributeView(view, type = 'default', node = this) {

        function getViewOfTarget() {
            switch (type) {
                case 'list':
                    return node.getListView();
                case 'wrap':
                    return node.getWrapView();
                case 'listWrap':
                    return node.getListWrapView();
                case 'default':
                    return node.getView();
                default:
                    throw new ERROR(9999, `849879841475871 當然不能走到這裡 ${type}`);
            }
        }

        return this.isAttribute() && _.isEqual(getViewOfTarget(), view);
    }

    /** 就是指number, string 這類的物件啦 */
    isStringOrNumberAttribute() { return this.isView() && this.isAttribute() && !this.isCollection(); }


    /** 應該畫面時做的component 對應到的 物件, 都是根據父類再繼續點下去 例如 parent.child
     * 但設計了incestAttribute(), 要把grandson,和child 歸為同一個generation
     *
     * precise代表的是正確的父子關係,例如incest value, 如果要找到正確的父類, 就要透過 Precise
     *
     * force就是不要拿 ref 的 nodeOfOrigin, 因為imitate ref的 less 的className要唯一
     * */

    getPreciseViewParent(force = false) {
        return this.getPreciseParent((node) => node.isIncestView(), (node) => node.isView(), force);
    }

    getFieldNameOfSuggest() { return Util.camel(this.getName(), `suggest`); }

    getFieldNameOfDefaultValue() { return Util.camel(`default`, 'of', this.getName()); }

    getFieldNameOfValue() { return Util.camel(`value`, 'of', this.getName()); }

    getPreciseAttributeParent() { return this.getPreciseParent((node) => node.isIncestAttribute(), (node) => node.isAttribute()); }

    getPreciseParent(ruleOfIncest, ruleOfNode, force = false) {
        const nodeOfTarget = this.isReferenceImitateNode() && !force ? this.getNodeOfOrigin() : this;
        let parent = nodeOfTarget.getParentNode();

        if (ruleOfIncest(this)) {
            parent = parent.getParentNode();
        }
        while (parent && !ruleOfNode(parent)) {
            parent = parent.getParentNode();
            if (parent === undefined || parent.name === SignOfInValidNode) break;
        }
        return parent;
    }


    isIncestAttribute() { return this.incest && _.isEqual(this.incest.attribute, true); }

    hasValidParent() {
        const parent = this.getPreciseAttributeParent();
        return parent.isValidNode();
    }

    isValidNode() { return !_.isEqual(this.getName(), SignOfInValidNode); }

    isIncestView() { return this.incest && _.isEqual(this.incest.view, true); }

    hasViewChildren() {
        const children = this.getPreciseViewChildren();
        return children.length > 0;
    }

    hasAttributeChildren() {
        const children = this.getPreciseAttributeChildren();
        return children.length > 0;
    }

    getPreciseColumnChildren() {
        return this.getPreciseChildren(
          (node) => node.isColumnAttribute(),
          (node) => node.isIncestAttribute(),
          (node) => node.isAttribute(),
          (node) => node.isIncestAttribute(),
        )
    }

    getPreciseAttributeChildren() {
        return this.getPreciseChildren(
          (node) => node.isAttribute(),
          (node) => node.isIncestAttribute(),
          (node) => node.isAttribute(),
          (node) => node.isIncestAttribute(),
        )
    }

    /** child.isCollection() 是為了collection裡的屬性可能包含path*/
    getPreciseAttributePathChildren() { return _.filter(this.getPreciseAttributeChildren(), (child) => child.hasPath() || child.isCollection()); }

    getPreciseViewChildren() {
        return this.getPreciseChildren(
          (node) => node.isView(),
          (node) => node.isIncestView(),
          (node) => node.isView(),
          (node) => node.isIncestView())
    }

    hasIncrementUsage() { return this.isNumber() && _.isEqual(this.increment.enable, true); }

    /** @deprecated
     *  之前getPreciseChildren的規則，沒有用遞迴，敲可愛的波動拳
     * */
    _getPreciseChildren(isNode, isIncest, children = []) {
        for (const child of this.getChildren()) {
            if (!isIncest(child) && isNode(child))
                children.push(child);

            for (const grandson of child.getChildren()) {
                if (isIncest(grandson) && isNode(grandson)) {
                    children.push(grandson)

                    for (const sonOfThird of grandson.getChildren()) {
                        if (isIncest(sonOfThird) && isNode(sonOfThird))
                            children.push(sonOfThird)
                    }
                }
            }
        }
        return children;
    }

    /**
     * 以遞迴方式尋找當前節點底下符合條件的子節點。
     * 第一層：符合 ruleOfNode 且不符合 ruleOfIncest 的節點。
     * 第二層以後：符合 ruleOfNode 且符合 ruleOfIncest，並且其 getPreciseParent 對應到原始節點。
     *
     * @param {Function} ruleOfNode - 判斷節點是否符合條件的函式
     * @param {Function} ruleOfIncest - 判斷節點是否為 incest 的函式
     * @param {Function} ruleOfParent - 判斷父類規則的函式
     * @param {Function} ruleOfParentIncest - 父類 incest 規則的函式
     * @param {CodegenNode[]} [children=[]] - 結果累積器（遞迴用）
     * @param {number} [layer=1] - 當前遞迴層數
     * @param {CodegenNode} [node=this] - 當前處理的節點
     * @param {CodegenNode} [origin=this] - 原始的起始節點
     * @returns {CodegenNode[]} 符合條件的子節點陣列
     *
     * @example
     * // 取得所有 view 類型的子節點
     * const viewChildren = node.getPreciseChildren(
     *   (n) => n.isView(),
     *   (n) => n.isIncestView(),
     *   (n) => n.isView(),
     *   (n) => n.isIncestView()
     * );
     */
    getPreciseChildren(ruleOfNode, ruleOfIncest, ruleOfParent, ruleOfParentIncest, children = [], layer = 1, node = this, origin = this) {
        const isFirstLayer = layer === 1;
        const childNodes = node.getChildren();

        for (const child of childNodes) {
            if (
              (isFirstLayer && ruleOfNode(child) && !ruleOfIncest(child)) ||
              (!isFirstLayer && ruleOfNode(child) && ruleOfIncest(child) && child.getPreciseParent(ruleOfParentIncest, ruleOfParent) === origin)
            ) {
                children.push(child);
            }
            // 遞迴下一層
            this.getPreciseChildren(ruleOfNode, ruleOfIncest, ruleOfParent, ruleOfParentIncest, children, layer + 1, child, origin);
        }

        return children;
    }

    getPreciseAttributeNode() {
        if (!this.isAttribute() || this.isIncestAttribute())
            return this.getPreciseAttributeParent()
        else
            return this;
    }

    getPreciseAttributeName() { return this.getPreciseAttributeNode().getName(); }

    getPreciseAttributeParentName() { return this.getPreciseAttributeParent().getName(); }

    getChildNodeOfImage() {
        for (const child of this.getPreciseAttributeChildren()) {
            if (child.isImageView())
                return child;
        }
    }

    /** 表示這會在component裡面產生邏輯 */
    isView() { return !!this.view; }

    /** 表示這會在store裡面產生邏輯 */
    isAttribute() { return !!this.type; }

    getWrapProps() { return this.wrapProps || {}; }

    getListProps() { return this.listProps || {}; }

    setListProps(props = {}) {
        this.listProps = props;
    }

    /** @private 共用的 props 附加邏輯 */
    _appendPropsTo(target, ...props) {
        for (const prop of props) {
            target[Util.getObjectKey(prop)] = Util.getObjectValue(prop);
        }
    }

    appendListProps(...props) {
        this._appendPropsTo(this.listProps, ...props);
    }

    appendWrapProps(...props) {
        this._appendPropsTo(this.wrapProps, ...props);
    }

    setWrapProps(props = {}) {
        this.wrapProps = props;
    }


    getListWrapProps() { return this.listWrapProps || {}; }

    setListWrapProps(props = {}) {
        this.listWrapProps = props;
    }

    appendListWrapProps(...props) {
        this._appendPropsTo(this.listWrapProps, ...props);
    }

    setViewProps(props = {}) {
        this.props = props;
    }

    getViewProps() { return this.props || {}; }

    appendViewProps(...props) {
        this._appendPropsTo(this.props, ...props);
    }

    disableListEmptyTip() {
        this.listEmptyTip = {enable: false}
    }

    hasCookiePassword() { return !!this.password && _.size(this.password) > 0; }

    getStoreFolderName() { return Util.camel(_.reverse(this.getPreciseAttributeGenealogyNodes()).map((node) => node.getName())); }

    getStoreClassName() { return _.upperFirst(this.getStoreFolderName()); }

    getNameOfBaseClassName() { return `Base${this.getStoreClassName()}Store`; }

    hasPageTitle() {
        const node = this.getNodeOfComponent();
        return !Util.isUndefinedNullEmpty(node.hasPath()) && !Util.isUndefinedNullEmpty(node.getTitle());
    }

    setTitle(title) {
        this.title = title;
    }

    /** web page 顯示在橫槓上的字樣 */
    getTitle() { return this.title || ''; }

    pure() { return this.node; }

    hasChildren() {
        if (this.children !== undefined && !Array.isArray(this.children)) {
            throw new ERROR(9999, `${this.getName()} 宣告的 children 必須是array`);
        }

        return (Array.isArray(this.children) && this.children.length > 0);
    }

    getChildren() { return Array.isArray(this.children) ? this.children : []; }

    setChildren(children) {
        this.children = children;
    }

    hasParent() { return this.parent !== undefined; }

    getFunctionNameRemoveItems() { return `remove${_.upperFirst(this.getFieldName())}`; }

    /**
     * 組裝包含父類名稱的 CSS class name，用於 Less 和 React 組件的 className。
     * 支援 default、wrap、list、listWrap、skeleton 五種 type。
     * original 參數可還原 edit mode hack 之前的名稱。
     *
     * @param {string} [type='default'] - view 的類型 ('default'|'wrap'|'list'|'listWrap'|'skeleton')
     * @param {boolean} [original=false] - 是否使用 edit mode 前的原始名稱
     * @returns {string} 組裝後的 class name，例如 'ExamEditorQuestionCard'
     *
     * @example
     * node.organizeClassNameWithParent();            // => 'ExamQuestionTypography'
     * node.organizeClassNameWithParent('wrap');       // => 'ExamQuestionDivWrap'
     * node.organizeClassNameWithParent('default', true); // => edit mode 前的原始名稱
     */
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
            case 'skeleton':
                break;
            default:
                throw new ERROR(8017, `type can't be ==> ${type}`)
        }
        return Util.upperCamel(...parentNames, viewName, prefix);
    }

    /** 放在css用來做key => ExamEditorQuestionCard */
    getClassNameOfLessUsage(type = 'default') {
        return this.organizeClassNameWithParent(type, false)
    }

    /** 依據曹狀結構得到unique name,例如： ExamEditorQuestionCard*/
    getNameOfHierarchical() {
        return this.organizeClassNameWithParent(`default`, false)
    }

    getNameOfHierarchicalOfCookieUsage() {
        return `input4${this.getNameOfHierarchical()}`;
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

    isClickView() { return !!this.view && !!this.click; }

    hasWrapClick() { return !!this.wrapView && _.isEqual(true, this.wrapClick); }

    hasDeletedView() { return !!this.view && (!!this.deleted || this.hasIconOfDeleted()); }

    setClick(click) {
        this.click = click
    }

    getFunctionNameOfClicked(...extra) {
        const items = [];
        extra = _.filter(extra, (each) => !_.isEqual(_.toLower(each), 'default'))
        if (!Util.isUndefinedNullEmpty(extra)) items.push(...extra);
        return Util.camel(`on`, this.getPreciseNameOfAttributeView(), ...items, 'clicked');
    }

    getFunctionNameOfDeleted() { return Util.camel(`on`, this.getPreciseNameOfAttributeView(), 'deleted'); }

    getFunctionNameOfPlayEnd() { return Util.camel(`on`, this.getPreciseNameOfAttributeView(), 'ended'); }

    getFunctionNameOfOnPlay() { return Util.camel(`on`, this.getPreciseNameOfAttributeView(), 'Play'); }

    getFunctionNameOfPlayError() { return Util.camel(`on`, this.getPreciseNameOfAttributeView(), 'error'); }

    getFunctionNameOfSearchPressed() { return Util.camel(`on`, this.getPreciseNameOfAttributeView(), 'search', 'pressed'); }

    getPath() { return this.path; }

    setPath(path) {
        this.path = path;
    }

    getPathOfRouterString() {
        if (!this.hasPath()) return '';
        return this.getStringOfRouter(this.getPath());
    }

    /**
     * 將含有 :param 佔位符的路徑字串轉換為 ES6 template literal 格式。
     * 例如 '/user/:userId/post/:postId' 轉換為 '/user/${userId}/post/${postId}'。
     *
     * @param {string} string - 包含 :param 的原始路徑字串
     * @returns {string} 轉換後的 template literal 路徑
     *
     * @example
     * node.getStringOfRouter('/order/:orderId/item/:itemId');
     * // => '/order/${orderId}/item/${itemId}'
     */
    getStringOfRouter(string) {
        const params = this.getParamsOfString(string);
        /** undefined 是不要第一個param是 view */
        const path = [];
        for (const segment of string.split('/')) {
            if (_.startsWith(segment, ':'))
                path.push(`\$\{${params.shift()}\}`);
            else
                path.push(segment);
        }
        return path.join('/')
    }

    getStorageFolderOfRouterString() {
        if (!this.hasStorageFolder()) return '';
        return this.getStringOfRouter(this.getStorageFolderName());
    }

    /** /result/:resultId/id/:id => 把result它給拉出來 */
    getRootRoutePath() {
        const segment = this.getPath().split('/');
        segment.shift();
        return segment.shift();
    }

    /** /id/:id/userId/:id 把這種概念的param 給拉出來 */
    getSplitParamsOfString(string) {
        const params = [];
        for (const segment of string.split('/')) {
            if (_.startsWith(segment, ':')) {
                let param = Util.getNormalizedStringNotEndWith(Util.getNormalizedStringNotStartWith(segment, ':'), '?')
                params.push(param);
            }
        }
        return params;
    }

    /** 得到陣列 [tenant = 'school', group = 'classroom', uid = UserInfo.getUid()] 包含預設值'*/
    getParamsInPath(...others) {
        return this.getParamsOfString(this.getPath(), ...others);
    }

    getParamsOfStorageFolder(...others) {
        return this.getParamsOfString(this.getStorageFolderName(), ...others);
    }

    /** 得到字串 'tenant = 'school', group = 'classroom', uid = UserInfo.getUid()' 包含預設值'*/
    getStringOfParamsOfPath(...others) {
        return this.getParamsInPath(...others).join(',');
    }

    /**回傳string 'tenant, group ,uid'*/
    getStringOfArgumentsOfPath(...others) {
        return this.getStringOfParamsOfPath(...others);
    }

    getParamsOfString(string, ...others) {
        const params = [];

        if (Util.isUndefinedNullEmpty(string)) {
            params.push(...others)
            return params;
        }

        params.push(...this.getSplitParamsOfString(string));
        params.push(...others);

        return params;
    }

    /** 會一直往上找parent 直到符合predicate,不然就回傳 undefined */
    getParentBy(predicate = (node) => (true)) {
        let currentNode = this;
        while (currentNode.isValidNode()) {
            if (predicate(currentNode)) {
                return currentNode;
            }
            currentNode = currentNode.getParentNode();
        }
        return undefined;
    }

    /** 1:'' 2:'Wrap' 3:'List' 4:'ListWrap' */
    getFunctionNameOfInjectStyle(type = '') {
        return Util.camel(`get${type}InjectStyleOf`, this.getPreciseNameOfAttributeView());
    }

    getFunctionNameOfInjectView() { return Util.camel('get', 'inject', 'view', 'of', this.getPreciseNameOfAttributeView()); }

    getFunctionNameOfInjectWrapView() { return Util.camel('get', 'inject','wrap', 'view', 'of', this.getPreciseNameOfAttributeView()); }

    getFunctionNameOfInjectProps() { return Util.camel('get', 'inject', 'props', 'of', this.getPreciseNameOfAttributeView()); }

    /**
     * 從當前節點向上遍歷祖譜，收集所有符合 validate 條件的祖先節點，
     * 直到過到無效節點或 componentNode 為止。
     *
     * @param {Function} validate - 判斷節點是否應包含於結果中的函式
     * @param {Function} getParent - 取得下一個父節點的函式
     * @param {boolean} [excludeSelf=false] - 是否排除自身
     * @returns {CodegenNode[]} 祖先節點陣列（由近到遠）
     *
     * @example
     * // 取得 view 祖譜
     * const ancestors = node.getGenealogyNodes(
     *   (n) => n.isView(),
     *   (n) => n.getPreciseViewParent(true),
     *   true // 排除自身
     * );
     */
    getGenealogyNodes(validate, getParent, excludeSelf = false) {
        const nodes = [];
        let current = this;

        if (excludeSelf) {
            current = getParent(current);
        }

        while (!!current) {
            if (!current.isValidNode() || current.isComponentNode())
                break;

            if (validate(current)) {
                nodes.push(current);
            }

            current = getParent(current);
        }
        return nodes;
    }

    getArrayItemNode() {
        const clone = _.clone(this);
        clone.setType('arrayItem');
        return clone;
    }

    /** 指這個節點代表一個component view */
    isReferenceStructNode() { return this.isReferenceNode() && this.isStructNode(); }

    /** 如果要用在程式內的view做一些邏輯上的injectStyle,injectView,injectProps 或是onClicked ,中間的unique function name統一都用這個 */
    getPreciseNameOfAttributeView() {
        const nodes = this.getPreciseAttributeGenealogyNodes(true);
        const parentNames = _.reverse(nodes.map((node) => node.getName()));
        return Util.camel(...parentNames, this.getName(), this.getView());
    }

    getPreciseViewGenealogyNodes(excludeSelf = false) {
        return this.getGenealogyNodes((node) => node.isView(), (node) => node.getPreciseViewParent(true), excludeSelf)
    }

    getPreciseAttributeGenealogyNodes(excludeSelf = false) {
        return this.getGenealogyNodes((node) => node.isAttribute(), (node) => node.getPreciseAttributeParent(), excludeSelf)
    }

    getPreciseAttributeGenealogyName() {
        const nodes = this.getPreciseAttributeGenealogyNodes();
        const parentNames = _.reverse(nodes.map((node) => node.getName()));
        return Util.camel(...parentNames);

    }

    /** 因為array 的 child 如果找parent, 會是一個array的node, 沒有有用的資訊, 所以要再往上找*/
    getParentNode() {
        if (this.parent === undefined) {
            return new CodegenNode({name: SignOfInValidNode});
        }

        if (Array.isArray(this.parent)) {
            if (this.indexOfCollection > -1) {
                return this.parent[this.indexOfCollection];
            }
            return this.parent.parent;
        }
        return this.parent;
    }

    /** 請注意getParentNode的註記 */
    getParent() { return this.parent; }


    /** type = array 而且有path 的話, 會製造出太多document, fetch all的話就會花太多費用, 像是keywords, 或是首頁的banner
     *  不需要用 firestore compound queries function 的就應該設計成這樣.
     *
     *  cheep array 關鍵在於 remote fetch io上面的hack, 畫面上沒有任何差異
     * */
    isCheapArray() { return this.isArray() && _.isEqual(this.cheap, true); }

    isArray() { return _.isEqual(this.type, 'array'); }

    /** 就是單純的array,不需要store包過的應用，目前使用在"點點點"出來的彈跳選單 */
    isArrayOfField() { return _.isEqual(this.type, 'arrayOfField'); }

    useAsMuiImport = () => _.isEqual(this.type, SIGN_OF_IMPORT_MUI);

    isCollection() {
        return this.isArray() || this.isObject() || this.isArrayItem()
    }

    isRootPath() {
        return this.path && _.isEqual(this.path, '/')
    }

    getClassName() { return _.upperFirst(this.name); }

    hasURL() { return !_.isEmpty(this.url); }

    getURL() { return this.url; }

    isObject() { return _.isEqual(this.type, 'object'); }

    /** 用來放setter getter*/
    isObjectOfEmpty() { return _.isEqual(this.type, 'objectOfEmpty'); }

    needParentParam = () => !!this.needParam && this.needParam

    getDefaultValue = () => this.defaultValue;

    /**
     * 根據節點的 type 和 defaultValue 產生 Store 欄位的初始化值字串。
     * 處理 string、number、boolean、timestamp、array、object 等類型，
     * 並支援 i18n 轉換、陣列預設值的 normalize、admin 模式以及 ### 前綴的「表遞式」字串。
     *
     * @param {boolean} isAdmin - 是否為 admin 平台產生（admin 不處理 i18n）
     * @returns {string} 初始化值的程式碼字串
     *
     * @example
     * node.type = 'string';
     * node.getDefaultValueByType(false);  // => "''"
     *
     * node.type = 'number';
     * node.getDefaultValueByType(false);  // => "-1"
     *
     * node.type = 'object';
     * node.getDefaultValueByType(false);  // => "new Question({parentNode: this})"
     * node.getDefaultValueByType(true);   // => "{}"
     *
     * node.type = 'array'; node.defaultValue = [{id:'1', title:'範例'}];
     * node.getDefaultValueByType(false);  // => "[{id:i18n.location().xxx,...}].map(...)"
     */
    getDefaultValueByType(isAdmin) {

        const self = this;

        /**
         * i18n設計
         *
         * 把ancestor 裡的面遞迴nodes 改成如下 {
         *       id: i18n.location().infoOfCopyRightContentProjectId2,
         *       title: i18n.location().infoOfCopyRightContentProjectTitle2,
         *       image: i18n.location().infoOfCopyRightContentProjectImage2,
         *       trait: i18n.location().infoOfCopyRightContentProjectTrait2,
         *       descriptions: [{ statement: i18n.location().infoOfCopyRightContentProjectDescriptions2Statement0 }, { statement: i18n.location().infoOfCopyRightContentProjectDescriptions2Statement1 }],
         *     }
         *
         * 把array 的 defaultValue {aa:'aa',b:1}=> {aa:i18n.aa,,b=1 }*/

        function refactorI18nMapOfArrayDefaultValue(arrayOfDefaultValue, sign) {
            for (const obj of arrayOfDefaultValue) {
                for (const key in obj) {
                    const value = obj[key];
                    if (Array.isArray(value)) {
                        const latest = Util.camel(sign, key, `${_.indexOf(arrayOfDefaultValue, obj)}`);
                        refactorI18nMapOfArrayDefaultValue(value, latest)
                    }

                    /** icon要在 XXXStore 拿取 material-ocn/4{icon} */
                    if (Util.isString(value) && !_.isEqual(key, 'value') &&  !_.isEqual(key, 'icon')) {
                        const valueOfI18n = Util.camel(
                          self.getPreciseAttributeGenealogyName(),
                          sign,
                          key,
                          `${_.indexOf(arrayOfDefaultValue, obj)}`);
                        obj[key] = `###i18n.location().${valueOfI18n}`;
                    }
                }
            }
        }

        /**
         *  const object = {aa:i18n.aa}
         *  用JSON.stringify(object) 會變成 {aa,'i18n.aa'}
         *  所以用字串去輪詢內容而組合成需要的字串
         * */
        function toNormalizeArrayString(array) {
            const stmts = [];
            for (const object of array) {
                const _stmts = [];
                for (const keyOfMajor in object) {
                    const valueOfMajor = object[keyOfMajor];
                    if (Array.isArray(valueOfMajor)) {
                        _stmts.push(`${keyOfMajor}:${toNormalizeArrayString(valueOfMajor)}`)
                        continue;
                    }

                    if (Util.isObject(valueOfMajor)) {
                        const __stmts = [];
                        for (const keyOfMinor in valueOfMajor) {
                            const valueOfMinor = valueOfMajor[keyOfMinor];
                            if (Array.isArray(valueOfMinor)) {
                                __stmts.push(`${keyOfMinor}:${toNormalizeArrayString(valueOfMinor)}`);
                                continue;
                            }

                            if (Util.isString(valueOfMinor)) {
                                const latest = Util.camel(
                                  self.getPreciseAttributeGenealogyName(),
                                  keyOfMajor, keyOfMinor, `${_.indexOf(array, object)}`);
                                __stmts.push(`${keyOfMinor}: i18n.location().${latest}`)
                            }
                        }
                        _stmts.push(`${keyOfMajor}:{${__stmts.join(',')}}`)
                        continue;
                    }

                    if (Util.isString(valueOfMajor)) {
                        const latest = _.startsWith(valueOfMajor, '###') ? Util.getStringOfDropHeadSign(valueOfMajor, `#`) : `'${valueOfMajor}'`;
                        if (self.isArrayOfField() && _.isEqual(keyOfMajor, 'icon')) _stmts.push(`${keyOfMajor}: ${valueOfMajor}`); /** SIGN_OF_IMPORT_MUI */
                        else _stmts.push(`${keyOfMajor}:${latest}`);
                    } else {
                        _stmts.push(`${keyOfMajor}:${Util.toString(valueOfMajor)}`)
                    }
                }
                stmts.push(`{${_stmts.join(',')}}`);
            }

            return `[${stmts.join(',')}]`;

        }

        const defaultValue = this.getDefaultValue();

        if (!Util.isUndefinedNullEmpty(defaultValue)) {

            const stringOfDefault = _.startsWith(defaultValue, '###') ? Util.getStringOfDropHeadSign(defaultValue, `#`) : JSON.stringify(this.getDefaultValue());
            if (isAdmin) {
                // console.error(`WEB不能走到這哦！[i18n] defaultValue: ${stringOfDefault}`);
                return stringOfDefault;
            }

            if (this.isArrayOfField()) {
                const latest = Util.cloneDeep(this.getDefaultValue());
                refactorI18nMapOfArrayDefaultValue(latest);
                return `${toNormalizeArrayString(latest)}`;
            }

            if (this.isArray()) {
                const latest = Util.cloneDeep(this.getDefaultValue());
                refactorI18nMapOfArrayDefaultValue(latest);
                return `${toNormalizeArrayString(latest)}.map(each => new ${this.getClassName()}({...each, parentNode: this}))`
            }

            if (this.isString() && this.needI18nBehavior()) {
                const i18nOfDefaultValue = Util.camel(this.getPreciseAttributeGenealogyName());
                return `i18n.location().${i18nOfDefaultValue}`;
            }

            return stringOfDefault;
        }

        if(this.isString() && this.isImageView()) return `null` //image <img src='{path}' 不能有''的瞬間，會render cost
        else if (this.type === 'string') return `''`;

        if (this.type === 'boolean') return false;

        if (this.type === 'timestamp') {
            if (this.isTimeDateRangePickerView()) return this.getDefaultValue() ?? `[null, null]` /** 如果要有初始時間 [dayjs(),dayjs()]*/
            else if (this.isTimeDatePickerView()) return this.getDefaultValue() ?? `null` /** 如果要有初始時間 dayjs() */
            else if (this.isBelong2TimeDatePicker()) return this.getDefaultValue() ?? `null`
            else if (_.isNull(this.getDefaultValue())) return `null` /** timestamp可以給初始時間 */
            else return `this.getObjectOfCurrentTimeStamp()`;
        }

        if (this.isArray() || this.isArrayOfField()) {
            return `[]`;
        }

        if (this.isObjectOfEmpty()) {
            return `{}`;
        }

        if (this.isObject()) {
            return isAdmin ? `{}` : `new ${this.getClassName()}({parentNode: this})`;
        }

        if (this.type === 'number') {
            return `-1`;
        }
    }

    getFunctionNameInStoreGetter() { return `get${_.upperFirst(this.getFieldName())}`; }

    getFunctionNameInStoreComputedGetter() { return Util.camel('get', 'computed', this.getFieldName()); }

    /** 這個目的就是在View再運用store的值可以上一層加上封裝, 不用為了UI 去更改到store的邏輯, 這樣就會很乾淨*/
    getFunctionNameUsingInComponentGetter() { return Util.camel('get', this.getPreciseAttributeParent().getName(), this.getFieldName()); }

    isComponentNode() { return !!this.struct; }

    /** arrayItem 和 array 目前傻傻分不清楚, 先by case 處理*/
    getObservableName(force = false) {
        let objName;
        if (this.allowOfParam()) {
            switch (this.getType()) {
                case 'arrayItem':
                    objName = this.getName();
                    break;
                case 'array':
                    if (force) {
                        objName = this.getName();
                        break;
                    }
                    objName = this.getPreciseAttributeParentName();
                    break;
                case 'object':
                    objName = this.getPreciseAttributeParentName();
                    break;
                default:
                    objName = this.getPreciseAttributeParentName();
                    break;
            }
        }
        return objName;
    }

    getViewClassNameOfRenderView() {
        const names = _.reverse(this.getPreciseViewGenealogyNodes().map((each) => each.getFieldName()));
        return _.upperFirst(Util.camel(...names, this.isShadowView() ? ['Shadow'] : [], 'view'));
    }

    isShadowView() { return this.shadow; }


    getFunctionNameOfOnSelectedChange() { return Util.camel('on', this.getName(), `selected`, `change`); }

    getFunctionNameOfOnChanged() { return Util.camel(`on`, this.getPreciseNameOfAttributeView(), 'change'); }

    getFieldNameOfFuse() { return Util.camel('fuse', 'Of', this.getName()); }

    getFunctionNameOfAutoCompletedSuggestInitial() {
        const name = this.getName();
        return Util.camel('initial', name, /suggest/i.test(name) ? '' : 'suggest', 'behavior');
    }

    getFunctionNameOfSetter() {
        return `set${_.upperFirst(this.getFieldName())}`
    }

    getFunctionNameOfPushIntoArray() { return Util.camel('push', this.getFieldName()); }

    getFunctionNameOfModifiedSetter() { return Util.camel('set', `modified`, this.getName()); }

    getStatementOfComponentKey() {
        return this.getPreciseAttributeChildren().map((child) =>
          `\$\{${child.getPreciseAttributeParent().getName()}.${child.getFunctionNameInStoreGetter()}()\}`).join('')
    }

    getName() { return this.name; }

    /** 只有componentNode 可以用這個method*/
    getPreciseStoreName() {
        return this.isPreciselyEditableComponent() ? this.getStruct().getOriginalName() : this.getStruct().getName()
    }

    setName(name) {
        this.name = name;
    }

    getFunctionNameOfDetailUidGetter() { return Util.camel('get', this.getFieldNameOfDetailUid()); }

    getFieldNameOfDetailUid() { return Util.camel('uid', 'of', this.getNodeOfComponent().getName(), 'detail'); }

    getPlatform() {
        /** */
        return this.platform;
    }

    getComponents() {
        return (Array.isArray(this.components) ? this.components : []);
    }

    getCloudFunctions() { return this.cloudFunctions ?? []; }

    /**
     * 解析當前 Cloud Function 節點的資訊，包含函式名稱、類型、參數和處理方式。
     * 支援 schedule、httpOnRequest、httpOnCall 三種 Cloud Function 類型。
     *
     * @returns {{ functionName: string, fieldName: string, functionNameOfHandleBy: string, typeOfFunction: string, params: string[], argumentz: string[] }}
     * @throws {ERROR} 當 Cloud Function 類型未知時
     *
     * @example
     * const cloud = { name: 'checkoutByECPay', type: 'httpOnCall', schedule: undefined };
     * const info = cloudNode.getCloudFunctionInfo();
     * // info => {
     * //   functionName: 'checkoutByECPay',
     * //   fieldName: 'CheckoutByECPay',
     * //   functionNameOfHandleBy: 'handleHttpOnCall',
     * //   typeOfFunction: 'onCall(',
     * //   params: ['request'],
     * //   argumentz: ['data', 'session']
     * // }
     */
    getCloudFunctionInfo() {
        const functionName = this.getName();
        const fieldName = _.upperFirst(functionName);
        let params = [];
        let argumentz = [];
        let typeOfFunction = 'onCall(';
        let functionNameOfHandleBy = Util.camel('handle', this.getType());
        switch (this.getType()) {
            case 'schedule':
                typeOfFunction = `onSchedule('${this.schedule}',`;
                params.push('context');
                argumentz.push('context');
                break;
            case 'httpOnRequest':
                typeOfFunction = 'onRequest(';
                params.push('request', 'response');
                argumentz.push('request', 'response');
                break;
            case 'httpOnCall':
                params.push('request');
                argumentz.push('data', 'session');
                typeOfFunction = 'onCall(';
                break;
            default:
                throw new ERROR(9999, '6181, unknown cloud function type ')
        }
        return { functionName, fieldName, functionNameOfHandleBy, typeOfFunction, params, argumentz }
    }

    static find(node, predicate) {
        const nodes = [];
        if (CodegenNode.isCodegenNode(node) && predicate(node)) {
            nodes.push(node)
        }
        for (const child of node.getChildren()) {
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

    /** 在enrich node裡面的Array再加入結構*/
    static appendChildInArray(addressOfArray, rawJson) {
        if (Array.isArray(addressOfArray)) {
            const mother = addressOfArray[0].mother;
            mother.push(rawJson);
            rawJson.parent = addressOfArray.parent
            rawJson.mother = mother;
            const node = this.enrich(rawJson, addressOfArray);
            addressOfArray.push(node);
        } else {
            throw new ERROR(9999, 'addressOfArray is not array')
        }
    }

    static isCodegenNode(node) {
        return node instanceof CodegenNode;
    }

    static enrich(nodeOfRaw, parent) {
        let involution = new CodegenNode(nodeOfRaw);
        if (Array.isArray(nodeOfRaw)) {
            /** 隨便改變物件的型態,未來會出現各種bug */
            involution = [];
            involution.parent = parent;
            for (const child of nodeOfRaw) {
                child.parent = parent;
                child.mother = nodeOfRaw;
                involution.push(this.enrich(child, involution));
            }
        } else if (Util.isObject(nodeOfRaw)) {
            for (const key in nodeOfRaw) {
                if (Util.isOrEquals(key, ...this.doNotEnrichAttribute()))
                    involution[key] = nodeOfRaw[key];
                else if (Util.isObject(nodeOfRaw[key]) || Array.isArray(nodeOfRaw[key])) {
                    const obj = nodeOfRaw[key];
                    if (Array.isArray(parent)) {
                        const index = _.indexOf(nodeOfRaw.mother, nodeOfRaw);
                        obj.indexOfCollection = index;
                    }
                    obj.parent = parent;
                    involution[key] = this.enrich(obj, involution);
                }
            }
        }
        return involution;
    }

    getStruct() { return this.struct; }

    appendChildrenWithJsons(...objs) {
        for (const obj of objs) {
            const child = CodegenNode.enrich(obj);
            child.parent = this;
            this.appendChildren(child);
        }
    }

    appendChildrenWithJson(obj) {
        const child = CodegenNode.enrich(obj);
        child.parent = this;
        this.appendChildren(child);
    }

    deleteChildrenByNode(node) {
        _.remove(this.children, (child) => _.isEqual(node, child));
    }

}

export default CodegenNode;
