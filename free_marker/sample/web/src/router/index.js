/** this code are generated, modify is no sense.
	author:David Tu,
	email:freshingmoon0725@gmail.com
	updateTime:2021-04-27-16-13-47
*/
import BaseRouter from "./BaseRouter";
import Cookie from '../cookie';
class Router extends BaseRouter {
  /** -------------------- fields -------------------- **/
  /** -------------------- functions -------------------- **/

  constructor(props) {
    super(props);
  }

  gotoLoginPage(component) {
      Cookie.setPathBeforeLogin(window.location.href);
      super.gotoLoginPage(component);
  }

    /** -------------------- async api -------------------- **/
}
export default new Router();
