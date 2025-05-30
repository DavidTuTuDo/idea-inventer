const edit = true;

import { utiller as Util, exceptioner as ERROR, pooller as InfinitePool } from "utiller";
import _ from "lodash";
import libpath from "path";
import { Application } from "../../";
import Config from "../../config";
import i18n from "../../i18n";
import Router from "../../router";
import Cookie from "../../cookie";
import UserInfoRef from "../../base/BaseUserInfo";
import { makeAutoObservable, makeObservable, action, observable, comparer, computed, autorun, runInAction, toJS } from "mobx";
import BaseDionysusErosStore from "./BaseDionysusErosStore";

class ModularizedDionysusErosStore extends BaseDionysusErosStore {
    /** -------------------- fields -------------------- **/

    /** -------------------- functions -------------------- **/

    constructor(props) {
        super(props);
    }

    /** text fetch */

    async onTextFetchChanged(param) {
        switch (this.getSelected()) {
            case "name":
                return Util.appendInfo(`[TEXTFETCH] name text changed ${param}`);
            default:
                return undefined;
        }
    }

    async onTextFetchAppendClicked(param) {
        switch (this.getSelected()) {
            case "name":
                return Util.appendInfo(`[TEXTFETCH] name text clicked ${param}`);
            default:
                return undefined;
        }
    }

    getDefaultTextOfTextFetch() {
        switch (this.getSelected()) {
            case "name":
                return "明悅科技";
            default:
                return undefined;
        }
    }

    getDefaultTitleOfTextFetch() {
        switch (this.getSelected()) {
            case "name":
                return "店名：";
            default:
                return undefined;
        }
    }

    /** texts fetch */

    async getDefaultTextsOfTextFetch() {
        console.log(`44546554676`, this.getSelected());
        switch (this.getSelected()) {
            case "tab":
                return [{ content: "aaa" }, { content: "bbb" }, { content: "ccc" }];
            case "linepay":
                return [
                    { index: "CHANNEL ID", content: "1657284484" },
                    { index: "SECRET ID", content: "61e9945daa3b174b8f63276b2df871cd" }
                ];
            default:
                return undefined;
        }
    }

    autoIncrementOfTextsFetch() {
        switch (this.getSelected()) {
            case "tab":
                return true;
            case "linepay":
                return false;
            default:
                return false;
        }
    }

    getMaximumRowOfTextsFetch() {
        switch (this.getSelected()) {
            case "tab":
                return 10;
            case "linepay":
                return 2;
            default:
                return true;
        }
    }

    async onTextsFetchChanged(param) {
        switch (this.getSelected()) {
            case "tab":
                return Util.appendInfo("tab changed");
            case "linepay":
                return Util.appendInfo("linepay changed");
            default:
                return Util.appendInfo("default changed");
        }
    }

    async onTextsFetchAppendClicked(param) {
        switch (this.getSelected()) {
            case "tab":
                return Util.appendInfo(`[TEXTSFETCH] tab append clicked ${param}`);
            case "linepay":
                return Util.appendInfo(`[TEXTSFETCH] linepay append clicked ${param}`);
            default:
                return Util.appendInfo(`[TEXTSFETCH] default append clicked ${param}`);
        }
    }

    /** -------------------- async api -------------------- **/
}

export default ModularizedDionysusErosStore;
