const edit = true;

import { utiller as Util, exceptioner as ERROR, pooller as InfinitePool } from "utiller";
import _ from "lodash";
import Config from "../../config";
import BaseVerifyByLiffIdToken from "./BaseVerifyByLiffIdToken";

class ModularizedVerifyByLiffIdToken extends BaseVerifyByLiffIdToken {
    constructor(props) {
        super(props);
    }

    async handleHttpOnCall(data, session) {
        const idToken = data.idToken;
    }

    verifyLineToken = async (idToken) => {
        const channelId = Config.liffChannelId; // 替換為你的 Channel ID

        // 1. 使用內建 URLSearchParams 替代 qs.stringify
        const params = new URLSearchParams();
        params.append("id_token", idToken);
        params.append("client_id", channelId);

        try {
            // 2. 使用內建 fetch 替代 axios
            const response = await fetch("https://api.line.me/oauth2/v2.1/verify", {
                method: "POST",
                headers: {
                    "Content-Type": "application/x-www-form-urlencoded"
                },
                body: params // URLSearchParams 會自動處理成正確的字串格式
            });

            if (!response.ok) {
                // 如果 LINE 回傳 400 等錯誤，抓取錯誤訊息
                const errorDetail = await response.json();
                console.error("LINE 驗證失敗:", errorDetail);
                return null;
            }

            const data = await response.json();
            this.appendLog(data);
            // 驗證成功會拿到：iss, sub, aud, exp, name, picture, email 等
            return data;
        } catch (error) {
            console.error("網路請求發生錯誤:", error);
            throw error;
        }
    };
}

export default ModularizedVerifyByLiffIdToken;
