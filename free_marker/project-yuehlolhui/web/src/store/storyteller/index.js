const edit = true;

import BaseStorytellerStore from "./BaseStorytellerStore";
import { action } from "mobx";
import { utiller as Util, exceptioner as ERROR, pooller as InfinitePool } from "utiller";
import MsgX from "../../store/diariesMessageX";

class StorytellerStore extends BaseStorytellerStore {
    constructor(props) {
        super(props);
        this.apiOfMsgX = new MsgX();
    }

    @action
    activated(prop) {
        this.initial(prop);
    }

    modifyDiaryMsgX = async () => {
        const obj = this.columnData();
        const append = Util.isUndefinedNullEmpty(obj?.id);
        const result = await this.apiOfMsgX.submitMessageXItem(this.getComponent(), obj, obj?.id);
        this.App().getDiariesStore().updateSpecificMessageXes(result.value);
        this.getComponent(true).dismiss();
        this.App().enqueueTask(async (p) => {
            await Util.syncDelay(200);
            p.showInfoSnackMessage(`已成功${append ? "新增" : "更新"}日記`);
        });
    };
}

export default StorytellerStore;
