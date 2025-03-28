const edit = true;

import {utiller as Util, exceptioner as ERROR, pooller as InfinitePool} from "utiller";
import _ from "lodash";
import UserInfoRef from "../../base/BaseUserInfo";
import Router from "../../router";
import BaseDionysusMaenadsComponent from "./BaseDionysusMaenadsComponent";

class ModularizedDionysusMaenadsComponent extends BaseDionysusMaenadsComponent {

    constructor(props) {
        super(props);
    }

    onDionysusMaenadsOptionDivClicked(param) {
        const option = param.object;
        this.getStore().setCurrentOption(option);
    }

    getInjectPropsOfDionysusMaenadsOptionNameChip(option) {
        const index = this.getStore().getIndexOfOption(option);
        return {color: _.isEqual(index, this.getStore().getIndexOfSelected(option)) ? 'error' : 'default'};
    }

    getMaenadsCount(maenads) {
        const count = super.getMaenadsCount(maenads);
        return count > 0 ? ` 剩 ${count} 個` : `未選擇`;
    }

    getMaenadsPrice(maenads) {
        const price = super.getMaenadsPrice(maenads);
        const judgement = _.startsWith(_.trim(price), '$') || _.startsWith(_.trim(price), '＄');
        return judgement ? price : `＄${price}`;
    }

    onDionysusMaenadsIncreaseIconButtonClicked(param) {
        this.getStore().validateCountOfOrder();
    }

    onDionysusMaenadsDecreaseIconButtonClicked(param) {
        this.getStore().validateCountOfOrder(false);
    }

    onDionysusMaenadsSubmitChipClicked(param) {
        const self = this;
        if (this.getStore().getIndexOfSelected() < 0) {
            this.getComponentInstance(true).showWarningSnackMessage(`尚未選擇商品`)
        } else {
            const maenads = param.object;
            const idOfBooze = maenads.getBooze().id;
            const idOfOption = maenads.getOptions()[this.getStore().getIndexOfSelected()].getValue();
            const count = _.toInteger(this.getStore().getCountOfSubmit())
            UserInfoRef.joinItemToCart({idOfBooze, idOfOption, count});
            if (UserInfoRef.isGotoCartieDirect())
                Router.gotoCartiePage(this.getComponentInstance())
            this.getComponentInstance(true).showInfoSnackMessage(`已加入購物車`);
            Util.syncDelay(1500).then(() => {
                self.dismiss();
            })
        }
    }
}

export default ModularizedDionysusMaenadsComponent;
