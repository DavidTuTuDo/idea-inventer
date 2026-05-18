/**
 * index.ts
 *
 * 功能說明：
 * 模組化後的統一進入點。
 * 負責 re-export 所有 class 以及處理 CLI 互動式啟動邏輯。
 *
 * 重構前：此檔案包含 10,722 行程式碼 (11 個 class + 常數 + 啟動邏輯)
 * 重構後：每個 class 獨立成一個檔案，此處只負責匯出與 CLI 進入點
 */
import { exceptioner as ERROR, utiller as Util } from "utiller";
import _ from "lodash";
import { configerer } from "configerer";
import {
    ENABLE_FAST_DEVELOP_MODE, TARGET_COMPONENT_FAST_DEVELOP_MODE, setFastDevelopMode,
} from "./constants";

// ─── Re-exports ───────────────────────────────
export { default as CodegenNode } from "./codegen-node";
export { default as ClassGenerator } from "./class-generator";
export { default as PathBase } from "./path-base";
export { default as BaseBuilder } from "./base-builder";
export { default as StoreBuilder } from "./store-builder";
export { default as RemoteFunctionHandler } from "./remote-function-handler";
export { default as ComponentBuilder } from "./component-builder";
export { default as AppBuilder } from "./app-builder";
export { default as ProjectFileHandler } from "./project-file-handler";
export { default as BuildApplication } from "./build-application";
export { default as ScheduleManager } from "./schedule-manager";
export * from "./constants";

// ─── CLI Entry Point ──────────────────────────
import ScheduleManager from "./schedule-manager";

if (configerer.DEBUG_MODE) {
    (async () => {
        /** 紀錄最近一次回答的內容，不然每次都要打字再Enter好懶 */
        const currents = Util.getFileContextInJSON('./projects.json');
        const projects = await Util.interactionByTerminalQ(currents);
        console.log(`需要執行的專案有：`, projects);
        const behavior = Util.getNodeEnvVariable('type');
        const worker = new ScheduleManager(behavior, ...projects.map(p => p.path));
        const msg = await worker.resume();
        Util.appendInfo(msg);
    })();
}
