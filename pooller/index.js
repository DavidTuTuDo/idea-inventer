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
        this.mHashNTaskMap = {};
        this.queue = {};
        this.currrentSleepCounts = 0;
        this.isTaskRunning = false;

        for (const prior of GlobalConfig.POOLLER_PRIORITY) {
            this.queue[prior] = [];
        }

        this.executingQueue = [];
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
        this.queue = {};
    }

    stop() {
        this.isTaskRunning = false;
    }

    /** return true if task completed, after 15 secs, force leave */
    stopInBackground = async () => {
        let times = 0;
        this.isTaskRunning = false;
        while (this.executingQueue.length > 0) {

            await Util.syncDelay(1000);
            // times += 1;
            // if (times > 30) {
            //     return false;
            // }

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
        for (const prior of GlobalConfig.POOLLER_PRIORITY) {
            size += this.queue[prior].length;
        }
        return size;
    }

    /** 3:low,2:medium,1:top */
    /** return task key,once you want to removeTask it */
    add = (task, priority = 'low') => {
        if (typeof task === "function") {
            if (GlobalConfig.POOLLER_PRIORITY.indexOf(priority) < 0) {
                throw new ERROR(4001, `priority can't be ${priority}`);
            }
            const hash = Util.getRandomHash();
            const wrapper = this.taskWrapper(task, hash);
            const taskInfo = {task: wrapper, hash};
            this.appendHashTaskMap(taskInfo);
            this.queue[priority].push(taskInfo);
            return hash;
        } else {
            throw new ERROR(4002, `task can't be ${typeof task}`);
        }
    }

    taskWrapper = (task, hash) => {
        const func = async (params) => {
            if (this.maxWorker > 1 && this.executingQueue.length >= this.maxWorker - 1) {
                const restInInterval = await Util.syncDelayRandom(this.taskInterval.min, this.taskInterval.max)
                if (GlobalConfig.MODULE_MSG.SHOW_SUCCEED)
                    Util.appendInfo(`${this.getPoollerLogFormat(`的 worker 的周間休息了  ${restInInterval} million-secs`)} `);
                if (!this.isRunning()) {
                    Util.appendInfo(`${this.getPoollerLogFormat(`睡起來之後, 遇到this.isTaskRunning === true, 所以就結束這個task`)}`);
                    return;
                }
            }
            let timeout = false;
            let taskDone = false;
            const timeoutablePromise = new Promise(async (resolve, reject) => {
                setTimeout(() => {
                    if (!taskDone) {
                        timeout = true;
                        reject(new ERROR(4010, this.getPoollerLogFormat(`TASK HASH:${hash} IS TIMEOUT
                        ${this.timeOfTaskTimeout}} ms ${params ? `,PARAMS IS ${JSON.stringify(params)}` : ''}`)));
                    }
                }, this.timeOfTaskTimeout);
                const result = await task(params);
                taskDone = true;
                if (!timeout)
                    resolve(result);
            })
            await timeoutablePromise;
        }
        return func;
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


    removeCompletedTaskMapByHash = (hash) => {
        delete this.mHashNTaskMap[hash];
    }

    appendHashTaskMap(taskInfo) {
        this.mHashNTaskMap[taskInfo.hash] = taskInfo;
    }

    getTaskInfoByHash(hash) {
        return this.mHashNTaskMap[hash];
    }

    /**
     * removeTask task in queue by its hash, hash was created when add to queue
     *
     * method will return true when succeed delete
     * */
    removeTask(hash) {
        let taskInfo = this.getTaskInfoByHash(hash);
        if (taskInfo) {
            for (const prior of GlobalConfig.POOLLER_PRIORITY) {
                const _index = _.indexOf(this.queue[prior], taskInfo);
                if (_index > 0) {
                    this.queue[prior].splice(_index, 1);
                    this.removeCompletedTaskMapByHash(hash);
                    return true;
                }
            }
            return false;

        } else {
            throw new ERROR(4004, 'task not exist when deleting', hash);
        }
    }

    beforeRun = () => {
        this.isTaskRunning = true;
    }

    afterRun = () => {
        this.clearCache();
    }

    /** interval was the time between tasks when executingQueue queue is full.
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
        if (!_.isFunction(task)) {
            throw new ERROR(4006, `runByParams error, typeof task can't be ${typeof task}`);
        }
        this.beforeRun();
        this.add(task);
        this.setState(GlobalConfig.POOLLER_STATE.RUN_BY_PARAMS);
        for (const param of params) {
            await this.#run(param);
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

    #run = async (param) => {
        const taskInfo = this.getTaskInfoDependOnPriority();
        const e = Promise.resolve()
            .then(() => {
                return taskInfo.task(param);
            })
            .catch((error) => {
                if (error.code && error.code === 4010) {
                    Util.appendInfo(`${this.getPoollerLogFormat(`發生Timeout了,是內部設計的狀況`)}`);
                } else {
                    Util.appendInfo(`${this.getPoollerLogFormat(`遇到了task發生 Error,但是task沒有處理好...,所以跑到這了 ${error.message}`)}`);
                    if (this.taskFailHandler === undefined) {
                        throw new ERROR(4008, `${error.message}`);
                    }
                }
                this.taskFailHandler(error, this.getPoollerLogFormat());

            })
            .finally(() => {
                this.removeCompletedTaskMapByHash(taskInfo.hash);
                this.executingQueue.splice(this.executingQueue.indexOf(e), 1)
            })
        this.executingQueue.push(e);

        if (this.executingQueue.length >= this.maxWorker) {
            await Promise.race(this.executingQueue);
        } else if (this.getQueueSize() === 0) {
            await Promise.all(this.executingQueue);
        }
    }

    /** taskInfo = { task, hash }*/
    getTaskInfoDependOnPriority = () => {
        for (const prior of GlobalConfig.POOLLER_PRIORITY) {
            if (this.queue[prior].length > 0) {
                switch (this.state) {
                    case GlobalConfig.POOLLER_STATE.RUN_BY_EACH_TASK:
                        return this.queue[prior].shift();
                    case GlobalConfig.POOLLER_STATE.RUN_BY_PARAMS:
                    case GlobalConfig.POOLLER_STATE.RUN_BY_TIMES:
                    case GlobalConfig.POOLLER_STATE.RUN_INFINITE:
                        const task = this.queue[prior].shift();
                        this.queue[prior].push(task);
                        return task;
                    default:
                        throw new ERROR(4005, `this.state ==> ${this.state}`)
                }
            }
        }
        throw new ERROR(4007);
    }

}


if (GlobalConfig.DEBUG_MODE) {
    (async () => {
        const self = new InfinitePool(1);
        // self.cleanTaskInterval();
        self.setTaskFailHandler((error) => {
            console.log(`TASK ERROR: ${error.message}`);
        })
        const tasks = [...Array(10)].map((value, index) => Util.asyncUnitTask(Util.getRandomValue(0, 15000)))
        await self.runByParams([1, 2, 3, 4, 5, 6, 7], tasks[0])

    })();

}


export default InfinitePool;
