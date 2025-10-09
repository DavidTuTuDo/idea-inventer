const edit = true;

import { utiller as Util, exceptioner as ERROR, pooller as InfinitePool } from "utiller";
import _ from "lodash";
import Cookie from "../../cookie";
import UserInfoRef from "../../base/BaseUserInfo";
import { makeAutoObservable, makeObservable, action, observable, comparer, computed, autorun, runInAction, toJS } from "mobx";
import BaseDionysusCartieStore from "./BaseDionysusCartieStore";
import VariantApi from "../dionysusBoozeVariant";
import ErosPublic from "../dionysusErosPublic";

class ModularizedDionysusCartieStore extends BaseDionysusCartieStore {
    @observable
    erosOfPublic = {};

    constructor(props) {
        super(props);
        makeObservable(this);
        this.api = new VariantApi();
        this.apiOfErosPublic = new ErosPublic();
        UserInfoRef.setGotoCartieDirect(false);
    }

    @action
    modifyErosInfoOfAuthor = async (idOfAuthor, refresh) => {
        const exist = this.erosOfPublic && this.erosOfPublic.numOfWorker > 0;
        if (!refresh && exist) return this.erosOfPublic;

        this.erosOfPublic = await this.apiOfErosPublic.fetchPublic(this.getComponent(), idOfAuthor);
        Util.appendInfo(this.erosOfPublic);
        return this.erosOfPublic;
    };

    getErosOfPublic = () => {
        return this.erosOfPublic;
    };

    onInitialFetchCompleted = async (collection) => {
        const self = this;
        await super.onInitialFetchCompleted(collection);
        Util.syncDelay(1).then(async () => {
            console.log(`咻咻咻`);
            const cartie = self.getBriefOfHead();
            if (!_.isEmpty(cartie?.idOfAuthor)) await self.modifyErosInfoOfAuthor(cartie.idOfAuthor);
        });
    };

    isCheckedVariantValid = async () => {
        /** 檢查商品是否皆為同一人 */
        const variantsOfSelected = _.filter(this.getBriefs(), (brief) => brief.getSure());
        if (_.size(variantsOfSelected) < 1) throw new Error(`沒有選取的商品`);

        if (!Util.areAllValuesTheSameOnKeys(variantsOfSelected, "idOfAuthor")) throw new Error(`勾選的商品來自不同賣家，無法進行交易`);
        await this.modifyErosInfoOfAuthor(variantsOfSelected[0].idOfAuthor, true);

        /** 未登入檢查是否超過金額 */
        if (UserInfoRef.anonymous() && this.getErosOfPublic().amountOfAllowAnonymousBuy < this.getPriceOfTotal())
            throw new Error(`「未登入購物，金額限制」不得超過＄${this.getErosOfPublic().amountOfAllowAnonymousBuy} 元`);

        /** 登入檢查是否超過金額 */
        if (this.getErosOfPublic().amountOfMaximumBuy < this.getPriceOfTotal()) throw new Error(`「購物金額限制」不得超過 ${this.getErosOfPublic().amountOfMaximumBuy} 元`);
    };

    validateCountOfOrder = (brief, increase = true, deleted = false) => {
        if (deleted) {
            /** 刪除購物車其中一個選項 */
            UserInfoRef.deleteItemFromCart(brief.idOfCookieUsage);
            brief.remove();
            return;
        }

        const current = _.toNumber(brief.getCountOfSubmit());
        let countOfLatest = 0;
        if (increase) {
            const result = _.sum([current, 1]);
            /**
             * 要判斷當前數量有沒有超過 銷售數量
             * this.setCountOfSubmit(current > brief.Quantity() ? current : result) */
            countOfLatest = result <= brief.getQuantity() ? result : brief.getQuantity();
        } else {
            const result = _.sum([current, -1]);
            countOfLatest = current < 2 ? current : result;
        }
        brief.setCountOfSubmit(countOfLatest);
        UserInfoRef.updateItemToCart({ key: brief.idOfCookieUsage, quantity: countOfLatest, checked: brief.getSure() });
    };

    async fetch(view = this.getComponent()) {
        function pushCurrentBrief(variant, cartieOfCookie) {
            const idOfCookieUsage = cartieOfCookie.idOfCookieUsage;
            const currentCountOfMaximum = variant.quantity;
            const countOfSubmit = cartieOfCookie.quantity <= currentCountOfMaximum ? cartieOfCookie.quantity : currentCountOfMaximum;

            self.pushBrief({
                name: cartieOfCookie.nameOfBooze,
                idOfCookieUsage,
                nameOfVariant: variant.content,
                photo: variant.photo,
                price: variant.price,
                priceB4Discount: variant.priceB4Discount,
                countOfSubmit,
                quantity: currentCountOfMaximum,
                idOfAuthor: variant.idOfAuthor,
                sure: currentCountOfMaximum > 0
            });
        }

        const self = this;
        this.cleanBriefs();
        const info = Cookie.getInfoOfCartie();
        if (_.isObject(info)) {
            const carties = _.values(info);
            const variants = await this.api.fetchVariantBatchItems(
                this.getComponent(),
                ...carties.map((cartie) => {
                    return { pid: cartie.idOfBooze, id: cartie.idOfVariant };
                })
            );
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
        const percentage = this.getErosOfPublic()?.percentageOfDiscount ?? 1;
        const discount = _.multiply(this.getPriceWithoutDiscount(), 1 - Util.toPercentageDecimal(percentage));
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
        for (const brief of this.getBriefs()) UserInfoRef.updateItemToCart({ key: brief.getIdOfCookieUsage(), quantity: brief.getCountOfSubmit(), checked: brief.getSure() });
        UserInfoRef.setTotalPriceOfCartie(this.getPriceOfTotal());
        Util.appendInfo(UserInfoRef.getArrayOfCartieItem());
    };

    /** 如果全選打勾，全部打勾 -> 如果全選消除，全部消除*/
    updateBriefByWholeStatus() {
        const checked = this.getWhole();
        _.each(this.getBriefs(), (brief) => brief.setSure(brief.quantity > 0 ? checked : false));
    }

    updateWholeStatusByBrief() {
        const unChecked = _.find(this.getBriefs(), (brief) => !brief.getSure());
        this.setWhole(!unChecked);
    }
}

export default ModularizedDionysusCartieStore;
