const edit = true;

import { utiller as Util, exceptioner as ERROR, pooller as InfinitePool } from "utiller";

import Cookie from "../../cookie";
import UserInfoRef from "../../base/BaseUserInfo";
import BaseAccountStore from "./BaseAccountStore";
import i18n from "../../i18n";

class ModularizedAccountStore extends BaseAccountStore {
    /** -------------------- fields -------------------- **/
    /** -------------------- functions -------------------- **/

    constructor(props) {
        super(props);
    }

    async onInitialFetchCompleted(collection) {
        await super.onInitialFetchCompleted(collection);
        const user = Cookie.getUser();
        if (UserInfoRef.isValidUser(user)) {
            this.setUrlOfHeadPhoto(UserInfoRef.getPhotoURL());
            this.setValueOfEmail(UserInfoRef.getEmailOfCurrentUser());
            this.setValueOfName(UserInfoRef.getDisplayNameOfUser());
            this.setValueOfId(UserInfoRef.getUid());
        }
        this.setSelectedLang(i18n.getLanguage());
    }

    /** -------------------- async api -------------------- **/
}
export default ModularizedAccountStore;
