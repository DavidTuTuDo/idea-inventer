const edit = true;

import { utiller as Util, exceptioner as ERROR, pooller as InfinitePool } from "utiller";

class CommonPoolHelper {
    constructor() {
        this.queues = {};
        this.paralledMode = false;
        this.queues[`fetch`] = new InfinitePool(0, `fetch`).runByEachTaskInBackGround();
        this.queues[`submit`] = new InfinitePool(0, `submit`).runByEachTaskInBackGround();
        this.queues[`functions`] = new InfinitePool(0, `functions`).runByEachTaskInBackGround();
        /** functions處理file IO(WORD->PDF檔) 有可能 timeout */
        this.queues[`functions`].enableTaskTimeout(true, 60000);
    }

    async submitTo(queueName, async_func, priority = `low`, taskName = "noName") {
        const result = await this.queues[queueName].addTaskAndWait4Result(async_func, priority, taskName);
        return result;
    }

    /** 避免很多api 發送時, 需要先完成登入程序, 所以預設是 singleThread 去處理 fetch 和 submit */
    enableParallelMode() {
        for (const queueName in this.queues) {
            this.queues[queueName].setWorker(15);
        }
        this.paralledMode = true;
        Util.appendInfo("45642123132 set pool helper parallel mode succeed!");
    }

    isParallelMode() {
        return this.paralledMode;
    }

    destroy() {
        for (const queueName in this.queues) {
            this.queues[queueName].terminate();
            delete this.queues[queueName];
        }
    }

    // 在 CommonPoolHelper 中
    disableParallelMode() {
        for (const queueName in this.queues) {
            this.queues[queueName].setWorker(0); // 重新關閉閘門
            // 選擇性：是否要清空佇列中還沒發送的請求？
            // this.queues[queueName].clearTasks();
        }
        this.paralledMode = false;
    }
}

export default new CommonPoolHelper();
