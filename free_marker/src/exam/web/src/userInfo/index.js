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

    getUserInfo() {
        /**
         const displayName = user.displayName;
         const email = user.email;
         const photoURL = user.photoURL;
         const emailVerified = user.emailVerified;
         const uid = user.uid;
         */
        return firebaser.getCurrentUser();
    }

    getUid() {
        let uid = firebaser.getUid();
        if (!_.isEmpty(uid)) return uid;

        uid = Cookie.getUser().uid;
        if (!_.isEmpty(uid)) return uid;
    }
}

export default new UserInfo();
