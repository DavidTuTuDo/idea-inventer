const edit = true;

import React from "react";
import dayjs from "dayjs"; // 核心
import { observer } from "mobx-react";
import { makeObservable, observable, action } from "mobx";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import IconButton from "@mui/material/IconButton";
import Chip from "@mui/material/Chip";
import ViewModuleIcon from "@mui/icons-material/ViewModule";
import ViewDayIcon from "@mui/icons-material/ViewDay";
import ArrowBackIosNewIcon from "@mui/icons-material/ArrowBackIosNew";
import ArrowForwardIosIcon from "@mui/icons-material/ArrowForwardIos";

/** 格式化日期為 Key (YYYY-MM-DD) */
const formatDateKey = (djsObj) => djsObj.format("YYYY-MM-DD");

/**
 * 解析自定義期間字串
 * @param {string} periodStr - 格式 "YYYYMMDDHHmm-YYYYMMDDHHmm"
 * @returns {{start: dayjs.Dayjs, end: dayjs.Dayjs}}
 */
const parsePeriod = (periodStr) => {
    const [startStr, endStr] = periodStr.split("-");
    const format = "YYYYMMDDHHmm";
    return {
        // 使用 customParseFormat 插件
        start: dayjs(startStr, format),
        end: dayjs(endStr, format)
    };
};

const generateMonthDates = (year, month) => {
    const firstDayOfMonth = dayjs(new Date(year, month, 1));
    const offset = firstDayOfMonth.day(); // 0 是週日, 1 是週一, ...
    const start = firstDayOfMonth.subtract(offset, "days");
    return Array.from({ length: 42 }, (_, i) => start.add(i, "days"));
};

/**
 * 工作日曆組件 - 支援月、日視圖
 */
@observer
class JobCalendar extends React.Component {
    /** @type {"month"|"day"} */
    mode = "month";
    /** @type {dayjs.Dayjs} */
    baseDate = dayjs();
    touchStartX = 0;
    touchEndX = 0;

    constructor(props) {
        super(props);
        makeObservable(this, {
            mode: observable,
            baseDate: observable,
            handleModeChange: action.bound,
            handlePrev: action.bound,
            handleNext: action.bound
        });
    }

    static defaultProps = {
        onPeriodChanged: () => {},
        courses: []
    };

    /** 切換日曆模式 (月/日) */
    handleModeChange(_, newMode) {
        if (newMode) this.mode = newMode;
        this.triggerPeriodChanged();
    }

    /** 往前翻頁 */
    handlePrev() {
        if (this.mode === "month") this.baseDate = this.baseDate.subtract(1, "month");
        else this.baseDate = this.baseDate.subtract(1, "day");
        this.triggerPeriodChanged();
    }

    /** 往後翻頁 */
    handleNext() {
        if (this.mode === "month") this.baseDate = this.baseDate.add(1, "month");
        else this.baseDate = this.baseDate.add(1, "day");
        this.triggerPeriodChanged();
    }

    onTouchStart = (e) => {
        this.touchStartX = e.changedTouches[0].clientX;
    };

    onTouchEnd = (e) => {
        this.touchEndX = e.changedTouches[0].clientX;
        const dx = this.touchEndX - this.touchStartX;
        if (dx > 50) this.handlePrev();
        else if (dx < -50) this.handleNext();
    };

    /** 渲染月視圖 */
    renderMonthView(eventsByDay) {
        const days = generateMonthDates(this.baseDate.year(), this.baseDate.month());
        const today = dayjs();

        return (
            <Box className="JobCalendarScrollableMonthWrapper" sx={{ width: "100%", overflowX: "auto" }}>
                <Box className="JobCalendarMonthGridInner" sx={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", gap: 0.5, pr: 1 }}>
                    {/* 星期標頭行 (日、一、二、三、四、五、六) */}
                    {["日", "一", "二", "三", "四", "五", "六"].map((w, idx) => (
                        <Box
                            key={`weekday-header-${idx}`}
                            className={`JobCalendarWeekdayHeaderCell day-${idx}`}
                            sx={{
                                textAlign: "center",
                                py: { xs: 0.5, sm: 1 },
                                fontWeight: "bold",
                                fontSize: { xs: "0.75rem", sm: "0.85rem" }
                            }}>
                            {w}
                        </Box>
                    ))}

                    {days.map((d, i) => {
                        const key = formatDateKey(d);
                        const events = eventsByDay[key] || [];
                        const isToday = today.isSame(d, "day");
                        const isOtherMonth = d.month() !== this.baseDate.month();
                        return (
                            <Box
                                key={i}
                                className={`JobCalendarMonthCell ${isToday ? "is-today" : ""} ${isOtherMonth ? "is-other-month" : ""}`}
                                sx={{
                                    p: { xs: 0.5, sm: 1 },
                                    minHeight: { xs: 50, sm: 70, md: 100 },
                                    bgcolor: d.month() === this.baseDate.month() ? "white" : "#f0f0f0",
                                    border: "1px solid #eee"
                                }}
                                onClick={() => this.handleDateClick(d)}>
                                <Typography className="JobCalendarMonthDateLabel" variant="caption" color="textSecondary">
                                    <span className={`JobCalendarMonthNum day-${d.day()} ${d.date() === 1 || i === 0 ? "force-show" : ""}`}>{d.month() + 1}</span>
                                    <span className={`JobCalendarSlash ${d.date() === 1 || i === 0 ? "force-show" : ""}`}>/</span>
                                    <span className={`JobCalendarDateNum day-${d.day()}`}>{d.date()}</span>
                                    <span className={`JobCalendarWeekday day-${d.day()}`}>({["日", "一", "二", "三", "四", "五", "六"][d.day()]})</span>
                                </Typography>

                                <Box className="JobCalendarMonthEventContainer" display="flex" flexDirection="column" gap={0.5} mt={0.5}>
                                    {events.map((e) => (
                                        <React.Fragment key={e.id}>
                                            <Chip
                                                className="JobCalendarDesktopChip"
                                                label={e.name}
                                                size="small"
                                                variant="outlined"
                                                color={e.color || "default"}
                                                onClick={(ev) => {
                                                    ev.stopPropagation();
                                                    console.log(e.id);
                                                }}
                                            />
                                            <Box
                                                className={`JobCalendarMobileDot color-${e.color || "default"}`}
                                                onClick={(ev) => {
                                                    ev.stopPropagation();
                                                    console.log(e.id);
                                                }}
                                            />
                                        </React.Fragment>
                                    ))}
                                </Box>
                            </Box>
                        );
                    })}
                </Box>
            </Box>
        );
    }

    /** 點擊月日曆格子跳轉至該日 */
    handleDateClick = (djsObj) => {
        this.mode = "day";
        this.baseDate = djsObj;
    };

    /** 渲染日視圖 (精緻任務行程列表) */
    renderDayView(eventsByDay) {
        const key = formatDateKey(this.baseDate);
        const events = (eventsByDay[key] || []).map((e) => ({
            ...e,
            ...parsePeriod(e.period)
        }));

        // 依開始時間排序
        events.sort((a, b) => a.start.valueOf() - b.start.valueOf());

        if (events.length === 0) {
            return (
                <Box className="JobCalendarEmptyState" onTouchStart={this.onTouchStart} onTouchEnd={this.onTouchEnd}>
                    <Box className="JobCalendarEmptyIcon">📅</Box>
                    <Typography className="JobCalendarEmptyTitle" variant="subtitle1">
                        今日無排定任務
                    </Typography>
                    <Typography className="JobCalendarEmptySub" variant="body2">
                        享受輕鬆的一天，或者點擊下方按鈕切換日期
                    </Typography>
                </Box>
            );
        }

        return (
            <Box className="JobCalendarDayViewContainer" onTouchStart={this.onTouchStart} onTouchEnd={this.onTouchEnd}>
                <Box className="JobCalendarDayHeader">
                    <Typography className="JobCalendarDayTitle" variant="h6">
                        任務行程
                    </Typography>
                    <Typography className="JobCalendarDaySub" variant="body2">
                        本日共有 {events.length} 個項目
                    </Typography>
                </Box>
                <Box className="JobCalendarTaskList">
                    {events.map((e) => {
                        const startStr = e.start.format("HH:mm");
                        const endStr = e.end.format("HH:mm");
                        const diffMin = e.end.diff(e.start, "minute");
                        const hr = Math.floor(diffMin / 60);
                        const min = diffMin % 60;
                        const durationStr = hr > 0 ? `${hr} 小時${min > 0 ? ` ${min} 分鐘` : ""}` : `${min} 分鐘`;

                        const colorClass = e.color ? `color-${e.color}` : "color-default";

                        return (
                            <Box key={e.id} className={`JobCalendarTaskCard ${colorClass}`} onClick={() => console.log(e.id)}>
                                <Box className="JobCalendarTaskTimeSection">
                                    <Typography className="JobCalendarTaskStartTime" variant="h6">
                                        {startStr}
                                    </Typography>
                                    <Typography className="JobCalendarTaskEndTime" variant="caption">
                                        {endStr}
                                    </Typography>
                                </Box>
                                <Box className="JobCalendarTaskDivider" />
                                <Box className="JobCalendarTaskContentSection">
                                    <Typography className="JobCalendarTaskName" variant="subtitle1">
                                        {e.name}
                                    </Typography>
                                    <Typography className="JobCalendarTaskDuration" variant="caption">
                                        ⏱️ {durationStr}
                                    </Typography>
                                </Box>
                            </Box>
                        );
                    })}
                </Box>
            </Box>
        );
    }

    /** 獲取當前模式下的起迄日期範圍 */
    getCurrentPeriodRange = () => {
        const { mode, baseDate } = this;
        if (mode === "month") {
            return [baseDate.startOf("month"), baseDate.endOf("month")];
        }
        return [baseDate.startOf("day"), baseDate.endOf("day")];
    };

    /** 渲染頁尾控制區 */
    renderFooterControls() {
        return (
            <Box className="JobCalendarFooterControlArea" sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mt: 1 }}>
                <Box className="JobCalendarModeToggleButtonGroup" sx={{ display: "flex" }}>
                    <IconButton onClick={() => this.handleModeChange(null, "month")} color={this.mode === "month" ? "primary" : "default"}>
                        <ViewModuleIcon />
                    </IconButton>
                    <IconButton onClick={() => this.handleModeChange(null, "day")} color={this.mode === "day" ? "primary" : "default"}>
                        <ViewDayIcon />
                    </IconButton>
                </Box>
                <Box className="JobCalendarHeaderControlGroup" sx={{ display: "flex", alignItems: "center", gap: 1, mr: 1 }}>
                    <IconButton onClick={this.handlePrev}>
                        <ArrowBackIosNewIcon fontSize="small" />
                    </IconButton>
                    <Typography variant="body1" className="JobCalendarHeaderText" sx={{ fontWeight: "bold", mx: 1 }}>
                        {this.baseDate.format(this.mode === "day" ? "YYYY年 M月 D日" : "YYYY年 M月")}
                    </Typography>
                    <IconButton onClick={this.handleNext}>
                        <ArrowForwardIosIcon fontSize="small" />
                    </IconButton>
                </Box>
            </Box>
        );
    }

    render() {
        const { courses } = this.props;
        const eventsByDay = {};
        for (const course of courses) {
            const { start } = parsePeriod(course.period);
            const key = formatDateKey(start);
            if (!eventsByDay[key]) eventsByDay[key] = [];
            eventsByDay[key].push(course);
        }

        return (
            <Box className="JobCalendarWrapper" position="relative" p={1}>
                {this.mode === "month" && this.renderMonthView(eventsByDay)}
                {this.mode === "day" && this.renderDayView(eventsByDay)}
                {this.renderFooterControls()}
            </Box>
        );
    }

    componentDidMount() {
        this.triggerPeriodChanged();
    }

    /** 當日期或模式變更時，觸發外部回調 */
    triggerPeriodChanged = () => {
        const [start, end] = this.getCurrentPeriodRange();
        this.props.onPeriodChanged(start.format("YYYYMMDD"), end.format("YYYYMMDD"));
    };
}

export default JobCalendar;
