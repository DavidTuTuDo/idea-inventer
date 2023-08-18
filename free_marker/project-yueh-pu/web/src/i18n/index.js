import TW from './zh_TW';
import CN from './zh_CN';
import EN from './en_US';
import {utiller as Util} from "utiller";
import {
    makeObservable,
    action,
    observable,
    autorun,
    computed,
} from "mobx";

class I18nUtil {

    constructor() {
        makeObservable(this);
    }

    @observable
    language = 'zh_TW';

    @action
    setLanguage(lang) {
        console.log('嘿嘿');
        this.language = lang;
    }

    getLanguage() {
        return this.language;
    }

    @computed get sample() {
        console.log(`被呼叫了！！！ ${this.language}`)
        return '123';
    }
    getExportLang () {
        let CURRENT;
        switch (this.language) {
            case 'zh_TW':
                CURRENT = TW;
                Util.appendInfo(`哦哦被呼喚了 ${this.language}`)
                break;
            case 'zh_CN':
                CURRENT = CN;
                Util.appendInfo(`哦哦被呼喚了 ${this.language}`)
                break;
            case 'en_US':
                CURRENT = EN;
                Util.appendInfo(`哦哦被呼喚了 ${this.language}`)
                break;
            default:
                CURRENT = TW;
                break;
        }
        return CURRENT;
    }

    /** -------------------- async api -------------------- **/
}

const instance = new I18nUtil();
const current = instance.getExportLang();
export {instance as instance, current as i18n};
