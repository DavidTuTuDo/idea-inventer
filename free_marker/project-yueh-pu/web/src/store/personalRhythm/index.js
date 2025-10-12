const edit = true;
import BasePersonalRhythmStore from "./BasePersonalRhythmStore";
import { utiller as Util } from "utiller";
import _ from "lodash";
import { action } from "mobx";

class PersonalRhythmStore extends BasePersonalRhythmStore {
    /** -------------------- fields -------------------- **/
    /** -------------------- functions -------------------- **/

    /** 讓fetch功能改成手動的模式，因為共用history 和 favorite */
    controlOfManual = false;

    onClickOfDeleteOfMenuItem;

    enableManual() {
        this.controlOfManual = true;
    }

    setOnClickOfDeleteMenuItem(func) {
        this.onClickOfDeleteOfMenuItem = func;
    }

    getOnClickOfDeleteOfMenuItem = (item) => {
        return this.onClickOfDeleteOfMenuItem(item);
    };

    hasOnClickOfDeleteOfMenuItem() {
        return _.isFunction(this.onClickOfDeleteOfMenuItem);
    }

    constructor(props) {
        super(props);
    }

    async fetch(view) {
        return this.controlOfManual ? await Util.syncDelay(1500) : await super.fetch(view);
    }

    ruleOfPreviouslySort(items) {
        if (this.controlOfManual) return items;

        let latest = items.map((item) => {
            return {
                ...item,
                title: `${item.singer} 系列`
            };
        });
        return latest;
    }

    @action
    invalidate() {
        if (this.controlOfManual) return;

        const itemsOfPu = _.orderBy(this.getFavoritePus(), ["singer", "name"]);
        for (const item of itemsOfPu) {
            item.setNeedTitle(true);
            const index = _.indexOf(itemsOfPu, item);
            if (index > 0) {
                const itemOfPreview = itemsOfPu[index - 1];
                if (_.isEqual(itemOfPreview.singer, item.singer)) item.setNeedTitle(false);
            }
        }
        this.setFavoritePus(...itemsOfPu);
    }

    /** -------------------- async api -------------------- **/
}

export default PersonalRhythmStore;
