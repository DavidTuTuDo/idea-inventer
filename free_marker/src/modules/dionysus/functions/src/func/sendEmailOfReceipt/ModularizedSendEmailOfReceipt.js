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
     * 產生訂單明細的 HTML，適合放進電子郵件中
     * @param {Object} params - 所有參數
     * @returns {string} email 可用的 HTML
     */
    generateOrderEmailHTML({
        items = [],
        name,
        priceOfTotal,
        feeOfTransport,
        discountOfTotal,
        methodOfPayment,
        methodOTransport,
        serialOfTransport,
        remark,
        phone,
        address,
        id,
        anonymous,
        displayImage,
        isBuyer,
        isTransportSucceed
    }) {
        const toCurrency = (n) => Number(n).toLocaleString("zh-TW");
        // <a href="${timeTree}" style="${chipStyle}"><img src="https://img.icons8.com/ios-filled/50/000000/calendar--v1.png" style="${iconStyle}">新增至TimeTree</a>
        // <a href="${ics}" style="${chipStyle}"><img src="https://img.icons8.com/ios/50/000000/calendar--v1.png" style="${iconStyle}">新增至行事曆</a>
        const generateCalendarButtons = (item) => {
            if (!item.isTaskJob) return "";
            const timeOfStartEnd = Util.getObjectOfStartEndDateTime(item.specific);
            const link = Util.generateGoogleCalendarLink({ ...timeOfStartEnd, title: item.name, location: address });
            const iconStyle = "width:12px;height:12px;vertical-align:middle;margin-right:4px;";
            const chipStyle = "display:inline-block;background:#e0e0e0;color:#333;border-radius:16px;padding:4px 10px;margin-right:6px;text-decoration:none;font-size:12px;";
            return `
      <div style="margin-top:4px;">
        <a href="${link}" style="${chipStyle}"><img src="https://upload.wikimedia.org/wikipedia/commons/thumb/a/a5/Google_Calendar_icon_%282020%29.svg/16px-Google_Calendar_icon_%282020%29.svg.png" style="${iconStyle}">新增至Google行事曆</a>
      </div>
    `;
        };

        const itemRows = items
            .map(
                (item, i) => `
      <tr style="border-bottom:1px solid #ddd;">
        ${displayImage ? `<td style="padding:4px;"><img src="${item.imageUrlOfProduct}" width="80px" height="80px" style="border-radius:5px;object-fit:cover;"></td>` : ""}
        <td style="padding:4px;vertical-align:top;">
          ${!isBuyer ? `<div style="font-size:13px;color:#6c6c6c;">商品編號：${item.id}</div>` : ""}
          <div style="font-weight:${isBuyer ? "bold" : "normal"};font-size:${isBuyer ? "14px" : "13px"}">${item.name}</div>
          ${!isBuyer ? `<div style="font-size:13px;color:#6c6c6c;">規格編號：${item.idOfV}</div>` : ""}
          <div style="font-size:13px;color:#555;">規格：${item.specific}</div>
          <div style="font-size:13px;color:#555;">數量：${item.quantity}</div>
          ${isBuyer && item.price ? `<div style="font-size:13px;color:#555;">價格：NT$${toCurrency(item.price)}</div>` : ""}
          ${item.note ? `<div style="font-size:13px;color:#6c6c6c;">備註：${item.note}</div>` : ""}
          ${generateCalendarButtons(item)}
        </td>
      </tr>`
            )
            .join("");

        const customerInfo = `
    ${remark ? `<div style="margin-bottom:4px;">客戶備註：${remark}</div>` : ""}
    ${
        address
            ? `<div style="margin-bottom:4px;">客戶地址：${address} 
        <a href="https://www.google.com/maps/search/${encodeURIComponent(address)}" style="font-size:12px;color:#0066cc;text-decoration:none;">[開啟地圖]</a></div>`
            : ""
    }
    ${methodOTransport ? `<div style="margin-bottom:4px;">取貨方式：${methodOTransport}</div>` : ""}
    ${serialOfTransport ? `<div style="margin-bottom:4px;">物流編號：${serialOfTransport}</div>` : ""}
    ${phone ? `<div>聯絡方式：${phone}</div>` : ""}
  `;

        const paymentInfo = `
    <div>物流費用：NT$${toCurrency(feeOfTransport)}</div>
    <div>優惠禮金：NT$${toCurrency(discountOfTotal)}</div>
    <div style="font-weight:bold;">實收費用：NT$${toCurrency(priceOfTotal)}</div>
    <div style="color:#555;">付費方式：${methodOfPayment}</div>
  `;

        const footer = `
    <div style="margin-top:20px;font-size:12px;color:#555;border-top:1px solid #ccc;padding-top:10px;">
      <div>明悅科技公司</div>
      <div>統編：89745974</div>
      <div>電話：0982-763-479</div>
      <div style="margin-top:6px;">
        <a href="https://www.facebook.com/?locale=zh_TW" style="margin-right:8px;"><img src="https://img.icons8.com/ios-filled/50/808080/facebook-new.png" width="18"></a>
        <a href="https://www.instagram.com/david.tu.guitar" style="margin-right:8px;"><img src="https://img.icons8.com/ios-filled/50/808080/instagram-new.png" width="18"></a>
        <a href="https://www.youtube.com/@laogao" style="margin-right:8px;"><img src="https://img.icons8.com/ios-filled/50/808080/youtube-play.png" width="18"></a>
        <a href="https://www.tiktok.com/@power306787878"><img src="https://img.icons8.com/ios-filled/50/808080/tiktok.png" width="18"></a>
      </div>
    </div>
  `;

        const confirmButton = !anonymous
            ? `<div style="text-align:right;margin-bottom:10px;">
           <a href="http://www.seller/${id}" 
              style="background:#1976d2;color:white;padding:6px 14px;border-radius:16px;font-size:13px;text-decoration:none;">前往確認</a>
         </div>`
            : "";

        return `
    <div style="font-family:'Segoe UI',Arial,sans-serif;background:#f9f9f9;padding:16px;border-radius:8px;border:1px solid #eee;max-width:600px;margin:auto;">
      ${confirmButton}
      <div style="font-weight:bold;font-size:16px;margin-bottom:10px;">
        ${name} 的訂單# <span style="color:#1976d2;">${id}</span> 已成立，
        以下為詳細資訊：
      </div>
      <table style="width:100%;border-collapse:collapse;background:white;margin-bottom:10px;">
        ${itemRows}
      </table>
      <div style="background:#fafafa;border:1px solid #ddd;padding:8px 10px;margin-bottom:10px;">
        <div style="font-weight:bold;margin-bottom:4px;">客戶資訊</div>
        ${customerInfo}
      </div>
      <div style="background:#fafafa;border:1px solid #ddd;padding:8px 10px;">
        <div style="font-weight:bold;margin-bottom:4px;">付款資訊</div>
        ${paymentInfo}
      </div>
      ${footer}
    </div>
  `;
    }

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

        [true, false].forEach((isBuyer) => this.sendEmailTo({ nameOfBrand: global.nameOfBrand, isBuyer, order }));
        /** 非買家既為賣家 */
    }

    sendEmailTo({ nameOfBrand, isBuyer, order }) {
        const recipient = isBuyer ? order.email : Config.email;
        const subject = isBuyer ? `[${nameOfBrand}]您的款項已確認` : `[${nameOfBrand}]您有新的成交訂單`;

        const xxx = {
            methodOfPayment: order.procedureOfPayment,
            methodOfTransport: Config.LabelOfTransportMethod(order.typeOfTransport),
            isBuyer,
            displayImage: isBuyer,
            isTransportSucceed: order.isTransported
        };

        const latest = Util.mergeObject(order, xxx);
        FirebaseHelper.firestore()
            .collection("mail")
            .add({
                to: recipient,
                message: {
                    subject,
                    html: this.generateOrderEmailHTML(latest)
                }
            })
            .then(() => this.appendLog("Queued email for delivery!"));
    }
}

export default ModularizedSendEmailOfReceipt;
