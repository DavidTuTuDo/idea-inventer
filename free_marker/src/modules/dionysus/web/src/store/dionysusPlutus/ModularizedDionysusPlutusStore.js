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

        // 新增追蹤變數，用於防止後續邏輯覆寫
        // 追蹤地址是否曾經被設定為 true
        let hasAddressBeenSetToTrue = false;
        // 追蹤自取選項是否曾經被設定為 false
        let hasSelfPickingChoiceBeenSetToFalse = false;

        // 迴圈遍歷所有購物車項目
        for (const item of itemsOfCarie) {
            const isLesson = item.isTaskJob;
            const isProduct = !item.isTaskJob;

            // --- 處理 setNeedAddress 邏輯 ---
            // 規則：如果地址需求曾經被設為 true，就不能再改回 false。

            // 如果目前項目是產品，或是在家教學的課程，就需要地址
            if (isProduct || (isLesson && item.isHomeTeaching)) {
                this.setNeedAddress(true);
                hasAddressBeenSetToTrue = true;
            }
            // 否則，只有在地址需求**尚未**被設為 true 時，才可能將其設為 false
            else if (!hasAddressBeenSetToTrue) {
                this.setNeedAddress(false);
            }

            // --- 處理 setNeedSelfPickingChoice 邏輯 ---
            // 規則：如果自取選項曾經被設為 false，就不能再改為 true。

            // 如果目前項目是產品，且不允許自取，就將自取選項設為 false
            if (isProduct && !item.allowSelfPickUp) {
                this.setNeedSelfPickingChoice(false);
                hasSelfPickingChoiceBeenSetToFalse = true;
            }
            // 否則，只有在自取選項**尚未**被設為 false 時，才可能將其設為 true
            else if (!hasSelfPickingChoiceBeenSetToFalse && isProduct && item.allowSelfPickUp) {
                this.setNeedSelfPickingChoice(true);
            }
        }
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
