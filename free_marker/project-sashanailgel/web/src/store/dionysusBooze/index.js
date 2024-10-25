const edit = true;
import BaseDionysusBoozeStore from "./BaseDionysusBoozeStore";
import {utiller as Util, exceptioner as ERROR, pooller as InfinitePool} from "utiller";
import _ from "lodash";
import libpath from "path";
import {Application} from "../../";
import Config from "../../config";
import {
    makeAutoObservable,
    makeObservable,
    action,
    observable,
    comparer,
    computed,
    autorun,
    runInAction,
    toJS
} from "mobx";

class DionysusBoozeStore extends BaseDionysusBoozeStore {
    /** -------------------- fields -------------------- **/

    /** -------------------- functions -------------------- **/

    constructor(props) {
        super(props);
    }

    getPriceB4Discount() {
        const result = super.getPriceB4Discount();
        const present = result <= 0 ?
            Math.round(_.sum([this.getPrice(), _.multiply(0.3, this.getPrice())])):result;
        return `$ ${present}`;
    }

    /** -------------------- async api -------------------- **/
}

export default DionysusBoozeStore;
