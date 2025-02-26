const edit = true;

import BaseChordiventorStore from "./BaseChordiventorStore";
import { utiller as Util, exceptioner as ERROR, pooller as InfinitePool } from "utiller";
import _ from "lodash";
import libpath from "path";
import Cookie from "../../cookie";
import Config from '../../config';

class ChordiventorStore extends BaseChordiventorStore {

  constructor(props) {
    super(props);
    this.getSheet().setState(`stable`);
  }

  persistent() {
    const content = this.getTxt();
    const cache = this.columnData();
    delete cache.tonalityOfContext;
    delete cache.tonalityOfOriginal;
    delete cache.tonalityOfFemale;
    delete cache.tonalityOfMale;
    Cookie.setCustomOfToneTxt(content);
    Cookie.setCacheOfToneInfo(cache);
  }

  getCurrentEditedPu = () => {
    return this.getSheet().getCurrentPu();
  }

  cleanUp = () => {
    this.clean();
    Cookie.removeCustomOfToneTxt();
    Cookie.removeCacheOfToneInfo();
    this.getSheet().setState(`stable`);
    this.getSheet().pushGuitarpu({});
  }

  invalidate = () => {
    const toneOfContext = this.getSelectedTonalityOfContext();
    const toneOfMale = this.getSelectedTonalityOfMale();
    const toneOfFemale = this.getSelectedTonalityOfFemale();
    const toneOfOriginal = this.getSelectedTonalityOfOriginal();
    const speed = this.getSpeed();
    const name = this.getName();
    const content = this.getTxt().replaceAll(/[\｜|]/g, "།");
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
    const context = Cookie.getCustomOfToneTxt();
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
