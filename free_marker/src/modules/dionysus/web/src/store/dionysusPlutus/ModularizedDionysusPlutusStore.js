const edit = true;

import { utiller as Util } from "utiller";
import _ from "lodash";
import Config from "../../config";
import UserInfoRef from "../../base/BaseUserInfo";
import { computed } from "mobx";
import BaseDionysusPlutusStore from "./BaseDionysusPlutusStore";
import Variant from "../dionysusBoozeVariant";
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
        let eros = {};
        this.setCitys(...Config.cities);
        this.validateDistrictByCity();
        const itemsOfChecked = this.getItemsOfChecked();
        const idOfAuthor = itemsOfChecked?.[0]?.idOfAuthor;

        if (idOfAuthor) {
            await this.App().getDionysusCartieStore().modifyErosInfoOfAuthor(idOfAuthor);
            eros = this.App().getDionysusCartieStore().getErosOfPublic();
            Util.appendInfo(`hermes拿到了 eros => `, eros);
        } else return this.getComponent().showErrorSnackMessage(`發生異常，無法獲得賣家資訊`);

        this.setBriefs(...itemsOfChecked.map((each) => this.normalizeBriefFromOrderItem(each)));
        this.setProcedureOfTransport(Config.LabelOfTransportMethod(this.getTypeOfTransport()));
        this.setProcedureOfPayment(Config.LabelOfTransactionMethod(this.getTypeOfTransaction()));
        this.setPrice(_.sum(itemsOfChecked.map((each) => _.multiply(each.countOfSubmit, each.price))));
        this.setDiscount(_.subtract(0, Util.getFeeOfDiscount(this.getPrice(), UserInfoRef.getGlobalPerspectiveAttr("percentageOfDiscount"))));
        if (UserInfoRef.isLoginWithSucceed()) {
            this.setEmail(UserInfoRef.getEmailOfCurrentUser());
            this.setPhone(UserInfoRef.getPhoneOfCurrentUser());
            this.setName(UserInfoRef.getDisplayNameOfUser());
        }

        this.getComponent().scrollToTop();
        this.setNeedSelfPickingChoice(false);

        const isHomeTeachingLesson = itemsOfChecked.some((item) => item.isHomeTeaching); //some() 來檢查陣列中是否存在符合條件的項目。// 在家教學 (isHomeTeaching:學生提供地址)
        const requireAddressAsDestination = Util.isOrEquals(this.getTypeOfTransport(), Config.TransportMethod.Freight, Config.TransportMethod.RapidOnDay);
        if (isHomeTeachingLesson || (requireAddressAsDestination && this.getHasPhysical())) this.setNeedAddress(true);
        this.setNeedCVS(Util.isOrEquals(this.getTypeOfTransport(), Config.TransportMethod.Store711, Config.TransportMethod.StoreFamily));
    }

    normalizeBriefFromOrderItem = (item) => {
        return {
            imageOfProductPhoto: item.photo,
            nameOfProduct: item.name,
            specificOfProduct: item.nameOfVariant,
            quantity: `x${item.countOfSubmit}`,
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
        this.setFeeOfTransport(checked ? 0 : _.toNumber(this.getFeeOfTransport()));
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
