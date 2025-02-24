const edit = true;

import BaseChordiventorStore from "./BaseChordiventorStore";
import { utiller as Util, exceptioner as ERROR, pooller as InfinitePool } from "utiller";
import _ from "lodash";
import libpath from "path";
import Cookie from "../../cookie";
import UserInfoRef from "../../base/BaseUserInfo";

class ChordiventorStore extends BaseChordiventorStore {

  constructor(props) {
    super(props);
  }

  persistent() {
    const content = this.getTxt();
    if(_.isEmpty(content)) return false;
    else return this.persistValidTone(content)
  }

  persistValidTone(content) {
    Cookie.setCustomOfTone(content);
    return true;
  }

  getCurrentEditedPu = () => {
    return this.getSheet().getCurrentPu();
  }

  invalidate = () => {
    const toneOfContext = this.getSelectedTonalityOfContext();
    const toneOfMale = this.getSelectedTonalityOfMale();
    const toneOfFemale = this.getSelectedTonalityOfFemale();
    const toneOfOriginal = this.getSelectedTonalityOfOriginal();
    const speed = this.getSpeed();
    const name = this.getName();
    const content = this.getTxt();
    const singer = this.getInputOfSinger()
    const pu = this.getCurrentEditedPu();
    pu.setCurrentContext(content);
    pu.setOriginalContext(content)
    pu.setTonalityOfContext(toneOfContext)
    pu.setTonalityOfMale(toneOfMale)
    pu.setTonalityOfFemale(toneOfFemale)
    pu.setTonalityOfOriginal(toneOfOriginal);
    pu.setSpeed(speed);
    pu.setName(name);
    pu.setSinger(singer);
    this.getSheet().invalidate();
  }

  async onInitialFetchCompleted(collection) {
    const result = await super.onInitialFetchCompleted(collection);
    this.getSheet().setState(`stable`);
    const context = Cookie.getCustomOfTone();
    this.setTxt(context);
    this.getSheet().pushGuitarpu({});
    const cache = Cookie.getCacheOfToneInfo();
    this.fromJson(cache);
    this.invalidate();

    return result;
  }

  /** -------------------- async api -------------------- **/
}

export default ChordiventorStore;
