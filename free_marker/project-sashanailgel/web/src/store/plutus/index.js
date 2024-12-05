const edit = true;
import BasePlutusStore from "./BasePlutusStore";
import {utiller as Util, exceptioner as ERROR, pooller as InfinitePool} from "utiller";
import _ from "lodash";
import {Application} from "../../";
import Config from "../../config";
import {computed} from "mobx";
import Cookie from '../../cookie'
import UserInfoRef from "../../base/BaseUserInfo";

class PlutusStore extends BasePlutusStore {
    /** -------------------- fields -------------------- **/

    /** -------------------- functions -------------------- **/

    constructor(props) {
        super(props);
    }

    async onInitialFetchCompleted(collection) {
        super.onInitialFetchCompleted(collection);
        this.validateDistrictByCity();
        const info = Cookie.getInfoOfSelectedTransport();
        this.setFeeOfTransport(_.toNumber(info.feeOfTransport));
        this.setProcedureOfPayment(info.stringOfTransport);
        this.setPrice(UserInfoRef.getTotalPriceOfCartie());
        this.getComponent().scrollToTop();
    }

    validateDistrictByCity() {
        const districts = Config.getDistrictsByCity(this.getSelectedCity())
        this.setDistrict(...districts);
        if (_.size(districts) > 0)
            this.setSelectedDistrict(districts[0].value);
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
        return [this.getSelectedLabelByValue(this.getCity(), this.getSelectedCity()), this.getSelectedLabelByValue(this.getDistrict(), this.getSelectedDistrict()), this.getAddress()].join('');
    }

    getSelectedLabelByValue(array, value) {
        const item = _.find(array, (each) => _.isEqual(_.toNumber(each.getValue()), _.toNumber(value)));
        return item ? item.label : '';
    }

    /** -------------------- async api -------------------- **/
}

export default PlutusStore;
