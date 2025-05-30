const edit = true;

import { utiller as Util, exceptioner as ERROR, pooller as InfinitePool } from "utiller";
import _ from "lodash";
import BaseDionysusTextFetcherStore from "./BaseDionysusTextFetcherStore";

class ModularizedDionysusTextFetcherStore extends BaseDionysusTextFetcherStore {
    constructor(props) {
        super(props);
    }

    async onTextFetcherChangedNotify() {
        this.invalidate();
        await this.hookOfParamObject.onTextFetcherChanged();
    }

    async onTextFetcherAppendNotify() {
        await this.hookOfParamObject.onTextFetcherAppendClicked();
    }

    async onInitialFetchBeginning() {
        this.hookOfParamObject = this.getComponent(true).propsMobX().paramObject;
    }

    invalidate() {
        this.getTitles().forEach((title, index) => title.setIndex(_.sum([index, 1])));
        if (_.size(_.last(this.getTitles()).getMain()) > 0) this.pushTitle();
    }

    async onInitialCompleted(props) {
        const exist = this.hookOfParamObject && this.hookOfParamObject.getDefaultTextsOfTextFetcher;
        const texts = exist ? await this.hookOfParamObject.getDefaultTextsOfTextFetcher() : [];
        if (_.size(texts) > 0) {
            this.cleanTitles();
            this.pushTitles(...texts.map((each) => Util.getObject("main", each)));
        }
        this.invalidate();
    }

    /** -------------------- async api -------------------- **/
}

export default ModularizedDionysusTextFetcherStore;
