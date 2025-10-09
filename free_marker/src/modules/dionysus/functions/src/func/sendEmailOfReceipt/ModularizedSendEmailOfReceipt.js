const edit = true;

import { utiller as Util, exceptioner as ERROR, pooller as InfinitePool } from "utiller";
import _ from "lodash";
import BaseSendEmailOfReceipt from "./BaseSendEmailOfReceipt";
import Api from "../../api";
import FirebaseHelper from "../../base/FirebaseHelper";
import Config from "../../config";

class ModularizedSendEmailOfReceipt extends BaseSendEmailOfReceipt {
    constructor(props) {
        super(props);
    }

    /** 每個企業不同 */
    getTransportSupplies() {
        return [];
    }

    /** 有些店家自己商品有序號 */
    shouldDisplaySerialNumber() {
        return false;
    }

    /** 有些店家有抓貨順序，排序上需要根據某些規則 */
    customizeOrder = (items) => {
        /** mutated items */
    };

    /**
     * 產生訂單明細 HTML
     * @param {Object} param - 收據資料
     * @returns {string} HTML 字串
     */
    getHtmlOfReceipt = ({ id, items, address, phoneNumber, priceOfTotal, remark, name, procedureOfPayment, timeOfCreate, timeOfPayment, feeOfTransport }) => {
        const safeEscape = (val) => _.escape(val ?? "");

        // 商品清單
        let itemsHtml = "";
        this.customizeOrder(items);
        if (!_.isEmpty(items)) {
            itemsHtml = items
                .map(({ imageUrlOfProduct, name, specific, idOfPreciseProduct, quantity, note }, index) => {
                    const parts = [];
                    const serial = idOfPreciseProduct.split(Util.getSeparatorOfUnique()).shift();

                    if (!_.isEmpty(imageUrlOfProduct)) {
                        parts.push(`<img src="${imageUrlOfProduct}" alt="商品圖片" width="120" style="margin: 4px 0; display: block;" />`);
                    }
                    if (!_.isEmpty(name)) {
                        parts.push(`<p style="margin: 4px 0;"><strong>${index + 1}. ${safeEscape(name)}</strong></p>`);
                    }
                    if (this.shouldDisplaySerialNumber() && !_.isEmpty(serial)) {
                        parts.push(`<p style="margin: 4px 0;">編號：${safeEscape(serial)}</p>`);
                    }
                    if (!_.isEmpty(specific)) {
                        parts.push(`<p style="margin: 4px 0;">選項：${safeEscape(specific)}</p>`);
                    }
                    if (!_.isNil(quantity)) {
                        parts.push(`<p style="margin: 4px 0;">數量：${quantity}</p>`);
                    }
                    if (!_.isEmpty(note)) {
                        parts.push(`<p style="margin: 4px 0;">備註：${safeEscape(note)}</p>`);
                    }

                    return `<div style="margin-bottom: 12px;">${parts.join("")}</div>`;
                })
                .join("");
        }

        // 訂單基本資料
        const orderInfo = [];
        if (!_.isEmpty(id)) {
            orderInfo.push(`<tr><td style="padding: 2px 6px;"><strong>訂單編號:</strong></td><td style="padding: 2px 6px;">#${safeEscape(id)}</td></tr>`);
        }
        if (!_.isEmpty(timeOfCreate)) {
            orderInfo.push(
                `<tr><td style="padding: 2px 6px;"><strong>訂單日期:</strong></td><td style="padding: 2px 6px;">${safeEscape(this.getTWTimeOfFireTS(timeOfCreate))}</td></tr>`
            );
        }

        // 價格區段
        const priceSection = [];
        if (!_.isEmpty(feeOfTransport)) {
            priceSection.push(`<tr><td style="padding: 2px 6px;"><strong>物流費用:</strong></td><td style="padding: 2px 6px;">NT$ ${safeEscape(feeOfTransport)}</td></tr>`);
        }
        if (!_.isEmpty(priceOfTotal)) {
            priceSection.push(`<tr><td style="padding: 2px 6px;"><strong>總金額:</strong></td><td style="padding: 2px 6px;">NT$ ${safeEscape(priceOfTotal)}</td></tr>`);
        }

        // 出貨資訊
        const shippingInfo = [];
        if (!_.isEmpty(name)) shippingInfo.push(`<p style="margin: 4px 0;">收件人：${safeEscape(name)}</p>`);
        if (!_.isEmpty(phoneNumber)) shippingInfo.push(`<p style="margin: 4px 0;">聯絡電話：${safeEscape(phoneNumber)}</p>`);
        if (!_.isEmpty(address)) shippingInfo.push(`<p style="margin: 4px 0;">寄送地址：${safeEscape(address)}</p>`);

        // 付款資訊
        const paymentInfo = [];
        if (!_.isEmpty(procedureOfPayment))
            paymentInfo.push(`<p style="margin: 4px 0;">付款方式：${safeEscape(_.isEqual(procedureOfPayment, "AuthorForcePaid") ? "買家已確認" : procedureOfPayment)}</p>`);
        if (!_.isEmpty(timeOfPayment)) paymentInfo.push(`<p style="margin: 4px 0;">付款日期：${safeEscape(this.getTWTimeOfFireTS(timeOfPayment))}</p>`);
        if (!_.isEmpty(priceOfTotal)) paymentInfo.push(`<p style="margin: 4px 0;">付款金額：NT$ ${safeEscape(priceOfTotal)}</p>`);

        return `
  <div style="font-family: Arial, sans-serif; color: #000; font-size: 14px; line-height: 1.4;">
    <p style="margin: 4px 0;">您好，</p>
    ${!_.isEmpty(id) ? `<p style="margin: 4px 0;">訂單 <a href="#" style="color: #3366cc;">#${safeEscape(id)}</a> 的付款已確認。我們已通知賣家準備後續事宜。</p>` : ""}
    <hr style="margin: 8px 0;" />

    <h3 style="margin: 8px 0 4px;">訂單明細</h3>
    ${orderInfo.length > 0 ? `<table style="border-collapse: collapse;">${orderInfo.join("")}</table>` : ""}

    ${!_.isEmpty(itemsHtml) ? `<hr style="margin: 8px 0;" />${itemsHtml}<hr style="margin: 8px 0;" />` : ""}

    ${priceSection.length > 0 ? `<table style="border-collapse: collapse;">${priceSection.join("")}</table><hr style="margin: 8px 0;" />` : ""}

    ${shippingInfo.length > 0 ? `<h4 style="margin: 8px 0 4px;">出貨資訊</h4>${shippingInfo.join("")}<hr style="margin: 8px 0;" />` : ""}

    ${paymentInfo.length > 0 ? `<h4 style="margin: 8px 0 4px;">付款資訊</h4>${paymentInfo.join("")}` : ""}

    ${!_.isEmpty(remark) ? `<hr style="margin: 8px 0;" /><h4 style="margin: 8px 0 4px;">備註</h4><p style="margin: 4px 0;">${safeEscape(remark)}</p>` : ""}
  </div>
  `;
    };

    async handleHttpOnCall(data, session) {
        const idOfPreciseOrder = data.idOfPreciseOrder;

        const order = await Api.fetchPreciseOrderItem(idOfPreciseOrder);
        const { id, email } = order;

        if (Util.isUndefinedNullEmpty(email)) {
            this.appendErrorLog(9999, `4564655-SendEmailOfReceipt 客戶未提供Email，無法送出Email，訂單編號：${id}`);
            return;
        }
        const global = await Api.fetchGlobalPerspective();
        this.appendLog(`${idOfPreciseOrder} 準備發送Email給賣家｜買家`);

        [true, false].forEach((isBuyer) => this.sendEmailTo({ nameOfBrand: global.nameOfBrand, isBuyer, ...order }));
        /** 非買家既為賣家 */
    }

    sendEmailTo({ nameOfBrand, isBuyer, email, ...order }) {
        const recipient = isBuyer ? email : Config.email;
        const subject = isBuyer ? `[${nameOfBrand}]您的款項已確認` : `[${nameOfBrand}]您有新的成交訂單`;

        FirebaseHelper.firestore()
            .collection("mail")
            .add({
                to: recipient,
                message: {
                    subject,
                    html: this.getHtmlOfReceipt(order)
                }
            })
            .then(() => this.appendLog("Queued email for delivery!"));
    }
}

export default ModularizedSendEmailOfReceipt;
