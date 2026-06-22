/**
 * schedule-manager.ts
 *
 * 功能說明：
 * ScheduleManager 是 CLI 批次排程器，接收 behavior 字串和專案路徑清單，
 * 依序執行對應的建置流程。支援 30+ 種行為。
 *
 * 主要職責：
 * - resume(): 依序執行所有專案的指定行為
 * - handler(): 根據 behavior 字串分派到對應的 BuildApplication 方法
 * - 支援 webOnly, adminOnly, functionsOnly, deployWebToProduction 等行為
 * - 輸出每個專案的執行耗時統計
 */

import { exceptioner as ERROR, utiller as Util } from "utiller";
import { ENABLE_FAST_DEVELOP_MODE } from "./constants";
import BuildApplication from "./build-application";

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

    /**
     * 根據 behavior 字串執行對應的建置流程，支援 30+ 種行為包含
     * webOnly、adminOnly、functionsOnly、deployWebToProduction 等。
     * 執行完畢後會輸出耗時統計。
     *
     * @param {string} behavior - 要執行的行為名稱
     * @param {string} pathOfProject - 專案路徑
     * @returns {Promise<void>}
     *
     * @example
     * const manager = new ScheduleManager('webOnly', '/path/to/project');
     * await manager.handler('webOnly', '/path/to/project');
     * // => 執行 buildWeb() 並輸出耗時
     */
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
                await builder.deployWebProd(false, false);
                break;
            case 'deployFunctionsWithoutBuild':
                await builder.deployFunctionsWithoutBuild();
                break;
            case 'deployPlatformToProd':
                await builder.deployFunctionsToProd();
                await builder.deployWebProd();
                break;
            case 'adminBuildOnly':
                await builder.deployAdmin(false);
                break;
            case 'adminOnly':
                await builder.deployAdmin();
                break;
            case 'persistentBuildAdmin':
                await builder.persistent('admin');
                await builder.deployAdmin(false);
                break;
            case 'webOnly':
                await builder.buildWeb();
                break;
            case 'persistentBuildWeb':
                await builder.persistent('web');
                await builder.buildWeb();
                break;
            case 'persistentBuildFunctions':
                await builder.persistent('functions');
                await builder.buildCloudFunctions(false);
                break;
            case 'persistentBuildFunctionsThanRefresh':
                await builder.persistent('functions');
                await builder.buildCloudFunctions(false);
                await builder.refreshFunctionsFolder();
                break;
            case 'BuildFunctionsThanRefresh':
                await builder.buildCloudFunctions(false);
                await builder.refreshFunctionsFolder();
                break;
            case 'BuildQuickAdmin':
                await builder.persistent('admin');
                await builder.deployAdmin(false);
                break;
            case 'BuildQuickAdminWithoutPersist':
                await builder.deployAdmin(false);
                break;
            case 'persistentBuild':
                await builder.persistent('web');
                await builder.persistent('admin');
                await builder.buildWeb();
                await builder.deployAdmin();
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
                await builder.deployAdmin();
                await builder.buildCloudFunctions();
                break;
            case 'buildStoreIndexJson':
                await builder.buildIndexRule();
                break;
            case 'developLatestFunction':
                await builder.modifiedI18n();
                break;
            case 'leanUnusedFunctionWeb':
                await builder.leanCodeOfProjectSrc('web');
                break;
            case 'leanUnusedFunctionFunctions':
                await builder.leanCodeOfProjectSrc('functions');
                break;
            default:
                await builder.leanCodeOfProjectSrc('web');
                Util.appendInfo(`874845 project=> ${pathOfProject} || behavior=>'${behavior}' jo4你怪怪的`);
                break
        }
        Util.appendInfo(`${Util.getCurrentTimeFormatYMDHMS()} 專案[${pathOfProject}] 執行[${behavior}] 耗時 ${Util.getSecondFormatOfDuration(Util.getCurrentTimeStamp() - timeOfStart)} 秒`);
    }

}

export default ScheduleManager;
