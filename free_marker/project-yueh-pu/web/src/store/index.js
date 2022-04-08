import BaseStore from "./BaseStore";
import {
  utiller as Util,
  exceptioner as ERROR,
  pooller as InfinitePool,
} from "utiller";
import _ from "lodash";
import libpath from "path";
import RhythmGuitarpu from "./rhythmGuitarpu";
import RhythmAdjustCenterHideChord from "./rhythmAdjustCenterHideChord";
import RhythmAdjustCenter from "./rhythmAdjustCenter";
import RhythmAdjust from "./rhythmAdjust";
import Rhythm from "./rhythm";
import NavigatorUserInfo from "./navigatorUserInfo";
import NavigatorToolBarSuggestComplete from "./navigatorToolBarSuggestComplete";
import NavigatorToolBarComplete from "./navigatorToolBarComplete";
import NavigatorToolBar from "./navigatorToolBar";
import NavigatorKeyword from "./navigatorKeyword";
import NavigatorDrawerShortcut from "./navigatorDrawerShortcut";
import NavigatorDrawerMyShortcut from "./navigatorDrawerMyShortcut";
import NavigatorDrawer from "./navigatorDrawer";
import NavigatorCredential from "./navigatorCredential";
import Navigator from "./navigator";
import MainWeekPopular from "./mainWeekPopular";
import Main from "./main";

class Store extends BaseStore {
  /** -------------------- fields -------------------- **/
  /** -------------------- functions -------------------- **/

  constructor(props) {
    super(props);
  }
  /** -------------------- async api -------------------- **/
}
export default Store;
