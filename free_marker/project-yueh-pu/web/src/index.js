import "./less";
import BaseApp from "./BaseApp";
import { utiller as Util, exceptioner as ERROR, pooller as InfinitePool } from "utiller";

import Config from "./config";

class App extends BaseApp {
    /** -------------------- fields -------------------- **/

    /** -------------------- functions -------------------- **/

    constructor(props) {
        super(props);
    }

    /** -------------------- async api -------------------- **/
}

const self = new App();
self.mount();
Util.setEnvironment(Config.env);
export { self as Application };
