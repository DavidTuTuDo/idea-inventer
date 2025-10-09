const edit = true;

import { utiller as Util, exceptioner as ERROR, pooller as InfinitePool } from "utiller";
import _ from "lodash";
import libpath from "path";
import BaseDionysusErosStore from "./BaseDionysusErosStore";
import NavigatorInfo from "../navigatorGlobalPerspective";
import DionysusSelect from "../dionysusSelect";
import UserInfo from "../../base/BaseUserInfo";

const textsFetchConfig = {
    direct: {
        fetchDefaultTexts: (inst) => inst.fetchDefaultTextDirectPay(),
        autoIncrement: false,
        maximumRow: 1,
        onChanged: () => Util.appendInfo("direct-pay texts changed"),
        onAppendClicked: (param, inst) => inst.submitDirectPay(param)
    },
    tab: {
        fetchDefaultTexts: (inst) => inst.fetchDefaultTextsOfCategory(),
        autoIncrement: true,
        maximumRow: 15,
        onChanged: () => Util.appendInfo("tab texts changed"),
        onAppendClicked: (param, inst) => inst.submitCategoryRules(param)
    },
    linepay: {
        fetchDefaultTexts: (inst) => inst.fetchDefaultTextOfLinePay(),
        autoIncrement: false,
        maximumRow: 3,
        onChanged: () => Util.appendInfo("linepay changed"),
        onAppendClicked: (param, inst) => inst.submitLinePaySerials(param)
    },
    ecpay: {
        fetchDefaultTexts: (inst) => inst.fetchDefaultTextOfECPay(),
        autoIncrement: false,
        maximumRow: 3,
        onChanged: () => Util.appendInfo("ecpay changed"),
        onAppendClicked: (param, inst) => inst.submitECPaySerials(param)
    }
};

class ModularizedDionysusErosStore extends BaseDionysusErosStore {
    constructor(props) {
        super(props);
        this.apiOfTab = new DionysusSelect();
        this.apiOfInfo = new NavigatorInfo();
    }

    async onInitialFetchCompleted(collection) {
        await super.onInitialFetchCompleted(collection);
        const pub = this.getPublic();
        this.setDialogInputValueOfDionysusErosArrowOfNumOfWorker(pub.getNumOfWorker());
        this.setDialogInputValueOfDionysusErosArrowOfAmountOfAllowAnonymousBuy(pub.getAmountOfAllowAnonymousBuy());
        this.setDialogInputValueOfDionysusErosArrowOfPercentageOfDiscount(pub.getPercentageOfDiscount());
        this.setDialogInputValueOfDionysusErosArrowOfAmountOfMaximumBuy(pub.getAmountOfMaximumBuy());
        this.setDialogInputValueOfDionysusErosArrowOfFeeOfHomeDelivery(pub.getFeeOfHomeDelivery());
        this.setDialogInputValueOfDionysusErosArrowOfFeeOfInStorePickup(pub.getFeeOfInStorePickup());
        this.setDialogInputValueOfDionysusErosArrowOfFeeOfShipByCod(pub.getFeeOfShipByCOD());
        this.setDialogInputValueOfDionysusErosArrowOfFeeOfRapidOnDelivery(pub.getFeeOfRapidOnDelivery());
        this.setDialogInputValueOfDionysusErosArrowOfThresholdOfAllowSelfPickup(pub.getThresholdOfAllowSelfPickup());
        this.setDialogInputValueOfDionysusErosArrowOfThresholdOfFreeShipByStorePickup(pub.getThresholdOfFreeShipByStorePickup());
        this.setDialogInputValueOfDionysusErosArrowOfThresholdOfCheckoutByLinePay(pub.getThresholdOfCheckoutByLinePay());
        this.setDialogInputValueOfDionysusErosArrowOfThresholdOfFreeShipByHomeDelivery(pub.getThresholdOfFreeShipByHomeDelivery());
        this.setDialogInputValueOfDionysusErosArrowOfThresholdOfCheckoutByCredit(pub.getThresholdOfCheckoutByCredit());
        this.setDialogInputValueOfDionysusErosArrowOfThresholdOfFreeShipByCod(pub.getThresholdOfFreeShipByCOD());
        this.setDialogInputValueOfDionysusErosArrowOfThresholdOfFreeShipByRapidly(pub.getThresholdOfFreeShipByRapidly());

        this.setEnableOfBoughtWithoutLoginIn(pub.getEnableOfBoughtWithoutLoginIn());
        this.setEnableOfLinepay(pub.getEnableOfLinePay());
        this.setEnableOfEcPay(pub.getEnableOfECPay());
        this.setEnableOfDirect(pub.getEnableOfDirectPay());
        this.setEnableOfWhetherHomeDelivery(pub.getWhetherHomeDelivery());
        this.setEnableOfWhetherShipByStorePickup(pub.getWhetherShipByStorePickup());
        this.setEnableOfWhetherShipByRapidly(pub.getWhetherShipByRapidly());
        this.setEnableOfWhetherHomeShipByCod(pub.getWhetherHomeShipByCOD());
        this.setEnableOfWhetherPickupByBuyerSelf(pub.getWhetherPickupByBuyerSelf());
    }

    /** 共同提交處理器 */
    async submitWithValidation({ validator, value, errorMessage, setter, afterSet }) {
        if (validator && !validator(value)) {
            return this.getComponent().showErrorSnackMessage(errorMessage);
        }
        setter(value);
        if (afterSet) afterSet(value);
        await this.getPublic().submitPublic(this.getComponent());
    }

    /** public */
    submitPercentageOfDiscount = (percent) =>
        this.submitWithValidation({
            validator: this.isValidDiscountPercentNumber,
            value: percent,
            errorMessage: `折扣常數格式錯誤 ${percent}`,
            setter: (val) => this.getPublic().setPercentageOfDiscount(val),
            afterSet: (val) => this.setDialogInputValueOfDionysusErosArrowOfPercentageOfDiscount(val)
        });

    submitAmountOfAllowAnonymousBuy = (amount) =>
        this.submitWithValidation({
            validator: (v) => v >= 1,
            value: amount,
            errorMessage: `未登入消費金額格式錯誤 ${amount}`,
            setter: (val) => this.getPublic().setAmountOfAllowAnonymousBuy(val),
            afterSet: (val) => this.setDialogInputValueOfDionysusErosArrowOfAmountOfAllowAnonymousBuy(val)
        });

    submitAmountOfAllowMaximumBuy = (amount) =>
        this.submitWithValidation({
            validator: (v) => v >= 1,
            value: amount,
            errorMessage: `消費額度格式錯誤 ${amount}`,
            setter: (val) => this.getPublic().setAmountOfMaximumBuy(val),
            afterSet: (val) => this.setDialogInputValueOfDionysusErosArrowOfAmountOfMaximumBuy(val)
        });

    submitThresholdOFreeShipByCod = (price) =>
        this.submitWithValidation({
            validator: _.isNumber,
            value: _.toNumber(price),
            errorMessage: `金額格式錯誤 '${price}'`,
            setter: (val) => this.getPublic().setThresholdOfFreeShipByCOD(val),
            afterSet: (val) => this.getDialogInputValueOfDionysusErosArrowOfThresholdOfFreeShipByCod(val)
        });

    submitThresholdOfCheckoutByCredit = (price) =>
        this.submitWithValidation({
            validator: _.isNumber,
            value: _.toNumber(price),
            errorMessage: `金額格式錯誤 '${price}'`,
            setter: (val) => this.getPublic().setThresholdOfCheckoutByCredit(val),
            afterSet: (val) => this.getDialogInputValueOfDionysusErosArrowOfThresholdOfCheckoutByCredit(val)
        });

    submitThresholdOfFreeShipByRapidly = (price) =>
        this.submitWithValidation({
            validator: _.isNumber,
            value: _.toNumber(price),
            errorMessage: `金額格式錯誤 '${price}'`,
            setter: (val) => this.getPublic().setThresholdOfFreeShipByRapidly(val),
            afterSet: (val) => this.getDialogInputValueOfDionysusErosArrowOfThresholdOfFreeShipByRapidly(val)
        });

    submitThresholdOfFreeShipByHomeDelivery = (price) =>
        this.submitWithValidation({
            validator: _.isNumber,
            value: _.toNumber(price),
            errorMessage: `金額格式錯誤 '${price}'`,
            setter: (val) => this.getPublic().setThresholdOfFreeShipByHomeDelivery(val),
            afterSet: (val) => this.getDialogInputValueOfDionysusErosArrowOfThresholdOfFreeShipByHomeDelivery(val)
        });

    submitThresholdOfCheckoutByLinePay = (price) =>
        this.submitWithValidation({
            validator: _.isNumber,
            value: _.toNumber(price),
            errorMessage: `金額格式錯誤 '${price}'`,
            setter: (val) => this.getPublic().setThresholdOfCheckoutByLinePay(val),
            afterSet: (val) => this.getDialogInputValueOfDionysusErosArrowOfThresholdOfCheckoutByLinePay(val)
        });

    submitThresholdOfFreeShipByStorePickup = (fee) =>
        this.submitWithValidation({
            validator: _.isNumber,
            value: _.toNumber(fee),
            errorMessage: `店到店運費格式錯誤 '${fee}'`,
            setter: (val) => this.getPublic().setThresholdOfFreeShipByStorePickup(val),
            afterSet: (val) => this.getDialogInputValueOfDionysusErosArrowOfThresholdOfFreeShipByStorePickup(val)
        });

    submitNumOfWorker = (num) =>
        this.submitWithValidation({
            validator: (v) => _.isNumber(v) && v > 0,
            value: _.toNumber(num),
            errorMessage: `人數格式錯誤 '${num}'`,
            setter: (val) => this.getPublic().setNumOfWorker(val),
            afterSet: (val) => this.setDialogInputValueOfDionysusErosArrowOfNumOfWorker(val)
        });

    submitFeeOfHomeDelivery = (fee) =>
        this.submitWithValidation({
            validator: _.isNumber,
            value: _.toNumber(fee),
            errorMessage: `宅配運費格式錯誤 '${fee}'`,
            setter: (val) => this.getPublic().setFeeOfHomeDelivery(val),
            afterSet: (val) => this.setDialogInputValueOfDionysusErosArrowOfFeeOfHomeDelivery(val)
        });

    submitFeeOfInStorePickup = (fee) =>
        this.submitWithValidation({
            validator: _.isNumber,
            value: _.toNumber(fee),
            errorMessage: `店到店運費格式錯誤 '${fee}'`,
            setter: (val) => this.getPublic().setFeeOfInStorePickup(val),
            afterSet: (val) => this.setDialogInputValueOfDionysusErosArrowOfFeeOfInStorePickup(val)
        });

    submitFeeOfShipByCOD = (fee) =>
        this.submitWithValidation({
            validator: _.isNumber,
            value: _.toNumber(fee),
            errorMessage: `COD運費格式錯誤 '${fee}'`,
            setter: (val) => this.getPublic().setFeeOfShipByCOD(val),
            afterSet: (val) => this.getDialogInputValueOfDionysusErosArrowOfFeeOfShipByCod(val)
        });

    submitFeeOfRapidOnDelivery = (fee) =>
        this.submitWithValidation({
            validator: _.isNumber,
            value: _.toNumber(fee),
            errorMessage: `店到店運費格式錯誤 '${fee}'`,
            setter: (val) => this.getPublic().setFeeOfRapidOnDelivery(val),
            afterSet: (val) => this.getDialogInputValueOfDionysusErosArrowOfFeeOfRapidOnDelivery(val)
        });

    submitThresholdOfAllowSelfPickup = (fee) =>
        this.submitWithValidation({
            validator: _.isNumber,
            value: _.toNumber(fee),
            errorMessage: `自費最低門檻格式錯誤 '${fee}'`,
            setter: (val) => this.getPublic().setThresholdOfAllowSelfPickup(val),
            afterSet: (val) => this.getDialogInputValueOfDionysusErosArrowOfFeeOfRapidOnDelivery(val)
        });

    /** enable toggles */
    submitWhetherBoughtWithoutLogin = async () => {
        this.getPublic().setEnableOfBoughtWithoutLoginIn(this.getEnableOfBoughtWithoutLoginIn());
        await this.getPublic().submitPublic(this.getComponent());
    };
    submitWhetherEnableOfLinePay = async () => {
        this.getPublic().setEnableOfLinePay(this.getEnableOfLinepay());
        await this.getPublic().submitPublic(this.getComponent());
    };
    submitWhetherEnableOfEcPay = async () => {
        this.getPublic().setEnableOfECPay(this.getEnableOfEcPay());
        await this.getPublic().submitPublic(this.getComponent());
    };
    submitWhetherEnableOfDirect = async () => {
        this.getPublic().setEnableOfDirectPay(this.getEnableOfDirect());
        await this.getPublic().submitPublic(this.getComponent());
    };
    submitWhetherHomeDelivery = async () => {
        this.getPublic().setWhetherHomeDelivery(this.getEnableOfWhetherHomeDelivery());
        await this.getPublic().submitPublic(this.getComponent());
    };
    submitWhetherShipByRapidly = async () => {
        this.getPublic().setWhetherShipByRapidly(this.getEnableOfWhetherShipByRapidly());
        await this.getPublic().submitPublic(this.getComponent());
    };
    submitWhetherShipByStorePickup = async () => {
        this.getPublic().setWhetherShipByStorePickup(this.getEnableOfWhetherShipByStorePickup());
        await this.getPublic().submitPublic(this.getComponent());
    };
    submitWhetherHomeShipByCOD = async () => {
        this.getPublic().setWhetherHomeShipByCOD(this.getEnableOfWhetherHomeShipByCod());
        await this.getPublic().submitPublic(this.getComponent());
    };
    submitWhetherPickupByBuyerSelf = async () => {
        this.getPublic().setWhetherShipByStorePickup(this.getEnableOfWhetherPickupByBuyerSelf());
        await this.getPublic().submitPublic(this.getComponent());
    };
    /** pay secrets */
    submitLinePaySerials = async ([channelId, channelSecret]) => {
        if (!this.isValidLinePayConfig(channelId, channelSecret)) return this.getComponent().showErrorSnackMessage(`LINE PAY支付(格式錯誤)`);
        this.getSecret().setLinepaySet(channelId, channelSecret);
        this.getPublic().setHasLinePay(true);
        await this.getSecret().submitSecret(this.getComponent());
        await this.getPublic().submitPublic(this.getComponent());
    };

    submitECPaySerials = async ([merchantID, hashKey, hashIV]) => {
        if (!this.isValidECPayConfig(merchantID, hashKey, hashIV)) return this.getComponent().showErrorSnackMessage(`綠界支付(格式錯誤)`);
        this.getSecret().setECPaySet(merchantID, hashKey, hashIV);
        this.getPublic().setHasECPay(true);
        await this.getSecret().submitSecret(this.getComponent());
        await this.getPublic().submitPublic(this.getComponent());
    };

    submitDirectPay = async ([url]) => {
        if (!Util.isHttpsURL(url)) return this.getComponent().showErrorSnackMessage(`立牌連結格式錯誤 '${url}'`);
        this.getPublic().setPayOfDirect(url);
        await this.getPublic().submitPublic(this.getComponent());
    };

    submitBrandName = async (name) => {
        if (_.isEmpty(name)) return this.getComponent().showErrorSnackMessage(`店名格式錯誤`);
        const info = await this.apiOfInfo.fetchGlobalPerspective(this.getComponent());
        info.nameOfBrand = name;
        await this.apiOfInfo.submitGlobalPerspective(this.getComponent(), info);
        UserInfo.setNameOfBrand(name);
    };

    submitCategoryRules = async (param) => {
        const result = Util.generateLabelValuePairsWithOrigin(this.categoryOfCurrent, param);
        await this.apiOfTab.submitSelects(
            this.getComponent(),
            result.map((each) => ({ ...each, id: _.toString(each.value) }))
        );
    };

    /** fetch */
    fetchDefaultTextsOfCategory = async () => {
        this.categoryOfCurrent = (await this.apiOfTab.fetchSelects(this.getComponent())) ?? [];
        return this.categoryOfCurrent.map((each) => ({ content: each.label }));
    };
    fetchDefaultTextOfLinePay = async () => this.getNormalizeStmt(["CHANNEL ID", "SECRET  ID"], this.getSecret().getLinepaySet());
    fetchDefaultTextOfECPay = async () => this.getNormalizeStmt(["Merchant ID", "Hash Key", "Hash IV"], this.getSecret().getECPaySet());
    fetchDefaultTextDirectPay = async () => this.getNormalizeStmt(["付費連結"], [this.getPublic().getPayOfDirect()]);

    getNormalizeStmt = (titles, items) => titles.map((title, idx) => ({ index: title, content: _.get(items, idx, "") || "" }));

    /** text fetch */
    onTextFetchChanged = (param) => (this.getSelected() === "name" ? Util.appendInfo(`[TEXTFETCH] name text changed ${param}`) : undefined);
    onTextFetchAppendClicked = (param) => (this.getSelected() === "name" ? this.submitBrandName(param) : undefined);
    getDefaultTextOfTextFetch = () => (this.getSelected() === "name" ? UserInfo.getNameOfBrand() : undefined);
    getDefaultTitleOfTextFetch = () => (this.getSelected() === "name" ? "店名：" : undefined);

    /** texts fetch */
    getSelectedConfig = () => textsFetchConfig[this.getSelected()];
    getDefaultTextsOfTextFetch = async () => await this.getSelectedConfig()?.fetchDefaultTexts(this);
    autoIncrementOfTextsFetch = () => this.getSelectedConfig()?.autoIncrement ?? false;
    getMaximumRowOfTextsFetch = () => this.getSelectedConfig()?.maximumRow ?? true;
    onTextsFetchChanged = async (param) => (await this.getSelectedConfig()?.onChanged(param)) ?? Util.appendInfo("default changed");
    onTextsFetchAppendClicked = async (param) => (await this.getSelectedConfig()?.onAppendClicked(param, this)) ?? Util.appendInfo(`[TEXTSFETCH] default append clicked ${param}`);

    /** validators */
    isValidECPayConfig = (id, key, iv) => [id, key, iv].every((p) => _.isString(p) && !_.isEmpty(p));
    isValidLinePayConfig = (id, secret) => [id, secret].every((p) => _.isString(p) && !_.isEmpty(p));
    isValidDiscountPercentNumber = (val) => _.inRange(_.toNumber(val), 10, 101);
}

export default ModularizedDionysusErosStore;
