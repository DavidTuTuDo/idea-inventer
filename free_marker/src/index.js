import {exceptioner as ERROR, utiller as Util} from 'utiller';
import _ from 'lodash';
import fs from 'fs';
import libpath from 'path';
import mustache from 'mustache';
import {configerer} from "configerer";

/** author:明悅
 *  create time:Wed Mar 17 2021 13:17:01 GMT+0800 (Taipei Standard Time)
 */

let ENABLE_FAST_DEVELOP_MODE = false;
let TARGET_COMPONENT_FAST_DEVELOP_MODE = '';
let ENABLE_OF_PRETTIER = true;
/** 是array 也是 string */

const SIGN_OF_FUNCTION_START = `\/** -------------------- functions -------------------- **\/`;
const SIGN_OF_FIELD_START = `\/** -------------------- fields -------------------- **\/`;
const SIGN_OF_RESTFUL_API_START = `\/** -------------------- async api -------------------- **\/`;
const SIGN_OF_COLLECTION_START = `/** --- documents--- **/`;
const SIGN_OF_JSX_CONTENT = `<!-- jsx content -->`;
const SignOfInValidNode = 'SignOfInValidNode';
const useViewModuleAndComponentModuleMechanism = false;
const KEYWORD_OF_MODULARIZED = 'Modularized';
const PATH_OF_FREE_MARKER_TEMPLATE = '/Users/davidtu/cross-achieve/high/idea-inventer/free_marker/template';
const PATH_OF_COMPONENT_MODULE = `./src/modules`;
const FILENAME_OF_SOURCE_JS = `source.js`;
const ID_OF_DEFAULT_CHEAP_ARRAY = `contents`;
const STRING_OF_ID_OF_DEFAULT_CHEAP_ARRAY = `id`;
const FIELD_NAME_OF_INJECT_STORE = 'injectStore';
const TYPES_OF_PROPS_VIEW = ['list', 'listWrap', 'wrap', 'default'];
const LANGUAGES_OF_SUPPORT = ['zh_TW', 'zh_CN', 'en_US']
// let CURRENT_PROJECT = undefined;
// let CURRENT_PROJECT = './project-yueh-voice';
// let CURRENT_PROJECT = './project-kh-high';
// let CURRENT_PROJECT = './project-yueh-pu';
// let CURRENT_PROJECT = './project-davidtu-dev';
// let CURRENT_PROJECT = './project-dading';
let CURRENT_PROJECT = './project-sashanailgel';

const STRING_OF_INJECT_PARAM = 'paramsOfProxy';
const FIELD_NAME_OF_MAX_SIZE_OF_REQUEST = 'sizeOfPerRequest';
const FIELD_NAME_OF_SIZE_PER_PAGE = 'sizeOfPerPage';
const SIGN_OF_EMPTY_STORE = 'pure';
const FILE_EXTENSION_OF_I18N = 'i18n.stmts';


/** source.js 是專有名詞的概念*/

const LESS_MODULES = [
    {
        name: 'mobile',
        rule: 'only screen and (min-width: 320px) and (max-width: 600px)',
    },
    {
        name: 'tablet',
        rule: 'only screen and (min-width: 320px) and (max-width: 600px)'
    },
    {
        name: 'desktop',
        rule: 'only screen and (min-width: 601px)',
    },
]

/**
 * true, 就是區分component 和 view 概念, component會參照到view底下的module作為
 * 優點是 viewMoudule可以reuse, 缺點是會產出很多folder
 *
 * false, component裡面就會充滿 View = observer({store})
 * 優缺點就是前述的反之
 *
 * */

const VIEW_IMPORTS =
    [
        {
            from: `react-h5-audio-player`,
            views: ['AudioPlayer'],
            simplePath: true, /** from後面 不用接views import AudioPlayer from 'react-h5-audio-player' */
        },
        {
            from: `@mui/icons-material`,
            views: ['PhoneRounded', 'SearchRounded', 'MenuRounded', 'AccountCircle', 'MailOutlined', 'PhoneOutlined', 'ChevronRight', 'MoreHoriz', 'CopyAll', 'StarRounded'],
        },
        {
            from: `@mui/material`,
            views: ['Checkbox', 'Chip', 'Skeleton', 'Autocomplete', 'InputBase', 'Switch', 'SwipeableDrawer', 'MenuItem', 'Grid', 'Paper', 'Card', 'Avatar', 'AppBar', 'Toolbar', 'TextField',
                'Radio', 'RadioGroup', 'ButtonGroup', 'FormControlLabel', 'Slider', 'Typography', 'Button', 'IconButton',
                'Drawer', 'ListItem', 'List', 'Tabs', 'Tab', 'CircularProgress']
        },
        {
            from: `@mui/x-date-pickers`,
            views: ['LocalizationProvider', 'AdapterMoment'],
            object: true,
        },
        {
            from: `@mui/x-date-pickers-pro`,
            views: ['TimeRangePicker', 'DateTimeRangePicker', 'DateRangePicker'],
            object: true,
        },
        {
            from: `@mui/x-date-pickers`,
            views: ['TimePicker', 'DatePicker', 'DateTimePicker'],
            object: true,
        },
        {
            from: `react-slideshow-image`,
            views: ['Fade', 'Slide'],
            /** Fade就是有漸入漸出的效果,  Slide就可以滑動 */
            object: true, /** 就是要加上bracket {Fade} */
            simplePath: true
        },
        {
            from: `swiper/react`,
            views: ['Swiper', "SwiperSlide"],
            object: true,
            simplePath: true
        }
    ]

class CodegenNode {

    /** firebase上專屬的id好，這才能deploy 到雲端專案的uid*/
    idOfProject = ''

    /** 用來作為swipe autoloop的欄位*/
    autoplay = {
        delay: 0,
        disableOnInteraction: false,
    };

    color;
    /** 用在Button Chip */

    /**
     * 定義在structs那一層
     * { sample:'範例',example:'超級範例' }
     **/
    textsOfI18n = {};

    /**
     * 檢查是不是extra component，會造成 i18n duplicated
     * */
    isExtraComponent = false;

    implementsOfAlertItemClicked = [];
    /** alertMenu的 items,在點擊後的事件實作 */

    /** 如果 Typoghraphy 只有一個value，想要偷懶的加上Label 和icon 可以這樣做 */
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

    size = '';
    /** autocomplete textField 會用到*/

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

    localeOfServer = 'us-central1';
    /** firebase 的 firestore storage function,都可以選擇server的locale, default value就是'us-central1' */

    modulesOfIgnore = [];
    /** 要忽略的 componentModule(...epay,navigator,account) */

    alertMenu = {
        items: [] /** {icon:'MUI的icon代號',name:'download',notice:{title:'',content:''},loginO`nly:false} */
    }

    icon
    /** 在iconButton 和 Button都有作用 */

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

    maxSizeOfFetchItem = 50;
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
    /** 取消 初始畫面就發出fetch request, 放在struct level */

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
     * { where:(stmt) => stmt.where('year','==', 108)}
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
    /** 用來標記這個node的如果是ref, 而且還是獨立的一個store */

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
    /** {name,type:object|string }對應到web使用的cookie, 好處是cookie會加密 */

    wrap;
    /** 在view外面包一層div,作為彈性的使用 */
    /** 當view的種類不是container(paper,card,div之類的), 但是getPreciseViewChild()還有child時, 就自動放到 wrap 裡面*/

    outer;
    /** 搭配wrap服用的屬性, 可以放在wrap那一個圖層的效果 */

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

    deleted = false;

    defaultValue;
    /** 可以指定attribute的default value */

    struct;

    admin;

    /**
     * 目前機制有設計為1.ConfirmDialog 和 2.CustomViewDialog
     * 1.當有些按鈕需要double check, 必須搭配wrap:true 使用 alertDialog:{ content:string, title:string }
     * 2.當dialog是customView {  customView:functionName, needActionButtons:false },
     * customView 會拿到 {dialog,paramObject} 的 this.props,
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

        deleted: false,
        /** 放在onDeleted的邏輯裡,目前只有Chip*/

        globalOfRef: false,
        /** 把ref放到global */
    };
    /** 放admin的json file*/

    customizes = [];
    /** 如果src目錄下要有完全手寫的package,就夾在這裡面, 這個folder底下所有的檔案都會被persistent */

    /**
     * 設計那種children不能被observeble包住的狀況，他就必須待在array裏面(ex Swiper )
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

    /** 設計了defaultValue 然後想要快速地取消掉 */
    disableDefaultValue = false;

    /** TextField用的屬性，在框框底下增加小文字*/
    helperText = '';

    /** TextField用的屬性，在框框開始結束增加提示文字或icon */
    helperVisual = {}

    defaultOfHelperVisual = {
        enable: false,
        nameOfIcon: '', /** mui的icon名稱 例如: AccountCircle */
        position: 'end', /** end;start*/
        text: '', /** 顯示的字樣*/
        click: false,
    }

    belong2TimeDatePicker = false

    /** 用於註記這個TextField用來修飾AutoComplete*/
    belong2AutoComplete = false

    hasVariant() {
        return !_.isEmpty(this.variant);
    }

    getVariant() {
        return this.variant ?? 'outlined'
    }

    getSize() {
        return this.size
    }

    getRuleOfOuter() {
        return this.ruleOfOuter;
    }

    isAlertDialogNeedGlobalRef() {
        return this.getAlertDialog().globalOfRef;
    }

    isDisposablePage() {
        return this.getNodeOfComponent().disposablePage;
    }

    getSpecificComponent(nameOfComponent) {
        const node = this.getNodeOfSource();
        return _.find(node['components'],
            (component) => _.isEqual(component.name, nameOfComponent))
    }


    isBelong2TimeDatePicker() {
        return this.belong2TimeDatePicker;
    }

    hasSize() {
        return this.size && !_.isEmpty(this.size);
    }


    isBelongAutoComplete() {
        return !!this.belong2AutoComplete;
    }

    hasIcon() {
        return !_.isEmpty(this.icon);
    }

    getIcon() {
        return this.icon ?? '';
    }

    hasIconOfDeleted() {
        return !_.isEmpty(this.iconOfDeleted);
    }

    getIconOfDeleted() {
        return this.iconOfDeleted ?? 'DeleteRounded'
    }

    hasCheckedIcon() {
        return !_.isEmpty(this.checkedIcon);
    }

    getCheckedIcon() {
        return this.checkedIcon ?? '';
    }

    getHelperVisual() {
        return Util.mergeObject(this.defaultOfHelperVisual, this.helperVisual);
    }

    hasClickHelperVisual() {
        return this.getHelperVisual().click;
    }

    hasHelperVisual() {
        return this.getHelperVisual().enable;
    }

    getNameOfHelperVisualIcon() {
        return this.getHelperVisual().nameOfIcon;
    }

    useIconAsHelpVisual() {
        return !_.isEmpty(this.getHelperVisual().nameOfIcon);
    }

    useTextAsHelperVisual() {
        return !_.isEmpty(this.getHelperVisual().text);
    }

    getPositionOfHelperVisual() {
        return this.getHelperVisual().position;
    }

    isPositionLocateAtStart() {
        return _.isEqual(this.getPositionOfHelperVisual(), 'start');
    }

    getTextOfHelperVisual() {
        return this.getHelperVisual().text;
    }

    constructor(node) {
        this.raw = node;
        const self = this;
        for (const key in node) {
            self[key] = node[key];
        }
    }

    isSelected() {
        return _.isObject(this.select) && _.isArray(this.select.values);
    }

    hasLabel() {
        return this.label && !_.isEmpty(this.label);
    }

    hasHelperText() {
        return this.helperText && !_.isEmpty(this.helperText);
    }

    getHelperText() {
        return this.helperText ?? '';
    }

    getLabel() {
        return this.label ?? '';
    }

    hasLabelView() {
        return this.labelView && this.labelView.enable;
    }

    hasLabelViewIcon() {
        return this.labelView && this.labelView.labelIcon && this.labelView.labelIcon.enable;
    }

    hasDefaultValueOfLabelView() {
        return this.hasLabelView() && !_.isEmpty(this.labelView.defaultValue);
    }

    getFunctionMethods() {
        return this.methods;
    }

    getStructs() {
        return this.getNodeOfComponent().getComponents().map(component => component.getStruct());
    }

    hasTitle() {
        return !_.isEmpty(this.title);
    }

    hasColor() {
        return !_.isEmpty(this.color);
    }

    getColor() {
        return this.color ?? 'primary';
    }

    hasDescription() {
        return !Util.isUndefinedNullEmpty(this.description);
    }

    getValueOfTabDefault() {
        return this.valueOfTabDefault;
    }

    getCustomTextOfI18n() {
        return this.getNodeOfStruct().textsOfI18n ?? {};
    }

    getHostOfCloudFunction() {
        const node = this.getNodeOfSource();
        return `https://${node.localeOfServer}-${node.getName()}.cloudfunctions.net`;
        /** dev:  http://localhost:5001/${node.getName()}/${node.localeOfServer}; */
    }

    needTestButton() {
        return !!this.testButton;
    }

    isViewDefinedInProps() {
        return this.injectViewProp && !Util.isUndefinedNullEmpty(this.injectViewProp.name);
    }

    /** (params) => (params) => <CustomView {...params} />*/
    isViewPropsFunctionalized() {
        return this.isViewDefinedInProps() && _.isEqual(this.injectViewProp.functionalized, true);
    }


    setType(type) {
        this.type = type;
    }

    getFieldNameOfLabel(sign = '') {
        return Util.camel('label', 'of', this.getFieldName(), sign);
    }

    getFieldNameOfToggle(sign = '') {
        return Util.camel('toggle', 'of', this.getFieldName(), sign);
    }

    getFieldNameOfHelperText() {
        return Util.camel('helperText', 'of', this.getFieldName());
    }

    needI18nBehavior() {
        return this.l10n;
    }

    getFieldNameOfSelected() {
        return Util.camel('selected', this.getName());
    }

    getFunctionNameOfSelectSetter() {
        return Util.camel('set', this.getFieldNameOfSelected());
    }

    needAddImageButton() {
        return this.isArray() && this.selectImageButton;
    }

    /** */
    getProjectName() {
        const root = this.getNodeOfSource();
        return root.getName();
    }

    getIdOfProject() {
        const root = this.getNodeOfSource();
        return root.getIdOfProject();
    }

    getIdOfProject() {
        return this.idOfProject ?? '';
    }

    setDefaultValue(value) {
        this.defaultValue = value;
    }

    getFunctionNameOfSelectGetter() {
        return Util.camel('get', this.getFieldNameOfSelected());
    }

    getFieldNameOfPageTitle() {

        function normalize(title) {
            return _.split(title, 'Editor').shift();
        }

        return Util.camel('page', 'title', 'of', normalize(this.getPreciseAttributeGenealogyName()));
    }

    getFieldNameOfStart() {
        return Util.camel('start', 'of', this.getFieldName());
    }

    getFieldNameOfEnd() {
        return Util.camel('end', 'of', this.getFieldName());
    }

    isPathArray() {
        return this.isArray() && this.hasPath();
    }

    isColumnArray() {
        return this.isArray() && this.column;
    }

    isReferenceNode() {
        return !!this.ref;
    }

    hasCopyRightView() {
        return this.useCopyRightView.enable;
    }

    /** 在source.js 提示這個節點要超展開為 reference node, 這個method 應該只能用在還build store,component */
    isReferenceNotice() {
        return !!this.ref && _.isString(this.ref);
    }

    isReferenceImitateNode() {
        return this.isReferenceNode() && _.isEqual(this.getNodeOfOrigin().imitate, true);
    }

    needEmptyTip() {
        return this.listEmptyTip && this.listEmptyTip.enable;
    }

    hasReferenceParent() {
        const parent = this.getParentBy((node) => node.isReferenceNode())
        return parent !== undefined;
    }

    /**
     * 1.可以從任何一個節點找到node of component, 然後判斷是否為editable
     * 2.設計了component modoule的觀念, 就是能把component當作模組使用, 增加了component 和 store 增加了 conrete class , 這樣模組化的 邏輯 就可以放到module class,
     * 3.module class 會persist到 free_marker/src/modules/{name}/XXX.js , 這樣換專案就可以無痛移植.  */
    isModuleComponent() {
        const ancestor = this.getNodeOfComponent();
        return ancestor.isCommonModule ?? false;
    }

    getListOfModuleComponent() {
        const list = Util.getNamesOfFolderChild(PATH_OF_COMPONENT_MODULE).map((each) => _.trim(each));
        return _.filter(list, (each) => !Util.has(this.modulesOfIgnore, each, true));
    }

    getFieldNameOfDialogContent() {
        return Util.camel('dialog', 'content', 'of', this.getPreciseAttributeGenealogyName());
    }

    getFunctionNameOfDialogContentGetterWithBracket() {
        return `${Util.camel('get', this.getFieldNameOfDialogContent())}()`;
    }

    getFunctionNameOfDialogTitleGetterWithBracket() {
        return `${Util.camel('get', this.getFieldNameOfDialogTitle())}()`;
    }

    getFunctionNameOfDialogInputValueGetterWithBracket() {
        return `${Util.camel('get', this.getFieldNameOfDialogInputValue())}()`;
    }

    getFunctionNameOfDialogInputValueSetter() {
        return `${Util.camel('set', this.getFieldNameOfDialogInputValue())}`;
    }

    getFunctionNameOfDialogInputLabelGetterWithBracket() {
        return `${Util.camel('get', this.getFieldNameOfDialogInputLabel())}()`;
    }

    getFieldNameOfDialogTitle() {
        return Util.camel('dialog', 'title', 'of', this.getPreciseAttributeGenealogyName());
    }

    getFieldNameOfDialogInputValue() {
        return Util.camel('dialog', 'input', 'value', 'of', this.getPreciseAttributeGenealogyName());
    }

    getFieldNameOfDialogInputLabel() {
        return Util.camel('dialog', 'input', 'label', 'of', this.getPreciseAttributeGenealogyName());
    }

    /** exclude => 要略過的資料夾名稱 */
    getLessFilesOfModuleComponent(...exclude) {
        const modulesOfAllow = this.getListOfModuleComponent();
        const filesOfLess = modulesOfAllow.map((name) => Util.findFilePathBy(libpath.join(PATH_OF_COMPONENT_MODULE, name),
            (file) => _.isEqual(file.extension, 'less')))
        return _.flatten(filesOfLess);
    }

    /** 像是Switch, ToggleButton這類
     *
     * 因為我把needOnChangeBehavior這個method當作參參數傳遞, 會產生裏面呼叫的this 和 node 是不一樣的指標(例如this.view !== node.view),
     * 可能還不懂call by reference的實作, 只好把物件(node)傳遞進來     * */
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
        );
    }

    getDirectoryName() {
        return this.directory;
    }

    /** 就是有提供單選
     * 1.在store產生 selected{node.getName()}
     * 2.會加上onChange事件 setSelected{node.getName()}
     * 3.array裡的子類view, 不會用observer修飾, 不然會拿不到values
     * 4.selectedItem預設都是{value:'100',label:'100年'} label用來顯示標籤
     * */
    isSimpleSelected() {
        return (this.isArray() || this.isArrayItem()) && this.select && Util.isOrEquals(this.select.type, 'radio', 'spinner', 'button');
    }

    getTypeOfSimpleSelected() {
        return this.select.type;
    }

    getDefaultValueOfSimpleSelected() {
        return this.select.values;
    }

    isIndex() {
        return _.isEqual(this.index.enable, true);
    }

    getIndexRule() {
        return this.index.rule
    }

    getSelectedDefaultValue() {
        if (this.select && this.select.defaultValue) {
            return this.select.defaultValue;
        }
        return '';
    }

    getSelectedValueOfType() {
        if (this.select && this.select.typeOfValue) {
            return this.select.typeOfValue;
        }
        return `string`;
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

    /** arrayItem 是一個抽象的概念, 因為type='array', 必須建造出'QuestionsView(forEach邏輯)', 'QuestionView(viewModule)' */
    isArrayItem() {
        return _.isEqual(this.type, 'arrayItem');
    }

    getNodeOfSource() {
        const node = this.getParentBy((node) => node.isRootNode());
        return node;
    }

    getStorageSuperUserUid() {
        return this.superUserUid;
    }

    getConditions() {
        return this.conditions;
    }

    getNodeOfComponent() {
        const node = this.getParentBy((node) => node.isComponentNode());
        return node;
    }

    getNodeOfStruct() {
        if (this.isComponentNode()) {
            return this.getStruct();
        }
        const node = this.getParentBy((node) => node.isStructNode());
        return node;
    }

    getParamsInRouter(...others) {
        return this.getNodeOfComponent().getParamsInPath(...others);
    }

    getNodeOfOrigin() {
        return this.nodeOfOrigin ?? {};
    }

    needImplementAction() {
        return this.isReferenceStructNode() && this.getNodeOfOrigin().implementActions;
    }

    isStructNode() {
        const parent = this.getParentNode();
        return parent.isComponentNode();
    }

    isRootNode() {
        return !!this.components;
    }

    getStorageFolderName() {
        return this.storageFolder ?? 'public';
    }

    getFunctionNameOfGetCondition() {
        return Util.camel('get', this.getName(), 'conditions');
    }

    getFunctionNameOfPushCondition() {
        return Util.camel('push', this.getName(), 'conditions');
    }

    hasStorageFolder() {
        return !Util.isUndefinedNullEmpty(this.storageFolder);
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
        if (this.paginate)
            return this.paginate.size;
        return -1;
    }

    getMaxSizePerRequest() {
        return this.maxSizeOfFetchItem;
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
        return this.getPreciseViewParent().isValidNode();
    }

    hasValidAttributeParent() {
        return this.getPreciseAttributeParent().isValidNode();
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
        return Util.isOrEquals(_.toLower(this.getView()), 'grid', 'div', 'card', 'paper', 'swiper', 'swiperslide'
            , 'drawer', 'toolbar', 'appbar', 'iconbutton', 'list', 'listitem', 'menuitem', 'swipeabledrawer', 'tabs', 'react.fragment', 'LocalizationProvider');
    }

    getFunctionNameOfSwiper() {
        return Util.camel(`on`, this.getPreciseNameOfAttributeView(), 'Swipe');
    }


    getFunctionNameOfSwipeSlide() {
        return Util.camel(`on`, this.getPreciseNameOfAttributeView(), 'Slide');
    }

    getFunctionNameOfObservableObject() {
        return Util.camel('get', 'observable', this.getObservableName());
    }

    allowOfParam() {
        return (this.isAttribute() && this.hasValidAttributeParent()) || this.needParentParam() || this.isIncestAttribute();
    }

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

    isDisableInitFetch() {
        return !!this.disableInitFetch;
    }

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

    isColumnAttribute() {
        return this.hasPath() || (this.isAttribute() && !!this.column) || this.isLabelOrValue();
    }

    isLabelOrValue() {
        return this.isAttribute() && Util.isOrEquals(_.toLower(this.getName()), 'value', 'label')
    }

    isTimeStamp() {
        return _.isEqual(this.type, 'timestamp')
    }

    isViewModified() {
        return !!this.viewModified;
    }

    isNameModified() {
        return !!this.nameModified;
    }

    getSelectedCustomLabelView() {
        const view = this.select.labelView;
        return view;
    }

    isButton() {
        return _.isEqual(this.getView(), 'Button')
    }

    needIndependClick() {
        return this.independentClick;
    }

    getFieldNameOfRef() {
        return Util.camel('ref', 'of', this.getFieldName());
    }

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

    /** 當有 paginate 機制, limit 就會被寫在method裏面, 需要一個fetch all的*/
    getFunctionNameOfPureFetch() {
        return Util.camel(`fetch`, 'Pure', this.getFieldName());
    }

    getFunctionNameOfNextFetch() {
        return Util.camel(`fetch`, `next`, this.getFieldName())
    }

    getFunctionNameOfFetchItem() {
        return Util.camel(`fetch`, this.getName(), 'item')
    }

    getFunctionNameOfUpdateItem() {
        return Util.camel('update', this.getName(), 'item');
    }

    getFunctionNameOfUpdateItemAtomically() {
        return Util.camel('update', this.getName(), 'item', 'atomically');
    }

    getFunctionNameOfDeleteItem() {
        return Util.camel('delete', this.getName(), 'item')
    }

    getFunctionNameOfDelete() {
        return Util.camel('delete', this.getFieldName())
    }

    getFunctionNameOfSubmitItem() {
        return Util.camel('submit', this.getName(), 'item');
    }

    getFunctionNameOfSubmit() {
        return Util.camel('submit', this.getFieldName());
    }

    getFunctionNameOfFetchDocumentIds() {
        return Util.camel('fetchDocumentIds', 'of', this.getName());
    }

    getFunctionNameOfGetter() {
        return Util.camel('get', this.getName());
    }

    getFunctionNameOfGetters() {
        return Util.camel('get', this.getFieldName());
    }

    getFunctionNameOfClean() {
        return Util.camel('clean', this.getFieldName());
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
        return this.isPreciselyEditableComponent() ? this.originalView : this.view;
    }

    getOriginalName() {
        return this.isPreciselyEditableComponent() ? this.originalName : this.name;
    }

    getDescription() {
        const self = this;

        function getDescriptionStringByName(name) {
            switch (_.toLower(name)) {
                case 'value':
                    return `${self.getName()}邏輯處理的值`;
                case 'label':
                    return `${self.getName()}顯示的標籤`;
                default:
                    return `${self.getName()}沒有解釋`;
            }
        }

        return this.description ? this.description : getDescriptionStringByName(this.getName());
    }

    /** 這些屬性不可以enrich */
    static doNotEnrichAttribute() {
        return ['helperIcon', 'incest', 'label', 'labelIcon', 'useCopyRightView', 'textInput', 'labelView', 'ecpay', 'modulesOfIgnore', 'alertMenu', 'nodeOfOrigin', 'skeleton', 'simpleProps', 'select', 'methods', 'rapidBuild', 'linepay', 'listEmptyTip', 'increment', 'index', 'defaultValue', 'paginate', 'conditions', 'watermark', 'listStyle', 'wrapStyle', 'editIgnore',
            'initFetchOnlyLogin', 'permission', 'alertDialog', 'wrapContents', 'listContents', 'listWrapContents', 'contents', 'style', 'listWrapStyle',
            'extra', 'firebase', 'mother', 'parent', 'listProps', 'listWrapProps', 'wrapProps', 'props', 'admin', 'server', 'params', 'host', 'payload', 'autoplay', 'textsOfI18n']
    }

    setListContents(contents) {
        this.listContents = contents;
    }

    needLoadingSkeleton() {
        return this.isPathArray() && this.skeleton && this.skeleton.enable;
    }

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

    getSimpleProps() {
        return this.simpleProps;
    }

    appendSimpleProps(...props) {
        this.simpleProps.push(...props);
    }

    appendContent(...contents) {
        this.contents.push(...contents);
    }

    appendMethods(...methods) {
        this.getNodeOfComponent().methods.push(...methods);
        this.methods.push(...methods);
    }

    appendImportStmt(...stmt) {
        this.stmtsOfImport.push(...stmt);
    }

    getStmtsOfImport() {
        return this.stmtsOfImport;
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

    appendAlertDialogStmts(stmt, generator) {
        const self = this;

        function getTaskStmts() {
            if (self.hasConfirmDialog())
                return `task:async() => self.${self.hasDeletedView() && self.isAlertDialog4Deleted() ?
                    self.getFunctionNameOfDeleted() : self.getFunctionNameOfClicked()}(objectOfParam)`;
        }

        function getActionButtonStmts() {
            const need = self.getAlertDialog().needActionButtons ?? true;
            return `needActionButtons:${need}`
        }

        function getEnableCancelStmts() {
            const need = self.getAlertDialog().enableCancel ?? true;
            return `enableCancel:${need}`
        }

        function getCustomViewStmts() {
            if (self.hasCustomViewDialog()) {
                return `customView:${self.getAlertDialog().customView}`;
            }
        }

        function getParamObject() {
            const param = self.getObservableName();
            if (!Util.isUndefinedNullEmpty(param)) {
                return `paramObject:${param}`;
            }
        }

        function getStmtOfDialogTitle() {
            const dialog = self.getAlertDialog();
            return _.isEmpty(dialog.title) ? '' : `title: ${self.getObservableName()}.${self.getFunctionNameOfDialogTitleGetterWithBracket()}`;
        }


        function getStmtOfDialogContent() {
            const dialog = self.getAlertDialog();
            return _.isEmpty(dialog.content) ? '' : `content: ${self.getObservableName()}.${self.getFunctionNameOfDialogContentGetterWithBracket()}`;
        }


        function getStmtDialogInput() {
            const stmts = [];
            if (self.hasInputFieldDialog()) {
                stmts.push(`textInput:{enable:true`);
                stmts.push(`label:${self.getObservableName()}.${self.getFunctionNameOfDialogInputLabelGetterWithBracket()}`)
                stmts.push(`value:${self.getObservableName()}.${self.getFunctionNameOfDialogInputValueGetterWithBracket()}`)
                stmts.push(`onTextFieldChange:(event, value) => {${self.getObservableName()}.${self.getFunctionNameOfDialogInputValueSetter()}(self.getLatestValueByEvent(event))}`)
                stmts.push(`type:'${self.getAlertDialog().textInput.type}'}`);
                return stmts.join(',');
            }
            return '';
        }

        function getStmtOfFullWidth() {
            return self.hasFullWidthOfDialog() ? `fullWidth:true` : ``;
        }

        function getStmtOfDisposable() {
            if (!self.hasCustomViewDialog()) return '';
            const nodeOfSpecificComponent = self.getSpecificComponent(self.getAlertDialog().customView);
            return nodeOfSpecificComponent.isDisposablePage() ? `disposablePage:true` : ``;
        }

        if (this.hasAlertDialog()) {
            const nameOfRef = this.getFieldNameOfAlertDialog();
            if (this.isAlertDialogNeedGlobalRef()) {
                generator.appendField(nameOfRef, 'React.createRef()');
                generator.appendFunction(Util.camel('get', nameOfRef), [], [], [],
                    `return this.${nameOfRef}.current`)
            }

            const stmtOfRef = this.isAlertDialogNeedGlobalRef() ? `self.${nameOfRef}` : nameOfRef
            const props = [
                `ref:${stmtOfRef}`,
                `component:self`,
            ];
            props.push(getActionButtonStmts());
            props.push(getEnableCancelStmts());
            props.push(getTaskStmts());
            props.push(getStmtOfDisposable());
            props.push(getCustomViewStmts());
            props.push(getParamObject());
            props.push(getStmtDialogInput())
            props.push(getStmtOfDialogContent());
            props.push(getStmtOfDialogTitle());
            props.push(getStmtOfFullWidth());
            _.remove(props, (each) => _.isEmpty(each))
            stmt.push(`{
            this.renderAlertDialog(
            {
            ${props.join(',')}
            })}`)
        }
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

    hasInputFieldDialog() {
        return this.getAlertDialog().textInput.enable;
    }

    hasFullWidthOfDialog() {
        return this.getAlertDialog().fullWidth;
    }

    hasAlertMenu() {
        return _.size(this.alertMenu.items) > 0;
    }

    getAlertDialog() {
        return Util.mergeObject(this.defaultAlertDialog, this.alertDialog);
    }

    hasLoginRequiredDialog() {
        return !!this.loginRequiredAlert;
    }

    /** 就是點擊要再確認的那種dialog */
    hasConfirmDialog() {
        return !_.isEmpty(this.getAlertDialog().title);
    }

    /** 就是客製化view那種dialog */
    hasCustomViewDialog() {
        return !_.isEmpty(this.getAlertDialog().customView);
    }

    hasAlertDialog() {
        return this.hasConfirmDialog() || this.hasCustomViewDialog();
    }

    setContents(contents = []) {
        this.contents = [];
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
        if (!needDefault) {
            return this.wrapView;
        } else {
            return this.wrapView ?? 'div';
        }
    }

    setWrapView(view) {
        this.wrapView = view;
    }

    withoutWrapView() {
        return Util.isUndefinedNullEmpty(this.getWrapView(false));
    }

    getListView() {
        if (this.listView) {
            return this.listView;
        }
        return 'div';
    }

    disableSelectedArray() {
        this.select = {}
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

    hasDefaultValue() {
        return !Util.isUndefinedNullEmpty(this.defaultValue);
    }

    setView(view) {
        this.view = view;
    }

    getView(raw = false) {
        return raw ? this.view : _.replace(this.view, '.', ''); /** 處理React.Fragment*/
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
        const result = {...this.getDefaultStoragePermission(), ...customize};
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

    getFunctionNameOfClearCondition() {
        return Util.camel('clean', this.getName(), 'conditions')
    }

    getFunctionNameOfAutoCompleteInvalidate() {
        return Util.camel('invalidate', this.getName(), 'suggestion')
    }

    getFieldNameOfAlertDialog() {
        return Util.camel(this.getName(), this.getView(), 'alertDialog', 'ref');
    }

    getFieldNameOfAlertMenu() {
        return Util.camel(this.getName(), this.getView(), 'alertMenu', 'ref');
    }

    isWrapByAppBarView() {
        return _.isEqual(this.getWrapView(), 'AppBar');
    }

    /**isView 就是指gen出view class, 不然就是component */
    getSelfVariableStmts() {
        const self = this
        const stmts = [];
        if (this.hasAlertDialog() && !this.isAlertDialogNeedGlobalRef()) {
            stmts.push(`const ${this.getFieldNameOfAlertDialog()} = React.createRef()`);
        }

        if (this.hasAlertMenu()) {
            stmts.push(`const ${this.getFieldNameOfAlertMenu()} = React.createRef()`);
        }

        if (_.size(this.getFunctionMethods()) > 0) {
            const content = !Util.isUndefinedNullEmpty(this.getObservableName()) ? `object: ${this.getObservableName()}` : '';
            stmts.push(`const objectOfParam = { ${content}} /** {object,view} */`);
        }

        if (this.isWrapByAppBarView() && this.isScrollingHideDependOnRootNode()) {
            stmts.push(`const ScrollingHideWrap = self.HideOnScroll`);
        }

        if (this.isAutoCompleteView()) {
            stmts.push(`/** force update AutoCompleteView view usage */`)
            stmts.push(`const forceUpdate = _.toString(${this.getPreciseAttributeParentName()}.${Util.camel(`get`, this.getFieldNameOfSuggest())}s())+Util.getRandomHash()`)
        }

        if (this.isArray() && !this.isSimpleSelected() && !useViewModuleAndComponentModuleMechanism) {
            const className = this.getArrayItemNode().getViewClassNameOfRenderView();
            stmts.push(`const ${className} = self.${className}`);
        } else {
            const exist = {}
            for (const child of this.getPreciseViewChildren()) {

                if (child.isReferenceStructNode()) {
                    continue;
                }

                const view = child.getViewClassNameOfRenderView();
                if (!!!exist[view] && !useViewModuleAndComponentModuleMechanism)
                    stmts.push(`const ${view} = self.${view}`)
                exist[view] = true;
            }
        }

        if (!this.isArrayItem() && this.disableObservable) {
            for (const child of this.getPreciseViewChildren()) {
                const view = child.getViewClassNameOfRenderView();
                stmts.push(`const ${view} = self.${view}`)
            }
        }

        if (this.hasAlertMenu()) {
            stmts.push(`const implementsOfAlertItemClicked = [${this.implementsOfAlertItemClicked.join(',')}]`)
        }

        /** 把自己先轉變成參數,準備帶進去view 或是 ui裡面 像是navigator裡面 */
        if (this.allowOfParam()) {
            /** 因為是最小單位,所以父類帶進去得值必須是單數(不加上plural) */
            if (useViewModuleAndComponentModuleMechanism) {
                stmts.push(`const ${this.isArrayItem() ? this.getFieldName() : this.getPreciseAttributeParentName()}
                     = self.${self.getFunctionNameOfObservableObject()}()`)
            }

            if (this.isAttribute() && !this.isArrayItem()) {
                stmts.push(`const ${this.getFieldName()} = self.${this.getFunctionNameUsingInComponentGetter()}(${self.getPreciseAttributeParentName()})`)
            }
        }

        return stmts;
    }

    hasCookies() {
        return !!this.cookies && _.size(this.cookies) > 0;
    }

    needInjectStyle() {
        return !!this.injectStyle && this.injectStyle;
    }

    needInjectWrapStyle() {
        return !!this.injectWrapStyle && this.injectWrapStyle;
    }

    needInjectListStyle() {
        return !!this.injectListStyle && this.injectListStyle;
    }

    needInjectListWrapStyle() {
        return !!this.injectListWrapStyle && this.injectListWrapStyle;
    }

    needInjectView() {
        return !!this.injectView && this.injectView;
    }

    needInjectProps() {
        return !!this.injectProps && this.injectProps;
    }

    hasPath() {
        return !!this.path && !_.isEmpty(this.path);
    }

    getContents(generator) {
        const stmts = [];
        if (!!this.contents && _.isArray(this.contents)) {
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

    isNumber() {
        return _.isEqual(this.type, 'number');
    }

    isBoolean() {
        return _.isEqual(this.type, 'boolean');
    }

    isString() {
        return _.isEqual(this.type, 'string');
    }

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

    hasWrap() {
        return !!this.wrapView && !_.isEmpty(this.wrapView);
    }

    hasListWrap() {
        return !!this.listWrapView && !_.isEmpty(this.listWrapView);
    }

    hasNavigationView() {
        return !!this.navigation && !!this.navigation.view

    }

    getDeltaOfIncrement() {
        return this.increment.delta;
    }

    isOuter() {
        return !!this.outer && this.outer
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

    isChipView(type = 'default', node = this) {
        return this.isAttributeView('Chip', type, node);
    }

    isAlertDialog4Deleted() {
        return this.getAlertDialog().deleted;
    }

    isAlertDialog4Click() {
        return !this.getAlertDialog().deleted;
    }

    isTabItemView(type = 'default') {
        return this.isAttributeView('Tab', type);
    }

    isTabListView(type = 'default', node = this) {
        return node.isAttributeView('Tabs', type) || node.isAttributeView('TabList', type);
    }

    isSimperSwiper(type = 'default') {
        return this.isArray() && this.isAttributeView('SimpleSwiper');
    }

    hasAutoPlayＭechanism() {
        return this.autoplay && this.autoplay.delay > 0
    }

    isSimpleViewPager(type = 'default') {
        return this.isArray() && this.isAttributeView('SimpleViewPager', type);
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

    isSwitchView(type = 'default', node = this) {
        return node.isAttributeView('Switch', type);
    }

    isSliderView(type = 'default', node = this) {
        return node.isAttributeView('Slider', type);
    }

    isFloatBackgroundView(type = 'default') {
        return this.isAttributeView('FloatBackgroundView');
    }

    /**
     * onChange(event) 裡面的event = moment
     * 再透過這些方式取得表列 const YMDHM = Util.getCurrentTimeFormatYMDHM(event.valueOf())`);
     * */
    isTimeDatePickerView(type = 'default', node = this) {
        return node.isAttributeView('TimePicker', type) || node.isAttributeView('DatePicker', type) ||
            node.isAttributeView('DateTimePicker', type);
    }

    isTimeDateRangePickerView(type = 'default', node = this) {
        return node.isAttributeView('DateTimePickerTimeRangePicker', type) ||
            node.isAttributeView('DateTimeRangePicker', type) || node.isAttributeView('DateRangePicker', type);
    }

    isCheckboxView(type = 'default', node = this) {
        return node.isAttributeView('Checkbox', type)
    }

    isCustomImageButton(type = 'default') {
        return _.isEqual(this.getView(), 'CustomImageButton');
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
    isStringOrNumberAttribute() {
        return this.isView() && this.isAttribute() && !this.isCollection();
    }


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

    getFieldNameOfSuggest() {
        return Util.camel(this.getName(), `suggest`);
    }

    getFieldNameOfDefaultValue() {
        return Util.camel(`default`, 'of', this.getName());
    }

    getPreciseAttributeParent() {
        return this.getPreciseParent((node) => node.isIncestAttribute(), (node) => node.isAttribute());
    }

    getPreciseParent(isIncest, isNode, force = false) {
        const nodeOfTarget = this.isReferenceImitateNode() && !force ? this.getNodeOfOrigin() : this;
        let parent = nodeOfTarget.getParentNode();

        if (isIncest(this)) {
            parent = parent.getParentNode();
        }
        while (parent && !isNode(parent)) {
            parent = parent.getParentNode();
            if (parent === undefined || parent.name === SignOfInValidNode) break;
        }
        return parent;
    }


    isIncestAttribute() {
        return this.incest && this.incest.attribute;
    }

    hasValidParent() {
        const parent = this.getPreciseAttributeParent();
        return parent.isValidNode();
    }

    isValidNode() {
        return !_.isEqual(this.getName(), SignOfInValidNode);
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

    hasIncrementUsage() {
        return this.isNumber() && !!this.increment.enable;
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

                    for (const sonOfThird of grandson.getChildren()) {
                        if (isIncest(sonOfThird) && isNode(sonOfThird))
                            children.push(sonOfThird)
                    }
                }
            }
        }
        return children;
    }

    getPreciseAttributeNode() {
        if (!this.isAttribute() || this.isIncestAttribute())
            return this.getPreciseAttributeParent()
        else
            return this;
    }

    getPreciseAttributeName() {
        return this.getPreciseAttributeNode().getName();
    }

    getPreciseAttributeParentName() {
        return this.getPreciseAttributeParent().getName();
    }

    getChildNodeOfImage() {
        for (const child of this.getPreciseAttributeChildren()) {
            if (child.isImageView())
                return child;
        }
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

    appendWrapProps(...props) {
        for (const prop of props) {
            this.wrapProps[Util.getObjectKey(prop)] = Util.getObjectValue(prop);
        }
    }

    setWrapProps(props = {}) {
        this.wrapProps = props;
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

    disableListEmptyTip() {
        this.listEmptyTip = {enable: false}
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

    getNameOfBaseClassName() {
        return `Base${this.getStoreClassName()}Store`;
    }

    hasPageTitle() {
        const node = this.getNodeOfComponent();
        return !Util.isUndefinedNullEmpty(node.hasPath()) && !Util.isUndefinedNullEmpty(node.getTitle());
    }

    setTitle(title) {
        this.title = title;
    }

    /** web page 顯示在橫槓上的字樣 */
    getTitle() {
        return this.title ? this.title : '';
    }

    pure() {
        return this.node;
    }

    hasChildren() {
        if (this.children !== undefined && !_.isArray(this.children)) {
            throw new ERROR(9999, `${this.getName()} 宣告的 children 必須是array`);
        }

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

    hasDeletedView() {
        return !!this.view && !!this.deleted;
    }

    setClick(click) {
        this.click = click
    }

    getFunctionNameOfClicked(extra) {
        const items = [];
        if (!Util.isUndefinedNullEmpty(extra)) {
            items.push(extra);
        }

        if (this.isTextFieldView() && this.hasHelperVisual()) {
            items.push(this.getNameOfHelperVisualIcon(), 'icon');
        }

        return Util.camel(`on`, this.getPreciseNameOfAttributeView(), ...items, 'clicked');
    }

    getFunctionNameOfDeleted() {
        return Util.camel(`on`, this.getPreciseNameOfAttributeView(), 'deleted');
    }

    getFunctionNameOfPlayEnd() {
        return Util.camel(`on`, this.getPreciseNameOfAttributeView(), 'ended');
    }

    getFunctionNameOfOnPlay() {
        return Util.camel(`on`, this.getPreciseNameOfAttributeView(), 'Play');
    }

    getFunctionNameOfPlayError() {
        return Util.camel(`on`, this.getPreciseNameOfAttributeView(), 'error');
    }

    getFunctionNameOfSearchPressed() {
        return Util.camel(`on`, this.getPreciseNameOfAttributeView(), 'search', 'pressed');
    }

    getPath() {
        return this.path;
    }

    setPath(path) {
        this.path = path;
    }

    getPathOfRouterString() {
        if (!this.hasPath()) return '';
        return this.getStringOfRouter(this.getPath());
    }

    /** 得到 /username/${username}/id/${id} 這樣的字串 */
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

    getFunctionNameOfInjectView() {
        return Util.camel('get', 'inject', 'view', 'of', this.getPreciseNameOfAttributeView());
    }

    getFunctionNameOfInjectProps() {
        return Util.camel('get', 'inject', 'props', 'of', this.getPreciseNameOfAttributeView());
    }

    /** 找出祖譜 */
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
    isReferenceStructNode() {
        return this.isReferenceNode() && this.isStructNode();
    }

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

        if (_.isArray(this.parent)) {
            if (this.indexOfCollection > -1) {
                return this.parent[this.indexOfCollection];
            }
            return this.parent.parent;
        }
        return this.parent;
    }

    /** 請注意getParentNode的註記 */
    getParent() {
        return this.parent;
    }


    /** type = array 而且有path 的話, 會製造出太多document, fetch all的話就會花太多費用, 像是keywords, 或是首頁的banner
     *  不需要用 firestore compound queries function 的就應該設計成這樣.
     *
     *  cheep array 關鍵在於 remote fetch io上面的hack, 畫面上沒有任何差異
     * */
    isCheapArray() {
        return this.isArray() && _.isEqual(this.cheap, true);
    }

    isArray() {
        return _.isEqual(this.type, 'array');
    }

    /** 就是單純的array,不需要store包過的應用，目前使用在"點點點"出來的彈跳選單 */
    isArrayOfField() {
        return _.isEqual(this.type, 'arrayOfField');
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

    /** 用來放setter getter*/
    isObjectOfEmpty() {
        return _.isEqual(this.type, 'objectOfEmpty');
    }

    needParentParam() {
        return !!this.needParam && this.needParam
    }

    useDefaultValue() {
        return !this.disableDefaultValue;
    }

    getDefaultValue() {
        return this.useDefaultValue() ? this.defaultValue : undefined;
    }

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
                    if (_.isArray(value)) {
                        const latest = Util.camel(sign, key, `${_.indexOf(arrayOfDefaultValue, obj)}`);
                        refactorI18nMapOfArrayDefaultValue(value, latest)
                    }

                    if (_.isString(value) && !_.isEqual(key, 'value')) {
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
                    if (_.isArray(valueOfMajor)) {
                        _stmts.push(`${keyOfMajor}:${toNormalizeArrayString(valueOfMajor)}`)
                        continue;
                    }

                    if (_.isObject(valueOfMajor)) {
                        const __stmts = [];
                        for (const keyOfMinor in valueOfMajor) {
                            const valueOfMinor = valueOfMajor[keyOfMinor];
                            if (_.isArray(valueOfMinor)) {
                                __stmts.push(`${keyOfMinor}:${toNormalizeArrayString(valueOfMinor)}`);
                                continue;
                            }

                            if (_.isString(valueOfMinor)) {
                                const latest = Util.camel(
                                    self.getPreciseAttributeGenealogyName(),
                                    keyOfMajor, keyOfMinor, `${_.indexOf(array, object)}`);
                                __stmts.push(`${keyOfMinor}: i18n.location().${latest}`)
                            }
                        }
                        _stmts.push(`${keyOfMajor}:{${__stmts.join(',')}}`)
                        continue;
                    }

                    if (_.isString(valueOfMajor)) {
                        const latest = _.startsWith(valueOfMajor, '###') ? Util.getStringOfDropHeadSign(valueOfMajor, `#`) : `'${valueOfMajor}'`;
                        _stmts.push(`${keyOfMajor}:${latest}`);
                    } else {
                        _stmts.push(`${keyOfMajor}:${_.toString(valueOfMajor)}`)
                    }
                }
                stmts.push(`{${_stmts.join(',')}}`);
            }

            return `[${stmts.join(',')}]`;

        }

        const defaultValue = this.getDefaultValue();
        if (!Util.isUndefinedNullEmpty(defaultValue)) {
            const stringOfDefault = _.startsWith(defaultValue, '###') ? Util.getStringOfDropHeadSign(defaultValue, `#`) : JSON.stringify(this.getDefaultValue());
            if (isAdmin)
                return stringOfDefault;

            if (this.isArrayOfField()) {
                const latest = _.cloneDeep(this.getDefaultValue());
                refactorI18nMapOfArrayDefaultValue(latest);
                return `${toNormalizeArrayString(latest)}`;
            }

            if (this.isArray()) {
                const latest = _.cloneDeep(this.getDefaultValue());
                refactorI18nMapOfArrayDefaultValue(latest);
                return `${toNormalizeArrayString(latest)}.map(each => new ${this.getClassName()}({...each, parentNode: this}))`
            }

            if (this.isString() && this.needI18nBehavior()) {
                const i18nOfDefaultValue = Util.camel(this.getPreciseAttributeGenealogyName());
                return `i18n.location().${i18nOfDefaultValue}`;
            }

            return stringOfDefault;
        }

        if (this.type === 'string') {
            return `''`;
        }

        if (this.type === 'boolean') {
            return false;
        }

        if (this.type === 'timestamp') {
            if (this.isTimeDateRangePickerView()) return `[null, null]` /** 如果要有初始時間 [moment(),moment()]*/
            else if (this.isTimeDatePickerView()) return `null` /** 如果要有初始時間 moment() */
            else if (this.isBelong2TimeDatePicker()) return `null`
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

    getFunctionNameInStoreGetter() {
        return `get${_.upperFirst(this.getFieldName())}`;
    }

    /** 這個目的就是在View再運用store的值可以上一層加上封裝, 不用為了UI 去更改到store的邏輯, 這樣就會很乾淨*/
    getFunctionNameUsingInComponentGetter() {
        return Util.camel('get', this.getPreciseAttributeParent().getName(), this.getFieldName());
    }

    isComponentNode() {
        return !!this.struct;
    }

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

    isShadowView() {
        return this.shadow;
    }


    getFunctionNameOfOnSelectedChange() {
        return Util.camel('on', this.getName(), `selected`, `change`);
    }

    getFunctionNameOfOnChanged() {
        return Util.camel(`on`, this.getPreciseNameOfAttributeView(), 'change');
    }

    getFieldNameOfFuse() {
        return Util.camel('fuse', 'Of', this.getName());
    }

    getFunctionNameOfSetter() {
        return Util.camel('set', this.getFieldName());
    }

    getFunctionNameOfPushIntoArray() {
        return Util.camel('push', this.getFieldName());
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

    /** 只有componentNode 可以用這個method*/
    getPreciseStoreName() {
        return this.isPreciselyEditableComponent() ? this.getStruct().getOriginalName() : this.getStruct().getName()
    }

    setName(name) {
        this.name = name;
    }

    getFunctionNameOfDetailUidGetter() {
        return Util.camel('get', this.getFieldNameOfDetailUid());
    }

    getFieldNameOfDetailUid() {
        return Util.camel('uid', 'of', this.getNodeOfComponent().getName(), 'detail');
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

    getCloudFunctions() {
        return this.cloudFunctions ?? [];
    }

    getCloudFunctionInfo() {
        const functionName = this.getName();
        const fieldName = _.upperFirst(functionName);
        let params = [];
        let typeOfFunction = 'https.onCall';
        let functionNameOfHandleBy = Util.camel('handle', this.getType());
        switch (this.getType()) {
            case 'schedule':
                typeOfFunction = `pubsub.schedule('${this.schedule}').onRun`;
                params.push('context');
                break;
            case 'httpOnRequest':
                typeOfFunction = 'https.onRequest';
                params.push('request', 'response');
                break;
            case 'httpOnCall':
                params.push('data', 'session');
                typeOfFunction = 'https.onCall';
                break;
            default:
                throw new ERROR(9999, '6181, unknown cloud function type ')
        }
        return {functionName, fieldName, functionNameOfHandleBy, typeOfFunction, params}
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
        if (_.isArray(addressOfArray)) {
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
        if (_.isArray(nodeOfRaw)) {
            /** 隨便改變物件的型態,未來會出現各種bug */
            involution = [];
            involution.parent = parent;
            for (const child of nodeOfRaw) {
                child.parent = parent;
                child.mother = nodeOfRaw;
                // Util.insertToArray(involution, 0, this.enrich(child, involution))
                involution.push(this.enrich(child, involution));
            }
        } else if (_.isObject(nodeOfRaw)) {
            for (const key in nodeOfRaw) {
                if (Util.isOrEquals(key, ...this.doNotEnrichAttribute()))
                    involution[key] = nodeOfRaw[key];
                else if (_.isObject(nodeOfRaw[key]) || _.isArray(nodeOfRaw[key])) {
                    const obj = nodeOfRaw[key];
                    if (_.isArray(parent)) {
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

    getStruct() {
        return this.struct;
    }

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

class ClassGenerator {

    /** 為了讓import 不用擔心複數宣告 就用Object,empty 裡面放不需要變數宣告的import 例如 import from Firebase/database, 最後再一次gen*/
    imports = {all: {}, empty: []};
    hasConstructor = false;
    constructorStmt = [];
    hasExtends = false
    filePath = ``;
    classes = [];
    isSingletonFile = false;
    disableExportStmt = false;
    signature = true;
    needDefaultImports = true;
    needCreatedIndexFile = false;

    indexClassName = 'Index';
    indexFileMacros = [];
    indexFileSingleton = false;
    indexFileTailStmts = [];
    indexDisableExportStmt = false;

    constructor(path) {
        this.filePath = path;
        this.classes = [];

        if (!fs.existsSync(this.filePath)) {
            Util.persistByPath(path)
        }
        this.context = Util.getFileContextInRaw(this.filePath).split('\n');
    }

    async cleanBuild() {
        await Util.deleteSelfByPath(this.filePath, true);
        Util.persistByPath(this.filePath);
    }

    appendField(fieldName, defaultValue, macros = [], comments = [], type = '') {
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
        stmt.push(`${type} ${fieldName} = ${defaultValue};`);
        stmt.push(`\n`);
        Util.insertToArray(this.context, this.getIndexOfFieldSign(), ...stmt);
    }


    /** type =>|field|function|api|default ， 端看要加在哪個自定義區塊*/
    appendComment(stmt, type = 'default') {
        let index = -1;
        stmt = `\n/** ${stmt} */`
        switch (type) {
            case 'field':
                index = this.getIndexOfFieldSign();
                break;
            case 'function':
                index = this.getIndexOfFunctionSign();
                break;
            case 'api':
                index = this.getIndexOfRestfulApiSign();
                break;
        }
        if (index > 0)
            Util.insertToArray(this.context, index, stmt);
        else
            this.context.push(stmt);
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

        if (_.isEqual(decorator, 'inject')) {
            this.appendImport(`{inject}`, `mobx-react`)
        }

        if (_.isEqual(decorator, 'observer')) {
            this.appendImport(`{observer}`, `mobx-react`);
        }

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

    /** type : [httpOnCall,schedule,httpOnRequest] */
    appendCloudFunctionStatement(func, ...extra) {
        const self = this;

        function getStringOfFunctionFinally() {
            const _stmts = [];

            if (_.isEqual(func.getType(), 'httpOnRequest')) {
                if (needRegularResponse())
                    _stmts.push('response.send({succeed,data:result});');
                else {
                    _stmts.push('response.send(result);');
                }
            }

            if (_.isEqual(func.getType(), 'httpOnCall')) {
                _stmts.push('return {succeed,data:result};');
            }
            return _stmts.join('\n');
        }

        function needRegularResponse() {
            return _.isEqual(func.isRegularResponse, true);
        }

        function getStmtsByType() {
            const _stmts = [`let result = {};`,
                `let succeed = true;`,
                `try {`];
            _stmts.push(`result = await ${fieldName}.${functionNameOfHandleBy}(${params.join(',')});`);
            _stmts.push(...[`} catch (error) {`,
                `succeed = false;`,
                `result = error.message;`,
                `functions.logger.error(result);`,
                `}`,
                `${getStringOfFunctionFinally()}`
            ])
            return _stmts;
        }

        const {functionName, fieldName, functionNameOfHandleBy, typeOfFunction, params} = func.getCloudFunctionInfo()
        let stmts = [];

        stmts.push(`\n/** payload:${JSON.stringify(func.payload ?? 'needless payload')} */\n`)
        stmts.push(`exports.${functionName} = functions.${typeOfFunction}(async (${params.join(',')}) => {`)
        stmts.push(...getStmtsByType(params));
        stmts.push(`})`);
        this.appendInClassTail(this.context, ...['Util.disableLogMessagePersistent();'], ...stmts, ...extra)
    }

    appendAsyncFunction(functionName, params = [], macros = [], comments = [], ...contents) {
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
        stmt.push(`\n`);
        stmt.push(SIGN_OF_FUNCTION_START);
        stmt.push(`\n`);
        stmt.push(`\n`);
        stmt.push(SIGN_OF_RESTFUL_API_START);
        stmt.push(`\n`);
        stmt.push(`\n`);

        stmt.push(`}`);
        stmt.push(`\n`);
        stmt.push(`\n`);
        this.context.push(...stmt);
        this.classes.push(className);
        this.hasExtends = !!extendz;

        /** 有marco,就要配搭相對應的import */
        for (const macro of macros) {
            if (Util.has(macro, 'inject')) {
                this.appendImport(`{inject}`, `mobx-react`)
            } else if (Util.has(macro, 'observer')) {
                this.appendImport(`{observer}`, `mobx-react`);
            }
        }
    }

    hasClass() {
        return (_.size(this.classes)) >= 1;
    }

    /** 產出index.js 他會繼承當前的class */
    needIndexFile(classNameOfFile = 'Index', indexFileMacro = [], singleton = false, extraTailStmts = [], disableExportStmt = false) {
        this.indexClassName = classNameOfFile;
        this.indexFileMacros = indexFileMacro;
        this.indexFileSingleton = singleton;
        this.indexFileTailStmts = extraTailStmts;
        this.needCreatedIndexFile = true;
        this.indexDisableExportStmt = disableExportStmt
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
        if (ENABLE_FAST_DEVELOP_MODE) {
            const folderName = Util.getFolderNameOfFilePath(this.filePath);
            const fileNameExtension = Util.getFileNameExtensionFromPath(this.filePath);
            const fileName = Util.getFileNameFromPath(this.filePath)
            const ruleOfAllowFile = Util.or(
                (_.startsWith(fileName, `Base${_.upperFirst(TARGET_COMPONENT_FAST_DEVELOP_MODE)}`)),/** BaseXXX 必須建立 */
                (_.startsWith(fileName, `${KEYWORD_OF_MODULARIZED}${_.upperFirst(TARGET_COMPONENT_FAST_DEVELOP_MODE)}`) &&
                    Util.isEmptyFile(this.filePath)), /** 不存在的 ModularizedXXX 才建立,FAST MODE不會override files */
                (_.startsWith(folderName, TARGET_COMPONENT_FAST_DEVELOP_MODE) &&
                    _.isEqual(fileName, 'index') &&
                    Util.isEmptyFile(this.filePath)), /** 不存在的 {TARGET_COMPONENT_FAST_DEVELOP_MODE}/index.js 才建立,FAST MODE不會override files */
                _.isEqual(folderName, 'style'),
                _.isEqual(folderName, 'less'),
                _.isEqual(folderName, 'src'),
                _.isEqual(folderName, 'store'),
                _.isEqual(folderName, 'config') && !_.isEqual(fileNameExtension, 'index.js'),
                (Util.isOrEquals(folderName, ...LANGUAGES_OF_SUPPORT) && !_.isEqual(fileNameExtension, 'index.js')),
            )

            if (!ruleOfAllowFile) {
                console.log(`78673843 FAST MODE=>檔案不會建立, folderName=>'${folderName}':'${this.filePath}'`)
                /** 當fast build的時候, 只保留/style/. /less/. /TARGET_COMPONENT_FAST_DEVELOP_MODE開頭/.  */
                return;
            }
        }

        const stmts = [];
        if (_.size(this.classes) === 1) {
            if (!this.disableExportStmt) {
                if (this.isSingletonFile) {
                    stmts.push(`export default new ${this.classes[0]}()`);
                } else {
                    stmts.push(`export default ${this.classes[0]}`);
                }
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
            this.appendInClassHead(`/** this code are generated, modify is no sense. \n\tauthor:David Tu, \n\temail:freshingmoon0725@gmail.com \n\tupdateTime:${Util.getCurrentTimeFormat()} \n*/`);

        Util.appendFile(this.filePath, _.join(this.context, ''), true, true);

        try {
            if (ENABLE_OF_PRETTIER)
                await Util.prettier(this.filePath);
        } catch (error) {
            throw new ERROR(8011, error);
        }

        if (this.needCreatedIndexFile) {
            const index = new ClassGenerator(libpath.join(Util.getFileDirPath(this.filePath), 'index.js'));
            index.imports = _.clone(this.imports);
            // index.appendImport(this.getMainClassName(), `./${this.getMainClassName()}`);
            index.appendClass(this.indexClassName, {name: this.getMainClassName()}, ...this.indexFileMacros);
            index.setSingleton(this.indexFileSingleton);
            index.needSignature(false);
            index.disableExportStmt = this.indexDisableExportStmt;
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

    appendInClassHead(...stmt) {
        const stmts = [];
        stmts.push(...stmt);
        stmts.push('\n');
        Util.insertToArray(this.context, 0, ...stmts);
    }

    appendInClassTail(...stmt) {
        const stmts = [];
        stmts.push(...stmt);
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

    appendBatchLinesIntoFunctionSection(lines) {
        Util.insertToArray(this.context, this.getIndexOfFunctionSign(), ...lines);
    }

    insertBatchLinesIntoRestfulApiSection(lines) {
        Util.insertToArray(this.context, this.getIndexOfRestfulApiSign(), ...lines);
    }

    appendBatchLinesIntoFieldSection(lines) {
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
    env = 'dev'; //dev, prod
    platform; // web, admin,function, platform
    genComponentRootPath; // gen/app/src/component
    genStoreRootPath; // gen/app/src/store
    props;

    constructor(props) {
        this.props = props;
        if (!Util.isOrEquals(props.platform, 'web', 'admin', 'functions')) {
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
        this.pathOfSourceJS = libpath.join(this.projectRootPath, FILENAME_OF_SOURCE_JS);
        this.projectCommonSourcePath = libpath.join(props.projectRootPath, 'common', 'src');
        this.nodeOfAncestor = props.nodeOfAncestor ? props.nodeOfAncestor : CodegenNode.enrich(require(libpath.resolve(this.pathOfSourceJS)).default);

        this.env = props.env;
        /** 這就是 source.js 的進入點 */
    }

    isProduction() {
        return _.isEqual(this.env, 'prod');
    }

    cleanCache() {
        this.nodeOfAncestor = undefined;
        this.structs = undefined;
        this.props = undefined;
    }

    getStructs() {
        return this.nodeOfAncestor.components.map(component => component.struct);
    }

    getComponents() {
        return this.nodeOfAncestor.components;
    }

    isFunctionsPlatform() {
        return _.isEqual(this.platform, 'functions')
    }

    isWebPlatform() {
        return _.isEqual(this.platform, 'web')
    }

    isAdminPlatform() {
        return _.isEqual(this.platform, 'admin')
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
        await Util.prettier(filePath);
    }

    getAllCloudFunctions() {
        const source = this.nodeOfAncestor;
        const functions = source.getCloudFunctions();
        for (const component of _.filter(source.getComponents(), (each) => !each.isPreciselyEditableComponent())) {
            const bunchOfCloudFunction = component.getCloudFunctions();
            if (_.isArray(bunchOfCloudFunction)) {
                functions.push(...bunchOfCloudFunction.map((each) => {
                    each.isModule = true;
                    return each;
                }))
            }
        }
        return functions;
    }

    getStringFromMustache(templateFileName, variable = {}) {
        return mustache.render(Util.getFileContextInRaw(libpath.join(this.freeMarkerRootPath, templateFileName)), this.getMustacheRenderValues(variable));
    }

    getMustacheRenderValues = ({
                                   isCheapArray = false,
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
                               }) => {
        return {
            hasPath,
            name,
            isCheapArray,
            fieldName,
            functionName: functionName ? functionName : _.upperFirst(fieldName),
            modifiedFunctionName: `Modified${_.upperFirst(fieldName)}`,
            modifiedFieldName: `${Util.camel(`modified`, fieldName)}`,
            defaultValue,
            fieldUrl,
            title,
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
            titleOfProject
        }
    }

    /** 找到目錄下的folder,是這用來gen stores的 index file,有點偷懶, 應該要從source去組合出來 */
    getGenUnion(...folder) {
        let path = libpath.join(this.genRootPath, 'src', ...folder)

        return _.filter(Util.getChildPathByPath(path),
            each => each.isDirectory).map(each => each.dirName);
    }

    getGenStores() {
        return this.getAllStore();
    }

    getGenComponent() {
        const components = this.getComponents().map((each) => Util.camel(each.getName(), each.isPreciselyEditableComponent() ? 'editor' : ''));
        return _.without(components, SIGN_OF_EMPTY_STORE);
    }

    getAllStore() {
        const total = [];

        function appendStore(node, list = []) {
            if (CodegenNode.isCodegenNode(node) &&
                node.isCollection() &&
                !node.isReferenceNode() &&
                !_.isEqual(node.getName(), SIGN_OF_EMPTY_STORE)) {

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

class BaseBuilder extends PathBase {

    constructor(props) {
        super(props);
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

    getParamsOfDefaultValue(params, node, mustache = false) {
        return params.map(param => {
            if (_.isEqual(param.trim(), 'id')) {
                if (node.isCheapArray() && mustache)
                    return `${param} = 'contents'`;
                else
                    return `${param} = this.getId()`;
            } else if (Util.isOrEquals(param.trim(), 'item', 'object')) {
                return `${param} = this`;
            } else if (_.isEqual(param.trim(), 'restful')) {
                return `restful = {status: 'succeed', message: 'default reason'}`;
            } else if (_.isEqual(param.trim(), 'uid')) {
                return `${param} = UserInfoRef.getUid()`;
            } else if (_.isEqual(param.trim(), 'route')) {
                return `${param} = ''`;
            } else if (_.isEqual(param.trim(), 'conditions')) {
                return `${param} = []`;
            }
            return param;
        })
    }

    /** type 可以是 fetch|submit, submit,就會依據node的type去做事*/
    getParamsInFunctionByPlatform(node, type = 'fetch', uploadFile = false, isArgument = false, mustache) {
        const self = this;


        let params = uploadFile ? node.getParamsOfStorageFolder() : node.getParamsInPath();
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
                    params = [STRING_OF_ID_OF_DEFAULT_CHEAP_ARRAY, ...params];
                } else if (node.isPathArray()) {
                    params = [...params, `...conditions`];
                } else {
                    /** object */
                }
                break;
            case `fetch next items`:
                params = [...params, 'lastItem', '...conditions']
                break;
            case `submit items of cheap`:
                params = ['items', STRING_OF_ID_OF_DEFAULT_CHEAP_ARRAY, ...params]
                break;
            case `submit item of cheap`:
                params = ['item', 'id', ...params]
                break;
            case `delete item of cheap`:
                params = ['item', 'id', ...params]
                break;
            case `delete cheap`:
                params = ['id', ...params]
                break;
            case `fetch size of cheap`:
                params = [STRING_OF_ID_OF_DEFAULT_CHEAP_ARRAY, ...params];
                break;
            case `fetch items of limitation`:
                params = [...params, `action = 'in'`, `fieldName = 'name'`, '...valuesOfComparison'];
                break;
            case `delete items`:
                params = ['all = false', 'conditions', ...params];
                break;
            case `fetch item's doc ref`:
            case 'fetch item':
            case `delete item`:
                params = ['id', ...params];
                break;
            case `submit item`:
            case `update item`:
                params = ['item', 'id', ...params];
                break;
            case `submit items`:
            case `update items`:
                params = ['items', ...params];
                break;
            case `update item atomically`:
                params = ['predicate = async (item, transaction) => item', 'id', ...params]
                break;
            case `submit object`:
            case `update object`:
                params = ['object', ...params];
                break;
            case `update object atomically`:
                params = [`predicate = async (object,transaction) => object`, ...params]
                break;
            case `upload storage file`:
                params = ['blob', ...params];
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
            const paramsOfLatest = isArgument ? params : self.getParamsOfDefaultValue(params, node, mustache);
            return ['view = this.getComponent()', ...paramsOfLatest];
        }
        return params;
    }

    getArgumentsInFunction(node, type) {
        return this.getParamsInFunctionByPlatform(node, type, false, true).map((param) => param.split('=').shift());
    }

    getStringOfArgumentInFunction(node, type) {
        return this.getArgumentsInFunction(node, type).join(',');
    }
}

class StoreBuilder extends BaseBuilder {

    constructor(props) {
        super(props);
    }

    getFunctionsDependOnFieldType(type, object = {}) {
        const functions = this.getStringFromMustache(`store_${type}.mustache`, object)
        return functions;
    }

    async buildStoreIndexFiles() {
        /** 產生 store再project的index file */
        const BaseStoreFileName = 'BaseStore';
        const stores = this.getGenStores();
        const baseGenerator = new ClassGenerator(Util.persistByPath(libpath.join(this.genStoreRootPath, `${BaseStoreFileName}.js`)));
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
        baseGenerator.appendConstructor(...stores.map(child => `this.${child} = new ${_.upperFirst(child)}()`))
        baseGenerator.needIndexFile('Store');
        await baseGenerator.persist();
    }

    async buildFieldAttribute(generator, node) {

        const propsStmt = [];
        for (const child of node.getPreciseAttributeChildren()) {
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
                        paramString: this.getParamsOfDefaultValue(child.getParamsInPath(), child).join(','),
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
            if (child.isNumber() || child.isString()) {
                propStmt.push(`if(obj && obj.${fieldName})`);
            } else if (child.isBoolean())
                propStmt.push(`if(obj && _.isBoolean(obj.${fieldName}))`);
            else
                propStmt.push(`if(obj && !Util.isUndefinedNullEmpty(obj.${fieldName}))`);
            propStmt.push(`{`);
            if (child.isArray()) {
                if (!child.hasPaginate()) {
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
                else
                    propStmt.push(`this.${child.getFunctionNameOfSetter()}(obj.${fieldName})`);
            }

            propStmt.push(`}`);
            if (!child.isArrayOfField())
                propsStmt.push(...propStmt);

            if (child.isTimeDatePickerView() || child.isTimeDateRangePickerView()) {
                generator.appendImport('moment', `moment`)
            }

        }
        return propsStmt;
    }

    async buildBaseStore(node) {
        const self = this;

        function getChildFetchStmtV2() {
            const stmts = _.map(node.getPreciseAttributeChildren(), (child) => {
                return `async () => { 
                result.${child.getFieldName()} = ${getInitFetchStmtV2(child)};
                }`
            })
            return `${stmts.join(',')}`
        }

        function getCountOfThread(node) {
            const count = _.size(node.getPreciseAttributeChildren());
            return count > 1 ? count : 1;
        }

        function enrichStmtsOfObject(node, stmts) {
            const contents = [
                `{`,
                (node.hasPath()) ? `...(await this.${node.getFunctionNameOfFetch()}(${self.getStringOfArgumentInFunction(node, 'fetch')})),` : `...{}`,
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
        const className = node.getStoreClassName();
        const baseClassName = `Base${className}Store`;
        const moduleClassName = `${KEYWORD_OF_MODULARIZED}${className}Store`;
        const indexClassName = `${className}Store`;
        const baseGenerator = new ClassGenerator(libpath.join(this.genStoreRootPath, folderName, `${baseClassName}.js`));
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
                stmtsOfRangeNormalize.push(`result.${child.getFieldName()} = [this.normalizeAsMoment(result.${child.getFieldNameOfStart()}),this.normalizeAsMoment(result.${child.getFieldNameOfEnd()})];`)
            }

            if (child.isAutoCompleteView()) {
                baseGenerator.appendImport(`Fuse`, 'fuse.js');
                baseGenerator.appendFunction(Util.camel('initial', child.getName(), 'suggest', 'behavior'), ['array'], [], [],
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
            {name: `columnData`, fetcher: (node) => node.getPreciseColumnChildren()},
            {name: `data`, fetcher: (node) => node.getPreciseAttributeChildren()}
        ];

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
                        } else if (child.isTimeStamp()) {
                            value = `this.toFireBaseTimestampObject(this.${child.name})`
                        } else if (child.isString()) {
                            value = `Util.getStringOfNormalize(this.${child.getFieldName()},${child.getDefaultValueByType()})`
                        } else if (child.isNumber()) {
                            value = `Util.getNumberOfNormalize(this.${child.getFieldName()},${child.getDefaultValueByType()})`
                        } else if (child.isBoolean()) {
                            value = `Util.getBooleanOfNormalize(this.${child.getFieldName()},${child.getDefaultValueByType()})`
                        } else {
                            value = `this.${child.getFieldName()}`;
                        }
                        return `${key}:${value}`;

                    }
                ).join(','), '}')
        });

        if (_.isEqual(folderName, SIGN_OF_EMPTY_STORE)) {
            return;
        }

        baseGenerator.appendFunction('clean', [], ['action'], [],
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
                            return `this.${child.getFieldName()}.clean()`
                        } else {
                            return `this.${child.getFieldName()} = ${child.getDefaultValueByType()}`;
                        }
                    }
                ))

        baseGenerator.appendFunction('refreshLocally', [], ['action'], ['用來做i18n功能'],
            `super.refreshLocally()`,
            ...node.getPreciseAttributeChildren()
                .map((child) => {
                        if (child.isCheapArray() || child.isPathArray()) {
                            return `_.each(this.${child.getFunctionNameOfGetters()}() , (item) => item.refreshLocally())`
                        } else if (child.isArray()) {
                            return `this.${child.getFunctionNameOfSetter()}(...${child.getDefaultValueByType()})`;
                        } else if (child.isObject()) {
                            return `this.${child.getFieldName()}.refreshLocally()`;
                        } else {
                            if (child.isString())
                                return `this.${child.getFieldName()} = ${child.getDefaultValueByType()}`;
                            return '';
                        }
                    }
                ))


        /** 因為defaultValue沒有被store包裝過, 所以建構子要弄一下
         ** 2023/02/05 在宣告時就把物件包成store了
         baseGenerator.appendFunction('setDefaultValues', [], [], [],
         ...getDefaultValueSetterStmts(node)
         )
         * */
        baseGenerator.appendFunction(`initial`, ['obj'], ['action'], [],
            `super.initial(obj)`,
            ...propsStmt);
        baseGenerator.appendConstructor(
            `makeObservable(this)`,
            `this.initial(props)`);
        this.importStoreDefault(baseGenerator);

        if (node.isModuleComponent()) {
            const moduleGenerator = new ClassGenerator(libpath.join(this.genStoreRootPath, folderName, `${moduleClassName}.js`));
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
        generator.appendImport(`{Application}`, '../../');
    }


    getDecorateFetchStrings(isObject = false, ...contents) {
        let normalize = contents;
        if (isObject) {
            normalize = [
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

class RemoteFunctionHandler extends BaseBuilder {

    generator = undefined;

    constructor(props, classGenerator) {
        super(props);
        this.generator = classGenerator;
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
        const defaultParam = node.getParamsInPath();
        const pathStmt = `const path = \`${node.getPathOfRouterString()}\``;

        if (node.isCollection()) {
            for (const child of node.getPreciseAttributeChildren()) {
                if (recursively && child.hasChildren()) this.buildListenerFunction(child);
            }

            if ((node.isObject() && node.hasPath()) || node.isCheapArray()) {
                this.generator.appendFunction(Util.camel(`listen`, node.getFieldName()),
                    [...defaultParam, `callback = (data,error) => {}`],
                    [], [node.isCheapArray() ? 'attention! this is cheap array' : ''],
                    `${pathStmt}
                           const objName = '${node.getName()}'
                        return this.listenObject(path,objName,callback);`
                )
            } else if (node.isPathArray()) {
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

            }
        }
    }

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

        function getCommentDescription(node) {
            return `\/\/ ${node.getType()}:${node.getDescription()}`
        }

        function getConditionStmts(isFetchAll = false) {
            const stmts = [];
            if (self.isWebPlatform())
                stmts.push(...node.getConditions().map((each) => `${each}`));
            if (!isFetchAll && self.isWebPlatform()) {
                if (node.hasPaginate())
                    stmts.push(`{limit:(stmt) => stmt.limit(${node.getNameOfBaseClassName()}.${FIELD_NAME_OF_SIZE_PER_PAGE})}`)
                else
                    stmts.push(`{limit:(stmt) => stmt.limit(${node.getNameOfBaseClassName()}.${FIELD_NAME_OF_MAX_SIZE_OF_REQUEST})}`)
            }
            return stmts.join(',');
        }

        function generateApiFunction(node, name, logicStmts = [], type, isAsync = true, uploadFile = false) {
            const preStmts = [`const self = this`];
            preStmts.push(uploadFile ? `const folder = \`${node.getStorageFolderOfRouterString()}\`` :
                `const path = \`${node.getPathOfRouterString()}\``
            )

            let stmts = [];
            if (isAsync) {
                stmts.push(`const task = async () => {`)
                stmts.push(...logicStmts);
                stmts.push(`}`);
                if (self.isWebPlatform())
                    stmts.push(`return await self.runUIAsyncTask(task, '${type}', ${uploadFile ? 'folder' : 'path'}${appendViewInParamStmt()})`)
                else
                    stmts.push(`return await task()`);
            } else {
                stmts.push(...logicStmts);
            }

            const comment = `${node.getPreciseAttributeParentName()}-${node.getName()}:${type}`;
            const pramsOfWhole = self.getParamsInFunctionByPlatform(node, type, uploadFile);
            const stmtsOfWhole = [...preStmts, ...stmts];
            if (isAsync) {
                generator.appendAsyncFunction(name, pramsOfWhole, [], [comment],
                    ...stmtsOfWhole)
            } else {
                generator.appendFunction(name, pramsOfWhole, [], [comment],
                    ...stmtsOfWhole)
            }
        }

        if (node.isCollection()) {
            const contents = [];
            const children = [];

            if (generator === undefined)
                throw new ERROR(8016)

            for (const child of node.getPreciseAttributeChildren()) {
                if (!child.isColumnAttribute()) continue;

                if (child.hasStorageFolder()) {
                    generateApiFunction(
                        child, Util.camel('uploadStorageOf', child.getName()),
                        [
                            `return await self.uploadStorageFile(blob, folder);`,
                        ], `upload storage file`, true, true)
                }
                if (child.isString()) {
                    contents.push(`const _${child.getFieldName()} = Util.getStringOfNormalize(object.${child.getFieldName()}, ${child.getDefaultValueByType(self.isAdminORFunctionsPlatform())});${getCommentDescription(child)}`);
                } else if (child.isNumber()) {
                    contents.push(`const _${child.getFieldName()} = Util.getNumberOfNormalize(object.${child.getFieldName()}, ${child.getDefaultValueByType(self.isAdminORFunctionsPlatform())});${getCommentDescription(child)}`);
                } else if (child.isTimeStamp()) {
                    contents.push(`const _${child.getFieldName()} = !_.isUndefined(object.${child.getFieldName()}) ? 
                this.toFireBaseTimestampObject(object.${child.getFieldName()}) : this.getObjectOfCurrentTimeStamp();${getCommentDescription(child)}`);
                } else if (child.isObject() && self.isWebPlatform()) {
                    contents.push(`const _${child.getFieldName()} = object.${child.getFieldName()} ? 
                this.getColumnData(object.${child.getFieldName()}) : ${child.getDefaultValueByType(self.isAdminORFunctionsPlatform())}.columnData();${getCommentDescription(child)}`);
                } else if (child.isArray() && self.isWebPlatform()) {
                    contents.push(`const _${child.getFieldName()} = object.${child.getFieldName()} ? 
                object.${child.getFieldName()}.map((${child.getName()}) => this.getColumnData(${child.getName()})) : ${child.getDefaultValueByType(self.isAdminORFunctionsPlatform())};${getCommentDescription(child)}`);
                } else {
                    appendGeneralStmts(contents, child);
                }
                children.push(child.getFieldName());
            }

            function appendGeneralStmts(contents, child) {
                contents.push(`const _${child.getFieldName()} = object.${child.getFieldName()} ? object.${child.getFieldName()} : ${child.getDefaultValueByType(self.isAdminORFunctionsPlatform())};${getCommentDescription(child)}`);
            }

            if (!node.isCheapArray()) {
                contents.push(`const _updateTime = this._firebase().getServerTimeSymbol()`);
                children.push(`updateTime`);
            }

            contents.push(`const commitment = \{${children.map(child => `${child}: _${child}`).join(',')}\}`);

            if (node.hasPath()) {
                /** 有path 才代表 這是一個遠端也有的物件 */
                const functionNameOfNormalize = Util.camel('normalize', node.getName());
                generator.appendFunction(functionNameOfNormalize, ['object', 'update = false'], [], [],
                    ...contents,
                    'this.handleCommitment(update, commitment, object)',
                    'return commitment'
                )

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
                            `return this.fetchIdsOfDocument(path)`],
                        `fetch cheap ids of array`);

                    generateApiFunction(
                        node, Util.camel('submit', node.getFieldName()),
                        [`const commitments = items.map((item) => this.${functionNameOfNormalize}({...item, id}))`,
                            `return await self.submitObject(path,{
                                    ${ID_OF_DEFAULT_CHEAP_ARRAY}:commitments,
                                    updateTime:this._firebase().getServerTimeSymbol(),
                            }, id)`],
                        `submit items of cheap`)

                    generateApiFunction(
                        node,
                        node.getFunctionNameOfFetch(),
                        [`const result = await self.fetchObject(path, id)`,
                            `return result.${ID_OF_DEFAULT_CHEAP_ARRAY} ?? []`],
                        `fetch items of cheap`);


                    generateApiFunction(
                        node,
                        node.getFunctionNameOfSubmitItem(),
                        [
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
                            `const hasParent = this.getParentNode && this.getParentNode()`,
                            `const all = hasParent ? this.getParentNode().${Util.camel('get', node.getFieldName())}() : await self.${node.getFunctionNameOfFetch()}()`,
                            `await self.${node.getFunctionNameOfSubmit()}(${needView()} _.without(all, item), id)`,
                            `return hasParent ? this.getParentNode().${Util.camel('remove', node.getFieldName())}(item) : true`,
                        ],
                        `delete item of cheap`);

                    generateApiFunction(
                        node,
                        node.getFunctionNameOfDelete(),
                        [`return await self.deleteObject(path, id);`],
                        `delete cheap`,
                    )

                    generateApiFunction(
                        node,
                        Util.camel(`fetch`, `size`, `of`, node.getFieldName()),
                        [`return _.size(await self.${node.getFunctionNameOfFetch()}(${needView()}${self.getStringOfArgumentInFunction(node, 'fetch')}))`],
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

                        /** 當有 paginate 機制, limit 就會被寫在method裏面, 需要一個fetch all的*/
                        generateApiFunction(
                            node,
                            node.getFunctionNameOfPureFetch(),
                            [`return await self.fetchItems(path, ...conditions,${getConditionStmts(true)})`],
                            `fetch items of pure`);
                    }

                    generateApiFunction(
                        node,
                        Util.camel('get', node.getName(), 'item', 'doc', 'ref'),
                        [`return this.firestoreDocRef(path, id)`],
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
                        node.getFunctionNameOfFetchItem(),
                        ['const item =  await self.fetchItem(path, id)',
                            ...getFetchStmt(),
                            `return item`],
                        `fetch item`)

                    /** admins only , delete collection all */
                    generateApiFunction(
                        node,
                        Util.camel(`delete`, node.getFieldName()),
                        [`return await self.deleteItems(path, all, conditions)`],
                        'delete items')

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
                        node.getFunctionNameOfUpdateItemAtomically(),
                        [`return await self.updateItemAtomically(path,predicate,id)`],
                        'update item atomically')

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
                            `return await self.updateItems(path, ...commitments)`],
                        `update items`)

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

                } else if (node.isObject()) {
                    generateApiFunction(
                        node,
                        Util.camel('get', node.getName(), 'doc', 'ref'),
                        [`return this.firestoreDocRef(path,'${node.getName()}')`],
                        `get object doc ref`,
                        false)

                    generateApiFunction(
                        node,
                        Util.camel(node.getFunctionNameOfSubmit()),
                        [
                            `const commitment = this.${functionNameOfNormalize}(object)`,
                            `return await self.submitObject(path, commitment,'${node.getName()}')`],
                        `submit object`)

                    generateApiFunction(
                        node,
                        node.getFunctionNameOfFetch(),
                        [
                            `const object = await self.fetchObject(path,'${node.getName()}')`,
                            `${this.isWebPlatform() ? 'this.clean()' : ''}`,
                            `${this.isWebPlatform() ? 'this.initial(object)' : ''}`,
                            `return object`
                        ],
                        `fetch object`)

                    generateApiFunction(
                        node,
                        Util.camel('update', node.getFieldName()),
                        [`return await self.updateObject(path, '${node.getName()}',object)`],
                        `update object`);

                    generateApiFunction(
                        node,
                        Util.camel('update', node.getFieldName(), 'atomically'),
                        [`return await self.updateObjectAtomically(path, '${node.getName()}',predicate)`],
                        `update object atomically`);

                    generateApiFunction(
                        node,
                        node.getFunctionNameOfDelete(),
                        [`return await self.deleteObject(path, '${node.getName()}')`],
                        `delete object`);

                    for (const child of node.getPreciseColumnChildren()) {
                        if (child.hasIncrementUsage()) {
                            generateApiFunction(
                                node,
                                Util.camel('submit', 'increment', child.getFieldName()),
                                [
                                    `return await self.updateObject(path, '${node.getName()}',{${child.getFieldName()}: self.getObjectOfIncrement(${node.getDeltaOfIncrement()})},)`
                                ],
                                `increment attr of object`);
                        }
                    }
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
        generator.appendImport(`Config`, '../../config');
        generator.appendImport(`{Application}`, '../../');
        generator.appendImport('UserInfoRef', '../../base/BaseUserInfo');
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
        if (_.isEqual(baseComponentName, SIGN_OF_EMPTY_STORE)) {
            return;
        }


        const baseClassName = `Base${_.upperFirst(baseComponentName)}Component`;
        const moduleClassName = `${KEYWORD_OF_MODULARIZED}${_.upperFirst(baseComponentName)}Component`;

        const className = `${_.upperFirst(baseComponentName)}Component`;
        const folderName = baseComponentName;

        const baseGenerator = new ClassGenerator(libpath.join(this.genComponentRootPath, folderName, `${baseClassName}.js`));
        /**  baseGenerator.insertBatchLines(this.getComponentClassBody(baseClassName)); */
        // baseGenerator.appendImport(`{styled, alpha}`, '@mui/material/styles');
        baseGenerator.appendClass(baseClassName,
            (componentNode.isPreciselyEditableComponent() || componentNode.needEditorBase) ? {
                name: 'BaseEditorComponent',
                from: '../../base/BaseEditorComponent'
            } : {
                name: 'BaseComponent',
                from: '../../base/BaseComponent'
            }
        );

        baseGenerator.appendFunction('getComponentName', [], [], [], `return '${className}'`)

        this.importComponentDefault(baseGenerator);
        baseGenerator.appendImport('Style', '../../style');

        const paramsInPath = [];/**{name:functionName}*/
        for (const param of componentNode.getParamsInRouter()) {
            const fieldNameOfParam = this.getNormalizeFieldOfParamInPath(param);
            const functionNameOfParamConstraint = Util.camel('isValidOf', fieldNameOfParam);
            baseGenerator.appendConstructor(`this.${fieldNameOfParam} = this.isComponentView()? this.props.${fieldNameOfParam} : this.props.match.params.${param}`);
            paramsInPath.push({functionNameOfParamConstraint, param: fieldNameOfParam});
            baseGenerator.appendConstructor(`Util.appendInfo(\`param of url => ${fieldNameOfParam}:$\{this.${fieldNameOfParam}\}\`)`);
            baseGenerator.appendFunction(functionNameOfParamConstraint, [param], [], [],
                'return false;'
            )
        }

        baseGenerator.appendField(`nameOfComponent`, `'${componentNode.getName()}'`, [], [], 'static')

        if (_.size(paramsInPath) > 0) {
            /** 這個邏輯必須在fetch之前 */
            this.appendStmtIntoComponentDidMount(`if(!Util.and(${paramsInPath.map((each) => `this.${each.functionNameOfParamConstraint}(this.${each.param})`).join(',')}))
                this.getStore().setErrorMsg('網址參數異常')`)
        }

        if (componentNode.detailPage) {
            baseGenerator.appendFunction('isDetailPage', [], [], [],
                'return true');

            baseGenerator.appendFunction(componentNode.getFunctionNameOfDetailUidGetter(), [], [], [],
                `return this.${componentNode.getFieldNameOfDetailUid()}`);

            this.appendStmtIntoComponentDidMount(`
            this.${componentNode.getFieldNameOfDetailUid()} = this.props.match.params.${componentNode.getFieldNameOfDetailUid()};
            if(Util.isOrConditionOfUndefinedNullEmpty(this.${componentNode.getFieldNameOfDetailUid()}))
                this.getStore().setErrorMsg('網址參數異常');`);
        }

        if (_.isEqual(componentNode.getName(), componentNode.getParentNode().getNavigationComponentName())) {
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
                `Util.appendInfo('${functionNameOfImpl} not implemented')`
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

        this.appendRenderViewFunctions(componentNode.getStruct(), baseGenerator, componentNode.isPreciselyEditableComponent());

        if (componentNode.hasPageTitle()) {
            this.appendStmtIntoComponentDidMount(`this.invalidatePageTitle()`);
        }

        baseGenerator.appendFunction(
            {name: `invalidatePageTitle`, arrow: true}, [], [], [],
            `document.title = this.getStore().${this.getFunctionNameOfSimpleGetter(componentNode.getStruct().getFieldNameOfPageTitle(), false)}`
        )

        /** this.containedFetchAttribute(componentNode.getStruct())  讓每個component都執行fetch*/
        if (!componentNode.isDisableInitFetch()) {
            this.appendStmtIntoComponentDidMount(
                `const self = this;`,
                `let result = {}`,
                `if(self.getStore().isFetchAbleToGo() && this.isEnableInitFetch()) {`,
                `self.getStore().fetch(this).then((collection) => {
                    result = collection;                 
                })
                .catch((error) => {
                    self.getStore().setHasPageItems(false);
                    self.onInitialErrorHappened(error);
                }).finally(() => {
                Util.appendInfo('${componentNode.getName()} page initial fetch completed')
                self.getStore().onInitialFetchCompleted(result)})`,
                `} else { self.getStore().onInitialFetchCompleted() }`
            )
            baseGenerator.appendField('enableInitFetch', true)
            baseGenerator.appendFunction({name: `setEnableInitFetch`, arrow: true}, ['enable'], [], [],
                `this.enableInitFetch = enable`);

            baseGenerator.appendFunction({name: `isEnableInitFetch`, arrow: true}, [], [], [],
                `return this.enableInitFetch`);
        }

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
            stmts.push(`const store = this.isComponentView() ? this.props.${FIELD_NAME_OF_INJECT_STORE} : this.props.${componentNode.getPreciseStoreName()}`)
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
        if (_.isEqual(componentNode.getName(), componentNode.getParentNode().getNavigationComponentName())) {
            baseGenerator.appendFunction('isNavigator', [], [], [], 'return true');
        }

        if (componentNode.isModuleComponent()) {
            const moduleGenerator = new ClassGenerator(libpath.join(this.genComponentRootPath, folderName, `${moduleClassName}.js`));
            moduleGenerator.appendClass(moduleClassName, {
                name: baseClassName,
                from: `./${baseClassName}`
            })
            moduleGenerator.needSignature(false);
            moduleGenerator.needIndexFile(className, [`inject('${componentNode.name}')`, `observer`])
            this.importComponentDefault(moduleGenerator);
            await moduleGenerator.persist();
        } else {
            baseGenerator.needIndexFile(className, [`inject('${componentNode.name}')`, `observer`])
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

    getJSXStrings(param) {
        function normalize(value) {
            if (_.isNumber(value)) {
                return `{${value}}`;
            }

            if (_.isString(value) && _.startsWith(value, `###`)) {
                return `{${Util.getStringOfDropHeadSign(value, `#`)}}`;
            }

            if (_.isBoolean(value)) {
                return `{${_.toString(value)}}`;
            }

            return `{${JSON.stringify(value)}}`;
        }

        function appendViewsImport() {
            const generator = param.generator;
            const node = param.customViewNode;
            if (!!!generator) return;

            if (node) {
                if (useViewModuleAndComponentModuleMechanism) {
                    generator.appendImport(node.getViewClassNameOfRenderView(), node.isComponentNode() ?
                        `../../view/${_.lowerFirst(node.getViewClassNameOfRenderView())}` :
                        `../${_.lowerFirst(node.getViewClassNameOfRenderView())}`)
                }
            }

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

            if (node.isViewPropsFunctionalized()) {
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
                        generator.appendFunction(method.functionName, [], [], [],
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

        function appendOnChangedStmt() {
            generator.appendFunction(node.getFunctionNameOfOnSelectedChange(), ['value', `${node.getPreciseAttributeParentName()}`], [], [],
                `Util.appendError('${node.getFunctionNameOfOnSelectedChange()} not implemented')`)
            return `self.${node.getFunctionNameOfOnSelectedChange()}(value, ${node.getPreciseAttributeParentName()})`
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

        function getStmtsOfRenderEmptyView(node) {
            const stmts = []
            if (node.needEmptyTip()) {
                stmts.push(`{self.renderListEmptyView(${node.getFieldName()}, ${node.hasPath()})}`)
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
            generator.appendFunction(node.getFunctionNameUsingInComponentGetter(),
                [`${node.getPreciseAttributeParentName()}`], [], [],
                `return ${node.getPreciseAttributeParentName()}.${node.getFunctionNameInStoreGetter()}()`);
        }

        if (node.hasCustomViewDialog()) {
            const nameOfCustomView = node.alertDialog.customView;
            generator.appendImport(nameOfCustomView, `../${nameOfCustomView}`);
        }

        function getStmtsOfInjectListStyle(node) {
            return node.needInjectListStyle() ? `...self.${node.getFunctionNameOfInjectStyle('List')}(${node.getFieldName()}),` : '';
        }

        /** type是array就必須的包上一成List,可以調整物件方向 */
        if (node.isArray()) {
            const clazzName = node.getClassNameOfLessUsage('list');
            this.storeClassName({node, type: 'list'});

            const props = {
                className: clazzName,
                style: `###{${getStmtsOfInjectListStyle(node)}...${JSON.stringify(node.getListStyle())},...Style.${clazzName}}`,
                ...node.getListProps(),
            }

            if (node.needInjectListStyle()) {
                node.appendMethods({
                    functionName: node.getFunctionNameOfInjectStyle('List'),
                    param: [node.getFieldName()]
                })
            }

            const itemViewProps = {};
            itemViewProps['key'] = node.getUniqueIdStmt();
            itemViewProps[`${node.getName()}`] = `###${node.getName()}`
            const arrayItemNode = node.getArrayItemNode();
            let arrayItemViewStmts = node.disableObservable ? self.getJSXStringsByNode(generator, arrayItemNode, itemViewProps) : this.getJSXStrings({
                generator,
                customViewNode: arrayItemNode,
                typeOfClass: 'component',
                tag: `${arrayItemNode.getViewClassNameOfRenderView()}`,
                props: itemViewProps,
            })


            if (node.isSimpleSelected()) {
                props['onChange'] = `###(event, value)=>{
                    const latest = event.target.value;
                    ${node.getPreciseAttributeParentName()}.${node.getFunctionNameOfSelectSetter()}(latest)
                    ${appendOnChangedStmt()}
                }`;

                props['value'] = `###${node.getPreciseAttributeParentName()}.${node.getFunctionNameOfSelectGetter()}()`;
                delete itemViewProps[`${node.getName()}`];
                arrayItemNode.appendViewProps(itemViewProps);
                arrayItemNode.appendViewProps({value: `###${node.getName()}.value`})
                arrayItemNode.appendContent(`{${node.getName()}.label}`)
                arrayItemViewStmts = this.getJSXStringsByNode(generator, arrayItemNode)
            }

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
                    animation: 'wave'
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
                return node.needInjectListStyle() ? `...self.${node.getFunctionNameOfInjectStyle('ListWrap')}(${node.getFieldName()}),` : '';
            }

            if (node.hasListWrap()) {
                const clazzName = node.getClassNameOfLessUsage('listWrap');
                this.storeClassName({node, type: 'listWrap'});

                if (node.needInjectListWrapStyle()) {
                    node.appendMethods({
                        functionName: node.getFunctionNameOfInjectStyle('ListWrap'),
                        param: [node.getFieldName()]
                    })
                }

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
                        contents: [...node.getListWrapContents(), ...arrayStmts]
                    }
                )
            }
            return arrayStmts;
        }

        const contentStmts = [];
        for (const child of node.getPreciseViewChildren()) {
            if (!child.isView()) continue;
            if (child.isOuter()) continue;

            function appendParamStmt(node) {
                if (node.isViewPropsFunctionalized()) {
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

        let origin = this.getJSXStrings({
            tag: node.getView(true),
            generator,
            props: {...props, ...propsOfExtra},
            simpleProps,
            typeOfClass: 'component',
            contents: [...contentStmts, ...node.getContents(generator)],
        });

        if (node.hasWrap()) {
            const clazzName = node.getClassNameOfLessUsage('wrap');
            this.storeClassName({node, type: 'wrap'});

            const propOfWrap = {
                className: `${clazzName}`,
                style: `###{...${JSON.stringify(node.getWrapStyle())},...Style.${clazzName}}`,
                ...node.getWrapProps(),
            }

            const rule = node.getRuleOfOuter();
            origin = this.getJSXStrings({
                tag: node.getWrapView(),
                generator,
                props: {...propOfWrap, ...propsOfExtra},
                typeOfClass: 'component',
                contents: _.isEqual(rule, 'start') ? [...getOuterChildJSXStrings(node), ...origin, ...node.getWrapContents(generator)] :
                    [...origin, ...getOuterChildJSXStrings(node), ...node.getWrapContents(generator)]
            })
        }

        if (node.isWrapByAppBarView() && node.isScrollingHideDependOnRootNode()) {
            origin = this.getJSXStrings({
                tag: 'ScrollingHideWrap',
                typeOfClass: 'component',
                props: {...props, ...propsOfExtra},
                simpleProps: ['...self.props'],
                contents: [...origin]
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
                    `case 'duplicate':`,
                    `/** 快速複製一個相同屬性的項目,除了id以外 */`,
                    `const parentNode = ${node.getName()}.getParentNode()`,
                    `if(parentNode !== undefined) {`,
                    `const clonedObject = _.cloneDeep(${node.getName()}.columnData())`,
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

    normalizeJSXString(strings) {
        _.remove(strings, (each) => _.isEqual(each, SIGN_OF_JSX_CONTENT));
    }

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
                if (node.isViewPropsFunctionalized()) {
                    params.push(STRING_OF_INJECT_PARAM);
                }
                return params.join(',');
            }

            generator.appendFunction({
                    name: node.getViewClassNameOfRenderView(),
                    arrow: true,
                    decorator: 'observer',
                }, [`{${getStringOfParamOfRenderView(node)}}`], [], [],
                ...getContentStmt(node, generator)
            )
        }

        function generateViewClass(node) {
            const folderName = _.lowerFirst(node.getViewClassNameOfRenderView())
            const clazzName = node.getViewClassNameOfRenderView();
            const baseClazzName = `Base${clazzName}`;
            const viewGenerator = new ClassGenerator(libpath.join(self.genSourcePath, 'view', folderName, `${baseClazzName}.js`));
            viewGenerator.appendClass(baseClazzName, {
                name: 'BaseView',
                from: `../../base/BaseView`
            },);

            viewGenerator.appendImport('Style', '../../style');
            viewGenerator.appendFunction('render', [], [], [],
                ...getContentStmt(node, viewGenerator, true)
            );
            viewGenerator.appendFunction(node.getFunctionNameOfObservableObject(), [], [], [],
                `return this.props.${node.getObservableName()}`)
            viewGenerator.needIndexFile(clazzName, ['observer'])
            viewGenerator.persist().then();
        }

        function getContentStmt(node, _generator) {
            return [
                'const self = this',
                'const classes = this.props.classes',
                ...node.getSelfVariableStmts(),
                normalize(...self.getJSXStringsByNode(_generator, node))];
        }

        function appendViewFunctionClass(node) {
            if (node.isArrayItem() && node.isSimpleSelected()) return;

            if (!useViewModuleAndComponentModuleMechanism)
                appendFunctionWithFields(node);
            if (useViewModuleAndComponentModuleMechanism)
                generateViewClass(node)
        }

        if (isEditPage) {
            this.generateEditFunctionCallback(node, generator);
        }

        if (!this.hasRootRenderViewFunction) {
            generator.appendFunction('renderView', [], [], [],
                `const ${node.getName()} = this.getStore()`,
                ...getContentStmt(node, generator, useViewModuleAndComponentModuleMechanism));
            this.hasRootRenderViewFunction = true;
        }

        const existedFunctions = {};
        for (const child of node.getPreciseViewChildren()) {

            const functionName = child.getViewClassNameOfRenderView();
            /** 讓重複定義的view只出現一次, 像是space這樣的狀況 */
            if (existedFunctions[functionName]) continue;

            /** 避免掉進去遞迴build */
            if (child.isReferenceStructNode()) continue;

            for (const method of child.getFunctionMethods()) {
                generator.appendFunction(method.functionName,
                    method.params,
                    [],
                    [],
                    `Util.appendInfo('${method.functionName} not override')`
                )
            }

            for (const _import of child.getStmtsOfImport()) {
                generator.appendImport(_import.part, _import.from);
            }

            if (child.isArray()) {
                if (child.hasPaginate()) {
                    generator.appendFunction(`getThresholdOfScrollToBottom`, [], [], [], `return ${child.getPaginateThreshold()}`)
                    self.appendStmtIntoComponentDidMount(`const view = this;`)
                    generator.appendConstructor(`this.registerScrollToBottomJob(this.getStore().${child.getFunctionNameOfFetch()})`)
                }

                /** 因為type='array', 必須讓Array產出一個itemView, 但getJSXStringsByNode邏輯太嚴謹, 所以先用clone偽裝成一個object去generate */
                appendViewFunctionClass(child.getArrayItemNode())
            }
            appendViewFunctionClass(child)
            if (child.hasViewChildren()) {
                this.appendRenderViewFunctions(child, generator, isEditPage);
            }
            existedFunctions[functionName] = true;
        }
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
                [...standard.getEventParams()], [], [`event for ==> ${events.map((event) => event.getParentNode().getName()).join(' ,')}`],
                `EventBus.emit('${standard.getName()}',${standard.getEventParams().join(' ,')})`);
        }
        baseEventGenerator.needIndexFile('Event', [], true)
        await baseEventGenerator.persist();

    }

    async buildI18n() {

        /**type用來歸類class append 的內容 field|comment|*/
        function appendMapOfKeyValue(key, value, type = 'field') {
            arrayOfI18nKeyValue.push({key, value, type})
        }

        /** 把type=array的 defaultValue，再透過遞迴抓出來定義出新的i18n變數名稱 */
        function recursiveOfDoingSomethingMinor(arrayOfDefaultValue, child, sign = '') {
            if (!_.isArray(arrayOfDefaultValue)) {
                return;
            }

            for (const obj of arrayOfDefaultValue) {
                for (const keyOfMajor in obj) {
                    const valueOfMajor = obj[keyOfMajor];
                    if (_.isArray(valueOfMajor)) {
                        const latest = Util.camel(sign, keyOfMajor, `${_.indexOf(arrayOfDefaultValue, obj)}`);
                        recursiveOfDoingSomethingMinor(valueOfMajor, child, latest)
                    }

                    if (_.isObject(valueOfMajor)) {
                        for (const keyOfMinor in valueOfMajor) {
                            const valueOfMinor = valueOfMajor[keyOfMinor];
                            if (_.isArray(valueOfMinor)) {
                                const latest = Util.camel(sign, keyOfMinor);
                                recursiveOfDoingSomethingMinor(valueOfMinor, child, latest);
                            }

                            if (_.isString(valueOfMinor)) {
                                appendMapOfKeyValue(Util.camel(
                                        child.getPreciseAttributeGenealogyName(),
                                        keyOfMajor, keyOfMinor, `${_.indexOf(arrayOfDefaultValue, obj)}`),
                                    valueOfMinor)
                            }
                        }
                    }

                    if (_.isString(valueOfMajor) && !_.isEqual(keyOfMajor, 'value')) {
                        appendMapOfKeyValue(Util.camel(
                            child.getPreciseAttributeGenealogyName(),
                            sign,
                            keyOfMajor,
                            `${_.indexOf(arrayOfDefaultValue, obj)}`), valueOfMajor)
                    }
                }
            }
        }

        /**
         * 讓18n.js 可以有mapValue轉換如下
         *
         *     infoOfCopyRightContentProjectId2 = "12345";
         *
         *     infoOfCopyRightContentProjectTitle2 = "專案二";
         *
         *     infoOfCopyRightContentProjectImage2 = "https://s.yimg.com/cv/apiv2/social/images/yahoo_default_logo-1200x1200.png";
         *
         *     infoOfCopyRightContentProjectTrait2 = "模擬考題";
         *
         *     infoOfCopyRightContentProjectDescriptions2Statement0 = "描述一二三四五六";
         *
         *     infoOfCopyRightContentProjectDescriptions2Statement1 = "描述一二三四五六";
         *
         *     infoOfCopyRightContentProjectId3 = "123456";
         *
         */

        function recursiveOfDoingSomethingMajor(child) {
            if (child.hasDefaultValue()) {

                switch (child.getType()) {
                    case 'string':
                        appendMapOfKeyValue(Util.camel(child.getPreciseAttributeGenealogyName()), `${child.getDefaultValue()}`);
                        break;
                    case 'array':
                        recursiveOfDoingSomethingMinor(
                            child.isSelected() ? child.select.values : child.getDefaultValue(), child);
                        break;
                    case 'arrayOfField':
                        recursiveOfDoingSomethingMinor(child.getDefaultValue(), child)
                        break;

                }
            }

            if (child.hasConfirmDialog()) {
                const alert = child.getAlertDialog();
                appendMapOfKeyValue(child.getFieldNameOfDialogContent(), alert.content);
                appendMapOfKeyValue(child.getFieldNameOfDialogTitle(), alert.title);
            }

            if (child.hasInputFieldDialog()) {
                const input = child.getAlertDialog().textInput;
                appendMapOfKeyValue(child.getFieldNameOfDialogInputValue(), input.value);
                appendMapOfKeyValue(child.getFieldNameOfDialogInputLabel(), input.label);
            }

            /**
             2023.08.19 description放進去會爆量，先不處理，因為目前也只有editor頁面會出現
             if(child.hasDescription()){
             appendMapOfKeyValue(Util.camel('description','of',child.getPreciseAttributeGenealogyName()), child.getDescription());
             }
             */
            if (child.hasChildren()) {
                for (const grandson of child.getPreciseAttributeChildren()) {
                    recursiveOfDoingSomethingMajor(grandson);
                }
            }
        }

        /**
         * 清除i18n們
         * await Util.deleteSelfByPath(libpath.join(this.genSourcePath, 'i18n'), true); */
        const arrayOfI18nKeyValue = [];

        for (const component of _.orderBy(this.nodeOfAncestor.components, ['isCommonModule'])) {
            appendMapOfKeyValue(component.getName(), `${component.getName()}${component.isPreciselyEditableComponent() ? '-editor' : ''} 需要的字串`, 'comment')

            appendMapOfKeyValue(component.getStruct().getFieldNameOfPageTitle(), component.title);

            for (const child of component.getStruct().getPreciseAttributeChildren()) {
                /** ref 的東西就不要錯頻道，本來屬於episode, 結果跑去main(因為main ref:episode)*/
                if (!child.isReferenceNode())
                    recursiveOfDoingSomethingMajor(child);
            }

            _.each(component.getCustomTextOfI18n(), (value, key) => {
                appendMapOfKeyValue(Util.camel(component.getStruct().getName(), 'custom', key), value);
            })

        }

        const mapOfI18nStmtsOfCommonModule = {};
        for (const _module of _.filter(this.nodeOfAncestor.components, (com) => com.isModuleComponent() && !com.isExtraComponent)) {
            for (const lang of LANGUAGES_OF_SUPPORT) {
                const destination = libpath.join(PATH_OF_COMPONENT_MODULE, `${_module.getName()}/web/src/i18n/${lang}/${FILE_EXTENSION_OF_I18N}`)
                if (Util.isPathExist(destination))
                    Util.appendMapOfKeyArray(mapOfI18nStmtsOfCommonModule, lang, Util.getFileContextInRaw(destination));
            }
        }

        /** 為了視覺上合理化 */
        const arrayOfI18nReverse = _.reverse(arrayOfI18nKeyValue)
        for (const lang of LANGUAGES_OF_SUPPORT) {
            const classNameOfBase = `BaseMyI18n`;
            const classNameOfModularized = `${KEYWORD_OF_MODULARIZED}MyI18n`;
            const classNameOfIndex = `I18n`;

            const base = new ClassGenerator(libpath.join(this.genSourcePath, `i18n`, lang, `${classNameOfBase}.js`));
            base.appendClass(classNameOfBase, {name: 'BaseI18n', from: `../../base/BaseI18n`});
            const modularized = new ClassGenerator(libpath.join(this.genSourcePath, `i18n`, lang, `${classNameOfModularized}.js`))
            modularized.appendClass(classNameOfModularized, {name: classNameOfBase, from: `./${classNameOfBase}`});
            if (!_.isEmpty(mapOfI18nStmtsOfCommonModule[lang]))
                modularized.appendBatchLinesIntoFieldSection(['\n\n', ...mapOfI18nStmtsOfCommonModule[lang].join('\n\n')]);
            const index = new ClassGenerator(libpath.join(this.genSourcePath, `i18n`, lang, `index.js`))
            index.appendClass(classNameOfIndex, {name: classNameOfModularized, from: `./${classNameOfModularized}`});
            index.setSingleton(true);

            _.each(arrayOfI18nReverse, (object, index, all) => {
                switch (object.type) {
                    case 'field':
                        base.appendField(object.key, JSON.stringify(object.value));
                        break;
                    case 'comment':
                        base.appendComment(object.value, 'field');
                        break;
                }
            })
            await base.persist();
            await modularized.persist();
            await index.persist();
        }

        Util.copySingleFile(libpath.join(this.freeMarkerRootPath, 'template.i18n.index.js'),
            libpath.join(this.genSourcePath, 'i18n', 'index.js'), undefined, true);

        /** 把專案裡的i18n/index複製到當前gen/i18n/index, 不然rapid build會有bug
         for (const sourceFile of Util.findFilePathBy(this.projectPlatformPath,
         (each) => Util.has(LANGUAGES_OF_SUPPORT, each.folderName) && _.isEqual('index', each.fileName))) {
         let ignoreThisRun = false;
         const from = sourceFile.path;
         const dest = libpath.join(this.genRootPath, Util.getRelativePath(sourceFile.path, this.projectPlatformPath));
         Util.copySingleFile(from, dest, '', true);
         } */

    }

    async buildCookieFiles() {

        if (this.nodeOfAncestor.hasCookies()) {
            const baseCookieGenerator = new ClassGenerator(libpath.join(this.genSourcePath, `cookie`, `BaseCookie.js`));
            baseCookieGenerator.appendClass('BaseCookie', {name: 'Cookie', from: `../base/BaseCookie`});
            baseCookieGenerator.appendImport(`Cookies`, `universal-cookie`);
            baseCookieGenerator.appendImport(`Config`, `../config`);
            baseCookieGenerator.appendField(`cookie`, `new Cookies()`);
            baseCookieGenerator.appendField('password', 'Config.password');
            for (const cookie of this.nodeOfAncestor.cookies) {
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
                    `if(_.isEmpty(value)) return ${cookie.isObject() ? '{}' : ''}`,
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

    async buildWebpackNPackageJson() {
        await this.appendMustacheFile('web.package.json.mustache', libpath.join(this.genRootPath,
            `package.json`
        ), {
            projectName: this.nodeOfAncestor.name,
            projectVersion: this.nodeOfAncestor.version,
            projectDescription: this.nodeOfAncestor.description
        });
        await this.appendMustacheFile('webpack.config.js.mustache', libpath.join(this.genRootPath,
            `webpack.config.js`), {titleOfProject: this.nodeOfAncestor.getTitle()});
        await this.appendMustacheFile('babel.config.js', libpath.join(this.genRootPath,
            `babel.config.js`
        ));
    }

    async buildHtmlIndexAssetsFile() {
        const path = Util.persistByPath(libpath.join(this.genRootPath, 'dist'));
        await this.appendMustacheFile(
            'index.html.mustache',
            libpath.join(path, 'index.html'),
            {title: this.nodeOfAncestor.title}
        );
    }

    async buildCloudFunctionsApi() {
        const baseFunctionGenerator = new ClassGenerator(libpath.join(this.genSourcePath,
            `functions`, `BaseMyCloudFunctions.js`));
        baseFunctionGenerator.appendClass(
            `BaseMyCloudFunctions`, {name: `ClientRemoteApi`, from: '../base/ClientRemoteApi'}
        )

        for (const _func of this.getAllCloudFunctions()) {
            if (_.isEqual(_func.getType(), 'httpOnCall')) {
                baseFunctionGenerator.appendAsyncFunction(
                    `${_.lowerFirst(_func.getType())}${_.upperFirst(_func.getName())}`,
                    ['view', 'data'],
                    [], [`payload:${JSON.stringify(_func.payload ?? 'needless payload')}`],
                    `return await this.runUIAsyncCloudFunctionsTask('${_func.getName()}', data, view);`
                )
            }
        }
        baseFunctionGenerator.needIndexFile(`MyCloudFunctions`, [], true);
        await baseFunctionGenerator.persist();
    }

    async buildRouterFile() {

        function getStmtsOfLoginStmts(component) {
            const stmts = []
            if (component.loginOnlyPage) {
                stmts.push(
                    'if(!UserInfoRef.isLoginWithSucceed() && component !== undefined) {',
                    'component.enableLoginConfirmDialog()',
                    'return;}',
                )
            }
            return stmts;
        }

        function getStmtsOfRenewStore(nodeOfComponent) {
            const stmts = [];
            const nameOfStore = nodeOfComponent.isEditableComponent ?
                nodeOfComponent.getStruct().getOriginalName() : nodeOfComponent.getStruct().getName();
            if (nodeOfComponent.disposablePage) {
                stmts.push(`if(!this.isGotoSameRoute(route))`)
                stmts.push(`Application.getStore().${Util.camel('renew', nameOfStore)}()`);
            }
            return stmts;
        }

        function appendGotoFunction(generator, nodeOfComponent, isDetail = false) {
            function getArrayWithDefaultValue(array) {
                _.remove(array, (each) => Util.isUndefinedNullEmpty(each))
                return array.map((each) => `${each} = ''`)
            }

            const route = libpath.join(nodeOfComponent.getPathOfRouterString(),
                isDetail ? `\$\{${nodeOfComponent.getFieldNameOfDetailUid()}\}` : '',
                nodeOfComponent.routeHash ? '${Util.getRandomHash(15)}' : ''
            )

            const params = ['component', ...getArrayWithDefaultValue([...nodeOfComponent.getParamsInPath(), ...[isDetail ? nodeOfComponent.getFieldNameOfDetailUid() : undefined]])];

            generator.appendFunction({
                    name: Util.camel('goto', nodeOfComponent.name,
                        nodeOfComponent.isPreciselyEditableComponent() ? 'editor' : '',
                        isDetail ? 'detail' : '', 'page'),
                    arrow: true
                },
                params,
                [],
                [],
                ...getStmtsOfLoginStmts(nodeOfComponent),
                `const route = \`${route}\``,
                ...getStmtsOfRenewStore(nodeOfComponent),
                `this.routeTo(component, route);`,
                `this.setCurrentRoute(route)`,
                `return new URL(route, Config.host).href;`,
            )


            generator.appendFunction({
                    name: Util.camel('getUrlOf', nodeOfComponent.name,
                        nodeOfComponent.isPreciselyEditableComponent() ? 'editor' : '',
                        isDetail ? 'detail' : '', 'page'),
                    arrow: true
                },
                _.tail(params),
                [],
                [],
                `const route = \`${route}\``,
                `return new URL(route, Config.host).href;`
            )

        }

        const baseRouterGenerator = new ClassGenerator(libpath.join(this.genSourcePath,
            `router`,
            `BaseMyRouter.js`
        ));
        baseRouterGenerator.appendClass(
            `BaseMyRouter`, {name: `BaseRouter`, from: '../base/BaseRouter'}
        );
        baseRouterGenerator.appendImport('UserInfoRef', '../base/BaseUserInfo');
        baseRouterGenerator.appendImport('Config', '../config');
        baseRouterGenerator.appendImport('{ Application }', '../');

        for (const component of this.nodeOfAncestor.components) {
            if (!component.hasPath()) continue;

            appendGotoFunction(baseRouterGenerator, component);
            if (component.detailPage) {
                appendGotoFunction(baseRouterGenerator, component, true);
            }
        }
        baseRouterGenerator.needIndexFile('Router', [], true);
        await baseRouterGenerator.persist();
    }

    async buildAppIndexFiles() {
        /** 產生出key, 這樣每次path的param有改變,都會reload page*/
        function getPropOfKey(component) {
            const params = component.getParamsInPath();
            if (component.detailPage)
                params.push(component.getFieldNameOfDetailUid());

            const paramsOfProp = params.map((each) => `\$\{props.match.params.${each}\}`);
            if (_.size(paramsOfProp) > 0) {
                return {key: `###\`${paramsOfProp.join('')}\``}
            } else {
                return {}
            }
        }

        const appGenerator = new ClassGenerator(libpath.join(this.genSourcePath, `BaseApp.js`));
        appGenerator.appendImport(`{Provider}`, `mobx-react`);
        appGenerator.appendImport(` ReactDOM`, `react-dom`);
        appGenerator.appendImport(`{Route, Router, Switch}`, `react-router-dom`);
        appGenerator.appendImport(`{RouterStore, syncHistoryWithStore}`, `mobx-react-router`);
        appGenerator.appendImport(`{createBrowserHistory}`, `history`);
        appGenerator.appendImport(`React`, `react`);
        appGenerator.appendImport(`Store`, `./store`);
        appGenerator.appendImport(`Config`, `./config`);
        appGenerator.appendImport(`BaseComponent`, `./base/BaseComponent`);

        appGenerator.appendImport(``, `./less`);
        appGenerator.appendClass(`BaseApp`);
        appGenerator.appendFunction(`mount`, [], [], [],
            `ReactDOM.render(this.getRenderView(),
                    document.getElementById('app'))`);

        /**
         *
         * 如果升級到mobx6 react-mobx18.2
         *
         appGenerator.appendFunction(`mount`, [], [], [],
         `const container = document.getElementById('app');`,
         `const root = createRoot(container); // createRoot(container!) if you use TypeScript`,
         `root.render(this.getRenderView())`,
         );

         */

        appGenerator.appendField(`store`, `new Store()`);
        appGenerator.appendField(`history`, `syncHistoryWithStore(createBrowserHistory(), new RouterStore())`);
        appGenerator.appendField(`extraPages`, '[]');
        appGenerator.appendFunction(`pushPage`, [`page`], [], [], `this.extraPages.push(page)`)
        appGenerator.appendFunction(`getExtraPages`, [], [], [],
            `/** --- push <Router /> in to pages */`, `return this.extraPages`);
        appGenerator.appendField(`latestComponent`);
        appGenerator.appendFunction(Util.camel('get', 'latestComponent'), [], [], [],
            `return this.latestComponent;`
        )

        appGenerator.appendFunction(Util.camel('set', 'latestComponent'), ['component'], [], [],
            `if(component instanceof BaseComponent && component.isNotNavigatorNComponentView())`,
            `this.latestComponent = component.getComponentInstance()`
        )
        for (const component of this.getGenComponent()) {
            appGenerator.appendInClassHead(`import ${_.upperFirst(component)} from './component/${component}'`);
        }

        const childrenStmt = [];
        for (const component of this.nodeOfAncestor.components) {
            if (!component.hasPath()) continue;

            const renderStmts = this.getJSXStrings({
                    generator: appGenerator,
                    tag: _.upperFirst(component.getStruct().getName()),
                    props: {...component.extra, ...getPropOfKey(component)},
                    simpleProps: ['...props'],
                }
            );
            this.removeJSXSign(renderStmts);

            const path = libpath.join(component.path, component.detailPage ? `:${component.getFieldNameOfDetailUid()}?` : '');

            childrenStmt.push(...this.getJSXStrings({
                tag: `Route`,
                generator: appGenerator,
                props: {
                    exact: component.isRootPath() ? true : undefined,
                    path: path,
                    render: `###(props) =>
                     ${renderStmts.join('')}`,
                    /** component: `###${_.upperFirst(component.name)}`, */
                },
            }))
        }
        const switchStmt = this.getJSXStrings({
            tag: 'Switch',
            generator: appGenerator,
            contents: [...childrenStmt, `{this.getExtraPages()}`]
        });

        const routerStmt = this.getJSXStrings({
            tag: 'Router',
            generator: appGenerator,
            props: {history: `###this.history`},
            contents: [...switchStmt]
        })

        const providerStmt = this.getJSXStrings({
            tag: 'Provider',
            generator: appGenerator,
            simpleProps: ['...this.getStoreObject()'],
            contents: [this.nodeOfAncestor.hasNavigationView() ? '{this.getNavigationView(this.history)}' : '', ...routerStmt,
                this.nodeOfAncestor.hasCopyRightView() ? '{this.getCopyRightView(this.history)}' : '']
        })

        const whole = providerStmt;
        this.removeJSXSign(whole);
        if (this.nodeOfAncestor.hasNavigationView())
            appGenerator.appendFunction('getNavigationView', ['history'], [], [], `return (${this.getNavigationStmt(this.nodeOfAncestor.navigation).join('')})`)

        if (this.nodeOfAncestor.hasCopyRightView())
            appGenerator.appendFunction('getCopyRightView', ['history'], [], [], `return (${this.getCopyRightStmt(this.nodeOfAncestor.useCopyRightView).join('')})`)

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

        appGenerator.appendFunction(Util.camel('get', 'store'), [], [], [],
            `return this.store`
        )

        appGenerator.appendFunction({
            name: `getNavigatorRef`,
            arrow: true
        }, [], [], [], `return this.navigatorRef.current`);
        if (this.nodeOfAncestor.hasNavigationView())
            appGenerator.appendConstructor(`this.navigatorRef = React.createRef()`);
        if (this.nodeOfAncestor.hasCopyRightView())
            appGenerator.appendConstructor(`this.copyRightRef = React.createRef()`)

        appGenerator.appendFunction(`getRenderView`, [], [], [], `return (${whole.join('')})`)

        await appGenerator.needIndexFile('App', [], false, [
                `const self = new App()`,
                `self.mount()`,
                `Util.setEnvironment(Config.env)`,
                `export {self as Application};`
            ],
            true);
        await appGenerator.persist();
    }

    getNavigationStmt(navigation) {
        const stmt = [];
        if (navigation && navigation.view) {
            stmt.push(...this.getJSXStrings({
                /** 因為import 是大寫, 所以這裡只好hack*/
                tag: _.upperFirst(navigation.view),
                props: {
                    ref: `###this.navigatorRef`,
                    history: `###history`
                }
            }));
            this.removeJSXSign(stmt);
        }
        return stmt;
    }

    getCopyRightStmt(copyRight) {
        const stmt = [];
        stmt.push(...this.getJSXStrings({
            /** 因為import 是大寫, 所以這裡只好hack*/
            tag: _.upperFirst(copyRight.view),
            props: {
                ref: `###this.copyRightRef`,
                history: `###history`
            }
        }));
        this.removeJSXSign(stmt);
        return stmt;
    }

    /**
     * classNameInfos: [ {name:navigator,classnames:['List','Wrap'] }]
     * */
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
                    if (origins && origins[name]) {
                        generator.appendField(name, JSON.stringify(origins[name]));
                        delete origins[name];
                    } else {
                        generator.appendField(name, `{}`);
                    }
                }
                const isEditPage = info.component.isPreciselyEditableComponent();
                generator.appendBatchLinesIntoFieldSection(`\n\n/** => following for ${info.component.getName()} ${isEditPage ? 'editor' : ''} component  */\n\n`)
                generator.needSignature(false);
                generator.setSingleton(true);
            }
            if (!_.isEmpty(origins)) {
                for (const name in origins) {

                    /** 要檢查homeless的每一個 是不是沒定義過, 沒定義過就會是一個空物件 */
                    if (!_.isEqual(origins[name], {}))
                        generator.appendField(name, JSON.stringify(origins[name]));
                }
                generator.appendBatchLinesIntoFieldSection(`\n\n/** following for homeless */\n\n`)
            }
            await generator.persist();
        }

        /** template.style.index.js */
        Util.copySingleFile(libpath.join(this.freeMarkerRootPath, 'template.style.index.js'),
            libpath.join(this.genSourcePath, 'style', 'index.js'), undefined, true);
    }

    /**
     * className: {
     *     isEmpty: '是否為一個沒有編輯過的className'
     *     raw: '沒處理過的字串'
     *     attributeObj:{ mobile:'', desktop:'' }
     * }
     */
    getObjectOfExistedLessAttribute(path = this.projectPlatformSourcePath) {
        /** return { ..., mobile:'' desktop:'' , tablet:''} */
        function rawToAttributeObj(raw) {
            const object = {}
            /**{ mobile:'' desktop:'' }*/
            const platformStrings = raw.split('@media').map(each => each.trim())
                .map((each) => Util.toOneLineString(each));

            for (const string of platformStrings) {
                const regexOfGetPlatform = new RegExp(`(?<=\\@)\\w+`, 'g');
                /** 抓取@之後的字樣*/
                const regexGetInsideBraces = new RegExp(`(?<=\\{).+?(?=\\})`, 'g');
                /** 抓取{}裏面的*/

                const platform = string.match(regexOfGetPlatform);
                const statement = string.match(regexGetInsideBraces);

                if (!_.isEmpty(platform) && !_.isEmpty(statement)) {
                    object[platform[0]] = statement[0].trim();
                }
            }
            object['default'] = platformStrings.shift();
            return object;
        }

        function isEmptyAttribute(attributeObj) {
            let isEmpty = true;
            for (const key in attributeObj) {
                if (!_.isEmpty(attributeObj[key])) {
                    isEmpty = false;
                    break;
                }
            }
            return isEmpty;
        }

        const lessAttributeObj = {};
        const srcLessPath = _.isEqual('less', Util.getExtensionFromPath(path)) ? path : libpath.join(path, `less`, `styles.less`)
        if (Util.isEmptyFile(srcLessPath)) {
            Util.appendInfo(`4842454 ${srcLessPath} is not exist!!!`);
            return undefined;
        }
        const stringOfPlatforms = _.map(LESS_MODULES, 'name').map((each) => `(${each})`).join("|");
        if (fs.existsSync(srcLessPath)) {
            const stub = Util.getFileContextInRaw(srcLessPath).split('\n');
            /** 注意!! 是用 remove,會mutate 原本的 array */
            _.remove(stub, (each) => (
                _.startsWith(each.trim(), '/**')
                || _.isEqual(each.trim(), '')
                || _.startsWith(each.trim(), '@import')
                || Util.startWithRegex(each.trim(), `@(${stringOfPlatforms})\:`)
            ))

            /** 移除掉最後一個,因為split */
            const pureLessStringFile = stub.join('\n');
            const regexOfClassName = new RegExp(`^\\..+\\s{`, `gm`)
            /**  找出像是這樣的.ExamFilterRandomTestRangeOfYearSlider  */
            const classNames = pureLessStringFile.match(regexOfClassName).map((each) => {
                const normalize = Util.getNormalizedStringNotEndWith(Util.getNormalizedStringNotStartWith(each, '.'), '{').trim()
                const precise = normalize.split(':')[0];
                return {
                    complete: normalize, /** ExamFilterRandomTestRangeOfYearSlider:extend(.CenterInParent all) */
                    precise: precise, /** ExamFilterRandomTestRangeOfYearSlider */
                }
            });

            const blocks = Util.toObjectMap(pureLessStringFile.split(regexOfClassName), {to: 'raw'});
            blocks.shift();

            /** split 第一個會是沒意義的值 */
            const styles = _.zip(classNames, blocks).map((each) => Util.mergeObject(...each));

            for (const style of styles) {
                const attributeObj = rawToAttributeObj(style.raw);
                /** { mobile:'', desktop:''} */
                const isEditorClassName = Util.has(style.precise, 'Editor');
                lessAttributeObj[style.precise] = {
                    ...style,
                    attributeObj,
                    /**  isModified 就是指這個className有沒有被編輯過 */
                    isModified: isEditorClassName ? !isEmptyAttribute(attributeObj) /** 如果是Editor的className就只要看空值不,  */
                        : (!isEmptyAttribute(attributeObj) || !_.isEqual(style.complete, style.precise)),
                }
            }
        }
        return lessAttributeObj;
    }

    getVarietyDeviceStmts(existedObj) {
        const sign = `/** empty style */`;
        const stmts = [];
        const isModifiedObject = existedObj && existedObj.isModified && existedObj['attributeObj']
        for (const module of LESS_MODULES) {
            const existed = isModifiedObject && existedObj['attributeObj'][module.name];
            stmts.push(`@media @${module.name} {${existed ? existedObj['attributeObj'][module.name] : sign}}`);
        }

        if (isModifiedObject) {
            stmts.unshift(existedObj['attributeObj']['default'])
        }

        return stmts.join('');
    }

    async buildAllNewBrandLessFiles(classNameInfos) {
        const self = this;

        function getLessLibs() {
            return Util.findFilePathBy(libpath.join(self.freeMarkerRootPath, 'less', 'libs'),
                (file) => _.isEqual(file.extension, 'less'))
                .map((file) => file.fileNameExtension);
        }

        const generator = new ClassGenerator(libpath.join(this.genSourcePath, 'less', `styles.less`));
        for (const nameExtension of getLessLibs()) {
            generator.appendInClassHead(`@import "./libs/${nameExtension}";`)
        }
        generator.appendInClassHead(this.getAnnouncementsOfLessDevice().join('\n'))
        const filesOfLess = [this.projectPlatformSourcePath, ...this.nodeOfAncestor.getLessFilesOfModuleComponent().map((file) => file.absolute)];
        const existedLessAttributeObj = Util.mergeObject(...filesOfLess.map((each) => this.getObjectOfExistedLessAttribute(each)));

        /**
         * classNameInfos: [ {component:componentNode, classNames:['List','Wrap'] }...]
         * */
        for (const info of classNameInfos) {
            const isEditPage = info.component.isPreciselyEditableComponent();
            generator.appendInClassTail(`/** following for ${info.component.getName()} ${isEditPage ? 'editor' : ''} component used  */\n\n`);

            for (const className of info.classNames) {
                const node = className.node;
                const type = className.type;

                const preciselyClazzName = node.getClassNameOfLessUsage(className.type);
                const existObj = existedLessAttributeObj[preciselyClazzName]; /** 從file裡面找出定義過的屬性敘述*/

                if (isEditPage) {
                    const original = node.getOriginalClassNameOfLessUsage(type);
                    const extendStmt = (type === 'default' && node.isTextFieldView()) ? `BaseEditorTextField` : `${original.value}`
                    const stmt = `.${preciselyClazzName}:extend(.${extendStmt}){${this.getVarietyDeviceStmts(existObj)}}`;
                    generator.appendInClassTail(`${stmt}`);
                } else {
                    generator.appendInClassTail(`.${existObj ? existObj.complete : preciselyClazzName} 
                        {${this.getVarietyDeviceStmts(existObj)}}`);
                }
                delete existedLessAttributeObj[preciselyClazzName];
            }
        }

        if (_.size(existedLessAttributeObj) > 0) {
            generator.appendInClassTail(`/** ======== following for homeless ========= */\n\n`);
            for (const clazzName in existedLessAttributeObj) {
                const object = existedLessAttributeObj[clazzName];
                if (object.isModified) {
                    generator.appendInClassTail(`.${object.complete} {${this.getVarietyDeviceStmts(existedLessAttributeObj[clazzName])}}`);
                }
            }
        }

        generator.needSignature(false);
        generator.disableDefaultImports();
        await generator.persist();

        await Util.deleteFileOrFolder(libpath.join(this.projectPlatformSourcePath, 'less', 'index.js'));
        await this.appendMustacheFile('less.index.mustache', Util.persistByPath(libpath.join(this.genSourcePath, 'less', 'index.js')));
        Util.appendInfo(`persist ./less/index.js succeed`);
    }

    /**
     * @deprecate
     * {[...{component,names}], srcPath}
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
                _.remove(stub, (each) => (
                    _.startsWith(each, '/** ') ||
                    _.isEqual(each.trim(), '') ||
                    _.startsWith(each, '@import')))
                lessAttributesFromSrc.push(...(stub.join('').split('}')))
                /** 移除掉最後一個,因為split */
                lessAttributesFromSrc.pop();
            }

            /** 刪掉沒定義過less....  沒定義過的 => ' .ExamDiv { /** style */
            _.remove(lessAttributesFromSrc, (each) => (_.isEqual(each.split(`{`)[1].trim(), sign)))

            const generator = new ClassGenerator(libpath.join(this.genSourcePath, 'less', `${type}.less`));
            for (const info of classNameInfos) {
                const isEditPage = info.component.isPreciselyEditableComponent();
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
                        if (type === 'default' && node.isTextFieldView()) {
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

    /** 拿到[... '@mobile' ,'@table'] 的陣列 */
    getAnnouncementsOfLessDevice() {
        const announcements = [];
        for (const model of LESS_MODULES) {
            announcements.push(`@${model.name}: ~'${model.rule}';`);
        }
        return announcements;
    }

    /** 拿到less file 但是去掉 @mobile, @tablet 這類宣告*/
    getStringOfRemoveDeviceInfo(string) {
        const stringOfPlatforms = _.map(LESS_MODULES, 'name').map((each) => `(${each})`).join("|");
        const stub = string.split('\n');
        _.remove(stub, (each) => Util.startWithRegex(each.trim(), `@(${stringOfPlatforms})\:`))
        return stub.join('\n');
    }

    /** 把less的 device宣告更新 */
    refactorLessDeviceInfo(file) {
        const stub = this.getStringOfRemoveDeviceInfo(Util.getFileContextInRaw(file.absolute));
        const latest = [...this.getAnnouncementsOfLessDevice(), stub].join('\n');
        Util.appendFile(file.absolute, latest, false, true);
    }

    /** free_marker/template/.  */
    async overrideLessFile() {
        const less = libpath.join(this.freeMarkerRootPath, `less`);
        const files = Util.findFilePathBy(less);
        _.forEach(_.filter(files, (file) => _.isEqual(file.extension, 'less')),
            (file) => this.refactorLessDeviceInfo(file)
        );

        const to = libpath.join(this.genSourcePath, 'less');
        Util.copyFromFolderToDestFolder(less, to);
    }

}

class ProjectFileHandler extends PathBase {

    constructor(props) {
        super(props);
        this.deployRemoteRules = true;
        this.needDeployCloudFunctions = true;
        this.enrichComponentStructs(this.isWebPlatform());
    }

    disableRulesRemoteDeploy() {
        this.deployRemoteRules = false;
    }

    async buildDistAssetFolder() {

        const imagesOfModules = this.nodeOfAncestor.getListOfModuleComponent().map(module => libpath.join(PATH_OF_COMPONENT_MODULE, `${module}/web/images`));
        const imageSourceFolders = [...imagesOfModules, libpath.join(this.projectPlatformPath, 'images')];
        for (const imageSourceFolder of imageSourceFolders) {

            if (fs.existsSync(imageSourceFolder)) {
                Util.copyFromFolderToDestFolder(imageSourceFolder,
                    Util.persistByPath(libpath.join(this.genRootPath, 'dist', 'images')));
            }
        }
    }

    persistImageFolder() {
        const images = libpath.join(this.genRootPath, 'dist', 'images');
        if (fs.existsSync(images)) {
            Util.copyFromFolderToDestFolder(images,
                Util.persistByPath(libpath.join(this.projectPlatformPath, 'images'))
            );
        }
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
                const segments = _.remove(latest, (each) => !_.isEqual(each, '?;'));
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
                stmts.push(`${key} = "${value.split('\n').join(`\/n`)}";`)
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
            const modularized = libpath.join(this.genSourcePath, 'i18n', lang, 'ModularizedMyI18n.js');
            const base = libpath.join(this.genSourcePath, 'i18n', lang, 'BaseMyI18n.js');

            const sumsOfModules = getObjectOfComponentI18n(modularized);
            const sumsOfBase = getObjectOfComponentI18n(base);
            for (const nameOfComponent of modules) {

                const filtersOfBase = _.filter(sumsOfBase, (obj) => _.startsWith(obj.name, nameOfComponent));
                const filtersOfModule = _.filter(sumsOfModules, (obj) => _.startsWith(obj.name, nameOfComponent));

                const destination = libpath.join(PATH_OF_COMPONENT_MODULE, `${nameOfComponent}/web/src/i18n/${lang}/${FILE_EXTENSION_OF_I18N}`)
                await Util.deleteSelfByPath(destination, true);
                await Util.persistByPath(destination);
                for (const filterOfBase of filtersOfBase) {
                    const targetWriteIntoModuleI18n = filterOfBase;
                    const filterOfModule = _.find(filtersOfModule, (each) => _.isEqual(each.name, filterOfBase.name));
                    if (filterOfModule)
                        targetWriteIntoModuleI18n.i18n = Util.mergeObject(filterOfBase.i18n, filterOfModule.i18n);
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
        baseConfigGenerator.appendField(`platform`, JSON.stringify(this.platform));
        baseConfigGenerator.appendField(`env`, JSON.stringify(this.env));
        baseConfigGenerator.appendField(`host`, JSON.stringify(this.isProduction() ? sourceObj.host.prod : sourceObj.host.dev));
        baseConfigGenerator.appendField(`watermark`, JSON.stringify(watermarkObj));
        baseConfigGenerator.appendField(`superUserUid`, JSON.stringify(sourceObj.superUserUid));
        const version = Util.getStringOfVersionIncrement(Util.getVersionOfJsFile(this.pathOfSourceJS));
        baseConfigGenerator.appendField(`VERSION_OF_PACKAGE_JSON`, JSON.stringify(version));
        Util.appendInfo(`75645461 VERSION_OF_PACKAGE_JSON ==> ${version}`);

        switch (this.platform) {
            case 'admin':
            case 'functions':
                baseConfigGenerator.appendField(`TYPE_OF_THIRD_PARTY_ECPAY`, JSON.stringify('ECPAY'));
                baseConfigGenerator.appendField(`TYPE_OF_THIRD_PARTY_LINEPAY`, JSON.stringify('LINEPAY'));
                baseConfigGenerator.appendField(`ecpay`, JSON.stringify(this.isProduction() ? sourceObj.ecpay.prod : sourceObj.ecpay.dev));
                baseConfigGenerator.appendField(`linepay`, JSON.stringify(this.isProduction() ? sourceObj.linepay.prod : sourceObj.linepay.dev));
                baseConfigGenerator.appendField(`admin`, JSON.stringify(sourceObj.admin));
                baseConfigGenerator.appendField(`server`, JSON.stringify(sourceObj.server));
                break;
            case 'web':
                baseConfigGenerator.appendField(`firebase`, JSON.stringify(sourceObj.firebase));
                if (sourceObj.hasCookiePassword())
                    baseConfigGenerator.appendField(`password`, JSON.stringify(sourceObj.password));
                const trueOrFalse = sourceObj.navigation && sourceObj.navigation.isScrollingHide
                baseConfigGenerator.appendField(`isScrollingHide`, JSON.stringify(trueOrFalse));
                break;
        }

        for (const cloud of this.getAllCloudFunctions()) {
            if (Util.isOrEquals(cloud.type, 'httpOnCall', 'httpOnRequest')) {
                baseConfigGenerator.appendField(`urlOf${_.upperFirst(cloud.name)}`,
                    `'${new URL(cloud.name, sourceObj.getHostOfCloudFunction()).href}' /** ${cloud.type} */`)
            }
        }

        await baseConfigGenerator.needIndexFile('Config', [], true);
        await baseConfigGenerator.persist();
    }

    async persistModuleComponentFiles() {
        const self = this;

        function persist(module = 'epay', folder = 'store', predict = (file) => Util.appendInfo(file.fileName)) {
            for (const file of Util.findFilePathBy(libpath.join(self.genSourcePath, folder),
                (each) => _.startsWith(_.toLower(each.dirName), _.toLower(module)) &&
                    _.startsWith(each.fileName, KEYWORD_OF_MODULARIZED))) {
                const pathOfDestination = libpath.join(PATH_OF_COMPONENT_MODULE, predict(file));

                if (Util.isFileEditSucceed(file.absolute)) {
                    Util.copySingleFileConservative(pathOfDestination, file);
                }
            }
        }

        if (!fs.existsSync(this.genSourcePath)) {
            Util.appendInfo(`468456146 ${this.genSourcePath} is note created, ignore`);
            return
        }

        for (const module of this.nodeOfAncestor.getListOfModuleComponent()) {

            persist(module, 'component', (file) => `${module}/web/src/component/${file.dirName}/${file.fileNameExtension}`);
            persist(module, 'store', (file) => `${module}/web/src/store/${file.dirName}/${file.fileNameExtension}`);

            const componentOfModule = _.find(this.getComponents(), (each) => !each.isPreciselyEditableComponent() && _.isEqual(module, each.getName()));
            if (Util.isUndefinedNullEmpty(componentOfModule)) {
                continue;
            }
            persist(module, 'store', (file) => `${module}/functions/src/func/${file.dirName}/${file.fileNameExtension}`);

            /** persist less file */
            const instance = new AppBuilder(this.getAppBuildParam());
            const attrs = instance.getObjectOfExistedLessAttribute(this.genSourcePath);
            if (attrs) {
                const lessees = _.filter(attrs, (value, key, collection) => _.startsWith(key, _.upperFirst(module)))
                await Util.deleteSelfByPath(libpath.join(PATH_OF_COMPONENT_MODULE, `${module}/web/src/less`));
                const generator = new ClassGenerator(libpath.join(PATH_OF_COMPONENT_MODULE, `${module}/web/src/less/styles.less`));
                for (const model of LESS_MODULES) {
                    generator.appendInClassHead(`@${model.name}: ~'${model.rule}';`);
                }
                generator.needSignature(false);
                generator.disableDefaultImports();
                for (const less of lessees) {
                    generator.appendInClassTail(`.${less.complete} 
                        {${instance.getVarietyDeviceStmts(less)}}`);
                }
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

            for (const file of Util.findFilePathBy(libpath.join(this.genSourcePath, 'base'))) {
                if (Util.isEmptyFile(file.absolute)) {
                    Util.appendInfo(`${file.absolute} is empty file, do not copy`)
                    continue;
                }

                if (_.startsWith(_.toLower(file.fileName), 'common')) {
                    /** back-up to common*/
                    const pathOfDestination = libpath.join(this.freeMarkerSourceCommonPath, 'src', 'base', file.fileNameExtension);
                    Util.copySingleFileConservative(pathOfDestination, file);
                } else {
                    /** back-up to platform src*/
                    const pathOfDestination = libpath.join(this.freeMarkerSourcePlatformPath, 'src', 'base', file.fileNameExtension);
                    Util.copySingleFileConservative(pathOfDestination, file);
                }
            }
            Util.appendInfo(`persist free-marker base files succeed`);
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

    /** 將less/libs/ 底下全部都back-up到 template */
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
                    _.isEqual(each.fileNameExtension, `common.style.js`) ||
                    (_.isEqual(each.folderName, 'i18n') && _.isEqual(each.fileNameExtension, `index.js`))
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

        const pathsOfModuleComponent = this.nodeOfAncestor.getListOfModuleComponent().map((each) => libpath.join(PATH_OF_COMPONENT_MODULE, each, this.platform));
        /** ex: ./src/modules/navigator */

        const fromSourcePath = [this.projectPlatformPath, this.freeMarkerSourcePlatformPath, this.freeMarkerSourceCommonPath, ...pathsOfModuleComponent];
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

                    if (_.isEqual(sourceFile.fileNameExtension, FILENAME_OF_SOURCE_JS)) {
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
                }

                Util.copySingleFile(from, dest, '', true);
                /** 這真的太浪費時間了
                 * Util.rewriteFile2File(from, dest);
                 * */
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
        const path = Util.persistByPath(libpath.join(this.genRootPath, fileName))

        const base = this.getStringFromMustache('template.storage.mustache',
            {superUserUid: this.nodeOfAncestor.getStorageSuperUserUid()}).split('\n');
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
        await this.recursiveDoingOfNodeEachStruct((node) => node.hasStorageFolder(), task)
        const stmts = [];
        for (const name in permissions) {
            const _stmt = [];
            const normalize = name.split('\/').map((word) => word.startsWith(':') ? `{${Util.getNormalizedStringNotStartWith(word, ':')}}` : word).join('\/');
            _stmt.push(`match ${libpath.join('/', normalize)}/{fileId} {`);
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
        const path = Util.persistByPath(libpath.join(this.genRootPath, fileName))
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
        if (npmBuild)
            await Util.executeCommandLine(`cd ${this.genRootPath} && npm run build`)

        const pathOfDestination = libpath.join(this.nodeOfAncestor.getDirectoryName(), 'public');
        const pathOfDistFrom = libpath.join(this.genRootPath, 'dist');
        await this.buildDistAssetFolder();
        if (deploy) {
            Util.persistByPath(pathOfDestination);
            Util.cleanAllFiles(pathOfDestination);
            Util.copyFromFolderToDestFolder(pathOfDistFrom, pathOfDestination, true, false);
            await this.executeCommandToFirebaseRemote(`firebase deploy --only hosting`)
        }
    }

    async generateFireIndexRules(deploy = true) {
        const indexes = [];
        const task = async (node) => {
            function getFieldObj(node) {
                const fieldPath = node.getFieldName();
                if (node.isArray()) {
                    return {fieldPath, arrayConfig: node.getIndexRule()}
                } else {
                    return {fieldPath, order: node.getIndexRule()}
                }
            }

            const indexNodes = node.getPreciseAttributeChildren().filter((each) => each.isIndex())
            if (!_.isEmpty(indexNodes)) {
                indexes.push({
                    collectionGroup: node.getFieldName(),
                    queryScope: "COLLECTION",
                    fields: indexNodes.map((each) => getFieldObj(each))
                })
            }
        }
        await this.recursiveDoingOfNodeEachStruct(((node) => node.hasPath() && node.isArray()), task)
        await this.buildDeployDocument('firestore.indexes.json', JSON.stringify({indexes}), 'firestore:indexes', deploy)
    }

    getFirebaseRuleOfMatchRoute(node) {
        const path = node.getPath();
        const wildcard = `{${node.getName()}}`;
        const normalize = path.split('\/').map((word) => word.startsWith(':') ? `{${Util.getNormalizedStringNotStartWith(word, ':')}}` : word).join('\/');
        if (node.isObject()) {
            return libpath.join('/', normalize, node.isCollectionPath() ? '' : 'attrs', wildcard);
        } else if (node.isArray()) {
            return libpath.join('/', normalize, wildcard);
        } else {
            throw new ERROR(9999, `cant happened this condition ,name:${node.getName()}, type:${node.getType()}`);
        }
    }

    async generateFireStoreRules(deploy = true) {
        const self = this;
        const base = Util.getFileContextInRaw(libpath.join(this.freeMarkerRootPath, 'template.firestore.rules')).split('\n');
        const stmts = [];

        /** type => update|create|delete|read */
        function appendGetAfterStmts(type, node) {
            const disable = true;
            if (disable) return '';

            if (Util.isOrEquals(type, 'update')) {
                const path = libpath.join('/databases/$(database)/documents', Util.getStringOfPop(self.getFirebaseRuleOfMatchRoute(node), `\/`),
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
        await this.recursiveDoingOfNodeEachStruct((node) => !_.isEmpty(node.getPath()), task)
        Util.insertToArray(base, Util.getIndexOfContext(base, SIGN_OF_COLLECTION_START), ...stmts);
        await this.buildDeployDocument('firestore.rules', base.join('\n'), 'firestore:rules', deploy)
    }

    async forAdmin() {
        Util.persistByPath(this.genRootPath);
        await this.appendMustacheFile('admin.package.json.mustache', libpath.join(this.genRootPath,
            `package.json`), {
            projectName: this.nodeOfAncestor.name,
            projectVersion: this.nodeOfAncestor.version,
            projectDescription: this.nodeOfAncestor.description
        });

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

        for (const component of this.nodeOfAncestor.getComponents()) {
            new RemoteFunctionHandler(this.props, apiGenerator).buildFetchSubmitApi(component.getStruct(), true)
            new RemoteFunctionHandler(this.props, listenerGenerator).buildListenerFunction(component.getStruct(), true)
        }

        await listenerGenerator.persist();
        await apiGenerator.persist();
        await this.generateStorageRules(this.deployRemoteRules);
        await this.generateFireStoreRules(this.deployRemoteRules);
        /**
         * index rule 有點麻煩, 還要照query順序 例如where(subject) where(year) orderBy(qid) 欄位的順序就必須 qeusetions ==> subject,year,qid
         * await this.generateFireIndexRules();
         */
    }

    /** 有些專有名詞(SimpleViewPager, SimpleGrid)，會重新setView(latest)，而latest對應該產生的行為會實作在 enrichNodesOfBehavior */
    enrichNodeWithCustomViewDefined(nodes) {
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


            if (node.isFloatBackgroundView()) {
                const clone = _.cloneDeep(node.raw);
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

            if (node.isCustomImageButton()) {
                node.setView('IconButton');
                node.needParam = true;
                node.appendChildrenWithJsons({
                    name: `imgOf${_.upperFirst(node.getName())}`,
                    view: `img`,
                    type: `string`,
                    incest: {view: false, attribute: true},
                    defaultValue: `${node.getDefaultValue()}`
                })
            }

            if (node.isTimeDatePickerView() || node.isTimeDateRangePickerView()) {
                node.setWrapView('LocalizationProvider');
                node.appendImportStmt({part: '{AdapterMoment}', from: '@mui/x-date-pickers/AdapterMoment'});
                node.appendWrapProps({dateAdapter: '###AdapterMoment'});
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
                    {xs: `###${node.getName()}.getXs()`}
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
                    }
                )
            }

            if (node.hasLabelView()) {
                if (Util.isUndefinedNullEmpty(node.wrapView))
                    node.setWrapView('div');

                if (node.hasLabelViewIcon()) {
                    node.appendChildrenWithJsons({
                        name: `btnOf${_.upperFirst(node.getName())}`,
                        needParam: true,
                        outer: true,
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
                        outer: true,
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

                if (node.hasAutoPlayＭechanism()) {
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

            if (node.isSimpleViewPager()) {
                node.setView('div');
                node.setClick(true);
                node.setListView('Slide');
                node.disableListEmptyTip();
                node.appendListProps(
                    {arrows: false},
                    {indicators: true},
                    {canSwipe: true},
                    {duration: 5000}
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
                        incest: node.incest,
                        description: '顯示的頁面',
                        wrapView: 'div',
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

                if (!node.isArray()) {
                    throw new ERROR(9999, '98787453 simple selected support array only')
                }

                node.getParentNode().appendChildrenWithJsons({
                    name: `${node.getFieldNameOfSelected()}`,
                    type: 'string', /** succeed, fail */
                    column: true,
                    defaultValue: node.getSelectedDefaultValue(),
                    incest: node.incest,
                })

                node.setDefaultValue(node.getDefaultValueOfSimpleSelected())

                switch (node.getTypeOfSimpleSelected()) {
                    case 'spinner':
                        node.setListView('TextField');
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

                const stringsOfItem = [];
                const implementsOfClicked = []
                for (const item of node.alertMenu.items) {

                    const functionName = node.getFunctionNameOfClicked(item.name);
                    implementsOfClicked.push(`{"id":${item.id},"onClick":self.${functionName}(objectOfParam)}`);
                    node.appendMethods(
                        {
                            functionName,
                            params: ['param']
                        });


                    const objectOfItem = {};
                    objectOfItem.label = item.label;
                    objectOfItem.icon = item.icon;
                    objectOfItem.id = item.id;
                    objectOfItem.loginOnly = item.loginOnly ?? false;
                    objectOfItem.notice = item.notice;

                    Util.removeAttributeBy(objectOfItem);
                    /** 清除掉value為undefined,因為JSON.parse會過不了 */
                    stringsOfItem.push(JSON.stringify(objectOfItem));

                }
                // console.log(`[${stringsOfItem.join(',')}]`);
                const fieldNameOfItems = `itemsOf${_.upperFirst(node.getName())}`;
                node.implementsOfAlertItemClicked = implementsOfClicked;
                node.getPreciseAttributeParent().appendChildrenWithJsons({
                    name: fieldNameOfItems,
                    type: 'arrayOfField',
                    l10n: true,
                    incest: node.incest,
                    defaultValue: JSON.parse(`[${stringsOfItem.join(',')}]`),
                })

                const content = `{self.renderAlertMenu({ref:${node.getFieldNameOfAlertMenu()},
                component:self,items:Util.getMergedArrayBy(${node.getPreciseAttributeParentName()}.get${_.upperFirst(fieldNameOfItems)}(), implementsOfAlertItemClicked, 'id')})}`

                node.appendWrapContents(content);
            }

            this.enrichNodeWithCustomViewDefined(node.getChildren());
        }
    }

    appendMuiIconImport(node, icon) {
        node.appendImportStmt({part: icon, from: `@mui/icons-material/${icon}`})
    }

    /* typeOfView 可以是 default | list | wrap */
    enrichTextFieldBehavior(node, typeOfView = 'default') {
        const self = this;

        function getContentsOfClickBehavior(node) {
            const stmts = []
            if (node.hasAlertDialog()) {
                stmts.push(`objectOfParam.view = event;`);
                stmts.push(`${node.getFieldNameOfAlertDialog()}.current.open();`)
            } else {
                stmts.push(`self.${node.getFunctionNameOfClicked()}(objectOfParam);`)
            }
            return stmts.join(`\n`);
        }

        function getContentOfClick(node, content) {
            node.appendImportStmt({part: 'IconButton', from: '@mui/material/IconButton'});
            const functionNameOfVisualIconClick = node.getFunctionNameOfClicked();
            node.appendMethods({
                functionName: node.getFunctionNameOfClicked(),
                params: ['param'],
            })
            return `<IconButton
                            onClick={(event) => { 
                                ${getContentsOfClickBehavior(node)}}}
                            edge="${node.getPositionOfHelperVisual()}" >${content}</IconButton>`
        }

        const arrayOfProps = [];

        if (node.hasLabel()) {
            const label = node.getFieldNameOfLabel();
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
            let contentOfVisual = '';
            node.appendImportStmt({part: 'InputAdornment', from: '@mui/material/InputAdornment'})

            if (node.useIconAsHelpVisual()) {
                this.appendMuiIconImport(node, node.getNameOfHelperVisualIcon());
                contentOfVisual = `<${node.getNameOfHelperVisualIcon()} />`;
            } else if (node.useTextAsHelperVisual()) {
                contentOfVisual = node.getTextOfHelperVisual();
            } else {
                throw new ERROR(9999, '87454646 useHelperVisual() should choose icon/text');
            }

            const view = `<InputAdornment position="${node.getPositionOfHelperVisual()}">${node.hasClickHelperVisual() ? getContentOfClick(node, contentOfVisual) : contentOfVisual}</InputAdornment>`;
            const prop = `{${node.isPositionLocateAtStart() ? 'startAdornment' : 'endAdornment'}:(${view})}`;

            arrayOfProps.push({InputProps: `###${prop}`})
        }

        const nameOfDisabled = Util.camel(node.getName(), 'disabled');
        node.getParentNode().appendChildrenWithJsons(
            {
                name: nameOfDisabled,
                type: 'boolean',
                editIgnore: true,
                defaultValue: false,
                incest: node.incest,
            }
        )
        if (!node.isPreciselyEditableComponent())
            arrayOfProps.push({disabled: `###${node.getPreciseAttributeParentName()}.${Util.camel('get', nameOfDisabled)}()`})

        switch (typeOfView) {
            case 'default':
                node.appendViewProps(...arrayOfProps);
                break;
            case 'list':
                node.appendListProps(...arrayOfProps);
                break;
        }
    }

    /** 針對view的種類, 增加與store互動的規則 例如TextField就要有onChange */
    enrichNodesOfBehavior(nodes) {

        function appendPropsOfNode(node, functionOfView, props = [], methods = [], nodesOfParent = []) {

            for (const type of TYPES_OF_PROPS_VIEW) {
                if (node.isPreciselyEditableComponent()
                    && _.isEqual(node.getNodeOfComponent().getName(), 'exam')
                    && _.isEqual(node.getName(), 'year')
                    && _.isEqual(node.getPreciseAttributeParentName(), 'question')
                ) {
                }

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

        function getStmtOfEventInValidate(node, functionName) {
            const stmts = [];
            stmts.push(`objectOfParam.view = event;`);

            if (node.isAttribute() && !node.disableOnChangeSetter) {
                let paramStmt = '';
                if (node.isSwitchView()) {
                    paramStmt = `self.getCheckStateByEvent(event)`;
                } else if (node.isTextFieldView()) {
                    stmts.push(`const latestValue = ${node.isNumber() ? `_.toNumber(self.getLatestValueByEvent(event))` : `self.getLatestValueByEvent(event)`}`);
                    paramStmt = `latestValue`;
                    if (node.isBelongAutoComplete())
                        stmts.push(`${node.getPreciseAttributeParentName()}.${node.getPreciseViewParent().getFunctionNameOfAutoCompleteInvalidate()}(latestValue).then()`)
                } else if (node.isSliderView()) {
                    paramStmt = `self.getLatestValueByEvent(event)`;
                } else if (node.isAutoCompleteView()) {
                    stmts.push(`objectOfParam.object = value`)
                    stmts.push(`${node.getPreciseAttributeParentName()}.${Util.camel('set', node.getName())}(value)`)
                    /**
                     const nodeOfInput = _.find(node.getPreciseAttributeParent().getPreciseAttributeChildren(), (each) => each.isBelongAutoComplete(), 0);
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
                    stmts.push(`const moment = event`);
                    stmts.push(`objectOfParam.value = moment`)
                    paramStmt = `moment`;
                } else if (node.isTimeDateRangePickerView()) {
                    stmts.length = 0;
                    stmts.push(`const moments = event`);
                    stmts.push(`objectOfParam.value = moments`);
                    stmts.push(`${node.getPreciseAttributeParentName()}.${Util.camel('set', node.getFieldName())}(moments)`)
                    stmts.push(`${node.getPreciseAttributeParentName()}.${Util.camel('set', node.getFieldNameOfStart())}(_.head(moments))`);
                    stmts.push(`${node.getPreciseAttributeParentName()}.${Util.camel('set', node.getFieldNameOfEnd())}(_.last(moments))`);
                } else {
                    /** throw new ERROR(9999, `8787465452 還沒支援的元件 'name:${node.getName()} view:${node.getView()}' `) */
                }

                if (!Util.isUndefinedNullEmpty(paramStmt))
                    stmts.push(`${node.getPreciseAttributeParentName()}.${node.getFunctionNameOfSetter()}(${paramStmt})`);
            }
            stmts.push(`self.${functionName}(objectOfParam)`);
            return stmts.join('\n');
        }

        for (const node of nodes) {

            if (node.isTimeDatePickerView() && node.hasLabel()) {
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

            if (node.isTimeDateRangePickerView()) {

                if (node.hasLabel()) {
                    const labels = node.getLabel();
                    if (!_.isArray(labels) || _.size(labels) < 2) throw new ERROR(9999, '746465574 range pick label should be an array');

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


                }

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


            if (node.isTextFieldView()) {
                if (!node.hasLabel() && node.hasDescription()) {
                    node.label = node.description;
                }

                this.enrichTextFieldBehavior(node, 'default');

                if (node.isNumber()) {
                    node.appendViewProps({type: 'number'});
                    node.appendViewProps({InputLabelProps: {shrink: true}});
                }

                if (node.isString() && !node.search) {
                    node.appendViewProps({multiline: '###true'});
                }

                if (node.search) {
                    /** <form action={.} />*/
                    node.setWrapView('form');
                    node.appendWrapProps({action: '.'})

                    /** onSearchPress() */
                    node.appendViewProps({
                        onKeyPress: `###(event, value) => {
                        if(_.isEqual(event.key ,'Enter')){
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
                if (node.needImageDialog) {
                    node.appendViewProps({onClick: `###(param) => this.openImageDialog(${node.getName()})`})
                }
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

                if (node.hasIcon()) {
                    this.appendMuiIconImport(node, node.getIcon());
                    this.appendMuiIconImport(node, node.getCheckedIcon());
                    node.appendViewProps({icon: `###<${node.getIcon()} />`}, {
                        checkedIcon: `###<${node.getCheckedIcon()} />`
                    })
                }

                if (node.hasSize())
                    node.appendViewProps({size: `${node.getSize()}`})
            }

            if (node.isWrapByAppBarView() && !node.isScrollingHideDependOnRootNode()) {
                node.appendWrapProps({position: 'static'})
            }

            if (node.isChipView() || node.isButton() || node.isIconButton()) {
                node.setClick(true);
                node.l10n = true;
                if (node.hasIcon()) {
                    this.appendMuiIconImport(node, node.getIcon());
                    switch (node.getView()) {
                        case 'Button':
                            const obj = {};
                            obj[`${Util.camel(node.getAnchorOfButton(), 'icon')}`] = `###<${_.upperFirst(node.getIcon())} />`
                            node.appendViewProps(obj);
                            break;
                        case 'IconButton':
                            node.appendChildrenWithJsons({
                                name: 'icon',
                                view: node.getIcon()
                            })
                            break;
                        default:
                            break
                    }
                }
            }

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
            if (node.isChipView()) {
                node.appendViewProps({label: `###${node.getName()}`})
            } else if (node.isTextFieldView() || node.isRadioView() || node.isSliderView() || node.isTimeDatePickerView() || node.isTimeDateRangePickerView()) {
                node.appendViewProps({value: `###${node.getName()}`})
            } else if (node.isSwitchView() || node.isCheckboxView()) {
                node.appendViewProps({checked: `###${node.getName()}`});
            } else if (node.isAudioPlayer() || node.isImageView() || node.isAvatarView()) {
                node.appendViewProps({src: `###${node.getName()}`})
            } else if (node.isTabItemView()) {
                node.appendViewProps({label: `###${node.getName()}.getLabel()`}, {value: `###${node.getName()}.getValue()`})
            } else if (node.isTimeDatePickerView() || node.isTimeDateRangePickerView() || node.isAutoCompleteView()) {
                /** 不要出現 self.handleTextString() */
            } else if (node.isStringOrNumberAttribute()) {
                /** 產生出 title, tile是指==> const title=this.getSomeOneTitle() <View >{title} </View> */
                node.appendContent(`{self.handleTextString(${node.getFieldName()})}`)
            }

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

            if (node.isViewPropsFunctionalized()) {
                node.simpleProps.push(`...${STRING_OF_INJECT_PARAM}`);
            }

            if (node.needTestButton()) {
                node.getParentNode().appendChildrenWithJsons({
                    view: 'Button',
                    type: 'string',
                    name: 'testUsage',
                    click: true,
                    defaultValue: '測試按鈕',
                    incest: node.incest,
                })
            }

            if (node.isAutoCompleteView()) {
                const name = node.getFieldNameOfSuggest();
                const plural = 's';
                const fieldName = `${name}s`;
                const label = node.getFieldNameOfLabel();
                node.getParentNode().appendChildrenWithJsons({
                        name,
                        type: `array`,
                        plural,
                        incest: node.incest,
                        children: [
                            {
                                type: 'string',
                                name: 'value',
                                column: true,
                                description: '本質內容',
                            }, {
                                type: 'string',
                                name: 'label',
                                column: true,
                                description: '顯示在屏幕上',
                            },
                            {
                                type: 'number',
                                name: 'type',
                                column: true,
                                description: '用來當作額router'
                            },
                            {
                                name: 'popularLevel',
                                type: 'number',
                                column: true,
                                defaultValue: 1,
                                description: 'order時候,會desc,讓最熱門的項目留在最上方'
                            },
                            {
                                type: 'string',
                                name: 'uid',
                                column: true,
                                description: '用來放document id,由type 判斷路由'
                            },
                            {
                                type: 'string',
                                name: 'extra',
                                column: true,
                                description: '用來放解釋|額外資訊, 也許type很快就忘了起初的定義'
                            }
                        ]
                    },
                    {
                        name: Util.camel(`key`, 'of', node.getName()),
                        type: 'boolean',
                        incest: node.incest,
                        description: `用來force ${node.getName()} re-render`
                    },
                    {
                        name: label,
                        type: `string`,
                        incest: node.incest,
                        l10n: true,
                        description: node.label,
                    }
                )

                node.appendChildrenWithJsons({
                    name: Util.camel(`input`, 'of', node.getName()),
                    incest: {view: false, attribute: true},
                    view: 'TextField',
                    type: 'string',
                    props: {size: node.size},
                    search: node.search,
                    description: node.label,
                    belongAutoComplete: true,
                    injectViewProp: {
                        name: 'renderInput',
                        functionalized: true,
                    }
                })

                node.appendViewProps(
                    {
                        noOptionsText: `###${node.getPreciseAttributeParentName()}.${Util.camel(`get`, label)}()`,
                    },
                    {
                        options: `###${node.getPreciseAttributeParentName()}.${Util.camel(`get`, fieldName)}()`
                    },
                    {
                        filterOptions: `###(options, state) => options`
                    },
                    {
                        isOptionEqualToValue: `###(option, value) => true`
                    },
                    {
                        key: `###${node.getPreciseAttributeParentName()}.${Util.camel(`get`, `key`, 'of', node.getName())}()`
                    },
                    {
                        getOptionLabel: `###(option) => option.label?? ''`
                    },
                    {
                        value: `###${node.getPreciseAttributeParentName()}.${Util.camel(`get`, node.getFieldName())}()`
                    }
                )

                if (node.hasSize()) {
                    node.appendViewProps({size: node.getSize()});

                }
            }


            appendPropsOfNode(node, node.needOnChangeBehavior,
                [{onChange: `###(event, value) => {${getStmtOfEventInValidate(node, node.getFunctionNameOfOnChanged())}}`}],
                [{
                    functionName: node.getFunctionNameOfOnChanged(),
                    params: ['param'],
                    loginOnly: node.hasLoginRequiredDialog(),
                }],
            )

            appendPropsOfNode(node, node.isTabListView,
                [
                    {centered: `###true`},
                    {value: `###${node.getParentNode().getName()}.getValueOfSelectedTab()`}], [],
                [
                    {
                        name: `valueOfSelectedTab`,
                        type: `number`,
                        defaultValue: node.getValueOfTabDefault(),
                    }
                ]
            )

            if (node.isAudioPlayer()) {
                node.appendMethods({
                    functionName: node.getFunctionNameOfPlayEnd(),
                    params: ['param'],
                })

                node.appendMethods({
                    functionName: node.getFunctionNameOfPlayError(),
                    params: ['param'],
                })

                node.appendMethods({
                    functionName: node.getFunctionNameOfOnPlay(),
                    params: ['param'],
                })

                node.appendViewProps(
                    {
                        onError: `###(param) => self.${node.getFunctionNameOfPlayError()}(param)`
                    },
                    {
                        onEnded: `###(param) => self.${node.getFunctionNameOfPlayEnd()}(param)`
                    },
                    {
                        onPlay: `###(param) => self.${node.getFunctionNameOfOnPlay()}(param)`
                    }
                )
            }

            if (node.isClickView()) {

                node.appendMethods({
                    functionName: node.getFunctionNameOfClicked(),
                    params: ['param'],
                    loginOnly: node.hasLoginRequiredDialog(),
                })

                if (node.hasDeletedView()) {
                    node.appendMethods({
                        functionName: node.getFunctionNameOfDeleted(),
                        params: ['param'],
                        loginOnly: node.hasLoginRequiredDialog(),
                    });
                }

                const onClickStmts = [];
                const onDeleteStmts = [];
                if (node.hasLoginRequiredDialog()) {
                    onClickStmts.push(
                        `if(!UserInfoRef.isLoginWithSucceed()) {
                        self.enableLoginConfirmDialog();
                        return;
                    }`)
                }

                if (node.hasConfirmDialog()) {
                    const stmts = [`objectOfParam.view = event;`, `${node.getFieldNameOfAlertDialog()}.current.open();`]
                    node.isAlertDialog4Deleted() ? onDeleteStmts.push(...stmts) : onClickStmts.push(...stmts);
                } else if (node.isTabItemView()) {
                    onClickStmts.push(`self.getStore().setValueOfSelectedTab(${node.getName()}.getValue())`)
                    onClickStmts.push(`${getStmtOfEventInValidate(node, node.getFunctionNameOfClicked())}`)
                } else if (node.hasCustomViewDialog()) {
                    const stmts = [`${node.getFieldNameOfAlertDialog()}.current.open();`]
                    node.isAlertDialog4Deleted() ? onDeleteStmts.push([...stmts, `self.${node.getFunctionNameOfDeleted()}(objectOfParam)`]) :
                        onClickStmts.push(...stmts, `self.${node.getFunctionNameOfClicked()}(objectOfParam)`);
                } else if (node.hasAlertMenu()) {
                    onClickStmts.push(`event.stopPropagation()`)
                    onClickStmts.push(`objectOfParam.view = event`)
                    onClickStmts.push(`${node.getFieldNameOfAlertMenu()}.current.setAnchor(event.currentTarget);`)
                    onClickStmts.push(`${node.getFieldNameOfAlertMenu()}.current.open();`)
                } else {
                    onClickStmts.push(`${getStmtOfEventInValidate(node, node.getFunctionNameOfClicked())}`)
                }

                if (node.hasDeletedView() && node.isAlertDialog4Deleted()) {
                    onClickStmts.push(`${getStmtOfEventInValidate(node, node.getFunctionNameOfClicked())}`)
                    node.appendViewProps({onDelete: `###(event, value) => {${onDeleteStmts.join('\n')}}`})
                    node.appendViewProps({onClick: `###(event, value) => {${onClickStmts.join('\n')}}`})
                } else if (node.hasDeletedView() && node.isAlertDialog4Click()) {
                    /** alertDialog 不是為了deleted*/
                    onDeleteStmts.push(...[`objectOfParam.view = event;`, `self.${node.getFunctionNameOfDeleted()}(objectOfParam)`])
                    node.appendViewProps({onClick: `###(event, value) => {${onClickStmts.join('\n')}}`});
                    node.appendViewProps({onDelete: `###(event, value) => {${onDeleteStmts.join('\n')}}`})
                } else {
                    node.appendViewProps({onClick: `###(event, value) => {${onClickStmts.join('\n')}}`})
                }
            }

            if (!node.isPathArray() && node.listEmptyTip.isDefaultValue) {
                node.disableListEmptyTip()
            }

            injectStyleBehavior(node);

            if (node.needInjectView()) {
                const params = [node.getObservableName(true)];
                _.remove(params, (each) => Util.isUndefinedNullEmpty(each))
                const nameOfInjectView = node.getFunctionNameOfInjectView();
                node.appendMethods({
                    functionName: nameOfInjectView,
                    params
                })
                node.appendContent(`{this.${nameOfInjectView}(${params.join(',')})}`)
            }

            if (node.needInjectProps()) {
                const params = [node.getObservableName(true)];
                _.remove(params, (each) => Util.isUndefinedNullEmpty(each))

                const functionNameOfInjectProps = node.getFunctionNameOfInjectProps();
                node.appendSimpleProps(`...self.${functionNameOfInjectProps}(${params.join(',')})`)
                node.appendMethods({
                    functionName: functionNameOfInjectProps,
                    params,
                })
            }

            if (node.hasVariant())
                node.appendViewProps({variant: node.getVariant()})

            if (node.hasColor()) {
                node.appendViewProps({color: node.getColor()})
            }

            this.enrichNodesOfBehavior(node.getChildren());
        }

        function injectStyleBehavior(node) {
            let clazzNameOFDefault = node.getClassNameOfLessUsage();
            const params = [node.getObservableName(true)];
            _.remove(params, (each) => Util.isUndefinedNullEmpty(each))
            if (node.needInjectStyle()) {
                const injectFunctionName = node.getFunctionNameOfInjectStyle();
                node.appendMethods({
                    functionName: injectFunctionName,
                    params,
                })
                node.appendViewProps({style: `###{...self.${injectFunctionName}(${params.join(',')}),...${JSON.stringify(node.getStyle())}, ...Style.${clazzNameOFDefault}}`})
            } else {
                node.appendViewProps({style: `###{...${JSON.stringify(node.getStyle())}, ...Style.${clazzNameOFDefault}}`})
            }

            /** 這個做法有點危險, 如果裏面是指標, 那之前所有的內容都會被更改 */
            const clazzNameOfWrap = node.getClassNameOfLessUsage('wrap');
            if (node.needInjectWrapStyle()) {
                const injectFunctionName = node.getFunctionNameOfInjectStyle('Wrap');
                node.appendMethods({
                    functionName: injectFunctionName,
                    params,
                })
                node.appendWrapProps({style: `###{...self.${injectFunctionName}(${params.join(',')}),...${JSON.stringify(node.getWrapStyle())}, ...Style.${clazzNameOfWrap}}`})
            } else {
                node.appendWrapProps({style: `###{...${JSON.stringify(node.getWrapStyle())}, ...Style.${clazzNameOfWrap}}`})
            }
        }
    }

    enrichReferenceNode(nodes) {

        for (const node of nodes) {
            if (node.isReferenceNotice()) {
                const targetName = node.ref;
                const _nodes = CodegenNode.finds(this.getStructs(), (_node) => _.isEqual(targetName, _node.getName()))
                /** 目前先抓第一個當目標*/
                if (_.isEmpty(_nodes)) {
                    throw new ERROR(7004, `not found ref, ref value is ===> ${node.ref}`);
                }

                let nodeOfReference = _.head(_nodes);

                if (nodeOfReference.isComponentNode()) {
                    nodeOfReference = nodeOfReference.getStruct();
                }

                node.ref = nodeOfReference;
                if (node.imitate) {
                    const nodeOfImitate = _.clone(nodeOfReference);
                    /**  clone 的物件 */
                    nodeOfImitate.ref = nodeOfReference;
                    nodeOfImitate.nodeOfOrigin = node;
                    /**  source.js 上的點 */
                    Util.replaceArrayByContentIndex(node.getParent().getChildren(), node, nodeOfImitate);
                }

                if (node.independence) {
                    for (const raw of nodeOfReference.raw.children) {
                        node.appendChildrenWithJsons(raw)
                    }
                }
            }
            this.enrichReferenceNode(node.getChildren());
        }
    }

    async forCloudFunctions() {
        Util.persistByPath(this.genRootPath);
        await this.appendMustacheFile('functions.package.json.mustache', libpath.join(this.genRootPath,
            `package.json`), {
            projectName: this.nodeOfAncestor.name,
            projectVersion: this.nodeOfAncestor.version,
            projectDescription: this.nodeOfAncestor.description
        });

        Util.copySingleFile(libpath.join(this.freeMarkerRootPath, 'template.babel.config.js'),
            this.genRootPath, 'babel.config.js', true);

        Util.copySingleFile(libpath.join(this.freeMarkerRootPath, 'template.function.index.js'),
            this.genRootPath, 'index.js', true);

        const apiGenerator = new ClassGenerator(libpath.join(this.genSourcePath, `api`, `BaseAdminRemoteApi.js`));
        apiGenerator.appendClass('BaseAdminRemoteApi', {name: 'CommonRemoteApi', from: '../base/CommonRemoteApi'});
        apiGenerator.needIndexFile('AdminRemoteApi', [], true);

        for (const component of this.nodeOfAncestor.getComponents()) {
            new RemoteFunctionHandler(this.props, apiGenerator).buildFetchSubmitApi(component.getStruct(), true)
        }

        await apiGenerator.persist();
        const appGenerator = new ClassGenerator(libpath.join(this.genSourcePath, 'app.js'));
        appGenerator.appendImport('* as functions', 'firebase-functions')
        appGenerator.appendImport('admin', 'firebase-admin')

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
            params
        } = func.getCloudFunctionInfo()
        const baseClass = `Base${fieldName}`;
        const generator = new ClassGenerator(libpath.join(this.genSourcePath, 'func', func.getName(), `${baseClass}.js`));
        generator.appendClass(baseClass, {name: `BaseFunction`, from: '../../base/BaseFunction'})
        generator.appendAsyncFunction(functionNameOfHandleBy,
            [...params], [], [`payload:${JSON.stringify(func.payload ?? 'needless payload')}`]);

        if (func.isCommonModule) {
            const moduleClassName = `${KEYWORD_OF_MODULARIZED}${fieldName}`;
            const moduleGenerator = new ClassGenerator(libpath.join(this.genSourcePath, 'func', func.getName(), `${moduleClassName}.js`));
            moduleGenerator.appendClass(moduleClassName, {name: baseClass, from: `./${baseClass}`});
            moduleGenerator.needSignature(false);
            moduleGenerator.appendAsyncFunction(functionNameOfHandleBy, [...params], [], []);
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
                    const editorComponent = _.cloneDeep(component);
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
                    if (node.isReadOnly()) {
                        node.appendViewProps({
                            InputProps: {
                                readOnly: true,
                            }
                        })
                    }
                }
            }

            node.setClick(false);

            if (node.isView() && node.isAttribute() && !node.isCollection() && !node.isColumnAttribute()) {
                /** 就是把不是遠端欄位的UI給刪掉 */
                delete node.view;
            }

            if (node.isColumnArray() || node.isPathArray()) {
                node.disableSelectedArray();

                if (Util.isOrEquals(node.getListView(), 'Swiper', 'TextField', 'FormControlLabel', 'RadioGroup', 'Fade', 'Slide', 'Grid')) {
                    node.setListView('div');
                }

                if (Util.isOrEquals(node.getView(), 'SwiperSlide', 'MenuItem', 'FormControlLabel', 'RadioGroup', 'Fade', 'Slide', 'Grid')) {
                    node.setView('div');
                }

                node.setWrapView('div');
                node.appendWrapContents([`{this.renderItemEditorView(
                   ${node.getFunctionNameOfItemEditorWithParam()} , ${_.toString(node.hasPath())}
                ,'${node.getPreciseAttributeParentName()}-${node.getName()}')}`]);
                const style = {borderStyle: 'solid', borderWidth: '1px', margin: '10px', borderRadius: '10px'}
                node.appendWrapStyle({...style, borderColor: 'red'});
                node.appendListStyle({...style, borderColor: 'blue'});
                node.appendListContents([`{this.renderCollectionEditorView(
                   ${node.getFunctionNameOfCollectionEditorWithParam()}, ${_.toString(node.hasPath())}
                ,'${node.getPreciseAttributeParentName()}-${node.getName()}')}`]);
            } else if (node.isObject() && node.hasPath()) {
                node.setWrapView('div');
                const style = {borderStyle: 'solid', borderWidth: '1px', margin: '10px', borderRadius: '10px'}
                node.appendWrapStyle({...style, borderColor: 'green'});
                node.appendWrapContents([`{this.renderObjectEditorView(
                   ${node.getFunctionNameOfCollectionEditorWithParam()}, ${_.toString(node.hasPath())}
                ,'${node.getPreciseAttributeParentName()}-${node.getName()}')}`]);
            }

            for (const child of node.getChildren()) {
                if (!child.editIgnore) {
                    toEditorPageStruct(child);
                }
            }
        }

        const source = this.nodeOfAncestor;
        for (const file of Util.findFilePathBy(PATH_OF_COMPONENT_MODULE, (each) => _.isEqual(each.fileNameExtension, FILENAME_OF_SOURCE_JS))) {
            if (Util.has(source.getListOfModuleComponent(), file.dirName, true)) {
                /** require的default在一個process只會被new一次，為了設計build queue['project-kh-high','project-yueh-pu']，使用了clone */
                const content = _.clone(require(file.absolute).default);

                if (Util.has(source.getComponents().map((each) => each.getName()), content.name)) {
                    /** 必免重復的component 被匯入 */
                    continue;
                }

                const componentsOfExtra = _.isArray(content.componentsOfExtra) ?
                    content.componentsOfExtra.map((component) => {
                        return {...component, isExtraComponent: true};
                    }) : [];
                delete content.componentsOfExtra;
                for (const rawOfComponent of [content, ...componentsOfExtra]) {
                    /** rawOfComponent 代表沒有被enrich過 */
                    rawOfComponent.isCommonModule = true;
                    CodegenNode.appendChildInArray(source.getComponents(), rawOfComponent)
                }
            }
        }

        const getNodes = () => source.getComponents().map(component => component.getStruct())

        this.enrichNodeWithCustomViewDefined(getNodes());
        if (needEditComponent && _.isEqual(this.env, 'dev')) {
            /** 編輯模式只有在dev */
            source.getComponents().push(...getEditorComponents());
        }
        this.enrichNodesOfBehavior(getNodes());
        this.enrichReferenceNode(getNodes())
    }

    getAppBuildParam = () => {
        return {nodeOfAncestor: this.nodeOfAncestor, ...this.props}
    }

    async forNewLess() {
        Util.appendInfo(this.nodeOfAncestor.components.map((each) => {
            return {name: each.getName(), editor: each.isPreciselyEditableComponent(), module: each.isModuleComponent()}
        }))
        await Util.cleanChildFiles(this.genRootPath, (each) => true, 'node_modules');

        const totalClassNames = [];
        for (let component of this.nodeOfAncestor.components) {
            const {classNames, events} = await new ComponentBuilder(this.props).buildBaseComponent(component);
            _.remove(classNames, (each) => !_.isEqual(component, each.node.getNodeOfComponent()))
            /** 表示這可能是reference node產生出來className, 所以要filter */
            totalClassNames.push({component, classNames});
        }
        const paramProps = {nodeOfAncestor: this.nodeOfAncestor, ...this.props}
        await new AppBuilder(paramProps).buildAllNewBrandLessFiles(totalClassNames);
    }

    async forWeb() {
        const paramProps = {nodeOfAncestor: this.nodeOfAncestor, ...this.props}
        const totalClassNames = [];
        const totalEvents = [];
        for (let component of this.nodeOfAncestor.components) {
            const result = await new ComponentBuilder(this.props).buildBaseComponent(component);
            if (result !== undefined) {
                const classNames = result.classNames;
                const events = result.events;
                _.remove(classNames, (each) => !_.isEqual(component, each.node.getNodeOfComponent()))
                /** 表示這可能是reference node產生出來className, 所以要filter */
                totalClassNames.push({component, classNames});
                totalEvents.push(...events);
            }

            if (!component.isPreciselyEditableComponent() && component.getStruct().isAttribute())
                await new StoreBuilder(this.props).buildBaseStore(component.getStruct());
        }
        /** 因為 用到 method getGenStores(),stores 要等 gen出來才知道, 必須放在這邊 */
        await new StoreBuilder(paramProps).buildStoreIndexFiles();
        await new AppBuilder(paramProps).buildAllNewBrandLessFiles(totalClassNames);
        await new AppBuilder(paramProps).buildStyleFiles(totalClassNames);
        await new AppBuilder(paramProps).buildAppIndexFiles();
        await new AppBuilder(paramProps).buildI18n();
        await this.buildDistAssetFolder();
        if (!ENABLE_FAST_DEVELOP_MODE) {
            await new AppBuilder(paramProps).buildWebpackNPackageJson();
            await new AppBuilder(paramProps).buildCloudFunctionsApi();
            await new AppBuilder(paramProps).buildRouterFile();
            await new AppBuilder(paramProps).buildCookieFiles();
            await new AppBuilder(paramProps).buildEventFolder(totalEvents);
            await new AppBuilder(paramProps).buildHtmlIndexAssetsFile();
        }
        Util.copySingleFile(libpath.join(this.freeMarkerRootPath, 'template.html'), this.genRootPath, 'template.html', true);

    }

    async buildLessToCss() {
        const files = Util.findFilePathBy(this.genSourcePath, (file) => _.isEqual(file.extension, 'less'));
        for (const each of files) {
            await Util.executeCommandLine(`lessc ${each.absolute} ${libpath.join(each.dirPath, `${each.fileName}.css`)}`);
        }
    }

    buildCustomizePackages = async () => {
        await new AppBuilder(this.props).buildCustomizeFiles(
            this.nodeOfAncestor.getCustomizePackages().filter((each) => _.isEqual(each.platform, this.platform)));
    }

    setFunctionNeedDeploy(need = true) {
        this.needDeployCloudFunctions = need;
    }

    async deployFunctionsToProd() {
        const clouds = this.getAllCloudFunctions();
        const command = _.filter(clouds, (cloud) => cloud.deployToRemote).map(cloud => `functions:${cloud.getName()}`).join(',');
        await this.executeCommandToFirebaseRemote(`firebase deploy --only "${command}"`)
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

    async activate() {
        const self = this;
        const enableOfRapid = this.isProduction() ? false : !!this.nodeOfAncestor.rapidBuild.enable;
        const components = this.nodeOfAncestor.rapidBuild.componentName;

        if(this.isAdminPlatform())
            ENABLE_FAST_DEVELOP_MODE = false;

        if (!enableOfRapid)
            return await self.execute();

        if (this.isWebPlatform() && enableOfRapid) {
            ENABLE_FAST_DEVELOP_MODE = true;
            /** typeof [array] 會 return object */
            switch (typeof components) {
                case 'object':
                    if (_.isArray(components))
                        for (const component of components) {
                            TARGET_COMPONENT_FAST_DEVELOP_MODE = component;
                            await self.execute()
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

    async execute() {

        function isRapidModeCleanFileAllowRule(file) {
            return Util.or(
                (_.startsWith(file.dirName, TARGET_COMPONENT_FAST_DEVELOP_MODE) &&
                    _.startsWith(file.fileName, `Base${_.upperFirst(TARGET_COMPONENT_FAST_DEVELOP_MODE)}`)),
                _.isEqual(file.dirName, 'less'),
                _.isEqual(file.dirName, 'style'),
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
                editor: each.isPreciselyEditableComponent(),
                module: each.isModuleComponent(),
                extra: each.isExtraComponent
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
            await new AppBuilder(this.props).overrideLessFile();
        }

        await this.runInstallIfNeed();
        await this.functionsGenerateRelease();
        await this.buildLessToCss();
        await this.removeEmptyFolder();
    }

    async functionsGenerateRelease() {
        if (this.needDeployCloudFunctions && this.isFunctionsPlatform()) {
            Util.cleanAllFiles(libpath.join(this.genRootPath, 'release'));
            await Util.generatePackage(this.genRootPath, false);
            /** 會產生出 release folder */
            await this.copyFunctionsModuleToDestFolder();
        }
    }

    async copyFunctionsModuleToDestFolder() {
        const deployPathOfFunction = Util.persistByPath(libpath.join(this.nodeOfAncestor.getDirectoryName(), 'functions'));
        Util.cleanAllFiles(deployPathOfFunction);
        Util.renameFile(libpath.join(this.genRootPath, 'release', 'lib', 'app.js'), 'index');
        Util.copyFromFolderToDestFolder(libpath.join(this.genRootPath, 'release'), deployPathOfFunction);
    }

    getIgnoredFilesByPlatform() {
        const fileNames = [];
        switch (this.platform) {
            case 'functions':
                fileNames.push('CommonEventBus.js')
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
        if (!fs.existsSync(libpath.join(this.genRootPath,
            `node_modules`
        )))
            await Util.executeCommandLine(
                `cd ${this.genRootPath} && npm install --force`
            );
    }

}


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

        const context = require(libpath.join(this.projectRootPath, FILENAME_OF_SOURCE_JS)).default;
        if (_.isEmpty(context.genRootPath)) {
            throw new ERROR(9999, `${this.projectRootPath}/'${FILENAME_OF_SOURCE_JS}' 裡面沒有attribute ==> genRootPath`)
        }
        this.genRootPath = libpath.resolve(context.genRootPath);
        this.init();
    }


    init() {
        if (!fs.existsSync(libpath.join(this.projectRootPath, FILENAME_OF_SOURCE_JS))) {
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
    }

    async deployFunctionsToProd() {
        const functions = new ProjectFileHandler(this.getBuildObject('functions', 'prod'));
        await functions.cleanGenDirectory();
        await functions.activate();
        await functions.deployFunctionsToProd();
    }

    async deployFunctionsWithoutBuild() {
        const functions = new ProjectFileHandler(this.getBuildObject('functions'));
        await functions.deployFunctionsToProd();
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
        Util.appendInfo(
            `web deploy succeed`
        );
    }

    async deployWebProdWithoutBuild() {
        const web = new ProjectFileHandler(this.getBuildObject('web', 'prod'));
        await web.buildProdWebDistToProjectThanDeploy(true, false);
        Util.appendInfo(
            `web deploy succeed`
        );
    }


    async buildCloudFunctions(deploy = true) {
        const functions = new ProjectFileHandler(this.getBuildObject('functions'));
        functions.setFunctionNeedDeploy(deploy);
        await functions.activate();
        Util.appendInfo(
            `functions done`
        );
    }

    /** 就是改code 不要rebuild細節 直接打包到部署目錄*/
    async refreshFunctionsFolder(deploy = true) {
        const functions = new ProjectFileHandler(this.getBuildObject('functions'));
        functions.setFunctionNeedDeploy(deploy);
        await functions.functionsGenerateRelease()
        Util.appendInfo(
            `functions refresh done`
        );
    }

    async generateReleaseFunctionsModule() {
        const functions = new ProjectFileHandler(this.getBuildObject('functions'));
        await functions.functionsGenerateRelease();
        await functions.copyFunctionsModuleToDestFolder();
    }

    async removeEmptyFolder() {
        const web = new ProjectFileHandler(this.getBuildObject('web'));
        await web.removeEmptyFolder();
    }

    async buildLessFilesOnly() {
        const web = new ProjectFileHandler(this.getBuildObject('web'));
        await web.forNewLess();
        Util.appendInfo(
            `less done`
        );
    }

    async buildAdmin(deployToRemote = true) {
        const admin = new ProjectFileHandler(this.getBuildObject('admin'));
        if (!deployToRemote)
            admin.disableRulesRemoteDeploy();

        await admin.activate();
        Util.appendInfo(
            `admin done`
        );
        admin.cleanCache();
    }

    async buildIndexRule() {
        const handler = new ProjectFileHandler(this.getBuildObject('admin'))
        await handler.generateFireIndexRules();
    }

    async buildLessToCss() {
        const handler = new ProjectFileHandler(this.getBuildObject('web'))
        await handler.buildLessToCss()
    }

    async test() {
        const handler = new ProjectFileHandler(this.getBuildObject('web'));
        console.log(handler.getGenComponent());
    }

    async buildStorageRule() {
        const handler = new ProjectFileHandler(this.getBuildObject('admin'))
        await handler.generateStorageRules();
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
        handler.persistCustomizePackages()
        handler.persistImageFolder();
        handler.persistIndexAndLessFiles();
        handler.persistLessLibs();
        Util.appendInfo(`persist ${platform} done`);

    }

    async modifiedI18n(platform = 'web') {
        const handler = new ProjectFileHandler(this.getBuildObject(platform));
        await handler.rewriteModulesI18nFiles();
    }

}

class ScheduleManager {

    projectsOfPath;

    behavior;

    constructor(behavior, ...projectsOfPath) {
        this.behavior = behavior;
        this.projectsOfPath = projectsOfPath;
    }

    async resume() {
        for (const project of this.projectsOfPath) {
            await this.handler(this.behavior, project);
        }
        return `4888446 projects=>[${this.projectsOfPath}]- execute '${this.behavior}' [${ENABLE_FAST_DEVELOP_MODE ? 'RAPID' : 'FULL'}] build succeed`;
    }

    async handler(behavior, pathOfProject) {
        const props = {
            projectRootPath: pathOfProject,
        }
        const builder = new BuildApplication(props)
        const timeOfStart = Util.getCurrentTimeStamp();
        switch (behavior) {
            case 'functionsGenerateRelease':
                await builder.generateReleaseFunctionsModule();
                break;
            case 'fastFunctionsOnly':
                await builder.buildCloudFunctions(false);
                break;
            case 'functionsOnly':
                await builder.buildCloudFunctions();
                break;
            case 'refreshFunctionFolder':
                await builder.refreshFunctionsFolder();
                break;
            case 'refreshFunctionFolderThenDeploy':
                await builder.refreshFunctionsFolder();
                await builder.deployFunctionsWithoutBuild();
                break;
            case 'deployFunctionsToProduction':
                await builder.deployFunctionsToProd();
                break;
            case 'deployWebToProduction':
                await builder.deployWebProd();
                break;
            case 'deployWebToProductionWithoutBuild':
                await builder.deployWebProdWithoutBuild();
                break;
            case 'buildWebToProduction':
                await builder.deployWebProd(false, true);
                break;
            case 'deployFunctionsWithoutBuild':
                await builder.deployFunctionsWithoutBuild();
                break;
            case 'deployPlatformToProd':
                await builder.deployFunctionsToProd();
                await builder.deployWebProd();
                break;
            case 'persistentFunctions':
                await builder.persistent('functions');
                await builder.buildCloudFunctions();
                break;
            case 'adminOnly':
                await builder.buildAdmin();
                break;
            case 'webOnly':
                await builder.buildWeb();
                break;
            case 'persistentBuildWeb':
                await builder.persistent('web');
                await builder.buildWeb();
                break;
            case 'persistentBuildAdmin':
                await builder.persistent('admin');
                await builder.buildAdmin();
                break;
            case 'BuildQuickAdmin':
                await builder.persistent('admin');
                await builder.buildAdmin(false);
                break;
            case 'BuildQuickAdminWithoutPersist':
                await builder.buildAdmin(false);
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
                await builder.persistent('functions');
                break;
            case 'persistentFunctionsOnly':
                await builder.persistent('functions');
                break;
            case 'persistentWebOnly':
                await builder.persistent('web');
                break;
            case 'persistentAdminOnly':
                await builder.persistent('admin');
                break;
            case 'newLessFileOnly':
                await builder.buildLessFilesOnly();
                break;
            case 'buildAllPlatform':
                await builder.buildWeb();
                await builder.buildAdmin();
                await builder.buildCloudFunctions();
                break;
            case 'buildStoreIndexJson':
                await builder.buildIndexRule();
                break;
            case 'developLatestFunction':
                await builder.modifiedI18n();
                break;
            default:
                Util.appendInfo(`874845 project=> ${pathOfProject} || behavior=>'${behavior}' jo4你怪怪的`);
                break
        }
        Util.appendInfo(`${Util.getCurrentTimeFormatYMDHMS()} 專案[${pathOfProject}] 執行[${behavior}] 耗時 ${Util.getSecondFormatOfDuration(Util.getCurrentTimeStamp() - timeOfStart)} 秒`);
    }

}

if (configerer.DEBUG_MODE) {
    (async () => {
        /** 紀錄最近一次回答的內容，不然每次都要打字再Enter好懶 */
        const FILENAME_OF_LATEST_REPLY = `temp/ReplyOfLastTime.json`;
        const ATTRIBUTE_NAME_OF_INDEXES = `indexes`;

        async function getProjectsByPromptInput() {
            function getStringOfLatestReply() {
                const raw = Util.getFileContextInRaw(FILENAME_OF_LATEST_REPLY);
                let answerOfLastTime = _.isEmpty(raw) ? undefined : JSON.parse(raw)
                return answerOfLastTime ? answerOfLastTime[ATTRIBUTE_NAME_OF_INDEXES] : undefined;
            }

            const pathOfTarget = `/Users/davidtu/cross-achieve/high/idea-inventer/free_marker`;
            const folders = Util.findFilePathBy(pathOfTarget, (file) => (_.isEqual(file.fileNameExtension, 'source.js')
                && _.startsWith(file.folderName, 'project-')), `node_modules`).map(file => file.folderName);


            if (_.isEmpty(folders))
                return Util.appendInfo(`548441 valid project not existed in ${pathOfTarget}`);


            const replyOfLatest = getStringOfLatestReply();
            const result = await Util.getObjectFromPromptQ({
                name: ATTRIBUTE_NAME_OF_INDEXES,
                type: 'string',
                require: false,
                default: replyOfLatest ? `${replyOfLatest}` : undefined,
                description: `select build project:\n\n${folders.map((name, index) => `${index}:${name}`)
                    .join('\n')}\n\nplease type the index${replyOfLatest ? `(default:${replyOfLatest})` : ''}`
            });

            if (_.isEmpty(result.indexes))
                return Util.appendInfo(`489498444 get error of input => ${result}`);


            await Util.persistJsonFilePrettier(FILENAME_OF_LATEST_REPLY, result, false);
            const indexes = result.indexes.split('').map((each) => _.toNumber(each));
            return Util.getSliceArrayOfSpecificIndexes(folders, ...indexes);
        }

        const projects = CURRENT_PROJECT ? [CURRENT_PROJECT] : await getProjectsByPromptInput();
        const behavior = Util.getNodeEnvVariable('type');
        const worker = new ScheduleManager(behavior, ...projects);
        const msg = await worker.resume();
        Util.appendInfo(msg);

    })();
}
