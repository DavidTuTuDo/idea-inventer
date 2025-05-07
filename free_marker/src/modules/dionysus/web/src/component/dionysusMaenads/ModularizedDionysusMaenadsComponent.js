const edit = true;

import { utiller as Util, exceptioner as ERROR, pooller as InfinitePool } from "utiller";
import _ from "lodash";
import UserInfoRef from "../../base/BaseUserInfo";
import Router from "../../router";
import BaseDionysusMaenadsComponent from "./BaseDionysusMaenadsComponent";
import FlyToCartie from "../../base/FlyToCartie";
import React from "react";

class ModularizedDionysusMaenadsComponent extends BaseDionysusMaenadsComponent {
    constructor(props) {
        super(props);
    }

    getInjectStyleOfDionysusMaenadsRangeOfPriceTypography(dionysusMaenads) {
        return Util.getVisibleOrNone(!this.getStore().getCurrentOptionExist(), true);
    }

    getWrapInjectStyleOfDionysusMaenadsPriceTypography(dionysusMaenads) {
        return Util.getVisibleOrNone(this.getStore().getCurrentOptionExist(), true);
    }

    getInjectPropsOfDionysusMaenadsVariantOptionNameChip(option) {
        return { color: _.isEqual(option.getSelect(), true) ? "error" : "default" };
    }

    onDionysusMaenadsVariantOptionNameChipClicked(param) {
        this.getStore().setSelectedOption(param.object);
    }

    getMaenadsCount(maenads) {
        const count = super.getMaenadsCount(maenads);
        return count > 0 ? ` 剩 ${count} 個` : `未選擇`;
    }

    onDionysusMaenadsIncreaseIconButtonClicked(param) {
        this.getStore().validateCountOfOrder();
    }

    onDionysusMaenadsDecreaseIconButtonClicked(param) {
        this.getStore().validateCountOfOrder(false);
    }

    onDionysusMaenadsSubmitChipClicked(param) {
        const self = this;
        if (!this.getStore().getCurrentOptionExist()) {
            this.getComponentInstance(true).showWarningSnackMessage(`尚未選擇商品`);
        } else {
            const maenads = param.object;
            const idOfBooze = maenads.getBooze().id;
            const idOfVariant = maenads.getSelectedVariant().id;
            const count = _.toInteger(this.getStore().getCountOfSubmit());
            UserInfoRef.joinItemToCart({ idOfBooze, idOfVariant, count, nameOfBooze: maenads.getBooze().name });
            if (UserInfoRef.isGotoCartieDirect()) Router.gotoCartiePage(this.getComponentInstance());
            self.getComponentInstance(true).showInfoSnackMessage(`已加入購物車`);
            maenads.toggleCartieAnimate();
            Util.syncDelay(1500).then(() => {
                self.dismiss();
            });
        }
    }

    /** React.render() */
    getInjectWrapViewOfDionysusMaenadsSubmitChip(dionysusMaenads) {
        return (
            <FlyToCartie
                direction={"rightTop"}
                duration={1.2}
                fly={dionysusMaenads.getCartieAnimate()}
                imageSrc={dionysusMaenads.getPhoto()}
                onComplete={() => dionysusMaenads.setCartieAnimate(false)}
            />
        );
    }
}

export default ModularizedDionysusMaenadsComponent;
