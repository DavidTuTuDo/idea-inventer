const edit = true;

import ModularizedNavigatorStore from "./ModularizedNavigatorStore";
import { utiller as Util, exceptioner as ERROR, pooller as InfinitePool } from "utiller";

class NavigatorStore extends ModularizedNavigatorStore {
    /** -------------------- fields -------------------- **/

    /** -------------------- functions -------------------- **/

    constructor(props) {
        super(props);
    }

    getTitle() {
        return "悅譜";
    }

    /** -------------------- async api -------------------- **/
}

export default NavigatorStore;
