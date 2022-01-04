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


    appendError(...msgs) {
        functions.logger.error(...msgs);
    }

    isLoginUser(context) {
        return context.auth && context.auth.uid;
    }

    getUid(context) {
        return context.auth.uid;
    }

    getPictureUrl(context) {
        return context.auth.token.name || null;
    }

    getEmailAddress(context) {
        return context.auth.token.email || null;
    }

}


export default BaseFunction
