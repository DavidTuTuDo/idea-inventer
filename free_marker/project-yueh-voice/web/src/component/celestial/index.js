import {inject} from "mobx-react";
import BaseCelestialComponent from "./BaseCelestialComponent";
import {
    utiller as Util,
    exceptioner as ERROR,
    pooller as InfinitePool,
} from "utiller";
import _ from "lodash";
import libpath from "path";
import Button from "@mui/material/Button";
import AudioPlayer from "react-h5-audio-player";
import Typography from "@mui/material/Typography";
import {observer} from "mobx-react";
import Style from "../../style";
import React from "react";
import UserInfoRef from "../../base/BaseUserInfo";
import {Application} from "../../";
import Config from "../../config";
import Router from "../../router";
import Cookie from "../../cookie";
import BaseComponent from "../../base/BaseComponent";
import {isMobile} from 'react-device-detect'


@inject("celestial")
@observer
class CelestialComponent extends BaseCelestialComponent {
    /** -------------------- fields -------------------- **/
    /** -------------------- functions -------------------- **/

    constructor(props) {
        super(props);
    }

    getPieceSinger(piece) {
        const singer = super.getPieceSinger(piece);
        if (piece.getCovered()) {
            {
                return `covered by ${singer}`;
            }
        }
        return `original by ${singer}`;
    }

    getInjectStyleOfEpisodeStickyBottomAreaFuncOfPlayRuleDiv(stickyBottomArea) {
        return Util.getVisibleOrNone(false);
    }

    getInjectPropsOfEpisodeStickyBottomAreaSrcOfPVoiceAudioPlayer(stickyBottomArea) {
        return isMobile ? {customVolumeControls: []} : {};
    }

    onCelestialFuncCopyLinkButtonClicked(param) {
        this.copyCurrentLinkToClipboard();
    }

    getPieceDataOfRelease(piece) {
        return Util.getTodayTimeFormat(super.getPieceDataOfRelease(piece));
    }

    onCelestialFuncGotoAlbumButtonClicked(param) {
        if (this.getStore().hasValidPiece())
            Router.gotoEpisodePage(this.getComponentInstance(), this.getStore().getPieceOfHead().getNameOfEpisode())
    }

    onEpisodeStickyBottomAreaSrcOfPVoiceAudioPlayerEnded(param) {
        this.getStore().repeat();
    }

    onEpisodeStickyBottomAreaSrcOfPVoiceAudioPlayerError(param) {
        if (this.getStore().isPiecePathValid())
            this.showWarningSnackMessage(`音樂檔案異常，請稍後再試。`)
    }


    /** -------------------- async api -------------------- **/
}

export default CelestialComponent;
