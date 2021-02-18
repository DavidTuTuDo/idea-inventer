import _ from 'lodash';
import Util from '../util';
import GlobalConfig from "../GlobalConfig";
import ERROR from '../exception';

/**
 *
 Pooller 有以下特點:
 1.task可以設定timeout
 2.queue滿了的可以設定task interval
 3.如果是runByEachTask length, queue裡面沒有task時，可以設定sleeptime, 以及Sleepcounts
 4.task 可以cancelled by  hash
 5.runByParams,runByCounts,runInInfinite,runByEachTask
 6.可以設定taskFailHandler, 這樣遇到錯誤就不會停掉poollers
 *
 */
class InfinitePool {


    constructor(maxWorkers = GlobalConfig.POOLLER_WORKER_DEFAULT) {
        this.poolId = Util.getRandomValue(0, 100000000000);
        this.state = GlobalConfig.POOLLER_STATE.RUN_BY_EACH_TASK
        this.timeOfSleep = GlobalConfig.POOLLER_TIME_OF_SLEEP_RANGE_DEFAULT;
        this.taskInterval = GlobalConfig.POOLLER_TASK_INTERVAL_DEFAULT;
        this.maxSleepCounts = GlobalConfig.POOLLER_MAX_SLEEP_COUNTS_DEFAULT;
        this.timeOfTaskTimeout = GlobalConfig.POOLLER_TASK_TIMEOUT_DEFAULT;
        this.maxWorker = maxWorkers;

        this.paramQueue = [];
        this.taskQueue = {};
        this.currrentSleepCounts = 0;
        this.isTaskRunning = false;
        this.dispatchers = [];
        for (const prior of GlobalConfig.POOLLER_PRIORITY) {
            this.taskQueue[prior] = [];
        }
        this.initialTaskKickOff = false;
        this.executingQueue = [];
        this.mHashNTaskMap = {};
        /** 為了刪除未執行的task, 但只限於runByTask, 因為下一個run之後, hash就改變了    */

        this.mHashNPromiseMap = {}; /** 為了刪除執行完的promise */
    }

    setTimeout(millionSec = GlobalConfig.POOLLER_TASK_TIMEOUT_DEFAULT) {
        this.timeOfTaskTimeout = millionSec;
    }

    setPoolId = (id = this.poolId) => {
        this.poolId = id;
    }

    getPoolId = () => {
        return this.poolId;
    }

    setMaxSleepCounts(times = GlobalConfig.POOLLER_MAX_SLEEP_COUNTS_DEFAULT) {
        this.maxSleepCounts = times;
    }

    clearCache() {
        this.executingQueue.length = 0;
        this.mHashNTaskMap = {};
        this.taskQueue = {};
    }

    stop() {
        this.isTaskRunning = false;
    }

    /** return true if task completed, after 15 secs, force leave */
    stopInBackground = async () => {
        this.isTaskRunning = false;
        while (_.size(this.executingQueue) > 0) {
            await Util.syncDelay(1000);
        }
        if (GlobalConfig.MODULE_MSG.SHOW_SUCCEED) {
            Util.appendInfo(`this.executingQueue 的長度是 ${_.size(this.executingQueue)}`)
        }
        return true;
    }

    isRunning = () => {
        return this.isTaskRunning;
    }

    setWorker(counts) {
        this.maxWorker = counts;
    }

    cleanTaskInterval() {
        this.taskInterval = {min: 0, max: 0};
    }

    /**
     * interval:{min: 800, max: 1000}
     *
     * */
    setTaskInterval(interval = GlobalConfig.POOLLER_TASK_INTERVAL_DEFAULT) {
        this.taskInterval = interval;
    }

    getQueueSize = () => {
        let size = 0;
        if (this.state === GlobalConfig.POOLLER_STATE.RUN_BY_PARAMS) return this.paramQueue.length;

        for (const prior of GlobalConfig.POOLLER_PRIORITY) {
            size += this.taskQueue[prior].length;
        }

        return size;
    }

    /** 3:low,2:medium,1:top */
    /** add the task into taskQueue, return task key,once you want to remove it */
    add = (task, priority = 'low') => {
        if (typeof task === "function") {
            if (GlobalConfig.POOLLER_PRIORITY.indexOf(priority) < 0) {
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
        const asyncfunc = async () => {

            const self = this;
            let taskResult;
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
                if (GlobalConfig.POOLLER_ENABLE_TIMEOUT)
                    timeoutHash = setTimeout(() => {
                        reject(new ERROR(4010, self.getPoollerLogFormat(`TASK HASH:${hash} IS TIMEOUT
                        ${self.timeOfTaskTimeout}} ms ${params ? `,PARAMS IS ${JSON.stringify(params)}` : ''}`)));
                    }, this.timeOfTaskTimeout);

                try {
                    taskResult = await task(params);
                    clearTimeout(timeoutHash);
                } catch (error) {
                    handleError(error);
                } finally {
                    resolve(taskResult);
                }

            }).catch((error) => {
                handleError(error);
            }).finally(() => {
                this.removeResolveOrRejectPromiseByHash(hash);
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
            for (const prior of GlobalConfig.POOLLER_PRIORITY) {
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
        this.isTaskRunning = true;
    }

    afterRun = () => {
        this.clearCache();
    }

    /** interval was the time between tasks when executingQueue is full.
     * run would infinite, in default, timeOfSleep over 100 times, pooller would shutdown */
    runInInfinite = async (task = [], interval) => {
        if (_.isNumber(interval)) {
            interval = {min: interval, max: interval}
        }
        if (_.isFunction(task))
            this.add(task)
        else if (_.isArray(task))
            this.adds(task);
        else
            throw new ERROR(4006, `type of task is ===> ${typeof task}`)
        this.beforeRun();
        this.setTaskInterval(interval)
        this.setState(GlobalConfig.POOLLER_STATE.RUN_INFINITE);

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
        this.setState(GlobalConfig.POOLLER_STATE.RUN_BY_PARAMS);
        this.beforeRun();
        while (this.isRunning() && !_.isEmpty(this.paramQueue)) {
            await this.#run();
        }
    }

    runByEachTask = async (tasks = []) => {
        this.beforeRun();
        this.currrentSleepCounts = 0;
        this.adds(tasks);
        this.setState(GlobalConfig.POOLLER_STATE.RUN_BY_EACH_TASK);
        while (this.isRunning()) {
            if (this.getQueueSize() <= 0) {
                const timer = await Util.syncDelayRandom(this.timeOfSleep.min, this.timeOfSleep.max);
                Util.appendFile(GlobalConfig.PATH_INFO_LOG, `${this.getPoollerLogFormat(` sleep time ${timer} million-sec`)}`);
                if (this.currrentSleepCounts > this.maxSleepCounts) this.stop();
                continue;
            }
            await this.#run();
            this.currrentSleepCounts += 0;
        }
    }

    /** run times wound be depend on times, task would by loop and sync in given order */
    runByTimes = async (times, tasks = []) => {
        this.adds(tasks);
        this.beforeRun();
        this.setState(GlobalConfig.POOLLER_STATE.RUN_BY_TIMES);

        for (let index = 0; index < times; index++) {
            await this.#run();
        }
    }

    /** what it means, like a thread run in background,  */
    runInBackGround = (_asyncfunc, ...params) => {
        if (!(typeof _asyncfunc === "function")) {
            throw new ERROR(9999);
        }
        this.beforeRun();
        setTimeout(async () => {
            try {
                await _asyncfunc(...params);
            } catch (error) {
                throw new ERROR(4009, {message: `${this.getPoollerLogFormat('')}`}, error);
            } finally {
                Util.appendInfo(`${this.getPoollerLogFormat(`runInBackGround() 完全停止了`)} `);
                this.stop();
            }
        }, 0);
    }

    getPoollerLogFormat = (msg) => {
        return `POOLLER ID: ${this.getPoolId()}${_.isEmpty(msg) ? '' : ' , '}${msg}`;
    }

    setTaskFailHandler = (listener) => {
        this.taskFailHandler = listener;
    }

    /** run by how many task in queue, FIFO, if task completed, pool with timeOfSleep for a while
     * ,after this.maxSleepCounts, pooller would closed */

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

    initialTaskDone() {
        if (!this.initialTaskKickOff) {
            this.initialTaskKickOff = true;
            return false
        }
        return this.initialTaskKickOff;
    }

    async syncTaskDispatcher() {
        if (this.initialTaskDone() && this.executingQueue.length >= this.maxWorker - 1) {
            const restInInterval = await Util.syncDelayRandom(this.taskInterval.min, this.taskInterval.max)
            if (GlobalConfig.MODULE_MSG.SHOW_SUCCEED)
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
            console.error(`一定是改壞了！！！！ ${this.getPoollerLogFormat(`executing queue ${this.executingQueue.length} !!`)}`);
        }
    }

    /** taskInfo = { task, hash }*/
    getTaskInfoDependOnPriority = () => {
        for (const prior of GlobalConfig.POOLLER_PRIORITY) {
            if (this.taskQueue[prior].length > 0) {
                switch (this.state) {
                    case GlobalConfig.POOLLER_STATE.RUN_BY_EACH_TASK:
                        return this.taskQueue[prior].shift();
                    case GlobalConfig.POOLLER_STATE.RUN_BY_PARAMS:
                    case GlobalConfig.POOLLER_STATE.RUN_BY_TIMES:
                    case GlobalConfig.POOLLER_STATE.RUN_INFINITE:
                        const taskInfo = this.taskQueue[prior].shift();


                        this.add(taskInfo.task);
                        return taskInfo;
                    default:
                        throw new ERROR(4005, `this.state ==> ${this.state}`)
                }
            }
        }
        throw new ERROR(4007);
    }

    removeResolveOrRejectPromiseByHash = (hash) => {
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

}


if (GlobalConfig.DEBUG_MODE) {
    (async () => {
        const self = new InfinitePool(5);

        self.setTaskFailHandler((error) => {
            console.error(`TASK ERROR: ${error.message}`);
        })
        const tasks = [...Array(4)].map((value, index) => Util.asyncUnitTaskFunction(Util.getRandomValue(1000, 5000)
            , index

            // (param) => {
            //     if (param === 4) return true
            // }
        ))
        // self.setTimeout(3000);
        // await self.runByParams([1, 2, 3, 4, 5, 6, 7, 8, 9, 10], tasks[0])
        // await self.runByTimes(4,tasks);
        // self.cleanTaskInterval();
        self.adds(tasks);
        self.runInBackGround(self.runInInfinite);
        setTimeout(() => {
        }, 15000,);

        while (self.isRunning()) {
            await Util.syncDelayRandom(2000, 5000);
        }

    })();

}


export default InfinitePool;
