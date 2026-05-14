const edit = true;

import { utiller as Util } from "utiller";
import { inject } from "mobx-react";
import BaseDiariesComponent from "./BaseDiariesComponent";
import { reaction, observable, makeObservable, action } from "mobx";
import Router from "../../router";
import MessageX from "../../store/diariesMessageX";
import BaseUserInfo from "../../base/BaseUserInfo";

class DiariesComponent extends BaseDiariesComponent {
    constructor(props) {
        super(props);
        this.apiOfMsgX = new MessageX();
    }

    onDiariesMessageXFuncIconButtonUpdateClicked(param) {
        const message = param.object;
        const self = this;
        return async () => {
            self.getPretendDivAlertDialogRef().open();
            Util.syncDelay(100).then(() => {
                self.App().getStorytellerStore().initial(message);
            });
        };
    }

    onDiariesMessageXFuncIconButtonDeleteClicked(param) {
        const message = param.object;
        const self = this;
        return async () => {
            await this.apiOfMsgX.deleteMessageXItem(self, message.getId());
            message.remove();
        };
    }

    componentDidMount() {
        super.componentDidMount();

        // 使用 MobX 的 reaction 監聽 NavigatorStore 的 editTriggerSignal
        this.subscribe(
            reaction(
                () => this.App().getNavigatorStore().editTriggerSignal,
                (signal) => {
                    if (signal > 0) {
                        this.activateEditPage();
                    }
                }
            )
        );
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
        if (BaseUserInfo.isAdmin() || BaseUserInfo.isAuthorUser()) param.object.setIsExpended(true);
        else this.showErrorSnackMessage(`ＮＯＮＯ～不給你看！你看不起！`);
    }

    getInjectStyleOfDiariesMessageXReadMoreTypography(messageX) {
        return Util.getVisibleOrNone(!messageX.getIsExpended(), true);
    }

    getInjectStyleOfDiariesMessageXContentTypography(messageX) {
        if (messageX.getIsExpended?.()) {
            return {
                display: "block",
                WebkitLineClamp: "unset",
                overflow: "visible",
                maskImage: "none",
                WebkitMaskImage: "none"
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

    activateEditPage = () => {
        this.getPretendDivAlertDialogRef().open();
    };

    getInjectStyleOfDiariesMessageXCard(messageX) {
        const store = this.getStore();
        const allMessages = store.getMessageXes?.() || [];
        const author = messageX.getAuthor() || "Anonymous";

        // 取得目前畫面上所有不重複的作者清單
        const uniqueAuthors = [];
        allMessages.forEach((m) => {
            const a = m.getAuthor() || "Anonymous";
            if (!uniqueAuthors.includes(a)) uniqueAuthors.push(a);
        });

        const authorIndex = uniqueAuthors.indexOf(author);
        const colors = [
            "transparent", // 第一位作者固定透明
            "rgba(183, 28, 28, 0.2)", // 企業紅
            "rgba(26, 26, 26, 0.2)" // 企業黑
        ];

        // 根據作者在清單中的順序分配顏色，確保至少有一位（第一位）是透明
        const colorIndex = authorIndex >= 0 ? authorIndex % colors.length : 0;

        return {
            backgroundColor: colors[colorIndex]
        };
    }
}

export default DiariesComponent;
