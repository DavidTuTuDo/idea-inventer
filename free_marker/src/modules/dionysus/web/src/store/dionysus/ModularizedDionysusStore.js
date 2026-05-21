const edit = true;

import { utiller as Util, exceptioner as ERROR, pooller as InfinitePool } from "utiller";
import { each, filter, size } from 'lodash-es';
import BaseDionysusStore from "./BaseDionysusStore";
import UserInfo from "../../base/BaseUserInfo";
import Booze from "../dionysusBooze";

const INDEX_VALUE_OF_SEARCH = 8591;

class ModularizedDionysusStore extends BaseDionysusStore {
    constructor(props) {
        super(props);
        this.apiOfBooze = new Booze();
    }

    async onInitialFetchBeginning() {
        this.clean();
        this.keyword4CompoundSearch = this.getParamOfKeywordInPath?.();
        if (size(this.keyword4CompoundSearch) > 1) {
            this.setValueOfSelectBoundClickedTab(INDEX_VALUE_OF_SEARCH);
            this.pushBoozeConditions({ type: "where", params: ["keywords", "array-contains", this.keyword4CompoundSearch] });
        }

        this.pushBoozeConditions({ type: "where", params: ["visibility", "==", true] });
    }

    async onInitialFetchCompleted(collection) {
        await super.onInitialFetchCompleted(collection);
        await Util.syncDelay(1);
        if (collection && size(collection.selectBounds) > 0) this.setSelectBounds(...[{ label: "一覽表", value: 0, type: "all" }, ...collection.selectBounds]);

        if (size(this.keyword4CompoundSearch) > 1)
            this.pushSelectBoundsByIndex(-1, { label: `搜尋「${this.keyword4CompoundSearch}」`, value: INDEX_VALUE_OF_SEARCH, type: "search" });

        if (collection && size(collection.selectBounds) === 0) this.pushSelectBoundsByIndex(0, { label: "一覽表", value: 0, type: "all" });
        if (UserInfo.isAdmin()) UserInfo.modifyEditPen(true);
    }

    fetchBoozeBySelectedTab = async () => {
        this.cleanBoozes();
        this.cleanBoozeConditions();
        this.setHasNextPageBehavior(true);
        this.cleanBoozeNextIds();
        this.lastItemOfBooze = undefined;
        const valueOfCurrentTab = this.getValueOfSelectBoundClickedTab();

        if (valueOfCurrentTab === INDEX_VALUE_OF_SEARCH && size(this.keyword4CompoundSearch) > 1) {
            this.pushBoozeConditions({ type: "where", params: ["keywords", "array-contains", this.keyword4CompoundSearch] });
        } else if (valueOfCurrentTab > 0) this.pushBoozeConditions({ type: "where", params: ["category", "array-contains", this.getValueOfSelectBoundClickedTab()] });
        await Util.syncDelay(20);
        const boozes = this.enrichBoozes(await this.fetchBoozes(this.getComponent(), { type: "where", params: ["visibility", "==", true] }));
        this.setBoozes(...boozes);
    };

    getCheckedItems = () => {
        return filter(this.getBoozes(), (each) => each.getChecked());
    };

    mvChecked2Head = async () => {
        const items = this.getCheckedItems();
        await this.apiOfBooze.updateBoozes(this.getComponent(), this.getCheckedItems());
        each(items, (item) => item.moveSelfToAside(false));
        await this.vanishEdit();
    };

    mvChecked2Down = async () => {
        const items = this.getCheckedItems();
        await this.apiOfBooze.updateBoozes(
            this.getComponent(),
            items.map((each) => ({ id: each.id, visibility: false }))
        );
        each(items, (item) => item.remove());
        await this.vanishEdit();
    };

    vanishEdit = async () => {
        await Util.syncDelay(1);
        UserInfo.modifyEditMode(false);
    };
}

export default ModularizedDionysusStore;
