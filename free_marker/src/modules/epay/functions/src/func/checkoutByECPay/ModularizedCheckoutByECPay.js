import {exceptioner as ERROR, utiller as Util,} from "utiller";
import BaseCheckoutByECPay from "./BaseCheckoutByECPay";
import ECPay from 'ecpay_aio_nodejs';
import Api from '../../api';
import Config from '../../config';

class ModularizedCheckoutByECPay extends BaseCheckoutByECPay {
    /** -------------------- fields -------------------- **/
    /** -------------------- functions -------------------- **/

    constructor(props) {
        super(props);
        this.handlerOfECPay = new ECPay(Config.ecpay);
        Util.setLocaleOfMoment('zh-tw');
    }

    async handleHttpOnCall(data, session) {
        console.log(`CheckoutByByECPay帶進來的資訊:`, data);
        const idOfPreciseOrder = data.idOfPreciseOrder;
        /** 訂單編號*/
        if (Util.isUndefinedNullEmpty(idOfPreciseOrder)) {
            this.appendErrorLog(9999, `8181231 沒有訂單內容`);
        }

        const detailOfPreciseOrder = await Api.fetchPreciseOrderItem(idOfPreciseOrder);

        this.validatePreciseOrder(detailOfPreciseOrder, true, '598498742')

        const dataOfECPayOrder = this.getPayloadOfECPayAIORequest(detailOfPreciseOrder);
        console.log(`準備去拿ECPay的result`, dataOfECPayOrder);
        let result = this.handlerOfECPay.payment_client.aio_check_out_all(dataOfECPayOrder);

        result = Util.getStringOfHandledHtml(result, (document) => {
            const element = document.getElementById('CheckMacValue');
            element.setAttribute('value', Util.getECPayCheckMacValue(
                dataOfECPayOrder,
                Config.ecpay.MercProfile.HashKey,
                Config.ecpay.MercProfile.HashIV,
            ));
        });

        await Api.updatePreciseOrderItemAtomically((order, transaction) => {
            order.exists = true;
            this.validatePreciseOrder(order, true, '598498742');
                return {
                    procedureOfPayment: Config.TYPE_OF_THIRD_PARTY_ECPAY,
                    contentOfRender: result,
                    timesOfTransaction: order.timesOfTransaction + 1,
                }
            }, detailOfPreciseOrder.id
        )

        return {textOfRender: result};
    }

    normalizeDescOfItemName(string) {
        return Util.replaceAllWithSets(string,
            {from: `\n\n\n`, to: '#'},
            {from: `\n\n`, to: '#'},
            {from: `\n`, to: '#'})
    }

    /**
     * @deprecated
     * 當消費者付款完成後，綠界會將付款結果參數以幕前(Client POST)回傳到該網址。詳細說明請參考付款結果通知 這樣就不會呼叫RETURN URL*/
    getURLOfOrderResultURL() {
        this.appendErrorLog(9999, `4844132132, 應用必須實作 getURLOfOrderResultURL()`);
    }

    /** 消費者點選此按鈕後，會將頁面導回到此設定的網址
     注意事項：
     導回時不會帶付款結果到此網址，只是將頁面導回而已。
     設定此參數，綠界會在付款完成或取號完成頁面上顯示[返回商店]的按鈕。
     設定此參數，發生簡訊 OTP 驗證失敗時，頁面上會顯示[返回商店]的按鈕。
     若未設定此參數，則綠界付款完成頁或取號完成頁面，不會顯示[返回商店]的按鈕。
     若導回網址未使用 https 時，部份瀏覽器可能會出現警告訊息。  */
    getURLOfClientBackURL() {
        this.appendErrorLog(9999, `8787444512, 應用必須設定 getURLOfClientBackURL()`);
    }

    getPayloadOfECPayAIORequest(order) {
        return {
            MerchantTradeNo: order.id, //請帶20碼uid, ex: f0a0d7e9fae1bb72bc93
            MerchantTradeDate: Util.getECPayCurrentTimeFormat(), //ex: 2017/02/13 15:45:30
            TotalAmount: `${order.priceOfTotal}`,
            TradeDesc: `綠界第三方支付(${order.titleOfOrder})`,
            ItemName: this.normalizeDescOfItemName(order.textOfContract),
            ReturnURL: Config.urlOfConfirmedByECPay,
            ClientBackURL: this.getURLOfClientBackURL(),
            ExpireDate: 1,
            PaymentInfoURL: Config.urlOfPaymentInfoByECPay,
            StoreExpireDate: 1440,/** 代表一天的秒數 */
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
