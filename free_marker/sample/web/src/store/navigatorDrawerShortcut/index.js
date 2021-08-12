import {
  utiller as Util,
  exceptioner as ERROR,
  pooller as InfinitePool,
} from "utiller";
import _ from "lodash";
import libpath from "path";
import BaseNavigatorDrawerShortcutStore from "./BaseNavigatorDrawerShortcutStore";
import {action, computed} from "mobx";

class NavigatorDrawerShortcutStore extends BaseNavigatorDrawerShortcutStore {
  /** -------------------- fields -------------------- **/
  /** -------------------- functions -------------------- **/

  constructor(props) {
    super(props);
  }

  isSubOpen() {
    return this.getOpen() === 1;
  }

  @action
  setSubOpen(open) {
    this.setOpen(open ? 1 : 0);
  }

  hasSubItems() {
    return this.getSubs().length > 0;
  }
  /** -------------------- async api -------------------- **/
}
export default NavigatorDrawerShortcutStore;
