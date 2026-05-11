const edit = true;

import Api from "./api";
import { utiller as Util } from "utiller";

class admin {
    constructor() {}

    async commitDiaries() {
        await Api.deleteWholeMessageXes();
        const items = Util.getJsonObjByFilePath("./temp/diary.json");
        await Api.submitMessageXes(items.map((item) => ({ ...item, isDiary: true })));
    }
}

export default admin;

(async () => {
    const handler = new admin();
    await handler.commitDiaries();
})();
