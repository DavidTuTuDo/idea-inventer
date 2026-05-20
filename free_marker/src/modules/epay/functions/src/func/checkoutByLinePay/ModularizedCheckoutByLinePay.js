const edit = true;

import _ from "lodash";
import BaseCheckoutByLinePay from "./BaseCheckoutByLinePay";
import Api from "../../api";
import Config from "../../config";

const MAP_OF_CODE_MESSAGE_FROM_REQUEST_RESULT = {
    "0000": "成功",
    1104: "此商家不存在",
    1105: "此商家無法使用LINE Pay",
    1106: "標頭(Header)資訊錯誤",
    1124: "金額有誤（scale）",
    1145: "正在進行付款",
    1172: "該訂單編號(orderId)的交易記錄已經存在",
    1178: "商家不支援該貨幣",
    1183: "付款金額不能小於 0",
    1194: "此商家無法使用自動付款",
    2101: "參數錯誤",
    2102: "JSON資料格式錯誤",
    9000: "內部錯誤"
};

/**
 * returnCode                       String    4      結果代碼
 * returnMessage                    String    300    結果訊息
 * info.transactionId               Number    19     交易序號
 * info.paymentAccessToken          String    12     該代碼在LINE Pay可以代替掃描器使用
 * info.paymentUrl.app              String    300    用來跳轉到付款頁的App URL
 在應用程式發起付款請求時使用
 在從商家應用跳轉到LINE Pay時使用
 * info.paymentUrl.web              String    300    用來跳轉到付款頁的Web URL
 在網頁請求付款時使用
 在跳轉到LINE Pay等待付款頁時使用
 不經參數，直接跳轉到傳來的URL
 在Desktop版，彈窗大小為Width：700px，Height：546px
 *
 */

class ModularizedCheckoutByLinePay extends BaseCheckoutByLinePay {
    constructor(props) {
        super(props);
    }

    /** 目前只支援一個package => _.size(packages) === 1*/
    getPayloadOfLinePayRequest(itemOfPreciseOrder, nameOfBrand) {
        function getNameOfProduct() {
            const items = itemOfPreciseOrder.items;
            if (_.size(items) === 1) return items[0].name;

            if (_.size(items) === 2) return items.map((item) => item.name).join(` 以及 `);

            if (_.size(items) > 2) return `${items[0].name} 以及 ${_.size(items) - 1} 項商品`;
        }

        function getListOfProduct() {
            const items = itemOfPreciseOrder.items;
            const latest = items.map((item) => {
                const specific = item.specific ? (Util.isEqual(item.name, item.specific) ? "" : `(${item.specific})`) : "";
                return {
                    name: `${item.name}${specific}`,
                    quantity: item.quantity,
                    price: item.price,
                    imageUrl: item.imageUrlOfProduct
                };
            });
            if (itemOfPreciseOrder.feeOfTransport > 0) latest.push({ name: `物流費用`, price: itemOfPreciseOrder.feeOfTransport, quantity: 1 });

            if (itemOfPreciseOrder.discountOfTotal < 0) latest.push({ name: `優惠禮金`, price: itemOfPreciseOrder.discountOfTotal, quantity: 1 });

            return latest;
        }

        return {
            amount: itemOfPreciseOrder.priceOfTotal,
            currency: itemOfPreciseOrder.typeOfCurrency,
            orderId: itemOfPreciseOrder.id,
            packages: [
                {
                    id: itemOfPreciseOrder.id,
                    amount: itemOfPreciseOrder.priceOfTotal,
                    name: getNameOfProduct(),
                    products: getListOfProduct()
                }
            ],
            redirectUrls: {
                confirmUrl: new URL("respondtowardlinepay", Config.host).href,
                cancelUrl: itemOfPreciseOrder.anonymous ? new URL(`anonymousXDeal/${itemOfPreciseOrder.id}`, Config.host).href : new URL("epayFootprint/user/all", Config.host).href
            },
            options: {
                extra: {
                    branchName: nameOfBrand
                },
                display: {
                    locale: "zh_TW"
                }
            }
        };
    }

    async handleHttpOnCall(data, session) {
        this.appendLog(`CheckoutByByLinepay帶進來的資訊:`, data);
        /** 訂單編號 */
        const idOfPreciseOrder = data.idOfPreciseOrder;
        await this.validateIdOfDocumentQualify(idOfPreciseOrder);
        let itemOfPreciseOrder = await Api.fetchPreciseOrderItem(idOfPreciseOrder);
        const linepay = await this.linepayO(itemOfPreciseOrder.idOfAuthor);
        await this.validatePreciseOrderIsExist(itemOfPreciseOrder, idOfPreciseOrder);
        /** await this.validateIsUserOfOrder(itemOfPreciseOrder, session); 這句會擋住anonymous user購買 */
        await this.validateOrderIsUnPaidWaiting(itemOfPreciseOrder);
        const info = await Api.fetchGlobalPerspective();
        const payloadOfLinePay = this.getPayloadOfLinePayRequest(itemOfPreciseOrder, info.nameOfBrand);
        const resultOfLinePayRequest = await linepay.request(payloadOfLinePay);
        if (Util.isEqual(resultOfLinePayRequest.returnCode, "0000")) {
            await Api.updatePreciseOrderItemAtomically(async (latestItem, transaction) => {
                await this.validateOrderIsUnPaidWaiting(latestItem, true);
                return {
                    typeOfTransaction: Config.TransactionMethod.LinePay,
                    procedureOfPayment: Config.LangOfEPayType.LinePay,
                    stateOfPayment: Config.StateOfPayment.Waiting,
                    idOfThirdPartyTradeNo: resultOfLinePayRequest.info.transactionId,
                    infoOfPayment: resultOfLinePayRequest.info.paymentAccessToken,
                    contentOfRender: `${JSON.stringify(resultOfLinePayRequest.info.paymentUrl)}`,
                    timesOfTransaction: latestItem.timesOfTransaction + 1
                };
            }, itemOfPreciseOrder.id);
            return {
                app: resultOfLinePayRequest.info.paymentUrl.app,
                web: resultOfLinePayRequest.info.paymentUrl.web
            };
        } else {
            this.appendErrorLog(9999, `4541214474 LinePay申請線上付款發生錯誤(${MAP_OF_CODE_MESSAGE_FROM_REQUEST_RESULT[resultOfLinePayRequest.returnCode]})`);
        }
    }

    /** -------------------- async api -------------------- **/
}

export default ModularizedCheckoutByLinePay;
