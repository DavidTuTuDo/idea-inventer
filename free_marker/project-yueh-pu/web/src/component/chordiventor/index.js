const edit = true;

import { inject } from "mobx-react";
import BaseChordiventorComponent from "./BaseChordiventorComponent";
import { utiller as Util } from "utiller";
import { observer } from "mobx-react";
import UserInfo from "../../base/BaseUserInfo";
import Router from "../../router";
import { isMobile, isTablet } from "react-device-detect";

class ChordiventorComponent extends BaseChordiventorComponent {
    constructor(props) {
        super(props);
    }

    getInjectPropsOfChordiventorTxtTextField(chordiventor) {
        if (isMobile || isTablet) return { inputProps: { style: { fontSize: "0.55rem" } } };
        else return { inputProps: { style: { fontSize: "0.82rem" } } };
    }

    getInjectStyleOfChordiventorClearIdChip(chordiventor) {
        return Util.getVisibleOrNone(UserInfo.isAdmin(), true);
    }

    getWrapInjectStyleOfChordiventorIdOfGuitarPuTextField(chordiventor) {
        return Util.getVisibleOrNone(UserInfo.isAdmin(), true);
    }

    getWrapInjectStyleOfChordiventorIdOfSingerTextField(chordiventor) {
        return Util.getVisibleOrNone(UserInfo.isAdmin(), true);
    }

    onChordiventorClearChipClicked(param) {
        this.getStore().cleanUp();
    }

    onChordiventorLoadChipClicked(param) {
        this.exeAsyncT(this.getStore().loadLatestData());
    }

    onChordiventorPersistChipClicked(param) {
        /** 按下發佈按鈕 */
        const self = this;
        this.getStore()
            .submitCustomPu()
            .then((result) => {
                if (result) Router.gotoHomePage(self);
            });
    }

    onChordiventorClearIdChipClicked(param) {
        this.getStore().removeIdOfGuitarPu();
    }

    onChordiventorTxtTextFieldChange(param) {
        this.getStore().invalidate();
    }

    onChordiventorCancelChipClicked(param) {
        const self = this;
        self.getStore()
            .persistent()
            .then((result) => {
                if (result) Router.gotoHomePage(self);
            });
    }

    onChordiventorNameTextFieldChange(param) {
        this.getStore().invalidate();
    }

    onChordiventorSingerAutocompleteChange(param) {
        this.getStore().invalidate();
    }

    onChordiventorInputOfSingerTextFieldChange(param) {
        this.getStore().invalidate({ cleanIdOfSinger: true });
    }

    onChordiventorSpeedTextFieldChange(param) {
        this.getStore().invalidate();
    }

    /** 女性建議調性 */
    onTonalityOfFemaleSelectedChange(value, param) {
        this.getStore().invalidate();
    }

    /** 男生建議調性 */
    onTonalityOfMaleSelectedChange(value, param) {
        this.getStore().invalidate();
    }

    /** 原曲調性 */
    onTonalityOfOriginalSelectedChange(value, param) {
        this.getStore().invalidate();
    }

    /** 譜曲調性 */
    onTonalityOfContextSelectedChange(value, param) {
        this.getStore().invalidate();
    }

    isValidOfParamOfIdOfGuitarPu(idOfGuitarPu) {
        return _.size(idOfGuitarPu) >= 4;
    }

    onChordiventorRotateChipClicked(param) {
        this.getStore().toggleVertical();
    }

    getInjectStyleOfChordiventorBriefDiv(chordiventor) {
        return {
            flexDirection: this.getStore().getVertical() ? "column" : "row",
            alignItems: this.getStore().getVertical() ? "center" : "flex-start"
        };
    }

    getChordiventorRotate(chordiventor) {
        return chordiventor.getVertical() ? "平行" : "垂直";
    }

    getInjectStyleOfChordiventorRotateChip(chordiventor) {
        return Util.getVisibleOrNone(!isMobile && !isTablet, true);
    }

    /** -------------------- async api -------------------- **/
}

export default ChordiventorComponent;
