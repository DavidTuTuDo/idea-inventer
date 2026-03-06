const edit = true;

// 移除了原本的 InfinitePool，引入 p-queue
import PQueue from 'p-queue';
import { utiller as Util, exceptioner as ERROR } from "utiller";

class CommonPoolHelper {
    constructor() {
        this.queues = {};
        this.paralledMode = false;

        // 預設關閉閘門 (autoStart: false 模擬原本 worker = 0)
        // 並根據註解設計為單執行緒 (concurrency: 1)
        this.queues[`fetch`] = new PQueue({ concurrency: 1, autoStart: false });
        this.queues[`submit`] = new PQueue({ concurrency: 1, autoStart: false });

        // functions 處理 file IO (WORD->PDF檔)，有可能 timeout
        // p-queue 內建 timeout 機制，時間到會拋出 TimeoutError
        this.queues[`functions`] = new PQueue({
            concurrency: 1,
            autoStart: false,
            timeout: 60000,
            throwOnTimeout: true
        });
    }

    /** * p-queue 的優先級是數字（越大越先執行）。
     * 這裡做一個轉換器，以相容你原本傳入的字串。
     */
    getPriorityScore(priority) {
        if (typeof priority === 'number') return priority;
        switch (priority) {
            case 'high': return 10;
            case 'normal': return 5;
            case 'low': default: return 0;
        }
    }

    async submitTo(queueName, async_func, priority = `low`, taskName = "noName") {
        if (!this.queues[queueName]) {
            throw new Error(`Queue ${queueName} does not exist.`);
        }

        const priorityScore = this.getPriorityScore(priority);

        // 使用 p-queue 的 add 來加入任務
        const result = await this.queues[queueName].add(async () => {
            try {
                return await async_func();
            } catch (error) {
                // 取代原本的 setTaskFailHandler，在這裡統一攔截並 Log
                console.log(`在Web專案裡發生的'${queueName}', Task: ${taskName}, 發生了${error.message}`);
                throw error; // 將錯誤往上拋，讓 await submitTo 的呼叫端也能處理
            }
        }, { priority: priorityScore });

        return result;
    }

    /** 避免很多 api 發送時，需要先完成登入程序，所以預設是 singleThread 去處理 fetch 和 submit */
    enableParallelMode() {
        for (const queueName in this.queues) {
            this.queues[queueName].concurrency = 100; // 開啟大流量
            this.queues[queueName].start();            // 開啟閘門，開始執行被暫存的任務
        }
        this.paralledMode = true;
        Util.appendInfo("45642123132 set pool helper parallel mode succeed!");
    }

    isParallelMode() {
        return this.paralledMode;
    }

    destroy() {
        for (const queueName in this.queues) {
            this.queues[queueName].clear(); // 清空尚未執行的任務
            this.queues[queueName].pause(); // 停止繼續處理
            delete this.queues[queueName];
        }
    }

    disableParallelMode() {
        for (const queueName in this.queues) {
            this.queues[queueName].pause(); // 重新關閉閘門
            this.queues[queueName].concurrency = 1; // 恢復單執行緒

            // 選擇性：是否要清空佇列中還沒發送的請求？
            // this.queues[queueName].clear();
        }
        this.paralledMode = false;
    }
}

export default new CommonPoolHelper();
