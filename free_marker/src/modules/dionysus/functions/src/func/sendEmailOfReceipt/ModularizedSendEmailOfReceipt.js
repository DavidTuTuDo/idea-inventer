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
     * 假設的函式，用於生成行事曆連結。
     * 在實際應用中，您需要提供此函式的具體實現。
     * @param {object} item - 包含行事曆事件資訊的品項物件。
     * @returns {object} 包含 Google/TimeTree/ICS 連結的物件。
     */
    // 由於這是假設的函式，這裡只返回一個範例連結物件
    generateAllCalendarLinks = (item) => ({
        google: `https://calendar.google.com/calendar/r/eventedit?text=${encodeURIComponent(item.name)}&dates=20251110T010000Z/20251110T030000Z`,
        timeTree: `https://timetreeapp.com/events/new?title=${encodeURIComponent(item.name)}`,
        ics: `data:text/calendar;charset=utf8,BEGIN:VCALENDAR%0AVERSION:2.0%0ABEGIN:VEVENT%0ASUMMARY:${encodeURIComponent(item.name)}%0ADTSATMP:20251110T010000Z%0AEND:VEVENT%0AEND:VCALENDAR`
    });

    /**
     * 生成符合工業整潔風的 HTML 訂單明細 (適用於 Email)。
     * @param {object} options - 訂單資訊的物件。
     * @param {Array<object>} options.items - 購買品項列表。
     * @param {string} options.name - 客戶姓名。
     * @param {number} options.priceTotal - 總價。
     * @param {number} options.feeOfTransport - 運費。
     * @param {number} options.discountOfTotalt - 折扣金額。
     * @param {string} options.methodOfPayment - 付款方式。
     * @param {string} options.methodOTransport - 物流方式。
     * @param {string} options.serialOfTranport - 物流單號。
     * @param {string} options.remark - 客戶備註。
     * @param {string} options.phone - 客戶電話。
     * @param {string} options.addresss - 客戶地址。
     * @param {string} options.id - 訂單編號。
     * @param {boolean} options.anonymous - 是否為陌生訪客。
     * @param {boolean} options.displayImage - 是否顯示圖片。
     * @param {boolean} options.isBuyer - 是否為買家 (否則為賣家)。
     * @param {boolean} options.isTransportSucceed - 是否已寄出成功。
     * @returns {string} 包含訂單明細的 HTML 字串。
     */
    generateOrderHtml = ({
        items,
        name,
        priceTotal,
        feeOfTransport,
        discountOfTotalt,
        methodOfPayment,
        methodOTransport,
        serialOfTranport,
        remark,
        phone,
        addresss,
        id,
        anonymous,
        displayImage,
        isBuyer,
        isTransportSucceed
    }) => {
        // --- 🎨 工業整潔風的通用樣式 ---
        const FONT_FAMILY = "Arial, sans-serif";
        const PRIMARY_COLOR = "#333333";
        const BORDER_COLOR = "#E0E0E0";
        const BACKGROUND_COLOR = "#F5F5F5";
        const ACCENT_COLOR = "#5A5A5A";

        const containerStyle = `width: 100%; max-width: 600px; margin: 0 auto; border: 1px solid ${BORDER_COLOR}; background-color: #ffffff; padding: 20px; box-sizing: border-box; font-family: ${FONT_FAMILY}; color: ${PRIMARY_COLOR};`;
        const headerStyle = `font-size: 18px; font-weight: bold; border-bottom: 2px solid ${PRIMARY_COLOR}; padding-bottom: 10px; margin-bottom: 15px;`;
        const sectionStyle = `margin-bottom: 20px; padding: 15px; background-color: ${BACKGROUND_COLOR}; border: 1px solid ${BORDER_COLOR};`;
        const itemRowStyle = `border-bottom: 1px dashed ${BORDER_COLOR}; padding: 10px 0; display: block; overflow: hidden;`;
        const labelStyle = `font-weight: bold; color: ${ACCENT_COLOR}; display: inline-block; min-width: 80px; margin-right: 5px;`;
        const valueStyle = `font-weight: normal; color: ${PRIMARY_COLOR};`;
        const buttonStyle = `display: inline-block; background-color: ${PRIMARY_COLOR}; color: #ffffff; text-decoration: none; padding: 8px 15px; border-radius: 4px; font-size: 14px; font-weight: bold; margin-top: 10px;`;
        const chipStyle = `display: inline-block; padding: 4px 8px; margin-right: 5px; background-color: ${ACCENT_COLOR}; color: #ffffff; border-radius: 12px; font-size: 12px; font-weight: normal; text-decoration: none; white-space: nowrap;`;
        const footerStyle = `text-align: center; border-top: 1px solid ${BORDER_COLOR}; padding-top: 15px; margin-top: 20px; font-size: 12px; color: ${ACCENT_COLOR};`;

        // --- 🛒 品項列表 HTML 生成 ---
        const itemsHtml = items
            .map((item) => {
                const { id: itemId, idOfV, image, name: itemName, specific, price, quantity, note, isTaskJob } = item;

                // 判斷是否需要顯示圖片 (displayImage = true)
                const imageHtml =
                    displayImage && image
                        ? `
      <img src="${image}" alt="${itemName}" style="width: 60px; height: 60px; object-fit: cover; border: 1px solid ${BORDER_COLOR}; float: left; margin-right: 15px;">
    `
                        : "";

                // 賣家才顯示商品編號和規格編號
                const sellerInfoHtml = !isBuyer
                    ? `
      <p style="margin: 0; line-height: 1.5;"><span style="${labelStyle}">商品編號:</span><span style="${valueStyle}">${itemId || "N/A"}</span></p>
      <p style="margin: 0; line-height: 1.5;"><span style="${labelStyle}">規格編號:</span><span style="${valueStyle}">${idOfV || "N/A"}</span></p>
    `
                    : "";

                // 只有在 note 存在且非空時才顯示
                const noteHtml = note?.trim()
                    ? `
      <p style="margin: 0; line-height: 1.5;"><span style="${labelStyle}">商品備註:</span><span style="${valueStyle}">${note}</span></p>
    `
                    : "";

                // 處理行事曆按鈕
                const calendarButtonsHtml = isTaskJob
                    ? (() => {
                          const links = this.generateAllCalendarLinks(item);
                          const calendarButtonStyle = `display: inline-block; padding: 5px 10px; margin: 5px 5px 5px 0; background-color: #888888; color: #ffffff; text-decoration: none; border-radius: 4px; font-size: 12px;`;
                          return `
        <div style="margin-top: 10px;">
          <a href="${links.google}" target="_blank" style="${calendarButtonStyle}"><span style="margin-right: 3px;">📅</span> 加到 Google 行事曆</a>
          <a href="${links.timeTree}" target="_blank" style="${calendarButtonStyle}"><span style="margin-right: 3px;">🌳</span> 加到 TimeTree 行事曆</a>
          <a href="${links.ics}" download="${itemName}.ics" style="${calendarButtonStyle}"><span style="margin-right: 3px;">📥</span> 加到 ICS 行事曆</a>
        </div>
      `;
                      })()
                    : "";

                return `
      <div style="${itemRowStyle}">
        ${imageHtml}
        <div style="overflow: hidden;">
          <p style="margin: 0 0 5px 0; font-size: 16px; font-weight: bold; color: ${PRIMARY_COLOR};">${itemName}</p>
          ${sellerInfoHtml}
          <p style="margin: 0; line-height: 1.5;"><span style="${labelStyle}">商品規格:</span><span style="${valueStyle}">${specific}</span></p>
          <p style="margin: 0; line-height: 1.5;"><span style="${labelStyle}">商品價格:</span><span style="${valueStyle}">$${price}</span></p>
          <p style="margin: 0; line-height: 1.5;"><span style="${labelStyle}">購買數量:</span><span style="${valueStyle}">${quantity}</span></p>
          ${noteHtml}
          ${calendarButtonsHtml}
        </div>
        <div style="clear: both;"></div>
      </div>
    `;
            })
            .join("");

        // --- 🗺️ Google Map 按鈕 (如果地址存在) ---
        const googleMapLink = addresss?.trim() ? `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(addresss)}` : "";

        const googleMapButtonHtml = googleMapLink
            ? `<a href="${googleMapLink}" target="_blank" style="${buttonStyle} margin-left: 10px; background-color: #4285F4; padding: 5px 10px; font-size: 12px; font-weight: normal;"><span style="margin-right: 3px;">📍</span> 開啟 Google Map</a>`
            : "";

        // --- ✉️ 最終 HTML 結構 ---
        return `
    <div style="background-color: ${BACKGROUND_COLOR}; padding: 30px 0; margin: 0;">
      <div style="${containerStyle}">

        <p style="${headerStyle}">
          ${name}的訂單 ${id} 已${isTransportSucceed ? "成功寄出" : "成立"}，以下為詳細資訊：
        </p>
        
        ${
            !anonymous
                ? `
          <div style="text-align: left; margin-bottom: 20px;">
            <a href="http://www.seller/${id}" target="_blank" style="${chipStyle} background-color: #616161; border-radius: 4px; padding: 6px 12px; font-size: 14px;">
              <span style="margin-right: 5px;">✅</span> 前往確認
            </a>
          </div>
        `
                : ""
        }

        <div style="${sectionStyle}">
          <h3 style="margin: 0 0 10px 0; font-size: 16px; color: ${PRIMARY_COLOR}; border-bottom: 1px solid ${BORDER_COLOR}; padding-bottom: 5px;">🛒 商品成交明細</h3>
          ${itemsHtml}
        </div>

        <div style="${sectionStyle}">
          <h3 style="margin: 0 0 10px 0; font-size: 16px; color: ${PRIMARY_COLOR}; border-bottom: 1px solid ${BORDER_COLOR}; padding-bottom: 5px;">📞 客戶/物流資訊</h3>
          
          ${
              remark?.trim()
                  ? `
            <p style="margin: 0; line-height: 1.8;"><span style="${labelStyle}">客戶備註:</span><span style="${valueStyle}">${remark}</span></p>
          `
                  : ""
          }

          ${
              addresss?.trim()
                  ? `
            <p style="margin: 0; line-height: 1.8;">
              <span style="${labelStyle}">客戶地址:</span>
              <span style="${valueStyle}">${addresss}</span>
              ${googleMapButtonHtml}
            </p>
          `
                  : ""
          }

          ${
              methodOTransport?.trim()
                  ? `
            <p style="margin: 0; line-height: 1.8;"><span style="${labelStyle}">取貨方式:</span><span style="${valueStyle}">${methodOTransport}</span></p>
          `
                  : ""
          }

          <p style="margin: 0; line-height: 1.8;"><span style="${labelStyle}">物流編號:</span><span style="${valueStyle}">${serialOfTranport || "N/A"}</span></p>
          <p style="margin: 0; line-height: 1.8;"><span style="${labelStyle}">聯絡方式:</span><span style="${valueStyle}">${phone || "N/A"}</span></p>
        </div>

        <div style="${sectionStyle}">
          <h3 style="margin: 0 0 10px 0; font-size: 16px; color: ${PRIMARY_COLOR}; border-bottom: 1px solid ${BORDER_COLOR}; padding-bottom: 5px;">💰 付款資訊 (${methodOfPayment})</h3>
          <p style="margin: 0; line-height: 1.8;"><span style="${labelStyle}">物流費用:</span><span style="${valueStyle}">+ $${feeOfTransport.toFixed(2)}</span></p>
          <p style="margin: 0; line-height: 1.8;"><span style="${labelStyle}">優惠禮金:</span><span style="${valueStyle}">- $${Math.abs(discountOfTotalt).toFixed(2)}</span></p>
          <p style="margin: 0; line-height: 1.8; font-size: 16px; border-top: 1px solid ${BORDER_COLOR}; padding-top: 5px; margin-top: 5px;">
            <span style="${labelStyle} color: #CC0000; font-size: 16px;">實收費用:</span>
            <span style="font-weight: bold; color: #CC0000; font-size: 18px;">$${priceTotal.toFixed(2)}</span>
          </p>
        </div>

        <div style="${footerStyle}">
          <p style="margin: 5px 0; font-weight: bold;">明悅科技公司</p>
          <p style="margin: 2px 0;">統編：89745974 | 電話：0982-763-479</p>

          <div style="margin-top: 10px;">
            <a href="https://www.facebook.com/?locale=zh_TW" target="_blank" style="margin: 0 5px; opacity: 0.8;">
              <img src="https://via.placeholder.com/24/CCCCCC/333333?text=f" alt="Facebook" style="width: 24px; height: 24px; border-radius: 4px; background-color: #CCCCCC;">
            </a>
            <a href="https://www.instagram.com/david.tu.guitar" target="_blank" style="margin: 0 5px; opacity: 0.8;">
              <img src="https://via.placeholder.com/24/CCCCCC/333333?text=i" alt="Instagram" style="width: 24px; height: 24px; border-radius: 4px; background-color: #CCCCCC;">
            </a>
            <a href="https://www.youtube.com/@laogao" target="_blank" style="margin: 0 5px; opacity: 0.8;">
              <img src="https://via.placeholder.com/24/CCCCCC/333333?text=yt" alt="YouTube" style="width: 24px; height: 24px; border-radius: 4px; background-color: #CCCCCC;">
            </a>
            <a href="https://www.tiktok.com/@power306787878" target="_blank" style="margin: 0 5px; opacity: 0.8;">
              <img src="https://via.placeholder.com/24/CCCCCC/333333?text=t" alt="TikTok" style="width: 24px; height: 24px; border-radius: 4px; background-color: #CCCCCC;">
            </a>
          </div>
        </div>
      </div>
    </div>
  `;
    };

    // --- 💡 範例使用 ---
    //     const sampleData = {
    //         items: [
    //             {
    //                 id: 'E031',
    //                 idOfV: 'V001',
    //                 image: 'https://via.placeholder.com/60', // 替換為實際圖片 URL
    //                 name: '日系5D立體毛衣',
    //                 specific: '白色',
    //                 price: 300.50,
    //                 quantity: 1,
    //                 note: '勿水洗，建議乾洗',
    //                 isTaskJob: false
    //             },
    //             {
    //                 image: 'https://via.placeholder.com/60',
    //                 name: '吉他課',
    //                 specific: '2025/11/10 (一)｜09:00-11:00',
    //                 price: 50.00,
    //                 quantity: 2,
    //                 note: '請自備吉他與譜架',
    //                 isTaskJob: true
    //             }
    //         ],
    //         name: '林土伯',
    //         priceTotal: 793.00,
    //         feeOfTransport: 50.00,
    //         discountOfTotalt: -7.00,
    //         methodOfPayment: 'LinePay支付',
    //         methodOTransport: '7-11取貨',
    //         serialOfTranport: 'A4512C2123',
    //         remark: '這次購買的毛衣麻煩小心輕放，謝謝！',
    //         phone: '0982763479',
    //         addresss: '高雄市苓雅區三多一路30號4F',
    //         id: 'A213s123sadv',
    //         anonymous: false,
    //         displayImage: true,
    //         isBuyer: true, // 假設是買家視角
    //         isTransportSucceed: true,
    //     };
    //
    // // 產生 HTML
    //     const finalHtml = generateOrderHtml(sampleData);
    //
    // // console.log(finalHtml); // 輸出生成的 HTML 字符串
    // // document.getElementById('output').innerHTML = finalHtml; // 如果在網頁環境中

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
