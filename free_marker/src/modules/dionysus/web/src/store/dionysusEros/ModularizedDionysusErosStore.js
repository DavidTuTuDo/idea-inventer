const edit = true;

import { utiller as Util, exceptioner as ERROR, pooller as InfinitePool } from "utiller";
import _ from "lodash";
import libpath from "path";
import BaseDionysusErosStore from "./BaseDionysusErosStore";
import NavigatorInfo from "../navigatorInfo";
import DionysusSelect from "../dionysusSelect";
import UserInfo from "../../base/BaseUserInfo";

const textsFetchConfig = {
    direct: {
        fetchDefaultTexts: async (instance) => {
            return await instance.fetchDefaultTextDirectPay();
        },
        autoIncrement: false,
        maximumRow: 1,
        onChanged: async () => {
            return await Util.appendInfo("direct-pay texts changed");
        },
        onAppendClicked: async (param, instance) => {
            return await instance.submitDirectPay(param);
        }
    },
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
        maximumRow: 3,
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
        this.apiOfInfo = new NavigatorInfo();
    }

    async onInitialFetchCompleted(collection) {
        await super.onInitialFetchCompleted(collection);
        this.setDialogInputValueOfDionysusErosArrowOfNumOfWorker(this.getPublic().getNumOfWorker());
        this.setDialogInputValueOfDionysusErosArrowOfPriceOfFreeShipping(this.getPublic().getPriceOfFreeShipping());
        this.setDialogInputValueOfDionysusErosArrowOfAmountOfAllowAnonymousBuy(this.getPublic().getAmountOfAllowAnonymousBuy());
        this.setDialogInputValueOfDionysusErosArrowOfPercentageOfDiscount(this.getPublic().getPercentageOfDiscount());
        this.setAllowBoughtWithoutLoginIn(this.getPublic().getAllowBoughtWithoutLoginIn());
    }

    /** public */
    submitPercentageOfDiscount = async (percent) => {
        if (!this.isValidDiscountPercentNumber(percent)) return this.getComponent().showErrorSnackMessage(`折扣常數格式錯誤 ${percent}`);
        await this.getPublic().setPercentageOfDiscount(percent);
        this.setDialogInputValueOfDionysusErosArrowOfPercentageOfDiscount(percent);
        await this.getPublic().submitPublic(this.getComponent());
    };

    /** public */
    submitAmountOfAllowAnonymousBuy = async (amount) => {
        if (amount < 1) return this.getComponent().showErrorSnackMessage(`未登入消費金額格式錯誤 ${amount}`);
        await this.getPublic().setAmountOfAllowAnonymousBuy(amount);
        this.setDialogInputValueOfDionysusErosArrowOfAmountOfAllowAnonymousBuy(amount);
        await this.getPublic().submitPublic(this.getComponent());
    };

    /** secret */
    submitLinePaySerials = async (param) => {
        Util.appendInfo(`[TEXTSFETCH] linepay append clicked ${param}`);
        if (!this.isValidLinePayConfig(...param)) return this.getComponent().showErrorSnackMessage(`LINE PAY支付(格式錯誤)`);
        this.getSecret().setLinepaySet(...param);
        this.getPublic().setHasLinePay(true);
        await this.getSecret().submitSecret(this.getComponent());
        await this.getPublic().submitPublic(this.getComponent());
    };

    /** secret */
    submitECPaySerials = async (param) => {
        Util.appendInfo(`[TEXTSFETCH] ecpay append clicked ${param}`);
        if (!this.isValidECPayConfig(...param)) return this.getComponent().showErrorSnackMessage(`綠界支付(格式錯誤)`);
        this.getSecret().setEcpaySet(...param);
        this.getPublic().setHasECPay(true);
        await this.getSecret().submitSecret(this.getComponent());
        await this.getPublic().submitPublic(this.getComponent());
    };

    /** public */
    submitDirectPay = async (param) => {
        const path = param[0];
        Util.appendInfo(`[textInput] direct append clicked ${path}`);
        const target = _.toString(path);
        if (!this.isLinePayCallbackUrl(target)) return this.getComponent().showErrorSnackMessage(`立牌連結格式錯誤 '${path}'`);
        this.getPublic().setPayOfDirect(target);
        await this.getPublic().submitPublic(this.getComponent());
    };

    /** public */
    submitPriceOfFreeShipping = async (price) => {
        Util.appendInfo(`[textInput] priceShipping append clicked ${price}`);
        const target = _.toNumber(price);
        if (!_.isNumber(target)) return this.getComponent().showErrorSnackMessage(`金額格式錯誤 '${price}'`);
        this.getPublic().setPriceOfFreeShipping(target);
        this.setDialogInputValueOfDionysusErosArrowOfPriceOfFreeShipping(target);
        await this.getPublic().submitPublic(this.getComponent());
    };

    /** public */
    submitNumOfWorker = async (num) => {
        Util.appendInfo(`[textInput] numOfWorker append clicked ${num}`);
        const target = _.toNumber(num);
        if (!_.isNumber(target) || target < 1) return this.getComponent().showErrorSnackMessage(`人數格式錯誤 '${num}'`);
        this.setDialogInputValueOfDionysusErosArrowOfNumOfWorker(target);
        this.getPublic().setNumOfWorker(target);
        await this.getPublic().submitPublic(this.getComponent());
    };

    /** public */
    submitWhetherBoughtWithoutLogin = async () => {
        Util.appendInfo(` 免登入下單 ${this.getAllowBoughtWithoutLoginIn()}`);
        this.getPublic().setAllowBoughtWithoutLoginIn(this.getAllowBoughtWithoutLoginIn());
        await this.getPublic().submitPublic(this.getComponent());
    };

    /** admin */
    submitBrandName = async (name) => {
        Util.appendInfo(`[TEXTFETCH] name text clicked ${name}`);
        if (_.size(name) <= 0) return this.getComponent().showErrorSnackMessage(`店名格式錯誤`);
        const info = await this.apiOfInfo.fetchInfo(this.getComponent());
        info.nameOfBrand = name;
        await this.apiOfInfo.submitInfo(this.getComponent(), info);
        UserInfo.setNameOfBrand(name);
    };

    /** admin */
    submitCategoryRules = async (param) => {
        const result = Util.generateLabelValuePairsWithOrigin(this.categoryOfCurrent, param);
        await this.apiOfTab.submitSelects(
            this.getComponent(),
            result.map((each) => {
                return { ...each, id: _.toString(each.value) };
            })
        );
    };

    /** admin */
    fetchDefaultTextsOfCategory = async () => {
        this.categoryOfCurrent = (await this.apiOfTab.fetchSelects(this.getComponent())) ?? [];
        return this.categoryOfCurrent.map((each) => {
            {
                return { content: each.label };
            }
        });
    };

    /** secret */
    fetchDefaultTextOfLinePay = async () => {
        const titles = ["CHANNEL ID", "SECRET  ID"];
        return this.getNormalizeStmt(titles, this.getSecret().getLinepaySet());
    };

    /** secret */
    fetchDefaultTextOfECPay = async () => {
        const titles = ["Merchant ID", "Hash Key", "Hash IV"];
        return this.getNormalizeStmt(titles, this.getSecret().getEcpaySet());
    };

    /** public */
    fetchDefaultTextDirectPay = async () => {
        const titles = ["付費連結"];
        return this.getNormalizeStmt(titles, [this.getPublic().getPayOfDirect()]);
    };

    getNormalizeStmt = (titles, items) => {
        return _.map(titles, (title, idx) => ({
            index: title,
            content: _.get(items, idx, "") || ""
        }));
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
                return UserInfo.getNameOfBrand();
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

    isValidECPayConfig = (merchantID, hashKey, hashIV) => {
        // 定義檢查單一參數的輔助函式
        const checkStringParam = (param, name) => {
            // 檢查是否為字串型別且內容非空
            if (!(_.isString(param) && !_.isEmpty(param))) {
                console.error(`${name} 格式無效 (必須為非空字串)。實際值: ${param}`);
                return false;
            }
            return true;
        };
        // 獨立檢查 MerchantID
        if (!checkStringParam(merchantID, "MerchantID")) {
            return false;
        }
        // 獨立檢查 HashKey
        if (!checkStringParam(hashKey, "HashKey")) {
            return false;
        }
        // 獨立檢查 HashIV
        if (!checkStringParam(hashIV, "HashIV")) {
            return false;
        }
        // 所有參數都檢查通過
        return true;
    };

    isValidLinePayConfig = (channelId, channelSecret) => {
        // 定義檢查單一參數的輔助函式
        const checkStringParam = (param, name) => {
            // 使用 Lodash 檢查是否為字串型別且內容非空
            if (!(_.isString(param) && !_.isEmpty(param))) {
                // Log 資訊：清楚指出哪個參數無效，以及它的實際值/型別
                console.error(`LINE Pay 驗證失敗：${name} 格式不符合要求（必須為非空字串）。`);
                console.error(` -> 錯誤項目: ${name}，實際值: [${param}]，實際型別: ${typeof param}`);
                return false;
            }
            return true;
        };

        // 獨立檢查 channelId
        if (!checkStringParam(channelId, "channelId")) {
            return false;
        }

        // 獨立檢查 channelSecret
        if (!checkStringParam(channelSecret, "channelSecret")) {
            return false;
        }

        // 所有參數都檢查通過
        return true;
    };

    isLinePayCallbackUrl = (urlString) => {
        if (!_.isString(urlString) || _.isEmpty(urlString)) {
            console.warn("輸入的 URL 為空或不是字串。");
            return false;
        }

        try {
            // 1. 使用瀏覽器原生的 URL 類來解析 URL 字串
            const url = new URL(urlString);
            // 2. 獲取 URL 中的所有查詢參數
            const params = url.searchParams;
            // 3. 定義 LINE Pay 支付回傳時必須包含的關鍵參數
            const requiredParams = ["transactionId", "orderId"];
            // 4. 檢查所有必要參數是否都存在於 URL 中
            const allRequiredParamsExist = _.every(requiredParams, (paramName) => {
                const isExist = params.has(paramName);
                if (!isExist) {
                    console.log(`[LINE Pay 檢查] 缺少關鍵參數: ${paramName}`);
                }
                return isExist;
            });

            // 5. 如果所有參數都存在，則認為是有效的回傳連結
            return allRequiredParamsExist;
        } catch (error) {
            // 如果 URL 格式無效 (例如不是完整的 http/https 連結)
            console.error("無法解析 URL，請檢查格式是否正確:", error.message);
            return false;
        }
    };

    isValidDiscountPercentNumber = (input) => {
        // 將輸入轉為數字（可處理字串數字如 "42"）
        const num = _.toNumber(input);

        // 檢查是否為有限的數字，排除 NaN、Infinity 等非實際數字情況
        const isFiniteNumber = _.isFinite(num);

        // 檢查數字是否落在 [10, 100] 區間
        // _.inRange 的範圍是 [start, end)，所以 end 要設為 101 才包含 100
        const isInRange = _.inRange(num, 10, 101);

        // 綜合判斷：必須是有限數字，且在合法範圍內才回傳 true
        return isFiniteNumber && isInRange;
    };
}

export default ModularizedDionysusErosStore;
