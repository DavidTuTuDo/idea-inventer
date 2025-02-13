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

  allowGotoPreviewPage() {
    const content = this.getTxt();
    if(_.isEmpty(content)) return false;
    else return this.persistValidTone(content)
  }

  persistValidTone(content) {
    Cookie.setCustomOfTone(content);
    return true;
  }

  async onInitialFetchCompleted(collection) {
      const latest = Cookie.getCustomOfTone();
      this.setTxt(latest);
  }

  /** -------------------- async api -------------------- **/
}

export default ChordiventorStore;
