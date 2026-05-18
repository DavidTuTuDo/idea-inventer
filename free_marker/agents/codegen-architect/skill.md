# codegen-architect Skill Set (Code Generator 架構技能指南)

本文件是 `codegen-architect` 的核心技能庫，定義了如何在模組化後的 TypeScript 架構中維護、擴展及除錯 Code Generator。

---

## 1. 架構總覽

原始 `src/index.js`（10,722 行）已拆解為 **13 個獨立模組**：

| 檔案 | Class | 行數 | 職責 |
|---|---|---|---|
| `constants.ts` | — | ~150 | 全域常數、標記符號、RWD 斷點、MUI import 對照表 |
| `codegen-node.ts` | `CodegenNode` | ~3,300 | 核心資料模型，解析 source.js 節點結構 |
| `class-generator.ts` | `ClassGenerator` | ~520 | 產生 JS class 原始碼檔案 |
| `path-base.ts` | `PathBase` | ~330 | 路徑管理基底，初始化專案結構 |
| `base-builder.ts` | `BaseBuilder` | ~250 | 建構器基底，跨平台參數產生 |
| `store-builder.ts` | `StoreBuilder` | ~510 | MobX Store 產生器 |
| `remote-function-handler.ts` | `RemoteFunctionHandler` | ~580 | Firestore CRUD API 產生器 |
| `component-builder.ts` | `ComponentBuilder` | ~1,050 | React Component JSX 產生器 |
| `app-builder.ts` | `AppBuilder` | ~1,000 | App 架構產生器 (i18n, Router, Less) |
| `project-file-handler.ts` | `ProjectFileHandler` | ~2,700 | 專案檔案操作與部署流程 |
| `build-application.ts` | `BuildApplication` | ~190 | 對外 API 門面 |
| `schedule-manager.ts` | `ScheduleManager` | ~160 | CLI 批次排程器 |
| `index.ts` | — | ~50 | 統一匯出 + CLI 進入點 |

### 繼承鏈
```
PathBase
├── BaseBuilder
│   ├── StoreBuilder
│   ├── RemoteFunctionHandler
│   └── ComponentBuilder
│       └── AppBuilder
└── ProjectFileHandler（組合使用 StoreBuilder, ComponentBuilder, AppBuilder）

BuildApplication → ProjectFileHandler
ScheduleManager → BuildApplication
```

---

## 2. 模組職責與修改指引

### 修改常數
- **檔案**: `constants.ts`
- **場景**: 新增支援語言、調整 RWD 斷點、新增 MUI import 對照
- **注意**: 修改後需同步更新有使用該常數的模組

### 新增 CodegenNode 屬性
- **檔案**: `codegen-node.ts`
- **步驟**:
  1. 在 class field 區塊新增屬性（帶 JSDoc 說明）
  2. 在 `enrich()` static method 中處理屬性的初始化邏輯
  3. 如需影響 Store/Component，在對應 builder 中加入處理邏輯
  4. 更新 `json-skema-generator/skill.md` 文件

### 新增 Store 功能
- **檔案**: `store-builder.ts`
- **關聯**: `remote-function-handler.ts`（CRUD API）
- **步驟**:
  1. 在 `buildBaseStore()` 中新增欄位或函式的產生邏輯
  2. 若涉及新的 API 類型，在 `remote-function-handler.ts` 的 `buildFetchSubmitApi()` 中新增 case
  3. 在 `base-builder.ts` 的 `getParamsInFunctionByPlatform()` 中新增對應的參數規則

### 新增 Component 功能
- **檔案**: `component-builder.ts`
- **步驟**:
  1. 在 `buildBaseComponent()` 中新增產生邏輯
  2. 若涉及新的 JSX 結構，擴展 `getJSXStringsByNode()`
  3. 若需新的 MUI 元件，在 `constants.ts` 的 `VIEW_IMPORTS` 中註冊

### 新增 App 系統級功能
- **檔案**: `app-builder.ts`
- **場景**: 新增 i18n 語言、Cookie 機制、Router 路由、Style 檔案
- **注意**: AppBuilder 繼承 ComponentBuilder，可使用 `getJSXStrings()` 等方法

### 新增專案部署行為
- **檔案**: `schedule-manager.ts` → `build-application.ts` → `project-file-handler.ts`
- **步驟**:
  1. 在 `project-file-handler.ts` 實作具體的 build/deploy 方法
  2. 在 `build-application.ts` 封裝為 public API
  3. 在 `schedule-manager.ts` 的 `handler()` switch-case 中新增行為

---

## 3. 跨模組參照規則

### Import 規範
```typescript
// ✅ 正確：使用相對路徑 import 同層級模組
import CodegenNode from "./codegen-node";
import { SIGN_OF_EMPTY_STORE } from "./constants";

// ❌ 錯誤：不要從 index.ts 做循環 import
import { CodegenNode } from "./index";
```

### 依賴方向（禁止反向）
```
constants → 無依賴
codegen-node → constants
class-generator → constants, codegen-node
path-base → constants, codegen-node, class-generator
base-builder → path-base
store-builder → base-builder, class-generator, remote-function-handler
remote-function-handler → base-builder
component-builder → base-builder, class-generator
app-builder → component-builder, class-generator, codegen-node
project-file-handler → path-base, store-builder, component-builder, app-builder, class-generator, codegen-node
build-application → project-file-handler
schedule-manager → build-application
index → 全部 (re-export only)
```

---

## 4. Debug 與參照

### 原始碼備份
- `src/index.js.back` 保留了完整的原始 10,722 行程式碼
- 可用 `diff` 比對確認重構後的行為是否一致

### 行數對照表
| 模組 | 原始行數範圍 |
|---|---|
| constants | L14–L110 |
| CodegenNode | L112–L3419 |
| ClassGenerator | L3421–L3943 |
| PathBase | L3945–L4272 |
| BaseBuilder | L4274–L4518 |
| StoreBuilder | L4520–L5029 |
| RemoteFunctionHandler | L5031–L5608 |
| ComponentBuilder | L5610–L6661 |
| AppBuilder | L6663–L7659 |
| ProjectFileHandler | L7661–L10355 |
| BuildApplication | L10358–L10547 |
| ScheduleManager | L10549–L10708 |

### 快速搜尋
```bash
# 在所有模組中搜尋某個函式
grep -rn "functionName" src/*.ts

# 比對原始碼
diff <(sed -n '112,3419p' src/index.js.back) <(sed -n '/^class CodegenNode/,/^}$/p' src/codegen-node.ts)
```

---

## 5. 技術備忘

### TypeScript 策略
- 使用 `.ts` 副檔名但保留原始 JS 語法（class fields, arrow functions）
- Babel 負責編譯（`@babel/preset-typescript`），TypeScript 僅做型別檢查
- `tsconfig.json` 設定 `strict: false` 以漸進式採用

### 注意事項
- `ENABLE_FAST_DEVELOP_MODE` 是 `let` 變數，在 `constants.ts` 中以 `setFastDevelopMode()` 函式修改
- `CodegenNode.enrich()` 是靜態方法，會直接修改傳入的 node object（mutate）
- `ClassGenerator.persist()` 在快速開發模式下會比對 signature 決定是否跳過寫入
- `ProjectFileHandler` 是最複雜的模組（~2,700 行），未來可進一步拆分為子模組
