import {exceptioner as ERROR, utiller as Util,} from "utiller";
import BaseCheckoutByByECPay from "./BaseCheckoutByByECPay";
import ECPay from 'ecpay_aio_nodejs';
import Api from '../../api';
import config from '../../config';

class ModularizedCheckoutByByECPay extends BaseCheckoutByByECPay {
    /** -------------------- fields -------------------- **/
    /** -------------------- functions -------------------- **/

    constructor(props) {
        super(props);
        this.handlerOfECPay = new ECPay(config.ecpay);
    }

    async handleHttpOnCall(data, session) {
        const idOfPreciseOrder = data.idOfPreciseOrder ?? 'Bq5lSfszDiSsmEa42kw0'
        /** 訂單編號*/
        const detailOfPreciseOrder = await Api.fetchPreciseOrderItem(idOfPreciseOrder);
        if (detailOfPreciseOrder.exists) {
            console.log(`準備好detailOfPreciseOrder`)
            console.log(detailOfPreciseOrder);
            console.log(`\n\n`);
            console.log(`準備去拿ECPay的result`, this.getDetailOfOrder(detailOfPreciseOrder));
            const result = this.handlerOfECPay.payment_client.aio_check_out_all(this.getDetailOfOrder(detailOfPreciseOrder));
            console.log(result);
            return result;
        } else {
            throw new ERROR(9999, `訂單內容不存在${data.idOfPreciseOrder}`)
        }
    }

    normalizeDescOfItemName(string) {
        return Util.replaceAllWithSets(string,
            {from: `\n\n\n`, to: '#'},
            {from: `\n\n`, to: '#'},
            {from: `\n`, to: '#'})
    }

    getDetailOfOrder(order) {
        return {
            MerchantTradeNo: order.id, //請帶20碼uid, ex: f0a0d7e9fae1bb72bc93
            MerchantTradeDate: Util.getECPayCurrentTimeFormat(), //ex: 2017/02/13 15:45:30
            TotalAmount: `${order.priceOfTotal}`,
            TradeDesc: `線上交易(訂單編號:${order.id})`,
            ItemName: this.normalizeDescOfItemName(order.textOfContract),
            ReturnURL: 'http://192.168.0.1',
            // ChooseSubPayment: 'Credit',
            // OrderResultURL: 'http://192.168.0.1/payment_result',
            // NeedExtraPaidInfo: '1',
            // ClientBackURL: 'https://www.google.com',
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

export default ModularizedCheckoutByByECPay;
