const edit = true;

import { utiller as Util, exceptioner as ERROR, pooller as InfinitePool } from "utiller";
import _ from "lodash";
import libpath from "path";
import BaseDionysusErosStore from "./BaseDionysusErosStore";

const textsFetchConfig = {
    tab: {
        defaultTexts: [{ content: "aaa" }, { content: "bbb" }, { content: "ccc" }],
        autoIncrement: true,
        maximumRow: 10,
        onChanged: async () => {
            return await Util.appendInfo("tab texts changed");
        },
        onAppendClicked: async (param) => {
            return await Util.appendInfo(`[TEXTSFETCH] tab append clicked ${param}`);
        }
    },
    linepay: {
        defaultTexts: [
            { index: "CHANNEL ID", content: "1657284484" },
            { index: "SECRET ID", content: "61e9945daa3b174b8f63276b2df871cd" }
        ],
        autoIncrement: false,
        maximumRow: 2,
        onChanged: async () => {
            return await Util.appendInfo("linepay changed");
        },
        onAppendClicked: async (param) => {
            return await Util.appendInfo(`[TEXTSFETCH] linepay append clicked ${param}`);
        }
    }
};

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

    getSelectedConfig() {
        return textsFetchConfig[this.getSelected()];
    }

    async getDefaultTextsOfTextFetch() {
        const config = this.getSelectedConfig();
        return config?.defaultTexts;
    }

    autoIncrementOfTextsFetch() {
        const config = this.getSelectedConfig();
        return config?.autoIncrement ?? false;
    }

    getMaximumRowOfTextsFetch() {
        const config = this.getSelectedConfig();
        return config?.maximumRow ?? true;
    }

    async onTextsFetchChanged(param) {
        const config = this.getSelectedConfig();
        return (await config?.onChanged(param)) ?? Util.appendInfo("default changed");
    }

    async onTextsFetchAppendClicked(param) {
        const config = this.getSelectedConfig();
        return (await config?.onAppendClicked(param)) ?? Util.appendInfo(`[TEXTSFETCH] default append clicked ${param}`);
    }

    /** -------------------- async api -------------------- **/
}

export default ModularizedDionysusErosStore;
