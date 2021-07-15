/** this code are generated, modify is no sense.
 author:David Tu,
 email:freshingmoon0725@gmail.com
 updateTime:2021-07-01-00-46-24
 */
import {
    utiller as Util,
    exceptioner as ERROR,
    pooller as InfinitePool,
} from "utiller";
import _ from "lodash";
import libpath from "path";
import UserInfo from '../../userInfo';
import BaseToolBarStore from "./BaseToolBarStore";

class ToolBarStore extends BaseToolBarStore {
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

export default ToolBarStore;
