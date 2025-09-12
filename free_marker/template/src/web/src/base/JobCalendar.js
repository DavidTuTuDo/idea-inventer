const edit = true;

import React from "react";
import moment from "moment";
import { observer } from "mobx-react";
import { makeObservable, observable, action } from "mobx";
import { Box, Typography, IconButton, Chip } from "@mui/material";
import ViewModuleIcon from "@mui/icons-material/ViewModule";
import ViewWeekIcon from "@mui/icons-material/ViewWeek";
import ViewDayIcon from "@mui/icons-material/ViewDay";
import ArrowBackIosNewIcon from "@mui/icons-material/ArrowBackIosNew";
import ArrowForwardIosIcon from "@mui/icons-material/ArrowForwardIos";

const hours = Array.from({ length: 23 }, (_, i) => i + 1);
const formatDateKey = (momentObj) => momentObj.format("YYYY-MM-DD");
const parsePeriod = (periodStr) => {
    const [startStr, endStr] = periodStr.split("-");
    const format = "YYYYMMDDHHmm";
    return {
        start: moment(startStr, format),
        end: moment(endStr, format)
    };
};

const generateMonthDates = (year, month) => {
    const start = moment([year, month]).startOf("week");
    return Array.from({ length: 42 }, (_, i) => start.clone().add(i, "days"));
};

@observer
class JobCalendar extends React.Component {
    mode = "month";
    baseDate = moment();
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
        onPeriodChanged: () => {}
    };

    handleModeChange(_, newMode) {
        if (newMode) this.mode = newMode;
        this.triggerPeriodChanged();
    }

    handlePrev() {
        if (this.mode === "month") this.baseDate = this.baseDate.clone().subtract(1, "month");
        else if (this.mode === "week") this.baseDate = this.baseDate.clone().subtract(1, "week");
        else this.baseDate = this.baseDate.clone().subtract(1, "day");
        this.triggerPeriodChanged();
    }

    handleNext() {
        if (this.mode === "month") this.baseDate = this.baseDate.clone().add(1, "month");
        else if (this.mode === "week") this.baseDate = this.baseDate.clone().add(1, "week");
        else this.baseDate = this.baseDate.clone().add(1, "day");
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

    renderMonthView(eventsByDay) {
        const days = generateMonthDates(this.baseDate.year(), this.baseDate.month());

        return (
            <Box
                className="JobCalendarScrollableMonthWrapper"
                sx={{
                    width: "100%",
                    overflowX: "auto"
                }}>
                <Box
                    className="JobCalendarMonthGridInner"
                    sx={{
                        display: "grid",
                        gridTemplateColumns: "repeat(7, 1fr)",
                        minWidth: 700, // 關鍵：確保在手機不會壓縮到無法閱讀
                        gap: 0.5,
                        pr: 1
                    }}>
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
                                            variant={"outlined"}
                                            color={e.color || "default"}
                                            onClick={(e) => {
                                                e.stopPropagation();
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

    handleDateClick = (momentObj) => {
        this.mode = "day";
        this.baseDate = momentObj.clone();
    };

    renderDayGrid(eventsByDay, numDays) {
        const days = Array.from({ length: numDays }, (_, i) => this.baseDate.clone().add(i, "days"));

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
                                sx={{
                                    position: "sticky",
                                    top: 0,
                                    zIndex: 2,
                                    backgroundColor: "white",
                                    borderBottom: "1px solid #ccc",
                                    py: 0.5
                                }}>
                                {`${day.format("M/D")}(${["日", "一", "二", "三", "四", "五", "六"][day.day()]})`}
                            </Box>
                            <Box position="relative" height={1200}>
                                {this.getPositionedEvents(events).map((e, idx) => {
                                    const top = e.start.hours() * 50 + (e.start.minutes() / 60) * 50;
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
                                            fontSize={12}
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

    getCurrentPeriodRange = () => {
        const { mode, baseDate } = this;

        if (mode === "month") {
            const start = baseDate.clone().startOf("month");
            const end = baseDate.clone().endOf("month");
            return [start, end];
        }

        if (mode === "week") {
            const start = baseDate.clone().startOf("week");
            const end = baseDate.clone().endOf("week");
            return [start, end];
        }

        // day
        const start = baseDate.clone().startOf("day");
        const end = baseDate.clone().endOf("day");
        return [start, end];
    };

    getPositionedEvents = (events) => {
        const sorted = [...events].sort((a, b) => a.start - b.start);
        const result = [];

        let active = [];
        let lastEnd = null;

        for (const event of sorted) {
            active = active.filter((e) => e.end > event.start); // still overlapping
            active.push(event);
            event.column = active.length - 1;
            event.totalColumns = active.length;
            result.push(event);
        }

        return result;
    };

    renderFooterControls() {
        return (
            <Box
                className="JobCalendarFooterControlArea"
                sx={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center"
                }}>
                {/* 左側：模式切換 */}
                <Box className="JobCalendarModeToggleButtonGroup" sx={{ display: "flex" }}>
                    <IconButton onClick={() => this.handleModeChange(null, "month")} color={this.mode === "month" ? "primary" : "default"} className="JobCalendarToggleIconMonth">
                        <ViewModuleIcon />
                    </IconButton>
                    <IconButton onClick={() => this.handleModeChange(null, "week")} color={this.mode === "week" ? "primary" : "default"} className="JobCalendarToggleIconWeek">
                        <ViewWeekIcon />
                    </IconButton>
                    <IconButton onClick={() => this.handleModeChange(null, "day")} color={this.mode === "day" ? "primary" : "default"} className="JobCalendarToggleIconDay">
                        <ViewDayIcon />
                    </IconButton>
                </Box>

                {/* 右側：日期＋左右按鈕 */}
                <Box
                    className="JobCalendarHeaderControlGroup"
                    sx={{
                        display: "flex",
                        alignItems: "center",
                        gap: 1,
                        mr: 1
                    }}>
                    <IconButton onClick={this.handlePrev} className="JobCalendarArrowOfEcpaySetIconNavigatePrev">
                        <ArrowBackIosNewIcon fontSize="small" />
                    </IconButton>

                    <Typography variant="h6" className="JobCalendarHeaderText" sx={{ fontWeight: "bold", mx: 1 }}>
                        {this.baseDate.format(this.mode === "day" ? "YYYY年 M月 D日" : "YYYY年 M月")}
                    </Typography>

                    <IconButton onClick={this.handleNext} className="JobCalendarArrowOfEcpaySetIconNavigateNext">
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
            <Box className="JobCalendarWrapper" position="relative" p={2}>
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

    triggerPeriodChanged = () => {
        const [start, end] = this.getCurrentPeriodRange();
        const format = (m) => m.format("YYYYMMDD");
        this.props.onPeriodChanged(format(start), format(end));
    };
}

export default JobCalendar;
