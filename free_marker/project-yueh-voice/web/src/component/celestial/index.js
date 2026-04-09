const edit = true;

import BaseCelestialComponent from "./BaseCelestialComponent";
import { utiller as Util, exceptioner as ERROR, pooller as InfinitePool } from "utiller";
import Router from "../../router";
import { isMobile } from "react-device-detect";

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
                return `covered by ${singer} 2022/06`;
            }
        }
        return `original by ${singer}`;
    }

    getInjectStyleOfEpisodeFuncOfPlayRuleDiv(stickyBottomArea) {
        return Util.getVisibleOrNone(false);
    }

    getInjectPropsOfEpisodeSrcOfPVoiceAudioPlayer(stickyBottomArea) {
        return isMobile ? { customVolumeControls: [] } : {};
    }

    onCelestialCopyLinkButtonClicked(param) {
        this.copyCurrentLinkToClipboard();
    }

    getPieceDataOfRelease(piece) {
        return Util.getTodayTimeFormat(super.getPieceDataOfRelease(piece));
    }

    onCelestialGotoAlbumButtonClicked(param) {
        if (this.getStore().hasValidPiece()) Router.gotoEpisodePage(this.getComponentInstance(), this.getStore().getPieceOfHead().getNameOfEpisode());
    }

    onEpisodeSrcOfPVoiceAudioPlayerEnded(param) {
        this.getStore().repeat();
    }

    onEpisodeSrcOfPVoiceAudioPlayerError(param) {
        if (this.getStore().isPiecePathValid()) this.showWarningSnackMessage(`音樂檔案異常，請稍後再試。`);
    }

    /** -------------------- async api -------------------- **/
}

export default CelestialComponent;
