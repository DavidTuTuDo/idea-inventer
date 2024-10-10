const edit = true;
import BaseEstablishStudentStore from "./BaseEstablishStudentStore";
import {utiller as Util, exceptioner as ERROR, pooller as InfinitePool} from "utiller";
import _ from "lodash";
import MyClazz from '../quickSignUpClazz'

class EstablishStudentStore extends BaseEstablishStudentStore {
    /** -------------------- fields -------------------- **/

    /** -------------------- functions -------------------- **/

    constructor(props) {
        super(props);
    }

    onInitialCompleted(object) {
        const apiOfClazz = new MyClazz();
        const self = this;
        const idOfClass = Util.getTailStringSplitBy(window.location.href, '/')
        self.setIdOfClass(idOfClass);
        Util.syncDelay(1).then(() => {
            return apiOfClazz.fetchClazzItem(self.getComponent(), idOfClass)
        }).then((clazzItem) => {
            self.setNameOfClass(`${clazzItem.nameOfClass}：（講師： ${clazzItem.nameOfHost}）`);
            self.setDatOfPeriodWithHours(`${Util.getStringOfFormatTimestampRange(this.normalizeTimestamp(clazzItem.startOfSpecificClass),
                this.normalizeTimestamp(clazzItem.endOfSpecificClass))} (合計：${self.getStringOfHours(clazzItem)})`)
        })
    }


    getStringOfHours(clazz) {
        return Util.getStringOfCalculateClassTime(this.normalizeTimestamp(clazz.startOfSpecificClass), this.normalizeTimestamp(clazz.endOfSpecificClass),
            _.sum(clazz.classTimes.map(time => Util.getNumberOfPeriodMinute(this.normalizeTimestamp(time.startOfTime), this.normalizeTimestamp(time.endOfTime)))));
    }

    /** -------------------- async api -------------------- **/
}

export default EstablishStudentStore;
