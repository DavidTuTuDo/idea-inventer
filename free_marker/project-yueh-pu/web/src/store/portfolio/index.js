import BasePortfolioStore from "./BasePortfolioStore";
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
import Fuse from "fuse.js";

class PortfolioStore extends BasePortfolioStore {
    /** -------------------- fields -------------------- **/
    /** -------------------- functions -------------------- **/

    constructor(props) {
        super(props);
    }

    async fetch(view) {
        switch (view.paramOfType) {
            case 'search':
                // this.getComponent().clearScrollToBottomJobs();
                const keywords = Application.getNavigatorStore().getKeywords().map(each => each.data()) ?? [];
                const fuse = new Fuse(keywords, {includeScore: true, keys: ['label', 'value']})
                const result = fuse.search(view.paramOfId);
                console.log(result);
                const suggests = _.orderBy(result, 'score', 'asc')
                this.pushNextRhythmIDs(...suggests.map((each) => each.item.uid))
                // console.log('suggests ==> ', 'search keyword ==> ', filter.id, '\n\n', suggests);
                break;
            /** 利用id去搜尋歌手作品清單*/
            case 'list':
                break;
            default:
                /** 顯示沒有搜尋項目*/
                break;
        }
    }

    /** -------------------- async api -------------------- **/
}

export default PortfolioStore;
