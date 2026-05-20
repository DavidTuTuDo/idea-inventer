const edit = true;
import { inject, observer } from "mobx-react";
import BaseSheetComponent from "./BaseSheetComponent";
import { utiller as Util } from "utiller";
import _ from "lodash";
import Typography from "@mui/material/Typography";
import Style from "../../style";
import React from "react";
import UserInfoRef from "../../base/BaseUserInfo";
import Router from "../../router";

class SheetComponent extends BaseSheetComponent {
    /** -------------------- fields -------------------- **/
    /** -------------------- functions -------------------- **/

    constructor(props) {
        super(props);
    }

    async optimize() {
        // 避免race condition
        await Util.syncDelay(10);
        // --- 配置區域 ---
        const TARGET_CLASS = "SheetGuitarpuCurrentContextTypography";
        const WRAPPER_CLASS = "SheetGuitarpuPaperWrap";
        const BUFFER = 24;
        const STEP = 0.1;
        const DELAY_MS = 50;
        const MAX_LOOP = 50;

        const wrapper = document.getElementsByClassName(WRAPPER_CLASS)[0];
        if (!wrapper) return;

        // 取得第一個元素來做初步判斷
        const firstTextElement = document.getElementsByClassName(TARGET_CLASS)[0];
        if (!firstTextElement) return;

        const targetWidth = wrapper.offsetWidth - BUFFER;

        // --- 🚨 增加的邏輯：首道防線 ---
        // 如果一開始就已經小於等於目標寬度，直接終止，不執行任何縮小
        if (firstTextElement.scrollWidth <= targetWidth) {
            // console.log(
            //     `%c 🛡️ 安全跳過 | Current (${firstTextElement.scrollWidth.toFixed(1)}px) <= Target (${targetWidth.toFixed(1)}px) `,
            //     "background: #e0f2f1; color: #00897b; padding: 4px; border: 1px solid #00897b;"
            // );
            return;
        }

        let safetyLoop = 0;
        // console.log(`%c 🎯 Optimize Start | Target: ${targetWidth}px (Buffer: ${BUFFER}) `, "background: #222; color: #bada55; font-weight: bold; padding: 5px;");

        while (safetyLoop < MAX_LOOP) {
            const textElement = document.getElementsByClassName(TARGET_CLASS)[0];
            if (!textElement) break;

            let currentWidth = textElement.scrollWidth;
            const isOver = currentWidth > targetWidth;

            // console.log(
            //     `%c[Loop ${safetyLoop}]%c Current: ${currentWidth.toFixed(1)}px %c Target: ${targetWidth}px `,
            //     "color: #888;",
            //     `color: white; background: ${isOver ? "#E91E63" : "#4CAF50"}; padding: 2px 5px; font-family: monospace;`,
            //     "color: #00bcd4; font-weight: bold;"
            // );

            // 判斷達標則退出
            if (!isOver) {
                console.log(`%c ✅ 達標停止: ${currentWidth.toFixed(1)}px <= ${targetWidth}px `, "color: #4CAF50; font-weight: bold; border: 1px solid #4CAF50; padding: 2px;");
                break;
            }

            // 執行縮小行為
            this.adjustBunchOfFontSizeByClassName(TARGET_CLASS, false, STEP);

            if (window.Util && Util.syncDelay) {
                await Util.syncDelay(DELAY_MS);
            } else {
                await new Promise((r) => setTimeout(r, DELAY_MS));
            }

            safetyLoop++;
        }
    }

    getWrapInjectStyleOfSheetGuitarpuFloatAreaMarkOfYuehImg(floatArea) {
        return Util.getVisibleOrNone(!this.isComponentView() && this.hasCopyright(), true);
    }

    onSheetAdjustCenterLinkButtonClicked(param) {
        this.copyCurrentLinkToClipboard();
    }

    getInjectStyleOfSheetAdjustCenterLinkButton(center) {
        return Util.getVisibleOrNone(this.rulesOfAllowEditFunction(), true);
    }

    hasCopyright = () => {
        return this.getStore().getCurrentPu().getCopyright();
    };

    onSheetAdjustCenterEditorButtonClicked(param) {
        Router.gotoChordiventorPage(this, this.getStore().getCurrentPu().getId());
    }

    rulesOfAllowEditFunction = () => {
        const rule1 = UserInfoRef.isAdmin();
        const rule2 = !this.isComponentView();
        const rule3 = Util.isEqual(this.getStore().getCurrentPu().getIdOfAuthor(), UserInfoRef.getUid());
        return rule2 && (rule3 || rule1);
    };

    getWrapInjectStyleOfSheetGuitarpuSpeedOfRhythmTypography(guitarpu) {
        return Util.getVisibleOrNone(this.getStore().getCurrentPu().getSpeed() > 1, true);
    }

    getWrapInjectStyleOfSheetGuitarpuCapoTypography(guitarpu) {
        return Util.getVisibleOrNone(this.getStore().getCurrentPu().getCapoLevel() >= 0, true);
    }

    getInjectStyleOfSheetAdjustCenterEditorButton(center) {
        return Util.getVisibleOrNone(this.rulesOfAllowEditFunction(), true);
    }

    getInjectStyleOfSheetGuitarpuImageOfPreludeImg(guitarpu) {
        return Util.getVisibleOrNone(this.getStore().getCurrentPu().getVisibleOfPrelude(), true);
    }

    getInjectStyleOfSheetNameOfSongAndSingerTypography() {
        const visible = _.size(this.getStore().getGuitarpus()) > 0;
        return Util.getVisibleOrNone(visible, true);
    }

    getInjectStyleOfSheetTipOfLoadingTypography(sheet) {
        const visible = !_.size(this.getStore().getGuitarpus()) > 0;
        return Util.getVisibleOrNone(visible, true);
    }

    getInjectStyleOfSheetAdjustCenterPreludeWrapperDiv(center) {
        return Util.getVisibleOrNone(this.getStore().getCurrentPu().getHasPrelude(), true);
    }

    onSheetGuitarpuDivWrapClicked(param) {
        this.getStore().toggleIsAdjustVisible();
    }

    onSheetAdjustCenterSharpenButtonClicked(param) {
        this.getStore().refreshTickOfAdjustController();
        this.getStore().invalidateTranspositionChord(1);
    }

    onSheetAdjustCenterFlattenButtonClicked(param) {
        this.getStore().refreshTickOfAdjustController();
        this.getStore().invalidateTranspositionChord(-1);
    }

    onSheetAdjustCenterEnlargeButtonClicked(param) {
        this.getStore().refreshTickOfAdjustController();
        this.adjustBunchOfFontSizeByClassName("SheetGuitarpuCurrentContextTypography");

        this.logMetrics("SheetGuitarpuCurrentContextTypography", "SheetGuitarpuPaperWrap");
    }

    onSheetAdjustCenterShrinkButtonClicked(param) {
        this.getStore().refreshTickOfAdjustController();
        this.adjustBunchOfFontSizeByClassName("SheetGuitarpuCurrentContextTypography", false);
    }

    onSheetAdjustCenterToggleOfJoinToFavoriteSwitchChange(param) {
        this.getStore().refreshTickOfAdjustController();
        this.exeAsyncT(this.getStore().submitFavoritePuState(this.getCheckStateByEvent(param.view)));
    }

    onSheetAdjustCenterToggleOfHideChordSwitchChange(param) {
        this.getStore().refreshTickOfAdjustController();
        this.getStore().setVisibleOfChordInContext(this.getCheckStateByEvent(param.view));
    }

    onSheetAdjustCenterToMaleTonalityButtonClicked(param) {
        this.getStore().refreshTickOfAdjustController();
        this.getStore().transpositionByGender("male");
        this.showMessageOfSucceedOnTonalityChange(this.getCenterToMaleTonality(param.object));
    }

    onSheetAdjustCenterToFemaleTonalityButtonClicked(param) {
        this.getStore().refreshTickOfAdjustController();
        this.getStore().transpositionByGender("female");
        this.showMessageOfSucceedOnTonalityChange(this.getCenterToFemaleTonality(param.object), "warning");
    }

    onSheetAdjustCenterToOriginalTonalityButtonClicked(param) {
        this.getStore().refreshTickOfAdjustController();
        this.getStore().transpositionByGender("original");
        this.showMessageOfSucceedOnTonalityChange(this.getCenterToOriginalTonality(param.object));
    }

    onSheetAdjustCenterPreludeOfGButtonClicked(param) {
        this.getStore().refreshTickOfAdjustController();
        this.getStore().getCurrentPu().setVisibleOfPrelude(true);
        this.getStore().getCurrentPu().setImageOfPrelude(this.getStore().getCurrentPu().getPathOfPreludeG());
    }

    onSheetAdjustCenterPreludeOfCButtonClicked(param) {
        this.getStore().refreshTickOfAdjustController();
        this.getStore().getCurrentPu().setVisibleOfPrelude(true);
        this.getStore().getCurrentPu().setImageOfPrelude(this.getStore().getCurrentPu().getPathOfPreludeC());
    }

    showMessageOfSucceedOnTonalityChange(text, type = "info") {
        /**
         *
         * type = info, warning
         *
         * 顯示出來的toast會咬住最上層的touch event, 讓體驗變差勁
         * */
        const message = `完成 「${text}」`;
        if (Util.isEqual(type, "info")) this.showInfoSnackMessage(message);
        else this.showWarningSnackMessage(message);
    }

    getInjectStyleOfSheetAdjustCenterJoinToFavoriteFormControlLabel(center) {
        return Util.getVisibleOrNone(UserInfoRef.isLoginWithSucceed());
    }

    SheetGuitarpusCurrentContextView = observer(({ guitarpu }) => {
        const self = this;
        const currentContext = self.getGuitarpuCurrentContext(guitarpu);
        const segments = Util.getSegmentsOfEachLine(currentContext);

        return segments.map((segment, index) => (
            <Typography
                key={`unique${index}`}
                className={"SheetGuitarpuCurrentContextTypography"}
                style={{
                    ...{
                        fontWeight: self.getStore().isGuitarChordParagraph(segment) ? "bold" : "normal",
                        color: self.getStore().isGuitarChordParagraph(segment) ? "#1976D2" : "#000000"
                    },
                    ...Style.SheetGuitarpuCurrentContextTypography
                }}>
                {self.handleTextString(segment)}
            </Typography>
        ));
    });
}

export default SheetComponent;
