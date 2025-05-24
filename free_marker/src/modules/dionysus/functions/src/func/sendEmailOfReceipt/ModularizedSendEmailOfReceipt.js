const edit = true;

import { utiller as Util, exceptioner as ERROR, pooller as InfinitePool } from "utiller";
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



    /**
     * 產生訂單明細 HTML
     * @param {Object} param - 收據資料
     * @returns {string} HTML 字串
     */
    getHtmlOfReceipt = ({
                            id,
                            items,
                            address,
                            phoneNumber,
                            priceOfTotal,
                            remark,
                            name,
                            procedureOfPayment,
                            timeOfCreate,
                            timeOfPayment,
                            feeOfTransport
                        }) => {
        const safeEscape = (val) => _.escape(val ?? '');

        // 商品清單
        let itemsHtml = '';
        if (!_.isEmpty(items)) {
            itemsHtml = items.map(({ imageUrlOfProduct, name, specific, quantity, note }, index) => {
                const parts = [];

                if (!_.isEmpty(imageUrlOfProduct)) {
                    parts.push(`<img src="${imageUrlOfProduct}" alt="商品圖片" width="120" />`);
                }

                if (!_.isEmpty(name)) {
                    parts.push(`<p><strong>${index + 1}. ${safeEscape(name)}</strong></p>`);
                }

                if (!_.isEmpty(specific)) {
                    parts.push(`<p>選項：${safeEscape(specific)}</p>`);
                }

                if (!_.isNil(quantity)) {
                    parts.push(`<p>數量：${quantity}</p>`);
                }

                if (!_.isEmpty(note)) {
                    parts.push(`<p>備註：${safeEscape(note)}</p>`);
                }

                return `<div style="margin-bottom: 20px;">${parts.join("")}</div>`;
            }).join("");
        }

        // 訂單基本資料
        const orderInfo = [];
        if (!_.isEmpty(id)) {
            orderInfo.push(`
      <tr>
        <td><strong>訂單編號:</strong></td>
        <td>#${safeEscape(id)}</td>
      </tr>`);
        }

        if (!_.isEmpty(timeOfCreate)) {
            orderInfo.push(`
      <tr>
        <td><strong>訂單日期:</strong></td>
        <td>${safeEscape(timeOfCreate)}</td>
      </tr>`);
        }

        // 價格區段
        const priceSection = [];
        if (!_.isEmpty(feeOfTransport)) {
            priceSection.push(`
      <tr>
        <td><strong>物流費用:</strong></td>
        <td>NT$ ${safeEscape(feeOfTransport)}</td>
      </tr>`);
        }

        if (!_.isEmpty(priceOfTotal)) {
            priceSection.push(`
      <tr>
        <td><strong>總金額:</strong></td>
        <td>NT$ ${safeEscape(priceOfTotal)}</td>
      </tr>`);
        }

        // 出貨資訊
        const shippingInfo = [];
        if (!_.isEmpty(name)) {
            shippingInfo.push(`<p>收件人：${safeEscape(name)}</p>`);
        }

        if (!_.isEmpty(phoneNumber)) {
            shippingInfo.push(`<p>聯絡電話：${safeEscape(phoneNumber)}</p>`);
        }

        if (!_.isEmpty(address)) {
            shippingInfo.push(`<p>寄送地址：${safeEscape(address)}</p>`);
        }

        // 付款資訊
        const paymentInfo = [];
        if (!_.isEmpty(procedureOfPayment)) {
            paymentInfo.push(`<p>付款方式：${safeEscape(procedureOfPayment)}</p>`);
        }

        if (!_.isEmpty(timeOfPayment)) {
            paymentInfo.push(`<p>付款日期：${safeEscape(timeOfPayment)}</p>`);
        }

        if (!_.isEmpty(priceOfTotal)) {
            paymentInfo.push(`<p>付款金額：NT$ ${safeEscape(priceOfTotal)}</p>`);
        }

        return `
    <div style="font-family: Arial, sans-serif; color: #000;">
      <p>您好，</p>
      ${!_.isEmpty(id) ? `<p>訂單 <a href="#">#${safeEscape(id)}</a> 的付款已確認。我們已通知賣家準備後續事宜。</p>` : ''}
      <hr />

      <h3>訂單明細</h3>
      ${orderInfo.length > 0 ? `<table>${orderInfo.join("")}</table>` : ''}

      ${!_.isEmpty(itemsHtml) ? `<hr />${itemsHtml}<hr />` : ''}

      ${priceSection.length > 0 ? `<table>${priceSection.join("")}</table><hr />` : ''}

      ${shippingInfo.length > 0 ? `<h4>出貨資訊</h4>${shippingInfo.join("")}<hr />` : ''}

      ${paymentInfo.length > 0 ? `<h4>付款資訊</h4>${paymentInfo.join("")}` : ''}

      ${!_.isEmpty(remark) ? `<hr /><h4>備註</h4><p>${safeEscape(remark)}</p>` : ''}
    </div>
  `;
    };



    async handleHttpOnCall(data, session) {
        const idOfPreciseOrder = data.idOfPreciseOrder;
        const { id,
            items,
            address,
            phoneNumber,
            priceOfTotal,
            remark,
            name,
            email,
            procedureOfPayment,
            timeOfCreate,
            timeOfPayment,
            feeOfTransport } = await Api.fetchPreciseOrderItem(idOfPreciseOrder);


        if(Util.isUndefinedNullEmpty(email))
            this.appendErrorLog(9999,`E1403 客戶未提供Email，無法送出Email，訂單編號：${id}`)

        FirebaseHelper.firestore()
          .collection("mail")
          .add({
              to: `${email}`,
              message: {
                  subject: `您的款項已確認${name?? ''}）已完成`,
                  // text: "This is the plaintext section of the email body.",
                  text: "詳細訂購單",
                  // html: "This is the <code>HTML</code> section of the email body.",
                  html: this.getHtmlOfReceipt({
                      id,
                      items,
                      address,
                      phoneNumber,
                      priceOfTotal,
                      remark,
                      name,
                      procedureOfPayment,
                      timeOfCreate,
                      timeOfPayment,
                      feeOfTransport
                  })
              }
          })
          .then(() => console.log("Queued email for delivery!"));
    }
}

export default ModularizedSendEmailOfReceipt;
