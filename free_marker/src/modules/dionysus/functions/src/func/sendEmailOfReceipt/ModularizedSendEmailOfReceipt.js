const edit = true;

import {utiller as Util, exceptioner as ERROR, pooller as InfinitePool} from "utiller";
import _ from "lodash";
import libpath from "path";
import BaseSendEmailOfReceipt from "./BaseSendEmailOfReceipt";
import Api from "../../api";
import FirebaseHelper from "../../base/FirebaseHelper";



class ModularizedSendEmailOfReceipt extends BaseSendEmailOfReceipt {
    constructor(props) {
        super(props);
    }

    /** 每個企業不同 */
    getTransportSupplies() {
        return [];
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
        const transport = _.find(this.getTransportSupplies(), (transport) => _.isEqual(_.toNumber(transport.typeOfTransport), _.toNumber(valueOfPayment)))

        const bodyOfHtml = [];
        bodyOfHtml.push(`訂單編號：${idOfSavior}`);
        bodyOfHtml.push(`收件姓名：${name}`);
        bodyOfHtml.push(`訂單金額：${price} 元`)
        bodyOfHtml.push(`寄送地址：${address}`);
        bodyOfHtml.push(`聯絡電話：${phone}`);
        bodyOfHtml.push(`備註資訊：${remark}`);
        if (Util.isOrEquals(transport.typeOfTransport, 1, 2))
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
}

export default ModularizedSendEmailOfReceipt;
