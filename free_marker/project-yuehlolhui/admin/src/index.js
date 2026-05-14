const edit = true;

import Api from "./api";
import { utiller as Util } from "utiller";
import _ from "lodash";

class admin {
    constructor() {}

    commitDiaries = async () => {
        await Api.deleteWholeMessageXes();
        const items = Util.getJsonObjByFilePath("./temp/diary.json");
        await Api.submitMessageXes(items.map((item) => ({ ...item, isDiary: true })));
        /** summit diaries before 2026.05.07 */
    };

    pushDiaries = async () => {
        const items = Util.getJsonObjByFilePath("./temp/formal_diary.json");
        await Api.submitMessageXes(items.map((item) => ({ ...item, isDiary: true })));
        /** should be after 20*/
    };

    updateAuthorNameOfDiaries = async (name = "Ivyyy", latest = "Hui C") => {
        await Api.updateEligibleMessageXes({ author: latest }, { type: "where", params: ["author", "==", `${name}`] });
    };

    updateLastestDate = async () => {
        const diaries = await Api.fetchMessageXes({ type: "orderBy", params: ["updateTime", "desc"] }, { type: "limit", params: [20] });

        // 1. 取得所有 createTime（假設是 Firebase Timestamp 物件）
        const bunchOfDiariesDate = diaries.map((diary) => diary.createTime);

        // 2. 找出最大的日期 (latest)
        // 我們將 Timestamp 轉換為毫秒數進行比較，Math.max 會回傳最大值
        const latest = new Date(Math.max(...bunchOfDiariesDate.map((t) => t.toMillis())));

        // 3. 呼叫 API
        await Api.upsertStatistic({ latestDate: latest });
    };
}

export default admin;

(async () => {
    const handler = new admin();
    // await handler.updateLastestDate();
    // await handler.updateAuthorNameOfDiaries('Ivyyy','Hui C');
})();
