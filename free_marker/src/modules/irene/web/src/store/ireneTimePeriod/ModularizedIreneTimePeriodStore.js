const edit = true;

import { utiller as Util, exceptioner as ERROR, pooller as InfinitePool } from "utiller";
import _ from "lodash";
import moment from "moment";
import BaseIreneTimePeriodStore from "./BaseIreneTimePeriodStore";

class ModularizedIreneTimePeriodStore extends BaseIreneTimePeriodStore {
    constructor(props) {
        super(props);
    }

    onTimeConfirmSelected = async () => {
        const startTime = this.getTimeOfStart();
        const endTime = this.getTimeOfEnd();

        // 檢查開始與結束時間是否不合法（相同或結束早於開始）
        if (!endTime.isAfter(startTime)) throw new Error("開始時間與結束時間不可相同");

        const format = (t) => Util.getCustomFormatOfDatePresent(t, "HH:mm");
        const timeRange = `${format(startTime)}-${format(endTime)}`;

        const func = this.getComponent(true).funcOfDialogCallback();
        try {
            await func(timeRange);
        } catch (error) {
            throw new Error(error.message);
        }
    };
}

export default ModularizedIreneTimePeriodStore;
