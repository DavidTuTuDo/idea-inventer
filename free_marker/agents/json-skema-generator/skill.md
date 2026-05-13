# json-skema-generator Skill Set & Codegen Reference (悅譜框架開發指南)

本文件是 `json-skema-generator` 的核心技能庫，定義了如何基於 `idea-inventer` 框架設計 `source.js` 與開發業務邏輯。所有設計必須嚴格參考 `free_marker/src/index.js` 中的 `CodegenNode` 屬性。你的主要任務是「新增」或「修改」類似 `yuehlolhui.js` (Project) 或 `dionysus.js` (Module) 的 JSON 設定檔。

---

## 1. 核心設計架構：source.js

`source.js` 是描述整個專案或功能模組的藍圖。它採用 JSON 結構，將 UI 佈局、資料結構、業務邏輯與雲端部署配置高度集成。

### A. 部署目標 (Destination)
- **project**: 完整專案。包含 Firebase 配置、部署路徑、環境變數、金流設定等。
- **module**: 功能模組。主要定義 `struct`，供專案引用。

### B. 核心設計原則
- **雙重身分 (Dual Identity)**：每個節點既是 UI 組件（View），也是資料欄位（Data）。
- **由上至下 (Top-Down)**：`children` 的順序即 UI 渲染順序。
- **層級映射**：`type: "array"` 的 `children` 定義了數組項 (Item) 的內部結構。

---

## 2. 專案級配置 (Project Level Props)

當 `destination: "project"` 時，外層必須具備以下屬性：

### 基礎與部署資訊
- `name` / `idOfProject`: 專案唯一標識與 Firebase Project ID。
- `genRootPath` / `directory`: 代碼生成目標相對路徑與專案實體路徑。
- `host`: `{ dev: "...", prod: "..." }` 網域名稱。
- `locationOfFirestore`, `locationOfFunctions`, `locationOfStorage`: 雲端主機區域 (如 `"asia-east1"`)。
- `firebase` / `admin` / `account`: Firebase SDK 與 Service Account 資訊。
- `email`: 供 CLI 部署與權限用的 Google 帳號。
- `modulesOfIgnore`: (array) 要忽略產生的 module 名稱。
- `rapidBuild`: `{ enable: true, componentName: ["main"] }` 快速開發模式。

### 服務與第三方整合
- `ecpay` / `linepay`: 第三方金流的環境參數 (包含 dev, prod, real_prod 等)。
- `liffId` / `liffChannelId`: LINE 登入或 LIFF 整合。
- `useCartie`: (boolean) 是否啟用全域購物車系統。

### 全局 UI 設定
- `navigation`: 全局導覽列配置。`{ view: "navigator", isScrollingHide: true, contents: [] }`。
- `watermark`: 浮水印配置。`{ type: "text", src: "kx-bio", alpha: 0.1, position: "lowerRight" }`。

---

## 3. 組件級配置 (Component Level Props)

定義在 `components` 與 `componentsOfExtra` 陣列中的頁面或功能塊：

- `name`: 組件名稱（影響產生的 Class 名）。
- `path`: 路由路徑（如 `/profile/:uid`）。
- `title`: 瀏覽器分頁標題。
- `detailPage`: (boolean) 若為詳情頁面需註記為 true，並與主列表連動。
- `editor`: (boolean) 是否產生對應的 `EditableComponent` 編輯頁面。
- `disposablePage`: (boolean) 若為 true，每次進入路由都會重新實例化 Store。
- `loginOnlyPage`: (boolean) 是否需登入才能訪問。
- `cookies`: (array) 定義此頁面使用的加密 Cookie，`[{ name: "myCookie", type: "object" }]`。

---

## 4. CodegenNode 屬性字典 (基於 index.js)

### A. 基礎資料屬性 (Basic Data)
- `name`: 節點名稱。
- `type`: 資料類型 (`string`, `number`, `boolean`, `timestamp`, `object`, `array`, `arrayOfField`, `objectOfEmpty`)。
- `defaultValue`: 初始值。支援 `###` 引導 JS 代碼（如 `###dayjs()`）。
- `description`: 欄位描述 / TextField 的 Label。
- `plural`: (string) 複數形式 (如 `s` 或 `es`)，用於 `array` 類型產生合理的函數名。
- `column`: (boolean) 是否持久化到 Firestore。
- `cheap`: (boolean) 若為 true，代表此陣列資料量小且不需複雜查詢(如圖片陣列)，會優化資料存取成本。
- `ignoreI`: (boolean) 寫入 Firestore 時不建立索引。
- `idxes`: (array) 複合索引設定，如 `[[{ name: "keywords", type: "arrayConfig", rule: "CONTAINS" }]]`。
- `trim`: (boolean) 寫入前是否自動修剪字串前後空格。

### B. UI 與佈局控制 (UI & Layout)
- `view`: UI 組件 (MUI 組件如 `Typography`, `TextField`, `Button`, `Chip`, `div` 等)。
- `wrapView` / `wrapProps` / `wrapStyle`: 在外層包裹元件並注入屬性/樣式。
- `listView` / `listProps` / `listStyle`: 控制陣列容器的外觀 (如 Tabs 或特定排列)。
- `listWrapView` / `listWrapProps`: 陣列容器更外層的控制。
- `incest`: `{ attribute: true, view: false }` **層級跳轉**。讓資料結構與 UI 層級脫鉤（無視此層級的資料路徑）。
- `props`: 傳給視圖的屬性 (如 `{ fullWidth: true, variant: "outlined" }`)。
- `needParam`: (boolean) 視圖渲染時是否依賴迭代中的單一參數。
- `disableObservable`: (boolean) 針對不能被 observer 包覆的套件 (如 Swiper 或 Tabs)。

### C. 表單與輸入進階 (Form & Input)
- `typeOfTextField`: (string) 自動填充支持，如 `email`, `tel`, `name`, `password` 等。
- `singleLine`: (boolean) TextField 強制單行。
- `inputRegEx`: (string) 限制輸入格式的正則。
- `disableOnChangeSetter`: (boolean) 取消預設的 onChange Store 更新行為。
- `labelView`: 為 Typography 加入 icon 或前綴。

### D. 彈窗與互動行為 (Dialog & Interactions)
- `click`: (boolean) 開啟點擊事件。
- `alertDialog`: 彈窗行為設定。
  - `customView`: 指定另一個組件名稱作為彈窗內容。
  - `needActionButtons`: (boolean) 是否需要預設的確認/取消按鈕。
  - `title`, `content`: 預設彈窗的標題與內容。
  - `fullWidth`, `strict`, `presetObj`: 細部控制行為。
- `needImageDialog` / `imgPreview`: 控制圖片點擊放大預覽。

### E. 資料邏輯與 Store (Data & Store)
- `path`: 遠端資料路徑 (如 `/users/:uid/hera`)。
- `permission`: 權限敘述。支援 `read`, `write`, `create`, `update`, `delete`，可使用 `isAuthor()`, `isAdmin()`, `alwaysTrue()` 等。
- `paginate`: 分頁設定 `{ threshold: 30, size: 15 }`。
- `conditions`: Firestore 查詢條件。如 `["{type:'orderBy', params:['createTime', 'desc']}"]`。
- `disableInitFetch`: (boolean) 關閉掛載元件時的初始抓取。
- `computed`: (boolean) 自動產生 getter 取值方法。

### F. 動態注入與客製化 (Injections & Overrides)
- `injectStyle`, `injectWrapStyle`, `injectListStyle`: (boolean) 產出動態產生樣式的方法供邏輯控制。
- `injectProps`: (boolean) 動態產生屬性的方法。
- `cloudFunctions`: 定義後端函數。`{ name: "sendEmailOfReceipt", type: "httpOnCall", payload: {} }`。
- `methods`: 直接定義元件擴充方法陣列。

---

## 5. 進階設計模式

### A. Incest 模式 (層級跳轉)
當 UI 為了排版需要額外容器，但資料結構不應被改變時使用。
```javascript
{
    name: "row",
    view: "div",
    children: [
        {
            name: "price",
            view: "Typography",
            type: "number",
            incest: { attribute: true, view: false } // 資料結構上會直接跳過 row 這層
        }
    ]
}
```

### B. 模組化擴展 (componentsOfExtra)
將高關聯性的功能（如「列表」與「編輯器」）打包。主組件存放在 `components`，關聯組件存放在 `componentsOfExtra`。

### C. Ref & Imitate (節點複用)
使用 `ref: "dionysus"` 引用已定義的結構，並用 `imitate: true` 完全仿製該節點，搭配 `implementActions: true` 實作按鈕與樣式覆寫。

---

## 6. Agent 實作與開發注意事項 (Best Practices)

1.  **環境與模組判別**：
    - 開發 `destination: "project"` 時，需確保包含完整的 Firebase, host, directory 與金流配置。
    - 開發 `destination: "module"` 時，專注於 `struct` 的資料結構、權限與 UI 佈局。
2.  **由上至下編排 (UI First)**：
    - `children` 陣列必須嚴格按照 UI「從上到下、從左到右」的顯示順序放入。
3.  **精準運用佈局與層級映射**：
    - 善用 `wrapView` 與 `incest` 處理畫面排版與 JSON 資料結構的衝突。
    - 凡是沒有獨立資料價值的排版容器（例如 `name: "row", view: "div"`），其子資料節點請搭配 `incest` 以維持資料平整化。
4.  **優化 Firestore 結構與成本**：
    - 使用 `cheap: true` 標記簡單且不會單獨被查詢的次陣列（如商品照片）。
    - 確實定義 `plural` 以產生語意化的方法。
    - 適時搭配 `ignoreI: true` 關閉不必要的索引。
5.  **代碼產出驗證**：
    - 確保 `source.js` JSON 結構完整且所有 key 都存在於本指南中。

---

## 7. 元件範本 (Component Templates)

### A. AlertMenu (更多操作選單)
當需要為元件（如列表項）增加操作選單時，慣用的實作範本如下：
```javascript
{
    name: "extra",
    view: "IconButton",
    needParam: true,
    l10n: true,
    icon: "MoreHoriz",
    // 若需懸浮定位可加入 layer
    // layer: { position: "upperRight" },
    alertMenu: {
        items: [
            {
                name: "delete",
                label: "刪除",
                icon: "CancelScheduleSend",
                loginOnly: true,
                id: 1,
                notice: { 
                    title: "執行遠端刪除", 
                    content: "是否從列表中刪除，並確認檔案無法回復" 
                }
            }
        ]
    }
}
```

### B. Dialog Trigger (觸發彈窗元件)
當需要新增一個按鈕來觸發特定組件的 Dialog 時（例如 'pretend' 觸發 'storyteller'），實作範本如下：
```javascript
{
    name: "pretend",
    view: "div", // 或 "IconButton", "Button"
    injectStyle: true,
    alertDialog: {
        customView: "storyteller", // 目標組件名稱
        needActionButtons: false,
        fullWidth: true,
        globalOfRef: true // 使用全局引用開啟
    }
}
```
