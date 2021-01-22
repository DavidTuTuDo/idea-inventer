import _ from 'lodash';
import Util from '../util';
import GlobalConfig from "../GlobalConfig";
import ERROR from '../exception';


class InfinitePool {

    constructor(maxWorkers = GlobalConfig.POOLLER_WORKER_DEFAULT) {
        this.sleep = GlobalConfig.POOLLER_SLEEP_RANGE_DEFAULT;
        this.taskInterval = GlobalConfig.POOLLER_SLEEP_RANGE_DEFAULT;
        this.maxWorker = maxWorkers;
        this.mHashTaskMap = {};
        this.queue = {};
        this.sleepTimes = 0;
        this.isRunning = true;

        for (const prior of GlobalConfig.POOLLER_PRIORITY) {
            this.queue[prior] = [];
        }
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
            this.mHashTaskMap[hash] = taskInfo;
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

    removeHashTaskMapByHash = (hash) => {
        delete this.mHashTaskMap[hash];
    }

    /**
     * removeTask task in queue by its hash, hash was created when add to queue
     *
     * method will return true when succeed delete*/
    removeTask(hash) {
        let taskInfo = this.mHashTaskMap[hash];
        if (taskInfo) {
            for (const prior of GlobalConfig.POOLLER_PRIORITY) {
                const _index = _.indexOf(this.queue[prior], taskInfo);
                if (_index > 0) {
                    this.queue[prior].splice(_index, 1);
                    this.removeHashTaskMapByHash(hash);
                    return true;
                }
            }
            return false;

        } else {
            throw new ERROR(4004, 'task not exist when deleting', hash);
        }
    }

    run = async () => {
        const ret = [];
        const executing = [];
        const keyMap = {};

        while (this.isRunning) {
            if (this.getQueueSize() <= 0) {
                const timer = await Util.syncDelayRandom(this.sleep.min, this.sleep.max);
                this.sleepTimes += 1;
                Util.appendFile(GlobalConfig.PATH_INFO_LOG, `poller sleep time ${timer} million-sec`);
                if (this.sleepTimes >= 100)
                    this.stop();
                continue;
            }
            this.sleepTimes = 0;
            const taskInfo = this.getTaskInfoDependOnPriority();
            const p = Promise.resolve().then(() => {
                return taskInfo.task();
            });
            ret.push(p);
            const e = p.then(() => {
                const taskInfo = keyMap[e];
                if (taskInfo !== undefined) {
                    delete keyMap[e];
                    this.removeHashTaskMapByHash(taskInfo.hash);
                }
                return executing.splice(executing.indexOf(e), 1);
            });

            keyMap[e] = taskInfo;
            executing.push(e);

            if (executing.length >= this.maxWorker) {
                await Util.syncDelayRandom(this.taskInterval.min, this.taskInterval.max)
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
    }
}


if (GlobalConfig.DEBUG_MODE) {
    const self = new InfinitePool();
    const tasks = [...Array(10)].map((value, index) => async function () {

        const randomValue = Util.getRandomValue(5000, 8000);
        const symbol = index;

        console.log(`i'm symbol of ${symbol},ready to be executed`);
        await Util.syncDelay(randomValue);
        console.log(`i'm symbol of ${symbol}, the task cost ${randomValue} million-seconds`);
        return {randomValue, symbol};


    })

    const hashes = self.adds(tasks);
    console.log(`${hashes}   ${self.removeTask(Util.getShuffledItemFromArray(hashes))}`);

    setTimeout(() => {
        self.adds([...Array(1)].map((value, index) => async function () {

            const symbol = `Xman HIGH HIGH HIGH ${index}`;
            console.log(`i'm symbol of ${symbol}, ready to be executed`);
            const randomValue = Util.getRandomValue(1000, 5000);
            await Util.syncDelay(randomValue);
            console.log(`i'm symbol of ${symbol}, the task cost ${randomValue} million-seconds`);
            return {randomValue, symbol};

        }), 'high');
    }, 5000);


    setTimeout(() => {
        self.adds([...Array(10)].map((value, index) => async function () {

            const symbol = `Xman ${index}`;
            console.log(`i'm symbol of ${symbol}, ready to be executed`);
            const randomValue = Util.getRandomValue(1000, 5000);
            await Util.syncDelay(randomValue);
            console.log(`i'm symbol of ${symbol}, the task cost ${randomValue} million-seconds`);
            return {randomValue, symbol};

        }));
        console.log(`self.getSize() ${self.getQueueSize()}`);
    }, 15000);

    setTimeout(() => {
        self.pus
    }, 20000)


    self.run().then((nothing) => console.log(nothing));

}


export default InfinitePool;
