const edit = true;

import { utiller as Util, exceptioner as ERROR, pooller as InfinitePool } from "utiller";
import { size } from "lodash-es";
import libpath from "path";
import BaseSelectorOfCVS from "./BaseSelectorOfCVS";
import Api from "../../api";
import Config from "../../config";

class ModularizedSelectorOfCVS extends BaseSelectorOfCVS {
    constructor(props) {
        super(props);
    }

    async handleHttpOnRequest(request, response) {
        try {
            const storeData = request.body;

            if (storeData?.TempVar && size(storeData?.TempVar) > 5) {
                /** 7-11的格式 */
                this.appendLog(`來了一個7-11的選擇需求`, storeData);

                await Api.submitSelectorOfCvsItem(
                    {
                        type: Config.TransportMethod.Store711,
                        storeaddress: storeData?.storeaddress ?? "無地址",
                        storeid: storeData?.storeid ?? "無ID",
                        storename: storeData?.storename ?? "無店名"
                    },
                    storeData?.TempVar
                );
            }

            /** 成功後回傳自動關閉頁面 */
            response.set("Content-Type", "text/html; charset=utf-8");
            response.status(200).send(`
            <!DOCTYPE html>
            <html lang="zh-TW">
            <head>
                <meta charset="UTF-8">
                <title>關閉視窗中...</title>
                <style>
                    body {
                        font-family: system-ui, sans-serif;
                        background: #f5f5f5;
                        color: #333;
                        display: flex;
                        align-items: center;
                        justify-content: center;
                        height: 100vh;
                    }
                    .message {
                        text-align: center;
                        font-size: 1rem;
                    }
                </style>
            </head>
            <body>
                <div class="message">店家資料已接收，視窗將自動關閉。</div>
                <script>
                    try {
                        if (window.opener && !window.opener.closed) {
                            window.opener.postMessage({
                                type: "CVS_SELECTED",
                                data: ${JSON.stringify(storeData)}
                            }, "*");
                        }
                    } catch (e) {
                        console.error(e);
                    }
                    setTimeout(() => window.close(), 500);
                </script>
            </body>
            </html>
        `);
        } catch (err) {
            console.error(err);
            response.status(500).send("伺服器處理失敗");
        }
    }
}

export default ModularizedSelectorOfCVS;
