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
import Rhythm from "../portfolioRhythm";
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
                const keywords = Application.getNavigatorStore().getKeywords().map(each => each.data()) ?? [];
                const fuse = new Fuse(keywords, {includeScore: true, keys: ['label', 'value']})
                let suggests = fuse.search(view.paramOfId).map((each) => each.item) //_.orderBy(fuse.search(view.paramOfId), 'score', 'asc')
                // console.log('suggests ==> ', 'search keyword ==> ', view.paramOfId, '\n\n', suggests);
                const rhythms = _.remove(suggests, (each) => _.isEqual(each.type, 11))
                /** 先抓出type = 11, 歌曲的關鍵字*/
                this.pushNextRhythmIDs(...rhythms.map((each) => each.uid));
                if (_.size(suggests) > 0) {
                    /** 表示只剩下歌手的關鍵字 */
                    const idsOfSinger = Util.getArrayOfSize(suggests, 10).map((each) => each.uid)
                    /** 因為firestore只接受10個條件*/
                    const api = new Rhythm();
                    const nexts = await api.fetchRhythmsOfLimitation(this.getComponent(),
                        'in', 'idOfSinger', ...idsOfSinger);
                    this.pushNextRhythmIDs(...nexts.map((each) => each.id));
                }
                break;
            /** 利用id去搜尋歌手作品清單*/
            case 'list':
                this.setRhythmConditions(
                    [
                        {where: (stmt) => stmt.where('idOfSinger', '==', view.paramOfId)},
                        {orderBy: (stmt) => stmt.orderBy('popularLevel', 'desc')}
                    ]
                );
                return await super.fetch(this.getComponent());
                break;
            default:
                this.setErrorMsg(`帶入參數錯誤`)
                /** 顯示沒有搜尋項目*/
                break;
        }
    }

    /** -------------------- async api -------------------- **/
}

export default PortfolioStore;
