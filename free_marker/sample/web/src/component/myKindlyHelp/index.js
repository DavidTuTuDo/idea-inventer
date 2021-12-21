import {
    utiller as Util,
    exceptioner as ERROR,
    pooller as InfinitePool,
} from "utiller";
import _ from "lodash";
import libpath from "path";
import {observer} from "mobx-react";
import {inject} from "mobx-react";
import BaseMyKindlyHelpComponent from "./BaseMyKindlyHelpComponent";

@inject("myKindlyHelp")
@observer
class MyKindlyHelpComponent extends BaseMyKindlyHelpComponent {
    /** -------------------- fields -------------------- **/
    /** -------------------- functions -------------------- **/

    constructor(props) {
        super(props);
        this.appendScrollToBottomJob(this.getStore().onBottomTouched)
    }

    /** -------------------- async api -------------------- **/
}

export default MyKindlyHelpComponent;
