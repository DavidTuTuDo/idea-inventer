const edit = true;

import _ from "lodash";
import libpath from "path";
import BaseCheckoutByLinePay from "./BaseCheckoutByLinePay";
import Api from "../../api";
import Config from "../../config";
import { linepayer as LinePay } from "linepayer";

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
    /** -------------------- fields -------------------- **/
    /** -------------------- functions -------------------- **/

    constructor(props) {
        super(props);
        this.linePayerRef = new LinePay(Config.linepay);
    }

    /** 目前只支援一個package => _.size(packages) === 1*/
    getPayloadOfLinePayRequest(itemOfPreciseOrder) {
        function getNameOfProduct() {
            const items = itemOfPreciseOrder.items;
            if (_.size(items) === 1) return items[0].name;

            if (_.size(items) === 2) return items.map((item) => item.name).join(` 以及 `);

            if (_.size(items) > 2) return `${items[0].name} 以及 ${_.size(items) - 1} 項商品`;
        }

        function getListOfProduct() {
            const items = itemOfPreciseOrder.items;
            return items.map((item) => {
                return {
                    name: item.name,
                    quantity: item.quantity,
                    price: item.price,
                    imageUrl: item.imageUrlOfProduct
                };
            });
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
                cancelUrl: new URL("epayFootprint/all", Config.host).href
            },
            options: {
                extra: {
                    branchName: this.getBranchName()
                },
                display: {
                    locale: "zh_TW"
                }
            }
        };
    }

    /** 店家名稱 */
    getBranchName() {
        this.appendErrorLog(9999, `58641845 必須在index.js實作getBranchName()`);
    }

    async handleHttpOnCall(data, session) {
        const self = this;
        const idOfPreciseOrder = data.idOfPreciseOrder;
        const itemOfPreciseOrder = await Api.fetchPreciseOrderItem(idOfPreciseOrder);
        this.validatePreciseOrder(itemOfPreciseOrder, true, "45421321");
        const payloadOfLinePay = this.getPayloadOfLinePayRequest(itemOfPreciseOrder);
        const resultOfLinePayRequest = await this.linePayerRef.request(payloadOfLinePay);
        if (_.isEqual(resultOfLinePayRequest.returnCode, "0000")) {
            await Api.updatePreciseOrderItemAtomically((latestItem, transaction) => {
                self.validatePreciseOrder(latestItem, true, "15544713");
                return {
                    procedureOfPayment: Config.TYPE_OF_THIRD_PARTY_LINEPAY,
                    stateOfPayment: 3, //"waiting",
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
