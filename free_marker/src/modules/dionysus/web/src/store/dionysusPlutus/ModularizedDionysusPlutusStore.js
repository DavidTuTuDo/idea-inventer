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
        this.setCitys(...Config.cities);
        this.validateDistrictByCity();
        const info = Cookie.getInfoOfSelectedTransport();

        this.setFeeOfTransport(_.toNumber(info.feeOfTransport));
        this.setProcedureOfPayment(info.stringOfTransport);
        this.setPrice(UserInfoRef.getTotalPriceOfCartie());
        if (UserInfoRef.isLoginWithSucceed()) {
            this.setEmail(UserInfoRef.getEmailOfCurrentUser());
            this.setPhone(UserInfoRef.getPhoneOfCurrentUser());
            this.setName(UserInfoRef.getDisplayNameOfUser());
        }

        this.getComponent().scrollToTop();
        const itemsOfCarie = UserInfoRef.getCheckedCartieItem();
        this.setNeedSelfPickingChoice(false);

        // 使用 Array.prototype.some() 來檢查陣列中是否存在符合條件的項目。
        const isHomeTeachingLesson = itemsOfCarie.some((item) => {
            const isLesson = item.isTaskJob;
            const isHomeTeaching = item.isHomeTeaching;

            // 條件：必須是課程 (isLesson) 且必須是在家教學 (isHomeTeaching)
            return isLesson && isHomeTeaching;
        });

        if (isHomeTeachingLesson) this.setNeedAddress(true);
    }

    validateDistrictByCity = () => {
        const districts = Config.getDistrictsByCity(this.getSelectedCity());
        this.setDistricts(...districts);
        if (_.size(districts) > 0) this.setSelectedDistrict(districts[0].value);
    };

    whetherPickupByMySelfValidate = async () => {
        const checked = this.getWhetherPickupByMySelf();
        const info = Cookie.getInfoOfSelectedTransport();
        this.setFeeOfTransport(checked ? 0 : _.toNumber(info.feeOfTransport));
    };

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
