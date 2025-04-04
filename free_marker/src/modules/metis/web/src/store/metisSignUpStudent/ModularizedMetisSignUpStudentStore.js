const edit = true;

import {utiller as Util, exceptioner as ERROR, pooller as InfinitePool} from "utiller";
import _ from "lodash";
import BaseMetisSignUpStudentStore from "./BaseMetisSignUpStudentStore";
import MyClazz from '../metisClazz';
class ModularizedMetisSignUpStudentStore extends BaseMetisSignUpStudentStore {

    constructor(props) {
        super(props);
    }

    async onInitialCompleted(object) {
        const self = this;
        let idOfClass = '';
        Util.syncDelay(1).then(() => {
            const apiOfClazz = new MyClazz();
            idOfClass = Util.getTailStringSplitBy(window.location.href, '/')
            return Util.isUndefinedNullEmpty(idOfClass) ? Promise.resolve('') : apiOfClazz.fetchClazzItem(self.getComponent(), idOfClass)
        }).then((clazzItem) => {
            if (!Util.isUndefinedNullEmpty(clazzItem)) {
                self.itemOfClazz = clazzItem;

                self.setNameOfClass(`${clazzItem.nameOfClass}：（講師： ${clazzItem.nameOfHost}）`);
                self.setDatOfPeriodWithHours(`${Util.getStringOfFormatTimestampRange(this.normalizeTimestamp(clazzItem.startOfSpecificClass),
                    this.normalizeTimestamp(clazzItem.endOfSpecificClass))} (合計：${self.getStringOfHours(clazzItem)})`)
                self.setIdOfClass(idOfClass);

                if (clazzItem.countsOfStudentCapacity <= clazzItem.countsOfRegistered) {
                    this.setAccept(`名額已滿`);
                    this.setIsCapacityFull(true);
                }

            }
        })
    }

    getStringOfHours = (clazz) => {
        if (clazz && clazz.classTimes)
            return Util.getStringOfCalculateClassTime(this.normalizeTimestamp(clazz.startOfSpecificClass), this.normalizeTimestamp(clazz.endOfSpecificClass),
                _.sum(clazz.classTimes.map(time => Util.getNumberOfPeriodMinute(this.normalizeTimestamp(time.startOfTime), this.normalizeTimestamp(time.endOfTime)))));
        else return `0 小時`
    }
}

export default ModularizedMetisSignUpStudentStore;
