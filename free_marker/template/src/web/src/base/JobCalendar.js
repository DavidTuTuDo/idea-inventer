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
import ViewWeekIcon from "@mui/icons-material/ViewWeek";
import ViewDayIcon from "@mui/icons-material/ViewDay";
import ArrowBackIosNewIcon from "@mui/icons-material/ArrowBackIosNew";
import ArrowForwardIosIcon from "@mui/icons-material/ArrowForwardIos";

/** 產生 1~23 小時陣列 */
const hours = Array.from({ length: 23 }, (_, i) => i + 1);

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

/**
 * 產生月份日曆所需的 42 格日期陣列
 * @param {number} year - 西元年
 * @param {number} month - 月份 (0-11)
 * @returns {dayjs.Dayjs[]}
 */
const generateMonthDates = (year, month) => {
    // dayjs([year, month]) 需確保 plugins 支援
    const start = dayjs(new Date(year, month)).startOf("week");
    // dayjs 是不可變的，add(i, "day") 會回傳新實例
    return Array.from({ length: 42 }, (_, i) => start.add(i, "days"));
};

/**
 * 工作日曆組件 - 支援月、週、日視圖
 */
@observer
class JobCalendar extends React.Component {
    /** @type {"month"|"week"|"day"} */
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

    /** 切換日曆模式 (月/週/日) */
    handleModeChange(_, newMode) {
        if (newMode) this.mode = newMode;
        this.triggerPeriodChanged();
    }

    /** 往前翻頁 */
    handlePrev() {
        if (this.mode === "month") this.baseDate = this.baseDate.subtract(1, "month");
        else if (this.mode === "week") this.baseDate = this.baseDate.subtract(1, "week");
        else this.baseDate = this.baseDate.subtract(1, "day");
        this.triggerPeriodChanged();
    }

    /** 往後翻頁 */
    handleNext() {
        if (this.mode === "month") this.baseDate = this.baseDate.add(1, "month");
        else if (this.mode === "week") this.baseDate = this.baseDate.add(1, "week");
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

        return (
            <Box className="JobCalendarScrollableMonthWrapper" sx={{ width: "100%", overflowX: "auto" }}>
                <Box className="JobCalendarMonthGridInner" sx={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", minWidth: 700, gap: 0.5, pr: 1 }}>
                    {days.map((d, i) => {
                        const key = formatDateKey(d);
                        const events = eventsByDay[key] || [];
                        return (
                            <Box
                                key={i}
                                className="JobCalendarMonthCell"
                                sx={{
                                    p: 1,
                                    minHeight: 100,
                                    bgcolor: d.month() === this.baseDate.month() ? "white" : "#f0f0f0",
                                    border: "1px solid #eee"
                                }}
                                onClick={() => this.handleDateClick(d)}>
                                <Typography variant="caption" color="textSecondary">
                                    {`${d.date()}(${["日", "一", "二", "三", "四", "五", "六"][d.day()]})`}
                                </Typography>
                                <Box display="flex" flexDirection="column" gap={0.5} mt={0.5}>
                                    {events.map((e) => (
                                        <Chip
                                            key={e.id}
                                            label={e.name}
                                            size="small"
                                            variant="outlined"
                                            color={e.color || "default"}
                                            onClick={(ev) => {
                                                ev.stopPropagation();
                                                console.log(e.id);
                                            }}
                                        />
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
        this.baseDate = djsObj; // dayjs 是不可變的，直接賦值即可
    };

    /** 渲染週/日視圖 (時間軸網格) */
    renderDayGrid(eventsByDay, numDays) {
        const days = Array.from({ length: numDays }, (_, i) => this.baseDate.add(i, "days"));

        return (
            <Box display="flex" overflow="auto" onTouchStart={this.onTouchStart} onTouchEnd={this.onTouchEnd}>
                <Box width={50} sx={{ position: "sticky", left: 0, bgcolor: "white", zIndex: 1 }}>
                    {hours.map((h) => (
                        <Box key={h} height={50} fontSize={12}>
                            {h}:00
                        </Box>
                    ))}
                </Box>
                {days.map((day, i) => {
                    const key = formatDateKey(day);
                    const events = (eventsByDay[key] || []).map((e) => ({
                        ...e,
                        ...parsePeriod(e.period)
                    }));

                    return (
                        <Box key={i} flex={1} borderLeft="1px solid #ccc" position="relative" minWidth={150}>
                            <Box
                                textAlign="center"
                                fontWeight="bold"
                                fontSize={12}
                                className="JobCalendarStickyDateLabel"
                                sx={{ position: "sticky", top: 0, zIndex: 2, backgroundColor: "white", borderBottom: "1px solid #ccc", py: 0.5 }}>
                                {`${day.format("M/D")}(${["日", "一", "二", "三", "四", "五", "六"][day.day()]})`}
                            </Box>
                            <Box position="relative" height={1200}>
                                {this.getPositionedEvents(events).map((e, idx) => {
                                    // 計算高度與位置
                                    const startH = e.start.hour();
                                    const startM = e.start.minute();
                                    const top = startH * 50 + (startM / 60) * 50;
                                    const height = (e.end.diff(e.start, "minutes") / 60) * 50;
                                    const widthPercent = 100 / e.totalColumns;
                                    const leftPercent = e.column * widthPercent;

                                    return (
                                        <Box
                                            key={idx}
                                            className="JobCalendarEventBlock"
                                            position="absolute"
                                            top={top}
                                            height={height}
                                            width={`${widthPercent}%`}
                                            left={`${leftPercent}%`}
                                            bgcolor="#e3f2fd"
                                            borderLeft="4px solid"
                                            borderColor={`${e.color || "primary"}.main`}
                                            borderRadius={1}
                                            fontSize={11}
                                            px={1}
                                            py={0.5}
                                            overflow="hidden"
                                            onClick={() => console.log(e.id)}>
                                            {e.name}
                                        </Box>
                                    );
                                })}
                            </Box>
                        </Box>
                    );
                })}
            </Box>
        );
    }

    /** 獲取當前模式下的起迄日期範圍 */
    getCurrentPeriodRange = () => {
        const { mode, baseDate } = this;
        if (mode === "month") {
            return [baseDate.startOf("month"), baseDate.endOf("month")];
        }
        if (mode === "week") {
            return [baseDate.startOf("week"), baseDate.endOf("week")];
        }
        return [baseDate.startOf("day"), baseDate.endOf("day")];
    };

    /** 計算事件在時間軸網格中的位置 (避免重疊) */
    getPositionedEvents = (events) => {
        // dayjs 比較需用 valueOf() 或 diff
        const sorted = [...events].sort((a, b) => a.start.valueOf() - b.start.valueOf());
        const result = [];
        let active = [];

        for (const event of sorted) {
            // 過濾已結束的事件
            active = active.filter((e) => e.end.isAfter(event.start));
            active.push(event);
            event.column = active.length - 1;
            event.totalColumns = active.length;
            result.push(event);
        }
        return result;
    };

    /** 渲染頁尾控制區 */
    renderFooterControls() {
        return (
            <Box className="JobCalendarFooterControlArea" sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mt: 1 }}>
                <Box className="JobCalendarModeToggleButtonGroup" sx={{ display: "flex" }}>
                    <IconButton onClick={() => this.handleModeChange(null, "month")} color={this.mode === "month" ? "primary" : "default"}>
                        <ViewModuleIcon />
                    </IconButton>
                    <IconButton onClick={() => this.handleModeChange(null, "week")} color={this.mode === "week" ? "primary" : "default"}>
                        <ViewWeekIcon />
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
                {this.mode === "week" && this.renderDayGrid(eventsByDay, 7)}
                {this.mode === "day" && this.renderDayGrid(eventsByDay, 1)}
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
