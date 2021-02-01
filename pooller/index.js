import _ from 'lodash';
import Util from '../util';
import GlobalConfig from "../GlobalConfig";
import ERROR from '../exception';


class InfinitePool {

    constructor(maxWorkers = GlobalConfig.POOLLER_WORKER_DEFAULT) {
        this.poolId = Util.getRandomValue(0, 100000000000);
        this.state = GlobalConfig.POOLLER_STATE.RUN_BY_EACH_TASK
        this.timeOfSleep = GlobalConfig.POOLLER_TIME_OF_SLEEP_RANGE_DEFAULT;
        this.taskInterval = GlobalConfig.POOLLER_TASK_INTERVAL_DEFAULT;
        this.maxSleepCounts = GlobalConfig.POOLLER_MAX_SLEEP_COUNTS_DEFAULT;
        this.maxWorker = maxWorkers;
        this.mHashNTaskMap = {};
        this.queue = {};
        this.currrentSleepCounts = 0;
        this.isTaskRunning = false;

        for (const prior of GlobalConfig.POOLLER_PRIORITY) {
            this.queue[prior] = [];
        }

        this.ret = [];
        this.executing = [];
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
        this.ret.length = 0;
        this.executing.length = 0;
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
        while (this.executing.length > 0) {

            await Util.syncDelay(1000);
            times += 1;
            if (times > 15) {
                return false;
            }
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
            const taskInfo = {task, hash};
            this.appendHashTaskMap({task, hash});

            this.queue[priority].push(taskInfo);
            return hash;

        } else {
            throw new ERROR(4002, `task can't be ${typeof task}`);
        }
    }

    adds = (tasks, priority = 'low') => {
        const hashes = [];
        if (_.isArray(tasks)) {
            for (const task of tasks) {
                hashes.push(this.add(task, priority));
            }
        } else {
            throw new ERROR(4003, `should be array, not ${typeof tasks}`);
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
     * method will return true when succeed delete*/
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

    }

    /** interval{min:0,max:10}
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
            throw new ERROR(4006, `task as param is ridiculous`, `type of task is ===> ${typeof task}`)
        this.beforeRun();
        this.setTaskInterval(interval)
        this.setState(GlobalConfig.POOLLER_STATE.RUN_INFINITE);

        while (this.isTaskRunning) {
            await this.#run();
        }

        return await this.#getNormalizeResult();
    }

    /** run time by params length */
    runByParams = async (params = [], task = undefined) => {
        if (!_.isFunction(task)) {
            throw new ERROR(4006, `run by Params only one task not ${typeof task}`);
        }
        this.beforeRun();
        this.add(task);
        this.setState(GlobalConfig.POOLLER_STATE.RUN_BY_PARAMS);
        for (const param of params) {
            await this.#run(param);
        }
        return await this.#getNormalizeResult();
    }

    /** needless to return info with hash string */
    #getNormalizeResult = async () => {
        const self = await Promise.all(this.ret);
        this.clearCache();
        this.afterRun();
        return self.map((_self) => _self.result);
    }

    /** run times wound be depend on times, task would by loop and sync in given order */
    runByTimes = async (times, tasks = []) => {
        this.adds(tasks);
        this.beforeRun();
        this.setState(GlobalConfig.POOLLER_STATE.RUN_BY_TIMES);

        for (let index = 0; index < times; index++) {
            await this.#run();
        }
        return await this.#getNormalizeResult();
    }

    runInBackGround = (_func, ...params) => {
        if (!(typeof _func === "function")) {
            throw new ERROR(9999);
        }
        this.beforeRun();
        setTimeout(async () => {
            try {
                await _func(...params);
            } catch (error) {
                this.listener(error);
            }
        }, 0);

    }

    setBackgroundTaskErrorListener = (listener) => {
        this.listener = listener;
    }

    /** run by how many task in queue, FIFO, is task completed, pool with timeOfSleep for a while,after this.maxSleepCounts, pooller would closed */
    runByEachTask = async (tasks = []) => {
        this.currrentSleepCounts = 0;
        this.adds(tasks);
        this.setState(GlobalConfig.POOLLER_STATE.RUN_BY_EACH_TASK);
        while (this.isTaskRunning) {
            if (this.getQueueSize() <= 0) {

                const timer = await Util.syncDelayRandom(this.timeOfSleep.min, this.timeOfSleep.max);
                this.currrentSleepCounts += 1;
                Util.appendFile(GlobalConfig.PATH_INFO_LOG, `poller ${this.getPoolId()} sleep time ${timer} million-sec`);

                if (this.currrentSleepCounts > this.maxSleepCounts) this.stop();
                continue;
            }
            await this.#run();
        }
        return await this.#getNormalizeResult();
    }

    setState(_state) {
        this.state = _state;
    }

    #run = async (param) => {

        if (this.executing.length >= this.maxWorker - 1) {
            const restInInterval = await Util.syncDelayRandom(this.taskInterval.min, this.taskInterval.max)
            if (GlobalConfig.MODULE_MSG.SHOW_SUCCEED)
                Util.appendInfo(`worker的周間休息了以下 ${restInInterval} million-secs`);
            if (!this.isTaskRunning) {
                throw new ERROR(4007,`POOLER ID ${this.getPoolId()}`);
            }
        }

        this.currrentSleepCounts = 0;
        const taskInfo = this.getTaskInfoDependOnPriority();
        const p = Promise.resolve()
            .then(() => {
                return taskInfo.task(param);
            })
            .then((result) => {
                return {result, hash: taskInfo.hash}
            });
        this.ret.push(p);

        const e = p.then((result) => {
            if (result.hash) {
                this.removeCompletedTaskMapByHash(taskInfo.hash);
            }
            this.executing.splice(this.executing.indexOf(e), 1);
            return result;
        })
        this.executing.push(e);
        if (this.executing.length >= this.maxWorker) {
            await Promise.race(this.executing);
        } else if (this.getQueueSize() === 0) {
            await Promise.race(this.executing);
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


        for (const prior of GlobalConfig.POOLLER_PRIORITY) {
            if (this.queue[prior].length > 0) {
                return this.queue[prior].shift();
            }
        }
        Util.appendInfo(`getTaskInfoDependOnPriority() 不能走到這裡`);

    }


}


if (GlobalConfig.DEBUG_MODE) {
    (async () => {
        const self = new InfinitePool(4);
        // self.cleanTaskInterval();
        const tasks = [...Array(10)].map((value, index) => async function (param) {
            const randomValue = Util.getRandomValue(2000, 4000);
            const symbol = index;
            Util.appendInfo(`i'm symbol of ${symbol}, ready to be executed`);
            await Util.syncDelay(randomValue);
            Util.appendInfo(`i'm symbol of ${symbol}, the task cost ${randomValue} million-seconds`);
            return {randomValue, symbol, param};
        })
        // const hashes = self.adds(tasks);

        self.setMaxSleepCounts(3);
        self.runInBackGround(self.runByEachTask, tasks);

        while (self.isRunning()) {
            await Util.syncDelayRandom(1000, 3000);
        }


        // const p = async (param) => {
        //     Util.appendInfo('我近來惹')
        //     await Util.syncDelay(500);
        //     return `param is ${param}`;
        // }
        // await self.runInInfinite({min: 0, max: 10}, [p]);
        // console.log(await self.runByParams([...Array(10)].map((v, index) => index), p))
        // console.log(await self.runInInfinite({min: 0, max: 0}, tasks));

        // await Promise.all(tasks.map((task) => task()));
        // Util.appendInfo(`${hashes}   ${self.removeTask(Util.getShuffledItemFromArray(hashes))}`);

        // setTimeout(() => {
        //     self.adds([...Array(1)].map((value, index) => async function () {
        //
        //         const symbol = `Xman HIGH HIGH HIGH ${index}`;
        //         Util.appendInfo(`i'm symbol of ${symbol}, ready to be executed`);
        //         const randomValue = Util.getRandomValue(1000, 5000);
        //         await Util.syncDelay(randomValue);
        //         Util.appendInfo(`i'm symbol of ${symbol}, the task cost ${randomValue} million-seconds`);
        //         return {randomValue, symbol};
        //
        //     }), 'high');
        // }, 5000);
        //
        //
        // setTimeout(() => {
        //     self.adds([...Array(10)].map((value, index) => async function () {
        //
        //         const symbol = `Xman ${index}`;
        //         Util.appendInfo(`i'm symbol of ${symbol}, ready to be executed`);
        //         const randomValue = Util.getRandomValue(1000, 5000);
        //         await Util.syncDelay(randomValue);
        //         Util.appendInfo(`i'm symbol of ${symbol}, the task cost ${randomValue} million-seconds`);
        //         return {randomValue, symbol};
        //
        //     }));
        // }, 15000);

        // Util.appendInfo('p============???????????')
        // try {
        //     const result = await self.run();
        // } catch (error){
        //     Util.appendInfo(`error ??????${error}`)
        // } finally {
        //     Util.appendInfo('d============???????????')
        // }


        // self.run().then((nothing) => Util.appendInfo(`nothing is ${nothing}`));
        // Util.appendInfo('pardon???????????')

    })();

}


export default InfinitePool;
