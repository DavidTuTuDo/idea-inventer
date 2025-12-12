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
        methodOfTransaction,
        methodOTransport,
        serialOfTransport,
        remark,
        phone,
        address,
        needAddress,
        id,
        anonymous,
        displayImage,
        isBuyer,
        global
    }) {
        const valid = (string) => _.isString(string) && _.size(string) > 0;
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
          ${valid(item.note) ? `<div style="font-size:13px;color:#6c6c6c;">備註：${item.note}</div>` : ""}
          ${generateCalendarButtons(item)}
        </td>
      </tr>`
            )
            .join("");

        const customerInfo = `
    ${valid(remark) ? `<div style="margin-bottom:4px;">客戶備註：${remark}</div>` : ""}
    ${
        valid(address) && needAddress
            ? `<div style="margin-bottom:4px;">客戶地址：${address} 
        <a href="https://www.google.com/maps/search/${encodeURIComponent(address)}" style="font-size:12px;color:#0066cc;text-decoration:none;">[開啟地圖]</a></div>`
            : ""
    }
    ${methodOTransport ? `<div style="margin-bottom:4px;">取貨方式：${methodOTransport}</div>` : ""}
    ${serialOfTransport ? `<div style="margin-bottom:4px;">物流編號：${serialOfTransport}</div>` : ""}
    ${phone ? `<div>聯絡方式：${phone}</div>` : ""}`;

        const paymentInfo = `
    <div>物流費用：NT$${toCurrency(feeOfTransport)}</div>
    <div>優惠禮金：NT$${toCurrency(discountOfTotal)}</div>
    <div style="font-weight:bold;">實收費用：NT$${toCurrency(priceOfTotal)}</div>
    <div style="color:#555;">付費方式：${methodOfTransaction}</div>`;

        const footer = `
    <div style="margin-top:20px;font-size:12px;color:#555;border-top:1px solid #ccc;padding-top:10px;">
      ${valid(global?.company) ? `<div>${global.company}</div>` : ""}
      ${valid(global?.unifiedB) ? `<div>統編：${global.unifiedB}</div>` : ""}
      ${valid(global?.phoneO) ? `<div>電話：${global.phoneO}</div>` : ""}
      <div style="margin-top:6px;">
        ${valid(global?.fbO) ? `<a href="${global.fb}" style="margin-right:8px;"><img src="https://img.icons8.com/ios-filled/50/808080/facebook-new.png" width="18"></a>` : ""}
        ${valid(global?.igO) ? `<a href="${global.ig}" style="margin-right:8px;"><img src="https://img.icons8.com/ios-filled/50/808080/instagram-new.png" width="18"></a>` : ""}
        ${valid(global?.ytO) ? `<a href="${global.yt}" style="margin-right:8px;"><img src="https://img.icons8.com/ios-filled/50/808080/youtube-play.png" width="18"></a>` : ""}
        ${valid(global?.lineO) ? `<a href="https://line.me/R/ti/g/${global.lineO}"><img src="https://img.icons8.com/ios-filled/50/808080/line-me.png" width="18"></a>` : ""}
      </div>
    </div>`;

        const confirmButton = !anonymous
            ? `<div style="text-align:right;margin-bottom:10px;">
           <a href="https://google.com/search?q=${id}"
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
        const { idOfPreciseOrder, isTransportCompleted } = data;
        const order = await Api.fetchPreciseOrderItem(idOfPreciseOrder);
        const { id, email } = order;

        if (Util.isUndefinedNullEmpty(email)) {
            this.appendErrorLog(9999, `4564655-SendEmailOfReceipt 客戶未提供Email，無法送出Email，訂單編號：${id}`);
            return;
        }
        const global = await Api.fetchGlobalPerspective();
        this.appendLog(`${idOfPreciseOrder} 準備發送Email給賣家｜買家`);

        if (isTransportCompleted) {
            /** 商品已寄出通知 */
            if (!order.isTransported) this.appendErrorLog(9999, `652112132132 商品尚未完成物流程序`);
            _.remove(order.items, (item) => item.isTaskJob); //只有實體商品需要寄出，把課程拿掉
            const isBuyer = true;
            this.sendEmailTo({ isTransportCompleted, nameOfBrand: global.nameOfBrand, isBuyer, order, global });
        } else [true, false].forEach((isBuyer) => this.sendEmailTo({ nameOfBrand: global.nameOfBrand, isBuyer, order, global }));
        /** 買家/賣家各寄送一份通知 */
    }

    sendEmailTo({ isTransportCompleted, nameOfBrand, isBuyer, order, global }) {
        const recipient = isBuyer ? order.email : Config.email;
        const subject = isTransportCompleted ? `[${nameOfBrand}]您的商品已寄出，請留意簡訊` : isBuyer ? `[${nameOfBrand}]您的款項已確認` : `[${nameOfBrand}]您有新的成交訂單`;

        const xxx = {
            methodOfTransaction: Config.LabelOfTransactionMethod(order.typeOfTransaction),
            methodOfTransport: Config.LabelOfTransportMethod(order.typeOfTransport),
            isBuyer,
            displayImage: isBuyer,
            isTransportSucceed: order.isTransported,
            global
        };

        const latest = Util.merO(order, xxx);
        FirebaseHelper.firestore()
            .collection("mail")
            .add({
                to: [recipient, ...this.listOfCC()],
                message: {
                    subject,
                    html: this.generateOrderEmailHTML(latest)
                }
            })
            .then(() => this.appendLog("Queued email for delivery!"));
    }

    /** 轉寄給相關人['s4360349@ntut.edu.tw'] */
    listOfCC() {
        return [];
    }
}

export default ModularizedSendEmailOfReceipt;
