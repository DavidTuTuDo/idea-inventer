const edit = true;
import {inject} from "mobx-react";
import BaseEstablishComponent from "./BaseEstablishComponent";
import {utiller as Util, exceptioner as ERROR, pooller as InfinitePool} from "utiller";
import _ from "lodash";
import libpath from "path";
import {observer} from "mobx-react";
import Router from "../../router";

@inject("establish")
@observer
class EstablishComponent extends BaseEstablishComponent {
    /** -------------------- fields -------------------- **/

    /** -------------------- functions -------------------- **/

    constructor(props) {
        super(props);

    }

    isValidOfParamOfIdOfClass(idOfClass) {
        return !Util.isUndefinedNullEmpty(idOfClass);
    }

    onEstablishStudentGoBackChipClicked(param) {
        Router.gotoMainPage(this.getComponentInstance())
    }

    getInjectStyleOfEstablishStudentYoungDiv(establish) {
        const birthday = establish.getBirthday();
        if (Util.isUndefinedNullEmpty(birthday)) return Util.getVisibleOrNone(false, true);

        const stringOfBirthday = Util.getCustomFormatOfDatePresent(birthday, 'YYYY-MM-DD');
        return Util.getVisibleOrNone(!Util.isOverSpecificAge(stringOfBirthday, 18), true);
    }

    onEstablishStudentAcceptChipClicked(param) {
        const student = param.object;
        /** 檢查每個欄位有沒有正確 */
        this.getStore().submitStudentOfClass(student).then();
    }

    getInjectPropsOfEstablishStudentAcceptChip(student) {
        return {disabled: student.getIsCapacityFull()};
    }

    /** -------------------- async api -------------------- **/
}

export default EstablishComponent;
