import BaseHistoryRhythmStore from "./BaseHistoryRhythmStore";
import {
    utiller as Util,
    exceptioner as ERROR,
    pooller as InfinitePool,
} from "utiller";
import _ from "lodash";
import libpath from "path";
import {Application} from "../../";
import Config from "../../config";
import Router from "../../router";
import Cookie from "../../cookie";
import UserInfoRef from "../../base/BaseUserInfo";
import {
    makeAutoObservable,
    makeObservable,
    action,
    observable,
    comparer,
    computed,
    autorun,
    runInAction,
} from "mobx";
import PersonalRhythm from "../personalRhythm";
import BaseStore from "../../base/BaseStore";

class HistoryRhythmStore extends BaseHistoryRhythmStore {
    /** -------------------- fields -------------------- **/
    /** -------------------- functions -------------------- **/

    constructor(props) {
        super(props);
        this.personalRhythm.enableManual();
    }

    async fetch(view) {
        const result = {
            ...{},
        };
        await new InfinitePool(1).runByEachTask([
            async () => {
                result.puOfRecords = UserInfoRef.isLoginWithSucceed()
                    ? await this.fetchPuOfRecords(view)
                    : this.puOfRecords;
            },
        ]);
        this.fromJson(result);
        return result;
    }

    async onInitialFetchCompleted(collection) {
        this.personalRhythm.push
    }

    /** -------------------- async api -------------------- **/
}

export default HistoryRhythmStore;
