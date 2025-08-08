const edit = true;

import { utiller as Util, exceptioner as ERROR, pooller as InfinitePool } from "utiller";
import _ from "lodash";
import Config from "../../config";
import Cookie from "../../cookie";
import UserInfoRef from "../../base/BaseUserInfo";
import { makeAutoObservable, makeObservable, action, observable, comparer, computed, autorun, runInAction, toJS } from "mobx";
import BaseDionysusPlutusStore from "./BaseDionysusPlutusStore";
import Booze from "../dionysusBooze";

class ModularizedDionysusPlutusStore extends BaseDionysusPlutusStore {
    constructor(props) {
        super(props);
        this.api = new Booze();
    }

    async onInitialFetchCompleted(collection) {
        await super.onInitialFetchCompleted(collection);
        this.validateDistrictByCity();
        const info = Cookie.getInfoOfSelectedTransport();
        this.setFeeOfTransport(_.toNumber(info.feeOfTransport));
        this.setProcedureOfPayment(info.stringOfTransport);
        this.setPrice(UserInfoRef.getTotalPriceOfCartie());
        this.getComponent().scrollToTop();
    }

    validateDistrictByCity() {
        const districts = Config.getDistrictsByCity(this.getSelectedCity());
        this.setDistricts(...districts);
        if (_.size(districts) > 0) this.setSelectedDistrict(districts[0].value);
    }

    @computed
    get getComputedPriceOfTotal() {
        return _.sum([this.getPrice(), this.getFeeOfTransport()]);
    }

    @computed
    get getComputedFeeOfPayment() {
        return _.sum([this.getPrice(), this.getFeeOfTransport()]);
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
