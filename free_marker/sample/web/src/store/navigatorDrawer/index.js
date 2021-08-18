import {
  utiller as Util,
  exceptioner as ERROR,
  pooller as InfinitePool,
} from "utiller";
import _ from "lodash";
import libpath from "path";
import UserInfo from '../../userInfo';
import BaseNavigatorDrawerStore from "./BaseNavigatorDrawerStore";

class NavigatorDrawerStore extends BaseNavigatorDrawerStore {
  /** -------------------- fields -------------------- **/
  /** -------------------- functions -------------------- **/

  constructor(props) {
    super(props);
  }

  async fetch(view) {
    const result = await super.fetch(view);
    if(UserInfo.isLoginInSucceed()){
      result.shortcuts.push(...result.myShortcuts)
    }
    return result;
  }

  /** -------------------- async api -------------------- **/
}
export default NavigatorDrawerStore;
