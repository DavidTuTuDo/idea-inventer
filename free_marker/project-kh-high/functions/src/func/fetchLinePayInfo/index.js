import { utiller as Util, exceptioner as ERROR, pooller as InfinitePool } from "utiller";
import _ from "lodash";
import libpath from "path";
import { linepayer as LinePay } from "linepayer";
import BaseFetchLinePayInfo from "./BaseFetchLinePayInfo";
import Api from "../../api";
import Config from "../../config";

const ResultCodeOfLinePay = {
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

class FetchLinePayInfo extends BaseFetchLinePayInfo {
    /** -------------------- fields -------------------- **/
    /** -------------------- functions -------------------- **/

    constructor(props) {
        super(props);
        this.linePayerRef = new LinePay(Config.linepay);
    }

    getLinePayFormOfOrder(orderId, price, productName, imageUrl, host = Config.host) {
        const order = {
            amount: price,
            currency: "TWD",
            orderId: orderId,
            packages: [
                {
                    id: orderId,
                    amount: price,
                    name: productName,
                    products: [
                        {
                            name: productName,
                            quantity: 1,
                            price: price,
                            imageUrl: imageUrl
                        }
                    ]
                }
            ],
            redirectUrls: {
                confirmUrl: libpath.join(host, "purchaseSucceed"),
                cancelUrl: libpath.join(host, "purchaseFail")
            }
        };
        return order;
    }

    async handleHttpOnCall(data, context) {
        if (data.pid && this.isLoginUser(context)) {
            const plan = await Api.fetchPurchasePlanItem(data.pid);
            const isMobile = data.isMobile;

            if (plan) {
                const uid = this.getUid(context);
                const result = await Api.submitPurchaseOrderItem({ uid, productInfos: [{ pid: plan.id, quantity: 1 }] });
                const orderId = result.value.id;
                const orderObj = this.getLinePayFormOfOrder(orderId, plan.price, plan.fullName, plan.imageUrl);
                this.appendLog("redirectUrls", orderObj.redirectUrls);
                const linePayResult = await this.linePayerRef.request(orderObj);
                if (_.isEqual(linePayResult.returnCode, "0000")) {
                    const updateContent = {};
                    updateContent.status = "waiting";
                    updateContent.transactionId = linePayResult.info.transactionId;
                    updateContent.paymentAccessToken = linePayResult.info.paymentAccessToken;
                    updateContent.price = plan.price;
                    updateContent.duration = plan.duration;
                    await Api.updatePurchaseOrderItem(orderId, updateContent);
                    return { paymentUrl: linePayResult.info.paymentUrl.web };
                }
            }
        }
        throw new Error("7211245,請不要玩弄API,開發者很辛苦");
    }

    /** -------------------- async api -------------------- **/
}

export default new FetchLinePayInfo();
