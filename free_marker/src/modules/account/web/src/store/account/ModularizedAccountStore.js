const edit = true;

import { utiller as Util, exceptioner as ERROR, pooller as InfinitePool } from "utiller";
import _ from "lodash";
import libpath from "path";
import { Application } from "../.";
import Config from "../../config";
import Router from "../../router";
import Cookie from "../../cookie";
import UserInfoRef from "../../base/BaseUserInfo";
import { makeAutoObservable, makeObservable, action, observable, comparer, computed, autorun, runInAction } from "mobx";
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
