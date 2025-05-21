const edit = true;

import { utiller as Util, exceptioner as ERROR, pooller as InfinitePool } from "utiller";
import _ from "lodash";
import Config from "../../config";
import Cookie from "../../cookie";
import UserInfoRef from "../../base/BaseUserInfo";
import { makeAutoObservable, makeObservable, action, observable, comparer, computed, autorun, runInAction, toJS } from "mobx";
import BaseDionysusPlutusStore from "./BaseDionysusPlutusStore";
import Booze from "../dionysusBooze";
import Savior from "../dionysusPlutusSavior";
import Functions from "../../functions";

class ModularizedDionysusPlutusStore extends BaseDionysusPlutusStore {
    constructor(props) {
        super(props);
        this.api = new Booze();
        this.remote = new Savior();
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
        this.setDistrict(...districts);
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
            this.getSelectedLabelByValue(this.getCity(), this.getSelectedCity()),
            this.getSelectedLabelByValue(this.getDistrict(), this.getSelectedDistrict()),
            this.getAddress()
        ].join("");
    };

    getSelectedLabelByValue(array, value) {
        const item = _.find(array, (each) => _.isEqual(_.toNumber(each.getValue()), _.toNumber(value)));
        return item ? item.label : "";
    }

    async fetchContentOfCheckedCartie() {
        const carties = UserInfoRef.getCheckedCartieItem();
        const ids = carties.map((each) => each.idOfBooze);
        const boozes = await this.api.fetchBoozesOfLimitation(this.getComponent(), "in", "id", ...Util.getSliceArrayOfUnique(ids));
        const objectOfBoozes = Util.toObjectWithAttributeKey(boozes, "id");
        const stmts = [];
        for (const cartie of carties) {
            const booze = objectOfBoozes[cartie.idOfBooze];
            const optionOfSelected = _.find(booze.options, (option) => _.isEqual(option.value, cartie.idOfOption));
            const index = _.indexOf(carties, cartie) + 1;
            stmts.push(`${index}.\n商品：${booze.name}\n編號：${booze.serial}\n選項：${optionOfSelected.name}(${optionOfSelected.price}元) \n數量：${cartie.count} 個`);
        }
        return stmts.join("\n\n");
    }

    async submitSavior(view) {
        const result = await this.remote.submitSaviorItem(view, {
            name: this.getName(),
            email: this.getEmail(),
            phone: this.getPhone(),
            address: this.getPreciselyAddress(),
            remark: this.getRemark(),
            content: await this.fetchContentOfCheckedCartie(),
            price: UserInfoRef.getTotalPriceOfCartie(),
            valueOfPayment: UserInfoRef.getTypeOfTransport()
        });
        const idOfSavior = result.value.id;
        await Functions.httpOnCallSendEmailOfReceipt(view, { idOfSavior });
    }
}

export default ModularizedDionysusPlutusStore;
