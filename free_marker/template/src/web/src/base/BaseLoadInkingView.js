const edit = true;

import React from "react";
import { makeObservable, observable, action, computed } from "mobx";
import { observer } from "mobx-react"; // 如果是 function component，通常也可以用 'mobx-react-lite'
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import CircularProgress from "@mui/material/CircularProgress";
import { keyframes } from "@mui/system";

class LoadInkingStore {
    @observable
    processedCount = 0;

    @observable
    totalCount = 0;

    @observable
    progressPercent = 0;

    @observable
    disabled = false;

    constructor() {
        makeObservable(this);
    }

    /**
     * 更新狀態函式
     */
    @action
    updateLoadInkingState(x, y, z, disabled = false) {
        this.processedCount = x;
        this.totalCount = y;
        this.progressPercent = z;
        this.disabled = disabled;
    }

    /**
     * 結束並重置
     */
    @action
    finish() {
        this.processedCount = 0;
        this.totalCount = 0;
        this.progressPercent = 0;
        this.disabled = false;
    }

    /**
     * 計算是否應該顯示元件
     */
    @computed
    get shouldShow() {
        return !this.disabled && this.processedCount > 0 && this.totalCount > 0 && this.progressPercent > 0;
    }
}

// 匯出 Store 實例
export const storeOfloadInking = new LoadInkingStore();

// --- Animations (定義在程式碼內) ---
// --- 修正後的呼吸動畫 (忽明忽滅效果) ---
const breatheAnimation = keyframes`
    0% {
        opacity: 0.2;
    }
    /* 接近消失 */
    50% {
        opacity: 1;
    }
    /* 完全顯現 */
    100% {
        opacity: 0.2;
    }
    /* 回到接近消失 */
`;

function CircularProgressWithLabel(props) {
    return (
        <Box sx={{ position: "relative", display: "inline-flex" }}>
            <CircularProgress variant="determinate" {...props} size={60} thickness={4.5} />
            <Box
                sx={{
                    top: 0,
                    left: 0,
                    bottom: 0,
                    right: 0,
                    position: "absolute",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center"
                }}>
                <Typography variant="caption" component="div" sx={{ fontWeight: "bold" }}>
                    {`${Math.round(props.value)}%`}
                </Typography>
            </Box>
        </Box>
    );
}

// 改為 Function Component 並使用 observer
const BaseLoadInkingView = observer(({ componentX }) => {
    // 必須在 function 內解構屬性，MobX 才能監控到變化
    const { processedCount, totalCount, progressPercent, shouldShow } = storeOfloadInking;
    if (!componentX.isNotNavigatorNComponentNCprtView()) return null;
    if (!shouldShow) return null;

    const titleText = processedCount === totalCount ? "檔案上傳中" : `檔案上傳中，已完成 ${processedCount}/${totalCount} 個`;

    console.log(componentX.getComponentName(), "走到了這裡");
    return (
        <div className="LoadInkingContainer">
            <Box
                className="LoadInkingBreathingContent"
                sx={{
                    // 3秒一個週期，符合人類安靜呼吸頻率
                    animation: `${breatheAnimation} 3s ease-in-out infinite`
                }}>
                <div className="LoadInkingTitle">{titleText}</div>
                <div className="LoadInkingCircle">
                    <CircularProgressWithLabel value={progressPercent} />
                </div>
            </Box>
        </div>
    );
});

export default BaseLoadInkingView;
