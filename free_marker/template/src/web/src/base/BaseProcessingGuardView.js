import React from "react";
import { makeObservable, observable, action, runInAction } from 'mobx';
import { observer } from 'mobx-react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import CircularProgress from '@mui/material/CircularProgress';
import Fitbit from '@mui/icons-material/Fitbit'; // 增加警示圖示
import { keyframes } from '@mui/system';

class ProcessingGuardStore {

    @observable
    visible = false;

    @observable
    secondsOfProcess = 30; // 預設 30 秒

    @observable
    message = "交易進行中，請勿關閉";

    timerRef = null;

    constructor() {
        makeObservable(this);
    }

    /**
     * 啟動防護遮罩
     * @param {string} msg - 提示訊息
     * @param {number} seconds - 倒數秒數
     */
    @action
    show(msg = "交易進行中，請勿關閉", seconds = 30) {
        this.message = msg;
        this.secondsOfProcess = seconds;
        this.visible = true;
        this.startTimer();
    }

    /**
     * 隱藏防護遮罩
     */
    @action
    hide() {
        this.visible = false;
        this.stopTimer();
    }

    @action
    startTimer() {
        this.stopTimer(); // 先清除舊的
        this.timerRef = setInterval(() => {
            runInAction(() => {
                if (this.secondsOfProcess > 0) {
                    this.secondsOfProcess -= 1;
                } else {
                    this.stopTimer();
                    // 倒數結束後的邏輯，例如自動關閉或顯示超時，這裡保留為維持顯示
                }
            });
        }, 1000);
    }

    @action
    stopTimer() {
        if (this.timerRef) {
            clearInterval(this.timerRef);
            this.timerRef = null;
        }
    }
}

// 匯出 Store 實例
export const processingGuardStore = new ProcessingGuardStore();

// --- Animations (心跳/脈衝效果) ---
// 模擬心跳頻率：快速收縮再舒張
const heartbeatAnimation = keyframes`
    0% { transform: scale(1); opacity: 1; filter: drop-shadow(0 0 5px rgba(46, 125, 50, 0.3)); }
    15% { transform: scale(1.04); opacity: 0.9; filter: drop-shadow(0 0 15px rgba(46, 125, 50, 0.6)); }
    30% { transform: scale(1); opacity: 1; filter: drop-shadow(0 0 5px rgba(46, 125, 50, 0.3)); }
    45% { transform: scale(1.02); opacity: 0.95; filter: drop-shadow(0 0 10px rgba(46, 125, 50, 0.4)); }
    100% { transform: scale(1); opacity: 1; filter: drop-shadow(0 0 5px rgba(46, 125, 50, 0.3)); }
`;

// 外圈旋轉特效
const spinReverse = keyframes`
  0% { transform: rotate(0deg); }
  100% { transform: rotate(-360deg); }
`;

// --- Component ---
const ProcessingGuardView = observer(({ componentX }) => {
    const { visible, message, secondsOfProcess } = processingGuardStore;
    if(!componentX.isNotNavigatorNComponentNCprtView()) return null;
    if (!visible) return null;

    return (
        <div className="ProcessingGuardContainer">
            <Box
                className="ProcessingGuardContentWrapper"
                sx={{
                    // 套用心跳動畫到整個中央區塊
                    animation: `${heartbeatAnimation} 1.5s infinite ease-in-out`
                }}
            >
                {/* 科技感圓形 Loading 區塊 */}
                <div className="ProcessingGuardCircleSection">
                    {/* 外層裝飾圈 (反向旋轉) */}
                    <div className="ProcessingGuardOuterRing" style={{ animation: `${spinReverse} 3s linear infinite` }} />

                    {/* 主要 Loading Bar */}
                    <CircularProgress
                        className="ProcessingGuardMainLoader"
                        size={140}
                        thickness={3}
                        variant="indeterminate"
                        sx={{ color: '#2e7d32' }} // 安全深綠色
                    />

                    {/* 中央倒數秒數 */}
                    <div className="ProcessingGuardTimerCenter">
                        <span className="ProcessingGuardSeconds">{secondsOfProcess}</span>
                        <span className="ProcessingGuardUnit">sec</span>
                    </div>
                </div>

                {/* 警告文字區塊 */}
                <div className="ProcessingGuardMessageBlock">
                    <Fitbit className="ProcessingGuardIcon" />
                    <Typography className="ProcessingGuardText">
                        {message}
                    </Typography>
                </div>
            </Box>
        </div>
    );
});

export default ProcessingGuardView;
