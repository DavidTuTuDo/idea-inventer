const edit = true;

import { chain, last, size, sum, trim } from "lodash-es";
import BaseIreneTextsFetchStore from "./BaseIreneTextsFetchStore";
import { utiller as Util } from "utiller";

class ModularizedIreneTextsFetchStore extends BaseIreneTextsFetchStore {
    constructor(props) {
        super(props);
    }

    async onTextsFetchChangedNotify() {
        this.invalidate();
        await this.hookOfParamObject.onTextsFetchChanged(this.getStringsOfContent());
    }

    getStringsOfContent = () => {
        return this.getTitles()
            .map((title) => trim(title.getContent()))
            .filter((str) => Util.isString(str) && str !== "");
    }

    async onTextsFetchAppendNotify() {
        await this.hookOfParamObject.onTextsFetchAppendClicked(this.getStringsOfContent());
    }

    async onInitialFetchBeginning() {
        this.hookOfParamObject = this.getComponent(true).propsMobX().paramObject;
        this.invalidate();
    }

    invalidate() {
        if (this.hookOfParamObject && this.hookOfParamObject.autoIncrementOfTextsFetch()) {
            /** 自動增加index =>. 1. 2. 3.*/
            this.getTitles().forEach((title, index) => title.setIndex(`${sum([index, 1])}. `));
            /** 填入 =>. 1. 2. 3.*/
            if (size(last(this.getTitles()).getContent()) > 0 && size(this.getTitles()) < this.getMaximumRowOfTextsFetch()) this.pushTitle();
        }
    }

    getMaximumRowOfTextsFetch() {
        if (this.hookOfParamObject && this.hookOfParamObject.getMaximumRowOfTextsFetch) return Util.toNumber(this.hookOfParamObject.getMaximumRowOfTextsFetch());
        else return 300;
    }

    async onInitialCompleted(props) {
        const exist = this.hookOfParamObject && this.hookOfParamObject.getDefaultTextsOfTextFetch;
        const texts = exist ? await this.hookOfParamObject.getDefaultTextsOfTextFetch() : [];
        if (size(texts) > 0) {
            this.cleanTitles();
            this.pushTitles(...texts);
        }
        this.invalidate();
    }
}

export default ModularizedIreneTextsFetchStore;
