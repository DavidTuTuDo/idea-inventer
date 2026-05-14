const edit = true;

import Api from "./api";
import { utiller as Util } from "utiller";

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
}

export default admin;

(async () => {
    const handler = new admin();
    await handler.pushDiaries();
})();
