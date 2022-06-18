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

    async handleHttpOnCall(data, context) {
        console.log(`following are data info`);
        console.log(data);
        console.log(`--------------- end of data ---------------\n\n\n`);

        const items = data.items;
        const noteOfPreciseOrder = data.noteOfPreciseOrder;
        const products = await Api.fetchPreciseProductsOfLimitation('in', 'id', ...items.map(item => item.id))
        if (_.size(_.difference(items.map(item => item.id), products.map(product => product.id))) > 0) {
            throw new ERROR(9999, '484117145 您提出的訂單內容與現有商品規格不合，本次交易不成立')
        }

        const itemsOfPrecisely = Util.getMergedArray(items, products, 'id');
        /** [{name,count,id,countOfCurrent(庫存量)}]*/
        console.log(itemsOfPrecisely);

        /** 計算剩餘數量足夠否 */
        for (const item of itemsOfPrecisely) {
            if (item.count > item.countOfCurrent) {
                throw new ERROR(9999, '989473454 庫存不足，本次交易不成立。')
            }
        }

        /** 利用atomically method 扣掉數量, 過程中發現其中一個商品數量不足, 得再atomically加回去 再吐回去一個商品數量不足的警告*/

        try {
            for (const item of itemsOfPrecisely) {
                await Api.updatePreciseProductItemAtomically(async (product) => {
                    if (product.countOfCurrent > item.count) {
                        return {countOfCurrent: product.countOfCurrent - item.count}
                    } else {
                        throw new ERROR(9999, `4647894135 考慮百萬分之一的可能，countOfCurrent < count，取消交易，並且atomically修改回所有髒掉的數量。`)
                    }
                }, item.id)
                item.succeedOfTransaction = true;
            }
        } catch (error) {
            for (const item of _.filter(itemsOfPrecisely, (item) => item.succeedOfTransaction)) {
                await Api.updatePreciseProductItemAtomically(async (product) => {
                    return {countOfCurrent: product.countOfCurrent + item.count}
                }, item.id)
            }
            throw new ERROR(9999, '989473454 庫存不足，本次交易不成立。')
        }

        /** 計算總價 */
        const priceOfTotal = _.sum(itemsOfPrecisely.map((item) => item.count * item.price))
        console.log(`priceOfTotal:${priceOfTotal}`);

        /** 成立訂單 */
        const result = await Api.submitPreciseOrderItem({
            idOfUser: this.getUid(context),
            textOfContract: this.getTextOfContract(itemsOfPrecisely, noteOfPreciseOrder),
            note: noteOfPreciseOrder,
            priceOfTotal: this.getTotalPrice(itemsOfPrecisely),
            items: this.getItemsOfOrder(itemsOfPrecisely),
        })

        if (result.succeed) {
            return {idOfPreciseOrder: result.value.id};
        } else {
            throw new ERROR(9999, `474445787 創建PreciseOrder時失敗，未知原因。`);
        }
    }

    getItemsOfOrder(items) {
        return items.map(item => {
            return {
                idOfProduct: item.id,
                count: item.count,
            }
        })
    }

    getTotalPrice(items) {
        return _.sum(items.map((item) => item.count * item.price));
    }

    getTextOfContract(items, note) {
        const stmts = items.map(item => {
            return `${item.name} x ${item.count} = ${item.count * item.price} 元`
        })
        stmts.push(`\n\n總價 ${this.getTotalPrice(items)} 元`);

        if (!Util.isUndefinedNullEmpty(note))
            stmts.push(`\n\n\n※備註: ${note}`);

        return stmts.join('\n');
    }

    /** -------------------- async api -------------------- **/
}

export default ModularizedCreateEPayPreciseOrder;
