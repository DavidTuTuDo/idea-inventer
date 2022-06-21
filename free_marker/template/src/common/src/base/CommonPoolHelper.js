import {utiller as Util, exceptioner as ERROR, pooller as InfinitePool} from 'utiller';


class CommonPoolHelper {

    constructor() {
        this.queues = {};
        this.paralledMode = false;
        this.queues[`default`] = new InfinitePool(1, `default`).runByEachTaskInBackGround();
        this.queues[`fetch`] = new InfinitePool(15, `fetch`).runByEachTaskInBackGround();
        this.queues[`submit`] = new InfinitePool(15, `submit`).runByEachTaskInBackGround();
        this.queues[`functions`] = new InfinitePool(15, `functions`).runByEachTaskInBackGround();
    }



    /** 原來要做針對Queue的attr build set的情況, 就要把builder獨立成一個class, */
    createQueue(queueName, workerCount) {
        this.queues[queueName] = new InfinitePool(workerCount).runByEachTaskInBackGround();
    }

    async submitTo(queueName, async_func, priority = `low`, taskName = 'noName') {
        if(!this.paralledMode) queueName = 'default';
        const result = await this.queues[queueName].addTaskAndWait4Result(async_func, priority, taskName);
        return result;
    }

    async submit(async_func, priority = `low`) {
        return await this.queues[`default`].addTaskAndWait4Result(async_func, priority);
    }

    /** 避免很多api 發送時, 需要先完成登入程序, 所以預設是 singleThread 去處理 fetch 和 submit */
    enableParallelMode() {
        Util.appendInfo('set pool helper parallel mode succeed!');
        this.paralledMode = true;
    }

    destroy() {
        for (const queueName in this.queues) {
            this.queues[queueName].terminate();
            delete this.queues[queueName];
        }
    }


}

export default new CommonPoolHelper();
