import {
    utiller as Util,
    exceptioner as ERROR,
    pooller as InfinitePool,
} from "utiller";
import _ from "lodash";
import libpath from "path";
import BaseMainExpiredStore from "./BaseMainExpiredStore";

class MainExpiredStore extends BaseMainExpiredStore {
    /** -------------------- fields -------------------- **/
    /** -------------------- functions -------------------- **/

    constructor(props) {
        super(props);
        setInterval(this.onTick, 0);
    }

    clientTime = Date.now();
    serverTime = Date.now(); // Time requested from server

    now = () => {
        return this.serverTime;
    }


    onTick = () => {
        const self = this;
        const now = Date.now();
        this.serverTime = self.serverTime + (now - self.clientTime);
        this.clientTime = now;
    }
    /** -------------------- async api -------------------- **/
}

export default MainExpiredStore;
