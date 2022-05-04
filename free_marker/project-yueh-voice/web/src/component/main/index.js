import {observer} from "mobx-react";
import {inject} from "mobx-react";
import BaseMainComponent from "./BaseMainComponent";
import {
    utiller as Util,
    exceptioner as ERROR,
    pooller as InfinitePool,
} from "utiller";
import _ from "lodash";
import libpath from "path";
import Style from "../../style";
import React from "react";
import UserInfoRef from "../../base/BaseUserInfo";
import {Application} from "../../";
import Config from "../../config";
import Router from "../../router";
import Cookie from "../../cookie";


@inject("main")
@observer
class MainComponent extends BaseMainComponent {
    /** -------------------- fields -------------------- **/
    /** -------------------- functions -------------------- **/

    constructor(props) {
        super(props);
    }

    onMainFuncAreaUploadVoiceButtonClicked(param) {
        this.enableVoiceSelectView(true);
    }

    onFilesSelected(files) {
        this.getStore().uploadVoices(files).then();
    }

    onMainStickyBottomAreaFuncOfPlayRuleEnableAllButtonClicked(param) {
        this.getStore().invalidateVoiceEnableState()
    }

    onMainStickyBottomAreaFuncOfPlayRuleRulesOfPlayButtonClicked(param) {
        this.getStore().invalidateRuleOfPlay()
    }

    onMainVoiceEnableSwitchChange(param) {
        const event = param.view;
        const voice = param.object;
        const enable = this.getCheckStateByEvent(event);
        if (!enable) {
            this.getStore().moveVoiceToLast(voice);
        }
    }

    onMainVoiceEnableSwitchClicked(param) {
        const event = param.view;
        event.stopPropagation();
    }

    onMainVoicePaperClicked(param) {
        const voice = param.object;
        this.getStore().setCurrentVoice(voice.getPathOfResource());
    }

    onMainFuncAreaDeleteAllButtonClicked(param) {
        super.onMainFuncAreaDeleteAllButtonClicked(param);
    }

    getInjectStyleOfMainFuncAreaDiv(main) {
        return Util.getVisibleOrNone(UserInfoRef.isAdmin());
    }


    getInjectStyleOfMainVoiceExecutingCoveredDiv(voice) {
        return Util.getVisibleOrNone(_.isEqual(this.getStore().getCurrentVoicePath(), voice.getPathOfResource()));
    }

    onMainStickyBottomAreaSrcOfPVoiceAudioPlayerEnded(param) {
        this.getStore().performNextVoice();
    }

    onMainStickyBottomAreaSrcOfPVoiceAudioPlayerError(param) {
        this.getStore().performNextVoice();
    }

    /** -------------------- async api -------------------- **/
}

export default MainComponent;
