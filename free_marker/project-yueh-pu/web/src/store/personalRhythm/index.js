import BasePersonalRhythmStore from "./BasePersonalRhythmStore";
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
import GuitarPuNote from "../personalRhythmGuitarPuNote";
import FavoritePu from "../personalRhythmFavoritePu";
import BaseStore from "../../base/BaseStore";

class PersonalRhythmStore extends BasePersonalRhythmStore {
    /** -------------------- fields -------------------- **/
    /** -------------------- functions -------------------- **/

    constructor(props) {
        super(props);
    }

    ruleOfPreviouslySort(items) {
        let latest = items.map(item => {
            return {
                ...item,
                title: `${item.singer} 系列`,
            }
        })
        return latest;
    }

    @action
    invalidate() {
        const itemsOfPu = this.getFavoritePus();
        for(const item of itemsOfPu){
            item.setNeedTitle(true);
            const index = _.indexOf(itemsOfPu,item);
            if (index > 0) {
                const itemOfPreview = itemsOfPu[index - 1];
                if (_.isEqual(itemOfPreview.singer, item.singer)) {
                    item.setNeedTitle(false);
                }
            }
        }
        this.setGuitarPuNotes(..._.orderBy(itemsOfPu,['singer','name']));
    }

    /** -------------------- async api -------------------- **/
}

export default PersonalRhythmStore;
