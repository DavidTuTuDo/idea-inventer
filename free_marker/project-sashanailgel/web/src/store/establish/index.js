const edit = true
import BaseEstablishStore from "./BaseEstablishStore";
import {utiller as Util, exceptioner as ERROR, pooller as InfinitePool} from "utiller";
import _ from "lodash";

class EstablishStore extends BaseEstablishStore {
    /** -------------------- fields -------------------- **/

    /** -------------------- functions -------------------- **/

    constructor(props) {
        super(props);
    }

    async submitStudentOfClass(student) {
        if(!student.getAgreeOfContract()){
            return this.getComponent().showErrorSnackMessage(`您尚未同意課程實施合約`);
        }
        const checkmate = Util.validatePersonalInfoInput(student.getName(), student.getTextOfEmail()
            , student.getIdOfNational(), student.getContact(), student.getBirthday(),12);

        if (checkmate.valid)  {
            this.getComponent().showInfoSnackMessage(`已完成課程報名`);
            await student.submitStudentItem();
            /** send mail to 小幫手|學生 */
            /** 離開頁面 */
        } else this.getComponent().showErrorSnackMessage(checkmate.message);

    }
}

export default EstablishStore;
