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

    /** -------------------- async api -------------------- **/
}

export default DionysusBoozeStore;
