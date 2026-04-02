# Agent-Yueh Skill Set & Codegen Reference (悅譜框架開發指南)

本文件是 Agent-Yueh 的核心技能庫，定義了如何基於 `idea-inventer` 框架設計 `source.js` 與開發業務邏輯。所有設計必須嚴格參考 `free_marker/src/index.js` 中的 `CodegenNode` 屬性。

---

## 1. 核心設計原則：視圖與資料結構映射

產出的 `source.js` 結構必須遵循以下映射邏輯：

### A. 雙重身分節點 (Dual Identity Nodes)
- **節點代表 UI + 資料**：每個 JSON 節點同時代表一個 UI 組件及其對應的資料結構。
- **由上至下排版**：`children` 陣列內的節點順序，即代表 UI 頁面「從上到下」的排列順序。
- **層級向下擴展**：`children` 代表該物件（Object）或數組項（Array Item）下一層的資料結構。
  - 若 `type: "array"`，其 `children` 定義的是數組中**單一項目 (Item)** 的資料欄位。

### B. UI 圖層與資料結構的脫鉤 (Incest 模式)
- **問題背景**：有時為了 UI 佈局（如新增一個包裹用的 `div` 或佈局容器），會增加額外的 JSON 層級，但這些層級在「資料結構」上並不屬於父子關係。
- **解決方案**：在該節點標示 `incest: { attribute: true }`。
  - **效果**：框架在生成 Store 邏輯時，會無視此層級，自動往上尋找真正的資料結構父類。
  - **範例**：當 `Typography` 被包在一個 `div` 中，但它讀取的資料屬於 `div` 的上一層。

### C. 模組化擴展 (componentsOfExtra)
- **定義**：在 `source.js` 中使用 `componentsOfExtra` 陣列來存放與主組件緊密相關的額外頁面或功能組件。
- **核心價值**：
  - **模組中心化**：以主模組（如 `dionysus` 商品列表）為核心，將詳情頁 (`bacchus`)、購物車 (`cartie`)、編輯器 (`gaia`) 等打包在一起。
  - **高內聚性**：所有相關組件共享業務邏輯與數據模型定義。
  - **組件重用**：額外組件常被用作 `alertDialog` 的 `customView`（如 `maenads` 加入購物車彈窗）。

---

## 2. 部署目標與外層屬性 (Destination & Project Props)

在設計 `source.js` 時，需根據其用途設定 `destination` 屬性：

### A. 當 `destination: "project"` (完整專案)
適用於如 `project-yueh-pu/source.js` 這種定義整個 App 運作環境的檔案。必須在最外層設定以下屬性：
- `directory`: (string) 專案部署的實體路徑（如 `/Users/davidtu/cross-achieve/high/yueh-pu`）。
- `host`: (object) 定義開發與生產環境的域名。
  - `dev`: `http://localhost:8080/`
  - `prod`: `https://project-name.web.app/`
- `email`: (string) Firebase 管理者信箱。
- `genRootPath`: (string) 代碼生成後的存放路徑（如 `../gen/project-name`）。
- `firebase`: (object) Firebase Web App 的配置。

### B. 當 `destination: "module"` (功能模組)
適用於如 `modules/dionysus/source.js` 這種僅定義特定功能塊的檔案。
- **特性**：外層屬性較簡潔，主要專注於 `components` 與 `struct` 的定義。
- **複用性**：這些模組會被其他專案引入使用。

---

## 3. CodegenNode 屬性字典 (基於 index.js)

### 基礎定義 (Basic)
- `name`: (string) 節點名稱，影響生成函數名。
- `type`: (string) 數據類型（`string`, `number`, `boolean`, `timestamp`, `object`, `array`, `arrayOfField`, `objectOfEmpty`）。**資料欄位必填。**
- `view`: (string) MUI 組件（`Typography`, `TextField`, `Button`, `Chip`, `Checkbox`, `Autocomplete`, `img`, `div` 等）。
- `defaultValue`: 初始值。物件或陣列可用 `###` 引導邏輯。
- `description`: 欄位描述，也是 `TextField` 的 Label。

### UI 與 佈局 (UI & Layout)
- `wrapView`: 視圖外包組件。
- `props`: 傳給視圖的 MUI 屬性（`sx`, `variant`, `color`）。
- `size`: `small`, `medium`。
- `variant`: `outlined`, `filled`, `standard`。
- `icon`: MUI Icon 名稱（如 `AddPhotoAlternateOutlined`）。
- `l10n`: (boolean) 標記需多語言轉換。
- `incest`: `{ attribute: true, view: false }` 層級跳轉。

### 資料與邏輯 (Data & Logic)
- `column`: (boolean) 是否對應 Firestore 欄位。
- `path`: (string) 遠端路徑或路由路徑（如 `/users/:uid/profile`）。
- `permission`: 權限函式（`isAdmin()`, `isSelf(uid)`, `alwaysTrue()`）。
- `paginate`: 分頁設定 `{ threshold: 10, size: 20 }`。
- `conditions`: 查詢條件。
- `idxes`: Firestore 索引定義。
- `hasFatherHood`: (boolean) 標示父子 Document 關係。

---

## 4. source.js 標準範例結構

```javascript
const source = {
    name: "project-name",
    destination: "project", // 或 "module"
    directory: "/path/to/project", // 僅在 project 時必填
    host: { dev: "...", prod: "..." }, // 僅在 project 時必填
    email: "admin@example.com", // 僅在 project 時必填
    components: [
        {
            name: "mainComponent",
            path: "/main",
            struct: {
                name: "main",
                type: "object",
                view: "div",
                children: [
                    {
                        name: "layoutContainer",
                        view: "div",
                        incest: { attribute: true }, 
                        children: [
                            {
                                name: "username",
                                type: "string",
                                view: "TextField",
                                column: true,
                                description: "帳號"
                            }
                        ]
                    }
                ]
            }
        }
    ],
    componentsOfExtra: []
};
```

---

## 5. Agent 指令執行步驟
1.  **判定目標 (Destination)**：根據需求判斷產出的是完整專案還是模組。
2.  **外層屬性填充**：若是專案，補齊 `directory`, `host`, `email` 等資訊。
3.  **功能拆解**：主頁面 (`components`) vs 關聯功能 (`componentsOfExtra`)。
4.  **由上至下編排**：在 `children` 中按 UI 顯示順序放入節點。
5.  **處理資料映射**：正確使用 `type` 與 `incest` 以維持資料結構的一致性。
6.  **輸出程式碼**：產出完整、結構清晰的 `source.js`。
