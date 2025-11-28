import TW from "./zh_TW";
import CN from "./zh_CN";
import EN from "./en_US";
import { utiller as Util } from "utiller";
import { makeObservable, action, observable } from "mobx";
import { Application } from "../index";
import _ from "lodash";

class I18n {
    @observable
    language = "zh_TW";H

    constructor() {
        makeObservable(this);
    }

    // ✅ 新增外部啟動方法
    startApplicationReactions() {
        // autorun(() => {
        //     // 保持判斷的安全性，防止 Application 是 undefined
        //     if (Application && typeof Application.getStoreObject === 'function') {
        //         _.each(Application.getStoreObject(), (store) => store.refreshLocally());
        //     }
        // });
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
            case "zh_TW":
                return TW;
            case "zh_CN":
                return CN;
            case "en_US":
                return EN;
            default:
                return TW;
        }
    }

    /** -------------------- async api -------------------- **/
}

export default new I18n();
