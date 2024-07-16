const edite = true;
import ModularizedNavigatorToolBarStore from "./ModularizedNavigatorToolBarStore";
import { utiller as Util, exceptioner as ERROR, pooller as InfinitePool } from "utiller";
import _ from "lodash";
import libpath from "path";

class NavigatorToolBarStore extends ModularizedNavigatorToolBarStore {
  /** -------------------- fields -------------------- **/

  /** -------------------- functions -------------------- **/

  constructor(props) {
    super(props);
  }

  getTitle() {
    return "悅考";
  }

  /** -------------------- async api -------------------- **/
}

export default NavigatorToolBarStore;
