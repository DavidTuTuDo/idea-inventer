const edit = true;

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
}

export default DiariesComponent;
