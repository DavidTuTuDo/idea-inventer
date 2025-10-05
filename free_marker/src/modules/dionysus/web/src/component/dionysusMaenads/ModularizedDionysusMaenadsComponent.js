const edit = true;

import { utiller as Util } from "utiller";
import _ from "lodash";
import UserInfoRef from "../../base/BaseUserInfo";
import Router from "../../router";
import BaseDionysusMaenadsComponent from "./BaseDionysusMaenadsComponent";
import FlyToCartie from "../../base/FlyToCartie";
import React from "react";

const MAX_BADGE_OF_UN_SIGN = 2;

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
        const store = this.getStore();
        const component = this.getComponentInstance();

        if (!store.getCurrentOptionExist()) {
            component.showWarningSnackMessage(`尚未選擇商品`);
            return;
        }

        const maenads = param.object;
        const booze = maenads.getBooze();
        const variant = maenads.getSelectedVariant();
        const quantity = _.toInteger(store.getCountOfSubmit());
        const quantityOfMaximum = variant.quantity;

        const cartItem = {
            quantityOfMaximum,
            idOfBooze: booze.id,
            idOfVariant: variant.id,
            quantity,
            isTaskJob: variant.isTaskJob,
            idOfAuthor: variant.idOfAuthor,
            allowSelfPickUp: variant.allowSelfPickUp,
            isHomeTeaching: variant.isHomeTeaching,
            nameOfBooze: booze.name
        };

        const isLogin = UserInfoRef.isLoginWithSucceed();
        const badgeCount = UserInfoRef.getCountOfBadge();

        const canJoinUnSign = !isLogin && badgeCount < MAX_BADGE_OF_UN_SIGN;
        const canJoin = isLogin || canJoinUnSign;

        if (!canJoin) return component.showWarningSnackMessage(`未登入用戶限購 ${MAX_BADGE_OF_UN_SIGN} 件`);

        UserInfoRef.joinItemToCart(cartItem);
        Util.appendInfo(`isGo2CartieDirect -> ${UserInfoRef.isGotoCartieDirect()}`);
        if (UserInfoRef.isGotoCartieDirect()) Router.gotoCartiePage(component);
        else {
            component.showInfoSnackMessage(`已加入購物車`);
            maenads.toggleCartieAnimate();
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
