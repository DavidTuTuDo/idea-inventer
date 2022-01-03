import config from "../config";
import {utiller as Util, exceptioner as ERROR} from "utiller";
import _ from "lodash";
import * as functions from 'firebase-functions';

class BaseFunction {

    constructor() {
    }

    appendLog(...msgs) {
        functions.logger.log(...msgs);
    }

}


export default BaseFunction
