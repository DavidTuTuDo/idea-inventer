const edit = true;

import BaseConfig from "./BaseConfig";
import { utiller as Util, exceptioner as ERROR, pooller as InfinitePool } from "utiller";
import _ from "lodash";
import libpath from "path";

class Config extends BaseConfig {
    /** -------------------- fields -------------------- **/
    /** -------------------- functions -------------------- **/

    constructor(props) {
        super(props);
    }

    singers = [];

    setSingers = (singers) => {
        this.singers.length = 0;
        this.singers.push(...singers);
    };

    getSingers = () => {
        return this.singers;
    };
    /** -------------------- async api -------------------- **/
}
export default new Config();
