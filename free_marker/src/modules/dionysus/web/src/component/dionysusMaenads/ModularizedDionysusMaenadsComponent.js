const edit = true;

import { utiller as Util } from "utiller";
import { toInteger } from "lodash-es";
import UserInfoRef from "../../base/BaseUserInfo";
import Router from "../../router";
import BaseDionysusMaenadsComponent from "./BaseDionysusMaenadsComponent";
import FlyToCartie from "../../base/FlyToCartie";
import React from "react";
import i18n from "../../i18n";
import { toJS } from "mobx";

class ModularizedDionysusMaenadsComponent extends BaseDionysusMaenadsComponent {
    constructor(props) {
        super(props);
    }

    getInjectPropsOfDionysusMaenadsSubmitChip(dionysusMaenads) {
        return { disabled: dionysusMaenads.getCountOfSubmit() <= 0 };
    }

    onDionysusMaenadsCountOfSubmitTextFieldChange(param) {
        if (this.getStore().getCountOfSubmit() >= this.getStore().getCount()) this.getStore().setCountOfSubmit(this.getStore().getCount());
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
            color: Util.isEqual(option.getSelect(), true) ? "error" : "default"
        };
    }

    onDionysusMaenadsVariantOptionLabelChipClicked(param) {
        this.exeAsyncT(this.getStore().setSelectedOption(param.object));
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
        const store = this.getStore();
        const component = this.getComponentInstance();

        if (!store.getCurrentOptionExist()) {
            component.showWarningSnackMessage(`尚未選擇商品`);
            return;
        }

        const maenads = param.object;
        const booze = toJS(maenads.getBooze());
        const variant = toJS(maenads.getSelectedVariant());
        const quantity = toInteger(store.getCountOfSubmit());

        const cartItem = {
            idOfBooze: booze.id,
            idOfVariant: variant.id,
            isTaskJob: variant.isTaskJob,
            quantity,
            idOfAuthor: variant.idOfAuthor,
            quantityOfMaximum: variant.quantity,
            component: this.getComponentInstance()
        };

        const result = UserInfoRef.joinItemToCart(cartItem);
        if (!result) return; /** 因各種原因無法添加到購物車 */
        Util.appendInfo(`isGo2CartieDirect -> ${UserInfoRef.isGotoCartieDirect()}`);
        if (UserInfoRef.isGotoCartieDirect()) Router.gotoCartiePage(component);
        else {
            component.showInfoSnackMessage(`已加入購物車`);
            maenads.toggleCartieAnimate();
        }
    }

    getDionysusMaenadsSubmit(dionysusMaenads) {
        return this.handleTextString(UserInfoRef.isGotoCartieDirect() ? i18n.location().dionysusBacchusBought : i18n.location().dionysusMaenadsSubmit);
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
