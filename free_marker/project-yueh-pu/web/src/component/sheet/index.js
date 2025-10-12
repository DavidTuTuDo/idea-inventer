const edit = true;
import { inject, observer } from "mobx-react";
import BaseSheetComponent from "./BaseSheetComponent";
import { utiller as Util } from "utiller";
import _ from "lodash";
import Typography from "@mui/material/Typography";
import Style from "../../style";
import React from "react";
import UserInfoRef from "../../base/BaseUserInfo";
import Router from "../../router";

class SheetComponent extends BaseSheetComponent {
    /** -------------------- fields -------------------- **/
    /** -------------------- functions -------------------- **/

    constructor(props) {
        super(props);
    }

    getWrapInjectStyleOfSheetGuitarpuFloatAreaMarkOfYuehImg(floatArea) {
        return Util.getVisibleOrNone(!this.isComponentView() && this.hasCopyright(), true);
    }

    onSheetAdjustCenterLinkButtonClicked(param) {
        this.copyCurrentLinkToClipboard();
    }

    getInjectStyleOfSheetAdjustCenterLinkButton(center) {
        return Util.getVisibleOrNone(this.rulesOfAllowEditFunction(), true);
    }

    hasCopyright = () => {
        return this.getStore().getCurrentPu().getCopyright();
    };

    onSheetAdjustCenterEditorButtonClicked(param) {
        Router.gotoChordiventorPage(this, this.getStore().getCurrentPu().getId());
    }

    rulesOfAllowEditFunction = () => {
        const rule1 = UserInfoRef.isAdmin();
        const rule2 = !this.isComponentView();
        const rule3 = _.isEqual(this.getStore().getCurrentPu().getIdOfAuthor(), UserInfoRef.getUid());
        return rule2 && (rule3 || rule1);
    };

    getWrapInjectStyleOfSheetGuitarpuSpeedOfRhythmTypography(guitarpu) {
        return Util.getVisibleOrNone(this.getStore().getCurrentPu().getSpeed() > 1, true);
    }

    getWrapInjectStyleOfSheetGuitarpuCapoTypography(guitarpu) {
        return Util.getVisibleOrNone(this.getStore().getCurrentPu().getCapoLevel() >= 0, true);
    }

    getInjectStyleOfSheetAdjustCenterEditorButton(center) {
        return Util.getVisibleOrNone(this.rulesOfAllowEditFunction(), true);
    }

    getInjectStyleOfSheetGuitarpuImageOfPreludeImg(guitarpu) {
        return Util.getVisibleOrNone(this.getStore().getCurrentPu().getVisibleOfPrelude(), true);
    }

    getInjectStyleOfSheetNameOfSongAndSingerTypography() {
        const visible = _.size(this.getStore().getGuitarpus()) > 0;
        return Util.getVisibleOrNone(visible, true);
    }

    getInjectStyleOfSheetTipOfLoadingTypography(sheet) {
        const visible = !_.size(this.getStore().getGuitarpus()) > 0;
        return Util.getVisibleOrNone(visible, true);
    }

    getInjectStyleOfSheetAdjustCenterPreludeWrapperDiv(center) {
        return Util.getVisibleOrNone(this.getStore().getCurrentPu().getHasPrelude(), true);
    }

    onSheetGuitarpuDivWrapClicked(param) {
        this.getStore().toggleIsAdjustVisible();
    }

    onSheetAdjustCenterSharpenButtonClicked(param) {
        this.getStore().invalidateTranspositionChord(1);
    }

    onSheetAdjustCenterFlattenButtonClicked(param) {
        this.getStore().invalidateTranspositionChord(-1);
    }

    onSheetAdjustCenterEnlargeButtonClicked(param) {
        this.adjustBunchOfFontSizeByClassName("SheetGuitarpuCurrentContextTypography");
    }

    onSheetAdjustCenterShrinkButtonClicked(param) {
        this.adjustBunchOfFontSizeByClassName("SheetGuitarpuCurrentContextTypography", false);
    }

    onSheetAdjustCenterToggleOfJoinToFavoriteSwitchChange(param) {
        this.getStore().submitFavoritePuState(this.getCheckStateByEvent(param.view)).then();
    }

    onSheetAdjustCenterToggleOfHideChordSwitchChange(param) {
        this.getStore().setVisibleOfChordInContext(this.getCheckStateByEvent(param.view));
    }

    onSheetAdjustCenterToMaleTonalityButtonClicked(param) {
        this.getStore().transpositionByGender("male");
        this.showMessageOfSucceedOnTonalityChange(this.getCenterToMaleTonality(param.object));
    }

    onSheetAdjustCenterToFemaleTonalityButtonClicked(param) {
        this.getStore().transpositionByGender("female");
        this.showMessageOfSucceedOnTonalityChange(this.getCenterToFemaleTonality(param.object), "warning");
    }

    onSheetAdjustCenterToOriginalTonalityButtonClicked(param) {
        this.getStore().transpositionByGender("original");
        this.showMessageOfSucceedOnTonalityChange(this.getCenterToOriginalTonality(param.object));
    }

    onSheetAdjustCenterPreludeOfGButtonClicked(param) {
        this.getStore().getCurrentPu().setVisibleOfPrelude(true);
        this.getStore().getCurrentPu().setImageOfPrelude(this.getStore().getCurrentPu().getPathOfPreludeG());
    }

    onSheetAdjustCenterPreludeOfCButtonClicked(param) {
        this.getStore().getCurrentPu().setVisibleOfPrelude(true);
        this.getStore().getCurrentPu().setImageOfPrelude(this.getStore().getCurrentPu().getPathOfPreludeC());
    }

    showMessageOfSucceedOnTonalityChange(text, type = "info") {
        /**
         *
         * type = info, warning
         *
         * 顯示出來的toast會咬住最上層的touch event, 讓體驗變差勁
         * */
        const message = `完成 「${text}」`;
        if (_.isEqual(type, "info")) this.showInfoSnackMessage(message);
        else this.showWarningSnackMessage(message);
    }

    getInjectStyleOfSheetAdjustCenterJoinToFavoriteFormControlLabel(center) {
        return Util.getVisibleOrNone(UserInfoRef.isLoginWithSucceed());
    }

    SheetGuitarpusCurrentContextView = observer(({ guitarpu }) => {
        const self = this;
        const currentContext = self.getGuitarpuCurrentContext(guitarpu);
        const segments = Util.getSegmentsOfEachLine(currentContext);

        return segments.map((segment, index) => (
            <Typography
                key={`unique${index}`}
                className={"SheetGuitarpuCurrentContextTypography"}
                style={{
                    ...{
                        fontWeight: self.getStore().isGuitarChordParagraph(segment) ? "bold" : "normal",
                        color: self.getStore().isGuitarChordParagraph(segment) ? "#1976D2" : "#000000"
                    },
                    ...Style.SheetGuitarpuCurrentContextTypography
                }}>
                {self.handleTextString(segment)}
            </Typography>
        ));
    });
}

export default SheetComponent;
