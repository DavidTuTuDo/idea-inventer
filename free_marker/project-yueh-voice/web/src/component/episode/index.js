const edit = true;

import BaseEpisodeComponent from "./BaseEpisodeComponent";
import { utiller as Util, exceptioner as ERROR, pooller as InfinitePool } from "utiller";
import _ from "lodash";
import UserInfoRef from "../../base/BaseUserInfo";
import Router from "../../router";
import { isMobile } from "react-device-detect";

class EpisodeComponent extends BaseEpisodeComponent {
    /** -------------------- fields -------------------- **/
    /** -------------------- functions -------------------- **/

    constructor(props) {
        super(props);
    }

    onEpisodeEnableAllButtonClicked(param) {
        this.getStore().invalidateVoiceEnableState();
    }

    onEpisodeDeleteAllButtonClicked(param) {
        super.onEpisodeDeleteAllButtonClicked(param);
    }

    onEpisodeRulesOfPlayButtonClicked(param) {
        this.getStore().invalidateRuleOfPlay();
    }

    onEpisodeUploadVoiceButtonClicked(param) {
        this.enableVoiceSelectView(true);
    }

    onEpisodeNameOfSingerTextFieldChange(param) {
        super.onEpisodeNameOfSingerTextFieldChange(param);
    }

    onEpisodeSrcOfPVoiceAudioPlayerEnded(param) {
        this.getStore().performNextVoice();
    }

    onEpisodeSrcOfPVoiceAudioPlayerError(param) {
        this.getStore().performNextVoice();
    }

    onEpisodeSrcOfPVoiceAudioPlayerPlay(param) {
        this.getStore().invalidateCurrentAlert();
    }

    getInjectPropsOfEpisodeSrcOfPVoiceAudioPlayer(episode) {
        return isMobile ? { customVolumeControls: [] } : {};
    }

    onFilesSelected(files) {
        this.exeAsyncT(this.getStore().uploadVoices(files));
    }

    onEpisodeVoiceEnableSwitchChange(param) {
        const event = param.view;
        const voice = param.object;
        const enable = this.getCheckStateByEvent(event);
        if (!enable && voice) voice.moveSelfToAside();
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
        return Util.getVisibleOrNone(Util.isEqual(this.getStore().getCurrentVoicePath(), voice.getPathOfResource()));
    }

    getInjectStyleOfEpisodeVoicePaper(voice) {
        super.getInjectStyleOfEpisodeVoicePaper(voice);
    }

    isValidOfParamOfIdOfEpisode(idOfEpisode) {
        return this.isParamFromPathValid(idOfEpisode);
    }

    getVoiceSinger(voice) {
        const singer = super.getVoiceSinger(voice);
        if (voice.getCovered()) {
            {
                return `covered by ${singer} 2022/06`;
            }
        }
        return `original by ${singer}`;
    }

    onEpisodeVoiceExtraIconButtonShareClicked(param) {
        const self = this;
        const voice = param.object;
        return async () => {
            if (!Util.isUndefinedNullEmpty(voice.getIdOfCelestial())) {
                self.copyTextToClipboard(Router.getUrlOfCelestialDetailPage(voice.getIdOfCelestial()), `已將分享連結 新增至 剪貼簿`);
            }
        };
    }

    onEpisodeVoiceExtraIconButtonDownloadClicked(param) {
        const voice = param.object;
        return async () => {
            if (!Util.isUndefinedNullEmpty(voice.getPathOfResource())) {
                this.gotoUrlWithNewTabDirectly(voice.getPathOfResource());
            }
        };
    }

    onEpisodeVoiceExtraIconButtonDeleteClicked(param) {
        const self = this;
        const voice = param.object;
        return async () => {
            if (UserInfoRef.isAdmin()) {
                await this.getStore().deleteVoicePrecisely(voice);
            } else {
                self.showWarningSnackMessage(`您沒有權限`);
            }
        };
    }

    getEpisodeVoices(episode) {
        const list = super.getEpisodeVoices(episode);
        /**  return _.orderBy(list,(each) => each.getName(),'desc');
         * 為了podcast，所以將改成升序
         * */
        return _.orderBy(list, (each) => each.getName(), "asc");
    }
}

export default EpisodeComponent;
