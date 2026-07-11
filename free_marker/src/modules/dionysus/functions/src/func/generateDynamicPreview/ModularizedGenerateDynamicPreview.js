const edit = true;

import { utiller as Util } from "utiller";
import Api from "../../api";
import Config from "../../config";
import libPath from "path";
import BaseGenerateDynamicPreview from "./BaseGenerateDynamicPreview";

/** 模組級 HTML 快取（熱函式會重用同一個進程） */
let _cachedHtml = null;
let _cachedHtmlAt = 0;
const HTML_CACHE_TTL = 5 * 60 * 1000; // 5 分鐘

class ModularizedGenerateDynamicPreview extends BaseGenerateDynamicPreview {
    constructor(props) {
        super(props);
    }

    _escapeHtml(str) {
        if (typeof str !== "string") return "";
        return str.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&#039;");
    }

    async handleHttpOnRequest(request, response) {
        const pathSegments = request.path.split("/");
        const id = pathSegments[pathSegments.length - 1];

        if (!id) return response.status(400).send("Bad Request");

        try {
            // 1. 並行撈資料庫商品 + 全域設定
            const [booze, pref] = await Promise.all([Api.fetchBoozeItem(id), Api.fetchGlobalPerspective()]);

            // 2. 準備你要給 LINE / FB 看的客製化文字與圖片
            let ogTitle = "找不到頁面";
            let ogImage = libPath.join(Config.host, `images/logo.png`);
            let ogDesc = "";

            if (booze && booze.exists) {
                const brandName = pref && pref.nameOfBrand ? pref.nameOfBrand : "";
                ogTitle = `[${brandName}]${booze.name || ""}，特價${booze.price || "?"} 元起`;
                if (booze.photoOfDemo) ogImage = booze.photoOfDemo;
                if (booze.statement) ogDesc = booze.statement;
            }

            // 防呆處理
            ogTitle = this._escapeHtml(ogTitle);
            ogDesc = this._escapeHtml(ogDesc);

            // ==========================================
            // 最簡單的魔法在這裡：直接抓線上的首頁來用！
            // ==========================================
            // 使用快取避免重複 fetch 首頁 HTML
            const now = Date.now();
            let html;
            if (_cachedHtml && now - _cachedHtmlAt < HTML_CACHE_TTL) {
                html = _cachedHtml;
            } else {
                const fetchRes = await fetch(Config.host);
                html = await fetchRes.text();
                _cachedHtml = html;
                _cachedHtmlAt = now;
            }

            // 把你要的特色預覽標籤，做成一串字
            const metaTags = `
                <title>${ogTitle}</title>
                <meta property="og:title" content="${ogTitle}" />
                <meta property="og:image" content="${ogImage}" />
                <meta property="og:description" content="${ogDesc}" />
                <meta name="twitter:card" content="summary_large_image" />
                <meta name="twitter:image" content="${ogImage}" />
            `;

            // 直接暴力把這串字塞進網頁的 </head> 標籤前面
            html = html.replace("</head>", `${metaTags}</head>`);

            // 回傳給 LINE / FB / 點擊進來的真實客人
            response.set("Cache-Control", "public, max-age=300, s-maxage=600");
            response.status(200).send(html);
        } catch (error) {
            console.error("發生錯誤:", error);
            // 萬一出錯，直接把客人導回首頁，什麼事都沒發生
            response.status(200).send(`<html><script>window.location.href="/";</script></html>`);
        }
    }
}

export default ModularizedGenerateDynamicPreview;
