import {utiller as Util} from "utiller";
import _ from "lodash";

class BaseCookie {

    /** 因為google限制碼cookieName 不能有=;這種字元在 */
    getEternalEncryptStringOfCookieName(string, password) {
        let encryptString = Util.getEncryptString(string, password, true);
        encryptString = Util.replaceAll(encryptString, '=', 'y');
        encryptString = Util.replaceAll(encryptString, ';', 'z');
        return encryptString;
        }
}

export default BaseCookie
