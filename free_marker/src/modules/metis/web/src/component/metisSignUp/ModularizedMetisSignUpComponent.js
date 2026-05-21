const edit = true;

import { utiller as Util, exceptioner as ERROR, pooller as InfinitePool } from "utiller";

import Router from "../../router";
import BaseMetisSignUpComponent from "./BaseMetisSignUpComponent";

class ModularizedMetisSignUpComponent extends BaseMetisSignUpComponent {
    constructor(props) {
        super(props);
    }

    isValidOfParamOfIdOfClass(idOfClass) {
        return !Util.isUndefinedNullEmpty(idOfClass);
    }

    onMetisSignUpStudentGoBackChipClicked(param) {
        Router.gotoMainPage(this.getComponentInstance());
    }

    getInjectStyleOfMetisSignUpStudentYoungDiv(establish) {
        const birthday = establish.getBirthday();
        if (Util.isUndefinedNullEmpty(birthday)) return Util.getVisibleOrNone(false, true);

        const stringOfBirthday = Util.getCustomFormatOfDatePresent(birthday, "YYYY-MM-DD");
        return Util.getVisibleOrNone(!Util.isOverSpecificAge(stringOfBirthday, 18), true);
    }

    onMetisSignUpStudentAcceptChipClicked(param) {
        const student = param.object;
        /** 檢查每個欄位有沒有正確 */
        this.exeAsyncT(this.getStore().submitStudentOfClass(student));
    }

    getInjectPropsOfMetisSignUpStudentAcceptChip(student) {
        return { disabled: student.getIsCapacityFull() };
    }
}

export default ModularizedMetisSignUpComponent;
