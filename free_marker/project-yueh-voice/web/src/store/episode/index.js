import BaseEpisodeStore from "./BaseEpisodeStore";
import {
  utiller as Util,
  exceptioner as ERROR,
  pooller as InfinitePool,
} from "utiller";
import _ from "lodash";
import libpath from "path";
import { Application } from "../../";
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

class EpisodeStore extends BaseEpisodeStore {
  /** -------------------- fields -------------------- **/
  /** -------------------- functions -------------------- **/

  randomPlay = false;

  constructor(props) {
    super(props);
    this.storeOfVoice = new Voice();
  }

  async uploadVoices(files) {
    const items = [];
    for (const file of files) {
      const name = Util.getFileNameFromPath(file.name);
      const pathOfResource = await this.storeOfVoice.uploadStorageOfPathOfResource(this.getComponent(), undefined, file.blob);
      items.push({name, pathOfResource});
    }
    await this.storeOfVoice.submitVoices(this.getComponent(), items);
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
