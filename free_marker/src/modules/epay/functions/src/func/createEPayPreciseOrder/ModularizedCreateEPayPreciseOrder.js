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

    /** 課程類商品且useMainTrunk，就得計算是否有衝堂問題 */
    checkConflictAgainst2MainTrunk = async (variant) => {
        const timesOfOccupied = await Api.fetchPureHeras(
            variant.idOfAuthor,
            { where: (stmt) => stmt.where("useMainTrunk", "==", true) },
            { where: (stmt) => stmt.where("startYYYYMMDDHHmmss", ">=", Util.getTSOfSpecificDate(variant.content)) },
            { where: (stmt) => stmt.where("startYYYYMMDDHHmmss", "<=", Util.getTSOfSpecificDate(variant.content, { end: true })) }
        );
        Util.appendInfo("main trunk裡的項目 itemsOfHera => ", timesOfOccupied);
        const itemsOfHera = Util.getFilteredHeraPeriods(timesOfOccupied, variant.idOfVariant);
        Util.appendInfo("篩選過後的 itemsOfHera => ", itemsOfHera);
        return Util.checkPeriodConflict(variant, itemsOfHera).conflict;
    };

    /** 當useMainTrunk為true時，要增加一筆hera通知行事曆 */
    submitHeraSchedule = async (variant, transaction) => {
        const db = this._firebase().firestore();
        const ref = db.collection(`users/${variant.idOfAuthor}/hera`).doc();
        const period = Util.getStringOfConvertTimeRange(variant.content);
        const splitPeriod = period.split("-");
        transaction.set(ref, {
            startYYYYMMDDHHmmss: _.toNumber(`${splitPeriod.shift()}00`),
            endYYYYMMDDHHmmss: _.toNumber(`${splitPeriod.pop()}00`),
            idOfVariant: variant.id,
            idOfBooze: variant.idOfBooze,
            useMainTrunk: variant.useMainTrunk ?? false,
            name: `${variant.nameOfBooze}${Util.getSeparatorOfUnique()}${variant.content}`,
            period
        });
        return ref.id;
    };

    async handleHttpOnCall(data, session) {
        const itemsOfClientOrdering = _.filter(data.items, ({ quantity, idOfVariant }) => quantity > 0 && !_.isEmpty(idOfVariant));
        /** items = [...{idOfBooze,idOfVariant,quantity,nameOfBooze}] */
        const { remark, address, phone, name, email } = data;
        if (itemsOfClientOrdering.length === 0) this.appendErrorLog(9999, "E1200 無有效商品資料");

        if (itemsOfClientOrdering.length > this.getMaxItemsOfPreciseOrder()) this.appendErrorLog(9999, `錯誤：E1201 單筆項目不可超過 ${this.getMaxItemsOfPreciseOrder()} 種`);

        await this.checkoutCartWithScheduleCheck(itemsOfClientOrdering);

        /** 成立訂單 */
        const result = await Api.submitPreciseOrderItem({
            idOfUser: this.getUid(session),
            textOfContract: this.getTextOfContract(itemsOfClientOrdering, remark),
            remark,
            timeOfExpired: Util.getTimeStampWithConditions(this.getRuleOfExpiredTime()),
            timeOfCreate: Util.getCurrentTimeStamp(),
            priceOfTotal: this.getFinalPriceOfCustomDiscountRule(itemsOfClientOrdering),
            imageUrlOfHeadPhoto: _.head(itemsOfClientOrdering)?.photo ?? "",
            items: this.getPreciseItemsAsRecord(itemsOfClientOrdering),
            email: email || "",
            address: address || "",
            distance: "",
            name: name || "",
            phoneNumber: phone || "",
            idOfAuthor: itemsOfClientOrdering[0].idOfAuthor
        });

        /** 成立hades作為收益報表用 */
        const order = result.value;
        await Api.submitHadeItem(
            {
                priceOfTotal: order.priceOfTotal,
                timeOfCreate: order.timeOfCreate,
                timeOfPayment: order.timeOfPayment,
                paid: false,
                id: order.id
            },
            order.id,
            order.idOfAuthor
        );

        if (result.succeed) return { idOfPreciseOrder: result.value.id };
        else this.appendErrorLog(9999, `E1299 創建訂單時失敗，未知原因(請訊息洽詢)。`);
    }

    /**
     * 購物車結帳交易處理（含課程衝堂檢查）
     * @param {array} itemsOfCartie - 購買商品們 [..{idOfBooze,idOfVariant,quantity,nameOfBooze}]
     */
    checkoutCartWithScheduleCheck = async (itemsOfCartie) => {
        function getNameOfSelectBooze(idOfVariant) {
            const itemOfCartie = _.find(itemsOfCartie, (item) => _.isEqual(item.idOfVariant, idOfVariant));
            return itemOfCartie ? itemOfCartie.nameOfBooze : "(已過期)";
        }

        const db = this._firebase().firestore();
        return await db.runTransaction(async (transaction) => {
            // 先批次抓所有商品文件
            const variantRefs = itemsOfCartie.map((item) => db.collection(`dionysus/${item.idOfBooze}/variants`).doc(item.idOfVariant));
            const variantSnaps = await transaction.getAll(...variantRefs);

            // 建立商品快取 Map
            const mapOfVariant = {};
            let authorId = null; // 第一個作者 ID，作為檢查基準

            for (let i = 0; i < variantSnaps.length; i++) {
                const snap = variantSnaps[i];
                if (!snap.exists) throw new Error(`商品不存在：${getNameOfSelectBooze(variantRefs[i].id)}`);

                const id = snap.id;
                const variant = snap.data();
                mapOfVariant[id] = variant;

                const item = _.find(itemsOfCartie, (item) => _.isEqual(item.idOfVariant, id));
                item.price = variant.price;
                item.photo = variant.photo;
                item.content = variant.content;
                item.idOfAuthor = variant.idOfAuthor;

                // 檢查 idOfAuthor 一致性
                if (authorId === null) {
                    authorId = variant.idOfAuthor; // 記錄第一個的 idOfAuthor
                } else if (variant.idOfAuthor !== authorId) {
                    throw new Error(`購物車中的商品來自不同作者，無法進行交易。`);
                }
            }

            const totalPrice = this.getFinalPriceOfCustomDiscountRule(itemsOfCartie);
            if (totalPrice > this.getMaxPriceOfTSingleTransaction()) throw new ERROR(`單筆交易金額不能超過 ${this.getMaxPriceOfTSingleTransaction()} 元，請分批購買`);

            // 開始扣除商品庫存與新增 schedule（如果是課程）
            for (const item of itemsOfCartie) {
                const { idOfBooze, idOfVariant, quantity, nameOfBooze } = item;
                const variant = mapOfVariant[idOfVariant];
                const variantRef = db.collection(`dionysus/${idOfBooze}/variants`).doc(idOfVariant);

                const quantityOfBalance = (variant.quantity || 0) - quantity; //當前數量 - 購買數量
                if (quantityOfBalance < 0) throw new Error(`${variant.nameOfBooze} ${variant.content} 數量不足`);

                // 更新庫存
                transaction.update(variantRef, { quantity: quantityOfBalance });

                // 如果是課程，先檢查是否衝堂
                if (variant.isTaskJob) {
                    if (variant.useMainTrunk) {
                        const result = await this.checkConflictAgainst2MainTrunk(variant, transaction);
                        if (result.conflict) throw new Error(`${variant.nameOfBooze}的時段(${variant.content})衝突`);
                    }
                    item.infoOfHera = JSON.stringify({ id: await this.submitHeraSchedule(variant, transaction), idOfAuthor: variant.idOfAuthor });
                }
            }
        });
    };

    getPreciseItemsAsRecord(variants) {
        return variants.map(({ idOfBooze, idOfVariant, quantity, nameOfBooze, content, price, photo, note, infoOfHera }) => ({
            idOfPreciseProduct: `${idOfBooze}${Util.getSeparatorOfUnique()}${idOfVariant}`,
            quantity,
            name: `${nameOfBooze}`,
            specific: content,
            price,
            infoOfHera,
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
