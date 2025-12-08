const edit = true;

import { exceptioner as ERROR, utiller as Util } from "utiller";
import BaseCheckoutByECPay from "./BaseCheckoutByECPay";
import ECPay from "ecpay_aio_nodejs";
import Api from "../../api";
import Config from "../../config";
import _ from "lodash";
import libpath from "path";

class ModularizedCheckoutByECPay extends BaseCheckoutByECPay {
    constructor(props) {
        super(props);
        this.handlerOfECPay = new ECPay(Config.ecpay);
        Util.setLocaleOfDate("zh-tw");
    }

    async handleHttpOnCall(data, session) {
        this.appendLog(`CheckoutByByECPay帶進來的資訊:`, data);
        /** 訂單編號 */
        const idOfPreciseOrder = data.idOfPreciseOrder;
        await this.validateIdOfDocumentQualify(idOfPreciseOrder, "CheckoutByECPay");
        let itemOfPreciseOrder = await Api.fetchPreciseOrderItem(idOfPreciseOrder);
        await this.validatePreciseOrderIsExist(itemOfPreciseOrder, idOfPreciseOrder, "CheckoutByECPay");
        await this.validateIsUserOfOrder(itemOfPreciseOrder, session, "CheckoutByECPay");
        await this.validateOrderIsUnPaidWaiting(itemOfPreciseOrder, "CheckoutByECPay");

        /** ECPay的訂單編號不能重複：用id建立過訂單無法再次返回相同頁面，必須在產出一筆的preciseOrder，id必須是全新的 */
        if (Util.isOrEquals(itemOfPreciseOrder.procedureOfPayment, Config.LangOfEPayType.ECPay, Config.LangOfEPayType.LinePay)) {
            await Api.deletePreciseOrderItem(itemOfPreciseOrder.id);
            delete itemOfPreciseOrder.id;
            const result = await Api.submitPreciseOrderItem({ ...itemOfPreciseOrder });
            itemOfPreciseOrder = result.value;
        }
        /** -------------------------------------------------------------------------------- **/

        const dataOfECPayOrder = this.getPayloadOfECPayAIORequest(itemOfPreciseOrder);
        this.appendLog(`準備去拿ECPay的result`, dataOfECPayOrder);
        let result = this.handlerOfECPay.payment_client.aio_check_out_all(dataOfECPayOrder);

        result = Util.getStringOfHandledHtml(result, (document) => {
            const element = document.getElementById("CheckMacValue");
            element.setAttribute("value", Util.getECPayCheckMacValue(dataOfECPayOrder, Config.ecpay.MercProfile.HashKey, Config.ecpay.MercProfile.HashIV));
        });

        await Api.updatePreciseOrderItemAtomically(async (order, transaction) => {
            await this.validateOrderIsUnPaidWaiting(order, "CheckoutByECPay");
            return {
                typeOfTransaction: Config.TransactionMethod.ECPay,
                procedureOfPayment: Config.LangOfEPayType.ECPay,
                contentOfRender: result,
                timesOfTransaction: order.timesOfTransaction + 1
            };
        }, itemOfPreciseOrder.id);
        return { textOfRender: result };
    }

    normalizeDescOfItemName(string) {
        const content = Util.formatTextWithEllipsis(Util.replaceAllWithSets(string, { from: `\n\n\n`, to: "#" }, { from: `\n\n`, to: "#" }, { from: `\n`, to: "#" }), 200);
        this.appendLog(content);
        return content;
    }

    /** 消費者點選此按鈕後，會將頁面導回到此設定的網址
     注意事項：
     導回時不會帶付款結果到此網址，只是將頁面導回而已。
     設定此參數，綠界會在付款完成或取號完成頁面上顯示[返回商店]的按鈕。
     設定此參數，發生簡訊 OTP 驗證失敗時，頁面上會顯示[返回商店]的按鈕。
     若未設定此參數，則綠界付款完成頁或取號完成頁面，不會顯示[返回商店]的按鈕。
     若導回網址未使用 https 時，部份瀏覽器可能會出現警告訊息。  */
    getURLOfClientBackURL() {
        return new URL(`epayFootprint/user/completed`, Config.host).href;
    }

    /**
     * @deprecated 用不到
     * 消費者付款完成後，綠界科技會以 Client POST 方式
     * 傳送付款結果並將使用者的畫面轉導到商家指定的頁面
     * 當消費者付款完成後，綠界會將付款結果參數以幕前(Client POST)回傳到該網址。詳細說明請參考付款結果通知 這樣就不會呼叫RETURN URL*/
    getURLOfOrderResultURL() {
        return `必須是post的api`;
    }

    getPayloadOfECPayAIORequest(order) {
        return {
            MerchantTradeNo: order.id, //請帶20碼uid, ex: f0a0d7e9fae1bb72bc93
            MerchantTradeDate: Util.getECPayCurrentTimeFormat(), //ex: 2017/02/13 15:45:30
            TotalAmount: order.priceOfTotal,
            TradeDesc: `綠界第三方支付(${order.titleOfOrder})`,
            ItemName: this.normalizeDescOfItemName(order.textOfContract),
            ReturnURL: Config.urlOfConfirmedByECPay,
            ClientBackURL: this.getURLOfClientBackURL(),
            ExpireDate: 1 /** ATM付款參數:單位是天(day) */,
            PaymentInfoURL: Config.urlOfPaymentInfoByECPay /** 用來讓率介乎叫CVS|ATM關於付款資訊的內容 */,
            EncryptType: 1,
            PaymentType: "aio",
            ChoosePayment: "ALL",
            StoreExpireDate: 1440 /** CVS付款參數:單位是分鐘(minute)，1440代表一天的秒數 */
            // OrderResultURL: this.getURLOfOrderResultURL(),
            // NeedExtraPaidInfo: '1',
            // ChooseSubPayment: 'Credit',
            // ItemURL: 'http://item.test.tw',
            // Remark: '交易備註',
            // HoldTradeAMT: '1',
            // StoreID: '',
            // CustomField1: '',
            // CustomField2: '',
            // CustomField3: '',
            // CustomField4: ''
        };
    }

    getDeDetailOfInvoice() {
        return {
            // RelateNumber: 'PLEASE MODIFY',  //請帶30碼uid ex: SJDFJGH24FJIL97G73653XM0VOMS4K
            // CustomerID: 'MEM_0000001',  //會員編號
            // CustomerIdentifier: '',   //統一編號
            // CustomerName: '測試買家',
            // CustomerAddr: '測試用地址',
            // CustomerPhone: '0123456789',
            // CustomerEmail: 'johndoe@test.com',
            // ClearanceMark: '2',
            // TaxType: '1',
            // CarruerType: '',
            // CarruerNum: '',
            // Donation: '2',
            // LoveCode: '',
            // Print: '1',
            // InvoiceItemName: '測試商品1|測試商品2',
            // InvoiceItemCount: '2|3',
            // InvoiceItemWord: '個|包',
            // InvoiceItemPrice: '35|10',
            // InvoiceItemTaxType: '1|1',
            // InvoiceRemark: '測試商品1的說明|測試商品2的說明',
            // DelayDay: '0',
            // InvType: '07'
        };
    }

    /** -------------------- async api -------------------- **/
}

export default ModularizedCheckoutByECPay;
