# Agent-Yueh Skill Set & Codegen Reference (悅譜框架開發指南)

本文件是 Agent-Yueh 的核心技能庫，定義了如何基於 `idea-inventer` 框架設計 `source.js` 與開發業務邏輯。所有設計必須嚴格參考 `free_marker/src/index.js` 中的 `CodegenNode` 屬性。

---

## 1. 核心設計架構：source.js

`source.js` 是描述整個專案或功能模組的藍圖。它採用 JSON 結構，將 UI 佈局、資料結構、業務邏輯與雲端部署配置高度集成。

### A. 部署目標 (Destination)
- **project**: 完整專案。包含 Firebase 配置、部署路徑、環境變數等。
- **module**: 功能模組。主要定義 `struct`，供專案引用。

### B. 核心設計原則
- **雙重身分 (Dual Identity)**：每個節點既是 UI 組件（View），也是資料欄位（Data）。
- **由上至下 (Top-Down)**：`children` 的順序即 UI 渲染順序。
- **層級映射**：`type: "array"` 的 `children` 定義了數組項 (Item) 的內部結構。

---

## 2. 專案級配置 (Project Level Props)

當 `destination: "project"` 時，外層必須具備以下屬性：

| 屬性名 | 類型 | 描述 |
| :--- | :--- | :--- |
| `name` | string | 專案唯一標識。 |
| `idOfProject` | string | Firebase Project ID。 |
| `genRootPath` | string | 代碼生成目標相對路徑 (例如 `../gen/my-project`)。 |
| `directory` | string | 專案實體路徑 (用於部署與持續化)。 |
| `host` | object | `{ dev: "http://localhost:8080/", prod: "https://...web.app/" }`。 |
| `firebase` | object | Firebase Web SDK 配置 (apiKey, authDomain 等)。 |
| `admin` | object | Firebase Admin SDK Service Account 私鑰資訊。 |
| `navigation` | object | 全局導覽列配置。`{ view: "navigator", isScrollingHide: true }`。 |
| `watermark` | object | 浮水印配置。`{ type: "text", src: "text", alpha: 0.1 }`。 |
| `rapidBuild` | object | 快速開發模式。`{ enable: true, componentName: "main" }` 只編譯特定組件。 |
| `randomHashOfFunc` | string | Cloud Functions Gen2 部署後產生的隨機雜湊碼。 |

---

## 3. 組件級配置 (Component Level Props)

定義在 `components` 陣列中的每個物件：

- `name`: 組件名稱（影響產生的 Class 名）。
- `path`: 路由路徑（如 `/profile/:uid`）。
- `title`: 瀏覽器分頁標題。
- `editor`: (boolean) 是否產生對應的 `EditableComponent` 編輯頁面。
- `disposablePage`: (boolean) 若為 true，每次進入路由都會重新實例化 Store。
- `loginOnlyPage`: (boolean) 是否需登入才能訪問。
- `cookies`: (array) 定義此頁面使用的加密 Cookie，`[{ name: "myCookie", type: "object" }]`。

---

## 4. CodegenNode 屬性字典 (基於 index.js)

### A. 基礎屬性 (Basic)
- `name`: 節點名稱。
- `type`: 資料類型 (`string`, `number`, `boolean`, `timestamp`, `object`, `array`, `arrayOfField`, `objectOfEmpty`)。
- `view`: UI 組件 (MUI 組件如 `Typography`, `TextField`, `Button`, `Chip`, `Autocomplete`, `div` 等)。
- `defaultValue`: 初始值。支援 `###` 引導 JS 代碼（如 `###dayjs()`）。
- `description`: 欄位描述 / TextField 的 Label。
- `plural`: (string) 複數形式 (如 `s`)，用於 `array` 類型產生合理的函數名。

### B. UI 與佈局 (UI & Layout)
- `wrapView`: 視圖外包組件 (常用 `Paper`, `Card`, `div`, `SwipeableDrawer`)。
- `props`: 傳給視圖的 MUI 屬性 (如 `{ sx: { m: 1 }, variant: "outlined" }`)。
- `variant`: MUI 變體 (`outlined`, `filled`, `standard`)。
- `size`: `small`, `medium`。
- `color`: `primary`, `secondary`, `success`, `error`, `warning`。
- `icon`: MUI Icon 名稱 (如 `AddRounded`)。
- `anchor`: 位置設定 (`top`, `bottom`, `left`, `right` 或 `start`, `end`)。
- `incest`: `{ attribute: true, view: false }` **層級跳轉**。讓資料結構與 UI 層級脫鉤（無視此層級的資料路徑）。
- `injectStyle`: (boolean) 是否產生樣式注入函數 `getStyleOfXXX()` 以供動態邏輯控制。

### C. 資料與邏輯 (Data & Logic)
- `column`: (boolean) 是否持久化到 Firestore。
- `path`: 遠端資料路徑 (如 `/users/:uid/posts`)。
- `permission`: 權限敘述。`{ read: "alwaysTrue()", write: "isSelf(uid)" }`。
- `paginate`: 分頁設定 `{ threshold: 20, size: 10 }`。
- `conditions`: Firestore 查詢條件陣列。`["{type:'orderBy', params:['time', 'desc']}"]`。
- `cheap`: (boolean) 若為 true，代表此陣列資料量小且不需複雜查詢，會優化資料存取成本。
- `trim`: (boolean) 寫入 Firestore 前是否自動修剪空格。
- `forceServerTime`: (boolean) 強制使用伺服器時間戳。

### D. 進階交互 (Advanced Interactions)
- `select`: 定義單選行為。
  - `type`: `spinner`, `radio`, `button`。
  - `values`: `[{ label: "男", value: 1 }, { label: "女", value: 2 }]`。
- `alertDialog`: 定義點擊後的彈窗。
  - `title`, `content`: 確認型彈窗文字。
  - `customView`: 指定另一個組件作為彈窗內容。
  - `fullWidth`, `strict`: 彈窗外觀與行為控制。
- `Autocomplete`: 
  - `autoFuse`: (boolean) 開啟 Fuse.js 模糊搜尋。
- `alertMenu`: 定義 `IconButton` 的下拉選單 (`items`)。
- `cloudFunctions`: 定義後端函數。`{ name: "myFunc", type: "httpOnCall", description: "..." }`。

---

## 5. 進階設計模式

### A. Incest 模式 (層級跳轉)
當 UI 為了排版需要額外容器，但資料結構不應被改變時使用。
```javascript
{
    name: "container",
    view: "div",
    incest: { attribute: true }, // 資料結構會跳過此層，直接尋找父節點
    children: [ { name: "dataField", type: "string" } ]
}
```

### B. 模組化擴展 (componentsOfExtra)
將高關聯性的功能（如「列表」與「編輯器」）打包。
- 主組件存放在 `components`。
- 關聯組件（如彈窗內容、詳情頁）存放在 `componentsOfExtra`。
- 優點：共用業務邏輯與類型定義。

### C. Ref & Imitate (節點複用)
使用 `ref` 引用已定義的結構，並用 `imitate: true` 完全仿製該節點，避免重複定義。

---

## 6. Agent 實作與開發注意事項 (Best Practices)

1.  **環境判定與外層屬性填充**：
    - 首先確認 `destination` 是 `project` 還是 `module`。
    - 若為 `project`，必須補齊 `directory`, `host`, `email`, `firebase`, `admin` 等基礎部署資訊。
2.  **功能拆解與組織**：
    - 區分主頁面 (`components`) 與關聯功能 (`componentsOfExtra`)。
    - 核心入口邏輯應放在 `components`，輔助性的自定義視圖或彈窗內容則放入 `componentsOfExtra`。
3.  **由上至下編排 (UI First)**：
    - 在 `children` 陣列中，必須嚴格按照 UI 在頁面中「從上到下」的顯示順序放入節點。
4.  **處理資料映射與結構一致性**：
    - 正確選擇 `type`（如 `string`, `array`, `object`）以對應資料結構。
    - 當 UI 層級與資料層級不一致時（例如為了排版多包一層 `div`），務必正確使用 `incest: { attribute: true }` 來跳過無關的佈局層級，維持資料路徑的一致性。
5.  **代碼產出與驗證**：
    - 確保產出的 `source.js` 結構完整、語法正確且層級清晰。
    - 所有的屬性鍵值必須在 `CodegenNode` (src/index.js) 中有對應定義。

> **注意**：所有新增屬性必須在 `CodegenNode` (src/index.js) 中有對應定義，否則 Codegen 將無法正確解析。
