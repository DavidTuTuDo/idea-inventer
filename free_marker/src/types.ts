/**
 * types.ts
 *
 * 功能說明：
 * 集中定義專案中所有共用的 TypeScript 型別與介面。
 * 供各模組（Builder、Generator、Node 等）引用，確保型別一致性。
 */

// ─── Platform & Environment ────────────────────────────────────────

/** 支援的平台類型 */
export type PlatformType = 'web' | 'admin' | 'functions';

/** 部署環境 */
export type EnvType = 'dev' | 'prod';

// ─── Build Configuration ───────────────────────────────────────────

/** 建置參數（傳入各 Builder / Handler 的共用 props） */
export interface BuildProps {
    /** free_marker 根目錄路徑 */
    freeMarkerRootPath: string;
    /** 產出檔案的根目錄路徑 */
    genRootPath: string;
    /** 專案根目錄路徑（含 source.js） */
    projectRootPath: string;
    /** 目標平台 */
    platform: PlatformType;
    /** 部署環境 */
    env: EnvType;
}

// ─── Class Generator ───────────────────────────────────────────────

/** ClassGenerator.appendClass 的父類設定 */
export interface SuperClassConfig {
    name: string;
    from: string;
}

/** ClassGenerator.appendFunction 的函式設定（可為字串或物件） */
export interface FunctionConfig {
    name: string;
    arrow?: boolean;
    async?: boolean;
    decorator?: string;
    simple?: boolean;
}

/** Import 語句描述 */
export interface ImportStatement {
    /** import 的部分，例如 `Router` 或 `{inject, observer}` */
    part: string;
    /** import 來源路徑 */
    from: string;
}

// ─── Constants Type Definitions ────────────────────────────────────

/** LESS RWD 模組定義 */
export interface LessModule {
    name: string;
    rule: string;
}

/** View Import 對照表定義 */
export interface ViewImportConfig {
    from: string;
    views: string[];
    object?: boolean;
    simplePath?: boolean;
}

// ─── CodegenNode Related ───────────────────────────────────────────

/** Cloud Function 定義 */
export interface CloudFunctionDef {
    name: string;
    type: 'httpOnCall' | 'schedule' | 'httpOnRequest';
    description?: string;
    schedule?: string;
    payload?: any;
    isRegularResponse?: boolean;
}

/** Firestore Permission 定義 */
export interface FirestorePermission {
    read?: string;
    write?: string;
    create?: string;
    update?: string;
    delete?: string;
}

/** Cookie 定義 */
export interface CookieDef {
    name: string;
    type: 'string' | 'object';
    description?: string;
    defaultValue?: any;
    isObject: () => boolean;
}

/** ClassName 資訊（用於 Less 產生） */
export interface ClassNameInfo {
    node: any;
    type: 'list' | 'listWrap' | 'wrap' | 'default' | 'skeleton';
}

/** Component 的 className 資訊集合 */
export interface ClassNameInfoGroup {
    component: any;
    classNames: ClassNameInfo[];
    events?: any[];
}
