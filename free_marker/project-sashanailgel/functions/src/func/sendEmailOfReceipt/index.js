const edit = true;
import BaseSendEmailOfReceipt from "./BaseSendEmailOfReceipt";
import {utiller as Util, exceptioner as ERROR, pooller as InfinitePool} from "utiller";
import _ from "lodash";
import libpath from "path";
import FirebaseHelper from "../../base/FirebaseHelper";
import Api from '../../api';

const TRANSPORT_SUPPLIES = [
    {
        id: '111',
        typeOfTransport: 1,
        freeOfThreshold: 999,
        name: `Line Pay(Money轉帳)`,
        price: 60,
        description: `滿 999 元免運、高雄市隔日到`,
    }, {
        id: '222',
        typeOfTransport: 2,
        freeOfThreshold: 999,
        name: `Line Pay(Line Point折抵)`,
        price: 60,
        description: `滿 999 元免運、高雄市隔日到`,
        notice: `需要註冊為Line Pay商家，參考`
    }, {
        id: '333',
        typeOfTransport: 3,
        freeOfThreshold: 1200,
        price: 60,
        name: `信用卡付款`,
        description: `滿 999 元免運、高雄市隔日到`,
        available: false
    }, {
        id: '444',
        typeOfTransport: 4,
        freeOfThreshold: 999,
        price: 60,
        name: `7-11 取貨`,
        description: `滿 999 元免運`,
        available: false

    }, {
        id: '555',
        typeOfTransport: 5,
        freeOfThreshold: 1200,
        price: 60,
        name: `7-11 取貨付款`,
        description: `滿 999 元免運`,
        available: false
    }, {
        id: '666',
        typeOfTransport: 6,
        freeOfThreshold: 1200,
        price: 60,
        name: `ATM轉帳付款`,
        description: `滿 999 元免運、高雄市隔日到`,
        available: false
    }, {
        id: '777',
        typeOfTransport: 7,
        price: 200,
        freeOfThreshold: 1599,
        name: `宅配(宅急便)`,
        description: `滿 1599 元免運`,
        available: false
    }, {
        id: '888',
        typeOfTransport: 8,
        price: 200,
        freeOfThreshold: 2000,
        name: `宅配(貨到付款)`,
        description: `滿 2000 元免運、高雄市隔日到`,
    }, {
        id: '999',
        typeOfTransport: 9,
        freeOfThreshold: 1,
        price: 0,
        name: `現金(店面取貨，協助保留) `,
        description: `12/12 會員日全館9折優惠`,
    }
]

class SendEmailOfReceipt extends BaseSendEmailOfReceipt {
    /** -------------------- fields -------------------- **/

    /** -------------------- functions -------------------- **/

    constructor(props) {
        super(props);
    }

    async handleHttpOnCall(data, session) {
        const idOfSavior = data.idOfSavior;
        const savior = await Api.fetchSaviorItem(idOfSavior);
        const email = savior.email;
        const content = savior.content;
        const phone = savior.phone;
        const name = savior.name;
        const address = savior.address;
        const remark = savior.remark;
        const price = Util.formatPrice(savior.price);
        const valueOfPayment = savior.valueOfPayment;
        const transport = _.find(TRANSPORT_SUPPLIES,(transport) => _.isEqual(_.toNumber(transport.typeOfTransport),_.toNumber(valueOfPayment)))

        const bodyOfHtml = [];
        bodyOfHtml.push(`訂單編號：${idOfSavior}`);
        bodyOfHtml.push(`收件姓名：${name}`);
        bodyOfHtml.push(`訂單金額：${price} 元`)
        bodyOfHtml.push(`寄送地址：${address}`);
        bodyOfHtml.push(`聯絡電話：${phone}`);
        bodyOfHtml.push(`備註資訊：${remark}`);
        if(Util.isOrEquals(transport.typeOfTransport,1,2))
          bodyOfHtml.push(`付款連結：<a href=https://qrcodepay.line.me/qr/payment/iFsB9G7fTZEsOlsfpbt7AHvoRNDYK8iQVFqvm8JzSbMwEaWWTqKgVir%252Ffuj9yoCp>Line Pay轉帳</a>`);
        else bodyOfHtml.push(`付款方式：${transport.name}`);
        bodyOfHtml.push(`<br>訂購商品如下：<br>${content.replace(/\n/g, '<br>')}`);


        FirebaseHelper.firestore().collection('mail').add({
            to: `${email}`,
            message: {
                subject: `莎夏美學訂購資訊（${name}）已完成`,
                // text: "This is the plaintext section of the email body.",
                text: "莎夏美學訂購單",
                // html: "This is the <code>HTML</code> section of the email body.",
                html: bodyOfHtml.join('<br>'),
            },
        }).then(() => console.log("Queued email for delivery!"));

    }

    /** -------------------- async api -------------------- **/
}

export default new SendEmailOfReceipt();
