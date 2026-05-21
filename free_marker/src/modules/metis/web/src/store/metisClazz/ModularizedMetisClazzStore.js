const edit = true;

import { utiller as Util, exceptioner as ERROR, pooller as InfinitePool } from "utiller";
import { sum } from 'lodash-es';
import BaseMetisClazzStore from "./BaseMetisClazzStore";

class ModularizedMetisClazzStore extends BaseMetisClazzStore {
    constructor(props) {
        super(props);
        // this.initial()
    }

    async onInitialCompleted(object) {
        this.setDateOfPeriod(Util.getStringOfFormatTimestampRange(this.getStartOfSpecificClass(), this.getEndOfSpecificClass()));
        this.setTotalHoursOfClass(
            Util.getStringOfCalculateClassTime(
                this.getStartOfSpecificClass(),
                this.getEndOfSpecificClass(),
                sum(this.getClassTimes().map((time) => Util.getNumberOfPeriodMinute(time.getStartOfTime(), time.getEndOfTime())))
            )
        );
        this.setDateOfWeekAttend(
            this.getClassTimes()
                .map((time) => Util.getStringOfWeekTime(time.getSelectedDayOfWeek(), time.getStartOfTime(), time.getEndOfTime()))
                .join("\n")
        );

        let counts = this.getCountsOfStudentCapacity() - this.getCountsOfRegistered();

        if (Util.isEqual(counts, this.getCountsOfStudentCapacity())) counts = counts - 3;

        if (counts <= 0) counts = 0;

        this.setStateOfRegistered(`${this.getCountsOfStudentCapacity()}人 (僅剩${counts}位)`);

        if (this.getCountsOfStudentCapacity() <= this.getCountsOfRegistered()) this.setSubmit(`名額已滿`);
    }
}

export default ModularizedMetisClazzStore;
