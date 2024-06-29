const edit = true;
import BaseMainOrderStore from "./BaseMainOrderStore";
import {utiller as Util, exceptioner as ERROR, pooller as InfinitePool} from "utiller";
import _ from "lodash";
import Config from "../../config";

class MainOrderStore extends BaseMainOrderStore {
    /** -------------------- fields -------------------- **/

    /** -------------------- functions -------------------- **/

    constructor(props) {
        super(props);
        this.initialDestinationSuggestBehavior(Config.COUNTRY_OF_TRAVEL);
    }

    onInitialCompleted(obj) {
        this.setValueOfCreateTime(this.getCreateTime())
        this.setValueOfStartOfTravel(this.getStartOfTravel())
    }



    /** -------------------- async api -------------------- **/
}

export default MainOrderStore;
