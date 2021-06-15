import _ from 'lodash';
import {utiller as Util} from '../index.js';
import {configer} from "configer";
import ERROR from '../exceptioner';
import ERRORs from "../exceptioner/ERRORs";


/**
 *
 Pooller 有以下特點:
 1.task可以設定timeout
 2.queue滿了的可以設定task interval
 3.如果是runByEachTask length, queue裡面沒有task時，可以設定sleeptime, 以及Sleepcounts
 4.task 可以cancelled by hash
 5.runByParams,runByCounts,runInInfinite,runByEachTask
 6.可以設定taskFailHandler, 這樣遇到錯誤就不會停掉poollers
 *
 */
class InfinitePool {

    poolId = Util.getRandomValue(0, 100000000000);
    state = configer.POOLLER_STATE.RUN_BY_EACH_TASK

    /** 用來處理每一個task的timeout, 避免task處理太久卡在Queue裡面 */
    enableOfTaskSleepByInterval = configer.POOLLER_ENABLE_TASK_SLEEP_BY_INTERVAL;
    taskSleepInterval = configer.POOLLER_TASK_OF_INTERVAL_DEFAULT;

    /** 目前queue機制是while(isQueuePolling)  沒任務就睡一下, 有任務就做事情, 發現task有延遲, 就要注意是不是taskInterval*/
    enableOfQueueTerminateSleepCount = configer.POOLLER_ENABLE_QUEUE_TERMINATE_BY_SLEEP_COUNT;
    queueMaxSleepCounts = configer.POOLLER_QUEUE_MAX_SLEEP_COUNTS_DEFAULT;
    intervalOfQueueSleep = configer.POOLLER_QUEUE_TIME_OF_SLEEP_INTERVAL_DEFAULT;
    currentSleepCounts = 0;

    /** 用來處理Task的延遲,假設要偷網頁東西, 不能太頻繁, 要偽裝成手動只能透過這方式, 如果是multi thread, 延遲是針對worker滿載後,再加進去的那一個 */
    enableOfTaskTimeout = configer.POOLLER_ENABLE_TIMEOUT;
    timeOfTaskTimeout = configer.POOLLER_TASK_TIMEOUT_DEFAULT;

    maxWorker;
    ignoreFirstRun = false
    paramQueue = [];
    taskQueue = {};
    /** 裡面放 {high:[], low:[], medium }*/
    isQueuePolling = false;
    /** 目前queue機制是while(isQueuePolling)  沒任務就睡一下, 有任務就做事情, 發現task有延遲, 就要注意是不是taskInterval*/
    dispatchers = [];

    initialTaskKickOff = false;
    executingQueue = [];
    mHashNTaskMap = {};
    /** 為了刪除未執行的task, 但只限於runByTask, 因為下一個run之後, hash就改變了    */

    mHashNPromiseMap = {};
    /** 為了刪除執行完的promise */
    hashCallbackMapOfWaiting4Result = {}

    constructor(maxWorkers = configer.POOLLER_WORKER_DEFAULT) {
        this.maxWorker = maxWorkers;
        for (const prior of configer.POOLLER_PRIORITY) {
            this.taskQueue[prior] = [];
        }
    }

    setTimeout(millionSec = configer.POOLLER_TASK_TIMEOUT_DEFAULT) {
        this.timeOfTaskTimeout = millionSec;
    }

    setPoolId = (id = this.poolId) => {
        this.poolId = id;
    }

    getPoolId = () => {
        return this.poolId;
    }

    enableQueueTerminateBySleepCount(enable = true,
                                     interval = configer.POOLLER_QUEUE_TIME_OF_SLEEP_INTERVAL_DEFAULT
        , times = configer.POOLLER_MAX_SLEEP_COUNTS_DEFAULT) {
        this.enableOfQueueTerminateSleepCount = enable;
        this.queueMaxSleepCounts = times;
        this.intervalOfQueueSleep = interval
    }

    clearCache() {
        this.executingQueue.length = 0;
        this.mHashNTaskMap = {};
        this.taskQueue = {};
    }

    terminate() {
        this.isQueuePolling = false;
        this.currentSleepCounts = 0;
    }

    /** return true if task completed, after 15 secs, force leave */
    stopInBackground = async () => {
        this.isQueuePolling = false;
        while (_.size(this.executingQueue) > 0) {
            await Util.syncDelay(1000);
        }
        if (configer.MODULE_MSG.SHOW_SUCCEED) {
            Util.appendInfo(`this.executingQueue 的長度是 ${_.size(this.executingQueue)}`)
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
    enableTaskInterval(enable = true, interval = configer.POOLLER_TASK_OF_INTERVAL_DEFAULT) {
        this.enableOfTaskSleepByInterval = enable
        this.taskSleepInterval = interval;
    }

    async addTaskAndWait4Result(asyncfunc, priority = 'low') {
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
            const hash = this.add(asyncfunc, priority);
            this.registerHash4Result(hash, callback);
        })
    }

    registerHash4Result(hash, callback) {
        this.hashCallbackMapOfWaiting4Result[hash] = callback;
    }

    getQueueSize = () => {
        let size = 0;
        if (this.state === configer.POOLLER_STATE.RUN_BY_PARAMS) return this.paramQueue.length;

        for (const prior of configer.POOLLER_PRIORITY) {
            size += this.taskQueue[prior].length;
        }

        return size;
    }

    /** 3:low,2:medium,1:top */
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

    taskWrapper = (task, hash) => {
        const self = this;
        const asyncfunc = async () => {

            let taskResult;
            let taskError;

            function handleError(error) {
                if (error.code && error.code === 4010) {
                    Util.appendError(`${self.getPoollerLogFormat(`發生Timeout ${self.timeOfTaskTimeout} mms 了,是內部設計的狀況`)}`);
                } else
                    Util.appendError(`${self.getPoollerLogFormat(`您要處理的task發生 您那方的邏輯問題,...但您的try catch沒有包到,所以跑到這了 ${error.message}`)}`);
                if (self.taskFailHandler === undefined) {
                    throw new ERROR(4008, `${error.message}`);
                }
                self.taskFailHandler(error);
            }

            const timeoutablePromise = new Promise(async (resolve, reject) => {
                const params = this.paramQueue.shift();
                let timeoutHash = '';
                if (self.enableOfTaskTimeout) {
                    timeoutHash = setTimeout(() => {
                        reject(new ERROR(4010, self.getPoollerLogFormat(`TASK HASH:${hash} IS TIMEOUT
                        ${self.timeOfTaskTimeout}} ms ${params ? `,PARAMS IS ${JSON.stringify(params)}` : ''}`)));
                    }, this.timeOfTaskTimeout);
                }
                try {
                    taskResult = await task(params);
                    clearTimeout(timeoutHash);
                } catch (error) {
                    taskError = error;
                    if (!this.isWait4ResultTask(hash))
                        handleError(error);

                } finally {
                    resolve(taskResult);
                }

            }).catch((error) => {
                handleError(error);
            }).finally(() => {
                this.removeResolveOrRejectPromiseByHash(hash, {resolve: taskResult, reject: taskError});
            })
            return timeoutablePromise;
        }
        return asyncfunc;
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
        this.currentSleepCounts = 0;
    }

    afterRun = () => {
        this.clearCache();
    }

    /** interval was the time between tasks when executingQueue is full.
     * run would infinite, in default, intervalOfQueueSleep over 100 times, pooller would shutdown */
    runInInfinite = async (task = [], interval) => {
        this.beforeRun();
        if (_.isNumber(interval)) {
            interval = {min: interval, max: interval}
        }
        if (_.isFunction(task))
            this.add(task)
        else if (_.isArray(task))
            this.adds(task);
        else
            throw new ERROR(4006, `type of task is ===> ${typeof task}`)
        this.enableTaskInterval(interval)
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
        this.runInBackGround(this.runByEachTask);
        return this;
    }

    runByEachTask = async (tasks = []) => {
        this.beforeRun();
        this.adds(tasks);
        this.setState(configer.POOLLER_STATE.RUN_BY_EACH_TASK);
        while (this.isRunning()) {
            if (this.getQueueSize() <= 0) {
                const timer = await Util.syncDelayRandom(this.intervalOfQueueSleep.min, this.intervalOfQueueSleep.max);
                Util.appendInfo(`${this.getPoollerLogFormat(` sleep time ${timer} million-sec, sleepCounts:${this.currentSleepCounts}`)}`);
                if (this.enableOfQueueTerminateSleepCount) {
                    this.currentSleepCounts++;
                    if (this.currentSleepCounts > this.queueMaxSleepCounts) this.terminate();
                    continue;
                }
            }
            await this.#run();
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
            throw new ERROR(9999);
        }

        /**
         * 實在不知道當初為什麼要加這個鬼,以後再重複的地方加上重複的代碼,一定要寫註解
         *this.beforeRun();
         */

        setTimeout(async () => {
            try {
                await _asyncfunc(...params);
            } catch (error) {
                throw new ERROR(4009, {message: `${this.getPoollerLogFormat('')}`}, error);
            } finally {
                Util.appendInfo(`${this.getPoollerLogFormat(`runInBackGround() 完全停止了`)} `);
                this.terminate();
            }
        }, 0);
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
            this.isQueuePolling = true;
            this.runInBackGround(this.runByEachTask);
            return;
        }
        throw new ERROR(4011, `this.state is ==> ${Util.getItsKeyByValue(configer.POOLLER_STATE, this.state)}`)
    }

    isQueueFull() {
        return this.executingQueue.length >= this.maxWorker - 1;
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
            const promise = this.taskWrapper(taskInfo.task, taskInfo.hash)();
            this.removeTaskMapByHash(taskInfo.hash);
            this.appendHashPromiseMap(taskInfo.hash, promise);
            this.appendToExecuteQueue(promise);
        }
    }

    appendToExecuteQueue(promise) {
        this.executingQueue.push(promise);
    }

    showState = () => {
        Util.appendInfo(this.getPoollerLogFormat(`executingQueue: ${_.size(this.executingQueue)}`));
        Util.appendInfo(this.getPoollerLogFormat(`mHashNTaskMap: ${_.size(this.mHashNTaskMap)}`));
        Util.appendInfo(this.getPoollerLogFormat(`mHashNPromiseMap: ${_.size(this.mHashNPromiseMap)}`));
    }

    #run = async () => {
        await this.syncTaskDispatcher();

        if (this.executingQueue.length >= this.maxWorker) {
            await Promise.race(this.executingQueue);
        } else if (this.getQueueSize() === 0 && this.executingQueue.length > 0) {
            await Promise.race(this.executingQueue);
        }

        if (this.executingQueue.length > this.maxWorker) {
            Util.appendError(`一定是改壞了！！！！ ${this.getPoollerLogFormat(`executing queue ${this.executingQueue.length} !!`)}`);
        }

        /** 只要完成run 就要把sleepTimeCount歸零 */
        this.currentSleepCounts = 0;
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
        this.executingQueue.splice(this.executingQueue.indexOf(this.getPromiseByHash(hash)), 1);
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
}

if (configer.DEBUG_MODE) {
    (async () => {

        // const pooller = new InfinitePool(1);
        // pooller.runInBackGround(pooller.runByEachTask,
        //     _.range(20).map((each) => Util.asyncUnitTaskFunction()));
        //
        // while (pooller.isRunning()) {
        //     await Util.syncDelayRandom();
        // }
        //
        // self.setTaskFailHandler((error) => {
        //     console.error(`TASK ERROR: ${error.message}`);
        // })
        // const tasks = [...Array(4)].map((value, index) => Util.asyncUnitTaskFunction(Util.getRandomValue(1000, 5000)
        //     , index
        //
        // (param) => {
        //     if (param === 4) return true
        // }
        // ))
        // self.setTimeout(3000);
        // await self.runByParams([1, 2, 3, 4, 5, 6, 7, 8, 9, 10], tasks[0])
        // await self.runByTimes(4,tasks);
        // self.cleanTaskInterval();
        // self.adds(tasks);
        // self.runInBackGround(self.runInInfinite);
        // setTimeout(() => {
        // }, 15000,);
        //
        // while (self.isRunning()) {
        //     await Util.syncDelayRandom(2000, 5000);
        // }
        // await new InfinitePool(3).runInInfinite([]);


        // function getNumber(num) {
        //     return async () => {
        //         await Util.syncDelay()
        //         return num;
        //     }
        //
        // }
        //
        // setTimeout(async () => {
        //     try {
        //         const a = await pool.addTaskAndWait4Result(getNumber(4), 'medium');
        //         console.log('answser => ', a);
        //
        //     } catch (error) {
        //         console.log(error);
        //     }
        //
        // }, 3000);
        //
        // setTimeout(async () => {
        //     try {
        //         const a = await pool.addTaskAndWait4Result(getNumber(3), 'high');
        //         console.log('answser => ', a);
        //
        //     } catch (error) {
        //         console.log(error);
        //     }
        //
        // }, 3000)
        //
        // setTimeout(async () => {
        //     try {
        //         const a = await pool.addTaskAndWait4Result(getNumber(2));
        //         console.log('answser => ', a);
        //
        //     } catch (error) {
        //         console.log(error);
        //     }
        //
        // }, 3000)
        //
        // setTimeout(async () => {
        //     try {
        //         const a = await pool.addTaskAndWait4Result(getNumber(1));
        //         console.log('answser => ', a);
        //
        //     } catch (error) {
        //         console.log(error);
        //     }
        //
        // }, 3000)
        //
        //
        // setTimeout(async () => {
        //     try {
        //         const a = await pool.addTaskAndWait4Result(getNumber(8000));
        //         console.log('answser => ', a);
        //
        //     } catch (error) {
        //         console.log(error);
        //     }
        //
        // }, 8000)
        //
        //
        // setTimeout(async () => {
        //     try {
        //         const a = await pool.addTaskAndWait4Result(getNumber( 12000));
        //         console.log('answser => ', a);
        //
        //     } catch (error) {
        //         console.log(error);
        //     }
        //
        // }, 12000)
        //
        // setTimeout(async () => {
        //     try {
        //         const a = await pool.addTaskAndWait4Result(getNumber( 30000));
        //         console.log('answser => ', a);
        //
        //     } catch (error) {
        //         console.log(error);
        //     }
        //
        // }, 30000)
        //
        //
        // const pool = new InfinitePool(1).runByEachTaskInBackGround();
        // pool.enableQueueTerminateBySleepCount(true,{min:20,max:100},10)
        //
        // while (pool.isRunning()) {
        //     console.log('pool is running');
        //     await Util.syncDelay(100000);
        // }
        //
        // while (true) {
        //     console.log('system is running');
        //     await Util.syncDelay(100000);
        // }
    })();

}


export default InfinitePool;
