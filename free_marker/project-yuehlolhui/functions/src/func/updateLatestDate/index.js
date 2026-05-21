const edit = true;

import BaseUpdateLatestDate from "./BaseUpdateLatestDate";
import { utiller as Util, exceptioner as ERROR, pooller as InfinitePool } from "utiller";

import libpath from "path";
import Api from "../../api";

class UpdateLatestDate extends BaseUpdateLatestDate {
    constructor(props) {
        super(props);
    }

    async handleSchedule(context) {
        const diaries = await Api.fetchMessageXes({ type: "orderBy", params: ["updateTime", "desc"] }, { type: "limit", params: [20] });

        // 1. 取得所有 createTime（假設是 Firebase Timestamp 物件）
        const bunchOfDiariesDate = diaries.map((diary) => diary.createTime);

        // 2. 找出最大的日期 (latest)
        // 我們將 Timestamp 轉換為毫秒數進行比較，Math.max 會回傳最大值
        const latest = new Date(Math.max(...bunchOfDiariesDate.map((t) => t.toMillis())));

        // 3. 呼叫 API
        await Api.upsertStatistic({ latestDate: latest });
    }
}

export default new UpdateLatestDate();
