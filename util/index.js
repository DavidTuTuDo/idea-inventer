import CryptoJS from 'crypto-js';
import GlobalConfig from "../GlobalConfig";
import _ from "lodash";

class Util {

    getEncryptString(texts) {
        const encrypted = CryptoJS.AES.encrypt(texts, GlobalConfig.ENCRYPT_KEY).toString();
        return encrypted;
    }

    getDecryptString(ciphertext) {
        const decrypted = CryptoJS.AES.decrypt(ciphertext, GlobalConfig.ENCRYPT_KEY).toString(CryptoJS.enc.Utf8);
        return decrypted;
    }

    getFirebaseFormattedString(texts) {
        return _.replace(texts, /[\.\#\$\[\]]/g, "-").trim();
    }

    formalizeNamesToArray(singerString) {
        let normalize = singerString;
        /** avoid this situation, 演唱：陳勢安、畢書盡 (Bii)   編曲：Jerry C */
        normalize = normalize.split(GlobalConfig.SEPARATE_TONE_SINGER)[0].trim();

        normalize = _.replace(normalize, /[,\/#!$%\^&\*;:{}=_`、~()（）]/g, "_").trim();
        /** avoid this situation, 陳勢安_畢書盡__Bii_ */
        normalize = this.getFirebaseFormattedString(normalize);

        normalize = _.replace(normalize, /\_\_+/g, '_').trim();

        while (_.endsWith(normalize, "_")) {
            /** avoid this situation, 陳勢安_畢書盡_Bii_ */
            normalize = normalize.slice(0, -1).trim();
        }
        const words = normalize.split('_');
        /** avoid this situation, ["畢書盡 ","Bii","陳勢安 "] */
        return _.map(words, word => _.trim(word));
    }

    getShuffledArrayWithLimitCountHighPerformance(arr, n) {
        let result = new Array(n),
            len = arr.length,
            taken = new Array(len);
        if (n > len)
            n = len;

        if (n > len)
            throw new RangeError("getShuffledArrayWithLimitCount: more elements taken than available");

        while (n--) {
            let x = Math.floor(Math.random() * len);
            result[n] = arr[x in taken ? taken[x] : x];
            taken[x] = --len in taken ? taken[len] : len;
        }
        return result;
    }

    getShuffledArrayWithLimitCount(arr, n) {
        let shuffled = _.shuffle(arr);
        return shuffled.slice(0, n);
    }

    isJson(item) {
        item = typeof item !== "string"
            ? JSON.stringify(item)
            : item;

        try {
            item = JSON.parse(item);
        } catch (e) {
            return false;
        }

        if (typeof item === "object" && item !== null) {
            return true;
        }
        return false;
    }

    getObjectValue(obj) {
        if (_.isObject(obj)) {
            return Object.values(obj)[0];
        }
        return '';
    }

    getObjectKey(obj) {
        if (_.isObject(obj)) {
            return Object.keys(obj)[0];
        }
        return '';
    }

    displayKeys(obj) {
        if (_.isUndefined(obj) || _.isEmpty(obj)) {
            if (GlobalConfig.MODULE_MSG.SHOW_ERROR)
                console.error('object is Empty or Null');
        }
        if (GlobalConfig.MODULE_MSG.SHOW_SUCCEED)
            console.log(_.map(obj, (_obj) => this.getObjectKey(_obj)));
    }

    isSingerTypeRule(constraint) {

    }

    isSingerNameRule(constraint) {

    }

    isKeywordRule(constraint) {
        if (_.isUndefined(constraint) || _.isEmpty(constraint))
            throw new Error('PARAMS CAN NOT BE EMPTY');

        if (!_.isString(constraint))
            throw new Error('PARAMS SHOULD BE STRING');

        if (constraint.length > 20)
            throw new Error('EXCEED 20 WORDS IS NOT ALLOWED');
    }

    getItsKeyByValue(object, value) {
        return Object.keys(object).find(key => object[key] === value);
    }


    startWiths(string, key = []) {
        for (const _key of key) {
            if (_.startsWith(string, _key)) {
                return true;
            }
        }
        return false;
    }

}

if (GlobalConfig.DEBUG_MODE) {
    const self = new Util();
    console.log(self.startWiths('i have a log',['i','i have','you']));
}

const singleton = new Util();
export default singleton;
