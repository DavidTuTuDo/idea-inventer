const edit = true;

import { utiller as Util, exceptioner as ERROR, pooller as InfinitePool } from "utiller";
import _ from "lodash";
import libpath from "path";
import BaseConfirmLinePayInfo from "./BaseConfirmLinePayInfo";
import Api from "../../api";
import { linepayer as LinePay } from "linepayer";
import firebase from "../../base/CommonFirebaseHelper";
import Config from "../../config";
import dayjs from "dayjs";

/**
 * 確認 Line Pay 交易資訊並處理訂單狀態與效期計算。
 * 繼承自 BaseConfirmLinePayInfo，封裝了交易確認邏輯與 Firebase 寫入。
 */
class ConfirmLinePayInfo extends BaseConfirmLinePayInfo {
    /** -------------------- fields -------------------- **/
    /** -------------------- functions -------------------- **/

    constructor(props) {
        super(props);
        /** LinePay SDK 實例化 */
        this.linePayerRef = new LinePay(Config.linepay);
    }

    /**
     * Firebase Cloud Functions 或伺服器端的交易確認 Hook。
     * @param {Object} data - 客戶端傳入的資料。
     * @param {string} data.orderId - 訂單 ID。
     * @param {string} data.transactionId - Line Pay 交易 ID。
     * @param {Object} context - Functions 執行上下文。
     * @returns {Promise<{message: string}>}
     * @throws {Error} 當訂單不存在、狀態不符或參數缺失時拋出錯誤。
     */
    async handleHttpOnCall(data, context) {
        if (data.orderId) {
            const updateContent = {};
            this.appendLog(data);
            const orderId = data.orderId;
            const transactionId = data.transactionId;

            // 從數據庫獲取訂單內容
            const orderObject = await Api.fetchPurchaseOrderItem(orderId);

            this.appendLog("orderObject ===> ", orderObject);

            if (!orderObject.exists) {
                throw new Error(`交易${orderId} 不存在`);
            }

            /**
             * 檢查訂單狀態。
             * 若狀態已為 succeed 或 fail，代表訂單已處理過，不可重複執行 confirm。
             */
            if (Util.isOrEquals(orderObject.status, "succeed", "fail")) {
                throw new Error("交易已過期");
            }

            try {
                // 向 Line Pay 請求確認交易
                const confirmContent = {
                    amount: orderObject.price,
                    currency: "TWD"
                };
                const linePayResult = await this.linePayerRef.confirm(confirmContent, transactionId);
                Util.appendInfo(confirmContent);

                /**
                 * 計算訂單到期效期。
                 * 1. 解析 duration 字串（例如 "30d" -> 30）。
                 * 2. 取得 Firebase 伺服器當前時間戳。
                 * 3. 使用 dayjs 計算結束時間。
                 */
                const days = _.toNumber(Util.getNormalizedStringNotEndWith(orderObject.duration, "d"));

                // startTime 通常是一個 Firebase Timestamp 對象
                const startTime = await firebase.getCurrentServerTimeStamp();

                // 計算 endTime
                // dayjs() 傳入毫秒數，接著使用 add 增加天數，最後轉為毫秒數
                const endTimeMillis = dayjs(startTime.toMillis()).add(days, "days").valueOf();
                const endTime = firebase.getTimeStampObj(endTimeMillis);

                // 更新產品訂閱/購買項目
                await Api.submitPurchaseProductItem(orderObject.uid, {
                    orderId,
                    expiration: {
                        startTime,
                        endTime
                    }
                });

                updateContent.status = "succeed";
                updateContent.transactionId = linePayResult.info.transactionId;
            } catch (error) {
                // 交易失敗處理
                Util.appendError(error);
                updateContent.status = "fail";
                updateContent.message = error.message;
            } finally {
                // 無論成功失敗，更新訂單主體狀態
                await Api.updatePurchaseOrderItem(orderId, updateContent);
            }
            return { message: "交易成功" };
        }
        throw new Error("7211246,請不要玩弄API,開發者很辛苦");
    }
}

export default new ConfirmLinePayInfo();
