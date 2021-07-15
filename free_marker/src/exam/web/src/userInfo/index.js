/** this code are generated, modify is no sense.
 author:David Tu,
 email:freshingmoon0725@gmail.com
 updateTime:2021-07-04-15-15-22
 */
import {
    utiller as Util,
    exceptioner as ERROR,
    pooller as InfinitePool,
} from "utiller";
import _ from "lodash";
import libpath from "path";
import application from '../index.js';
import firebaser from '../base/CommonFirebaseHelper'
import Cookie from '../cookie';

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
        if (!_.isUndefined(user)) return user;

        if (!allowCache) return {};

        user = Cookie.getUser();
        if (!_.isUndefined(user)) return user;
        return firebaser.getCurrentUser();
    }

    isLoginInSucceed() {
        return !_.isNull(firebaser.getCurrentUser());
    }

    getUid(allowCache = true) {
        let uid = firebaser.getUid();
        if (!_.isEmpty(uid)) return uid;

        if (!allowCache) return '';
        uid = Cookie.getUser().uid;
        if (!_.isEmpty(uid)) return uid;
    }
}

export default new UserInfo();
