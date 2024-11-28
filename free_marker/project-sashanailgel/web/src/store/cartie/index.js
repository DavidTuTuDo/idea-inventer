const edit = true;
import BaseCartieStore from "./BaseCartieStore";
import {utiller as Util, exceptioner as ERROR, pooller as InfinitePool} from "utiller";
import _ from "lodash";
import libpath from "path";
import Cookie from "../../cookie";
import BoozeApi from "../dionysusBooze"
import {computed} from "mobx";

class CartieStore extends BaseCartieStore {
    /** -------------------- fields -------------------- **/

    /** -------------------- functions -------------------- **/

    constructor(props) {
        super(props);
        this.api = new BoozeApi();
    }

    validateCountOfOrder(brief, increase = true) {
        const current = _.toNumber(brief.getCountOfSubmit());
        if (increase) {
            const result = _.sum([current, 1]);
            /**
             * 要判斷當前數量有沒有超過 銷售數量
             * this.setCountOfSubmit(current > brief.getCount() ? current : result) */
            brief.setCountOfSubmit(result <= brief.getCountOfMaximum() ? result : brief.getCountOfMaximum())
        } else {
            const result = _.sum([current, -1]);
            brief.setCountOfSubmit(current < 2 ? current : result)
        }
    }

    async fetch(view = this.getComponent()) {

        function pushCurrentBrief(booze, cartie, option, choice = {}) {
            const idOfCookieUsage = cartie.idOfCookieUsage;
            const hrefOfPhoto = Util.getSpecifyObjectBy([choice.photo, option.photo], (string) => !_.isEmpty(string))
            const price = Util.getSpecifyObjectBy([choice.price, option.price], (number) => _.isNumber(number));
            const priceB4Discount = Util.getSpecifyObjectBy([choice.priceB4Discount, option.priceB4Discount], (number) => _.isNumber(number));
            const currentCountOfMaximum = Util.getSpecifyObjectBy([choice.count, option.count], (number) => _.isNumber(number));
            const countOfSubmit = cartie.count <= currentCountOfMaximum ? cartie.count : currentCountOfMaximum;

            self.pushBrief({
                booze, name: booze.name, idOfCookieUsage, nameOfOption: option.name, valueOfOption: option.value,
                nameOfChoice: choice.name, valueOfChoice: choice.value,
                photo: hrefOfPhoto, price, priceB4Discount, countOfSubmit, countOfMaximum: currentCountOfMaximum
            })
        }

        const self = this;
        this.cleanBriefs();
        const info = Cookie.getInfoOfCartie();
        if (_.isObject(info)) {
            const carties = _.values(info);
            const ids = carties.map((each) => each.idOfBooze);
            const boozes = await this.api.fetchBoozesOfLimitation(this.getComponent(), 'in', 'id', ...Util.getSliceArrayOfUnique(ids));
            const objectOfBoozes = Util.toObjectWithAttributeKey(boozes, 'id');
            for (const cartie of carties) {
                const booze = objectOfBoozes[cartie.idOfBooze];
                const optionOfSelected = _.find(booze.options, (option => _.isEqual(option.value, cartie.idOfOption)));
                const choiceOfSelected = _.find(booze.choices, (choice => _.isEqual(choice.value, cartie.idOfChoice)));

                if (choiceOfSelected) pushCurrentBrief(booze, cartie, optionOfSelected, choiceOfSelected)
                else if (optionOfSelected) pushCurrentBrief(booze, cartie, optionOfSelected, choiceOfSelected)
                else Util.appendError(`48513213 發生了放在購物車，但是商品沒有找到option，可能是booze id被洗牌了，或是cookie資料髒了`)
            }
        }
    }

    @computed
    get getComputedPriceWithoutDiscount() {
        const feesOfEachBrief = _.filter(this.getBriefs(), (brief) => brief.getSure())
            .map((brief => _.multiply(brief.getPrice(), brief.getCountOfSubmit())));
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
        const result = 0;
        this.setDiscountOfMember(result);
        return result;
    }

    @computed
    get getComputedPriceOfTotal() {
        return _.sum([this.getPriceWithoutDiscount(), this.getPriceOfDiscount(), this.getDiscountOfMember()]);
    }


    /** -------------------- async api -------------------- **/
}

export default CartieStore;
