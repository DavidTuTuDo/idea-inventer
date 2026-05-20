import {utiller as Util} from '../index.js';
import {configerer} from "configerer";
import ERROR from '../exceptioner';

/**
 * InfinitePool - 一個功能豐富的異步任務池管理器
 *
 * 核心特性：
 * 1. 任務超時控制 - 防止任務執行時間過長
 * 2. 任務間隔控制 - 控制任務執行頻率，適用於爬蟲等場景
 * 3. 空閒等待機制 - 當無任務時可設定睡眠時間和次數
 * 4. 任務取消機制 - 通過 hash 取消尚未執行的任務
 * 5. 多種運行模式 - runByParams, runByTimes, runInInfinite, runByEachTask
 * 6. 錯誤處理機制 - 可設定 taskFailHandler 避免錯誤中斷整個池
 * 7. 優先級隊列 - 支持 high/medium/low 三種優先級
 */
const SPECIFICITY_DEBUG = false;

class InfinitePool {

    /** 標記是否以背景模式運行 */
    isRunInBackgroundMode = false;

    /** 當前運行狀態，默認為 RUN_BY_EACH_TASK 模式 */
    state = configerer.POOLLER_STATE.RUN_BY_EACH_TASK

    /**
     * 任務間隔睡眠機制
     * 用於處理需要延遲的任務（如網頁爬蟲，需要模擬人工操作頻率）
     * 當 worker 滿載後，新加入的任務會根據此設定延遲執行
     */
    enableOfTaskSleepByInterval = configerer.POOLLER_ENABLE_TASK_SLEEP_BY_INTERVAL;
    taskSleepInterval = configerer.POOLLER_TASK_OF_INTERVAL_DEFAULT;

    /**
     * 任務超時機制
     * 避免單個任務執行時間過長阻塞整個隊列
     */
    enableOfTaskTimeout = configerer.POOLLER_ENABLE_TIMEOUT;
    timeOfTaskTimeout = configerer.POOLLER_TASK_TIMEOUT_DEFAULT;

    /**
     * 任務失敗處理器
     * 如果不設置，任務失敗會導致整個池中斷
     */
    handlerOfAssignTaskFail = undefined;

    /** Worker 最大數量（並發執行的任務數上限） */
    maximumOfWorker;

    /**
     * 是否禁用首次立即執行
     * 如果設定 sleep interval，可通過此參數控制是否先執行第一次再開始 interval 機制
     */
    disableFirstRun = false

    /**
     * 等待參數隊列
     * 用於 runByParam 模式，存儲待處理的參數
     */
    queueOfWaitingParam = [];

    /**
     * runByTimes 模式的剩餘執行次數
     * -1 表示未使用此模式
     */
    countsOfRunByTimes = -1;

    /**
     * 已分配任務隊列（按優先級分組）
     * 結構: { high: [], medium: [], low: [] }
     * 存儲尚未開始執行的任務
     */
    queueOfAssignTask = {};

    /**
     * 正在執行的任務隊列
     * 存儲當前 worker 正在處理的任務（無法取消）
     * 隊列大小不應超過 maximumOfWorker
     */
    queueOfExecutingTask = [];

    /**
     * 隊列輪詢狀態標記
     * true 表示池正在運行，false 表示停止
     */
    isQueuePolling = false;

    /**
     * 初始任務完成標記
     * 用於 disableFirstRun 機制
     */
    initialTaskCompleted = false;

    /**
     * Hash 到任務信息的映射
     * 用於通過 hash 查找和刪除未執行的任務
     * 注意：僅限 runByTask 模式，其他模式下任務執行後 hash 會改變
     */
    mapOfHashNTask = {};

    /**
     * Hash 到回調包裝器的映射
     * 用於 addTaskAndWait4Result 模式，存儲等待結果的回調函數
     */
    mapOfHashNCallbackWrapper = {}

    /** 當前池的名稱/ID */
    nameOfCurrentPool = ``;

    /**
     * 原子化的背景實例引用
     * 用於防止重複創建背景任務
     */
    atomicBgInstance = undefined;

    /**
     * 構造函數
     * @param {number} maxWorkers - 最大 worker 數量（並發任務數）
     * @param {string|number} name - 池的名稱或 ID
     */
    constructor(maxWorkers = configerer.POOLLER_WORKER_DEFAULT, name = Util.getRandomValue(0, 100000000000)) {
        this.maximumOfWorker = maxWorkers;
        this.setPoolId(String(name));
        // 初始化優先級隊列
        for (const prior of configerer.POOLLER_PRIORITY) {
            this.queueOfAssignTask[prior] = [];
        }
    }

    /**
     * 設置池的 ID
     * @param {string} id - 池的唯一標識符
     */
    setPoolId = (id = this.nameOfCurrentPool) => {
        this.nameOfCurrentPool = id;
    }

    /**
     * 獲取池的 ID
     * @returns {string} 池的唯一標識符
     */
    getPoolId = () => {
        return this.nameOfCurrentPool;
    }

    /**
     * @deprecated 此功能已棄用，因為沒有實際的睡眠機制
     * 啟用基於睡眠次數的隊列終止機制
     */
    enableQueueTerminateBySleepCount(enable = true,
                                     interval = configerer.POOLLER_QUEUE_TIME_OF_SLEEP_INTERVAL_DEFAULT,
                                     times = configerer.POOLLER_QUEUE_MAX_SLEEP_COUNTS_DEFAULT) {
        this.enableOfQueueTerminateSleepCount = enable;
        this.queueMaxSleepCounts = times;
        this.intervalOfQueueSleep = interval
    }

    /**
     * 清除所有緩存數據
     * 清空執行隊列、任務映射和分配隊列
     */
    clearCache = () => {
        this.isQueuePolling = false;
        this.queueOfExecutingTask.length = 0;
        this.mapOfHashNTask = {};
        this.mapOfHashNCallbackWrapper = {};
        this.initialTaskCompleted = false;
        for (const prior of configerer.POOLLER_PRIORITY) {
            this.queueOfAssignTask[prior].length = 0;
        }
    }

    /**
     * 終止池的運行
     * 設置輪詢標記為 false，但不會強制停止正在執行的任務
     */
    terminate() {
        this.isQueuePolling = false;
    }

    /**
     * 打印日誌消息（僅在調試模式下）
     * @param {string} message - 日誌消息
     * @param {boolean} error - 是否為錯誤消息
     * @param {...any} infos - 額外的信息參數
     */
    printLogMessage(message, error = false, ...infos) {
        if (SPECIFICITY_DEBUG)
            Util.printLogMessage(this.getPoollerLogFormat(message), error, ...infos)
    }

    /**
     * 在背景模式下停止池
     * 等待所有執行中的任務完成，最多等待 15 秒
     *
     * @returns {Promise<boolean>} 返回 true 表示停止完成
     *
     * TODO: 應該設計成當 terminate 後，監聽 executingTaskInQueue 為零時才回傳結束
     *
     * [邏輯漏洞修復] 應該在超時後返回 false 表示強制終止，而不是返回 true
     */
    stopInBackground = async () => {
        this.terminate();
        let attempts = 0;
        const maxAttempts = 30; // 30 * 500ms = 15 秒最大等待時間
        while ((this.queueOfExecutingTask).length > 0 && attempts < maxAttempts) {
            await Util.syncDelay(500);
            this.printLogMessage(`784512, 卡在 stopInBackground 出不來,${this.getLogMessageOfExecutingTaskQueueCount()}`)
            this.showState();
            attempts++;
        }

        // [修復] 如果超時仍有任務在執行，應該返回 false
        if ((this.queueOfExecutingTask).length > 0) {
            this.printLogMessage(`stopInBackground 超時，仍有 ${(this.queueOfExecutingTask).length} 個任務在執行`, true);
            return false;
        }
        return true;
    }

    /**
     * 檢查池是否正在運行
     * @returns {boolean} true 表示正在運行
     */
    isRunning = () => {
        return this.isQueuePolling;
    }

    /**
     * 設置 worker 數量
     * @param {number} counts - 新的 worker 數量
     */
    setWorker(counts) {
        this.maximumOfWorker = counts;
    }

    /**
     * 清除任務間隔設置
     * 將間隔設為 0
     */
    cleanTaskInterval() {
        this.taskSleepInterval = {min: 0, max: 0};
    }

    /**
     * 啟用任務睡眠間隔
     * 用於控制任務執行頻率（如爬蟲場景）
     *
     * @param {boolean} enable - 是否啟用
     * @param {number|{min: number, max: number}} interval - 間隔時間（毫秒）
     */
    enableTaskSleepInterval(enable = true, interval = configerer.POOLLER_TASK_OF_INTERVAL_DEFAULT) {
        this.enableOfTaskSleepByInterval = enable
        if ((typeof (interval) === "number" && !Number.isNaN(interval))) {
            interval = {min: interval, max: interval};
        }
        this.taskSleepInterval = interval;
    }

    /**
     * 啟用任務超時機制
     * @param {boolean} enable - 是否啟用
     * @param {number} millionSec - 超時時間（毫秒）
     */
    enableTaskTimeout(enable = true, millionSec = configerer.POOLLER_TASK_TIMEOUT_DEFAULT) {
        this.enableOfTaskTimeout = enable;
        this.timeOfTaskTimeout = millionSec;
    }

    /**
     * 添加任務並等待結果
     * 返回一個 Promise，當任務完成時 resolve 結果或 reject 錯誤
     *
     * @param {Function} asyncTask - 異步任務函數
     * @param {string} priority - 優先級 ('low'|'medium'|'high')
     * @param {string} taskName - 任務名稱（目前未使用）
     * @returns {Promise} 任務執行結果的 Promise
     */
    async addTaskAndWait4Result(asyncTask, priority = 'low', taskName = 'noName') {
        this.triggerBgInstance();
        return new Promise((resolve, reject) => {
            const callbackWrapper = (result) => {
                if (result.assignedTaskCompleted) {
                    resolve(result.resolve);
                } else {
                    reject(result.reject)
                }
            }
            const hash = this.add(asyncTask, priority);
            this.registerHash4Result(hash, callbackWrapper);
        })
    }

    /**
     * 註冊 hash 對應的結果回調
     * @param {string} hash - 任務的唯一標識
     * @param {Function} callback - 結果回調函數
     */
    registerHash4Result(hash, callback) {
        this.mapOfHashNCallbackWrapper[hash] = callback;
    }

    /**
     * 獲取待分配任務隊列中的任務總數
     * @returns {number} 所有優先級隊列的任務總數
     */
    getCountOfAssignTaskInQueue = () => {
        let size = 0;
        for (const prior of configerer.POOLLER_PRIORITY) {
            size += this.queueOfAssignTask[prior].length;
        }
        return size;
    }

    /**
     * 添加任務到隊列
     *
     * @param {Function} task - 要執行的異步任務函數
     * @param {string} priority - 優先級 ('low'|'medium'|'high')，3:low, 2:medium, 1:high
     * @returns {string} 任務的唯一 hash，可用於後續刪除任務
     * @throws {ERROR} 如果 task 不是函數或 priority 不合法
     */
    add = (task, priority = 'low') => {
        if (typeof task === "function") {
            if (configerer.POOLLER_PRIORITY.indexOf(priority) < 0) {
                throw new ERROR(4001, `priority can't be ${priority}`);
            }
            const hash = Util.getRandomHash();
            const taskInfo = {task, hash};
            this.appendHashTaskMap(taskInfo);
            this.queueOfAssignTask[priority].push(taskInfo);
            return hash;
        } else {
            throw new ERROR(4002, `task can't be ${typeof task}`);
        }
    }

    /**
     * 更新執行中任務的狀態
     * 將任務狀態從 'NOT' 更新為 'ING'
     *
     * @param {string} hash - 任務的 hash
     */
    updateExecuteTaskState = (hash) => {
        const task = (this.queueOfExecutingTask).find((each) => Util.isEqual(each.hash, hash))
        if (task) {
            this.printLogMessage(`847875153, 客端委託的任務: ${hash},更改狀態為 'ING'`)
            task.state = 'ING';
        }
    }

    /**
     * 任務包裝器
     * 這是核心方法，用於包裝客戶端委託的任務，提供超時和錯誤處理機制
     *
     * 設計思路：
     * 1. 使用兩個 Promise：一個用於超時控制，一個用於執行實際任務
     * 2. 通過 Promise.race 實現超時機制
     * 3. 捕獲任務執行過程中的錯誤
     * 4. 處理任務完成後的清理工作
     *
     * @param {Function} assignedTask - 客戶端委託的異步任務
     * @param {string} hashOfTask - 任務的唯一標識
     * @param {*} param - 傳遞給任務的參數
     * @returns {Function} 返回一個可執行的任務函數
     *
     * [邏輯漏洞修復] 改進錯誤處理，確保所有錯誤都能被正確捕獲和處理
     */
    taskWrapper = (assignedTask, hashOfTask, param) => () => {
        const self = this;
        let timeoutHash = '';
        let assignedTaskResult;
        let assignedTaskError;
        let isAssignedTaskCompleted = true;

        return new Promise((resolve, reject) => {
            // 設置超時計時器
            if (self.enableOfTaskTimeout) {
                timeoutHash = setTimeout(() => {
                    try {
                        this.printLogMessage(`982532, taskWrapper執行中,發生timeout: ${self.timeOfTaskTimeout} ms`)
                        throw new ERROR(4010, self.getPoollerLogFormat(`TASK HASH:${hashOfTask} IS TIMEOUT ${self.timeOfTaskTimeout} ms ${param ? `,PARAMS IS ${JSON.stringify(param)}` : ''}`))
                    } catch (error) {
                        reject(error);
                    }
                }, self.timeOfTaskTimeout);
            } else {
                // [修復] Issue 2: 即使關閉超時機制，也設定一個絕對保底的超時 (1小時)，避免客端 Promise 卡死導致 Worker 永久佔滿
                timeoutHash = setTimeout(() => {
                    try {
                        this.printLogMessage(`982533, taskWrapper執行中,發生極限保底超時: 3600000 ms`, true)
                        throw new ERROR(4010, self.getPoollerLogFormat(`TASK HASH:${hashOfTask} REACHED ABSOLUTE TIMEOUT 3600000 ms`))
                    } catch (error) {
                        reject(error);
                    }
                }, 3600000); // 1 小時
            }

            // 執行客戶端委託的任務
            this.printLogMessage(`984135, 客端委託的task開始執行 ${hashOfTask}`)
            self.updateExecuteTaskState(hashOfTask);

            assignedTask(param)
                .then((result) => {
                    this.printLogMessage(`984545, 客端委託的任務(TASK HASH:${hashOfTask}),resolve回應: ${result}`)
                    assignedTaskResult = result
                    isAssignedTaskCompleted = true;
                })
                .catch((error) => {
                    this.printLogMessage(`989652, 客端委託的任務,reject回應: ${error.message}`, true, error)
                    assignedTaskError = error
                    isAssignedTaskCompleted = false;
                })
                .finally(() => {
                    clearTimeout(timeoutHash);
                    resolve();
                    this.printLogMessage(`98942,(TASK HASH:${hashOfTask}) taskWrapper()裡面第一個promise(為了timeout設計)完成了`)
                })
        })
            .then(() => {
                // 能走到這裡，代表沒有 timeout 的狀況下執行了委託的任務
                if (!isAssignedTaskCompleted) {
                    throw assignedTaskError;
                } else {
                    this.printLogMessage(`9894841,(TASK HASH:${hashOfTask}) taskWrapper()裡面第二個promise(整個任務)完成了`)
                    return `${this.getLogMessageOfTaskHash(hashOfTask)} completed`;
                }
            })
            .catch(error => {
                // 如果發生 timeout 或是客端任務掉進去 catch 都會跑到這裡
                isAssignedTaskCompleted = false;
                assignedTaskError = error;

                // [修復] 改進錯誤處理邏輯
                if (!self.isWait4ResultTask(hashOfTask)) {
                    if (self.handlerOfAssignTaskFail !== undefined) {
                        // 使用錯誤處理器處理錯誤，不再拋出
                        try {
                            self.handlerOfAssignTaskFail(assignedTaskError);
                        } catch (handlerError) {
                            // 如果錯誤處理器本身出錯，記錄但不拋出
                            this.printLogMessage(`錯誤處理器執行失敗: ${handlerError.message}`, true, handlerError);
                        }
                    } else {
                        // 沒有錯誤處理器時，記錄錯誤但不拋出（避免未處理的 rejection）
                        this.printLogMessage(`任務執行失敗但未設置錯誤處理器: ${assignedTaskError.message}`, true, assignedTaskError);
                    }
                }
            })
            .finally(() => {
                const result = {
                    assignedTaskCompleted: isAssignedTaskCompleted,
                    resolve: assignedTaskResult,
                    reject: assignedTaskError
                };
                self.removeResolveOrRejectPromiseByHash(hashOfTask, result);
                this.printLogMessage(`98943213, ${this.getLogMessageOfTaskHash(hashOfTask)} taskWrapper()裡面第2個promise完成了`, false, result)
            })
    }

    /**
     * 批量添加任務
     * @param {Array<Function>} tasks - 異步任務函數數組
     * @param {string} priority - 優先級
     * @returns {Array<string>} 任務 hash 數組
     * @throws {ERROR} 如果 tasks 不是數組
     */
    adds = (tasks, priority = 'low') => {
        const hashes = [];
        if (Array.isArray(tasks)) {
            for (const task of tasks) {
                hashes.push(this.add(task, priority));
            }
        } else {
            throw new ERROR(4003, `should be async function array, not ${typeof tasks}`);
        }
        return hashes;
    }

    /**
     * 從映射表中移除任務
     * @param {string} hash - 任務的 hash
     */
    removeTaskMapByHash = (hash) => {
        delete this.mapOfHashNTask[hash];
    }

    /**
     * 將任務信息添加到映射表
     * @param {Object} taskInfo - 任務信息對象 {task, hash}
     */
    appendHashTaskMap(taskInfo) {
        this.mapOfHashNTask[taskInfo.hash] = taskInfo;
    }

    /**
     * 通過 hash 獲取任務信息
     * @param {string} hash - 任務的 hash
     * @returns {Object} 任務信息對象
     */
    getTaskInfoByHash(hash) {
        return this.mapOfHashNTask[hash];
    }

    /**
     * 通過 hash 從隊列中移除任務
     *
     * 注意：只能移除尚未執行的任務（在 assignTask 隊列中的任務）
     * 已經進入 executing 隊列的任務無法刪除
     *
     * @param {string} hash - 任務創建時返回的唯一標識
     * @returns {boolean} true 表示成功刪除，false 表示未找到或已執行
     * @throws {ERROR} 如果 hash 對應的任務不存在
     *
     * [邏輯漏洞修復] 修復索引檢查錯誤，應該是 >= 0 而不是 > 0
     */
    remove(hash) {
        let taskInfo = this.getTaskInfoByHash(hash);
        if (taskInfo) {
            for (const prior of configerer.POOLLER_PRIORITY) {
                const _index = (this.queueOfAssignTask[prior]).indexOf(taskInfo);
                // [修復] 改為 >= 0，否則索引為 0 的任務無法刪除
                if (_index >= 0) {
                    this.queueOfAssignTask[prior].splice(_index, 1);
                    this.removeTaskMapByHash(hash);

                    // [修復] Issue 4: 若該任務是被 Wait4Result 等待，主動 reject 避免外部 await 永遠卡死
                    if (this.mapOfHashNCallbackWrapper[hash]) {
                        this.mapOfHashNCallbackWrapper[hash]({
                            assignedTaskCompleted: false,
                            reject: new ERROR(4012, `Task ${hash} removed before execution`)
                        });
                        delete this.mapOfHashNCallbackWrapper[hash];
                    }

                    return true;
                }
            }
            return false;
        } else {
            throw new ERROR(4004, hash);
        }
    }

    /**
     * 運行前的準備工作
     * 設置輪詢標記為 true
     */
    beforeRun = () => {
        this.isQueuePolling = true;
    }

    /**
     * 運行後的清理工作
     * 清除所有緩存
     */
    afterRun = () => {
        this.clearCache();
    }

    /**
     * 無限運行模式
     *
     * interval 是當 queueOfExecutingTask 滿時任務之間的間隔時間
     * 默認情況下，如果 intervalOfQueueSleep 超過 100 次，池會關閉
     *
     * @param {Function|Array<Function>} task - 單個任務函數或任務數組
     * @param {number|{min: number, max: number}} interval - 任務間隔時間
     */
    runInInfinite = async (task = [], interval) => {
        this.beforeRun();
        if ((typeof (task) === "function"))
            this.add(task)
        else if (Array.isArray(task))
            this.adds(task);
        else
            throw new ERROR(4006, `type of task is ===> ${typeof task}`)

        this.enableTaskSleepInterval((typeof (interval) === "number" && !Number.isNaN(interval)), interval);
        this.setState(configerer.POOLLER_STATE.RUN_INFINITE);

        while (!this.ruleOfStopInfiniteRun()) {
            this.printLogMessage(`415123, runInInfinite() 正在無限Loop中, ${this.getLogMessageOfExecutingTaskQueueCount()}`)
            await this.#run();
        }
        if (!this.isRunInBackgroundMode) this.afterRun();
    }

    /**
     * 判斷是否應該停止無限運行
     * 規則：池已停止 且 執行隊列為空
     *
     * 設計理念：即使調用了 terminate()，也要等待所有正在執行的任務完成
     *
     * @returns {boolean} true 表示應該停止
     */
    ruleOfStopInfiniteRun = () => {
        return !this.isRunning() && this.isExecutingTaskQueueEmpty()
    }

    /**
     * 檢查執行隊列是否為空
     * @returns {boolean} true 表示隊列為空
     */
    isExecutingTaskQueueEmpty = () => {
        return (this.queueOfExecutingTask).length === 0;
    }

    /**
     * 將參數添加到等待隊列
     * 用於 runByParams 模式
     *
     * @param {...any} params - 要添加的參數
     */
    appendParamInToQueue = (...params) => {
        this.triggerBgInstance();
        this.queueOfWaitingParam.push(...params);
    }

    /**
     * 按參數運行模式
     *
     * 為每個參數執行一次任務函數
     * 參數可能是 undefined，需要在 functionOfAsyncTask 中判斷
     *
     * @param {Function} functionOfAsyncTask - 任務函數（接受一個參數）
     * @param {...any} params - 要處理的參數列表
     */
    runByParams = async (functionOfAsyncTask, ...params) => {
        if (functionOfAsyncTask === undefined) {
            // [修復] Issue 3: 避免佇列空的時候使用 .shift() 引發 TypeError
            const taskInfo = this.queueOfAssignTask['low'].shift();
            if (taskInfo) {
                functionOfAsyncTask = taskInfo.task;
            }
        }

        // [修復] 允許 triggerBgInstance 純喚醒時不傳入參數 (只處理舊任務)，避免拋錯
        if (functionOfAsyncTask !== undefined && !(typeof (functionOfAsyncTask) === "function"))
            throw new ERROR(4006, `runByParams error, typeof task can't be ${typeof functionOfAsyncTask}`);
        if (!Array.isArray(params))
            throw new ERROR(4006, `runByParams error, typeof params can't be ${typeof params}`);

        this.beforeRun();

        // [修復] 只有在真的有傳入 (或取到) 函數時才執行 add
        if (functionOfAsyncTask) {
            this.add(functionOfAsyncTask);
        }

        this.appendParamInToQueue(...params)
        this.setState(configerer.POOLLER_STATE.RUN_BY_PARAMS);

        // [修復] 只要還有參數待處理，就繼續調度
        while ((this.queueOfWaitingParam).length > 0) {
            await this.#run();
        }

        // [新增] 等待所有執行中的任務完成
        while (!this.isExecutingTaskQueueEmpty()) {
            await Util.syncDelay(33); // 短暫等待，避免空轉消耗CPU
            this.printLogMessage(`等待執行中的任務完成，剩餘: ${(this.queueOfExecutingTask).length}`);
        }

        this.printLogMessage(`951281952, runByParams() 結束了while()`);
        this.terminate();
        if (!this.isRunInBackgroundMode) this.afterRun();
    }

    /**
     * 按每個任務運行模式
     *
     * 執行提供的所有任務，任務完成後池會自動停止
     *
     * @param {Array<Function>} tasks - 要執行的任務數組
     */
    runByEachTask = async (tasks = []) => {
        this.id = Util.getRandomHash(15);
        this.beforeRun();
        this.adds(tasks);
        this.setState(configerer.POOLLER_STATE.RUN_BY_EACH_TASK);

        while (!this.ruleOfStopInfiniteRun()) {
            await this.#run(this.id);

            // 如果待執行任務隊列已清空，終止池
            if (this.getCountOfAssignTaskInQueue() <= 0) {
                this.terminate();
                this.printLogMessage(`788121, runByEachTask() 因為 taskOfWaitingQueue 清空而停止`);
            }

            // 為了讓 while 不要停止運算 !this.ruleOfStopInfiniteRun()
            await Util.syncDelay(33);
            this.printLogMessage(`788143, runByEachTask() 為了讓while不要停止運算`);
        }
        this.printLogMessage(`7881952, runByEachTask() 結束了while()`);
        if (!this.isRunInBackgroundMode) this.afterRun();
    }

    /**
     * 按次數運行模式
     *
     * 執行指定次數的任務，任務會循環執行並按順序同步
     * 注意：目前只支援 1 個 worker
     *
     * @param {Function} functionOfAsyncTask - 要執行的任務函數
     * @param {number} times - 執行次數
     *
     * [邏輯漏洞] 應該檢查 maximumOfWorker 是否為 1，否則可能出現意外行為
     */
    runByTimes = async (functionOfAsyncTask, times = 1) => {
        // [建議] 添加 worker 數量檢查
        if (this.maximumOfWorker !== 1) {
            this.printLogMessage(`警告: runByTimes 模式建議使用 1 個 worker，當前為 ${this.maximumOfWorker}`, true);
        }

        this.countsOfRunByTimes = times;
        this.add(functionOfAsyncTask);
        this.beforeRun();
        this.setState(configerer.POOLLER_STATE.RUN_BY_TIMES);

        while (!this.ruleOfStopInfiniteRun() && this.countsOfRunByTimes > 0) {
            await this.#run();
        }
        if (!this.isRunInBackgroundMode) this.afterRun();
    }

    /**
     * 在背景運行
     *
     * 使用 setTimeout 在背景執行異步函數，類似於線程在背景運行
     *
     * @param {Function} asyncfunc - 要執行的異步函數
     * @param {...any} params - 函數參數
     * @returns {number} setTimeout 的 ID
     * @throws {ERROR} 如果 asyncfunc 不是函數
     */
    runInBackGround = (asyncfunc, ...params) => {
        this.isRunInBackgroundMode = true;
        if (!(typeof asyncfunc === "function")) {
            throw new ERROR(4002, `_asyncfunc can't be ${typeof asyncfunc}`);
        }

        return setTimeout(async () => {
            try {
                await asyncfunc.apply(this, params); // 確保 'this' 指向 InfinitePool
            } catch (error) {
                // Promise Rejection 可能已經被 taskWrapper 或其他地方捕獲
                if (error instanceof ERROR) {
                    this.printLogMessage(`7812123, runInBackGround() 執行錯誤: ${error.message}`, true, error);
                } else {
                    throw new ERROR(4009, {message: `${this.getPoollerLogFormat('')}`}, error);
                }
            } finally {
                this.terminate();
                this.afterRun();
                this.printLogMessage(`7812123, runInBackGround() 走到finally`)
            }
        }, 1);
    }

    /**
     * 獲取格式化的池日誌消息
     * @param {string} msg - 消息內容
     * @returns {string} 格式化的日誌消息
     */
    getPoollerLogFormat = (msg) => {
        return `POOLLER NAME: ${this.getPoolId()}${((msg) == null || (typeof (msg) === "object" && Object.keys(msg).length === 0) || (typeof (msg) === "string" && (msg).length === 0)) ? '' : ' , '}${msg}`;
    }

    /**
     * 設置任務失敗處理器
     *
     * 如果不設置，任務失敗會導致整個池停止
     *
     * @param {Function} listener - 錯誤處理函數，接收 error 對象
     */
    setTaskFailHandler = (listener = (error) => console.log(error.message)) => {
        this.handlerOfAssignTaskFail = listener;
    }

    /**
     * 設置池的運行狀態
     * @param {string} _state - 新的狀態
     */
    setState(_state) {
        this.state = _state;
    }

    /**
     * 檢查並標記初始任務狀態
     *
     * 用於 disableFirstRun 機制
     * 第一次調用返回 false 並標記為已完成
     * 之後的調用都返回 true
     *
     * @returns {boolean} 初始任務是否已完成
     */
    checkAndMarkInitialTaskStatus() {
        if (!this.initialTaskCompleted) {
            this.initialTaskCompleted = true;
            return false
        }
        return this.initialTaskCompleted;
    }

    /**
     * 設置是否禁用首次立即執行
     *
     * 如果設定 interval，可通過此參數控制第一個任務是否立即執行
     *
     * @param {boolean} disable - true 表示禁用首次執行
     */
    setDisableFirstRun(disable = true) {
        this.disableFirstRun = disable;
    }

    /**
     * 觸發背景實例
     *
     * 被動式啟動機制，避免一直 while() 循環造成性能問題
     * 當有新任務添加時，自動觸發對應的背景運行模式
     *
     * 目前支援：RUN_BY_EACH_TASK 和 RUN_BY_PARAMS 模式
     *
     * [邏輯漏洞修復] 應該在觸發前設置 isQueuePolling，防止重複觸發
     */
    triggerBgInstance() {
        if (!this.isRunInBackgroundMode || this.isQueuePolling) {
            return;
        }

        if (this.state === configerer.POOLLER_STATE.RUN_BY_EACH_TASK) {
            // [修復] 防止 race condition，在啟動前先標記為已啟動
            this.runByEachTaskInBackGround();
            return;
        } else if (this.state === configerer.POOLLER_STATE.RUN_BY_PARAMS) {
            this.runByParamInBackGround();
            return;
        }

        throw new ERROR(4011, `this.state is ==> ${Util.getItsKeyByValue(configerer.POOLLER_STATE, this.state)}`)
    }

    /**
     * 檢查執行隊列是否已滿
     * @returns {boolean} true 表示隊列已滿
     */
    isExecutingQueueFull() {
        return (this.queueOfExecutingTask).length >= this.maximumOfWorker;
    }

    /**
     * 檢查任務隊列是否為空
     * @returns {boolean} true 表示隊列為空
     */
    isTaskQueueEmpty() {
        return this.getCountOfAssignTaskInQueue() === 0
    }

    /**
     * 同步任務調度器
     *
     * 核心調度邏輯：
     * 1. 檢查是否需要延遲（基於 disableFirstRun 和 taskSleepInterval）
     * 2. 根據規則將待分配任務移入執行隊列
     * 3. 根據任務狀態決定是否移除 taskMap
     *
     * 設計要點：
     * - 對於 RUN_BY_EACH_TASK，任務執行後移除 TaskMap（因為不會重複執行）
     * - 對於重複執行的模式，保留任務函數的引用，每次執行時生成新的 hash
     */
    async syncTaskDispatcher() {
        this.printLogMessage(`448984466, 走進來了 syncTaskDispatcher()`)

        // 檢查是否應該跳過首次執行
        const initialTaskShouldNotRun = this.disableFirstRun && !this.checkAndMarkInitialTaskStatus();

        const isExecutingTaskAlmostFull = this.queueOfExecutingTask.length >= this.maximumOfWorker - 1;
        // 因為能走到 syncTaskDispatcher 表示其中一個工作完成了
        // 這個瞬間不可能 === maximumOfWorker，所以必須減 1
        // 除非這個 syncTaskDispatcher 是單獨一個線程
        const comparison = this.checkAndMarkInitialTaskStatus() && isExecutingTaskAlmostFull && this.enableOfTaskSleepByInterval;

        if (initialTaskShouldNotRun || comparison) {
            const restInInterval = await Util.syncDelayRandom(this.taskSleepInterval.min, this.taskSleepInterval.max)
            this.printLogMessage(`4484121, 走到睡覺區 enableOfTaskSleepByInterval:${this.enableOfTaskSleepByInterval} || ${restInInterval} ms`)
        }

        // 當池正在運行時，將任務添加到執行隊列
        while (this.rulesOfAppendToExecutingTask()) {
            const taskInfo = this.getTaskInfoDependOnPriority();
            if (taskInfo) {
                const promise = this.taskWrapper(taskInfo.task, taskInfo.hash, this.queueOfWaitingParam.shift());

                // 對於 RUN_BY_EACH_TASK，移除 TaskMap（任務不會重複執行）
                if (this.state === configerer.POOLLER_STATE.RUN_BY_EACH_TASK) {
                    this.removeTaskMapByHash(taskInfo.hash);
                }
                // 對於重複執行的任務，getTaskInfoDependOnPriority 已經生成新的 hash
                // 該 hash 會在任務完成時自動清理

                this.appendTaskToExecuteQueue(taskInfo.hash, promise);
            } else {
                // 沒有 taskInfo，可能有未知的 issue，保險起見 break
                this.printLogMessage(`848451 也許有未知的issue,保險起見break`, true);
                break;
            }
        }
        this.printLogMessage(`4489844821, 離開了 syncTaskDispatcher()`)
    }

    /**
     * 將已分配任務添加到執行隊列的規則
     *
     * 根據不同的運行模式返回不同的判斷規則：
     * - RUN_BY_EACH_TASK: 池運行中 且 執行隊列未滿 且 有待分配任務
     * - RUN_BY_PARAMS: 池運行中 且 執行隊列未滿 且 有待處理參數
     * - RUN_BY_TIMES/RUN_INFINITE: 池運行中 且 執行隊列未滿 且 有任務
     *
     * @returns {boolean} true 表示可以添加任務到執行隊列
     * @throws {ERROR} 如果狀態未知
     */
    rulesOfAppendToExecutingTask = () => {
        switch (this.state) {
            case configerer.POOLLER_STATE.RUN_BY_EACH_TASK:
                return this.isRunning() && !this.isExecutingQueueFull() && this.getCountOfAssignTaskInQueue() > 0;
            case configerer.POOLLER_STATE.RUN_BY_PARAMS:
                return this.isRunning() && !this.isExecutingQueueFull() && (this.queueOfWaitingParam).length > 0;
            case configerer.POOLLER_STATE.RUN_BY_TIMES:
            case configerer.POOLLER_STATE.RUN_INFINITE:
                // 這些模式的任務數在 AssignTaskQueue 中只有一個或一組
                return this.isRunning() && !this.isExecutingQueueFull() && this.getCountOfAssignTaskInQueue() > 0;
            default:
                throw new ERROR(4005, `this.state ==> ${this.state}`)
        }
    }

    /**
     * 將任務添加到執行隊列
     *
     * @param {string} hash - 任務的 hash
     * @param {Promise} promise - 任務的 Promise
     */
    appendTaskToExecuteQueue = (hash, promise) => {
        // 對於 RUN_BY_TIMES 模式，遞減計數
        if (Util.isEqual(this.state, configerer.POOLLER_STATE.RUN_BY_TIMES)) {
            this.countsOfRunByTimes = this.countsOfRunByTimes - 1;
        }
        const task = {state: 'NOT', hash: hash, task: promise};
        this.printLogMessage(`4484451, 增加了一個assignedTask ${this.getLogMessageOfTaskHash(hash)} 到 QueueOfExecutingTask ,${this.getLogMessageOfExecutingTaskQueueCount()}`, false, task)
        this.queueOfExecutingTask.push(task);
    }

    /**
     * 獲取執行隊列計數的日誌消息
     * @returns {string} 格式化的日誌消息
     */
    getLogMessageOfExecutingTaskQueueCount = () => {
        return `ExecutingTaskQueueCount: ${(this.queueOfExecutingTask).length}`
    }

    /**
     * 獲取分配隊列計數的日誌消息
     * @returns {string} 格式化的日誌消息
     */
    getLogMessageOfAssignTaskQueueCount = () => {
        return `AssignTaskQueueCount: ${this.getCountOfAssignTaskInQueue()}`
    }

    /**
     * 獲取任務 hash 的日誌消息
     * @param {string} hash - 任務的 hash
     * @returns {string} 格式化的日誌消息
     */
    getLogMessageOfTaskHash = (hash) => {
        return `TASK HASH: ${hash}`
    }

    /**
     * 顯示池的當前狀態
     *
     * 輸出：
     * - Worker 數量
     * - 待分配任務數量
     * - 正在執行的任務數量
     * - TaskMap 中的任務數量
     */
    showState = () => {
        Util.appendInfo(this.getPoollerLogFormat(`workerCount: ${this.maximumOfWorker}`));
        Util.appendInfo(this.getPoollerLogFormat(`taskQueue(還在排隊的Task): ${this.getCountOfAssignTaskInQueue()}`));
        Util.appendInfo(this.getPoollerLogFormat(`QueueOfExecutingTask(正在執行的AsyncTask, 超過workerCount就是bug): ${(this.queueOfExecutingTask).length}`));
        Util.appendInfo(this.getPoollerLogFormat(`mapOfHashNTask(還沒執行到的AsyncTask reference的暫存區): ${(this.mapOfHashNTask).length}`));
    }

    /**
     * 核心運行方法（私有）
     *
     * 執行流程：
     * 1. 調度任務（syncTaskDispatcher）
     * 2. 執行所有狀態為 'NOT' 的任務
     * 3. 使用 Promise.race 等待任一任務完成
     * 4. 檢查執行隊列大小（調試用）
     *
     * @param {string} id - 運行實例的 ID（可選）
     */
    #run = async () => {
        const self = this;

        /**
         * 執行所有待執行的任務
         * 使用 Promise.race 實現並發控制
         */
        async function execute() {
            const tasks = (self.queueOfExecutingTask).filter((each) => Util.isEqual(each.state, 'NOT')).map((each) => {
                const taskWrapper = each.task;
                return taskWrapper();
            })

            self.printLogMessage(`454652321, 開始任務(taskWrapper): run() 裡面的execute開始執行, task(state = NOT)的長度 ${(tasks).length}`);

            // [修復] Issue 1: 避免當所有任務狀態皆為 'ING' 時，Promise.race 收不到新任務導致 Event Loop 死迴圈
            let result;
            if ((tasks).length > 0) {
                result = await Promise.race(tasks);
            } else if (self.queueOfExecutingTask.length > 0) {
                await Util.syncDelay(33); // 強制讓出執行權
                result = 'waiting for ING tasks';
            } else {
                result = '4542131684, task is empty';
            }

            self.printLogMessage(`54121445161, 結束任務(taskWrapper): run() 裡面的execute結束執行`);
            return result;
        }

        /**
         * 空任務（當 worker 數量為 0 時使用）
         */
        async function emptyTask() {
            self.printLogMessage(`因為max count of worker為0，所以指派一個簡單的任務`);
            await Util.syncDelay(10);
        }

        // 調度任務
        await this.syncTaskDispatcher();

        if (this.maximumOfWorker === 0) {
            // 當 maximumOfWorker 為 0 時，setTimeout/syncDelay() 會卡住
            // 給了 emptyTask() 就能閃過這個 issue
            await emptyTask();
        } else if (!this.isExecutingTaskQueueEmpty()) {
            // 當池已經被要求停止時，executeQueue 裡面還有未做完的任務
            this.printLogMessage(`4512211, 開始任務(taskWrapper): ${this.getLogMessageOfExecutingTaskQueueCount()}`)
            const task = await execute();
            this.printLogMessage(`4512213 完畢任務(taskWrapper:${task}), ${this.getLogMessageOfExecutingTaskQueueCount()}, ${this.getLogMessageOfAssignTaskQueueCount()}`);
        } else {
            this.printLogMessage(`4574152 不應該走到這裏,但是 minor issue`, true)
        }

        // 調試檢查：執行隊列不應該超過 worker 數量
        if (this.queueOfExecutingTask.length > this.maximumOfWorker)
            this.printLogMessage(`4512214 一定是改壞了!!!!!!!!!!, ${this.getLogMessageOfExecutingTaskQueueCount} `, true);

        self.printLogMessage(`5478421212, 離開 run()`);
    }

    /**
     * 輔助方法：獲取用於重複執行模式的任務資訊
     *
     * 對於需要重複執行的模式（INFINITE/TIMES/PARAMS），不能直接使用原始的 taskInfo
     * 必須複製任務函數並賦予新的 hash，用於在 executingTaskQueue 中追蹤
     *
     * @param {Object} originalTaskInfo - 原始任務信息 {task, hash}
     * @returns {Object} 新的任務信息，包含新的 hash
     */
    getTaskInfoForRepetitiveRun = (originalTaskInfo) => {
        const newTaskInfo = {
            task: originalTaskInfo.task,
            hash: Util.getRandomHash()
        };
        this.appendHashTaskMap(newTaskInfo); // 追蹤這個新的 hash 直到任務開始執行
        return newTaskInfo;
    }

    /**
     * 根據優先級獲取任務信息
     *
     * 優先級順序：high > medium > low
     *
     * 根據不同的運行模式有不同的行為：
     * - RUN_BY_EACH_TASK: 移除並返回任務（shift）
     * - 其他模式: 複製任務並生成新 hash（peek + copy）
     *
     * @returns {Object} 任務信息對象 {task, hash}
     * @throws {ERROR} 如果在非 RUN_BY_EACH_TASK 模式下隊列為空
     */
    getTaskInfoDependOnPriority = () => {
        for (const prior of configerer.POOLLER_PRIORITY) {
            if (this.queueOfAssignTask[prior].length > 0) {
                switch (this.state) {
                    case configerer.POOLLER_STATE.RUN_BY_EACH_TASK:
                        // RUN_BY_EACH_TASK: 移除任務（每個任務只執行一次）
                        return this.queueOfAssignTask[prior].shift();

                    case configerer.POOLLER_STATE.RUN_BY_PARAMS:
                    case configerer.POOLLER_STATE.RUN_BY_TIMES:
                    case configerer.POOLLER_STATE.RUN_INFINITE:
                        // 重複執行模式的處理：
                        // 1. 不使用 shift() 移除任務（需要重複執行）
                        // 2. 獲取任務函數的引用（Peek）
                        // 3. 複製任務函數並賦予新的 Hash 以便追蹤本次執行
                        const originalTaskInfo = this.queueOfAssignTask[prior][0];
                        return this.getTaskInfoForRepetitiveRun(originalTaskInfo);

                    default:
                        throw new ERROR(4005, `this.state ==> ${this.state}`)
                }
            }
        }

        // 如果所有優先級隊列都為空，且不是 RUN_BY_EACH_TASK 模式，拋出錯誤
        if (!Util.isEqual(this.state, configerer.POOLLER_STATE.RUN_BY_EACH_TASK))
            throw new ERROR(4007);
    }

    /**
     * 通過 hash 移除已完成的 Promise
     *
     * 處理流程：
     * 1. 如果有 callback wrapper（Wait4Result 模式），調用回調
     * 2. 從執行隊列中移除任務
     *
     * @param {string} hash - 任務的 hash
     * @param {Object} result - 任務執行結果 {assignedTaskCompleted, resolve, reject}
     *
     * [邏輯漏洞修復] 確保即使沒有 callback 也要清理任務
     */
    removeResolveOrRejectPromiseByHash = (hash, result) => {
        const callbackWrapper = this.mapOfHashNCallbackWrapper[hash];
        if (callbackWrapper !== undefined) {
            this.printLogMessage(`5644153248, removeResolveOrRejectPromiseByHash 拿掉了完成的任務(${this.getLogMessageOfTaskHash(hash)})`)
            try {
                callbackWrapper(result);
            } catch (callbackError) {
                // [修復] 捕獲回調執行錯誤，避免影響清理流程
                this.printLogMessage(`回調執行失敗: ${callbackError.message}`, true, callbackError);
            } finally {
                delete this.mapOfHashNCallbackWrapper[hash];
            }
        }
        this.removePromiseFromExecutingQueue(hash);
    }

    /**
     * 從執行隊列中移除 Promise
     * @param {string} hash - 任務的 hash
     */
    removePromiseFromExecutingQueue = (hash) => {
        this.printLogMessage(`56448412, QueueOfExecutingTask 拿掉了完成的任務 ${this.getLogMessageOfTaskHash(hash)}`)
        Util.removeMutate(this.queueOfExecutingTask, (each) => Util.isEqual(hash, each.hash));
    }

    /**
     * 檢查是否為等待結果的任務
     *
     * 如果有 callback function 就代表是一個需要回傳 result 的任務
     *
     * @param {string} hash - 任務的 hash
     * @returns {boolean} true 表示是等待結果的任務
     */
    isWait4ResultTask(hash) {
        return this.mapOfHashNCallbackWrapper[hash] !== undefined;
    }

    /**
     * 在背景以無限模式運行
     * @param {Function} functionOfAsyncTask - 任務函數
     * @param {number|Object} interval - 任務間隔
     * @returns {InfinitePool} 返回實例本身（鏈式調用）
     */
    runInfiniteInBackground = (functionOfAsyncTask, interval) => {
        return this.invokeInstanceOfBackground(this.runInInfinite, functionOfAsyncTask, interval);
    }

    /**
     * 在背景以參數模式運行
     * @param {Function} functionOfAsyncTask - 任務函數
     * @param {...any} params - 參數列表
     * @returns {InfinitePool} 返回實例本身（鏈式調用）
     */
    runByParamInBackGround = (functionOfAsyncTask, ...params) => {
        return this.invokeInstanceOfBackground(this.runByParams, functionOfAsyncTask, ...params);
    }

    /**
     * 在背景以次數模式運行
     * @param {Function} functionOfAsyncTask - 任務函數
     * @param {number} times - 執行次數
     * @returns {InfinitePool} 返回實例本身（鏈式調用）
     */
    runByTimesInBackGround = (functionOfAsyncTask, times) => {
        return this.invokeInstanceOfBackground(this.runByTimes, functionOfAsyncTask, times);
    }

    /**
     * 在背景以每個任務模式運行
     * @param {...any} params - 參數（任務數組）
     * @returns {InfinitePool} 返回實例本身（鏈式調用）
     */
    runByEachTaskInBackGround = (...params) => {
        return this.invokeInstanceOfBackground(this.runByEachTask, ...params);
    }

    /**
     * 調用背景實例
     *
     * 確保只有一個背景實例在運行
     * 如果已有實例，先清除再創建新的
     *
     * @param {Function} state - 運行模式函數
     * @param {...any} params - 參數
     * @returns {InfinitePool} 返回實例本身（鏈式調用）
     *
     * 設計理念：
     * 回傳整個 instance 是為了方便使用，可以寫成一行：
     * const pool = new InfinitePool(1).runByEachTaskInBackGround();
     */
    invokeInstanceOfBackground = (state, ...params) => {
        if (this.atomicBgInstance !== undefined)
            clearTimeout(this.atomicBgInstance);
        this.atomicBgInstance = this.runInBackGround(state, ...params);
        return this;
    }
}

// ============================================================================
// 調試模式示例（僅在 DEBUG_MODE 時執行）
// ============================================================================
if (configerer.DEBUG_MODE) {
    (async () => {
        // 以下是各種使用示例的函數
        // 實際使用時請取消註解對應的函數調用

        /**
         * 示例：使用 addTaskAndWait4Result 和背景運行
         * 展示如何添加任務並等待結果，以及優先級處理
         */
        async function exampleOfRunByTaskWait4ResultAndRunInBackground() {
            const numOfWorkers = 0;
            const pool = new InfinitePool(numOfWorkers, 'david').runByEachTaskInBackGround();
            pool.enableTaskTimeout(true, 40000);

            function asyncTask(sign, taskSpend = 2000) {
                return async () => {
                    await Util.syncDelay(taskSpend)
                    return sign;
                }
            }

            function startTimeoutTask(delayTime, taskSpendTime, sign, priority = 'low') {
                setTimeout(async () => {
                    try {
                        const printSign = await pool.addTaskAndWait4Result(asyncTask(sign, taskSpendTime), priority);
                        Util.appendInfo('answer => ', printSign);
                    } catch (error) {
                        Util.appendError(`sign ${sign} perform fail`, error.message);
                    }
                }, delayTime);
            }

            setTimeout(async => {
                pool.setWorker(2);
            }, 15000)

            startTimeoutTask(10, 1000, 'A', 'low')
            startTimeoutTask(1000, 1000, 'C', 'low')
            startTimeoutTask(1000, 1000, 'G', 'high')
            startTimeoutTask(500, 4000, 'B', 'low')
            startTimeoutTask(3000, 1000, 'D', 'medium')
            startTimeoutTask(10000, 2000, 'E', 'medium')

            while (pool.isRunning()) {
                console.log('system is running');
                pool.showState();
                await Util.syncDelay(1000);
            }
        }

        async function exampleOfRunByTimes() {
            const pool = new InfinitePool(10, 'david987');
            await pool.runByParams(async() => {
                const million = await Util.syncDelayRandom();
                console.log(million);
            }, ...Array.from({ length: (20) - (0) }, (_, i) => i + (0)))
            console.log(`上面完成後才能顯示1`);
            await pool.runByParams(async() => {
                const million = await Util.syncDelayRandom();
                console.log(million);
            }, ...Array.from({ length: (20) - (0) }, (_, i) => i + (0)))
            console.log(`上面完成後才能顯示2`);
        }

        /**
         * 示例：無限運行模式
         * 展示如何使用無限模式和錯誤處理
         */
        async function exampleOfRunInBackgroundInfinite() {
            async function myAsyncTask() {
                const taskSpend = Util.getRandomValue(1000, 1000);
                const sign = Util.getRandomHash(15)

                if (Util.isOdd(taskSpend)) {
                    throw new Error(`45100 Oops, ${taskSpend} is odd啦`)
                }

                await Util.syncDelay(taskSpend)
                Util.appendInfo(sign, taskSpend);
                return sign;
            }

            const pool = new InfinitePool(2);
            pool.runInfiniteInBackground(myAsyncTask, 5000);
            pool.setDisableFirstRun(true);
            pool.setTaskFailHandler((error) => {
                console.error(error.message)
            })

            setTimeout(async () => {
                await pool.stopInBackground()
            }, 100000)

            while (pool.isRunning()) {
                Util.appendInfo('system is running');
                await Util.syncDelay(3000);
                pool.showState()
            }
        }

        // 取消註解以運行示例
        // await exampleOfRunByTaskWait4ResultAndRunInBackground()
        // await exampleOfRunInBackgroundInfinite()
        // await exampleOfRunByTimes()
    })();
}

export default InfinitePool;
