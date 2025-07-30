const edit = true;

import BaseDionysusApolloComponent from "./BaseDionysusApolloComponent";
import moment from "moment";

class ModularizedDionysusApolloComponent extends BaseDionysusApolloComponent {
    /** -------------------- fields -------------------- **/

    /** -------------------- functions -------------------- **/

    constructor(props) {
        super(props);
    }

    onDionysusApolloConfirmChipClicked(param) {
        this.getStore().onScheduleConfirmSubmit().then();
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

    checkTimeOverlap(inputRangeStr, compareRangeArray) {
        const format = "HH:mm";
        // 將 "12:00-13:00" 拆解為 moment 區間
        const parseRange = (rangeStr) => {
            const [startStr, endStr] = rangeStr.split("-");
            return {
                start: moment(startStr, format),
                end: moment(endStr, format),
                raw: rangeStr
            };
        };
        const A = parseRange(inputRangeStr);
        if (!A.start.isValid() || !A.end.isValid() || !A.start.isBefore(A.end)) {
            return {
                succeed: false,
                message: `輸入時間區間 ${inputRangeStr} 格式錯誤或起始晚於結束`
            };
        }
        for (const bStr of compareRangeArray) {
            const B = parseRange(bStr);

            if (!B.start.isValid() || !B.end.isValid() || !B.start.isBefore(B.end)) continue; // 忽略錯誤的 compare 區間

            // 重疊條件：A.start < B.end && A.end > B.start
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
