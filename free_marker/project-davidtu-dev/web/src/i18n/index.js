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
import {Application} from "../index";
import _ from "lodash";

class I18n {

    @observable
    language = 'zh_TW';

    constructor() {
        makeObservable(this);
        autorun(() => {
            Util.appendInfo(`i18n autorun, current language => ${this.language}`);
            if (Application)
                _.each(Application.getStoreObject(), (store) => store.refreshLocally());

        })
    }

    @action
    setLanguage(lang) {
        this.language = lang;
    }

    getLanguage() {
        return this.language;
    }

    location() {
        switch (this.language) {
            case 'zh_TW':
                return TW;
            case 'zh_CN':
                return CN;
            case 'en_US':
                return EN;
            default:
                return TW;
        }
    }

    /** -------------------- async api -------------------- **/
}

export default new I18n();
