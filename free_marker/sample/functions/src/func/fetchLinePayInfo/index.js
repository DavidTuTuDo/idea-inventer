import {
    utiller as Util,
    exceptioner as ERROR,
    pooller as InfinitePool,
} from "utiller";
import _ from "lodash";
import libpath from "path";
import {linepayer as LinePay} from "linepayer";
import BaseFetchLinePayInfo from "./BaseFetchLinePayInfo";
import Api from '../../api';
import Config from '../../config';


class FetchLinePayInfo extends BaseFetchLinePayInfo {
    /** -------------------- fields -------------------- **/
    /** -------------------- functions -------------------- **/

    constructor(props) {
        super(props);
        this.linePayerRef = new LinePay(Config.linepay)
    }

    getLinePayFormOfOrder(orderId, price, productName, imageUrl, host = Config.host) {
        const order = {
            amount: price,
            currency: 'TWD',
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
                            imageUrl: imageUrl,
                        }
                    ]
                }
            ],
            redirectUrls: {
                confirmUrl: libpath.join(host, 'purchaseSucceed'),
                cancelUrl: libpath.join(host, 'purchaseFail'),
            }
        };
        return order;
    }

    async handleHttpOnCall(data, context) {

        if (data.pid && this.isLoginUser(context)) {
            const plan = await Api.fetchPurchasePlanItem(data.pid);
            if (plan) {
                const uid = this.getUid(context);
                const result = await Api.submitPurchaseOrderItem({uid, productInfos: [{pid: plan.id, quantity: 1}]})
                const orderId = result.value.id;
                const orderObj = this.getLinePayFormOfOrder(orderId, plan.price, plan.fullName, plan.imageUrl);
                const linePayResult = await this.linePayerRef.request(orderObj);
                if (_.isEqual(linePayResult.returnCode, '0000')) {
                    const updateContent = {};
                    updateContent.status = 'waiting';
                    updateContent.transactionId = linePayResult.info.transactionId;
                    updateContent.paymentAccessToken = linePayResult.info.paymentAccessToken;
                    updateContent.price = plan.price;
                    updateContent.duration = plan.duration;
                    await Api.updatePurchaseOrderItem(orderId, updateContent);
                    return {paymentUrl: linePayResult.info.paymentUrl.web};
                }
            }
        }
        throw new Error('7211245,請不要玩弄API,開發者很辛苦');
    }

    /** -------------------- async api -------------------- **/
}

export default new FetchLinePayInfo();
