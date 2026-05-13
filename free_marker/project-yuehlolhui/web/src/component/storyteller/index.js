const edit = true;

import BaseStorytellerComponent from "./BaseStorytellerComponent";
import { utiller as Util, exceptioner as ERROR, pooller as InfinitePool } from "utiller";

class StorytellerComponent extends BaseStorytellerComponent {
    constructor(props) {
        super(props);
    }

    onStorytellerSubmitDivClicked(param) {
        Util.exeAsyncT(this.getStore().modifyDiaryMsgX());
    }
}

export default StorytellerComponent;
