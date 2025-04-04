const edit = true;

import {utiller as Util, exceptioner as ERROR, pooller as InfinitePool} from "utiller";
import _ from "lodash";
import BaseMetisSignUpStore from "./BaseMetisSignUpStore";

class ModularizedMetisSignUpStore extends BaseMetisSignUpStore {

    constructor(props) {
        super(props);
    }

    async onInitialCompleted(object) {
        const self = this;
        Util.syncDelay(1).then(() => {
            this.getStudents().map(async (student) => {
                await student.onInitialCompleted()
            })
        })
    }

    async submitStudentOfClass(student) {
        if (!student.getAgreeOfContract()) {
            return this.getComponent().showErrorSnackMessage(`您尚未同意課程實施合約`);
        }
        const checkmate = Util.validatePersonalInfoInput(student.getName(), student.getTextOfEmail()
            , student.getIdOfNational(), student.getContact(), student.getBirthday(), 12);

        if (checkmate.valid) {
            await student.submitStudentItem();
            const api = new MyClazz();
            await api.updateIncrementCountsOfRegistered(this.getComponent(), student.getIdOfClass());
            this.getComponent().showInfoSnackMessage(`已完成課程報名`);

            /** clean */
            student.setName('');
            student.setTextOfEmail('');
            student.setIdOfNational('')
            student.setContact('');
            student.setBirthday(null);
            student.toggleAgreeOfContract();


            /** send mail to 小幫手|學生 */
            /** 離開頁面 */
        } else this.getComponent().showErrorSnackMessage(checkmate.message);
    }

}

export default ModularizedMetisSignUpStore;
