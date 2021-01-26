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
    }

    setWorker(counts) {
        this.maxWorker = counts;
    }

    cleanInterval() {
        this.taskInterval = {min: 0, max: 0};
    }

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
        if (GlobalConfig.MODULE_MSG.SHOW_SUCCEED)
            Util.appendInfo(`this.mHashNTaskMap ${_.size(this.mHashNTaskMap)}`)
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

    /** run would infinite, in default, sleep over 100 times, pooller would shutdown */
    runInInfinite = async (tasks, interval) => {
        this.setState(GlobalConfig.POOLLER_STATE.RUN_INFINITE);
    }

    /** run time by params length */
    runByParams = async (task, params) => {
        this.add(task);
        this.setState(GlobalConfig.POOLLER_STATE.RUN_BY_PARAMS);
        for (const param of params) {

        }
    }

    /** run times wound be depend on times, task would by loop and sync in given order */
    runByTimes = async (tasks, times) => {
        this.adds(tasks);
        this.setState(GlobalConfig.POOLLER_STATE.RUN_BY_TIMES);

        for (let index = 0; index < times; index++) {

        }

    }

    /** run by how many task in queue, FIFO */
    runByEachTask = async (tasks) => {
        this.adds(tasks);
        this.setState(GlobalConfig.POOLLER_STATE.RUN_BY_EACH_TASK);
        while (this.isRunning) {

        }
    }

    setState(_state) {
        if (!_.has(GlobalConfig.POOLLER_STATE, _state))
            throw new ERROR(4005, `${_state} not exist in Setting`, `pooller id ${this.poolId}`);

        this.state = _state;
    }


    run = async () => {
        const ret = [];
        const executing = [];
        let index = 0
        while (this.isRunning) {
            index++;
            if (this.getQueueSize() <= 0) {
                const timer = await Util.syncDelayRandom(this.sleep.min, this.sleep.max);
                this.sleepTimes += 1;
                Util.appendFile(GlobalConfig.PATH_INFO_LOG, `poller ${this.poolId} sleep time ${timer} million-sec`);

                if (this.sleepTimes >= GlobalConfig.POOLLER_MAX_SLEEP_TIMES_DEFAULT) this.stop();
                continue;
            }
            const restInInterval = await Util.syncDelayRandom(this.taskInterval.min, this.taskInterval.max)
            if (GlobalConfig.MODULE_MSG.SHOW_SUCCEED)
                Util.appendInfo(`worker的周間休息了以下 ${restInInterval} million-secs`);

            this.sleepTimes = 0;
            const taskInfo = this.getTaskInfoDependOnPriority();
            const p = Promise.resolve()
                .then(() => {
                    return taskInfo.task();
                })
                .then((result) => {
                    return {result, hash: taskInfo.hash}
                });
            ret.push(p);

            const e = p.then((result) => {
                if (result.hash) {
                    this.removeCompletedTaskMapByHash(taskInfo.hash);
                }
                return executing.splice(executing.indexOf(e), 1);
            });
            executing.push(e);
            if (executing.length >= this.maxWorker) {
                await Promise.race(executing);
            } else if (this.getQueueSize() === 0) {
                await Promise.race(executing);
            }
        }
        return Promise.all(ret);

    }

    /** taskInfo = { task, hash }*/
    getTaskInfoDependOnPriority = () => {
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
        const self = new InfinitePool();

        const tasks = [...Array(10)].map((value, index) => async function () {
            const randomValue = Util.getRandomValue(2000, 4000);
            const symbol = index;
            Util.appendInfo(`i'm symbol of ${symbol}, ready to be executed`);
            await Util.syncDelay(randomValue);
            Util.appendInfo(`i'm symbol of ${symbol}, the task cost ${randomValue} million-seconds`);
            return {randomValue, symbol};
        })
        const hashes = self.adds(tasks);
        await self.run();
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
