import {inject} from "mobx-react";
import BaseRhythmComponent from "./BaseRhythmComponent";
import {
    utiller as Util,
    exceptioner as ERROR,
    pooller as InfinitePool,
} from "utiller";
import _ from "lodash";
import libpath from "path";
import {observer} from "mobx-react";
import RhythmStore from "../../store/rhythm";
import Style from "../../style";
import React from "react";
import {Application} from "../../";
import Config from "../../config";
import Router from "../../router";
import Cookie from "../../cookie";
import BaseComponent from "../../base/BaseComponent";

@inject("rhythm")
@observer
class RhythmComponent extends BaseRhythmComponent {
    /** -------------------- fields -------------------- **/
    /** -------------------- functions -------------------- **/

    constructor(props) {
        super(props);
    }

    onRhythmGuitarpuPaperClicked(param) {
        this.getStore().toggleIsAdjustVisible();
    }

    onRhythmAdjustCenterSharpenButtonClicked(param) {
        this.getStore().invalidateTranspositionChord(1);
    }

    onRhythmAdjustCenterFlattenButtonClicked(param) {
        this.getStore().invalidateTranspositionChord(-1);
    }

    onRhythmAdjustCenterEnlargeButtonClicked(param) {
        this.adjustFontSizeByClassName('RhythmGuitarpuCurrentContextTypography');
    }

    onRhythmAdjustCenterShrinkButtonClicked(param) {
        this.adjustFontSizeByClassName('RhythmGuitarpuCurrentContextTypography', false);
    }

    onRhythmAdjustCenterIsHideChordSwitchChange(param) {
        super.onRhythmAdjustCenterIsHideChordSwitchChange(param);
    }

    onRhythmAdjustCenterHideChordToggleSwitchChange(param) {
        this.getStore().setVisibleOfChordInContext(this.getCheckStateByEvent(param.view))
    }

    onRhythmAdjustCenterToMaleTonalityButtonClicked(param) {
        this.getStore().transpositionByGender('male');
    }

    onRhythmAdjustCenterToFemaleTonalityButtonClicked(param) {
        this.getStore().transpositionByGender('female')
    }

    onRhythmAdjustCenterToOriginalTonalityButtonClicked(param) {
        this.getStore().transpositionByGender('original')
    }

    onRhythmTestUsageButtonClicked(param) {
    }

}

export default RhythmComponent;
