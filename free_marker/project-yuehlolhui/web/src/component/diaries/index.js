const edit = true;

import { utiller as Util } from "utiller";

import { inject } from "mobx-react";
import BaseDiariesComponent from "./BaseDiariesComponent";
import { observer } from "mobx-react";

@inject("diaries")
@observer
class DiariesComponent extends BaseDiariesComponent {
    constructor(props) {
        super(props);
    }

    getMessageXCreateTime(messageX) {
        if (!messageX) return "";
        // messageX 是一個 store object，不是 timestamp
        const timestamp = messageX.getCreateTime(true);
        if (!timestamp) return "";
        const date = new Date(timestamp);
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, "0");
        const day = String(date.getDate()).padStart(2, "0");
        const weekdays = ["日", "一", "二", "三", "四", "五", "六"];
        const weekday = weekdays[date.getDay()];
        return `${year}/${month}/${day} (${weekday})`;
    }

    onDiariesMessageXReadMoreTypographyClicked(param) {
        const messageX = param.object;
        messageX.setIsExpended(true);
    }

    getInjectStyleOfDiariesMessageXReadMoreTypography(messageX) {
        return Util.getVisibleOrNone(!messageX.getIsExpended(), true);
    }

    getInjectStyleOfDiariesMessageXContentTypography(messageX) {
        if (messageX.getIsExpended?.()) {
            return {
                display: "block",
                WebkitLineClamp: "unset",
                overflow: "visible"
            };
        }
        return {};
    }

    getWrapInjectStyleOfDiariesMessageXReadMoreTypography(messageX) {
        if (messageX.getIsExpended?.()) {
            return { display: "none" };
        }

        const content = messageX.getContent() || "";
        const lineBreaks = (content.match(/\n/g) || []).length;

        /**
         * 10行判斷基準：
         * 1. 如果換行符號 < 10
         * 2. 且 總字數 < 400 (保守估計，依據寬度不同，10行大約落在 400-600字)
         * 則隱藏 Read More 按鈕
         */
        if (lineBreaks < 10 && content.length < 400) {
            return { display: "none" };
        }

        return {};
    }
}

export default DiariesComponent;
