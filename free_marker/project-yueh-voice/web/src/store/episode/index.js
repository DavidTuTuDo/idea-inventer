import BaseEpisodeStore from "./BaseEpisodeStore";
import {
    utiller as Util,
    exceptioner as ERROR,
    pooller as InfinitePool,
} from "utiller";
import _ from "lodash";
import libpath from "path";
import {Application} from "../../";
import Config from "../../config";
import Router from "../../router";
import Cookie from "../../cookie";
import UserInfoRef from "../../base/BaseUserInfo";
import {
    makeAutoObservable,
    makeObservable,
    action,
    observable,
    comparer,
    computed,
    autorun,
    runInAction,
} from "mobx";
import FloatArea from "../episodeFloatArea";
import StickyBottomArea from "../episodeStickyBottomArea";
import Voice from "../episodeVoice";
import FuncArea from "../episodeFuncArea";
import BaseStore from "../../base/BaseStore";
import PieceStore from "../celestialPiece";

class EpisodeStore extends BaseEpisodeStore {
    /** -------------------- fields -------------------- **/
    /** -------------------- functions -------------------- **/

    randomPlay = false;

    constructor(props) {
        super(props);
        this.storeOfVoice = new Voice();
        this.storeOfPiece = new PieceStore();
    }

    async fetch(view) {
        const voices = await this.storeOfVoice.fetchVoices(this.getComponent(), this.getParamOfIdOfEpisodeInPath())
        this.setVoices(...voices)
    }

    async uploadVoices(files) {
        const nameOfEpisode = this.getFuncArea().getNameOfEpisode()
        const nameOfSinger = this.getFuncArea().getNameOfSinger();

        if (_.isUndefined(this.getComponent()) || _.size(nameOfEpisode) < 5 || _.size(nameOfSinger) < 2) {
            this.getComponent().showWarningSnackMessage(`不符合上傳規範`);
            return;
        }

        /** 上傳piece 拿到 id */
        const itemsOfCelestialVoice = [];
        const covered = true;
        for (const file of files) {
            const name = Util.getFileNameFromPath(file.name);
            const pathOfResource = await this.storeOfPiece.uploadStorageOfPathOfResource(this.getComponent(), file.blob);
            const resultOfCelestial = await this.storeOfPiece.submitPieceItem(this.getComponent(), {
                idOfUser: UserInfoRef.getUid(),
                nameOfEpisode,
                name,
                covered,
                pathOfResource,
                singer: nameOfSinger,
            })
            const idOfCelestial = resultOfCelestial.value.id;
            itemsOfCelestialVoice.push({pathOfResource, idOfCelestial, name, singer: nameOfSinger, covered});
        }
        await this.storeOfVoice.submitVoices(this.getComponent(), itemsOfCelestialVoice, nameOfEpisode);
    }

    setCurrentVoice(path) {
        this.getStickyBottomArea().setSrcOfPVoice(path)
    }

    getCurrentVoicePath = () => {
        return this.getStickyBottomArea().getSrcOfPVoice();
    }

    @action
    invalidateVoiceEnableState() {
        let enableAll = false;
        if (_.isEqual(this.getStickyBottomArea().getFuncOfPlayRule().getEnableAll(), '全閉')) {
            this.getStickyBottomArea().getFuncOfPlayRule().setEnableAll('全開');
        } else {
            enableAll = true;
            this.getStickyBottomArea().getFuncOfPlayRule().setEnableAll('全閉');
        }
        const next = this.getVoices().map((voice) => {
            return Util.mergeObject(voice, {enable: enableAll})
        })
        this.setVoices(...next);
    }

    @action
    invalidateRuleOfPlay() {
        const state = this.getStickyBottomArea().getFuncOfPlayRule().getRulesOfPlay();
        if (_.isEqual(state, '順序')) {
            this.getStickyBottomArea().getFuncOfPlayRule().setRulesOfPlay('隨機');
            this.randomPlay = true;
        } else {
            this.getStickyBottomArea().getFuncOfPlayRule().setRulesOfPlay('順序');
            this.randomPlay = false;
        }
    }

    getCurrentVoice = () => {
        return _.find(this.getVoices(), (voice) => _.isEqual(this.getCurrentVoicePath(), voice.getPathOfResource()));
    }

    performNextVoice = async () => {
        /** 檢查 ignore */
        /** 檢查隨機 */
        if (_.isEqual(undefined, this.getCurrentVoice())) {
            /**
             * 因為 this.setCurrentVoice(''),會讓audio player在呼叫onError | onEnd 在觸發一次performNextVoice
             await Util.syncDelay(10);
             *
             * */
            return;
        }

        let next = undefined;
        if (this.randomPlay) {
            next = Util.getRandomItemOfArray(this.getVoices().filter((voice) => voice.enable), this.getCurrentVoice());
        } else {
            const currentIndex = _.findIndex(this.getVoices(), (voice) => _.isEqual(voice.getPathOfResource(), this.getCurrentVoicePath()));
            let nextIndex = _.findIndex([...this.getVoices(), ...this.getVoices()],
                (voice) => voice.enable,
                currentIndex + 1);
            next = Util.nth(this.getVoices(), nextIndex);
        }
        if (next !== undefined && next instanceof Voice) {
            this.setCurrentVoice('');
            await Util.syncDelay(10);
            this.setCurrentVoice(next.getPathOfResource());
        }

    }
    /** -------------------- async api -------------------- **/
}

export default EpisodeStore;
