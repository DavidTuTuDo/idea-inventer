const edit = true;

import BaseChordiventorStore from "./BaseChordiventorStore";
import { utiller as Util, exceptioner as ERROR, pooller as InfinitePool } from "utiller";
import _ from "lodash";
import libpath from "path";
import Cookie from "../../cookie";
import Config from '../../config';
import ApiOfGuitarPu from '../sheetGuitarpu';

class ChordiventorStore extends BaseChordiventorStore {

  constructor(props) {
    super(props);
    this.apiOfPu = new ApiOfGuitarPu();
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
    const selected = this.getSinger();

    pu.setCurrentContext(content);
    pu.setOriginalContext(content)
    pu.setTonalityOfContext(toneOfContext)
    pu.setTonalityOfMale(toneOfMale)
    pu.setTonalityOfFemale(toneOfFemale)
    pu.setTonalityOfOriginal(toneOfOriginal);
    pu.setSpeed(speed);
    pu.setName(name);
    if(!Util.isUndefinedNullEmpty(selected)){
      pu.setSinger(selected.label)
      pu.setIdOfSinger(selected.uid)
      this.setIdOfSinger(selected.uid)
    } else pu.setSinger(singer);

    this.getSheet().invalidate();
  }

  async onInitialFetchBeginning() {
    this.getSheet().setState(`stable`);
    this.getSheet().pushGuitarpu({});
  }

  async onInitialFetchCompleted(collection) {
    const result = await super.onInitialFetchCompleted(collection);
    const context = Cookie.getCustomOfToneTxt();
    this.setTxt(context);
    const cache = Cookie.getCacheOfToneInfo();
    this.fromJson(cache);
    this.invalidate();
    return result;
  }

  async submitCustomPu() {
      const spec = this.getColumnData();
      if(_.size(this.getIdOfGuitarPu()) > 3) {
        this.getComponent().showWarningSnackMessage(`執行編輯update行為 cp不更動`)
      } else {
        this.getComponent().showWarningSnackMessage(`執行編輯submit行為 cp=false`)
      }


  }



  /** -------------------- async api -------------------- **/
}

export default ChordiventorStore;
