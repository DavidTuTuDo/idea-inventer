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
        const pub = this.getCupidPublic();
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
        this.setEnableOfEnableOfCod(pub.getEnableOfCOD());
        this.setEnableOfWhetherHomeDelivery(pub.getWhetherHomeDelivery());
        this.setEnableOfWhetherShipByStorePickup(pub.getWhetherShipByStorePickup());
        this.setEnableOfWhetherShipByRapidly(pub.getWhetherShipByRapidly());
        this.setEnableOfWhetherPickupByBuyerSelf(pub.getWhetherPickupByBuyerSelf());
    }

    /** 共同提交處理器 */
    async submitWithValidation({ validator, value, errorMessage, setter, afterSet }) {
        if (validator && !validator(value)) {
            return this.getComponent().showErrorSnackMessage(errorMessage);
        }
        setter(value);
        if (afterSet) afterSet(value);
        await this.getCupidPublic().submitCupidPublic(this.getComponent());
    }

    /** public */
    submitPercentageOfDiscount = (percent) =>
        this.submitWithValidation({
            validator: this.isValidDiscountPercentNumber,
            value: percent,
            errorMessage: `折扣常數格式錯誤 ${percent}`,
            setter: (val) => this.getCupidPublic().setPercentageOfDiscount(val),
            afterSet: (val) => this.setDialogInputValueOfDionysusErosArrowOfPercentageOfDiscount(val)
        });

    submitAmountOfAllowAnonymousBuy = (amount) =>
        this.submitWithValidation({
            validator: (v) => v >= 1,
            value: amount,
            errorMessage: `未登入消費金額格式錯誤 ${amount}`,
            setter: (val) => this.getCupidPublic().setAmountOfAllowAnonymousBuy(val),
            afterSet: (val) => this.setDialogInputValueOfDionysusErosArrowOfAmountOfAllowAnonymousBuy(val)
        });

    submitAmountOfAllowMaximumBuy = (amount) =>
        this.submitWithValidation({
            validator: (v) => v >= 1,
            value: amount,
            errorMessage: `消費額度格式錯誤 ${amount}`,
            setter: (val) => this.getCupidPublic().setAmountOfMaximumBuy(val),
            afterSet: (val) => this.setDialogInputValueOfDionysusErosArrowOfAmountOfMaximumBuy(val)
        });

    submitThresholdOFreeShipByCod = (price) =>
        this.submitWithValidation({
            validator: _.isNumber,
            value: _.toNumber(price),
            errorMessage: `金額格式錯誤 '${price}'`,
            setter: (val) => this.getCupidPublic().setThresholdOfFreeShipByCOD(val),
            afterSet: (val) => this.getDialogInputValueOfDionysusErosArrowOfThresholdOfFreeShipByCod(val)
        });

    submitThresholdOfCheckoutByCredit = (price) =>
        this.submitWithValidation({
            validator: _.isNumber,
            value: _.toNumber(price),
            errorMessage: `金額格式錯誤 '${price}'`,
            setter: (val) => this.getCupidPublic().setThresholdOfCheckoutByCredit(val),
            afterSet: (val) => this.getDialogInputValueOfDionysusErosArrowOfThresholdOfCheckoutByCredit(val)
        });

    submitThresholdOfFreeShipByRapidly = (price) =>
        this.submitWithValidation({
            validator: _.isNumber,
            value: _.toNumber(price),
            errorMessage: `金額格式錯誤 '${price}'`,
            setter: (val) => this.getCupidPublic().setThresholdOfFreeShipByRapidly(val),
            afterSet: (val) => this.getDialogInputValueOfDionysusErosArrowOfThresholdOfFreeShipByRapidly(val)
        });

    submitThresholdOfFreeShipByHomeDelivery = (price) =>
        this.submitWithValidation({
            validator: _.isNumber,
            value: _.toNumber(price),
            errorMessage: `金額格式錯誤 '${price}'`,
            setter: (val) => this.getCupidPublic().setThresholdOfFreeShipByHomeDelivery(val),
            afterSet: (val) => this.getDialogInputValueOfDionysusErosArrowOfThresholdOfFreeShipByHomeDelivery(val)
        });

    submitThresholdOfCheckoutByLinePay = (price) =>
        this.submitWithValidation({
            validator: _.isNumber,
            value: _.toNumber(price),
            errorMessage: `金額格式錯誤 '${price}'`,
            setter: (val) => this.getCupidPublic().setThresholdOfCheckoutByLinePay(val),
            afterSet: (val) => this.getDialogInputValueOfDionysusErosArrowOfThresholdOfCheckoutByLinePay(val)
        });

    submitThresholdOfFreeShipByStorePickup = (fee) =>
        this.submitWithValidation({
            validator: _.isNumber,
            value: _.toNumber(fee),
            errorMessage: `店到店運費格式錯誤 '${fee}'`,
            setter: (val) => this.getCupidPublic().setThresholdOfFreeShipByStorePickup(val),
            afterSet: (val) => this.getDialogInputValueOfDionysusErosArrowOfThresholdOfFreeShipByStorePickup(val)
        });

    submitNumOfWorker = (num) =>
        this.submitWithValidation({
            validator: (v) => _.isNumber(v) && v > 0,
            value: _.toNumber(num),
            errorMessage: `人數格式錯誤 '${num}'`,
            setter: (val) => this.getCupidPublic().setNumOfWorker(val),
            afterSet: (val) => this.setDialogInputValueOfDionysusErosArrowOfNumOfWorker(val)
        });

    submitFeeOfHomeDelivery = (fee) =>
        this.submitWithValidation({
            validator: _.isNumber,
            value: _.toNumber(fee),
            errorMessage: `宅配運費格式錯誤 '${fee}'`,
            setter: (val) => this.getCupidPublic().setFeeOfHomeDelivery(val),
            afterSet: (val) => this.setDialogInputValueOfDionysusErosArrowOfFeeOfHomeDelivery(val)
        });

    submitFeeOfInStorePickup = (fee) =>
        this.submitWithValidation({
            validator: _.isNumber,
            value: _.toNumber(fee),
            errorMessage: `店到店運費格式錯誤 '${fee}'`,
            setter: (val) => this.getCupidPublic().setFeeOfInStorePickup(val),
            afterSet: (val) => this.setDialogInputValueOfDionysusErosArrowOfFeeOfInStorePickup(val)
        });

    submitFeeOfShipByCOD = (fee) =>
        this.submitWithValidation({
            validator: _.isNumber,
            value: _.toNumber(fee),
            errorMessage: `COD運費格式錯誤 '${fee}'`,
            setter: (val) => this.getCupidPublic().setFeeOfShipByCOD(val),
            afterSet: (val) => this.getDialogInputValueOfDionysusErosArrowOfFeeOfShipByCod(val)
        });

    submitFeeOfRapidOnDelivery = (fee) =>
        this.submitWithValidation({
            validator: _.isNumber,
            value: _.toNumber(fee),
            errorMessage: `店到店運費格式錯誤 '${fee}'`,
            setter: (val) => this.getCupidPublic().setFeeOfRapidOnDelivery(val),
            afterSet: (val) => this.getDialogInputValueOfDionysusErosArrowOfFeeOfRapidOnDelivery(val)
        });

    submitThresholdOfAllowSelfPickup = (fee) =>
        this.submitWithValidation({
            validator: _.isNumber,
            value: _.toNumber(fee),
            errorMessage: `自費最低門檻格式錯誤 '${fee}'`,
            setter: (val) => this.getCupidPublic().setThresholdOfAllowSelfPickup(val),
            afterSet: (val) => this.getDialogInputValueOfDionysusErosArrowOfFeeOfRapidOnDelivery(val)
        });

    /** enable toggles */
    submitWhetherBoughtWithoutLogin = async () => {
        this.getCupidPublic().setEnableOfBoughtWithoutLoginIn(this.getEnableOfBoughtWithoutLoginIn());
        await this.getCupidPublic().submitCupidPublic(this.getComponent());
    };
    submitWhetherEnableOfLinePay = async () => {
        this.getCupidPublic().setEnableOfLinePay(this.getEnableOfLinepay());
        await this.getCupidPublic().submitCupidPublic(this.getComponent());
    };
    submitWhetherEnableOfEcPay = async () => {
        this.getCupidPublic().setEnableOfECPay(this.getEnableOfEcPay());
        await this.getCupidPublic().submitCupidPublic(this.getComponent());
    };
    submitWhetherEnableOfDirect = async () => {
        this.getCupidPublic().setEnableOfDirectPay(this.getEnableOfDirect());
        await this.getCupidPublic().submitCupidPublic(this.getComponent());
    };
    submitWhetherHomeDelivery = async () => {
        this.getCupidPublic().setWhetherHomeDelivery(this.getEnableOfWhetherHomeDelivery());
        await this.getCupidPublic().submitCupidPublic(this.getComponent());
    };
    submitWhetherShipByRapidly = async () => {
        this.getCupidPublic().setWhetherShipByRapidly(this.getEnableOfWhetherShipByRapidly());
        await this.getCupidPublic().submitCupidPublic(this.getComponent());
    };
    submitWhetherShipByStorePickup = async () => {
        this.getCupidPublic().setWhetherShipByStorePickup(this.getEnableOfWhetherShipByStorePickup());
        await this.getCupidPublic().submitCupidPublic(this.getComponent());
    };
    submitEnableOfCOD = async () => {
        this.getCupidPublic().setEnableOfCOD(this.getEnableOfEnableOfCod());
        await this.getCupidPublic().submitCupidPublic(this.getComponent());
    };
    submitWhetherPickupByBuyerSelf = async () => {
        this.getCupidPublic().setWhetherPickupByBuyerSelf(this.getEnableOfWhetherPickupByBuyerSelf());
        await this.getCupidPublic().submitCupidPublic(this.getComponent());
    };
    /** pay secrets */
    submitLinePaySerials = async ([channelId, channelSecret]) => {
        if (!this.isValidLinePayConfig(channelId, channelSecret)) return this.getComponent().showErrorSnackMessage(`LINE PAY支付(格式錯誤)`);
        this.getCupidSecret().setLinepaySet(channelId, channelSecret);
        this.getCupidPublic().setHasLinePay(true);
        await this.getCupidSecret().submitCupidSecret(this.getComponent());
        await this.getCupidPublic().submitCupidPublic(this.getComponent());
    };

    submitECPaySerials = async ([merchantID, hashKey, hashIV]) => {
        if (!this.isValidECPayConfig(merchantID, hashKey, hashIV)) return this.getComponent().showErrorSnackMessage(`綠界支付(格式錯誤)`);
        this.getCupidSecret().setECPaySet(merchantID, hashKey, hashIV);
        this.getCupidPublic().setHasECPay(true);
        await this.getCupidSecret().submitCupidSecret(this.getComponent());
        await this.getCupidPublic().submitCupidPublic(this.getComponent());
    };

    submitDirectPay = async ([url]) => {
        if (!Util.isHttpsURL(url)) return this.getComponent().showErrorSnackMessage(`立牌連結格式錯誤 '${url}'`);
        this.getCupidPublic().setPayOfDirect(url);
        await this.getCupidPublic().submitCupidPublic(this.getComponent());
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
    fetchDefaultTextOfLinePay = async () => this.getNormalizeStmt(["CHANNEL ID", "SECRET  ID"], this.getCupidSecret().getLinepaySet());
    fetchDefaultTextOfECPay = async () => this.getNormalizeStmt(["Merchant ID", "Hash Key", "Hash IV"], this.getCupidSecret().getECPaySet());
    fetchDefaultTextDirectPay = async () => this.getNormalizeStmt(["付費連結"], [this.getCupidPublic().getPayOfDirect()]);

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
