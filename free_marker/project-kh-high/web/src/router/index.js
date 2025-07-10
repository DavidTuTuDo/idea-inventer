const edit = true;

/** this code are generated, modify is no sense.
 author:David Tu,
 email:freshingmoon0725@gmail.com
 updateTime:2021-04-27-16-13-47
 */
import BaseMyRouter from "./BaseMyRouter";
import Cookie from "../cookie";
import { utiller as Util, exceptioner as ERROR, pooller as InfinitePool } from "utiller";
import _ from "lodash";
import UserInfoRef from "../base/BaseUserInfo";

class Router extends BaseMyRouter {
    /** -------------------- fields -------------------- **/
    /** -------------------- functions -------------------- **/

    constructor(props) {
        super(props);
    }

    gotoHistoryWrongPage = (component) => {
        if (!UserInfoRef.isLoginWithSucceed() && component !== undefined) {
            component.enableLoginConfirmDialog();
            return;
        }

        Cookie.setExamFilter({ type: "historyWrong" });
        this.gotoExamPage(component);
    };

    /** -------------------- async api -------------------- **/
}

export default new Router();
