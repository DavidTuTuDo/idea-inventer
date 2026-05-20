const edit = true;

import { utiller as Util, exceptioner as ERROR } from "utiller";
import _ from "lodash";
import BaseDionysusApolloStore from "./BaseDionysusApolloStore";

import dayjs from "dayjs";
import customParseFormat from "dayjs/plugin/customParseFormat";
import isoWeek from "dayjs/plugin/isoWeek";
import isSameOrBefore from "dayjs/plugin/isSameOrBefore";

dayjs.extend(customParseFormat);
dayjs.extend(isoWeek);
dayjs.extend(isSameOrBefore);

/**
 * 模組化的酒神阿波羅商店 - 處理課程排期邏輯
 * 已全面從 Moment.js 遷移至 Day.js，具備輕量、高效與不可變特性。
 */
class ModularizedDionysusApolloStore extends BaseDionysusApolloStore {
    constructor(props) {
        super(props);
    }

    /**
     * 建立一個 Dayjs 物件，時間來自參數，日期為今天
     * @param {string} [timeStr="08:00"] - 時間字串，格式 'HH:mm'
     */
    getSpecificTimeOfMoment = (timeStr = "08:00") => {
        const [hour, minute] = timeStr.split(":").map(Number);
        return dayjs().set("hour", hour).set("minute", minute).set("second", 0).set("millisecond", 0);
    };

    /**
     * 智慧月底判定：如果今天距離月底 < 5 天，回傳下個月月底，否則回傳本月底
     */
    getSmartEndOfMonth = () => {
        const now = dayjs();
        const endOfThisMonth = now.endOf("month");
        const diffDays = endOfThisMonth.diff(now, "days");
        return diffDays < 5 ? now.add(1, "month").endOf("month") : endOfThisMonth;
    };

    /**
     * 智慧月初判定：若離本月底 < 5 天，回傳下個月月初；否則回傳明日此時
     */
    getSmartMomentOrNextMonthStart() {
        const now = dayjs();
        const endOfThisMonth = now.endOf("month");
        const daysLeft = endOfThisMonth.diff(now, "days");

        return daysLeft < 5 ? now.add(1, "month").startOf("month") : now.add(1, "day");
    }

    async onInitialFetchCompleted(collection) {
        this.setEndOfDate(this.getSmartEndOfMonth());
        this.setStartOfDate(this.getSmartMomentOrNextMonthStart());
        this.setTimeOfStart(this.getSpecificTimeOfMoment("09:00"));
        this.setTimeOfEnd(this.getSpecificTimeOfMoment("20:00"));
    }

    onScheduleConfirmSubmit = async () => {
        const dateRange = `${this.getStartOfDate().format("YYYY/MM/DD")}-${this.getEndOfDate().format("YYYY/MM/DD")}`;
        const timeRange = `${this.getTimeOfStart().format("HH:mm")}-${this.getTimeOfEnd().format("HH:mm")}`;
        const classDuration = this.getDurationOfTask();
        const breakBetween = this.getIntervalOfTask();
        const weeklyHolidays = this.getOffDays().map((each) => each.getValue());
        const excludePeriods = this.getRestPeriods().map((each) => each.getLabel());

        const obj = { dateRange, timeRange, classDuration, breakBetween, weeklyHolidays, excludePeriods };
        Util.appendInfo("generateSchedule() 參數們：", obj);

        const component = this.getComponent(true);
        const func = component.funcOfDialogCallback();
        try {
            const result = await this.generateSchedule(obj);
            Util.appendInfo("generateSchedule() 產出們：", result);
            await func(result);
            component.dismiss();
        } catch (error) {
            component.showWarningSnackMessage(error.message);
        }
    };

    /**
     * 核心演算法：生成排期表
     */
    async generateSchedule({ dateRange, timeRange, classDuration, breakBetween, weeklyHolidays, excludePeriods, lang = "zh" }) {
        const weekdayMap = {
            en: ["(Su)", "(Mo)", "(Tu)", "(We)", "(Th)", "(Fr)", "(Sa)"],
            zh: ["(日)", "(一)", "(二)", "(三)", "(四)", "(五)", "(六)"]
        };

        const parseROC = (rocStr) => {
            const [y, m, d] = rocStr.split("/").map(Number);
            if (!y || !m || !d) throw new Error(`無效日期格式: ${rocStr}`);
            // 使用 YYYY-M-D 格式解析，相容性最高
            const djs = dayjs(`${y}-${m}-${d}`, "YYYY-M-D");
            if (!djs.isValid()) throw new Error(`日期內容不合法: ${rocStr}`);
            return djs;
        };

        const [startStr, endStr] = dateRange.split("-");
        const start = parseROC(startStr);
        const end = parseROC(endStr);

        if (start.isAfter(end)) throw new Error("起始日期不能晚於結束日期");
        if (start.isBefore(dayjs().startOf("day"))) throw new Error("起始日期不能是過去日期");

        const [workStartStr, workEndStr] = timeRange.split("-");
        const workStart = dayjs(workStartStr, "HH:mm");
        const workEnd = dayjs(workEndStr, "HH:mm");

        const breaks = excludePeriods.map((period) => {
            const [from, to] = period.split("-");
            return [dayjs(from, "HH:mm"), dayjs(to, "HH:mm")];
        });

        // 1️⃣ 生成日期陣列
        const dateList = [];
        let cursor = start;
        let lastYear = cursor.year();

        while (cursor.isSameOrBefore(end, "day")) {
            const dow = cursor.isoWeekday(); // 需要 isoWeek 插件
            if (!weeklyHolidays.includes(dow)) {
                const weekday = weekdayMap[lang][cursor.day()];
                const showFullYear = cursor.year() !== lastYear;

                // 邏輯需求：第一次跨年顯示完整年份
                const dateStr = showFullYear ? `${cursor.format("YYYY/MM/DD")} ${weekday}` : `${cursor.format("YYYY/MM/DD")} ${weekday}`;

                dateList.push(dateStr);
                lastYear = cursor.year();
            }
            cursor = cursor.add(1, "day"); // Day.js 是 Immutable 的
        }

        // 2️⃣ 生成課程時段陣列
        const classList = [];
        let timeCursor = workStart;

        while (!timeCursor.add(classDuration, "minutes").isAfter(workEnd)) {
            const classEnd = timeCursor.add(classDuration, "minutes");
            const hasConflict = breaks.some(([restStart, restEnd]) => {
                // 區間衝突判斷公式
                return classEnd.isAfter(restStart) && timeCursor.isBefore(restEnd);
            });

            if (!hasConflict) {
                classList.push(`${timeCursor.format("HH:mm")}-${classEnd.format("HH:mm")}`);
            }
            timeCursor = timeCursor.add(classDuration + breakBetween, "minutes");
        }

        return { dates: dateList, classes: classList };
    }

    testOfSchedule = async () => {
        try {
            const result = await this.generateSchedule({
                dateRange: "2025/12/30-2026/01/02",
                timeRange: "08:00-21:30",
                classDuration: 90,
                breakBetween: 30,
                weeklyHolidays: [1],
                excludePeriods: ["13:00-15:00"],
                lang: "zh"
            });
            console.log("✅ 測試 產出結果:", result);
        } catch (err) {
            console.error("❌ 測試 失敗:", err.message);
        }
    };

    fetchTextsOfIndexSetter = async () => {
        const indexOfSelected = [6, 7];
        const tabs = [
            { label: "星期一", value: 1 },
            { label: "星期二", value: 2 },
            { label: "星期三", value: 3 },
            { label: "星期四", value: 4 },
            { label: "星期五", value: 5 },
            { label: "星期六", value: 6 },
            { label: "星期日", value: 7 }
        ];
        return Util.getItemsOfMarkMatching(tabs, indexOfSelected);
    };

    enableGopTopOfIndexSetter = () => false;

    submitTextsOfIndexSetter = async (rows) => {
        this.setOffDays(..._.filter(rows, (row) => Util.isEqual(true, row.belong)));
    };
}

export default ModularizedDionysusApolloStore;
