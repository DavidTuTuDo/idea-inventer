import {
  utiller as Util,
  exceptioner as ERROR,
  pooller as InfinitePool,
} from "utiller";
import _ from "lodash";
import libpath from "path";
import BaseNavigatorCredentialStore from "./BaseNavigatorCredentialStore";

class NavigatorCredentialStore extends BaseNavigatorCredentialStore {
  /** -------------------- fields -------------------- **/
  /** -------------------- functions -------------------- **/

  constructor(props) {
    super(props);
  }

  exist(){
    return Util.or(
        !_.isEmpty(this.getIdToken()),
        !_.isEmpty(this.getOauthIdToken())
    )
  }

  /** -------------------- async api -------------------- **/
}
export default NavigatorCredentialStore;
