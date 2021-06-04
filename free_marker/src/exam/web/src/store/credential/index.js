/** this code are generated, modify is no sense.
	author:David Tu,
	email:freshingmoon0725@gmail.com
	updateTime:2021-04-29-20-04-46
*/
import BaseCredentialStore from "./BaseCredentialStore";
import { utiller as Util, exceptioner as ERROR } from "utiller";

class CredentialStore extends BaseCredentialStore {
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
export default CredentialStore;
