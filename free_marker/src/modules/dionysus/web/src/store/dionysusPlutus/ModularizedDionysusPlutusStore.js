const edit = true;

import { utiller as Util, exceptioner as ERROR, pooller as InfinitePool } from "utiller";
import _ from "lodash";
import Config from "../../config";
import Cookie from "../../cookie";
import UserInfoRef from "../../base/BaseUserInfo";
import { makeAutoObservable, makeObservable, action, observable, comparer, computed, autorun, runInAction, toJS } from "mobx";
import BaseDionysusPlutusStore from "./BaseDionysusPlutusStore";
import Variant from "../dionysusBoozeVariant";
import { Application } from "../../index";
import SelectorOfCvs from "../epaySelectorOfCvs";

class ModularizedDionysusPlutusStore extends BaseDionysusPlutusStore {
    constructor(props) {
        super(props);
        this.api = new Variant();
        this.apiOfCVS = new SelectorOfCvs();
    }

    async onInitialCompleted(props) {
        this.unsubscribeCVS?.();
    }

    waitResultOfCVS = async (tempVar) => {
        this.unsubscribeCVS = this.apiOfCVS.listenSelectorOfCvsItem(tempVar, this.handleCVSonReceived);
        return this.unsubscribeCVS;
    };

    handleCVSonReceived = async (status, data, error) => {
        if (data?.storeid) {
            this.setCvs(data.storeid);
            this.setLabelOfCvsSticky(data.storename);
            this.setHelperTextOfCvs(`${data.storeaddress}`);
            this.unsubscribeCVS();
        }
    };

    async onInitialFetchCompleted(collection) {
        await super.onInitialFetchCompleted(collection);
        this.setCitys(...Config.cities);
        this.validateDistrictByCity();
        const infoOfSelectedTrans = Cookie.getInfoOfSelectedTrans();
        const itemsOfChecked = UserInfoRef.getCheckedCartieItems();

        let eros = {};
        const idOfAuthor = UserInfoRef.getAuthorOfHeadItemOfCartie();

        if (idOfAuthor) {
            await Application.getDionysusCartieStore().modifyErosInfoOfAuthor(idOfAuthor);
            eros = Application.getDionysusCartieStore().getErosOfPublic();
            Util.appendInfo(`hermes拿到了 eros => `, eros);
        } else return this.getComponent().showErrorSnackMessage(`發生異常，無法獲得賣家資訊`);

        const variants = await this.api.fetchVariantBatchItems(
            this.getComponent(),
            ...itemsOfChecked.map((cartie) => {
                return { pid: cartie.idOfBooze, id: cartie.idOfVariant };
            })
        );
        const variantsOfCheckedItem = variants.map((each) => ({ ...each, quantityOfBought: _.find(itemsOfChecked, (item) => _.isEqual(item.idOfVariant, each.id))?.quantity }));

        this.setBriefs(...variantsOfCheckedItem.map((each) => this.normalizeBriefFromOrderItem(each)));
        this.setFeeOfTransport(_.toNumber(infoOfSelectedTrans.feeOfTransport));
        this.setProcedureOfTransport(infoOfSelectedTrans.stringOfTransport);
        this.setProcedureOfPayment(infoOfSelectedTrans.stringOfTransaction);

        this.setPrice(_.sum(variantsOfCheckedItem.map((each) => _.multiply(each.quantityOfBought, each.price))));
        const discount = Util.getNumberOfMultiplyCeil(this.getPrice(), 1 - Util.toPercentageDecimal(eros?.percentageOfDiscount ?? 1));
        this.setDiscount(_.subtract(0, discount));
        if (UserInfoRef.isLoginWithSucceed()) {
            this.setEmail(UserInfoRef.getEmailOfCurrentUser());
            this.setPhone(UserInfoRef.getPhoneOfCurrentUser());
            this.setName(UserInfoRef.getDisplayNameOfUser());
        }

        this.getComponent().scrollToTop();
        this.setNeedSelfPickingChoice(false);

        const isHomeTeachingLesson = variantsOfCheckedItem.some((item) => item.isHomeTeaching); //some() 來檢查陣列中是否存在符合條件的項目。// 在家教學 (isHomeTeaching:學生提供地址)
        const useAddressAsDestin = Util.isOrEquals(infoOfSelectedTrans.typeOfTransport, Config.TransportMethod.Freight, Config.TransportMethod.RapidOnDay);
        const containsPhysical = UserInfoRef.containsPhysicalGoodOfCheckedItem();
        if (isHomeTeachingLesson || (useAddressAsDestin && containsPhysical)) this.setNeedAddress(true);

        this.setNeedCVS(Util.isOrEquals(infoOfSelectedTrans.typeOfTransport, Config.TransportMethod.Store711, Config.TransportMethod.StoreFamily));
    }

    normalizeBriefFromOrderItem = (item) => {
        return {
            imageOfProductPhoto: item.photo,
            nameOfProduct: item.nameOfBooze,
            specificOfProduct: item.content,
            quantity: `x${item.quantityOfBought}`,
            price: `$${item.price}`
        };
    };

    validateDistrictByCity = () => {
        const districts = Config.getDistrictsByCity(this.getSelectedCity());
        this.setDistricts(...districts);
        if (_.size(districts) > 0) this.setSelectedDistrict(districts[0].value);
    };

    whetherPickupByMySelfValidate = async () => {
        const checked = this.getWhetherPickupByMySelf();
        const info = Cookie.getInfoOfSelectedTrans();
        this.setFeeOfTransport(checked ? 0 : _.toNumber(info.feeOfTransport));
    };

    @computed
    get getComputedPriceOfTotal() {
        const total = _.sum([this.getPrice(), this.getDiscount(), this.getFeeOfTransport()]);
        this.setPriceOfTotal(total);
        return total;
    }

    @computed
    get getComputedFeeOfPayment() {
        const total = _.sum([this.getPrice(), this.getDiscount(), this.getFeeOfTransport()]);
        this.setFeeOfPayment(total);
        return total;
    }

    getPreciselyAddress = () => {
        return [
            this.getSelectedLabelByValue(this.getCitys(), this.getSelectedCity()),
            this.getSelectedLabelByValue(this.getDistricts(), this.getSelectedDistrict()),
            this.getAddress()
        ].join("");
    };

    getSelectedLabelByValue(array, value) {
        const item = _.find(array, (each) => _.isEqual(_.toNumber(each.getValue()), _.toNumber(value)));
        return item ? item.label : "";
    }
}

export default ModularizedDionysusPlutusStore;
