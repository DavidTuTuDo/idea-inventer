const edit = true;
import BaseMainOrderStore from "./BaseMainOrderStore";
import {utiller as Util, exceptioner as ERROR, pooller as InfinitePool} from "utiller";

import Config from "../../config";

class MainOrderStore extends BaseMainOrderStore {

    constructor(props) {
        super(props);
        this.initialDestinationSuggestBehavior(Config.COUNTRY_OF_TRAVEL);
    }

    /** -------------------- async api -------------------- **/
}

export default MainOrderStore;
