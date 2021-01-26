import _ from 'lodash';
import Util from '../util';
import GlobalConfig from "../GlobalConfig";
import ERROR from '../exception';


class InfinitePool {

    constructor(maxWorkers = GlobalConfig.POOLLER_WORKER_DEFAULT) {
        this.poolId = Util.getRandomValue(0, 100000000000);
        this.state = GlobalConfig.POOLLER_STATE.RUN_BY_EACH_TASK
        this.sleep = GlobalConfig.POOLLER_SLEEP_RANGE_DEFAULT;
        this.taskInterval = GlobalConfig.POOLLER_TASK_INTERVAL_DEFAULT;
        this.maxWorker = maxWorkers;
        this.mHashNTaskMap = {};
        this.queue = {};
        this.sleepTimes = 0;
        this.isRunning = true;

        for (const prior of GlobalConfig.POOLLER_PRIORITY) {
            this.queue[prior] = [];
        }

        this.ret = [];
        this.executing = [];
    }

    clearCache() {
        this.ret.length = 0;
        this.executing.length = 0;
        this.mHashNTaskMap = {};
        this.queue = {};
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
            throw new ERROR(4003, `should be array, not${typeof tasks}`);
        }
        return hashes;
    }

    stop() {
        this.isRunning = false;
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

    /** interval{min:0,max:10}
     * run would infinite, in default, sleep over 100 times, pooller would shutdown */
    runInInfinite = async (interval, task = []) => {

        if (_.isFunction(task))
            this.add(task)
        else if (_.isArray(task))
            this.adds(task);
        else
            throw new ERROR(4006, `task as param is ridiculous`, `type of task is ===>${typeof task}`)
        this.setTaskInterval(interval)
        this.setState(GlobalConfig.POOLLER_STATE.RUN_INFINITE);
        while (this.isRunning) {
            await this.#run();
        }
        return await this.#getNormalizeResult();
    }

    /** run time by params length */
    runByParams = async (params = [], task = undefined) => {
        if (!_.isFunction(task)) {
            throw new ERROR(4006, `run by Params only one task not ${typeof task}`);
        }
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
        return self.map((_self) => _self.result);
    }

    /** run times wound be depend on times, task would by loop and sync in given order */
    runByTimes = async (times, tasks = []) => {
        this.adds(tasks);
        this.setState(GlobalConfig.POOLLER_STATE.RUN_BY_TIMES);

        for (let index = 0; index < times; index++) {
            await this.#run();
        }
        return await this.#getNormalizeResult();
    }

    /** run by how many task in queue, FIFO */
    runByEachTask = async (tasks = []) => {
        this.adds(tasks);
        this.setState(GlobalConfig.POOLLER_STATE.RUN_BY_EACH_TASK);
        while (this.isRunning) {
            if (this.getQueueSize() <= 0) {

                const timer = await Util.syncDelayRandom(this.sleep.min, this.sleep.max);
                this.sleepTimes += 1;
                Util.appendFile(GlobalConfig.PATH_INFO_LOG, `poller ${this.poolId} sleep time ${timer} million-sec`);

                if (this.sleepTimes >= GlobalConfig.POOLLER_MAX_SLEEP_TIMES_DEFAULT) this.stop();
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
        }
        this.sleepTimes = 0;
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
                        throw new ERROR(4005, ' state not valid')
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

        const p = async (param) => {
            Util.appendInfo('我近來惹')
            await Util.syncDelay(500);
            return `param is ${param}`;
        }
        await self.runInInfinite({min: 0, max: 10}, [p]);
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
