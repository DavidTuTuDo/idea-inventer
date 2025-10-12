const edit = true;

import BaseMyRouter from "./BaseMyRouter";
import Config from "../config";
import UserInfoRef from "../base/BaseUserInfo";

class Router extends BaseMyRouter {
    /** -------------------- fields -------------------- **/
    /** -------------------- functions -------------------- **/

    constructor(props) {
        super(props);
    }

    gotoChordiventorPage = (component, idOfGuitarPu = "edit") => {
        if (!UserInfoRef.isLoginWithSucceed() && component !== undefined) {
            component.enableLoginConfirmDialog();
            return;
        }
        const route = `/chordiventor/${idOfGuitarPu}`;
        this.routeTo(component, route);
        this.setCurrentRoute(route);
        return new URL(route, Config.host).href;
    };
    /** -------------------- async api -------------------- **/
}
export default new Router();
