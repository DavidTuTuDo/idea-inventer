const edit = true;

import BasePreviewerStore from "./BasePreviewerStore";
import { utiller as Util, exceptioner as ERROR, pooller as InfinitePool } from "utiller";
import _ from "lodash";
import libpath from "path";
import Cookie from "../../cookie";

class PreviewerStore extends BasePreviewerStore {
  /** -------------------- fields -------------------- **/

  /** -------------------- functions -------------------- **/

  constructor(props) {
    super(props);
  }

  async onInitialFetchCompleted(collection) {
    const result =  await super.onInitialFetchCompleted(collection);
    this.getSheet().setState(`stable`);
    this.getSheet().pushGuitarpu({currentContext:Cookie.getCustomOfTone()})
    return result;
  }

  /** -------------------- async api -------------------- **/
}

export default PreviewerStore;
