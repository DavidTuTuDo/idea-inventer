import {inject} from "mobx-react";
import BaseEpisodeComponent from "./BaseEpisodeComponent";
import {
    utiller as Util,
    exceptioner as ERROR,
    pooller as InfinitePool,
} from "utiller";
import _ from "lodash";
import libpath from "path";
import AudioPlayer from "react-h5-audio-player";
import MoreHoriz from "@material-ui/icons/MoreHoriz";
import IconButton from "@material-ui/core/IconButton";
import Typography from "@material-ui/core/Typography";
import Switch from "@material-ui/core/Switch";
import Skeleton from "@material-ui/core/Skeleton";
import Paper from "@material-ui/core/Paper";
import Button from "@material-ui/core/Button";
import {observer} from "mobx-react";
import Style from "../../style";
import React from "react";
import UserInfoRef from "../../base/BaseUserInfo";
import {Application} from "../../";
import Config from "../../config";
import Router from "../../router";
import Cookie from "../../cookie";
import BaseComponent from "../../base/BaseComponent";

@inject("episode")
@observer
class EpisodeComponent extends BaseEpisodeComponent {
    /** -------------------- fields -------------------- **/
    /** -------------------- functions -------------------- **/

    constructor(props) {
        super(props);
    }

    onEpisodeFuncAreaUploadVoiceButtonClicked(param) {
        this.enableVoiceSelectView(true);
    }

    onFilesSelected(files) {
        this.getStore().uploadVoices(files).then();
    }

    onEpisodeStickyBottomAreaFuncOfPlayRuleEnableAllButtonClicked(param) {
        this.getStore().invalidateVoiceEnableState()
    }

    onEpisodeStickyBottomAreaFuncOfPlayRuleRulesOfPlayButtonClicked(param) {
        this.getStore().invalidateRuleOfPlay()
    }

    onEpisodeVoiceEnableSwitchChange(param) {
        const event = param.view;
        const voice = param.object;
        const enable = this.getCheckStateByEvent(event);
        if (!enable && voice)
            voice.moveSelfToAside();
    }

    onEpisodeVoiceEnableSwitchClicked(param) {
        const event = param.view;
        event.stopPropagation();
    }

    onEpisodeVoicePaperClicked(param) {
        const voice = param.object;
        this.getStore().setCurrentVoice(voice.getPathOfResource());
    }

    onEpisodeFuncAreaDeleteAllButtonClicked(param) {
        super.onEpisodeFuncAreaDeleteAllButtonClicked(param);
    }

    getInjectStyleOfEpisodeFuncAreaDiv(episode) {
        return Util.getVisibleOrNone(UserInfoRef.isAdmin());
    }

    getInjectStyleOfEpisodeVoiceExecutingCoveredDiv(voice) {
        return Util.getVisibleOrNone(_.isEqual(this.getStore().getCurrentVoicePath(), voice.getPathOfResource()));
    }

    getInjectStyleOfEpisodeVoicePaper(voice) {
        super.getInjectStyleOfEpisodeVoicePaper(voice);
    }

    onEpisodeStickyBottomAreaSrcOfPVoiceAudioPlayerEnded(param) {
        this.getStore().performNextVoice();
    }

    onEpisodeStickyBottomAreaSrcOfPVoiceAudioPlayerError(param) {
        this.getStore().performNextVoice();
    }

    isValidOfParamOfUid(uid) {
        return this.isParamFromPathValid(uid);
    }

    onEpisodeVoiceExtraIconButtonDownloadClicked(param) {
        const voice = param.object;
        return async () => {
            Util.appendInfo(voice.getName());
        };
    }

    onEpisodeVoiceExtraIconButtonShareClicked(param) {
        const voice = param.object;
        const event = param.view;
        return async () => {
            Util.appendInfo(voice.getName());
        };
    }

    /** -------------------- async api -------------------- **/
}

export default EpisodeComponent;
