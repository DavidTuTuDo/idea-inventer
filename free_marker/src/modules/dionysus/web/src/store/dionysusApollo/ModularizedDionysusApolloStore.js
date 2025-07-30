const edit = true;

import { utiller as Util, exceptioner as ERROR, pooller as InfinitePool } from "utiller";
import _ from "lodash";
import moment from "moment";
import BaseDionysusApolloStore from "./BaseDionysusApolloStore";

class ModularizedDionysusApolloStore extends BaseDionysusApolloStore {
    constructor(props) {
        super(props);
    }

    /**
     * 建立一個 moment 物件，時間來自參數，日期為預設值或自訂
     * @param {string} timeStr - 時間字串，例如 '14:00'
     * @returns {moment.Moment} - 可供自由 .format 的 moment 物件
     */
    getSpecificTimeOfMoment = (timeStr = "08:00") => {
        const [hour, minute] = timeStr.split(":").map(Number);
        return moment().set({ hour, minute });
    };

    /**
     * 如果今天距離月底 < 5 天，回傳下個月月底，否則回傳本月底
     * @returns {moment.Moment} moment物件
     */
    getSmartEndOfMonth = () => {
        const now = moment(); // 當下時間
        const endOfThisMonth = moment().endOf("month"); // 本月底
        const diffDays = endOfThisMonth.diff(now, "days");
        return diffDays < 5
            ? moment().add(1, "month").endOf("month") // 下個月底
            : endOfThisMonth; // 本月底
    };

    /**
     * 若離本月底 < 5 天，回傳下個月月初；否則回傳當下 moment()
     * @returns {moment.Moment} moment 物件
     */
    getSmartMomentOrNextMonthStart() {
        const now = moment();
        const endOfThisMonth = moment().endOf("month");
        const daysLeft = endOfThisMonth.diff(now, "days");

        return daysLeft < 5 ? moment().add(1, "month").startOf("month") : now;
    }

    async onInitialFetchCompleted(collection) {
        this.setEndOfDate(this.getSmartEndOfMonth());
        this.setStartOfDate(this.getSmartMomentOrNextMonthStart());
        this.setTimeOfStart(this.getSpecificTimeOfMoment("09:00"));
        this.setTimeOfEnd(this.getSpecificTimeOfMoment("20:00"));
    }

    onScheduleConfirmSubmit = async () => {
        const data = this.columnData();
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
     * 需求：
     * 1.我可以給參數日期區間（25/12/01-26/01/31）
     * 2.參數-上班時間（08:00-21:30）
     * 3.參數-課程長度（90分鐘）
     * 4.參數-課程間隔（30分鐘）
     * 5.參數-每週公休日（1-7），例［1、4］
     * 6.參數-時間時間陣列（ [13:00-15:00,17:00-18:00]）
     *
     *
     * 依據上述提昇完成，邏輯程序回傳以下值
     * 1.日期陣列(例：午休為13:00-15:00)［12/7(日),12/25(四),26/01/02(五),01/05(一)］
     * 列表中，遇到第一個跨年份的子項，要顯示年份。例26/01/02
     * 2.課程陣列（課程90分 休息30分 13:00-15:00/17:00-18:00休息）
     * [08:00- 09:30,10:00-11:30,15:00-16:30,18:00-19:30,20:00-21:30]
     *
     * const result = generateSchedule({
     *   dateRange: '25/12/01-16/01/31',
     *   timeRange: '08:00-21:30',
     *   classDuration: 90,
     *   breakBetween: 30,
     *   weeklyHolidays: [1, 4],
     *   excludePeriods: ['13:00-15:00', '17:00-18:00']
     * });
     *
     * console.log(result.dates);   // 顯示處理後的日期清單
     * console.log(result.classes); // 顯示可開課時段
     * [
     *   '12/01(日)', '12/02(一)', '25/12/31(三)',
     *   '26/01/02(五)',  // ← 第一次跨年顯示民國年 ,'01/05(一)', ...
     * ]
     *
     * [ '08:00-09:30', '10:00-11:30', '15:00-16:30','18:00-19:30','20:00-21:30'  ]
     *
     * @param {Object} config
     * @param {string} config.dateRange - 例如 '2025/12/01-2026/01/31' yy/mm/dd
     * @param {string} config.timeRange - 例如 '08:00-21:30'
     * @param {number} config.classDuration - 單堂課長度 (分鐘)
     * @param {number} config.breakBetween - 課與課間的間隔 (分鐘)
     * @param {number[]} config.weeklyHolidays - 1~7, 週一~週日
     * @param {string[]} config.excludePeriods - 排除時段 ['13:00-15:00']
     */
    async generateSchedule({ dateRange, timeRange, classDuration, breakBetween, weeklyHolidays, excludePeriods, lang = "zh" }) {
        const moment = require("moment"); // 確保 moment 有引入

        const weekdayMap = {
            en: ["(Su)", "(Mo)", "(Tu)", "(We)", "(Th)", "(Fr)", "(Sa)"],
            zh: ["(日)", "(一)", "(二)", "(三)", "(四)", "(五)", "(六)"]
        };

        const parseROC = (rocStr) => {
            const [y, m, d] = rocStr.split("/").map(Number);
            if (!y || !m || !d) throw new Error(`無效日期格式: ${rocStr}`);
            return moment(`${y}-${m}-${d}`, "YYYY-MM-DD");
        };

        // === 基本參數驗證 ===
        if (!dateRange || !dateRange.includes("-")) {
            throw new Error("dateRange 格式錯誤，應為 'yy/mm/dd-yy/mm/dd'");
        }
        const [startStr, endStr] = dateRange.split("-");
        const start = parseROC(startStr);
        const end = parseROC(endStr);

        if (!start.isValid() || !end.isValid()) throw new Error("日期格式不合法");
        if (start.isAfter(end)) throw new Error("起始日期不能晚於結束日期");
        if (start.isBefore(moment())) throw new Error("起始日期不能是過去日期");

        if (!/^[0-9]{2}:[0-9]{2}-[0-9]{2}:[0-9]{2}$/.test(timeRange)) {
            throw new Error("timeRange 格式錯誤，應為 'HH:mm-HH:mm'");
        }
        const [workStartStr, workEndStr] = timeRange.split("-");
        const workStart = moment(workStartStr, "HH:mm");
        const workEnd = moment(workEndStr, "HH:mm");

        if (!workStart.isValid() || !workEnd.isValid()) throw new Error("上班時間格式不合法");
        if (!workStart.isBefore(workEnd)) throw new Error("上班開始時間應早於結束時間");

        if (typeof classDuration !== "number" || classDuration <= 0) {
            throw new Error("classDuration 應為正整數");
        }
        if (typeof breakBetween !== "number" || breakBetween < 0) {
            throw new Error("breakBetween 應為非負整數");
        }

        if (!Array.isArray(weeklyHolidays) || weeklyHolidays.some((d) => d < 1 || d > 7)) {
            throw new Error("weeklyHolidays 必須是 1~7 整數的陣列");
        }

        if (!Array.isArray(excludePeriods)) throw new Error("excludePeriods 應為陣列");
        const breaks = excludePeriods.map((period) => {
            if (!/^[0-9]{2}:[0-9]{2}-[0-9]{2}:[0-9]{2}$/.test(period)) {
                throw new Error(`無效排除時段格式: ${period}`);
            }
            const [from, to] = period.split("-");
            const restStart = moment(from, "HH:mm");
            const restEnd = moment(to, "HH:mm");
            if (!restStart.isBefore(restEnd)) throw new Error(`排除時段 ${period} 結束時間需晚於開始時間`);
            return [restStart, restEnd];
        });

        const dateList = [];
        let cursor = start.clone();
        let lastYear = cursor.year();

        while (cursor.isSameOrBefore(end, "day")) {
            const dow = cursor.isoWeekday();
            if (!weeklyHolidays.includes(dow)) {
                const showYear = cursor.year() !== lastYear;
                const rocYear = cursor.year() - 1911;
                const day = cursor.day();
                const weekday = weekdayMap[lang][day];
                const dateStr = `${cursor.format("MM/DD")} ${weekday}`;
                dateList.push(showYear ? `${rocYear}/${dateStr}` : dateStr);
                lastYear = cursor.year();
            }
            cursor.add(1, "day");
        }

        const classList = [];
        let timeCursor = workStart.clone();

        while (timeCursor.clone().add(classDuration, "minutes").isSameOrBefore(workEnd)) {
            const classEnd = timeCursor.clone().add(classDuration, "minutes");

            const hasConflict = breaks.some(([restStart, restEnd]) => {
                return classEnd.isAfter(restStart) && timeCursor.isBefore(restEnd);
            });

            if (!hasConflict) {
                classList.push(`${timeCursor.format("HH:mm")}-${classEnd.format("HH:mm")}`);
            }

            timeCursor.add(classDuration + breakBetween, "minutes");
        }

        return {
            dates: dateList,
            classes: classList
        };
    }

    testOfSchedule = async () => {
        //✅ 測試 1：正常輸入
        const result = await this.generateSchedule({
            dateRange: "25/12/30-26/01/02",
            timeRange: "08:00-21:30",
            classDuration: 90,
            breakBetween: 30,
            weeklyHolidays: [1], // 星期一
            excludePeriods: ["13:00-15:00", "17:00-18:00"],
            lang: "zh"
        });

        console.log("✅ 測試 1 - 成功輸出:");
        console.log("日期清單:", result.dates);
        console.log("課程時段:", result.classes);

        //❌ 測試 2：起始日期早於今天
        try {
            await this.generateSchedule({
                dateRange: "23/01/01-25/12/31",
                timeRange: "08:00-21:30",
                classDuration: 90,
                breakBetween: 30,
                weeklyHolidays: [1],
                excludePeriods: []
            });
        } catch (err) {
            console.error("❌ 測試 2 - 錯誤:", err.message);
        }

        //❌ 測試 3：工作時段結束時間早於開始時間
        try {
            await this.generateSchedule({
                dateRange: "25/12/01-25/12/31",
                timeRange: "21:30-08:00",
                classDuration: 90,
                breakBetween: 30,
                weeklyHolidays: [1],
                excludePeriods: []
            });
        } catch (err) {
            console.error("❌ 測試 3 - 錯誤:", err.message);
        }

        //❌ 測試 4：排除時段格式錯誤
        try {
            await this.generateSchedule({
                dateRange: "25/12/01-25/12/31",
                timeRange: "08:00-21:30",
                classDuration: 90,
                breakBetween: 30,
                weeklyHolidays: [1],
                excludePeriods: ["1300-1500"] // 格式錯誤
            });
        } catch (err) {
            console.error("❌ 測試 4 - 錯誤:", err.message);
        }

        //❌ 測試 5：weeklyHolidays 包含不合理數字
        try {
            await this.generateSchedule({
                dateRange: "25/12/01-25/12/31",
                timeRange: "08:00-21:30",
                classDuration: 90,
                breakBetween: 30,
                weeklyHolidays: [0, 8], // 非 1~7
                excludePeriods: []
            });
        } catch (err) {
            console.error("❌ 測試 5 - 錯誤:", err.message);
        }
    };

    /** indexSetter的call function */
    fetchTextsOfIndexSetter = async () => {
        const indexOfSelected = [6, 7];
        const tabs = [
            { label: "星期一", value: 1 },
            { label: "星期二", value: 2 },
            { label: "星期三", value: 3 },
            { label: "星期四", value: 4 },
            { label: "星期五", value: 5 },
            { label: "星期天", value: 6 },
            { label: "星期日", value: 7 }
        ];
        return Util.getItemsOfMarkMatching(tabs, indexOfSelected);
    };

    enableGopTopOfIndexSetter = () => {
        return false;
    };

    submitTextsOfIndexSetter = async (rows) => {
        this.setOffDays(..._.filter(rows, (row) => _.isEqual(true, row.belong)));
    };
}

export default ModularizedDionysusApolloStore;
