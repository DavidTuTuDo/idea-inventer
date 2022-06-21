import _ from 'lodash';
import {utiller as Util} from '../index.js';
import {configerer} from "configerer";
import ERROR from '../exceptioner';


/**
 *
 Pooller 有以下特點:
 1.task可以設定timeout
 2.queue滿了的可以設定task interval
 3.如果是runByEachTask length, queue裡面沒有task時，可以設定sleeptime, 以及Sleepcounts
 4.task 可以cancelled by hash
 5.runByParams,runByTimes,runInInfinite,runByEachTask
 6.可以設定taskFailHandler, 這樣遇到錯誤就不會停掉poollers
 *
 */
const SPECIFICITY_DEBUG = false;

class InfinitePool {

    isRunInBackgroundMode = false;

    state = configerer.POOLLER_STATE.RUN_BY_EACH_TASK

    /** 用來處理Task的延遲,假設要偷網頁東西, 不能太頻繁, 要偽裝成手動只能透過這方式, 如果是multi thread, 延遲是針對worker滿載後,再加進去的那一個 */
    enableOfTaskSleepByInterval = configerer.POOLLER_ENABLE_TASK_SLEEP_BY_INTERVAL;
    taskSleepInterval = configerer.POOLLER_TASK_OF_INTERVAL_DEFAULT;

    /** 用來處理每一個task的timeout, 避免task處理太久卡在Queue裡面 */
    enableOfTaskTimeout = configerer.POOLLER_ENABLE_TIMEOUT;
    timeOfTaskTimeout = configerer.POOLLER_TASK_TIMEOUT_DEFAULT;

    /** 如果要讓每個pool不會因為task掉進catch 而被中斷, 就必須加入taskFailHandler*/
    handlerOfAssignTaskFail = undefined;
    maximumOfWorker;

    /** 如果設定sleep interval, 可以加這個參數要不要先執行第一次 再開始 interval 機制*/
    disableFirstRun = false

    /** 用於 runByParam */
    queueOfWaitingParam = [];

    /** runByTimes 的次數 */
    countsOfRunByTimes = -1;

    /** 裡面放 {high:[], low:[], medium }
     * taskQueue就是指裡面有多少Task!
     * 通常Infinite模式,裡面只會有一個asyncTask
     * */
    queueOfAssignTask = {};

    /** 裡面放準備執行中的Task(worker正在工作的Task), 這邊的task就沒辦法remove了
     * 一次能處理幾個取決於maxWorker
     * */
    queueOfExecutingTask = [];
    /** [{state: 'NOT', hash: hash, task: functionOfAsyncTask} ]*/

    isQueuePolling = false;
    /** 目前queue機制是while(isQueuePolling)  沒任務就睡一下, 有任務就做事情, 發現task有延遲, 就要注意是不是taskInterval*/

    initialTaskCompleted = false;
    mapOfHashNTask = {};
    /** 為了刪除未執行的task, 但只限於runByTask, 因為下一個run之後, hash就改變了    */

    mapOfHashNCallbackWrapper = {}

    nameOfCurrentPool = ``;

    constructor(maxWorkers = configerer.POOLLER_WORKER_DEFAULT, name = Util.getRandomValue(0, 100000000000)) {
        this.maximumOfWorker = maxWorkers;
        this.setPoolId(_.toString(name));
        for (const prior of configerer.POOLLER_PRIORITY) {
            this.queueOfAssignTask[prior] = [];
        }
    }

    setPoolId = (id = this.nameOfCurrentPool) => {
        this.nameOfCurrentPool = id;
    }

    getPoolId = () => {
        return this.nameOfCurrentPool;
    }

    /**
     * @deprecated there's no sleep mechanism
     */
    enableQueueTerminateBySleepCount(enable = true,
                                     interval = configerer.POOLLER_QUEUE_TIME_OF_SLEEP_INTERVAL_DEFAULT
        , times = configerer.POOLLER_QUEUE_MAX_SLEEP_COUNTS_DEFAULT) {
        this.enableOfQueueTerminateSleepCount = enable;
        this.queueMaxSleepCounts = times;
        this.intervalOfQueueSleep = interval
    }

    clearCache() {
        this.queueOfExecutingTask.length = 0;
        this.mapOfHashNTask = {};
        this.queueOfAssignTask = {};
    }

    terminate() {
        this.isQueuePolling = false;
    }

    printLogMessage(message, error = false, ...infos) {
        if (SPECIFICITY_DEBUG)
            Util.printLogMessage(this.getPoollerLogFormat(message), error, ...infos)
    }

    /** return true if task completed, after 15 secs, force leave
     *  TODO:應該要設計成當terminate後, 監聽executingTaskInQueue為零時,回傳結束 */
    stopInBackground = async () => {
        this.terminate();
        while (_.size(this.queueOfExecutingTask) > 0) {
            await Util.syncDelay(500);
            this.printLogMessage(`784512, 咬在 stopInBackground 出不來,${this.getLogMessageOfExecutingTaskQueueCount()}`)
            this.showState();
        }
        return true;
    }

    isRunning = () => {
        return this.isQueuePolling;
    }

    setWorker(counts) {
        this.maximumOfWorker = counts;
    }

    cleanTaskInterval() {
        this.taskSleepInterval = {min: 0, max: 0};
    }

    /**
     * interval:{min: 800, max: 1000}
     * */
    enableTaskSleepInterval(enable = true, interval = configerer.POOLLER_TASK_OF_INTERVAL_DEFAULT) {
        this.enableOfTaskSleepByInterval = enable
        if (_.isNumber(interval)) {
            interval = {min: interval, max: interval};
        }
        this.taskSleepInterval = interval;
    }

    enableTaskTimeout(enable = true, millionSec = configerer.POOLLER_TASK_TIMEOUT_DEFAULT) {
        this.enableOfTaskTimeout = enable;
        this.timeOfTaskTimeout = millionSec;
    }

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

    registerHash4Result(hash, callback) {
        this.mapOfHashNCallbackWrapper[hash] = callback;
    }

    getCountOfAssignTaskInQueue = () => {
        let size = 0;
        for (const prior of configerer.POOLLER_PRIORITY) {
            size += this.queueOfAssignTask[prior].length;
        }

        return size;
    }

    /** 3:low,2:medium,1:high */
    /** add the task into queueOfAssignTask, return task key,once you want to remove it */
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

    updateExecuteTaskState = (hash) => {
        const self = this;
        const task = _.find(this.queueOfExecutingTask, (each) => _.isEqual(each.hash, hash))
        if (task) {
            this.printLogMessage(`847875153, 客端委託的任務: ${hash},更改狀態為 'ING'`)
            task.state = 'ING';
        }
    }

    /** 這裡的設計是利用兩個promise, 一個為了timeout , 一個被客端委託的task */
    taskWrapper = (assignedTask, hashOfTask, param) => () => {
        const self = this;
        let timeoutHash = '';
        let assignedTaskResult;
        let assignedTaskError;
        let isAssignedTaskCompleted = true;
        /** 用來判斷task 有沒有走到 catch裡面, 不然resolve了但return undefined, task會不知所措 */
        return new Promise((resolve, reject) => {
            if (self.enableOfTaskTimeout) {
                timeoutHash = setTimeout(() => {
                    try {
                        this.printLogMessage(`982532, taskWrapper執行中,發生timout: ${self.timeOfTaskTimeout} ms`)
                        throw new ERROR(4010, self.getPoollerLogFormat(`TASK HASH:${hashOfTask} IS TIMEOUT ${self.timeOfTaskTimeout} ms ${param ? `,PARAMS IS ${JSON.stringify(param)}` : ''}`))
                    } catch (error) {
                        reject(error);
                    }
                }, self.timeOfTaskTimeout);
            }
            /** 客端委託的task的是從這裡開始 */
            this.printLogMessage(`984135, 客端委託的task開始執行 ${hashOfTask}`)

            self.updateExecuteTaskState(hashOfTask);
            assignedTask(param).then((result) => {
                    this.printLogMessage(`984545, 客端委託的任務,resolve回應: ${result}`)
                    assignedTaskResult = result
                    isAssignedTaskCompleted = true;
                }
            ).catch((error) => {
                    this.printLogMessage(`989652, 客端委託的任務,reject回應: ${error.message}`, true, error)
                    assignedTaskError = error
                    isAssignedTaskCompleted = false;
                }
            ).finally(() => {
                clearTimeout(timeoutHash);
                resolve();
                this.printLogMessage(`98942, taskWrapper()裡面第一個promise(為了timeout設計)完成了`)

            })
        }).then((result) => {
                /** 能走到這裡,代表沒有timeout的狀況下,執行了委託的任務 */
                if (!isAssignedTaskCompleted) {
                    throw assignedTaskError;
                } else {
                    return `${this.getLogMessageOfTaskHash(hashOfTask)} completed`;
                }
            }
        ).catch(error => {
            /** 如果發生timeout  或是 客端任務掉進去catch都會跑到這裡 */
            isAssignedTaskCompleted = false;
            assignedTaskError = error;
            /** 如果是Wait4ResultTask模式, 要把catch | result 回到callbackWrapper */
            if (!self.isWait4ResultTask(hashOfTask)) {
                if (self.handlerOfAssignTaskFail !== undefined) {
                    self.handlerOfAssignTaskFail(assignedTaskError);
                } else
                    throw assignedTaskError;
            }
        }).finally(() => {
            const result = {
                assignedTaskCompleted: isAssignedTaskCompleted,
                resolve: assignedTaskResult,
                reject: assignedTaskError
            };
            self.removeResolveOrRejectPromiseByHash(hashOfTask, result);
            this.printLogMessage(`98943213, ${this.getLogMessageOfTaskHash(hashOfTask)} taskWrapper()裡面第2個promise完成了`, false, result)
        })
    }

    adds = (tasks, priority = 'low') => {
        const hashes = [];
        if (_.isArray(tasks)) {
            for (const task of tasks) {
                hashes.push(this.add(task, priority));
            }
        } else {
            throw new ERROR(4003, `should be async function array, not ${typeof tasks}`);
        }
        return hashes;
    }

    removeTaskMapByHash = (hash) => {
        delete this.mapOfHashNTask[hash];
    }

    appendHashTaskMap(taskInfo) {
        this.mapOfHashNTask[taskInfo.hash] = taskInfo;
    }

    getTaskInfoByHash(hash) {
        return this.mapOfHashNTask[hash];
    }

    /**
     * remove task in queue by its hash, hash was created when add to queue
     * method will return true when succeed delete
     * 放到executing queue, 就沒辦法刪除了
     **/
    remove(hash) {
        let taskInfo = this.getTaskInfoByHash(hash);
        if (taskInfo) {
            for (const prior of configerer.POOLLER_PRIORITY) {
                const _index = _.indexOf(this.queueOfAssignTask[prior], taskInfo);
                if (_index > 0) {
                    this.queueOfAssignTask[prior].splice(_index, 1);
                    this.removeTaskMapByHash(hash);
                    return true;
                }
            }
            return false;
        } else {
            throw new ERROR(4004, hash);
        }
    }

    beforeRun = () => {
        this.isQueuePolling = true;
        /** 有點多餘的設計, 本來是想要當沒有task時, 有個house-keeping的設計, 但發現只要在任務加入時, 觸發runByEachTask即可
         this.currentSleepCounts = 0;
         */
    }

    afterRun = () => {
        this.clearCache();
    }

    /** interval was the time between tasks when queueOfExecutingTask is full.
     * run would infinite, in default, intervalOfQueueSleep over 100 times, pooller would shutdown */
    runInInfinite = async (task = [], interval) => {
        this.beforeRun();
        if (_.isFunction(task))
            this.add(task)
        else if (_.isArray(task))
            this.adds(task);
        else
            throw new ERROR(4006, `type of task is ===> ${typeof task}`)

        this.enableTaskSleepInterval(_.isNumber(interval), interval);
        this.setState(configerer.POOLLER_STATE.RUN_INFINITE);
        while (!this.ruleOfStopInfiniteRun()) {
            this.printLogMessage(`415123, runInInfinite() 正在無限Loop中, ${this.getLogMessageOfExecutingTaskQueueCount()}`)
            await this.#run();
        }
    }

    /** 我的設計是,如果放到了executingQueue裡面,就必須執行完畢,清空executingTaskQueue才能真正的結束*/
    ruleOfStopInfiniteRun = () => {
        return !this.isRunning() && this.isExecutingTaskQueueEmpty()
    }

    isExecutingTaskQueueEmpty = () => {
        return _.size(this.queueOfExecutingTask) === 0;
    }

    appendParamInToQueue = (...params) => {
        this.triggerBgInstance();
        this.queueOfWaitingParam.push(...params);
    }

    /** run time by params length, param有可能會是undefined, 要在functionOfAsyncTask判斷 */
    runByParams = async (functionOfAsyncTask, ...params) => {
        if (functionOfAsyncTask === undefined) {
            functionOfAsyncTask = this.queueOfAssignTask['low'].shift().task;
        }
        if (!_.isFunction(functionOfAsyncTask)) throw new ERROR(4006, `runByParams error, typeof task can't be ${typeof functionOfAsyncTask}`);
        if (!_.isArray(params)) throw new ERROR(4006, `runByParams error, typeof params can't be ${typeof params}`);
        this.beforeRun();
        this.add(functionOfAsyncTask);
        this.appendParamInToQueue(...params)
        this.setState(configerer.POOLLER_STATE.RUN_BY_PARAMS);
        while (!this.ruleOfStopInfiniteRun() && _.size(this.queueOfWaitingParam) > 0) {
            await this.#run();
        }
    }

    runByEachTask = async (tasks = []) => {
        const self = this;
        this.id = Util.getRandomHash(15);
        this.beforeRun();
        this.adds(tasks);
        this.setState(configerer.POOLLER_STATE.RUN_BY_EACH_TASK);
        while (!this.ruleOfStopInfiniteRun()) {
            await this.#run(this.id);
            if (this.getCountOfAssignTaskInQueue() <= 0) {
                this.terminate();
                this.printLogMessage(`788121, runByEachTask() 因為 taskOfWaitingQueue 清空而停止`);
            }

            /** 為了讓while不要停止運算 !this.ruleOfStopInfiniteRun(),不然 runByTask不會停止 */
            await Util.syncDelay(10);
        }
    }

    /** run times wound be depend on times, task would by loop and sync in given order
     * runByTimes目前只支援1個worker
     * */
    runByTimes = async (functionOfAsyncTask, times = 1) => {
        this.countsOfRunByTimes = times;
        this.add(functionOfAsyncTask);
        this.beforeRun();
        this.setState(configerer.POOLLER_STATE.RUN_BY_TIMES);

        while (!this.ruleOfStopInfiniteRun() && this.countsOfRunByTimes > 0) {
            await this.#run();
        }

    }

    /** what it means, like a thread run in background,  */
    runInBackGround = (asyncfunc, ...params) => {
        this.isRunInBackgroundMode = true;
        if (!(typeof asyncfunc === "function")) {
            throw new ERROR(4002, `_asyncfunc can't be ${typeof asyncfunc}`);
        }

        return setTimeout(async () => {
            try {
                await asyncfunc(...params);
            } catch (error) {
                throw new ERROR(4009, {message: `${this.getPoollerLogFormat('')}`}, error);
            } finally {
                this.terminate();
                this.printLogMessage(`7812123, runInBackGround() 走到finally`)
            }
        }, 1);
    }

    getPoollerLogFormat = (msg) => {
        return `POOLLER NAME: ${this.getPoolId()}${_.isEmpty(msg) ? '' : ' , '}${msg}`;
    }

    setTaskFailHandler = (listener = (error) => console.log(error.message)) => {
        this.handlerOfAssignTaskFail = listener;
    }

    /** run by how many task in queue, FIFO, if task completed, pool with intervalOfQueueSleep for a while
     * ,after this.queueMaxSleepCounts, pooller would closed */

    setState(_state) {
        this.state = _state;
    }

    isFirstTaskCompleted() {
        if (!this.initialTaskCompleted) {
            this.initialTaskCompleted = true;
            return false
        }
        return this.initialTaskCompleted;
    }

    /** 如果設定interval, 第一個run不要執行的話,就設定true, default是false */
    setDisableFirstRun(disable = true) {
        this.disableFirstRun = disable;
    }

    /** 加上一個 被動式啟動, 不然一直while() run, 可能有效能上的問題,現階端只支援RUN_BY_TASK */
    triggerBgInstance() {
        if (!this.isRunInBackgroundMode || this.isQueuePolling) {
            return;
        }

        if (this.state === configerer.POOLLER_STATE.RUN_BY_EACH_TASK) {
            /** 因為不這樣做, 就會產生 race condition, 會產生出3個runInBackGround instance */
            this.runByEachTaskInBackGround();
            return;
        } else if (this.state === configerer.POOLLER_STATE.RUN_BY_PARAMS) {
            this.runByParamInBackGround();
            return;
        }

        throw new ERROR(4011, `this.state is ==> ${Util.getItsKeyByValue(configerer.POOLLER_STATE, this.state)}`)
    }

    isExecutingQueueFull() {
        return _.size(this.queueOfExecutingTask) >= this.maximumOfWorker;
    }

    isTaskQueueEmpty() {
        return this.getCountOfAssignTaskInQueue() === 0
    }

    /** 依照config 把委託任務放置到Queue裡面 */
    async syncTaskDispatcher() {
        const initialTaskShouldNotRun = this.disableFirstRun && !this.isFirstTaskCompleted()
        const isExecutingTaskAlmostFull = this.queueOfExecutingTask.length >= this.maximumOfWorker - 1;
        /** 因為走能到syncTaskDispatcher表示其中一個工作完成了, 這個瞬間不可能 === maximumOfWorker,
         *  所以必須減1, 除非這個syncTaskDispatcher是單獨一個線程 */
        const comparison = this.isFirstTaskCompleted() && isExecutingTaskAlmostFull && this.enableOfTaskSleepByInterval;

        if (initialTaskShouldNotRun || comparison) {
            const restInInterval = await Util.syncDelayRandom(this.taskSleepInterval.min, this.taskSleepInterval.max)
            this.printLogMessage(`4484121, 走到一坡睡覺區 enableOfTaskSleepByInterval:${this.enableOfTaskSleepByInterval} || ${restInInterval} ms`)
        }

        /** 當pool isRunning才可以把任務加進去 */
        while (this.rulesOfAppendToExecutingTask()) {
            const taskInfo = this.getTaskInfoDependOnPriority();
            if (taskInfo) {
                const promise = this.taskWrapper(taskInfo.task, taskInfo.hash, this.queueOfWaitingParam.shift());
                this.removeTaskMapByHash(taskInfo.hash);
                this.appendTaskToExecuteQueue(taskInfo.hash, promise);
            } else {
                /** 沒有taskInfo, 也許有未知的isssue,保險起見break */
                this.printLogMessage(`848451  也許有未知的isssue,保險起見break,是不是在這裡無限迴圈跑跑跑`, true);
                break;
            }

        }
    }

    /** 把assignedTask 加入到 QueueOfExecutingTask 的規則*/
    rulesOfAppendToExecutingTask = () => {
        switch (this.state) {
            case configerer.POOLLER_STATE.RUN_BY_EACH_TASK:
                return this.isRunning() && !this.isExecutingQueueFull() && this.getCountOfAssignTaskInQueue() > 0;
            case configerer.POOLLER_STATE.RUN_BY_PARAMS:
                return this.isRunning() && !this.isExecutingQueueFull() && _.size(this.queueOfWaitingParam) > 0;
            case configerer.POOLLER_STATE.RUN_BY_TIMES:
                return this.isRunning() && !this.isExecutingQueueFull() && this.countsOfRunByTimes > 0;
            case configerer.POOLLER_STATE.RUN_INFINITE:
                return this.isRunning() && !this.isExecutingQueueFull();
            default:
                throw new ERROR(4005, `this.state ==> ${this.state}`)
        }
    }

    appendTaskToExecuteQueue = (hash, promise) => {
        if (_.isEqual(this.state, configerer.POOLLER_STATE.RUN_BY_TIMES)) {
            this.countsOfRunByTimes = this.countsOfRunByTimes - 1;
        }
        const task = {state: 'NOT', hash: hash, task: promise};
        this.printLogMessage(`4484451, 增加了一個assignedTask ${this.getLogMessageOfTaskHash(hash)} 到 QueueOfExecutingTask ,${this.getLogMessageOfExecutingTaskQueueCount}`, false, task)
        this.queueOfExecutingTask.push(task);
    }

    getLogMessageOfExecutingTaskQueueCount = () => {
        return `ExecutingTaskQueueCount: ${_.size(this.queueOfExecutingTask)}`
    }
    getLogMessageOfTaskHash = (hash) => {
        return `TASK HASH: ${hash}`
    }

    showState = () => {
        Util.appendInfo(this.getPoollerLogFormat(`workerCount: ${this.maximumOfWorker}`));
        Util.appendInfo(this.getPoollerLogFormat(`taskQueue(還在排隊的Task): ${this.getCountOfAssignTaskInQueue()}`));
        Util.appendInfo(this.getPoollerLogFormat(`QueueOfExecutingTask(正在執行的AsyncTask, 超過workerCount就是bug): ${_.size(this.queueOfExecutingTask)}`));
        Util.appendInfo(this.getPoollerLogFormat(`mapOfHashNTask(還沒執行到的AsyncTask reference的暫存區): ${_.size(this.mapOfHashNTask)}`));
    }

    #run = async () => {
        const self = this;

        async function execute() {
            const tasks = self.queueOfExecutingTask.filter((each) => _.isEqual(each.state, 'NOT')).map((each) => {
                const task = each.task;
                return task();
            })
            /** Util.appendInfo(`\n\n正要執行的隊列`,self.queueOfExecutingTask) */
            return await Promise.race(tasks);
        }

        await this.syncTaskDispatcher();

        if (!this.isExecutingTaskQueueEmpty()) {
            /** 當pool已經被要求停止時, executeQueue裡面還有未做完的任務*/
            this.printLogMessage(`4512211, 開始任務(taskWrapper): ${this.getLogMessageOfExecutingTaskQueueCount()}`)
            const task = await execute();
            this.printLogMessage(`4512213 完畢任務(taskWrapper:${task}), ${this.getLogMessageOfExecutingTaskQueueCount()}`);
        } else {
            this.printLogMessage(`4574152 不應該走到這裏,但是 minor issue`, true)
        }

        if (this.queueOfExecutingTask.length > this.maximumOfWorker)
            this.printLogMessage(`4512214 一定是改壞了!!!!!!!!!!, ${this.getLogMessageOfExecutingTaskQueueCount} `, true);

    }

    /** taskInfo = { task, hash }*/
    getTaskInfoDependOnPriority = () => {
        for (const prior of configerer.POOLLER_PRIORITY) {
            if (this.queueOfAssignTask[prior].length > 0) {
                switch (this.state) {
                    case configerer.POOLLER_STATE.RUN_BY_EACH_TASK:
                        return this.queueOfAssignTask[prior].shift();
                    case configerer.POOLLER_STATE.RUN_BY_PARAMS:
                    case configerer.POOLLER_STATE.RUN_BY_TIMES:
                    case configerer.POOLLER_STATE.RUN_INFINITE:
                        const taskInfo = this.queueOfAssignTask[prior].shift();
                        this.add(taskInfo.task);
                        return taskInfo;
                    default:
                        throw new ERROR(4005, `this.state ==> ${this.state}`)
                }
            }
        }
        if (!_.isEqual(this.state, configerer.POOLLER_STATE.RUN_BY_EACH_TASK))
            throw new ERROR(4007);
    }

    removeResolveOrRejectPromiseByHash = (hash, result) => {
        const callbackWrapper = this.mapOfHashNCallbackWrapper[hash];
        if (callbackWrapper !== undefined) {
            callbackWrapper(result);
            delete this.mapOfHashNCallbackWrapper[hash];
        }
        this.removePromiseFromExecutingQueue(hash);
    }

    removePromiseFromExecutingQueue = (hash) => {
        this.printLogMessage(`QueueOfExecutingTask 拿掉了完成的任務 ${this.getLogMessageOfTaskHash(hash)}`)
        _.remove(this.queueOfExecutingTask, (each) => _.isEqual(hash, each.hash));
    }

    /** 如果有function 就代表是一個需要回傳result的task, task在線等的意思*/
    isWait4ResultTask(hash) {
        return this.mapOfHashNCallbackWrapper[hash] !== undefined;
    }

    runInfiniteInBackground = (functionOfAsyncTask, interval) => {
        this.runInBackGround(this.runInInfinite, functionOfAsyncTask, interval);
    }

    runByParamInBackGround = (functionOfAsyncTask, ...params) => {
        return this.invokeInstanceOfBackground(this.runByParams, functionOfAsyncTask, ...params);
    }

    runByTimesInBackGround = (functionOfAsyncTask, times) => {
        this.runInBackGround(this.runByTimes, functionOfAsyncTask, times);
        return this;
    }

    runByEachTaskInBackGround = (...params) => {
        return this.invokeInstanceOfBackground(this.runByEachTask, ...params);
    }

    invokeInstanceOfBackground = (state, ...params) => {
        if (this.atomicBgInstance !== undefined)
            clearTimeout(this.atomicBgInstance);
        this.atomicBgInstance = this.runInBackGround(state, ...params);
        /**
         * 因為偷懶, 所以回傳整個instance, 這樣程式碼就只要寫一行
         * const pool = new InfinitePool(1).runByEachTaskInBackGround();
         */
        return this;
    }

    /** following function are examples **/
    /** following function are examples **/

    /** following function are examples **/
    /** following function are examples **/

    async exampleOfRunByTaskWait4ResultAndRunInBackground() {
        const pool = new InfinitePool(1, 'david').runByEachTaskInBackGround();
        pool.enableTaskTimeout(true, 3000);

        function asyncTask(sign, taskSpend = 2000) {
            return async () => {
                await Util.syncDelay(taskSpend)
                return sign;
            }
        }

        function startTimoutTask(delayTime, taskSpendTime, sign, priority = 'low') {
            setTimeout(async () => {
                try {
                    const printSign = await pool.addTaskAndWait4Result(asyncTask(sign, taskSpendTime), priority);
                    Util.appendInfo('answer => ', printSign);
                } catch (error) {
                    Util.appendError(`sign ${sign} perform fail`, error.message);
                }
            }, delayTime);
        }

        startTimoutTask(0, 1000, 'A', 'low')
        startTimoutTask(1000, 1000, 'C', 'low')
        startTimoutTask(1000, 1000, 'G', 'high')
        startTimoutTask(500, 4000, 'B', 'low')
        startTimoutTask(3000, 1000, 'D', 'medium')
        startTimoutTask(10000, 2000, 'E', 'medium')


        while (pool.isRunning()) {
            console.log('system is running');
            pool.showState();
            await Util.syncDelay(1000);
        }
    }

    async exampleOfRunInBackgroundInfinite() {

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

    async exampleOfRunInfinite() {
        await new InfinitePool(3).runInInfinite(async () => {
            console.log('1000');
        }, 1000)
    }

    async exampleOfRunByParamInBackground() {
        const pool = new InfinitePool(5);
        pool.runByParamInBackGround(
            async (param) => {
                const ms = await Util.syncDelayRandom()
                console.log(`wait ${ms} ms`, 'param', param);
            }, 'david', 'susan', 'golden', 'weber', 'kevin')

        setTimeout(() => {
            pool.appendParamInToQueue('apple', 'Rui')
        }, 12000)

        while (pool.isRunning()) {
            Util.appendInfo('system is running');
            await Util.syncDelay(3000);
            // pool.showState()
        }
    }

    async exampleOfRunByTimesInBackground() {
        const pool = new InfinitePool(6);
        let count = 0;
        pool.runByTimesInBackGround(
            async () => {
                const ms = await Util.syncDelayRandom()
                count++
                console.log(`wait for time: ${ms} ms, count:${count}`);
            }, 20)

        while (pool.isRunning()) {
            Util.appendInfo('system is running');
            await Util.syncDelay(3000);
            // pool.showState()
        }

    }

    async exampleOfRunByParam() {
        const oneToTen = _.range(1, 10);
        const pool = new InfinitePool(5);
        Util.appendInfo(`....start method of runByParams`);

        await pool.runByParams(async (param) => {
            const ms = await Util.syncDelayRandom();
            console.log(param, `${ms} ms`);
        }, ...oneToTen)
        Util.appendInfo(`....finish method of runByParams`);

    }

    async exampleOfRunByTask() {
        const pool = new InfinitePool(10);
        const tasks = _.range(1, 5).map(each => Util.asyncUnitTaskFunction(each));
        Util.appendInfo(`....start method of exampleOfRunByTask`);
        const all = await pool.runByEachTask(tasks);
        Util.appendInfo(all);
        Util.appendInfo(`....finish method of exampleOfRunByTask`);

    }

    async exampleOfRunByTimes() {
        const pool = new InfinitePool(5);
        let time = 0
        Util.appendInfo(`....start method of runByTimes`);

        await pool.runByTimes(async () => {
            await Util.syncDelay(1000);
            time++
            console.log(`execute the ${time} time`)
        }, 10)
        Util.appendInfo(`....finish method of runByTimes`);

    }

    async exampleOfInfiniteUnStopLoopingIssue() {

        async function persistTone() {
            try {
                const sign = Util.getRandomHash(20);
                const time = await Util.syncDelayRandom(1, 10);
                Util.appendInfo(`${time} ms, yoyoyo ${sign}`);
                // Util.appendInfo(`沒有TONE可以下載了....隨機睡個${await Util.syncDelayRandom(1500, 3500)}`)
                return `任務ID:${sign}`;
            } catch (error) {
                Util.appendError(error.message);
            }
        }

        const poollers = []
        const pool = new InfinitePool(3);
        pool.setPoolId('tone fetch');
        pool.setDisableFirstRun(true);
        pool.runInfiniteInBackground(persistTone,
            5000);
        pool.setTaskFailHandler((error) => Util.appendError(`5165 error ${error.message}`));
        poollers.push(pool);

        let isRequiredTerminate = false;
        setTimeout(() => {
            isRequiredTerminate = true;
        }, 20000)

        while (true) {
            Util.exeAll(poollers, (each) => each.showState())
            const random = await Util.syncDelayRandom();
            // Util.appendInfo(`主線程還在努中工作中, 休息一毀兒 ${random} mms`);
            await Util.syncDelay(random);
            if (isRequiredTerminate) {
                Util.appendInfo(`主線程收到關閉指令...`);
                for (const pooller of poollers) {
                    Util.appendInfo(`POOLER ${pooller.getPoolId()} 正在關閉中`);
                    await pooller.stopInBackground();
                    pooller.showState();
                    Util.appendInfo(`POOLER ${pooller.getPoolId()} 關閉成功!`);
                }
                break;
            }
        }
    }
}

if (configerer.DEBUG_MODE) {
    (async () => {
        await new InfinitePool().exampleOfRunByTask()
    })();

}


export default InfinitePool;
