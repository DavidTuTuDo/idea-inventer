import {inject} from "mobx-react";
import BaseSheetComponent from "./BaseSheetComponent";
import {
    utiller as Util,
    exceptioner as ERROR,
    pooller as InfinitePool,
} from "utiller";
import _ from "lodash";
import libpath from "path";
import Switch from "@mui/material/Switch";
import FormControlLabel from "@mui/material/FormControlLabel";
import Button from "@mui/material/Button";
import SwipeableDrawer from "@mui/material/SwipeableDrawer";
import Typography from "@mui/material/Typography";
import {observer} from "mobx-react";
import Paper from "@mui/material/Paper";
import SheetStore from "../../store/sheet";
import Style from "../../style";
import React from "react";
import UserInfoRef from "../../base/BaseUserInfo";
import {Application} from "../../";
import Config from "../../config";
import Router from "../../router";
import Cookie from "../../cookie";
import BaseComponent from "../../base/BaseComponent";

@inject("sheet")
@observer
class SheetComponent extends BaseSheetComponent {
    /** -------------------- fields -------------------- **/
    /** -------------------- functions -------------------- **/

    constructor(props) {
        super(props);
    }

    getInjectStyleOfSheetGuitarpuLabelOfSpeedOfRhythmTypography(guitarpu) {
        return Util.getVisibleOrNone(this.getStore().getCurrentPu().getSpeed() > 1, true);
    }

    getInjectStyleOfSheetGuitarpuSpeedOfRhythmTypography(guitarpu) {
        return Util.getVisibleOrNone(this.getStore().getCurrentPu().getSpeed() > 1, true);
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

    onSheetGuitarpuDivClicked(param) {
        ctoggleIsAdjustVisible();
    }

    onSheetAdjustCenterSharpenButtonClicked(param) {
        this.getStore().invalidateTranspositionChord(1);
    }

    onSheetAdjustCenterFlattenButtonClicked(param) {
        this.getStore().invalidateTranspositionChord(-1);
    }

    onSheetAdjustCenterEnlargeButtonClicked(param) {
        this.adjustBunchOfFontSizeByClassName('SheetGuitarpuCurrentContextTypography');
    }

    onSheetAdjustCenterShrinkButtonClicked(param) {
        this.adjustBunchOfFontSizeByClassName('SheetGuitarpuCurrentContextTypography', false);
    }

    onSheetAdjustCenterHideChordToggleSwitchChange(param) {
        this.getStore().setVisibleOfChordInContext(this.getCheckStateByEvent(param.view))
    }

    onSheetAdjustCenterJoinToFavoriteToggleSwitchChange(param) {
        this.getStore().submitFavoritePuState(this.getCheckStateByEvent(param.view)).then();
    }

    onSheetAdjustCenterToMaleTonalityButtonClicked(param) {
        this.getStore().transpositionByGender('male');
        this.showMessageOfSucceedOnTonalityChange(this.getCenterToMaleTonality(param.object));
    }

    onSheetAdjustCenterToFemaleTonalityButtonClicked(param) {
        this.getStore().transpositionByGender('female')
        this.showMessageOfSucceedOnTonalityChange(this.getCenterToFemaleTonality(param.object), 'warning');
    }

    onSheetAdjustCenterToOriginalTonalityButtonClicked(param) {
        this.getStore().transpositionByGender('original')
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

    showMessageOfSucceedOnTonalityChange(text, type = 'info') {
        /**
         *
         * type = info, warning
         *
         * 顯示出來的toast會咬住最上層的touch event, 讓體驗變差勁
         * */
        const message = `完成 「${text}」`;
        if (_.isEqual(type, 'info'))
            this.showInfoSnackMessage(message);
        else
            this.showWarningSnackMessage(message)
    }

    getInjectStyleOfSheetAdjustCenterJoinToFavoriteFormControlLabel(center) {
        return Util.getVisibleOrNone(UserInfoRef.isLoginWithSucceed());
    }

    SheetGuitarpusCurrentContextView = observer(({guitarpu}) => {
        const self = this;
        const classes = this.props.classes;
        const currentContext = self.getGuitarpuCurrentContext(guitarpu);
        const segments = Util.getSegmentsOfEachLine(currentContext);

        return (
            segments.map((segment, index) => <Typography
                key={`unique${index}`}
                className={"SheetGuitarpuCurrentContextTypography"}
                style={{
                    ...{
                        fontWeight: self.getStore().isGuitarChordParagraph(segment) ? 'bold' : 'normal',
                        color: self.getStore().isGuitarChordParagraph(segment) ? '#1976D2' : '#000000',
                    },
                    ...Style.SheetGuitarpuCurrentContextTypography
                }}>
                {self.handleTextString(segment)}
            </Typography>));
    })


    /** -------------------- async api -------------------- **/
}

export default SheetComponent;
