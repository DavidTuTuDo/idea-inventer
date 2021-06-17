import {utiller as Util, exceptioner as ERROR, pooller as InfinitePool} from 'utiller';


class CommonPoolHelper {

    constructor() {
        this.queues = {};
        this.queues[`default`] = new InfinitePool(1,`default`).runByEachTaskInBackGround();
        this.queues[`fetch`] = new InfinitePool(1,`fetch`).runByEachTaskInBackGround();
        this.queues[`submit`] = new InfinitePool(1,`submit`).runByEachTaskInBackGround();
    }

    /** 原來要做針對Queue的attr build set的情況, 就要把builder獨立成一個class, */
    createQueue(queueName, workerCount) {
        this.queues[queueName] = new InfinitePool(workerCount).runByEachTaskInBackGround();
    }

    async submitTo(queueName, async_func, priority = `low`) {
        return await this.queues[queueName].addTaskAndWait4Result(async_func, priority);
    }

    async submit(async_func, priority = `low`) {
        return await this.queues[`default`].addTaskAndWait4Result(async_func, priority);
    }

    remove() {

    }

    destroy() {
        for (const queueName in this.queues) {
            this.queues[queueName].terminate();
            delete this.queues[queueName];
        }
    }


}

export default new CommonPoolHelper();
