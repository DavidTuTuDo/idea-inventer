const edit = true;

import { utiller as Util } from "utiller";
import _ from "lodash";
import Router from "../../router";
import BaseDionysusGaiaComponent from "./BaseDionysusGaiaComponent";
import Config from "../../config";

class ModularizedDionysusGaiaComponent extends BaseDionysusGaiaComponent {
    stateOfUpload = Config.ImageUploadMethod.Minion;

    constructor(props) {
        super(props);
    }

    getInjectStyleOfDionysusGaiaAddImageIconButton(dionysusGaia) {
        return Util.getVisibleOrNone(dionysusGaia.getLengthOfBriefPhoto() === 0);
    }

    onApolloDialogSubmit = async (...param) => {
        const result = param.pop();
        this.exeAsyncT(this.getStore().setScheduleResult(result));
    };

    onDionysusGaiaAppendMainChipClicked(param) {
        this.getStore().setSelected("main");
    }

    onDionysusGaiaAppendSubChipClicked(param) {
        this.getStore().setSelected("sub");
    }

    onDionysusGaiaJoinPhotoChipClicked(param) {
        this.stateOfUpload = Config.ImageUploadMethod.Minion;
        this.enableImageSelectView(true);
    }

    onDionysusGaiaAddImageIconButtonClicked(param) {
        this.stateOfUpload = Config.ImageUploadMethod.Minion;
        this.enableImageSelectView(true);
    }

    onDionysusGaiaJoinBanChipClicked(param) {
        this.stateOfUpload = Config.ImageUploadMethod.Banner;
        this.enableImageSelectView(true);
    }

    onDionysusGaiaBriefPhotoDeleteIconButtonClicked(param) {
        if (this.getStore().getLengthOfBriefPhoto() <= 1) return this.showWarningSnackMessage(`需要至少一張商品圖片`);
        const photo = param.object;
        if (photo !== undefined) photo.remove();
    }

    onDionysusGaiaBriefBanDeleteIconButtonClicked(param) {
        const banner = param.object;
        if (banner !== undefined) banner.remove();
    }

    onDionysusGaiaBriefPhotoHrefImgClicked(param) {
        const photo = param.object;
        if (photo !== undefined) photo.moveSelfToAside(false);
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
        this.exeAsyncT(this.getStore().uploadBriefImages(files, this.stateOfUpload));
    }

    onDionysusGaiaCreateChipClicked(param) {
        /** 新增一個booze */
        this.exeAsyncT(this.getStore().updateBooze4Sure());
    }

    onDionysusGaiaUpdateChipClicked(param) {
        this.exeAsyncT(this.getStore().updateBooze4Sure());
    }

    getInjectStyleOfDionysusGaiaUpdateChip(dionysusGaia) {
        return Util.getVisibleOrNone(dionysusGaia.getInitCompleted());
    }

    getInjectStyleOfDionysusGaiaCreateChip(dionysusGaia) {
        return Util.getVisibleOrNone(!dionysusGaia.getInitCompleted());
    }

    onDionysusGaiaRecoverChipClicked(param) {
        this.exeAsyncT(this.getStore().recoverBooze4Sure());
    }

    onDionysusGaiaDeletedChipClicked(param) {
        const self = this;
        this.exeAsyncT(self.getStore().deleteBooze4Sure(), { thenDo: () => Router.gotoDionysusPage(self) });
    }

    onDionysusGaiaVisibilitySwitchChange(param) {
        this.exeAsyncT(this.getStore().onVisibilityChanged());
    }

    isValidOfParamOfPid(pid) {
        return true;
    }

    isProductSell(param) {
        return Util.isEqual(1, param.getSelectedTypeOfProp());
    }

    isClassSell(param) {
        return Util.isEqual(2, param.getSelectedTypeOfProp());
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

    getDionysusGaiaLabelOfMainType(dionysusGaia) {
        return this.isClassSell(dionysusGaia) ? "日期" : "主選項（款式、型號）";
    }

    getDionysusGaiaLabelOfSubType(dionysusGaia) {
        return this.isClassSell(dionysusGaia) ? "時段" : "副選項（顏色、尺寸）";
    }

    getStyleOfVariantSetting = (dionysusGaia) => {
        const alert = {
            background: "linear-gradient(145deg, #f2d6d6, #e6b8b8)", // 沉穩暗紅漸層
            border: "1.5px dashed #b85c5c", // 深紅虛線
            cursor: "pointer",
            borderRadius: "10px",
            boxShadow: "inset 0 1px 3px rgba(255, 255, 255, 0.2), 0 2px 6px rgba(184, 92, 92, 0.25)",
            color: "inherit", // 保持文字原本顏色
            transition: "all 0.25s ease",
            padding: "8px" // 可依需求調整
        };
        const visible = Util.getVisibleOrNone(dionysusGaia.getInitCompleted(), true);
        return this.getStore().getIsNewBie() ? { ...visible, ...alert } : visible;
    };

    getWrapInjectStyleOfDionysusGaiaAreaOfPhotoSetDiv(dionysusGaia) {
        return this.getStyleOfVariantSetting(dionysusGaia);
    }

    getWrapInjectStyleOfDionysusGaiaAreaOfPriceSetDiv(dionysusGaia) {
        return this.getStyleOfVariantSetting(dionysusGaia);
    }

    getWrapInjectStyleOfDionysusGaiaAreaOfQuantitySetDiv(dionysusGaia) {
        return this.getStyleOfVariantSetting(dionysusGaia);
    }

    onTypeOfPropSelectedChange(value, param) {
        if (this.getStore().getSelectedTypeOfProp() === 2) {
            //1：商品 2：課程
            //選到課程的spinner
            this.getStore().cleanBriefMains();
            this.getStore().cleanBriefSubs();
        }
    }
}

export default ModularizedDionysusGaiaComponent;
