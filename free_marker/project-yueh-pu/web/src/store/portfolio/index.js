const edit = true;

import BasePortfolioStore from "./BasePortfolioStore";
import { utiller as Util } from "utiller";
import { remove, size } from 'lodash-es';
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
            case "preludes":
                this.setRhythmConditions([
                    { type: "where", params: ["hasPrelude", "==", true] },
                    { type: "orderBy", params: ["popularLevel", "desc"] }
                ]);
                return await super.fetch(this.getComponent());
            case "search":
                const keywords =
                    this.App()
                        .getNavigatorStore()
                        .getKeywords()
                        .map((each) => each.data()) ?? [];
                const fuse = new Fuse(keywords, { includeScore: true, keys: ["label", "value"] });
                let suggests = fuse.search(view.paramOfId).map((each) => each.item); //_.orderBy(fuse.search(view.paramOfId), 'score', 'asc')
                // console.log('suggests ==> ', 'search keyword ==> ', view.paramOfId, '\n\n', suggests);
                const rhythms = remove(suggests, (each) => Util.isEqual(each.type, 11));
                /** 先抓出type = 11, 歌曲的關鍵字*/
                this.pushNextRhythmIDs(...rhythms.map((each) => each.uid));
                if (size(suggests) > 0) {
                    /** 表示只剩下歌手的關鍵字 */
                    const idsOfSinger = Util.getArrayOfSize(suggests, 10).map((each) => each.uid);
                    /** 因為firestore只接受10個條件*/
                    const api = new Rhythm();
                    const nexts = await api.fetchRhythmsOfLimitation(this.getComponent(), "in", "idOfSinger", ...idsOfSinger);
                    this.pushNextRhythmIDs(...nexts.map((each) => each.id));
                }
                break;
            /** 利用id去搜尋歌手作品清單*/
            case "list":
                this.setRhythmConditions([
                    { type: "where", params: ["idOfSinger", "==", view.paramOfId] },
                    { type: "orderBy", params: ["popularLevel", "desc"] }
                ]);
                return await super.fetch(this.getComponent());
            default:
                this.setErrorMsg(`帶入參數錯誤`);
                /** 顯示沒有搜尋項目*/
                break;
        }
    }

    /** -------------------- async api -------------------- **/
}

export default PortfolioStore;
