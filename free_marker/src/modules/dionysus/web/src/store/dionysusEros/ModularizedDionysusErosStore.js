const edit = true;

import { utiller as Util, exceptioner as ERROR, pooller as InfinitePool } from "utiller";
import _ from "lodash";
import libpath from "path";
import BaseDionysusErosStore from "./BaseDionysusErosStore";
import DionysusSelect from "../dionysusSelect";

const textsFetchConfig = {
    tab: {
        fetchDefaultTexts: async (instance) => {
            return await instance.fetchDefaultTextsOfCategory();
        },
        autoIncrement: true,
        maximumRow: 15,
        onChanged: async () => {
            return await Util.appendInfo("tab texts changed");
        },
        onAppendClicked: async (param, instance) => {
            return await instance.submitCategoryRules(param);
        }
    },
    linepay: {
        fetchDefaultTexts: async (instance) => {
            return await instance.fetchDefaultTextOfLinePay();
        },
        autoIncrement: false,
        maximumRow: 2,
        onChanged: async () => {
            return await Util.appendInfo("linepay changed");
        },
        onAppendClicked: async (param, instance) => {
            await instance.submitLinePaySerials(param);
        }
    },
    ecpay: {
        fetchDefaultTexts: async (instance) => {
            return await instance.fetchDefaultTextOfECPay();
        },
        autoIncrement: false,
        maximumRow: 3,
        onChanged: async () => {
            return await Util.appendInfo("ecpay changed");
        },
        onAppendClicked: async (param, instance) => {
            await instance.submitECPaySerials(param);
        }
    }
};

class ModularizedDionysusErosStore extends BaseDionysusErosStore {
    /** -------------------- fields -------------------- **/

    /** -------------------- functions -------------------- **/

    constructor(props) {
        super(props);
        this.apiOfTab = new DionysusSelect();
    }

    async onInitialFetchCompleted(collection) {
        await super.onInitialFetchCompleted(collection);
        this.setDialogInputValueOfDionysusErosArrowOfNumOfWorker(this.getNumOfWorker() ?? 1);
    }

    submitLinePaySerials = async (param) => {
        Util.appendInfo(`[TEXTSFETCH] linepay append clicked ${param}`);
        this.setLinepaySet(...param);
        await this.submitDionysusEros();
    };

    submitECPaySerials = async (param) => {
        Util.appendInfo(`[TEXTSFETCH] ecpay append clicked ${param}`);
        this.setEcpaySet(...param);
        await this.submitDionysusEros();
    };

    submitNumOfWorker = async (num) => {
        Util.appendInfo(`[textInput] numOfWorker append clicked ${num}`);
        const target = _.toNumber(num);
        if (target <= 1) return this.getComponent().showErrorSnackMessage(`人數格式錯誤 '${num}'`);
        this.setNumOfWorker(target);
        await this.submitDionysusEros();
    };

    submitBrandName = async (name) => {
        Util.appendInfo(`[TEXTFETCH] name text clicked ${name}`);
        if (_.size(name) <= 0) return this.getComponent().showErrorSnackMessage(`店名格式錯誤`);
        this.setBrandName(name);
        await this.submitDionysusEros();
    };

    fetchDefaultTextsOfCategory = async () => {
        this.categoryOfCurrent = (await this.apiOfTab.fetchSelects(this.getComponent())) ?? [];
        return this.categoryOfCurrent.map((each) => {
            {
                return { content: each.label };
            }
        });
    };

    fetchDefaultTextOfLinePay = async () => {
        const titles = ["CHANNEL ID", "SECRET  ID"];
        return this.getNormalizeStmt(titles, this.getLinepaySet());
    };

    getNormalizeStmt = (titles, items) => {
        return _.map(titles, (title, idx) => ({
            index: title,
            content: _.get(items, idx, "") || ""
        }));
    };

    fetchDefaultTextOfECPay = async () => {
        const titles = ["Merchant ID", "Hash Key", "Hash IV"];
        return this.getNormalizeStmt(titles, this.getEcpaySet());
    };

    submitCategoryRules = async (param) => {
        const result = Util.generateLabelValuePairsWithOrigin(this.categoryOfCurrent, param);
        await this.apiOfTab.submitSelects(
            this.getComponent(),
            result.map((each) => {
                return { ...each, id: _.toString(each.value) };
            })
        );
    };

    /** text fetch */

    async onTextFetchChanged(param) {
        switch (this.getSelected()) {
            case "name":
                return Util.appendInfo(`[TEXTFETCH] name text changed ${param}`);
            default:
                return undefined;
        }
    }

    onTextFetchAppendClicked = async (param) => {
        switch (this.getSelected()) {
            case "name":
                return this.submitBrandName(param);
            default:
                return undefined;
        }
    };

    getDefaultTextOfTextFetch = () => {
        switch (this.getSelected()) {
            case "name":
                return this.getBrandName();
            default:
                return undefined;
        }
    };

    getDefaultTitleOfTextFetch = () => {
        switch (this.getSelected()) {
            case "name":
                return "店名：";
            default:
                return undefined;
        }
    };

    /** texts fetch */

    getSelectedConfig() {
        return textsFetchConfig[this.getSelected()];
    }

    getDefaultTextsOfTextFetch = async () => {
        const config = this.getSelectedConfig();
        return await config?.fetchDefaultTexts(this);
    };

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
        return (await config?.onAppendClicked(param, this)) ?? Util.appendInfo(`[TEXTSFETCH] default append clicked ${param}`);
    }

    /** -------------------- async api -------------------- **/
}

export default ModularizedDionysusErosStore;
