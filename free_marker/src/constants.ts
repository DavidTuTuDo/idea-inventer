/**
 * constants.ts
 *
 * 功能說明：
 * 集中管理所有 Code Generator 使用的常數、標記符號、預設設定值。
 * 包含：檔案分區標記、路徑常數、支援語言列表、RWD 斷點、MUI 元件 import 對照表等。
 *
 * 設計理念：
 * 從原本散落在 index.js 頂部的全域常數/變數，統一抽取至此，方便查找與維護。
 */

import type { LessModule, ViewImportConfig } from "./types";

// ─── Fast Develop Mode ─────────────────────────────────────────────

/** 快速開發模式開關，啟用後只會 build 指定的 component */
export let ENABLE_FAST_DEVELOP_MODE: boolean = false;

/** 快速開發模式的目標 component 名稱 */
export let TARGET_COMPONENT_FAST_DEVELOP_MODE: string = '';

/** 設定快速開發模式 */
export function setFastDevelopMode(enable: boolean, target: string = ''): void {
    ENABLE_FAST_DEVELOP_MODE = enable;
    TARGET_COMPONENT_FAST_DEVELOP_MODE = target;
}

// ─── Sign / Marker 常數（用於 ClassGenerator 分區管理） ──────────────

/** Class 內 function 區塊的分隔標記 */
export const SIGN_OF_FUNCTION_START = `/** -------------------- functions -------------------- **/`;

/** Class 內 field 區塊的分隔標記 */
export const SIGN_OF_FIELD_START = `/** -------------------- fields -------------------- **/`;

/** Class 內 restful API 區塊的分隔標記 */
export const SIGN_OF_RESTFUL_API_START = `/** -------------------- async api -------------------- **/`;

/** Firestore collection 標記 */
export const SIGN_OF_COLLECTION_START = `/** --- documents--- **/`;

/** JSX content 插入點標記 */
export const SIGN_OF_JSX_CONTENT = `<!-- jsx content -->`;

/** 無效節點的識別標記 */
export const SignOfInValidNode = 'SignOfInValidNode';

/** 空 Store 的標記 */
export const SIGN_OF_EMPTY_STORE = 'pure';

/** 在 Store 內完成 import material-icon/${icon} 的標記 */
export const SIGN_OF_IMPORT_MUI = 'useAsImportMuiIcon';

// ─── 路徑 / 檔案相關常數 ───────────────────────────────────────────

/** free_marker template 目錄的絕對路徑 */
export const PATH_OF_FREE_MARKER_TEMPLATE = '/Users/davidtu/cross-achieve/legacy/idea-inventer/free_marker/template';

/** component module 的相對路徑 */
export const PATH_OF_COMPONENT_MODULE = `./src/modules`;

/** source.js 的固定檔名 */
export const FILENAME_OF_SOURCE_JS = `source.js`;

/** i18n 檔案的副檔名 */
export const FILE_EXTENSION_OF_I18N = 'i18n.stmts';

// ─── 欄位名稱常數 ──────────────────────────────────────────────────

/** 模組化 class 的命名前綴 */
export const KEYWORD_OF_MODULARIZED = 'Modularized';

/** cheap array 預設的 document ID */
export const ID_OF_DEFAULT_CHEAP_ARRAY = `contents`;

/** cheap array 預設的 string ID */
export const STRING_OF_ID_OF_DEFAULT_CHEAP_ARRAY = `id`;

/** Store 注入的欄位名稱 */
export const FIELD_NAME_OF_INJECT_STORE = 'injectStore';

/** proxy 注入參數的欄位名 */
export const STRING_OF_INJECT_PARAM = 'paramsOfProxy';

/** 請求大小限制的欄位名 */
export const FIELD_NAME_OF_MAX_SIZE_OF_REQUEST = 'sizeOfPerRequest';

/** 分頁大小的欄位名 */
export const FIELD_NAME_OF_SIZE_PER_PAGE = 'sizeOfPerPage';

// ─── 設定值常數 ────────────────────────────────────────────────────

/** view props 的四種類型 */
export const TYPES_OF_PROPS_VIEW = ['list', 'listWrap', 'wrap', 'default'] as const;

/** 支援的多國語言列表 */
export const LANGUAGES_OF_SUPPORT = ['zh_TW', 'zh_CN', 'en_US'] as const;

/** 單次 Firestore fetch 的最大文件數 */
export const MAXIMUM_DOCUMENTS_PER_FETCH = 50;

// ─── RWD 斷點規則 ──────────────────────────────────────────────────

/** RWD 斷點規則定義 */
export const LESS_MODULES: LessModule[] = [
    {
        name: 'mobile',
        rule: 'only screen and (min-width: 320px) and (max-width: 600px)',
    },
    {
        name: 'tablet',
        rule: 'only screen and (min-width: 601px) and (max-width: 1024px)',
    },
    {
        name: 'desktop',
        rule: 'only screen and (min-width: 601px)',
    },
];

// ─── View Import 對照表 ────────────────────────────────────────────

/**
 * 第三方 View 的 import 對照表
 *
 * - `from`: import 來源套件
 * - `views`: 該套件提供的 view 元件名稱
 * - `object`: 是否使用 named import `{Component}`
 * - `simplePath`: from 後面不需要接 views 路徑
 */
export const VIEW_IMPORTS: ViewImportConfig[] = [
    {
        from: `react-qr-code`,
        views: ['QRCode'],
        simplePath: true, /** from後面 不用接views import AudioPlayer from 'react-h5-audio-player' */
    },
    {
        from: `react-h5-audio-player`,
        views: ['AudioPlayer'],
        simplePath: true, /** from後面 不用接views import AudioPlayer from 'react-h5-audio-player' */
    },
    {
        from: `@mui/icons-material`,
        views: ['EditCalendarRounded', 'SchoolRounded', 'PhoneRounded', 'SearchRounded', 'MenuRounded', 'MailOutlined', 'PhoneOutlined', 'ChevronRight', 'MoreHoriz', 'CopyAll', 'StarRounded', 'Summarize'],
    },
    {
        from: `@mui/material`,
        views: ["Accordion", "AccordionSummary", "AccordionDetails","Badge", "Checkbox", "Chip", "Skeleton", "Autocomplete", "InputBase", "Switch", "SwipeableDrawer", "MenuItem", "Grid", "Stack", "Paper", "Card", "Avatar", "AppBar", "Toolbar", "TextField",
            "Radio", "RadioGroup", "ButtonGroup", "FormControlLabel", "Slider", "Typography", "Button", "IconButton",
            "Drawer", "ListItem", "List", "Tabs", "Tab", "CircularProgress"]
    },
    {
        from: `@mui/x-date-pickers`,
        views: ['LocalizationProvider', 'AdapterDayjs'],
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
        from: `swiper/react`,
        views: ['Swiper', "SwiperSlide"],
        object: true,
        simplePath: true
    }
];
