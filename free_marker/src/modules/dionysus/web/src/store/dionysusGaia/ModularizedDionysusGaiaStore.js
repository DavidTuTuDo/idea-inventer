const edit = true;

import { utiller as Util, exceptioner as ERROR, pooller as InfinitePool } from "utiller";
import _ from "lodash";
import libpath from "path";
import BaseDionysusGaiaStore from "./BaseDionysusGaiaStore";

const MAXIMUM_TEXT_OF_NAME = 50;
const MAXIMUM_TEXT_OF_DESCRIPTION = 300;

const textsFetchConfig = {
    main: {
        // defaultTexts: [{ content: "aaa" }, { content: "bbb" }, { content: "ccc" }],
        autoIncrement: true,
        maximumRow: 100,
        onChanged: async (instance, strings) => {
            return await Util.appendInfo("main texts changed");
        },
        onAppendClicked: async (strings, instance) => {
            return await instance.appendMainOptions(strings);
        }
    },
    sub: {
        // defaultTexts: [{ content: "ddd" }, { content: "eee" }, { content: "fff" }],
        autoIncrement: true,
        maximumRow: 100,
        onChanged: async () => {
            return await Util.appendInfo("sub texts changed");
        },
        onAppendClicked: async (strings, instance) => {
            return await instance.appendSubOptions(strings);
        }
    }
};

class ModularizedDionysusGaiaStore extends BaseDionysusGaiaStore {
    constructor(props) {
        super(props);
    }

    appendMainOptions = async (strings) => {
        const uniques = Util.findUniqueNonReferenceStrings(
            this.getBriefMains().map((each) => each.main),
            strings
        );
        this.pushBriefMains(...uniques.map((each) => Util.getObjectOfKey(each, "main")));
    };

    appendSubOptions = async (strings) => {
        const uniques = Util.findUniqueNonReferenceStrings(
            this.getBriefSubs().map((each) => each.sub),
            strings
        );
        this.pushBriefSubs(...uniques.map((each) => Util.getObjectOfKey(each, "sub")));
    };

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

    onTextsFetchChanged = async (param) => {
        const config = this.getSelectedConfig();
        return (await config?.onChanged(param, this)) ?? Util.appendInfo("default changed");
    };

    onTextsFetchAppendClicked = async (param) => {
        const config = this.getSelectedConfig();
        return (await config?.onAppendClicked(param, this)) ?? Util.appendInfo(`[TEXTSFETCH] default append clicked ${param}`);
    };

    onNameFieldChanged = () => {
        const current = this.getName();
        this.setName(this.truncateString(current, MAXIMUM_TEXT_OF_NAME));
        this.setStmtOfNameMaximum(`${_.size(this.getName())}/${MAXIMUM_TEXT_OF_NAME}`);
    };

    onDescriptionFieldChanged = () => {
        const current = this.getDescription();
        this.setDescription(this.truncateString(current, MAXIMUM_TEXT_OF_DESCRIPTION));
        this.setStmtOfDescriptionMaximum(`${_.size(this.getDescription())}/${MAXIMUM_TEXT_OF_DESCRIPTION}`);
    };

    truncateString(str, length = 30) {
        if (!_.isString(str)) return "";
        return _.truncate(str, {
            length,
            omission: "" // 不加 "..."，若要保留可以改為 '...'
        });
    }
}

export default ModularizedDionysusGaiaStore;
