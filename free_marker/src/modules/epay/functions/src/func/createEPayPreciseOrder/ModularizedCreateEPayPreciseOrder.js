import {
    utiller as Util,
    exceptioner as ERROR,
    pooller as InfinitePool,
} from "utiller";
import _ from "lodash";
import libpath from "path";
import BaseCreateEPayPreciseOrder from "./BaseCreateEPayPreciseOrder";
import Api from '../../api';

class ModularizedCreateEPayPreciseOrder extends BaseCreateEPayPreciseOrder {
    /** -------------------- fields -------------------- **/
    /** -------------------- functions -------------------- **/

    constructor(props) {
        super(props);
    }

    preCheckOfCustomizeRule() {
        this.appendErrorLog(9999, `4841187456 專案里特規的檢查條件,例如(專案名:悅薪)的時段檢查機制`)
    }

    async handleHttpOnCall(data, session) {
        const items = Util.getArrayOfSummarizeBy(data.items, 'id', 'quantity');
        if (1 > _.size(items)) {
            this.appendErrorLog(9999, '484118756  帶上來的參數裡,並沒有商品內容')
        }

        this.remarkOfPreciseOrder = data.remarkOfPreciseOrder ?? '無備註內容';
        this.imageUrlOfHeadPhoto = data.imageUrlOfHeadPhoto;

        const products = await Api.fetchPreciseProductsOfLimitation('in', 'id', ...items.map(item => item.id))
        if (_.size(_.difference(items.map(item => item.id), products.map(product => product.id))) > 0) {
            this.appendErrorLog(9999, '484117145 您提出的訂單內容與現有商品規格不合，本次交易不成立')
        }

        this.itemsOfPrecisely = Util.getMergedArrayBy(items, products, 'id');
        /** [{name,quantity,id,quantityOfCurrent(庫存量)}]*/

        /** 計算剩餘數量足夠否 */
        for (const item of this.itemsOfPrecisely) {
            if (item.quantity > item.quantityOfCurrent) {
                this.appendErrorLog(9999, '989473454 庫存不足，本次交易不成立。')
            }
        }

        /** 計算總價 */
        const priceOfTotal = this.getTotalPrice(this.itemsOfPrecisely);
        if (priceOfTotal > 20000) {
            this.appendErrorLog(9999, '989474156214 目前不支援單筆超過兩萬的訂單')
        }
        this.preCheckOfCustomizeRule();
        /** 利用atomically method 扣掉數量, 過程中發現其中一個商品數量不足, 得再atomically加回去 再吐回去一個商品數量不足的警告*/

        try {
            for (const item of this.itemsOfPrecisely) {
                await Api.updatePreciseProductItemAtomically(async (product) => {
                    if (product.quantityOfCurrent > item.quantity) {
                        return {quantityOfCurrent: product.quantityOfCurrent - item.quantity}
                    } else {
                        this.appendErrorLog(9999, `4647894135 考慮百萬分之一的可能，quantityOfCurrent < quantity，取消交易，並且atomically修改回所有髒掉的數量。`)
                    }
                }, item.id)
                item.succeedOfTransaction = true;
            }
        } catch (error) {
            for (const item of _.filter(this.itemsOfPrecisely, (item) => item.succeedOfTransaction)) {
                await Api.updatePreciseProductItemAtomically(async (product) => {
                    return {quantityOfCurrent: product.quantityOfCurrent + item.quantity}
                }, item.id)
            }
            this.appendErrorLog(9999, '989473454 庫存不足，本次交易不成立。');
        }

        /** 成立訂單 */
        const result = await Api.submitPreciseOrderItem({
            idOfUser: this.getUid(session),
            textOfContract: this.getTextOfContract(this.itemsOfPrecisely, this.remarkOfPreciseOrder),
            remark: this.remarkOfPreciseOrder,
            timeOfExpired: Util.getTimeStampWithConditions({days: 1}),
            priceOfTotal: this.getTotalPrice(this.itemsOfPrecisely),
            imageUrlOfHeadPhoto: this.getImageUrlOfHeadPhoto(),
            items: this.getItemsOfOrder(this.itemsOfPrecisely),
        })

        if (result.succeed) {
            return {idOfPreciseOrder: result.value.id};
        } else {
            this.appendErrorLog(9999, `474445787 創建PreciseOrder時失敗，未知原因。`);
        }
    }

    getImageUrlOfHeadPhoto() {
        const urlsOfProductImage = _.flattenDeep(this.itemsOfPrecisely.map(item => item.photos)).map((photo => photo.url));
        return Util.getValueOfPriority(this.imageUrlOfHeadPhoto, _.head(urlsOfProductImage));
    }

    getItemsOfOrder(items) {
        return items.map(item => {
            const photo = _.head(item.photos);
            return {
                idOfPreciseProduct: item.id,
                quantity: item.quantity,
                name: item.name,
                price: item.price,
                imageUrlOfProduct: Util.isUndefinedNullEmpty(photo) ? '' : photo.url,
                note: item.note ?? `無單品項備註內容`
            }
        })
    }

    getTotalPrice(items) {
        return _.sum(items.map((item) => item.quantity * item.price));
    }

    getTextOfContract(items, remark) {
        const stmts = items.map(item => {
            return `${item.name} x ${item.quantity} = ${item.quantity * item.price} 元`
        })
        stmts.push(`\n\n總價 ${this.getTotalPrice(items)} 元`);

        if (!Util.isUndefinedNullEmpty(remark))
            stmts.push(`\n\n\n※備註: ${remark}`);

        return stmts.join('\n');
    }

    /** -------------------- async api -------------------- **/
}

export default ModularizedCreateEPayPreciseOrder;
