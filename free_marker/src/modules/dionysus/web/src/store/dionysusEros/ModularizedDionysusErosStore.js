const edit = true;

import { utiller as Util, exceptioner as ERROR, pooller as InfinitePool } from "utiller";
import _ from "lodash";
import libpath from "path";
import BaseDionysusErosStore from "./BaseDionysusErosStore";
import NavigatorInfo from "../navigatorGlobalPerspective";
import DionysusSelect from "../dionysusSelectBound";
import UserInfo from "../../base/BaseUserInfo";

const textsFetchConfig = {
    direct: {
        fetchDefaultTexts: (inst) => inst.fetchDefaultHrefOfDirectPay(),
        autoIncrement: false,
        maximumRow: 1,
        onChanged: () => Util.appendInfo("direct-pay texts changed"),
        onAppendClicked: (param, inst) => inst.submitHrefOfDirectPay(param)
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

        this.setDialogInputValueOfDionysusErosArrowOfMaximumOfUniqueItems(UserInfo.getGlobalPerspectiveAttr(`maximumOfUniqueItems`));
        this.setDialogInputValueOfDionysusErosArrowOfTtlOfPayment(UserInfo.getGlobalPerspectiveAttr(`ttlOfPayment`));
        this.setDialogInputValueOfDionysusErosArrowOfTtlOfAnonymous(UserInfo.getGlobalPerspectiveAttr(`ttlOfAnonymous`));
        this.setDialogInputValueOfDionysusErosArrowOfFbO(UserInfo.getGlobalPerspectiveAttr(`fbO`));
        this.setDialogInputValueOfDionysusErosArrowOfYtO(UserInfo.getGlobalPerspectiveAttr(`ytO`));
        this.setDialogInputValueOfDionysusErosArrowOfTiktokO(UserInfo.getGlobalPerspectiveAttr(`tiktokO`));
        this.setDialogInputValueOfDionysusErosArrowOfIgO(UserInfo.getGlobalPerspectiveAttr(`igO`));
        this.setDialogInputValueOfDionysusErosArrowOfCompany(UserInfo.getGlobalPerspectiveAttr(`company`));
        this.setDialogInputValueOfDionysusErosArrowOfPhoneO(UserInfo.getGlobalPerspectiveAttr(`phoneO`));
        this.setDialogInputValueOfDionysusErosArrowOfUnifiedB(UserInfo.getGlobalPerspectiveAttr(`unifiedB`));
        this.setDialogInputValueOfDionysusErosArrowOfAddressO(UserInfo.getGlobalPerspectiveAttr(`addressO`));
        this.setDialogInputValueOfDionysusErosArrowOfEmailO(UserInfo.getGlobalPerspectiveAttr(`emailO`));
        this.setDialogInputValueOfDionysusErosArrowOfLineO(UserInfo.getGlobalPerspectiveAttr(`lineO`));
        this.setEnableOfBoughtWithoutLoginIn(pub.getEnableOfBoughtWithoutLoginIn());
        this.setEnableOfLinepay(pub.getEnableOfLinePay());
        this.setEnableOfEcPay(pub.getEnableOfECPay());
        this.setEnableOfDirectPay(pub.getEnableOfDirectPay());
        this.setEnableOfEnableOfCod(pub.getEnableOfCOD());
        this.setEnableOfWhetherHomeDelivery(pub.getWhetherHomeDelivery());
        this.setEnableOfWhetherShipByStorePickup(pub.getWhetherShipByStorePickup());
        this.setEnableOfWhetherShipByRapidly(pub.getWhetherShipByRapidly());
        this.setEnableOfWhetherPickupByBuyerSelf(pub.getWhetherPickupByBuyerSelf());
    }

    /** 共同提交處理器 */
    async submitWithValidation({ validator, value, errorMessage, setter, afterSet, key }) {
        if (validator && !validator(value)) return this.getComponent().showErrorSnackMessage(errorMessage);
        setter(value);
        if (afterSet) afterSet(value);
        await this.getCupidPublic().upsertCupidPublic(this.getComponent(), Util.getObject(key, value));
    }

    /** public */
    submitPercentageOfDiscount = (percent) =>
        this.submitWithValidation({
            validator: this.isValidDiscountPercentNumber,
            value: percent,
            key: `percentageOfDiscount`,
            errorMessage: `折扣常數格式錯誤 ${percent}`,
            setter: (val) => this.getCupidPublic().setPercentageOfDiscount(val),
            afterSet: (val) => this.setDialogInputValueOfDionysusErosArrowOfPercentageOfDiscount(val)
        });

    submitPercentageFeeOfCOD = (percent) =>
        this.submitWithValidation({
            validator: this.isValidDiscountPercentNumber,
            value: percent,
            key: `percentageOfDiscount`,
            errorMessage: `貨到付款(COD)手續費 ${percent} %錯誤`,
            setter: (val) => this.getCupidPublic().setPercentageFeeOfCOD(percent),
            afterSet: (val) => this.setDialogInputValueOfDionysusErosArrowOfPercentageFeeOfCod(percent)
        });

    submitAmountOfAllowAnonymousBuy = (amount) =>
        this.submitWithValidation({
            validator: (v) => this.isPositiveNum(v),
            value: _.toNumber(amount),
            key: `amountOfAllowAnonymousBuy`,
            errorMessage: `未登入消費金額格式錯誤 ${amount} 元`,
            setter: (val) => this.getCupidPublic().setAmountOfAllowAnonymousBuy(val),
            afterSet: (val) => this.setDialogInputValueOfDionysusErosArrowOfAmountOfAllowAnonymousBuy(val)
        });

    submitAmountOfMaximumBuy = (amount) =>
        this.submitWithValidation({
            validator: (v) => this.isPositiveNum(v),
            value: _.toNumber(amount),
            key: `amountOfMaximumBuy`,
            errorMessage: `消費額度格式錯誤 ${amount} 元`,
            setter: (val) => this.getCupidPublic().setAmountOfMaximumBuy(val),
            afterSet: (val) => this.setDialogInputValueOfDionysusErosArrowOfAmountOfMaximumBuy(val)
        });

    submitThresholdOFreeShipByCod = (price) =>
        this.submitWithValidation({
            validator: (v) => this.isPositiveNum(v),
            value: _.toNumber(price),
            key: `thresholdOfFreeShipByCOD`,
            errorMessage: `金額格式錯誤 '${price}'`,
            setter: (val) => this.getCupidPublic().setThresholdOfFreeShipByCOD(val),
            afterSet: (val) => this.getDialogInputValueOfDionysusErosArrowOfThresholdOfFreeShipByCod(val)
        });

    submitThresholdOfCheckoutByCredit = (price) =>
        this.submitWithValidation({
            validator: (v) => this.isPositiveNum(v),
            value: _.toNumber(price),
            key: `thresholdOfCheckoutByCredit`,
            errorMessage: `金額格式錯誤 '${price}'`,
            setter: (val) => this.getCupidPublic().setThresholdOfCheckoutByCredit(val),
            afterSet: (val) => this.getDialogInputValueOfDionysusErosArrowOfThresholdOfCheckoutByCredit(val)
        });

    submitThresholdOfFreeShipByRapidly = (price) =>
        this.submitWithValidation({
            validator: (v) => this.isPositiveNum(v),
            value: _.toNumber(price),
            key: `thresholdOfFreeShipByRapidly`,
            errorMessage: `金額格式錯誤 '${price}'`,
            setter: (val) => this.getCupidPublic().setThresholdOfFreeShipByRapidly(val),
            afterSet: (val) => this.getDialogInputValueOfDionysusErosArrowOfThresholdOfFreeShipByRapidly(val)
        });

    submitThresholdOfFreeShipByHomeDelivery = (price) =>
        this.submitWithValidation({
            validator: (v) => this.isPositiveNum(v),
            value: _.toNumber(price),
            key: `thresholdOfFreeShipByHomeDelivery`,
            errorMessage: `金額格式錯誤 '${price}'`,
            setter: (val) => this.getCupidPublic().setThresholdOfFreeShipByHomeDelivery(val),
            afterSet: (val) => this.getDialogInputValueOfDionysusErosArrowOfThresholdOfFreeShipByHomeDelivery(val)
        });

    submitThresholdOfCheckoutByLinePay = (price) =>
        this.submitWithValidation({
            validator: (v) => this.isPositiveNum(v),
            value: _.toNumber(price),
            key: `thresholdOfCheckoutByLinePay`,
            errorMessage: `金額格式錯誤 '${price}'`,
            setter: (val) => this.getCupidPublic().setThresholdOfCheckoutByLinePay(val),
            afterSet: (val) => this.getDialogInputValueOfDionysusErosArrowOfThresholdOfCheckoutByLinePay(val)
        });

    submitThresholdOfFreeShipByStorePickup = (fee) =>
        this.submitWithValidation({
            validator: (v) => this.isPositiveNum(v),
            value: _.toNumber(fee),
            key: `thresholdOfFreeShipByStorePickup`,
            errorMessage: `店到店運費格式錯誤 '${fee}'`,
            setter: (val) => this.getCupidPublic().setThresholdOfFreeShipByStorePickup(val),
            afterSet: (val) => this.getDialogInputValueOfDionysusErosArrowOfThresholdOfFreeShipByStorePickup(val)
        });

    submitNumOfWorker = (num) =>
        this.submitWithValidation({
            validator: (v) => this.isPositiveNum(v),
            value: _.toNumber(num),
            key: `numOfWorker`,
            errorMessage: `人數格式錯誤 '${num}'`,
            setter: (val) => this.getCupidPublic().setNumOfWorker(val),
            afterSet: (val) => this.setDialogInputValueOfDionysusErosArrowOfNumOfWorker(val)
        });

    submitFeeOfHomeDelivery = (fee) =>
        this.submitWithValidation({
            validator: (v) => this.isPositiveNum(v),
            value: _.toNumber(fee),
            key: `feeOfHomeDelivery`,
            errorMessage: `宅配運費格式錯誤 '${fee}'`,
            setter: (val) => this.getCupidPublic().setFeeOfHomeDelivery(val),
            afterSet: (val) => this.setDialogInputValueOfDionysusErosArrowOfFeeOfHomeDelivery(val)
        });

    submitFeeOfInStorePickup = (fee) =>
        this.submitWithValidation({
            validator: (v) => this.isPositiveNum(v),
            value: _.toNumber(fee),
            key: `feeOfInStorePickup`,
            errorMessage: `店到店運費格式錯誤 '${fee}'`,
            setter: (val) => this.getCupidPublic().setFeeOfInStorePickup(val),
            afterSet: (val) => this.setDialogInputValueOfDionysusErosArrowOfFeeOfInStorePickup(val)
        });

    submitFeeOfShipByCOD = (fee) =>
        this.submitWithValidation({
            validator: (v) => this.isPositiveNum(v),
            value: _.toNumber(fee),
            key: `feeOfShipByCOD`,
            errorMessage: `COD運費格式錯誤 '${fee}'`,
            setter: (val) => this.getCupidPublic().setFeeOfShipByCOD(val),
            afterSet: (val) => this.getDialogInputValueOfDionysusErosArrowOfFeeOfShipByCod(val)
        });

    submitFeeOfRapidOnDelivery = (fee) =>
        this.submitWithValidation({
            validator: (v) => this.isPositiveNum(v),
            value: _.toNumber(fee),
            key: `feeOfRapidOnDelivery`,
            errorMessage: `店到店運費格式錯誤 '${fee}'`,
            setter: (val) => this.getCupidPublic().setFeeOfRapidOnDelivery(val),
            afterSet: (val) => this.getDialogInputValueOfDionysusErosArrowOfFeeOfRapidOnDelivery(val)
        });

    submitThresholdOfAllowSelfPickup = (fee) =>
        this.submitWithValidation({
            validator: (v) => this.isPositiveNum(v),
            value: _.toNumber(fee),
            key: `thresholdOfAllowSelfPickup`,
            errorMessage: `自費最低門檻格式錯誤 '${fee}'`,
            setter: (val) => this.getCupidPublic().setThresholdOfAllowSelfPickup(val),
            afterSet: (val) => this.getDialogInputValueOfDionysusErosArrowOfFeeOfRapidOnDelivery(val)
        });

    /** enable toggles */
    submitWhetherBoughtWithoutLogin = async () => {
        this.getCupidPublic().setEnableOfBoughtWithoutLoginIn(this.getEnableOfBoughtWithoutLoginIn());
        await this.getCupidPublic().upsertCupidPublic(this.getComponent(), { enableOfBoughtWithoutLoginIn: this.getEnableOfBoughtWithoutLoginIn() });
    };
    submitWhetherEnableOfLinePay = async () => {
        this.getCupidPublic().setEnableOfLinePay(this.getEnableOfLinepay());
        await this.getCupidPublic().upsertCupidPublic(this.getComponent(), { enableOfLinePay: this.getEnableOfLinepay() });
    };
    submitWhetherEnableOfEcPay = async () => {
        this.getCupidPublic().setEnableOfECPay(this.getEnableOfEcPay());
        await this.getCupidPublic().upsertCupidPublic(this.getComponent(), { enableOfECPay: this.getEnableOfEcPay() });
    };
    submitWhetherEnableOfDirectPay = async () => {
        this.getCupidPublic().setEnableOfDirectPay(this.getEnableOfDirectPay());
        await this.getCupidPublic().upsertCupidPublic(this.getComponent(), { enableOfDirectPay: this.getEnableOfDirectPay() });
    };
    submitWhetherHomeDelivery = async () => {
        this.getCupidPublic().setWhetherHomeDelivery(this.getEnableOfWhetherHomeDelivery());
        await this.getCupidPublic().upsertCupidPublic(this.getComponent(), { whetherHomeDelivery: this.getEnableOfWhetherHomeDelivery() });
    };
    submitWhetherShipByRapidly = async () => {
        this.getCupidPublic().setWhetherShipByRapidly(this.getEnableOfWhetherShipByRapidly());
        await this.getCupidPublic().upsertCupidPublic(this.getComponent(), { whetherShipByRapidly: this.getEnableOfWhetherShipByRapidly() });
    };
    submitWhetherShipByStorePickup = async () => {
        this.getCupidPublic().setWhetherShipByStorePickup(this.getEnableOfWhetherShipByStorePickup());
        await this.getCupidPublic().upsertCupidPublic(this.getComponent(), { whetherShipByStorePickup: this.getEnableOfWhetherShipByStorePickup() });
    };
    submitEnableOfCOD = async () => {
        this.getCupidPublic().setEnableOfCOD(this.getEnableOfEnableOfCod());
        await this.getCupidPublic().upsertCupidPublic(this.getComponent(), { enableOfCOD: this.getEnableOfEnableOfCod() });
    };
    submitWhetherPickupByBuyerSelf = async () => {
        this.getCupidPublic().setWhetherPickupByBuyerSelf(this.getEnableOfWhetherPickupByBuyerSelf());
        await this.getCupidPublic().upsertCupidPublic(this.getComponent(), { whetherPickupByBuyerSelf: this.getEnableOfWhetherPickupByBuyerSelf() });
    };
    /** pay secrets */
    submitLinePaySerials = async ([channelId, channelSecret]) => {
        if (!this.isValidLinePayConfig(channelId, channelSecret)) return this.getComponent().showErrorSnackMessage(`LINE PAY支付(格式錯誤)`);
        this.getCupidSecret().setLinepaySet(channelId, channelSecret);
        this.getCupidPublic().setHasLinePay(true);
        await this.getCupidSecret().upsertCupidSecret(this.getComponent(), { linepaySet: [channelId, channelSecret] });
        await this.getCupidPublic().upsertCupidPublic(this.getComponent(), { hasLinePay: true });
    };

    submitECPaySerials = async ([merchantID, hashKey, hashIV]) => {
        if (!this.isValidECPayConfig(merchantID, hashKey, hashIV)) return this.getComponent().showErrorSnackMessage(`綠界支付(格式錯誤)`);
        this.getCupidSecret().setECPaySet(merchantID, hashKey, hashIV);
        this.getCupidPublic().setHasECPay(true);
        await this.getCupidSecret().upsertCupidSecret(this.getComponent(), { ECPaySet: [merchantID, hashKey, hashIV] });
        await this.getCupidPublic().upsertCupidPublic(this.getComponent(), { hasECPay: true });
    };

    submitHrefOfDirectPay = async ([url]) => {
        if (!Util.isHttpsURL(url)) return this.getComponent().showErrorSnackMessage(`立牌連結格式錯誤 '${url}'`);
        this.getCupidPublic().setHrefOfDirectPay(url);
        await this.getCupidPublic().upsertCupidPublic(this.getComponent(), { hrefOfDirectPay: url });
    };

    submitNameOfDirectPay = async (name) => {
        if (!this.isValidText(name)) return this.getComponent().showErrorSnackMessage(`立牌連結的店舖名格式錯誤`);
        this.getCupidPublic().setNameOfDirectPay(name);
        await this.getCupidPublic().upsertCupidPublic(this.getComponent(), { nameOfDirectPay: name });
    };

    submitBrandName = async (name) => {
        if (_.isEmpty(name)) return this.getComponent().showErrorSnackMessage(`網頁抬頭 格式錯誤`);
        await this.apiOfInfo.upsertGlobalPerspective(this.getComponent(), { nameOfBrand: name });
        UserInfo.setNameOfBrand(name);
    };

    submitCompany = async (company) => {
        if (!this.isValidText(company)) return this.getComponent().showErrorSnackMessage(`公司登記名稱格式錯誤`);
        await this.apiOfInfo.upsertGlobalPerspective(this.getComponent(), { company });
        UserInfo.setGlobalPerspectiveAttr({ company });
    };

    submitYTQ = async (ytO) => {
        if (!this.isValidText(ytO)) return this.getComponent().showErrorSnackMessage(`YouTube 頻道/帳號格式錯誤`);
        await this.apiOfInfo.upsertGlobalPerspective(this.getComponent(), { ytO });
        UserInfo.setGlobalPerspectiveAttr({ ytO });
    };

    submitFBO = async (fbO) => {
        if (!this.isValidText(fbO)) return this.getComponent().showErrorSnackMessage(`Facebook 帳號/專頁格式錯誤`);
        await this.apiOfInfo.upsertGlobalPerspective(this.getComponent(), { fbO });
        UserInfo.setGlobalPerspectiveAttr({ fbO });
    };

    submitIGO = async (igO) => {
        if (!this.isValidText(igO)) return this.getComponent().showErrorSnackMessage(`Instagram 帳號格式錯誤`);
        await this.apiOfInfo.upsertGlobalPerspective(this.getComponent(), { igO });
        UserInfo.setGlobalPerspectiveAttr({ igO });
    };

    submitTikTokO = async (tiktokO) => {
        if (!this.isValidText(tiktokO)) return this.getComponent().showErrorSnackMessage(`TikTok 帳號格式錯誤`);
        await this.apiOfInfo.upsertGlobalPerspective(this.getComponent(), { tiktokO });
        UserInfo.setGlobalPerspectiveAttr({ tiktokO });
    };

    submitUnifiedB = async (unifiedB) => {
        if (!this.isValidText(unifiedB)) return this.getComponent().showErrorSnackMessage(`統一編號 格式錯誤`);
        await this.apiOfInfo.upsertGlobalPerspective(this.getComponent(), { unifiedB });
        UserInfo.setGlobalPerspectiveAttr({ unifiedB });
    };

    submitPhoneO = async (phoneO) => {
        if (!this.isValidText(phoneO)) return this.getComponent().showErrorSnackMessage(`工作用手機電話 格式錯誤`);
        await this.apiOfInfo.upsertGlobalPerspective(this.getComponent(), { phoneO });
        UserInfo.setGlobalPerspectiveAttr({ phoneO });
    };

    submitLineO = async (lineO) => {
        if (!this.isValidText(lineO)) return this.getComponent().showErrorSnackMessage(`官方Line 格式錯誤`);
        await this.apiOfInfo.upsertGlobalPerspective(this.getComponent(), { lineO });
        UserInfo.setGlobalPerspectiveAttr({ lineO });
    };

    isValidText = () => {
        return true;
    };

    submitAddressO = async (addressO) => {
        if (!this.isValidText(addressO)) return this.getComponent().showErrorSnackMessage(`公司地址 格式錯誤`);
        await this.apiOfInfo.upsertGlobalPerspective(this.getComponent(), { addressO });
        UserInfo.setGlobalPerspectiveAttr({ addressO });
    };

    submitEmailO = async (emailO) => {
        if (!this.isValidText(emailO)) return this.getComponent().showErrorSnackMessage(`公司Emal 格式錯誤`);
        await this.apiOfInfo.upsertGlobalPerspective(this.getComponent(), { emailO });
        UserInfo.setGlobalPerspectiveAttr({ emailO });
    };

    isPositiveNum = (value) => {
        return _.isNumber(value) && value >= 0;
    };

    submitMaximumOfUniqueItems = async (count) => {
        if (this.isPositiveNum(count)) return this.getComponent().showErrorSnackMessage(`購物車數量限制 格式錯誤`);
        await this.apiOfInfo.upsertGlobalPerspective(this.getComponent(), { maximumOfUniqueItems: count });
        UserInfo.setGlobalPerspectiveAttr({ maximumOfUniqueItems: count });
    };

    submitTTLOfPayment = async (minute) => {
        if (this.isPositiveNum(minute)) return this.getComponent().showErrorSnackMessage(`付款緩衝 格式錯誤`);
        await this.apiOfInfo.upsertGlobalPerspective(this.getComponent(), { ttlOfPayment: minute });
        UserInfo.setGlobalPerspectiveAttr({ ttlOfPayment: minute });
    };

    submitTTLOfAnonymous = async (minute) => {
        if (this.isPositiveNum(minute)) return this.getComponent().showErrorSnackMessage(`付款緩衝（陌生）格式錯誤`);
        await this.apiOfInfo.upsertGlobalPerspective(this.getComponent(), { ttlOfAnonymous: minute });
        UserInfo.setGlobalPerspectiveAttr({ ttlOfAnonymous: minute });
    };

    submitCategoryRules = async (param) => {
        const result = Util.generateLabelValuePairsWithOrigin(this.categoryOfCurrent, param);
        await this.apiOfTab.submitSelectBounds(
            this.getComponent(),
            result.map((each) => ({ ...each, id: _.toString(each.value) }))
        );
    };

    /** fetch */
    fetchDefaultTextsOfCategory = async () => {
        this.categoryOfCurrent = (await this.apiOfTab.fetchSelectBounds(this.getComponent())) ?? [];
        return this.categoryOfCurrent.map((each) => ({ content: each.label }));
    };
    fetchDefaultTextOfLinePay = async () => this.getNormalizeStmt(["CHANNEL ID", "SECRET  ID"], this.getCupidSecret().getLinepaySet());
    fetchDefaultTextOfECPay = async () => this.getNormalizeStmt(["Merchant ID", "Hash Key", "Hash IV"], this.getCupidSecret().getECPaySet());
    fetchDefaultHrefOfDirectPay = async () => this.getNormalizeStmt(["付費連結"], [this.getCupidPublic().getHrefOfDirectPay()]);

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
