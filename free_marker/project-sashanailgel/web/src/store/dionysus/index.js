const edit = true;
import BaseDionysusStore from "./BaseDionysusStore";
import {utiller as Util, exceptioner as ERROR, pooller as InfinitePool} from "utiller";
import _ from "lodash";
import libpath from "path";
import {Application} from "../../";
import Config from "../../config";
import i18n from "../../i18n";
import Router from "../../router";
import Cookie from "../../cookie";
import UserInfoRef from "../../base/BaseUserInfo";
import {makeAutoObservable, makeObservable, action, observable, comparer, computed, autorun, runInAction, toJS} from "mobx";
import Select from "../dionysusSelect";
import Booze from "../dionysusBooze";
import BaseStore from "../../base/BaseStore";

class DionysusStore extends BaseDionysusStore {
    /** -------------------- fields -------------------- **/

    /** -------------------- functions -------------------- **/

    constructor(props) {
        super(props);
        this.api = new Booze();
    }

     fetchBoozeBySelectedTab = async () => {
        this.cleanBoozes();
        this.cleanBoozeConditions();
        this.setHasPageItems(true);
         this.cleanBoozeNextIds();
         this.lastItemOfBooze = undefined;

        const valueOfCurrentTab = this.getValueOfSelectClickedTab();
        if(valueOfCurrentTab > 0)
            this.pushBoozeConditions({type: 'where', params: ['valueOfType', '==', this.getValueOfSelectClickedTab()]});
        await Util.syncDelay(20);
        await this.fetch(this.getComponent());

        // const boozes = await this.fetchBoozes(this.getComponent());
        // this.pushBoozes(...boozes);
    }

    /** -------------------- async api -------------------- **/
}

export default DionysusStore;
