import {
  utiller as Util,
  exceptioner as ERROR,
  pooller as InfinitePool,
} from "utiller";
import _ from "lodash";
import libpath from "path";
import BaseNavigatorAppBarToolBarStore from "./BaseNavigatorAppBarToolBarStore";
import UserInfo from '../../userInfo';
class NavigatorAppBarToolBarStore extends BaseNavigatorAppBarToolBarStore {
  /** -------------------- fields -------------------- **/
  /** -------------------- functions -------------------- **/

  constructor(props) {
    super(props);
  }

  getLogin() {
    if (UserInfo.isLoginInSucceed())
      return '登出';
    else
      return super.getLogin();
  }

  /** -------------------- async api -------------------- **/
}
export default NavigatorAppBarToolBarStore;
