const edit = true;

import { utiller as Util } from "utiller";
import _ from "lodash";
import Router from "../../router";
import BaseDionysusGaiaComponent from "./BaseDionysusGaiaComponent";

class ModularizedDionysusGaiaComponent extends BaseDionysusGaiaComponent {
    constructor(props) {
        super(props);
    }

    getInjectStyleOfDionysusGaiaAddImageIconButton(dionysusGaia) {
        return Util.getVisibleOrNone(dionysusGaia.getLengthOfBriefPhoto() === 0);
    }

    onDionysusGaiaAddImageIconButtonClicked(param) {
        this.enableImageSelectView(true);
    }

    onApolloDialogSubmit = async (...param) => {
        const result = param.pop();
        this.getStore().setScheduleResult(result).then();
    };

    onDionysusGaiaAppendMainChipClicked(param) {
        this.getStore().setSelected("main");
    }

    onDionysusGaiaAppendSubChipClicked(param) {
        this.getStore().setSelected("sub");
    }

    onDionysusGaiaJoinPhotoChipClicked(param) {
        this.enableImageSelectView(true);
    }

    onDionysusGaiaBriefPhotoDeleteIconButtonClicked(param) {
        if (this.getStore().getLengthOfBriefPhoto() <= 1) return this.showWarningSnackMessage(`需要至少一張商品圖片`);
        const photo = param.object;
        if (photo !== undefined) photo.remove();
    }

    /** 主選項 */
    onDionysusGaiaBriefMainLabelChipDeleted(param) {
        if (this.getStore().getInitCompleted()) return this.showWarningSnackMessage(`商品已成立，無法刪除選項`);
        const main = param.object;
        if (main !== undefined) main.remove();
    }

    /** 副選項 */
    onDionysusGaiaBriefSubLabelChipDeleted(param) {
        if (this.getStore().getInitCompleted()) return this.showWarningSnackMessage(`商品已成立，無法刪除選項`);

        const sub = param.object;
        if (sub !== undefined) sub.remove();
    }

    getInjectStyleOfDionysusGaiaRecoverChip(dionysusGaia) {
        return Util.getVisibleOrNone(!Util.isUndefinedNullEmpty(this.getStore().getIdOfBooze()), true);
    }

    getInjectStyleOfDionysusGaiaDeletedChip(dionysusGaia) {
        return Util.getVisibleOrNone(!Util.isUndefinedNullEmpty(this.getStore().getIdOfBooze()), true);
    }

    onDionysusGaiaNameTextFieldChange(param) {
        this.getStore().onNameFieldChanged();
    }

    onDionysusGaiaStatementTextFieldChange(param) {
        this.getStore().onStatementFieldChanged();
    }

    onFilesSelected(files) {
        this.getStore().uploadBriefImages(files).then();
    }

    onDionysusGaiaCreateChipClicked(param) {
        /** 新增一個booze */
        this.getStore().updateBooze4Sure().then();
    }

    onDionysusGaiaRecoverChipClicked(param) {
        this.getStore().recoverBooze4Sure().then();
    }

    onDionysusGaiaDeletedChipClicked(param) {
        const self = this;
        this.getStore()
            .deleteBooze4Sure()
            .then(() => Router.gotoDionysusPage(self));
    }

    onDionysusGaiaVisibilitySwitchChange(param) {
        this.getStore().onVisibilityChanged().then();
    }

    isValidOfParamOfPid(pid) {
        return true;
    }

    isProductSell(param) {
        return _.isEqual(1, param.getSelectedTypeOfProp());
    }

    isClassSell(param) {
        return _.isEqual(2, param.getSelectedTypeOfProp());
    }

    getInjectStyleOfDionysusGaiaAppendSubChip(dionysusGaia) {
        return Util.getVisibleOrNone(this.isProductSell(dionysusGaia), true);
    }

    getInjectStyleOfDionysusGaiaAppendTaskChip(dionysusGaia) {
        return Util.getVisibleOrNone(this.isClassSell(dionysusGaia), true);
    }

    getInjectStyleOfDionysusGaiaAppendMainChip(dionysusGaia) {
        return Util.getVisibleOrNone(this.isProductSell(dionysusGaia), true);
    }

    /** 可否自取（實體商品）*/
    getInjectStyleOfDionysusGaiaTakenDiv(dionysusGaia) {
        return Util.getVisibleOrNone(false);
    }

    /** 到府授課（課程商品）-> 結帳時需填寫地址）*/
    getInjectStyleOfDionysusGaiaDestDiv(dionysusGaia) {
        return Util.getVisibleOrNone(this.isClassSell(dionysusGaia), true);
    }

    /** 避免衝堂（課程商品）-> 會增加用戶難度，給他們私聊（先隱藏起來）*/
    getInjectStyleOfDionysusGaiaAreaOfTrunkDiv(dionysusGaia) {
        return Util.getVisibleOrNone(false, true);
    }

    getInjectPropsOfDionysusGaiaAppendTaskChip(dionysusGaia) {
        return { disabled: dionysusGaia.getInitCompleted() };
    }

    onDionysusGaiaBackToHomeChipClicked(param) {
        Router.gotoDionysusPage(this);
    }

    getDionysusGaiaCreate(dionysusGaia) {
        return dionysusGaia.getInitCompleted() ? "更新" : "下一步";
    }

    getDionysusGaiaLabelOfMainType(dionysusGaia) {
        return this.isClassSell(dionysusGaia) ? "日期" : "主選項（款式、型號）";
    }

    getDionysusGaiaLabelOfSubType(dionysusGaia) {
        return this.isClassSell(dionysusGaia) ? "時段" : "副選項（顏色、尺寸）";
    }

    getWrapInjectStyleOfDionysusGaiaAreaOfPhotoSetDiv(dionysusGaia) {
        return Util.getVisibleOrNone(dionysusGaia.getInitCompleted(), true);
    }

    getWrapInjectStyleOfDionysusGaiaAreaOfPriceSetDiv(dionysusGaia) {
        return Util.getVisibleOrNone(dionysusGaia.getInitCompleted(), true);
    }

    getWrapInjectStyleOfDionysusGaiaAreaOfQuantitySetDiv(dionysusGaia) {
        return Util.getVisibleOrNone(dionysusGaia.getInitCompleted(), true);
    }
}

export default ModularizedDionysusGaiaComponent;
