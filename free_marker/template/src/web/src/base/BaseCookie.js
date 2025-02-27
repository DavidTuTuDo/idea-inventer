const edit = true;
import {utiller as Util} from "utiller";
import _ from "lodash";

class BaseCookie {

    /** 因為google限制碼cookieName 不能有特殊字元在
     * console.log(getEternalEncryptStringOfCookieName('name=John Doe; age/25"test\'key\\'))
     * => namezJohn-Doe-x-agey25testkey
     * */
    getEternalEncryptStringOfCookieName(string, password) {
        const encryptString = Util.getEncryptStringV2(string, password, true);
        return encryptString.replace(/=/g, 'z')  // '=' 取代為 'z'
            .replace(/\//g, 'y')  // '/' 取代為 'y'
            .replace(/;/g, 'x')   // ';' 取代為 'x'
            .replace(/\s/g, '-')  // 空格取代為 '-'
            .replace(/"/g, '')    // 雙引號去除
            .replace(/'/g, '')    // 單引號去除
            .replace(/\\/g, '')   // 反斜杠去除
            .replace(/[\x00-\x1F\x7F]/g, ''); // 移除所有控制字符（ASCII 0-31 和 127）;
        }
}

export default BaseCookie
