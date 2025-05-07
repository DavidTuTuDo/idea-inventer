const edit = true;

import { utiller as Util, exceptioner as ERROR, pooller as InfinitePool } from "utiller";
import _ from "lodash";
import Cookie from "../../cookie";
import UserInfoRef from "../../base/BaseUserInfo";
import { makeAutoObservable, makeObservable, action, observable, comparer, computed, autorun, runInAction, toJS } from "mobx";
import BaseDionysusCartieStore from "./BaseDionysusCartieStore";
import BoozeApi from "../dionysusBooze";
import VariantApi from "../dionysusBoozeVariant";

class ModularizedDionysusCartieStore extends BaseDionysusCartieStore {
    constructor(props) {
        super(props);
        this.api = new VariantApi();
        UserInfoRef.setGotoCartieDirect(false);
        /** cool man */
    }

    validateCountOfOrder(brief, increase = true, deleted = false) {
        if (deleted) {
            /** 刪除購物車其中一個選項 */
            brief.remove();
            UserInfoRef.deleteItemFromCart(brief.idOfCookieUsage);
            return;
        }

        const current = _.toNumber(brief.getCountOfSubmit());
        let countOfLatest = 0;
        if (increase) {
            const result = _.sum([current, 1]);
            /**
             * 要判斷當前數量有沒有超過 銷售數量
             * this.setCountOfSubmit(current > brief.getCount() ? current : result) */
            countOfLatest = result <= brief.getCount() ? result : brief.getCount();
        } else {
            const result = _.sum([current, -1]);
            countOfLatest = current < 2 ? current : result;
        }
        brief.setCountOfSubmit(countOfLatest);
        UserInfoRef.updateItemToCart({ key: brief.idOfCookieUsage, count: countOfLatest, checked: brief.getSure() });
    }

    async fetch(view = this.getComponent()) {
        function pushCurrentBrief(variant, cartieOfCookie, option, choice = {}) {
            const idOfCookieUsage = cartieOfCookie.idOfCookieUsage;
            const currentCountOfMaximum = variant.quantity;
            const countOfSubmit = cartieOfCookie.count <= currentCountOfMaximum ? cartieOfCookie.count : currentCountOfMaximum;

            self.pushBrief({
                name: cartieOfCookie.nameOfBooze,
                idOfCookieUsage,
                nameOfVariant: variant.content,
                photo: variant.photo,
                price: variant.price,
                priceB4Discount: variant.priceB4Discount,
                countOfSubmit,
                count: currentCountOfMaximum
            });
        }

        const self = this;
        this.cleanBriefs();
        const info = Cookie.getInfoOfCartie();
        if (_.isObject(info)) {
            const variants = [];
            const carties = _.values(info);
            for (const { idOfVariant, idOfBooze } of carties) variants.push(await this.api.fetchVariantItem(this.getComponent(), idOfVariant, idOfBooze)); //todo:必須改成batch fetch

            for (const cartieOfCookie of carties)
                pushCurrentBrief(
                    _.find(variants, (v) => _.isEqual(v.id, cartieOfCookie.idOfVariant)),
                    cartieOfCookie
                );
        }
    }

    @computed
    get getComputedPriceWithoutDiscount() {
        const feesOfEachBrief = _.filter(this.getBriefs(), (brief) => brief.getSure()).map((brief) => _.multiply(brief.getPrice(), brief.getCountOfSubmit()));
        const result = _.sum(feesOfEachBrief);
        this.setPriceWithoutDiscount(result);
        return result;
    }

    @computed
    get getComputedPriceOfDiscount() {
        const result = 0;
        this.setPriceOfDiscount(result);
        return result;
    }

    @computed
    get getComputedDiscountOfMember() {
        const discount = _.multiply(this.getPriceWithoutDiscount(), 0.03);
        const computed = _.subtract(0, discount);
        const result = computed < 0 ? _.round(computed) : 0;
        this.setDiscountOfMember(result);
        return result;
    }

    @computed
    get getComputedPriceOfTotal() {
        const sum = _.sum([this.getPriceWithoutDiscount(), this.getPriceOfDiscount(), this.getDiscountOfMember()]);
        this.setPriceOfTotal(sum);
        return sum;
    }

    /** 1.更新cookie裡面的cartie，checked(送出訂單時，最後選擇的)*/
    updateInfosOfCartieCookie = () => {
        for (const brief of this.getBriefs()) UserInfoRef.updateItemToCart({ key: brief.getIdOfCookieUsage(), count: brief.getCountOfSubmit(), checked: brief.getSure() });
        UserInfoRef.setTotalPriceOfCartie(this.getPriceOfTotal());
        Util.appendInfo(UserInfoRef.getArrayOfCartieItem());
    };

    /** 如果全選打勾，全部打勾 -> 如果全選消除，全部消除*/
    updateBriefByWholeStatus() {
        const checked = this.getWhole();
        _.each(this.getBriefs(), (brief) => brief.setSure(checked));
    }

    updateWholeStatusByBrief() {
        const unChecked = _.find(this.getBriefs(), (brief) => !brief.getSure());
        this.setWhole(!unChecked);
    }
}

export default ModularizedDionysusCartieStore;
