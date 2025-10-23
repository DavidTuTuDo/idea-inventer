const edit = true;

import { utiller as Util, exceptioner as ERROR, pooller as InfinitePool } from "utiller";
import _ from "lodash";
import BaseCreateEPayPreciseOrder from "./BaseCreateEPayPreciseOrder";
import Api from "../../api";
import Config from "../../config";

const INTERVAL_OF_ANONYMOUS_VISIT = 2 * 60 * 1000; //2  minute
class ModularizedCreateEPayPreciseOrder extends BaseCreateEPayPreciseOrder {
    constructor(props) {
        super(props);
        this.containsTransportedVariant = false;
    }

    isAnonymousAllowVisit = async (fingerprint = "") => {
        const ref = Api.getFingerprintItemDocRef(fingerprint);
        // 兩分鐘的毫秒數
        return await Api.runTransaction(async (tx) => {
            const doc = await tx.get(ref);
            const exists = doc.exists;
            // 使用伺服器時間作為當前時間
            const now = Api.getObjectOfCurrentTimeStamp();
            // 預設允許存取
            let isAllowed = true;
            if (exists) {
                const oldData = doc.data();
                const lastAccessTime = oldData.lastAccessedAt; // 檢查 lastAccessedAt 是否存在(防止數據結構不完整)
                const timeElapsedMs = now.toMillis() - lastAccessTime.toMillis();
                if (timeElapsedMs < INTERVAL_OF_ANONYMOUS_VISIT) isAllowed = false; // 如果間隔小於 2 分鐘，則不允許存取
                tx.update(ref, { lastAccessedAt: now }); // 無論是否允許，都更新最新的存取時間
            } else tx.set(ref, { lastAccessedAt: now }); // 首次存取 (文件不存在)，允許存取並設定初始時間
            return isAllowed;
        });
    };

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

    /** (done) todo:當useMainTrunk為true時，要增加一筆hera通知行事曆 */
    submitHeraSchedule = async (variant, transaction) => {
        const ref = Api.getHeraItemDocRef("", variant.idOfAuthor);

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
        const { fingerprint, items, remark, address, phone, name, email, typeOfTransport, typeOfTransaction, priceOfTotal4Client } = data; //Config.TransportMethod; Config.Transaction
        console.log({ fingerprint, items, remark, address, phone, name, email, typeOfTransport, typeOfTransaction, priceOfTotal4Client });
        const itemsOfClientOrdering = items;
        /** (done) todo:沒有fingerprint直接當成邪魔歪道，拋出錯誤 */
        if (_.isEmpty(fingerprint)) this.appendErrorLog(9999, `55151214612 你是壞狗，不可以玩伺服器`);

        /** (done) todo:未登入帳號，是否距離上一次REQUEST超過規範的間隔 */
        if (!this.isLoginUser(session)) {
            const anonymousAllowed = await this.isAnonymousAllowVisit(fingerprint);
            if (!anonymousAllowed) this.appendErrorLog(9999, `4534535447534 陌生訪問太過於頻繁，請稍後再試`);
        }

        const globalPerspective = await Api.fetchGlobalPerspective();
        /** (done) todo:檢查_.size(items)有沒有超過maximumOfOrderingItem */
        if (_.size(items) > globalPerspective.maximumOfUniqueItems) this.appendErrorLog(9999, `453543741232113 購買品項不可超過 ${globalPerspective.maximumOfUniqueItems} 個`);
        const preciseOrderRef = Api.getPreciseOrderItemDocRef();

        try {
            await Api.runTransaction(async (transaction) => {
                const { eros, idOfAuthor, containsTransportedVariant, priceOfTotal, feeOfTransport, discountOfTotal } = await this.fetchThenValidateBoozeVariants({
                    itemsOfClientOrdering,
                    typeOfTransaction,
                    typeOfTransport,
                    priceOfTotal4Client,
                    transaction,
                    session
                });

                // 處理庫存扣除和排程
                await this.processInventoryAndSchedules(itemsOfClientOrdering, transaction);

                // 創建訂單與報表
                await this.createOrderAndHades({
                    itemsOfClientOrdering,
                    preciseOrderRef,
                    idOfAuthor,
                    containsTransportedVariant,
                    remark,
                    address,
                    phone,
                    name,
                    email,
                    session,
                    discountOfTotal,
                    feeOfTransport,
                    priceOfTotal,
                    typeOfTransport,
                    transaction,
                    globalPerspective
                });
            });
            return { idOfPreciseOrder: preciseOrderRef.id };
        } catch (error) {
            this.appendErrorLog(9999, `454561211211165 ${error.message}`);
        }
    };

    /** itemsOfClientOrdering = [...{idOfBooze, idOfVariant, nameOfBooze, quantity}]*/
    fetchThenValidateBoozeVariants = async ({ itemsOfClientOrdering, typeOfTransaction, typeOfTransport, priceOfTotal4Client, transaction, session }) => {
        // const variantRefs = itemsOfClientOrdering.map((item) => db.collection(`dionysus/${item.idOfBooze}/variants`).doc(item.idOfVariant));
        const variantRefs = itemsOfClientOrdering.map((itemOfClientOrdering) => Api.getVariantItemDocRef(itemOfClientOrdering.idOfVariant, itemOfClientOrdering.idOfBooze));
        const variantSnaps = await transaction.getAll(...variantRefs); //variant = {...idOfBooze, price,idOfVariant, nameOfBooze, quantity,visibility,isTaskJob,photo,isHomeTeaching}
        let idOfAuthor = null;
        let containsTransportedVariant = false;

        /** (done) todo:確認 _.size(_.filter(variantSnaps,snap => snap.exists && snap.data().visibility) === _.size(itemsOfClientOrdering)，否則拋出錯誤(部分商品不存在) */
        const existingAndVisibleVariants = _.filter(variantSnaps, (snap) => snap.exists && snap.data()?.visibility);
        if (_.size(existingAndVisibleVariants) !== _.size(itemsOfClientOrdering)) {
            throw new Error("部分商品不存在或已下架 (Some items do not exist or are not visible).");
        }

        /** (done) todo:確認產品的idOfAuthor都相同，否則拋出錯誤(僅能購買同一個idOfAuthor的商品) */
        const uniqueAuthors = _.uniq(_.map(existingAndVisibleVariants, (snap) => snap.data()?.idOfAuthor));
        if (uniqueAuthors.length !== 1 || !uniqueAuthors[0]) {
            throw new Error("僅能購買同一個 idOfAuthor 的商品 (Can only purchase items from the same idOfAuthor).");
        }
        idOfAuthor = uniqueAuthors[0];

        /** todo:透過其中idOfAuthor拿到const eros = await Api.getCupidPublic(idOfAuthor)， 且eros必須存在(eros.numOfWorker > 0)，否則拋出錯誤(無法未能找到賣家的商場設定)*/
        const eros = await Api.fetchCupidPublic(idOfAuthor);
        if (!eros || eros.numOfWorker <= 0) {
            throw new Error("未能找到賣家的商場設定或賣家已停止服務 (Could not find seller's shop settings or seller has stopped service).");
        }

        /** (done) todo(擴增屬性):itemsOfClientOrdering擴增屬性(依據{idOfVariant,idOfBooze}相同) 例如：itemsOfClientOrdering = [...{...,variant:variant:variantSnap.ata()}],itemsOfClientOrdering必須找到並增加一個variant，否則泡出錯誤 */
        /** (done) todo(數量檢查):依據每個idOfVariant相同的比較 variantSnaps和商品數量(quantity) >= itemOfClientOrdering的下單數量(quantity)，否則拋出錯誤(部分商品數量不足) */
        /** (done) todo(累加計算總價):計算出itemsOfClientOrdering裡面的總價，priceOfTotalOfShould(itemsOfClientOrdering裡面的總價 = _.sum([...(itemOfClientOrdering.quantity*itemOfClientOrdering.variant.price)] )，必須等於priceOfTotal，否則拋出錯誤(remote計算結果和client端不同) */
        let priceOfTotalOfShould = 0;

        _.forEach(itemsOfClientOrdering, (itemOfClientOrdering, index) => {
            const variantSnap = variantSnaps[index];
            const variant = variantSnap.data();

            /** 數量檢查 */
            if (itemOfClientOrdering.quantity > variant.quantity) {
                this.appendErrorLog(
                    9999,
                    `123151561566156 商品 ${itemOfClientOrdering.nameOfBooze} 數量不足 (Insufficient quantity for item ${itemOfClientOrdering.nameOfBooze}).`
                );
            }

            /** 擴增屬性 */
            itemOfClientOrdering.variant = variant;
            /** 設定 containsTransportedVariant */
            if (!variant.isTaskJob) containsTransportedVariant = true;
            /** 累加計算總價 */
            priceOfTotalOfShould += itemOfClientOrdering.quantity * variant.price;
        });
        const discountOfTotal = _.subtract(0, Util.getNumberOfMultiplyCeil(priceOfTotalOfShould, 1 - Util.toPercentageDecimal(eros.percentageOfDiscount ?? 1)));
        const priceOfTotalIncludingDiscount = _.sum([priceOfTotalOfShould, discountOfTotal]);

        /** (done) todo:透過eros是否支援transport */
        /** (done) todo:如果超過免運就免，否則就是依照transport的(feeOfPickupStore, feeOfCOD) */
        let feeOfTransport = 0;
        switch (typeOfTransport) {
            case Config.TransportMethod.SelfPickup:
                if (!eros.whetherPickupByBuyerSelf) this.appendErrorLog(9999, `687352354354 不支援物流方式：${Config.LangOfTransportMethod.SelfPickup}`);
                break;
            case Config.TransportMethod.Freight:
                if (!eros.whetherHomeDelivery) this.appendErrorLog(9999, `354532132321 不支援物流方式：${Config.LangOfTransportMethod.Freight}`);
                feeOfTransport = priceOfTotalIncludingDiscount >= eros.thresholdOfFreeShipByHomeDelivery ? 0 : eros.feeOfHomeDelivery;
                break;
            case Config.TransportMethod.RapidOnDay:
                if (!eros.whetherShipByRapidly) this.appendErrorLog(9999, `1238532123320 不支援物流方式：${Config.LangOfTransportMethod.RapidOnDay}`);
                feeOfTransport = priceOfTotalIncludingDiscount >= eros.thresholdOfFreeShipByRapidly ? 0 : eros.feeOfRapidOnDelivery;
                break;
            case Config.TransportMethod.StoreFamily:
                if (!eros.whetherShipByStorePickup) this.appendErrorLog(9999, `1235123132 不支援物流方式：${Config.LangOfTransportMethod.StoreFamily}`);
                feeOfTransport = priceOfTotalIncludingDiscount >= eros.thresholdOfFreeShipByStorePickup ? 0 : eros.feeOfInStorePickup;
                break;
            case Config.TransportMethod.Store711:
                if (!eros.whetherShipByStorePickup) this.appendErrorLog(9999, `12321024245 不支援物流方式：${Config.LangOfTransportMethod.Store711}`);
                feeOfTransport = priceOfTotalIncludingDiscount >= eros.thresholdOfFreeShipByStorePickup ? 0 : eros.feeOfInStorePickup;
                break;
            case Config.TransportMethod.Needless:
                break;
            default:
                this.appendErrorLog(9999, `5444556546 物流方式選擇錯誤，請重新操作`);
        }

        /** (done) todo:檢查eros是否支援transaction */
        switch (typeOfTransaction) {
            case Config.TransactionMethod.ECPay:
                const validOfECPay = eros.enableOfECPay && eros.hasECPay && priceOfTotalIncludingDiscount >= eros.thresholdOfCheckoutByCredit;
                if (!validOfECPay) this.appendErrorLog(9999, `12311298775 不支援支付方式：${Config.LangOfTransactionMethod.ECPay}`);
                break;
            case Config.TransactionMethod.LinePay:
                const validOfLinePay = eros.enableOfLinePay && eros.hasLinePay && priceOfTotalIncludingDiscount >= eros.thresholdOfCheckoutByLinePay;
                if (!validOfLinePay) this.appendErrorLog(9999, `87975543454 不支援支付方式：${Config.LangOfTransactionMethod.LinePay}`);
                break;
            case Config.TransactionMethod.COD:
                const validOfCOD = eros.enableOfCOD;
                if (!validOfCOD) this.appendErrorLog(9999, `97888756432 不支援支付方式：${Config.LangOfTransactionMethod.COD}`);
                break;
            case Config.TransactionMethod.DirectPay:
                const validOfDirectPay = eros.enableOfDirectPay;
                if (!validOfDirectPay) this.appendErrorLog(9999, `9784564534 不支援支付方式：${Config.LangOfTransactionMethod.DirectPay}`);
                break;
        }

        priceOfTotalOfShould = _.sum([priceOfTotalIncludingDiscount, feeOfTransport]); //遠端計算出來的總價

        if (this.isAnonymousUser(session) && !eros.enableOfBoughtWithoutLoginIn) return this.appendErrorLog("未登入，無法完成結帳程序");
        if (this.isAnonymousUser(session) && eros.enableOfBoughtWithoutLoginIn && priceOfTotalOfShould > eros.amountOfAllowAnonymousBuy)
            return this.appendErrorLog(9999, `97845645341 未登入購物上限 ${eros.amountOfAllowAnonymousBuy} 元內（不含運費）`);
        if (priceOfTotalOfShould > eros.amountOfMaximumBuy) return this.appendErrorLog(9999, `97845611232 未登入購物上限 ${eros.amountOfMaximumBuy} 元內（不含運費）`);

        /**  (done) todo:總價驗證(client端計算的結果是否等於remote端的結果，防止Hack機制) */
        if (!_.isEqual(priceOfTotalOfShould, priceOfTotal4Client))
            this.appendErrorLog(
                9999,
                `655345675546 遠端計算總價 (${priceOfTotalOfShould}) 與客戶端提交總價 (${priceOfTotal4Client}) 不符 (Remote total price does not match client total price).`
            );

        /** (done) todo:未登入帳號，價格(percentageOfDiscount*totalPrice)是否超過eros.amountOfAllowAnonymousBuy */
        if (this.isAnonymousUser(session) && priceOfTotalOfShould > eros.amountOfAllowAnonymousBuy)
            this.appendErrorLog(9999, `45645535375 [未登入購物]金額限於 $${eros.amountOfAllowAnonymousBuy} 元內`);

        /** (done) todo:登入帳號，價格(percentageOfDiscount*totalPrice)是否超過eros.amountOfMaximumBuy */
        if (this.isLoginUser(session) && priceOfTotalOfShould > eros.amountOfMaximumBuy)
            this.appendErrorLog(9999, `45645687895 [購物限制] 消費金額必須小於 $${eros.amountOfMaximumBuy} 元內`);

        return { eros, idOfAuthor, containsTransportedVariant, priceOfTotal: priceOfTotalOfShould, feeOfTransport, discountOfTotal };
    };

    processInventoryAndSchedules = async (itemsOfClientOrdering, transaction) => {
        Util.appendInfo(`processInventoryAndSchedules() coming!`);
        for (const itemOfClientOrdering of itemsOfClientOrdering) {
            const { idOfBooze, idOfVariant, quantity } = itemOfClientOrdering;
            const variant = itemOfClientOrdering.variant; //{quantity:商品總量}
            // const variantRef = db.collection(`dionysus/${idOfBooze}/variants`).doc(idOfVariant);
            Util.appendInfo(`processInventoryAndSchedules() coming! => ${_.indexOf(itemsOfClientOrdering, itemOfClientOrdering)} idB='${idOfBooze}', idV='${idOfVariant}'`);

            const variantRef = Api.getVariantItemDocRef(idOfVariant, idOfBooze);

            const quantityOfBalance = (variant.quantity || 0) - quantity;
            if (quantityOfBalance < 0) {
                this.appendErrorLog(9999, `123213453213 ${variant.nameOfBooze}|${variant.content}|數量不足`);
            }

            transaction.update(variantRef, { quantity: quantityOfBalance });

            if (variant.isTaskJob) {
                if (variant.useMainTrunk) {
                    const result = await this.checkConflictAgainst2MainTrunk(variant, transaction);
                    if (result.conflict) {
                        this.appendErrorLog(9999, `112454565412312321 ${variant.nameOfBooze}的時段(${variant.content})衝突`);
                    }
                }
                itemOfClientOrdering.infoOfHera = JSON.stringify({ id: await this.submitHeraSchedule(variant, transaction), idOfAuthor: variant.idOfAuthor });
            } else itemOfClientOrdering.infoOfHera = "";
        }
    };

    createOrderAndHades = async ({
        itemsOfClientOrdering,
        preciseOrderRef,
        idOfAuthor,
        containsTransportedVariant,
        remark,
        address,
        phone,
        name,
        email,
        discountOfTotal,
        feeOfTransport,
        session,
        priceOfTotal,
        typeOfTransport,
        transaction,
        globalPerspective
    }) => {
        Util.appendInfo(`createOrderAndHades() coming!`);
        const preciseOrderData = Api.normalizePreciseOrder({
            /** (done)todo:未登入idOfUser:'', anonymous:true */
            /** (done)todo:運費方式寫進去typeOfTransport */
            anonymous: this.isAnonymousUser(session),
            fingerprint: this.getFingerprint(),
            idOfUser: this.isAnonymousUser(session) ? "" : this.getUid(session),
            textOfContract: this.getTextOfContract({ itemsOfClientOrdering, discountOfTotal, feeOfTransport, priceOfTotal }),
            remark,
            timeOfExpired: Util.getTimeStampWithConditions({ minutes: this.isAnonymousUser(session) ? globalPerspective.ttlOfAnonymous : globalPerspective.ttlOfPayment }),
            timeOfCreate: Util.getCurrentTimeStamp(),
            priceOfTotal,
            imageUrlOfHeadPhoto: _.head(itemsOfClientOrdering)?.photo ?? "",
            items: this.getPreciseItemsAsRecord(itemsOfClientOrdering),
            email: email || "",
            address: address || "",
            distance: "",
            name: name || "",
            phoneNumber: phone || "",
            typeOfTransport,
            feeOfTransport,
            discountOfTotal,
            stateOfTransport: containsTransportedVariant
                ? _.isEqual(typeOfTransport, Config.TransportMethod.SelfPickup)
                    ? Config.StateOfTransport.Needless
                    : Config.StateOfTransport.Pending
                : Config.StateOfTransport.Needless,
            idOfAuthor: idOfAuthor
        });

        transaction.create(preciseOrderRef, preciseOrderData);

        const hadesData = Api.normalizeHade({
            priceOfTotal: priceOfTotal,
            timeOfCreate: Util.getCurrentTimeStamp(),
            paid: false,
            id: preciseOrderRef.id
        });

        Util.appendInfo(`hades data coming!`);

        transaction.create(Api.getHadeItemDocRef(preciseOrderRef.id, idOfAuthor), hadesData);

        /** todo:完成交易後，填寫地址和姓名紀錄在user的欄位(latestName, latestAddress) */
    };

    getPreciseItemsAsRecord(items) {
        return items.map(({ idOfBooze, idOfVariant, quantity, variant, infoOfHera, note }) => ({
            // nameOfBooze, content, price, photo, note,
            idOfPreciseProduct: `${idOfBooze}${Util.getSeparatorOfUnique()}${idOfVariant}`,
            quantity,
            name: `${variant.nameOfBooze}`,
            specific: variant.content,
            price: variant.price,
            infoOfHera,
            imageUrlOfProduct: variant.photo,
            note: note || "無單品項備註內容"
        }));
    }

    getTextOfContract({ itemsOfClientOrdering, discountOfTotal, feeOfTransport, priceOfTotal }) {
        const lines = itemsOfClientOrdering.map((item) => `${item.variant.nameOfBooze}(${item.variant.content}) x ${item.quantity} = ${item.quantity * item.variant.price} 元`);
        if (discountOfTotal < 0) lines.push(`優惠禮金： ${discountOfTotal} 元`);
        if (feeOfTransport > 0) lines.push(`物流費用： ${feeOfTransport} 元`);
        lines.push(`\n合計費用： ${priceOfTotal} 元`);
        return lines.join("\n");
    }

    /** -------------------- async api -------------------- **/
}

export default ModularizedCreateEPayPreciseOrder;
