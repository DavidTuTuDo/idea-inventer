import {inject} from "mobx-react";
import BaseSheetComponent from "./BaseSheetComponent";
import {
    utiller as Util,
    exceptioner as ERROR,
    pooller as InfinitePool,
} from "utiller";
import _ from "lodash";
import libpath from "path";
import Switch from "@material-ui/core/Switch";
import FormControlLabel from "@material-ui/core/FormControlLabel";
import Button from "@material-ui/core/Button";
import SwipeableDrawer from "@material-ui/core/SwipeableDrawer";
import Typography from "@material-ui/core/Typography";
import {observer} from "mobx-react";
import Paper from "@material-ui/core/Paper";
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

    onSheetGuitarpuDivClicked(param) {
        this.getStore().toggleIsAdjustVisible();
    }

    onSheetAdjustCenterSharpenButtonClicked(param) {
        this.getStore().invalidateTranspositionChord(1);
        this.showMessageOfSucceedOnTonalityChange(this.getCenterSharpen(param.object));
    }

    onSheetAdjustCenterFlattenButtonClicked(param) {
        this.getStore().invalidateTranspositionChord(-1);
        this.showMessageOfSucceedOnTonalityChange(this.getCenterFlatten(param.object), 'warning');
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
        this.showMessageOfSucceedOnTonalityChange(this.getCenterToFemaleTonality(param.object),'warning');
    }

    onSheetAdjustCenterToOriginalTonalityButtonClicked(param) {
        this.getStore().transpositionByGender('original')
        this.showMessageOfSucceedOnTonalityChange(this.getCenterToOriginalTonality(param.object));
    }

    showMessageOfSucceedOnTonalityChange(text, type = 'info') {
        /** type = info, warning */
        const message = `完成 「${text}」`;
        if (_.isEqual(type, 'info'))
            this.showInfoSnackMessage(message);
        else
            this.showWarningSnackMessage(message)
    }

    getInjectStyleOfSheetAdjustCenterJoinToFavoriteFormControlLabel(center) {
        return Util.getVisibleOrNone(UserInfoRef.isLoginInSucceed());
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
