const edit = true;
import {inject} from "mobx-react";
import BaseAdditionComponent from "./BaseAdditionComponent";
import {utiller as Util, exceptioner as ERROR, pooller as InfinitePool} from "utiller";
import {observer} from "mobx-react";

@inject("addition")
@observer
class AdditionComponent extends BaseAdditionComponent {
    /** -------------------- fields -------------------- **/

    /** -------------------- functions -------------------- **/

    constructor(props) {
        super(props);
    }

    onAdditionMemberSubmitButtonClicked(param) {
        const member = param.object;
        member.joinMember2Order().then();
    }

    onAdditionMemberUpdateButtonClicked(param) {
        const member = param.object;
        member.updateMember2Order().then();
    }

    onAdditionBatchCancelChipClicked(param) {
        this.dismiss();
    }

    onAdditionMemberCancelButtonClicked(param) {
        this.dismiss();
    }

    isBatchUpdateMode = () => {
        return this.getStore().getIsListMode();
    }

    isSingleUpdateMode = () => {
        return this.getStore().getIsUpdate();
    }

    getInjectStyleOfAdditionMemberAreaOfCreditDiv(member) {
        return Util.getVisibleOrNone(member.getCharge(), true);
    }

    getInjectStyleOfAdditionMemberAreaOfPayDiv(member) {
        return Util.getVisibleOrNone(member.getCharge(), true);
    }

    getInjectStyleOfAdditionAreaOfBatchDiv(addition) {
        return Util.getVisibleOrNone(this.isBatchUpdateMode(), true);
    }

    getInjectStyleOfAdditionMemberAreaOfFuncDiv(member) {
        return Util.getVisibleOrNone(!this.isBatchUpdateMode(), true);
    }

    getInjectStyleOfAdditionMemberSubmitButton(member) {
        return Util.getVisibleOrNone(!this.isSingleUpdateMode(), true);
    }

    getInjectStyleOfAdditionMemberUpdateButton(member) {
        return Util.getVisibleOrNone(this.isSingleUpdateMode(), true);
    }

    /** -------------------- async api -------------------- **/
}

export default AdditionComponent;
