const edit = true;

import { utiller as Util, exceptioner as ERROR, pooller as InfinitePool } from "utiller";
import { each, filter, find, multiply, size, subtract, sum, values } from 'lodash-es';
import Cookie from "../../cookie";
import UserInfoRef from "../../base/BaseUserInfo";
import { makeAutoObservable, makeObservable, action, observable, comparer, computed, autorun, runInAction, toJS } from "mobx";
import BaseDionysusCartieStore from "./BaseDionysusCartieStore";
import VariantApi from "../dionysusBoozeVariant";
import ErosPublic from "../dionysusErosCupidPublic";
import Router from "../../router";

class ModularizedDionysusCartieStore extends BaseDionysusCartieStore {
    @observable
    erosOfPublic = {};

    constructor(props) {
        super(props);
        /** 在子class裡面使用observable(erosOfPublic)就必須makeObservable*/
        makeObservable(this);
        this.api = new VariantApi();
        this.apiOfErosPublic = new ErosPublic();
        UserInfoRef.setGotoCartieDirect(false);
    }

    @action
    modifyErosInfoOfAuthor = async (idOfAuthor = this.getBriefOfHead()?.idOfAuthor, refresh) => {
        const exist = this.erosOfPublic && this.erosOfPublic.numOfWorker > 0;
        if (!refresh && exist) return this.erosOfPublic;

        this.erosOfPublic = await this.apiOfErosPublic.fetchCupidPublic(this.getComponent(), idOfAuthor);
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
            const cartie = self.getBriefOfHead();
            if (!Util.isEmpty(cartie?.idOfAuthor)) await self.modifyErosInfoOfAuthor(cartie.idOfAuthor);
        });
        this.getComponent().scrollToTop();
        if (size(this.getBriefs()) === 0) {
            this.getComponent().showErrorSnackMessage(`購物車已經清空，將回到主畫面！`);
            await Util.syncDelay(2000);
            Router.gotoHomePage(this.getComponent());
        }
    };

    isCheckedVariantValid = async () => {
        /** 檢查商品是否皆為同一人 */
        const variantsOfSelected = filter(this.getBriefs(), (brief) => brief.sure);
        if (size(variantsOfSelected) < 1) throw new Error(`沒有選取的商品`);

        if (!Util.areAllValuesTheSameOnKeys(variantsOfSelected, "idOfAuthor")) throw new Error(`勾選的商品來自不同賣家，無法進行交易`);
        await this.modifyErosInfoOfAuthor(variantsOfSelected?.[0]?.idOfAuthor, true);

        /** 未登入檢查是否超過金額 */
        const amountOfAllowAnonymousBuy = UserInfoRef.getGlobalPerspectiveAttr("amountOfAllowAnonymousBuy");
        if (UserInfoRef.anonymous() && amountOfAllowAnonymousBuy < this.getPriceOfTotal()) throw new Error(`「未登入購物，金額限制」不得超過＄${amountOfAllowAnonymousBuy} 元`);

        /** 登入檢查是否超過金額 */
        const amountOfMaximumBuy = UserInfoRef.getGlobalPerspectiveAttr("amountOfMaximumBuy");
        if (amountOfMaximumBuy < this.getPriceOfTotal()) throw new Error(`「購物金額限制」不得超過 ${amountOfMaximumBuy} 元`);

        const enableOfBoughtWithoutLoginIn = UserInfoRef.getGlobalPerspectiveAttr("enableOfBoughtWithoutLoginIn");
        if (!UserInfoRef.isLoginWithSucceed() && !enableOfBoughtWithoutLoginIn) throw new Error(`必須先完成「右上角」快速登入才能結帳`);

        this.updateInfosOfCartieCookie();
        return variantsOfSelected.map((v) => ({ ...v, countOfSubmit: v.getCountOfSubmit() }));
    };

    validateCountOfOrder = (brief, increase = true, deleted = false) => {
        if (deleted) {
            /** 刪除購物車其中一個選項 */
            UserInfoRef.deleteItemFromCart(brief.idOfCookieUsage);
            brief.remove();
            return;
        }

        const current = Util.toNumber(brief.getCountOfSubmit());
        let countOfLatest = 0;
        if (increase) {
            const result = sum([current, 1]);
            /**
             * 要判斷當前數量有沒有超過 銷售數量
             * this.setCountOfSubmit(current > brief.Quantity() ? current : result) */
            countOfLatest = result <= brief.getQuantity() ? result : brief.getQuantity();
        } else {
            const result = sum([current, -1]);
            countOfLatest = current < 2 ? current : result;
        }
        brief.setCountOfSubmit(countOfLatest);
        UserInfoRef.updateItemToCart({ key: brief.idOfCookieUsage, quantity: countOfLatest, checked: brief.getSure() });
    };

    async fetch(view = this.getComponent()) {
        function pushCurrentBrief(variant, cartieOfCookie) {
            const idOfCookieUsage = cartieOfCookie.idOfCookieUsage;
            const currentCountOfMaximum = variant.visibility ? variant.quantity : 0;
            const countOfSubmit = cartieOfCookie.quantity <= currentCountOfMaximum ? cartieOfCookie.quantity : currentCountOfMaximum;

            self.pushBrief({
                name: variant.nameOfBooze,
                idOfCookieUsage,
                idOfBooze: variant.idOfBooze,
                idOfVariant: variant.id,
                nameOfVariant: variant.content,
                photo: variant.photo,
                price: variant.price,
                priceB4Discount: variant.priceB4Discount,
                countOfSubmit,
                visibility: variant.visibility,
                quantity: currentCountOfMaximum,
                idOfAuthor: variant.idOfAuthor,
                isHomeTeaching: variant.isHomeTeaching,
                isTaskJob: variant.isTaskJob,
                sure: currentCountOfMaximum > 0
            });
        }

        const self = this;
        this.cleanBriefs();
        const info = Cookie.getInfoOfCartie();
        if (Util.isObject(info)) {
            const carties = values(info);
            const variants = await this.api.fetchVariantBatchItems(
                this.getComponent(),
                ...carties.map((cartie) => {
                    return { pid: cartie.idOfBooze, id: cartie.idOfVariant };
                })
            );
            for (const cartieOfCookie of carties)
                pushCurrentBrief(
                    find(variants, (v) => Util.isEqual(v.id, cartieOfCookie.idOfVariant)),
                    cartieOfCookie
                );
        }
    }

    @computed
    get getComputedPriceWithoutDiscount() {
        const feesOfEachBrief = filter(this.getBriefs(), (brief) => brief.getSure()).map((brief) => multiply(brief.getPrice(), brief.getCountOfSubmit()));
        const result = sum(feesOfEachBrief);
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
        const discount = Util.getFeeOfDiscount(this.getPriceWithoutDiscount(), UserInfoRef.getGlobalPerspectiveAttr("percentageOfDiscount"));
        const computed = subtract(0, discount);
        this.setDiscountOfMember(computed);
        return computed;
    }

    @computed
    get getComputedPriceOfTotal() {
        const sum = sum([this.getPriceWithoutDiscount(), this.getPriceOfDiscount(), this.getDiscountOfMember()]);
        this.setPriceOfTotal(sum);
        return sum;
    }

    /** 1.更新cookie裡面的cartie，checked(送出訂單時，最後選擇的)*/
    updateInfosOfCartieCookie = () => {
        for (const brief of this.getBriefs()) UserInfoRef.updateItemToCart({ key: brief.getIdOfCookieUsage(), quantity: brief.getCountOfSubmit(), checked: brief.sure });
        Util.appendInfo(`購物車裡的商品們：`, UserInfoRef.getArrayOfCartieItem());
    };

    /** 如果全選打勾，全部打勾 -> 如果全選消除，全部消除*/
    updateBriefByWholeStatus() {
        const checked = this.getWhole();
        each(this.getBriefs(), (brief) => brief.setSure(brief.quantity > 0 ? checked : false));
    }

    updateWholeStatusByBrief() {
        const unChecked = find(this.getBriefs(), (brief) => !brief.getSure());
        this.setWhole(!unChecked);
    }
}

export default ModularizedDionysusCartieStore;
