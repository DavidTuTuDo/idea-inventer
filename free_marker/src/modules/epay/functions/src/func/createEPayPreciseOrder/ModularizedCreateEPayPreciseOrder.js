const edit = true;

import { utiller as Util, exceptioner as ERROR, pooller as InfinitePool } from "utiller";
import _ from "lodash";
import BaseCreateEPayPreciseOrder from "./BaseCreateEPayPreciseOrder";
import Api from "../../api";

class ModularizedCreateEPayPreciseOrder extends BaseCreateEPayPreciseOrder {
    /** -------------------- fields -------------------- **/
    /** -------------------- functions -------------------- **/

    constructor(props) {
        super(props);
    }

    getMaxItemsOfPreciseOrder = () => {
        return 25;
    };

    preCheckOfCustomizeRule() {
        this.appendErrorLog(9999, `4841187456 專案里特規的檢查條件,例如(專案名:悅薪)的時段檢查機制`);
    }

    getRuleOfExpiredTime = () => {
        return { hours: 2 };
        //{days,minutes}
    };

    getFinalPriceOfCustomDiscountRule(itemsOfClientOrdering) {
        /** 從firestore設計的discount去做公式，例如滿萬打9折| 滿2000免運費 */

        /** 扣掉會員金的概念，老班可從後台給某位註冊帳號一筆會員金 */
        return this.getTotalPrice(itemsOfClientOrdering);
    }

    /** 單筆交易最高金額(可能依據付款機構規定) */
    getMaxPriceOfTSingleTransaction() {
        return 20000;
    }

    async handleHttpOnCall(data, session) {
        const itemsOfClientOrdering = _.filter(data.items, ({ quantity, idOfVariant }) => quantity > 0 && !_.isEmpty(idOfVariant));
        /** items = [...{idOfBooze,idOfVariant,quantity,nameOfBooze}] */
        const { remark, address, phone, name, email } = data;
        if (itemsOfClientOrdering.length === 0) this.appendErrorLog(9999, "錯誤：E1200 無有效商品資料");

        if (itemsOfClientOrdering.length > this.getMaxItemsOfPreciseOrder()) this.appendErrorLog(9999, `錯誤：E1201 單筆項目不可超過 ${this.getMaxItemsOfPreciseOrder()} 種`);

        function extractDate(input) {
            // 切掉星期和時間，只取到 '2025/08/18'
            return _.trim(input.split("(")[0]);
        }

        /** 用batch fetch拿回variants */
        const params = itemsOfClientOrdering.map(({ idOfVariant, idOfBooze }) => ({ id: idOfVariant, pid: idOfBooze }));
        const variantsOfRemoteStatus = await Api.fetchVariantBatchItems(...params);

        /** 計算剩餘數量和帶入參數足夠否, count是指client端下的數量 */
        const mapOfVariantStatus = new Map(variantsOfRemoteStatus.map((v) => [v.id, v])); /** 用map做indexing加快速度(取代_.find)*/

        for (const item of itemsOfClientOrdering) {
            const variant = mapOfVariantStatus.get(item.idOfVariant);
            item.price = variant.price;
            item.photo = variant.photo;
            item.content = variant.content;
            if (!variant || variant.quantity < item.quantity) this.appendErrorLog(9999, `錯誤：E1202 ${item.nameOfBooze} 的 ${variant?.content ?? "未知項目"} 數量不足`);
        }

        const totalPrice = this.getFinalPriceOfCustomDiscountRule(itemsOfClientOrdering);
        if (totalPrice > this.getMaxPriceOfTSingleTransaction()) this.appendErrorLog(9999, `E1204 單筆交易金額不能超過 ${this.getMaxPriceOfTSingleTransaction()} 元，請分批購買`);

        /** atomic的方式扣除client端下order的quantity */
        let rollbackList = [];
        try {
            for (const item of itemsOfClientOrdering) {
                const variant = mapOfVariantStatus.get(item.idOfVariant);
                await Api.updateVariantItemAtomically(
                    async (current) => {
                        if (current.quantity >= item.quantity) return { quantity: current.quantity - item.quantity };
                        else throw new Error(`E1203 ${item.nameOfBooze} 的 ${variant.content} 數量不足`);
                    },
                    variant.id,
                    variant.idOfBooze
                );

                /** 未處理variant不存在的狀況*/

                // /** 新增行事曆的邏輯*/
                // if (variant.isTaskJob && variant.useMainTrunk) {
                //     const idOfTS = _.toString(Util.getStringOfLocalToUtcTimestamp(extractDate(variant.content)));
                //     const idOfProcessor = await Api.submitProcessorItem({
                //         idOfVariant: variant.id,
                //         idOfBooze: variant.idOfBooze,
                //         period: Util.getStringOfConvertTimeRange(variant.content)
                //     }, undefined, variant.idOfAuthor, idOfTS);
                // }

                rollbackList.push({ item, variant });
            }
        } catch (error) {
            /** 購物車內扣數量個過程中，發現其中一個數量不足，就必須把之前的補回去*/
            for (const { item, variant } of rollbackList) {
                await Api.updateVariantItemAtomically(
                    async (current) => ({
                        quantity: current.quantity + item.quantity
                    }),
                    variant.id,
                    variant.idOfBooze
                );
            }
            this.appendErrorLog(9999, error.message);
        }

        /** 成立訂單 */
        const result = await Api.submitPreciseOrderItem({
            idOfUser: this.getUid(session),
            textOfContract: this.getTextOfContract(itemsOfClientOrdering, remark),
            remark,
            timeOfExpired: Util.getTimeStampWithConditions(this.getRuleOfExpiredTime()),
            timeOfCreate: Util.getCurrentTimeStamp(),
            priceOfTotal: totalPrice,
            imageUrlOfHeadPhoto: _.head(itemsOfClientOrdering)?.photo ?? "",
            items: this.getPreciseItemsAsRecord(itemsOfClientOrdering),
            email: email || "",
            address: address || "",
            distance: "",
            name: name || "",
            phoneNumber: phone || ""
        });

        if (result.succeed) return { idOfPreciseOrder: result.value.id };
        else this.appendErrorLog(9999, `錯誤：E1299 創建訂單時失敗，未知原因(請訊息洽詢)。`);
    }

    getPreciseItemsAsRecord(variants) {
        return variants.map(({ idOfBooze, idOfVariant, quantity, nameOfBooze, content, price, photo, note }) => ({
            idOfPreciseProduct: `${idOfBooze}${Util.getSeparatorOfUnique()}${idOfVariant}`,
            quantity,
            name: `${nameOfBooze}`,
            specific: content,
            price,
            imageUrlOfProduct: photo,
            note: note || "無單品項備註內容"
        }));
    }

    getTotalPrice(items) {
        return _.sum(items.map((item) => item.quantity * item.price));
    }

    getTextOfContract(items, remark = "", tipsOfDiscount = [], hideDiscountMessage = false) {
        const lines = items.map((item) => `${item.nameOfBooze}(${item.content}) x ${item.quantity} = ${item.quantity * item.price} 元`);
        if (!hideDiscountMessage && _.size(tipsOfDiscount) > 0) {
            lines.push("\n折扣提示：");
            tipsOfDiscount.forEach(({ reason, discount }) => lines.push(`${reason} 折扣了 ${discount} 元`));
        }
        lines.push(`\n\n總價 ${this.getTotalPrice(items)} 元`);
        return lines.join("\n");
    }

    /** -------------------- async api -------------------- **/
}

export default ModularizedCreateEPayPreciseOrder;
