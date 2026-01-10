const edit = true;

import BaseDionysusApolloComponent from "./BaseDionysusApolloComponent";
import dayjs from "dayjs";
// 必須載入此插件以解析 'HH:mm' 格式
import customParseFormat from "dayjs/plugin/customParseFormat";

dayjs.extend(customParseFormat);

class ModularizedDionysusApolloComponent extends BaseDionysusApolloComponent {
    /** -------------------- fields -------------------- **/

    /** -------------------- functions -------------------- **/

    constructor(props) {
        super(props);
    }

    onDionysusApolloConfirmChipClicked(param) {
        this.exeAsyncT(this.getStore().onScheduleConfirmSubmit());
    }

    onDionysusApolloLoadChipClicked(param) {
        super.onDionysusApolloLoadChipClicked(param);
    }

    onDionysusApolloLeaveChipClicked(param) {
        this.dismiss();
    }

    onTimePeriodDialogSubmit = async (...param) => {
        const periods = this.getStore()
            .getRestPeriods()
            .map((each) => each.getLabel());
        const period = param[0];
        const result = this.checkTimeOverlap(period, periods);
        if (result.success) this.getStore().pushRestPeriods({ value: period, label: period });
        else throw Error(result.message);
    };

    onDionysusApolloRestPeriodLabelChipDeleted(param) {
        param.object.remove();
    }

    onDionysusApolloOffDayLabelChipDeleted(param) {
        param.object.remove();
    }

    /**
     * 檢查時間區間是否重疊
     * @param {string} inputRangeStr - 待檢查區間 (e.g. "12:00-13:00")
     * @param {string[]} compareRangeArray - 已存在的區間陣列
     * @returns {{success: boolean, message?: string}}
     */
    checkTimeOverlap(inputRangeStr, compareRangeArray) {
        const format = "HH:mm";

        // 將 "12:00-13:00" 拆解為 dayjs 區間
        const parseRange = (rangeStr) => {
            const [startStr, endStr] = rangeStr.split("-");
            return {
                // 使用插件解析自定義格式
                start: dayjs(startStr, format),
                end: dayjs(endStr, format),
                raw: rangeStr
            };
        };

        const A = parseRange(inputRangeStr);

        // 驗證輸入合法性：必須是有效日期且起始早於結束
        if (!A.start.isValid() || !A.end.isValid() || !A.start.isBefore(A.end)) {
            return {
                success: false,
                message: `輸入時間區間 ${inputRangeStr} 格式錯誤或起始晚於結束`
            };
        }

        for (const bStr of compareRangeArray) {
            const B = parseRange(bStr);

            if (!B.start.isValid() || !B.end.isValid() || !B.start.isBefore(B.end)) continue;

            /**
             * 重疊判斷公式：(A.start < B.end) 且 (A.end > B.start)
             * 此處使用的是 dayjs 核心的比較方法
             */
            const isOverlap = A.start.isBefore(B.end) && A.end.isAfter(B.start);

            if (isOverlap) {
                return {
                    success: false,
                    message: `${A.raw} 和當前 ${B.raw} 重疊區間`
                };
            }
        }
        return { success: true };
    }

    /** -------------------- async api -------------------- **/
}

export default ModularizedDionysusApolloComponent;
