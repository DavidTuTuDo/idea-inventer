const edit = true;

import { utiller as Util, exceptioner as ERROR, pooller as InfinitePool } from "utiller";
import _ from "lodash";
import BaseCreateEPayPreciseOrder from "./BaseCreateEPayPreciseOrder";
import Api from "../../api";
import Config from "../../config";

class ModularizedCreateEPayPreciseOrder extends BaseCreateEPayPreciseOrder {
    /** -------------------- fields -------------------- **/
    /** -------------------- functions -------------------- **/

    constructor(props) {
        super(props);
        this.containsDeliveredVariant = false;
    }

    getMaxItemsOfPreciseOrder = () => {
        return 25;
    };

    preCheckOfCustomizeRule() {
        this.appendErrorLog(9999, `4841187456-CreateEPayPreciseOrder 專案里特規的檢查條件,例如(專案名:悅薪)的時段檢查機制`);
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

    handleHttpOnCall = async (data, session) => {
        /** todo:未登入帳號，是否距離上一次REQUEST間隔2分鐘以上 */

        /** todo:未登入帳號，價格是否超過eros裡的 amountOfAllowAnonymousBuy */

        /** todo:未登入帳號，價格是否超過eros裡的 amountOfMaximumBuy */

        /** todo:透過idOfAuthor拿到eros，如果超過免運就免，否則就是依照買家 transport的(feeOfPickupStore, feeOfCOD) */

        /** todo:運費方式寫進去methodOfTransport */

        /** todo:完成交易後，填寫地址和姓名紀錄在user的欄位(latestName, latestAddress) */

        const db = this._firebase().firestore();
        const itemsOfClientOrdering = _.filter(data.items, ({ quantity, idOfVariant }) => quantity > 0 && !_.isEmpty(idOfVariant));
        const { remark, address, phone, name, email, transport } = data;

        // 參數驗證
        this.validateOrderItems(itemsOfClientOrdering);

        const preciseOrderRef = db.collection(`ordersOfEPay`).doc();

        try {
            await db.runTransaction(async (transaction) => {
                const { mapOfVariant, authorId, containsDeliveredVariant } = await this.getAndValidateVariants(db, itemsOfClientOrdering, transaction);

                // 驗證最終價格
                const totalPrice = this.getFinalPriceOfCustomDiscountRule(itemsOfClientOrdering);
                this.validateTotalPrice(totalPrice);

                // 處理庫存扣除和排程
                await this.processInventoryAndSchedules(db, itemsOfClientOrdering, mapOfVariant, transaction);

                // 創建訂單與報表
                await this.createOrderAndHades(
                    db,
                    itemsOfClientOrdering,
                    preciseOrderRef,
                    authorId,
                    containsDeliveredVariant,
                    { remark, address, phone, name, email },
                    session,
                    totalPrice,
                    transaction
                );
            });
            return { idOfPreciseOrder: preciseOrderRef.id };
        } catch (error) {
            this.appendErrorLog(9999, `E1299 ${error.message}`);
        }
    };

    validateOrderItems = (items) => {
        if (items.length === 0) {
            this.appendErrorLog(9999, "5556451123-CreateEPayPreciseOrder 無有效商品資料");
        }
        if (items.length > this.getMaxItemsOfPreciseOrder()) {
            this.appendErrorLog(9999, `15131213-CreateEPayPreciseOrder 單筆項目不可超過${this.getMaxItemsOfPreciseOrder()}種`);
        }
    };

    getAndValidateVariants = async (db, itemsOfClientOrdering, transaction) => {
        const variantRefs = itemsOfClientOrdering.map((item) => db.collection(`dionysus/${item.idOfBooze}/variants`).doc(item.idOfVariant));
        const variantSnaps = await transaction.getAll(...variantRefs);
        const mapOfVariant = {};
        let authorId = null;
        let containsDeliveredVariant = false;

        for (let i = 0; i < variantSnaps.length; i++) {
            const snap = variantSnaps[i];
            if (!snap.exists) {
                const itemOfCartie = _.find(itemsOfClientOrdering, (item) => _.isEqual(item.idOfVariant, variantRefs[i].id));
                const name = itemOfCartie ? itemOfCartie.nameOfBooze : "(已過期)";
                this.appendErrorLog(9999, `5451312321 商品(variant)已不存在(${name})`);
            }

            const id = snap.id;
            const variant = snap.data();
            mapOfVariant[id] = variant;

            const item = _.find(itemsOfClientOrdering, (item) => _.isEqual(item.idOfVariant, id));
            item.price = variant.price;
            item.photo = variant.photo;
            item.content = variant.content;
            item.idOfAuthor = variant.idOfAuthor;

            if (authorId === null) {
                authorId = variant.idOfAuthor;
            } else if (variant.idOfAuthor !== authorId) {
                this.appendErrorLog(9999, "1152132321 購物車中的商品來自不同作者，無法進行交易");
            }
            const isPhysicalGood = !variant.isTaskJob;
            if (isPhysicalGood) containsDeliveredVariant = true;
        }
        return { mapOfVariant, authorId, containsDeliveredVariant: containsDeliveredVariant };
    };

    validateTotalPrice = (totalPrice) => {
        if (totalPrice > this.getMaxPriceOfTSingleTransaction()) {
            this.appendErrorLog(9999, `4564521-CreateEPayPreciseOrder 單筆交易金額不能超過 ${this.getMaxPriceOfTSingleTransaction()} 元，請分批購買`);
        }
    };

    processInventoryAndSchedules = async (db, itemsOfClientOrdering, mapOfVariant, transaction) => {
        for (const item of itemsOfClientOrdering) {
            const { idOfBooze, idOfVariant, quantity, nameOfBooze } = item;
            const variant = mapOfVariant[idOfVariant];
            const variantRef = db.collection(`dionysus/${idOfBooze}/variants`).doc(idOfVariant);

            const quantityOfBalance = (variant.quantity || 0) - quantity;
            if (quantityOfBalance < 0) {
                this.appendErrorLog(9999, `1232132321-CreateEPayPreciseOrder ${variant.nameOfBooze}|${variant.content}|數量不足`);
            }

            transaction.update(variantRef, { quantity: quantityOfBalance });

            if (variant.isTaskJob) {
                if (variant.useMainTrunk) {
                    const result = await this.checkConflictAgainst2MainTrunk(variant, transaction);
                    if (result.conflict) {
                        this.appendErrorLog(9999, `1124545654-CreateEPayPreciseOrder ${variant.nameOfBooze}的時段(${variant.content})衝突`);
                    }
                }
                item.infoOfHera = JSON.stringify({ id: await this.submitHeraSchedule(variant, transaction), idOfAuthor: variant.idOfAuthor });
            } else item.infoOfHera = "";
        }
    };

    createOrderAndHades = async (db, itemsOfClientOrdering, preciseOrderRef, authorId, containsDeliveredVariant, data, session, totalPrice, transaction) => {
        const { remark, address, phone, name, email } = data;
        const preciseOrderData = Api.normalizePreciseOrder({
            /** todo:未登入idOfUser:'', anonymous:true */
            anonymous: this.isAnonymousUser(session),
            fingerprint: this.getFingerprint(),
            idOfUser: this.isAnonymousUser(session) ? "" : this.getUid(session),
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
            phoneNumber: phone || "",
            stateOfDeliver: containsDeliveredVariant ? Config.StateOfDeliver.Pending : Config.StateOfDeliver.Needless,
            idOfAuthor: authorId
        });

        transaction.create(preciseOrderRef, preciseOrderData);

        const hadesData = Api.normalizeHade({
            priceOfTotal: totalPrice,
            timeOfCreate: Util.getCurrentTimeStamp(),
            paid: false,
            id: preciseOrderRef.id
        });
        transaction.create(db.collection(`/users/${authorId}/hades`).doc(preciseOrderRef.id), hadesData);
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
