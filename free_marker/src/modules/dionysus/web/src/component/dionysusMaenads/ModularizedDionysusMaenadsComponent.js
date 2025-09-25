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

    getInjectPropsOfDionysusMaenadsSubmitChip(dionysusMaenads) {
        return { disabled: dionysusMaenads.getCountOfSubmit() <= 0 };
    }

    getInjectStyleOfDionysusMaenadsRangeOfPriceTypography(dionysusMaenads) {
        return Util.getVisibleOrNone(!this.getStore().getCurrentOptionExist(), true);
    }

    getWrapInjectStyleOfDionysusMaenadsPriceTypography(dionysusMaenads) {
        return Util.getVisibleOrNone(this.getStore().getCurrentOptionExist(), true);
    }

    getInjectPropsOfDionysusMaenadsVariantOptionLabelChip(option) {
        return {
            disabled: option.getQuantity() <= 0,
            color: _.isEqual(option.getSelect(), true) ? "error" : "default"
        };
    }

    onDionysusMaenadsVariantOptionLabelChipClicked(param) {
        this.getStore().setSelectedOption(param.object).then();
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
            const quantity = _.toInteger(this.getStore().getCountOfSubmit());
            const quantityOfMaximum = maenads.getSelectedVariant().quantity;
            UserInfoRef.joinItemToCart({ quantityOfMaximum, idOfBooze, idOfVariant, quantity, nameOfBooze: maenads.getBooze().name });
            if (UserInfoRef.isGotoCartieDirect()) Router.gotoCartiePage(this.getComponentInstance());
            self.getComponentInstance(true).showInfoSnackMessage(`已加入購物車`);
            if (!UserInfoRef.isGotoCartieDirect()) maenads.toggleCartieAnimate();
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
