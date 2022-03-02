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
class InfinitePool {

    state = configerer.POOLLER_STATE.RUN_BY_EACH_TASK

    /** 用來處理Task的延遲,假設要偷網頁東西, 不能太頻繁, 要偽裝成手動只能透過這方式, 如果是multi thread, 延遲是針對worker滿載後,再加進去的那一個 */
    enableOfTaskSleepByInterval = configerer.POOLLER_ENABLE_TASK_SLEEP_BY_INTERVAL;
    taskSleepInterval = configerer.POOLLER_TASK_OF_INTERVAL_DEFAULT;

    /** 用來處理每一個task的timeout, 避免task處理太久卡在Queue裡面 */
    enableOfTaskTimeout = configerer.POOLLER_ENABLE_TIMEOUT;
    timeOfTaskTimeout = configerer.POOLLER_TASK_TIMEOUT_DEFAULT;

    /** 如果要讓每個pool不會因為task掉進catch 而被中斷, 就必須加入taskFailHandler*/
    taskFailHandler = undefined;
    maxWorker;
    ignoreFirstRun = false
    /** 用於 runByParam */
    paramQueue = [];


    /** 裡面放 {high:[], low:[], medium }
     * taskQueue就是指裡面有多少Task!
     * 通常Infinite模式,裡面只會有一個asyncTask
     * */
    assignedTaskQueue = {};

    /** 裡面放準備執行中的Task(worker正在工作的Task), 這邊的task就沒辦法remove了
     * 一次能處理幾個取決於maxWorker
     * */
    executingTaskInQueue = [];

    isQueuePolling = false;
    /** 目前queue機制是while(isQueuePolling)  沒任務就睡一下, 有任務就做事情, 發現task有延遲, 就要注意是不是taskInterval*/

    initialTaskCompleted = false;
    mHashNTaskMap = {};
    /** 為了刪除未執行的task, 但只限於runByTask, 因為下一個run之後, hash就改變了    */

    hashCallbackMapOfWaiting4Result = {}
    poolId = ``;

    constructor(maxWorkers = configerer.POOLLER_WORKER_DEFAULT, name = Util.getRandomValue(0, 100000000000)) {
        this.maxWorker = maxWorkers;
        this.setPoolId(_.toString(name));
        for (const prior of configerer.POOLLER_PRIORITY) {
            this.assignedTaskQueue[prior] = [];
        }
    }

    setPoolId = (id = this.poolId) => {
        this.poolId = id;
    }

    getPoolId = () => {
        return this.poolId;
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
        this.executingTaskInQueue.length = 0;
        this.mHashNTaskMap = {};
        this.assignedTaskQueue = {};
    }

    terminate() {
        this.isQueuePolling = false;
    }

    /** return true if task completed, after 15 secs, force leave */
    stopInBackground = async () => {
        this.terminate();
        while (_.size(this.executingTaskInQueue) > 0) {
            await Util.syncDelay(1000);
            Util.appendInfo(this.getPoollerLogFormat(`咬在 stopInBackground 出不來`))
            this.showState();
        }
        return true;
    }

    isRunning = () => {
        return this.isQueuePolling;
    }

    setWorker(counts) {
        this.maxWorker = counts;
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
        this.trigger();
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
        this.hashCallbackMapOfWaiting4Result[hash] = callback;
    }

    getTaskQueueCount = () => {
        let size = 0;
        if (this.state === configerer.POOLLER_STATE.RUN_BY_PARAMS) return this.paramQueue.length;

        for (const prior of configerer.POOLLER_PRIORITY) {
            size += this.assignedTaskQueue[prior].length;
        }

        return size;
    }

    /** 3:low,2:medium,1:high */
    /** add the task into assignedTaskQueue, return task key,once you want to remove it */
    add = (task, priority = 'low') => {
        if (typeof task === "function") {
            if (configerer.POOLLER_PRIORITY.indexOf(priority) < 0) {
                throw new ERROR(4001, `priority can't be ${priority}`);
            }
            const hash = Util.getRandomHash();
            const taskInfo = {task, hash};
            this.appendHashTaskMap(taskInfo);
            this.assignedTaskQueue[priority].push(taskInfo);
            return hash;
        } else {
            throw new ERROR(4002, `task can't be ${typeof task}`);
        }
    }

    /** 這裡的設計釋放兩個promise, 一個為了timeout , 一個被客端委託的task */
    taskWrapper = (assignedTask, hashOfTask) => () => {
        const self = this;
        let timeoutHash = '';
        let assignedTaskResult;
        let assignedTaskError;
        let param = self.paramQueue.shift();
        let isAssignedTaskCompleted = true;
        /** 用來判斷task 有沒有走到 catch裡面, 不然resolve了但return undefined, task會不知所措 */
        return new Promise((resolve, reject) => {
            if (self.enableOfTaskTimeout) {
                timeoutHash = setTimeout(() => {
                    try {
                        throw new ERROR(4010, self.getPoollerLogFormat(`TASK HASH:${hashOfTask} IS TIMEOUT ${self.timeOfTaskTimeout} ms ${param ? `,PARAMS IS ${JSON.stringify(param)}` : ''}`))
                    } catch (error) {
                        reject(error);
                    }
                }, self.timeOfTaskTimeout);
            }
            /** 客端委託的task的是從這裡開始 */
            // Util.appendInfo(self.getPoollerLogFormat(`客端委託的task開始執行 ${hashOfTask}`));
            assignedTask(param).then((result) => {
                    // console.log(self.getPoollerLogFormat('task get result'));
                    assignedTaskResult = result
                    isAssignedTaskCompleted = true;
                }
            ).catch((error) => {
                    // console.error(self.getPoollerLogFormat('委託任務發生錯誤'), error);
                    assignedTaskError = error
                    isAssignedTaskCompleted = false;
                }
            ).finally(() => {
                clearTimeout(timeoutHash);
                /** 要記得 resolve, reject 在這裡代表的是放在executingQueue裡面的promise, reject,resolve其中一個必須觸發, executingQueue才不會堵塞
                 ** 而任務需要的task是透過 removeResolveOrRejectPromiseByHash() */
                // console.info(self.getPoollerLogFormat(self.getPoollerLogFormat('inner finally')));
                resolve(`${hashOfTask} done`);
            })
        }).then((result) => {
                /** 再沒有timeout的狀況下,執行了委託的任務(委託任務可能成功也可能進到catch) */
                if (!isAssignedTaskCompleted) {
                    throw assignedTaskError;
                }

            }
        ).catch(error => {
            // console.error(self.getPoollerLogFormat(self.getPoollerLogFormat('outer error')), error);
            /** 如果發生timeout  或是 assign task 掉進去catch 都會跑到這裡 */
            isAssignedTaskCompleted = false;
            assignedTaskError = error;

            /** 如果是Wait4ResultTask模式, 要把catch | result 回到callbackWrapper */
            if (!self.isWait4ResultTask(hashOfTask)) {
                if (self.taskFailHandler !== undefined) {
                    self.taskFailHandler(assignedTaskError);
                } else
                    throw assignedTaskError;
            }
        }).finally(() => {
            // console.info(self.getPoollerLogFormat(self.getPoollerLogFormat('outer finally')));
            const result = {
                assignedTaskCompleted: isAssignedTaskCompleted,
                resolve: assignedTaskResult,
                reject: assignedTaskError
            };
            // Util.appendInfo('客端委託的task執行完回傳的內容', result, hashOfTask)
            self.removeResolveOrRejectPromiseByHash(hashOfTask, result);

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
        delete this.mHashNTaskMap[hash];
    }

    appendHashTaskMap(taskInfo) {
        this.mHashNTaskMap[taskInfo.hash] = taskInfo;
    }

    getTaskInfoByHash(hash) {
        return this.mHashNTaskMap[hash];
    }

    /**
     * remove task in queue by its hash, hash was created when add to queue
     *
     * method will return true when succeed delete
     *
     * 放到executing queue, 就沒辦法刪除了
     *
     **/
    remove(hash) {
        let taskInfo = this.getTaskInfoByHash(hash);
        if (taskInfo) {
            for (const prior of configerer.POOLLER_PRIORITY) {
                const _index = _.indexOf(this.assignedTaskQueue[prior], taskInfo);
                if (_index > 0) {
                    this.assignedTaskQueue[prior].splice(_index, 1);
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

    /** interval was the time between tasks when executingTaskInQueue is full.
     * run would infinite, in default, intervalOfQueueSleep over 100 times, pooller would shutdown */
    runInInfinite = async (task = [], interval) => {
        this.beforeRun();
        if (_.isFunction(task))
            this.add(task)
        else if (_.isArray(task))
            this.adds(task);
        else
            throw new ERROR(4006, `type of task is ===> ${typeof task}`)
        this.enableTaskSleepInterval(!!interval, interval);
        this.setState(configerer.POOLLER_STATE.RUN_INFINITE);
        while (this.isRunning()) {
            await this.#run();
        }
    }

    appendParamInToQueue = (...params) => {
        for (const param of params) {
            this.paramQueue.push(param);
        }
    }

    /** run time by params length, param有可能會是undefined, 要在functionOfAsyncTask判斷 */
    runByParams = async (functionOfAsyncTask, ...params) => {
        if (!_.isFunction(functionOfAsyncTask)) throw new ERROR(4006, `runByParams error, typeof task can't be ${typeof functionOfAsyncTask}`);
        if (!_.isArray(params)) throw new ERROR(4006, `runByParams error, typeof params can't be ${typeof params}`);

        this.appendParamInToQueue(...params)
        this.add(functionOfAsyncTask);
        this.setState(configerer.POOLLER_STATE.RUN_BY_PARAMS);
        this.beforeRun();
        while (this.isRunning() && !_.isEmpty(this.paramQueue)) {
            await this.#run();
        }
    }

    runByEachTaskInBackGround = () => {
        if (this.atomicBgInstance !== undefined)
            clearTimeout(this.atomicBgInstance);
        this.atomicBgInstance = this.runInBackGround(this.runByEachTask);
        /** 因為偷懶, 所以回傳整個instance, 這樣程式碼就只要寫一行
         *  const pool = new InfinitePool(1).runByEachTaskInBackGround();
         * */
        return this;
    }

    runByEachTask = async (tasks = []) => {
        this.id = Util.getRandomHash(3);
        this.beforeRun();
        this.adds(tasks);
        this.setState(configerer.POOLLER_STATE.RUN_BY_EACH_TASK);
        while (this.isRunning()) {
            if (this.getTaskQueueCount() <= 0) {
                this.terminate();
            }
            await this.#run(this.id);
        }
        this.terminate();
    }

    /** run times wound be depend on times, task would by loop and sync in given order
     * runByTimes目前只支援1個worker
     * */
    runByTimes = async (functionOfAsyncTask, times) => {
        this.maxWorker = 1
        this.add(functionOfAsyncTask);
        this.beforeRun();
        this.setState(configerer.POOLLER_STATE.RUN_BY_TIMES);

        for (let index = 0; index < times; index++) {
            await this.#run();
        }
    }

    /** what it means, like a thread run in background,  */
    runInBackGround = (asyncfunc, ...params) => {
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
                Util.appendInfo(`${this.getPoollerLogFormat(`background instance terminated`)} `);
            }
        }, 1);
    }

    getPoollerLogFormat = (msg) => {
        return `POOLLER ID: ${this.getPoolId()}${_.isEmpty(msg) ? '' : ' , '}${msg}`;
    }

    setTaskFailHandler = (listener = (error) => console.log(error.message)) => {
        this.taskFailHandler = listener;
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
    setIgnoreFirstRun(ignore = true) {
        this.ignoreFirstRun = ignore;
    }

    /** 加上一個 被動式啟動, 不然一直while() run, 可能有效能上的問題,現階端只支援RUN_BY_TASK */
    trigger() {
        if (this.isQueuePolling) {
            return;
        }
        if (this.state === configerer.POOLLER_STATE.RUN_BY_EACH_TASK) {
            /** 因為不這樣做, 就會產生 race condition, 會產生出3個runInBackGround instance */
            this.runByEachTaskInBackGround();
            return;
        }
        throw new ERROR(4011, `this.state is ==> ${Util.getItsKeyByValue(configerer.POOLLER_STATE, this.state)}`)
    }

    isQueueFull() {
        return this.executingTaskInQueue.length >= this.maxWorker - 1;
    }

    /** 依照config 把委託任務放置到Queue裡面 */
    async syncTaskDispatcher() {
        const initialTaskShouldNotRun = this.ignoreFirstRun && !this.isFirstTaskCompleted()

        if (initialTaskShouldNotRun || (this.isFirstTaskCompleted() && this.isQueueFull() && this.enableOfTaskSleepByInterval)) {
            const restInInterval = await Util.syncDelayRandom(this.taskSleepInterval.min, this.taskSleepInterval.max)
            if (configerer.MODULE_MSG.SHOW_SUCCEED)
                Util.appendInfo(`${this.getPoollerLogFormat(`Dispatcher 照規矩 睡  ${restInInterval} million-secs 後才能Dispatch AsyncTask`)} `);
            if (!this.isRunning()) {
                Util.appendInfo(`${this.getPoollerLogFormat(` Dispatcher 睡起來之後, 遇到this.isTaskRunning === true, 所以就結束這個Dispatch`)}`);
                return;
            }
        }

        const taskInfo = this.getTaskInfoDependOnPriority();
        if (taskInfo) {
            const promise = this.taskWrapper(taskInfo.task, taskInfo.hash);
            this.removeTaskMapByHash(taskInfo.hash);
            this.appendToExecuteQueue(taskInfo.hash, promise);
        }
    }

    appendToExecuteQueue = (hash, promise) => {
        this.executingTaskInQueue.push({hash: hash, task: promise});
        // Util.appendInfo(`\n\n新增了一個任務${hash} 進入executingTaskQueue ==>`, this.executingTaskInQueue)
    }

    showState = () => {
        Util.appendInfo(this.getPoollerLogFormat(`workerCount: ${this.maxWorker}`));
        Util.appendInfo(this.getPoollerLogFormat(`taskQueue(還在排隊的Task): ${this.getTaskQueueCount()}`));
        Util.appendInfo(this.getPoollerLogFormat(`executingTaskInQueue(正在執行的AsyncTask, 超過workerCount就是bug): ${this.executingTaskInQueue.length}`));
        Util.appendInfo(this.getPoollerLogFormat(`mHashNTaskMap(還沒執行到的AsyncTask reference的暫存區): ${_.size(this.mHashNTaskMap)}`));
    }

    #run = async () => {
        const self = this;

        function get() {
            return self.executingTaskInQueue.map((each) => {
                const task = each.task;
                return task();
            });
        }

        async function execute() {
            /** Util.appendInfo(`\n\n正要執行的隊列`,self.executingTaskInQueue) */
            await Promise.race(get());
        }

        await this.syncTaskDispatcher();

        if (this.executingTaskInQueue.length >= this.maxWorker) {
            await execute();
        } else if (this.getTaskQueueCount() === 0 && this.executingTaskInQueue.length > 0) {
            await execute();
        }

        if (this.executingTaskInQueue.length > this.maxWorker) {
            Util.appendError(`一定是改壞了！！！！ ${this.getPoollerLogFormat(`executing queue ${this.executingTaskInQueue.length} !!`)}`);
        }

        /** 只要完成run 就要把sleepTimeCount歸零
         * this.currentSleepCounts = 0;
         */
    }

    /** taskInfo = { task, hash }*/
    getTaskInfoDependOnPriority = () => {
        for (const prior of configerer.POOLLER_PRIORITY) {
            if (this.assignedTaskQueue[prior].length > 0) {
                switch (this.state) {
                    case configerer.POOLLER_STATE.RUN_BY_EACH_TASK:
                        return this.assignedTaskQueue[prior].shift();
                    case configerer.POOLLER_STATE.RUN_BY_PARAMS:
                    case configerer.POOLLER_STATE.RUN_BY_TIMES:
                    case configerer.POOLLER_STATE.RUN_INFINITE:
                        const taskInfo = this.assignedTaskQueue[prior].shift();
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
        const callbackWrapper = this.hashCallbackMapOfWaiting4Result[hash];
        if (callbackWrapper !== undefined) {
            callbackWrapper(result);
            delete this.hashCallbackMapOfWaiting4Result[hash];
        }
        this.removePromiseFromExecutingQueue(hash);
    }

    removePromiseFromExecutingQueue = (hash) => {
        // console.log(`executingTaskQueue 拿掉了完成的任務 ${hash}`)
        _.remove(this.executingTaskInQueue, (each) => _.isEqual(hash, each.hash));
    }

    /** 如果有function 就代表是一個需要回傳result的task, task在線等的意思*/
    isWait4ResultTask(hash) {
        return this.hashCallbackMapOfWaiting4Result[hash] !== undefined;
    }

    runInfiniteInBackground = (functionOfAsyncTask, interval) => {
        this.runInBackGround(this.runInInfinite, functionOfAsyncTask, interval);
    }

    runByParamInBackground = (functionOfAsyncTask, ...params) => {
        this.runInBackGround(this.runByParams, functionOfAsyncTask, ...params);
        return this;
    }

    runByTimesInBackground = (functionOfAsyncTask, times) => {
        this.runInBackGround(this.runByTimes, functionOfAsyncTask, times);
        return this;
    }

    /** following function are examples **/
    async exampleOfWait4ResultAndRunInBackground() {
        const pool = new InfinitePool(1);
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
        startTimoutTask(35, 1000, 'C', 'high')
        startTimoutTask(500, 3000, 'B', 'low')
        startTimoutTask(3000, 1000, 'D', 'medium')
        startTimoutTask(10000, 2000, 'E', 'medium')


        while (pool.isRunning()) {
            Util.appendInfo('system is running');
            // pool.showState();
            await Util.syncDelay(5000);
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
        pool.setIgnoreFirstRun(true);
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
        const pool = new InfinitePool(2);
        pool.runByParamInBackground(
            async (param) => {
                await Util.syncDelayRandom()
                console.log('param', param);
            }, 'david', 'susan', 'golden', 'weber', 'kevin')

        while (pool.isRunning()) {
            Util.appendInfo('system is running');
            await Util.syncDelay(3000);
            // pool.showState()
        }
    }

    async exampleOfRunByTimesInBackground() {
        const pool = new InfinitePool(1);
        let count = 0;
        pool.runByTimesInBackground(
            async () => {
                await Util.syncDelayRandom()
                count++
                console.log('count:', count);
            }, 10)

        while (pool.isRunning()) {
            Util.appendInfo('system is running');
            await Util.syncDelay(3000);
            // pool.showState()
        }

    }

    async exampleOfRunByParam() {
        const oneToTen = _.range(1, 10);
        const pool = new InfinitePool(1);
        pool.enableTaskSleepInterval(true, 1000);
        await pool.runByParams(oneToTen, async (param) => {
            console.log(param);
        })
    }

    async exampleOfRunByCount() {
        const pool = new InfinitePool(1);
        let time = 0
        await pool.runByTimes(20, async () => {
            await Util.syncDelay(1000);
            time++
            console.log(`execute the ${time} time`)
        })
    }

    async sampleOfInfiniteUnStopLoopingIssue() {
        async function persistTone() {
            try {
                await Util.syncDelay(1000);
                Util.appendInfo(`沒有TONE可以下載了....隨機睡個${await Util.syncDelayRandom(1500, 3500)}`)
                return false;
            } catch (error) {
                Util.appendError(error.message);
            }
        }

        const poollers = []
        const pool = new InfinitePool(6);
        pool.setPoolId('tone fetch');
        pool.setIgnoreFirstRun(false);
        pool.runInfiniteInBackground(persistTone,
            4000);
        pool.setTaskFailHandler((error) => console.log(`5165 error ${error.message}`));
        poollers.push(pool);

        let isRequiredTerminate = false;
        setTimeout(() => {
            isRequiredTerminate = true;
        }, 20000)

        while (true) {
            Util.exeAll(poollers, (each) => each.showState())
            const random = Util.getRandomValue(3000, 8000)
            Util.appendInfo(`主線程還在努中工作中, 休息一毀兒 ${random} mms`);
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
        await new InfinitePool().sampleOfInfiniteUnStopLoopingIssue()
    })();

}


export default InfinitePool;
