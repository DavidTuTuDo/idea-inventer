import _ from 'lodash';
import {utiller as Util} from '../index.js';
import {configer} from "configer";
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

    state = configer.POOLLER_STATE.RUN_BY_EACH_TASK

    /** 用來處理Task的延遲,假設要偷網頁東西, 不能太頻繁, 要偽裝成手動只能透過這方式, 如果是multi thread, 延遲是針對worker滿載後,再加進去的那一個 */
    enableOfTaskSleepByInterval = configer.POOLLER_ENABLE_TASK_SLEEP_BY_INTERVAL;
    taskSleepInterval = configer.POOLLER_TASK_OF_INTERVAL_DEFAULT;

    /** 用來處理每一個task的timeout, 避免task處理太久卡在Queue裡面 */
    enableOfTaskTimeout = configer.POOLLER_ENABLE_TIMEOUT;
    timeOfTaskTimeout = configer.POOLLER_TASK_TIMEOUT_DEFAULT;

    maxWorker;
    ignoreFirstRun = false
    paramQueue = [];


    /** 裡面放 {high:[], low:[], medium }*/
    taskQueue = {};

    /** 裡面放準備要執行的Task, 這邊的task就沒辦法remove了 */
    executingTaskQueue = [];

    isQueuePolling = false;
    /** 目前queue機制是while(isQueuePolling)  沒任務就睡一下, 有任務就做事情, 發現task有延遲, 就要注意是不是taskInterval*/
    dispatchers = [];

    initialTaskKickOff = false;
    mHashNTaskMap = {};
    /** 為了刪除未執行的task, 但只限於runByTask, 因為下一個run之後, hash就改變了    */

    mHashNPromiseMap = {};
    /** 為了刪除執行完的promise */
    hashCallbackMapOfWaiting4Result = {}
    poolId = ``;

    constructor(maxWorkers = configer.POOLLER_WORKER_DEFAULT, name = Util.getRandomValue(0, 100000000000)) {
        this.maxWorker = maxWorkers;
        this.setPoolId(_.toString(name));
        for (const prior of configer.POOLLER_PRIORITY) {
            this.taskQueue[prior] = [];
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
                                     interval = configer.POOLLER_QUEUE_TIME_OF_SLEEP_INTERVAL_DEFAULT
        , times = configer.POOLLER_MAX_SLEEP_COUNTS_DEFAULT) {
        this.enableOfQueueTerminateSleepCount = enable;
        this.queueMaxSleepCounts = times;
        this.intervalOfQueueSleep = interval
    }

    clearCache() {
        this.executingTaskQueue.length = 0;
        this.mHashNTaskMap = {};
        this.taskQueue = {};
    }

    terminate() {
        this.isQueuePolling = false;
    }

    /** return true if task completed, after 15 secs, force leave */
    stopInBackground = async () => {
        this.isQueuePolling = false;
        while (_.size(this.executingTaskQueue) > 0) {
            await Util.syncDelay(1000);
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
    enableTaskSleepInterval(enable = true, interval = configer.POOLLER_TASK_OF_INTERVAL_DEFAULT) {

        this.enableOfTaskSleepByInterval = enable
        if (_.isNumber(interval)) {
            interval = {min: interval, max: interval};
        }
        this.taskSleepInterval = interval;
    }

    enableTaskTimeout(enable = true, millionSec = configer.POOLLER_TASK_TIMEOUT_DEFAULT) {
        this.enableOfTaskTimeout = enable;
        this.timeOfTaskTimeout = millionSec;
    }

    async addTaskAndWait4Result(asyncTask, priority = 'low', taskName = 'noName') {
        this.trigger();
        return new Promise((resolve, reject) => {
            const callback = (result) => {
                if (result.resolve) {
                    resolve(result.resolve);
                }

                if (result.reject) {
                    reject(result.reject)
                }
            }
            const hash = this.add(asyncTask, priority);
            this.registerHash4Result(hash, callback);
        })
    }

    registerHash4Result(hash, callback) {
        this.hashCallbackMapOfWaiting4Result[hash] = callback;
    }

    getTaskQueueCount = () => {
        let size = 0;
        if (this.state === configer.POOLLER_STATE.RUN_BY_PARAMS) return this.paramQueue.length;

        for (const prior of configer.POOLLER_PRIORITY) {
            size += this.taskQueue[prior].length;
        }

        return size;
    }

    /** 3:low,2:medium,1:high */
    /** add the task into taskQueue, return task key,once you want to remove it */
    add = (task, priority = 'low') => {
        if (typeof task === "function") {
            if (configer.POOLLER_PRIORITY.indexOf(priority) < 0) {
                throw new ERROR(4001, `priority can't be ${priority}`);
            }
            const hash = Util.getRandomHash();
            const taskInfo = {task, hash};
            this.appendHashTaskMap(taskInfo);
            this.taskQueue[priority].push(taskInfo);
            return hash;
        } else {
            throw new ERROR(4002, `task can't be ${typeof task}`);
        }
    }

    taskWrapper = (task, hash) => () => {
        const self = this;
        let timeoutHash = '';
        let taskResult;
        let taskError;
        let param = self.paramQueue.shift();

        return new Promise((resolve, reject) => {
            if (self.enableOfTaskTimeout) {
                timeoutHash = setTimeout(() => {
                    try {
                        throw new ERROR(4010, self.getPoollerLogFormat(`TASK HASH:${hash} IS TIMEOUT ${self.timeOfTaskTimeout}} ms ${param ? `,PARAMS IS ${JSON.stringify(param)}` : ''}`))
                    } catch (error) {
                        reject(error);
                    }
                }, self.timeOfTaskTimeout);
            }
            /** 真正的任務是從這裡開始 */
            console.log(self.getPoollerLogFormat('task executing'));
            task(param).then((result) => {
                // console.log(self.getPoollerLogFormat('task get result'));
                taskResult = result
                }
            ).catch((error) => {
                    // console.error(self.getPoollerLogFormat('inner error'), error);
                    taskError = error
                }
            ).finally(() => {
                clearTimeout(timeoutHash);
                /** 要記得 resolve, reject 在這裡代表的是放在executingQueue裡面的promise, reject,resolve其中一個必須觸發, executingQueue才不會堵塞
                 ** 而任務需要的task是透過 removeResolveOrRejectPromiseByHash() */
                // console.info(self.getPoollerLogFormat(self.getPoollerLogFormat('inner finally')));
                resolve(`${hash} done`);
            })
        }).catch(error => {
            // console.error(self.getPoollerLogFormat(self.getPoollerLogFormat('outer error')), error);
            taskError = error;
        }).finally(() => {
            // console.info(self.getPoollerLogFormat(self.getPoollerLogFormat('outer finally')));
            self.removeResolveOrRejectPromiseByHash(hash, {resolve: taskResult, reject: taskError});
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
            for (const prior of configer.POOLLER_PRIORITY) {
                const _index = _.indexOf(this.taskQueue[prior], taskInfo);
                if (_index > 0) {
                    this.taskQueue[prior].splice(_index, 1);
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

    /** interval was the time between tasks when executingTaskQueue is full.
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
        this.setState(configer.POOLLER_STATE.RUN_INFINITE);
        while (this.isRunning()) {
            await this.#run();
        }
    }

    /** run time by params length */
    runByParams = async (params = [], task = undefined) => {
        if (!_.isFunction(task)) throw new ERROR(4006, `runByParams error, typeof task can't be ${typeof task}`);
        if (!_.isArray(params)) throw new ERROR(4006, `runByParams error, typeof params can't be ${typeof params}`);

        for (const param of params) {
            this.paramQueue.push(param);
        }

        this.add(task);
        this.setState(configer.POOLLER_STATE.RUN_BY_PARAMS);
        this.beforeRun();
        while (this.isRunning() && !_.isEmpty(this.paramQueue)) {
            await this.#run();
        }
    }

    runByEachTaskInBackGround() {
        if (this.atomicBgInstance !== undefined) ;
        clearTimeout(this.atomicBgInstance);
        this.atomicBgInstance = this.runInBackGround(this.runByEachTask);
        return this;
    }

    runByEachTask = async (tasks = []) => {
        this.id = Util.getRandomHash(3);
        this.beforeRun();
        this.adds(tasks);
        this.setState(configer.POOLLER_STATE.RUN_BY_EACH_TASK);
        while (this.isRunning()) {
            if (this.getTaskQueueCount() <= 0) {
                this.terminate();
            }
            await this.#run(this.id);
        }
        this.terminate();
    }

    /** run times wound be depend on times, task would by loop and sync in given order */
    runByTimes = async (times, tasks = []) => {
        this.adds(tasks);
        this.beforeRun();
        this.setState(configer.POOLLER_STATE.RUN_BY_TIMES);

        for (let index = 0; index < times; index++) {
            await this.#run();
        }
    }

    /** what it means, like a thread run in background,  */
    runInBackGround = (_asyncfunc, ...params) => {
        if (!(typeof _asyncfunc === "function")) {
            throw new ERROR(4002, `_asyncfunc can't be ${typeof _asyncfunc}`);
        }

        return setTimeout(async () => {
            try {
                await _asyncfunc(...params);
            } catch (error) {
                throw new ERROR(4009, {message: `${this.getPoollerLogFormat('')}`}, error);
            } finally {
                this.terminate();
                Util.appendInfo(`${this.getPoollerLogFormat(`background gc after terminated`)} `);
            }
        }, 1);
    }

    getPoollerLogFormat = (msg) => {
        return `POOLLER ID: ${this.getPoolId()}${_.isEmpty(msg) ? '' : ' , '}${msg}`;
    }

    setTaskFailHandler = (listener) => {
        this.taskFailHandler = listener;
    }

    /** run by how many task in queue, FIFO, if task completed, pool with intervalOfQueueSleep for a while
     * ,after this.queueMaxSleepCounts, pooller would closed */

    setState(_state) {
        this.state = _state;
    }

    touchTaskDispatcher = () => {
        const dispatcher = setTimeout(async () => {
            await this.syncTaskDispatcher();
            this.dispatchers.splice(this.dispatchers.indexOf(dispatcher), 1);
        }, 0);
        this.dispatchers.push(dispatcher);
    }

    firstTaskDone() {
        if (!this.initialTaskKickOff) {
            this.initialTaskKickOff = true;
            return false
        }
        return this.initialTaskKickOff;
    }

    /** 如果設定interval, 第一個run不要執行的話,就設定true */
    setIgnoreFirstRun() {
        this.ignoreFirstRun = true;
    }

    /** 加上一個 被動式啟動, 不然一直while() run, 可能有效能上的問題,現階端只支援RUN_BY_TASK */
    trigger() {
        if (this.isQueuePolling) {
            return;
        }
        if (this.state === configer.POOLLER_STATE.RUN_BY_EACH_TASK) {
            /** 因為不這樣做, 就會產生 race condition, 會產生出3個runInGround instance */
            this.runByEachTaskInBackGround();
            return;
        }
        throw new ERROR(4011, `this.state is ==> ${Util.getItsKeyByValue(configer.POOLLER_STATE, this.state)}`)
    }

    isQueueFull() {
        return this.executingTaskQueue.length >= this.maxWorker - 1;
    }

    async syncTaskDispatcher() {
        const initialTaskShouldNotRun = this.ignoreFirstRun && !this.firstTaskDone()

        if (initialTaskShouldNotRun || (this.firstTaskDone() && this.isQueueFull() && this.enableOfTaskSleepByInterval)) {
            const restInInterval = await Util.syncDelayRandom(this.taskSleepInterval.min, this.taskSleepInterval.max)
            if (configer.MODULE_MSG.SHOW_SUCCEED)
                Util.appendInfo(`${this.getPoollerLogFormat(`Dispatcher 照規矩 睡  ${restInInterval} million-secs 後才能Dispatch Task`)} `);
            if (!this.isRunning()) {
                Util.appendInfo(`${this.getPoollerLogFormat(` Dispatcher 睡起來之後, 遇到this.isTaskRunning === true, 所以就結束這個Dispatch`)}`);
                return;
            }
        }

        const taskInfo = this.getTaskInfoDependOnPriority();
        if (taskInfo) {
            const promise = this.taskWrapper(taskInfo.task, taskInfo.hash);
            this.removeTaskMapByHash(taskInfo.hash);
            this.appendHashPromiseMap(taskInfo.hash, promise);
            this.appendToExecuteQueue(promise);
        }
    }

    appendToExecuteQueue(promise) {
        this.executingTaskQueue.push(promise);
    }

    showState = () => {
        Util.appendInfo(this.getPoollerLogFormat(`workerCount: ${this.maxWorker}`));
        Util.appendInfo(this.getPoollerLogFormat(`taskQueue: ${this.getTaskQueueCount()}`));
        Util.appendInfo(this.getPoollerLogFormat(`executingQueue: ${this.executingTaskQueue.length}`));
        Util.appendInfo(this.getPoollerLogFormat(`mHashNTaskMap: ${_.size(this.mHashNTaskMap)}`));
        Util.appendInfo(this.getPoollerLogFormat(`mHashNPromiseMap: ${_.size(this.mHashNPromiseMap)}`));
    }

    #run = async () => {
        await this.syncTaskDispatcher();

        if (this.executingTaskQueue.length >= this.maxWorker) {
            await Promise.race(this.executingTaskQueue.map((asyncTask) => asyncTask()));
        } else if (this.getTaskQueueCount() === 0 && this.executingTaskQueue.length > 0) {
            await Promise.race(this.executingTaskQueue.map((asyncTask) => asyncTask()));
        }

        if (this.executingTaskQueue.length > this.maxWorker) {
            Util.appendError(`一定是改壞了！！！！ ${this.getPoollerLogFormat(`executing queue ${this.executingTaskQueue.length} !!`)}`);
        }

        /** 只要完成run 就要把sleepTimeCount歸零
         * this.currentSleepCounts = 0;
         */
    }

    /** taskInfo = { task, hash }*/
    getTaskInfoDependOnPriority = () => {
        for (const prior of configer.POOLLER_PRIORITY) {
            if (this.taskQueue[prior].length > 0) {
                switch (this.state) {
                    case configer.POOLLER_STATE.RUN_BY_EACH_TASK:
                        return this.taskQueue[prior].shift();
                    case configer.POOLLER_STATE.RUN_BY_PARAMS:
                    case configer.POOLLER_STATE.RUN_BY_TIMES:
                    case configer.POOLLER_STATE.RUN_INFINITE:
                        const taskInfo = this.taskQueue[prior].shift();
                        this.add(taskInfo.task);
                        return taskInfo;
                    default:
                        throw new ERROR(4005, `this.state ==> ${this.state}`)
                }
            }
        }
        if (!_.isEqual(this.state, configer.POOLLER_STATE.RUN_BY_EACH_TASK))
            throw new ERROR(4007);
    }

    removeResolveOrRejectPromiseByHash = (hash, result) => {
        const callback = this.hashCallbackMapOfWaiting4Result[hash];
        if (callback !== undefined) {
            callback(result);
        }

        delete this.hashCallbackMapOfWaiting4Result[hash];

        this.removePromiseFromExecutingQueue(hash);
        this.removeCompletedPromiseFromMapByHash(hash);
    }

    removePromiseFromExecutingQueue(hash) {
        this.executingTaskQueue.splice(this.executingTaskQueue.indexOf(this.getPromiseByHash(hash)), 1);
    }

    removeCompletedPromiseFromMapByHash = (hash) => {
        delete this.mHashNPromiseMap[hash];
    }

    appendHashPromiseMap(hash, promise) {
        this.mHashNPromiseMap[hash] = promise;
    }

    getPromiseByHash(hash) {
        return this.mHashNPromiseMap[hash];
    }

    /** 如果有function 就代表是一個需要回傳result的task, task在線等的意思*/
    isWait4ResultTask(hash) {
        return this.hashCallbackMapOfWaiting4Result[hash]
    }

    async exampleOfRunInBackground() {
        const pool = new InfinitePool(1).runByEachTaskInBackGround();
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
                    Util.appendInfo('answser => ', printSign);
                } catch (error) {
                    Util.appendError(error.message);
                }
            }, delayTime);
        }

        startTimoutTask(0, 1000, 'A', 'low')
        startTimoutTask(35, 1000, 'C', 'high')
        startTimoutTask(500, 3000, 'B', 'low')
        startTimoutTask(3000, 1000, 'D', 'medium')

        while (true) {
            Util.appendInfo('system is running');
            await Util.syncDelay(100000);
        }
    }

    async exampleOfRunInfinte() {
        await new InfinitePool(2).runInInfinite(async () => {
            console.log('1000');
        }, 1000)
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
        await pool.runByTimes(20, [async () => {
            await Util.syncDelay(1000);
            time++
            console.log(`execute the ${time} time`)
        }])
    }
}

if (configer.DEBUG_MODE) {
    (async () => {
        await new InfinitePool().exampleOfRunByCount();
    })();

}


export default InfinitePool;
