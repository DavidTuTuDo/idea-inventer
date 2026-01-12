const edit = true;

import React from "react";
import { makeObservable, observable, action, runInAction } from "mobx";
import { observer } from "mobx-react";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import CircularProgress from "@mui/material/CircularProgress";
import QueryBuilderIcon from "@mui/icons-material/QueryBuilder"; // Info
import VerifiedUserIcon from "@mui/icons-material/VerifiedUser"; // success
import ReportGmailerrorredIcon from "@mui/icons-material/ReportGmailerrorred"; // Error
import WarningAmberIcon from "@mui/icons-material/WarningAmber"; // warn
import { keyframes } from "@mui/system";

const THEME_CONFIG = {
    info: {
        primary: "#0288d1",
        deep: "#01579b",
        // 從 0.92 改為 0.5 (更透明)
        bg: "rgba(2, 136, 209, 0.25)",
        icon: QueryBuilderIcon,
        shadowColor: "2, 136, 209"
    },
    success: {
        primary: "#2e7d32",
        deep: "#1b5e20",
        // 從 0.92 改為 0.5
        bg: "rgba(46, 125, 50, 0.25)",
        icon: VerifiedUserIcon,
        shadowColor: "46, 125, 50"
    },
    error: {
        primary: "#d32f2f",
        deep: "#c62828",
        // Error 通常需要稍微重一點的阻擋感，設為 0.35 左右
        bg: "rgba(211, 47, 47, 0.35)",
        icon: ReportGmailerrorredIcon,
        shadowColor: "211, 47, 47"
    },
    warn: {
        primary: "#ed6c02",
        deep: "#e65100",
        // warn 設為 0.3
        bg: "rgba(237, 108, 2, 0.3)",
        icon: WarningAmberIcon,
        shadowColor: "237, 108, 2"
    }
};

class ProcessingGuardStore {
    @observable visible = false;
    @observable secondsOfProcess = 30;
    @observable message = "請勿關閉";
    @observable variant = "info";

    timerRef = null;

    constructor() {
        makeObservable(this);
    }

    @action
    show(msg = "請勿關閉畫面", seconds = 30, variant = "info") {
        this.message = msg;
        this.secondsOfProcess = seconds;
        this.variant = THEME_CONFIG[variant] ? variant : "info";
        this.visible = true;
        this.startTimer();
    }

    @action
    hide() {
        this.visible = false;
        this.stopTimer();
    }

    @action
    startTimer() {
        this.stopTimer();
        this.timerRef = setInterval(() => {
            runInAction(() => {
                if (this.secondsOfProcess > 0) {
                    this.secondsOfProcess -= 1;
                } else {
                    this.stopTimer();
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

export const storeOfProcessingGuard = new ProcessingGuardStore();

const getHeartbeatAnimation = (rgbColor) => keyframes`
    0% { transform: scale(1); opacity: 1; filter: drop-shadow(0 0 5px rgba(${rgbColor}, 0.3)); }
    15% { transform: scale(1.04); opacity: 0.95; filter: drop-shadow(0 0 15px rgba(${rgbColor}, 0.6)); }
    30% { transform: scale(1); opacity: 1; filter: drop-shadow(0 0 5px rgba(${rgbColor}, 0.3)); }
    45% { transform: scale(1.02); opacity: 0.98; filter: drop-shadow(0 0 10px rgba(${rgbColor}, 0.45)); }
    100% { transform: scale(1); opacity: 1; filter: drop-shadow(0 0 5px rgba(${rgbColor}, 0.3)); }
`;

const spinReverse = keyframes`
    0% { transform: rotate(0deg); }
    100% { transform: rotate(-360deg); }
`;

const BaseProcessingGuardView = observer(() => {
    const { visible, message, secondsOfProcess, variant } = storeOfProcessingGuard;

    if (!visible) return null;

    const currentTheme = THEME_CONFIG[variant] || THEME_CONFIG.info;
    const TargetIcon = currentTheme.icon;

    return (
        <div
            className="ProcessingGuardContainer"
            style={{
                backgroundColor: currentTheme.bg,
                cursor: "wait"
            }}>
            <Box
                className="ProcessingGuardContentWrapper"
                sx={{
                    animation: `${getHeartbeatAnimation(currentTheme.shadowColor)} 2s infinite ease-in-out`,
                    // 中間卡片保持高不透明度 (0.95)，確保文字易讀
                    backgroundColor: "rgba(255, 255, 255, 0.95)",
                    border: `1px solid rgba(255, 255, 255, 1)`,
                    boxShadow: `0 15px 50px rgba(${currentTheme.shadowColor}, 0.2)`
                }}>
                <div className="ProcessingGuardCircleSection">
                    <div
                        className="ProcessingGuardOuterRing"
                        style={{
                            animation: `${spinReverse} 5s linear infinite`,
                            borderColor: currentTheme.primary
                        }}
                    />

                    <CircularProgress className="ProcessingGuardMainLoader" size={140} thickness={3} variant="indeterminate" sx={{ color: currentTheme.primary }} />

                    <div className="ProcessingGuardTimerCenter" style={{ color: currentTheme.deep }}>
                        <span className="ProcessingGuardSeconds">{secondsOfProcess}</span>
                    </div>
                </div>

                <div className="ProcessingGuardMessageBlock" style={{ color: currentTheme.deep }}>
                    <TargetIcon className="ProcessingGuardIcon" />
                    <Typography className="ProcessingGuardText">{message}</Typography>
                </div>
            </Box>
        </div>
    );
});

export default BaseProcessingGuardView;
