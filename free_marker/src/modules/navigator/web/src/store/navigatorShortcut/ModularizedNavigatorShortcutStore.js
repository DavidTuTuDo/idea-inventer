const edit = true;

import { utiller as Util, exceptioner as ERROR, pooller as InfinitePool } from "utiller";
import _ from "lodash";
import { makeAutoObservable, makeObservable, action, observable, comparer, computed, autorun, runInAction, toJS } from "mobx";
import BaseNavigatorShortcutStore from "./BaseNavigatorShortcutStore";

class ModularizedNavigatorShortcutStore extends BaseNavigatorShortcutStore {
    /** -------------------- fields -------------------- **/

    /** -------------------- functions -------------------- **/

    constructor(props) {
        super(props);
    }

    isSubOpen() {
        return this.getOpen() === 1;
    }

    @action
    setSubOpen(open) {
        this.setOpen(open ? 1 : 0);
    }

    hasSubItems() {
        return this.getSubs().length > 0;
    }

    /** -------------------- async api -------------------- **/
}

export default ModularizedNavigatorShortcutStore;
