import {
    utiller as Util,
    exceptioner as ERROR,
    pooller as InfinitePool,
} from "utiller";
import _ from "lodash";
import libpath from "path";
import application from '../';
import firebaser from './CommonFirebaseHelper'
import Cookie from '../cookie';
import Configer from '../config';

class UserInfo {
    /** -------------------- fields -------------------- **/
    /** -------------------- functions -------------------- **/

    constructor(props) {
    }

    /** -------------------- async api -------------------- **/

    getCurrentUser(allowCache = true) {
        /**
         const displayName = user.displayName;
         const email = user.email;
         const photoURL = user.photoURL;
         const emailVerified = user.emailVerified;
         const uid = user.uid;
         */

        let user = firebaser.getCurrentUser();
        if (Util.exist(user)) return user;

        if (allowCache) {
            user = Cookie.getUser();
            if (Util.exist(user)) return user;
        }
        return {};
    }

    isLoginInSucceed() {
        return !_.isNull(firebaser.getCurrentUser());
    }

    isAdmin(){
        const isAdmin = this.isLoginInSucceed() && _.isEqual(this.getUid(true),Configer.superUserUid);
        return isAdmin;
    }

    getUid(allowCache = true) {
        let uid = firebaser.getUid();
        if (!_.isEmpty(uid)) return uid;
        if (allowCache) {
            const user = Cookie.getUser();
            if (Util.exist(user))
                uid = user.uid;
            if (!_.isEmpty(uid)) return uid;
        }
        return 'empty';
    }
}

export default new UserInfo();
