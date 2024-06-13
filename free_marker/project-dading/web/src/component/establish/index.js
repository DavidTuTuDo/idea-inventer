const edit = true;
import {inject} from "mobx-react";
import {utiller as Util, exceptioner as ERROR, pooller as InfinitePool} from "utiller";
import _ from "lodash";
import {observer} from "mobx-react";
import {Application} from "../../";
import BaseEstablishComponent from "./BaseEstablishComponent";

@inject("establish")
@observer
class EstablishComponent extends BaseEstablishComponent {
    /** -------------------- fields -------------------- **/

    /** -------------------- functions -------------------- **/

    constructor(props) {
        super(props);
    }

    onEstablishCancelChipClicked(param) {
        this.dismiss();
    }

    onEstablishClearChipClicked(param) {
        this.getStore().clean()
    }

    onEstablishSubmitChipClicked(param) {
        this.getStore().submitOrder().then((result) => this.showInfoSnackMessage(`新增訂單成功`))
    }

    onEstablishUpdateChipClicked(param) {
        this.getStore().updateOrder().then((result) => this.showInfoSnackMessage(`更新訂單成功`))
    }

    getInjectStyleOfEstablishSubmitChip(establish) {
        return Util.getVisibleOrNone(_.isEmpty(establish.getId()), true);
    }

    getInjectStyleOfEstablishUpdateChip(establish) {
        return Util.getVisibleOrNone(!_.isEmpty(establish.getId()), true);
    }

    getWrapInjectStyleOfEstablishIdTypography(establish) {
        return Util.getVisibleOrNone(!_.isEmpty(establish.getId()), true);
    }

    onEstablishBtnOfIdIconButtonClicked(param) {
        const order = param.object;
        this.copyTextToClipboard(order.getId(), `已複製訂單編號至剪貼簿`)
    }

    onEstablishPersonNameChipDeleted(param) {
        const person = param.object;
        this.getStore().deleteMemberById(person.getId());
    }

    onEstablishLabelOfListChipClicked(param) {
        const self = this;
        this.getEstablishPaperAlertDialogRef().open();
        Application.getAdditionStore().pushTasksOfCompleted((store) => {
            store.setIsListMode(true);
            store.setMembers(...self.getStore().getMembers())
        })
    }

    onEstablishLabelOfAppendChipClicked(param) {
        this.getEstablishPaperAlertDialogRef().open();
    }

    onEstablishPersonNameChipClicked(param) {
        const person = param.object;
        const member = this.getStore().getMemberById(person.getId()).columnData();
        this.getEstablishPaperAlertDialogRef().open();
        Application.getAdditionStore().pushTasksOfCompleted((store) => {
            store.setIsUpdate(true);
            store.setMembers(...[member]);
        })
    }

    onEstablishAppendOfIncomeChipClicked(param) {
        this.getAreaOfIncomeDivAlertDialogRef().open();
    }

    onEstablishListOfIncomeChipClicked(param) {
        const self = this;
        this.getAreaOfIncomeDivAlertDialogRef().open();
        Application.getReimburseStore().pushTasksOfCompleted((store) => {
            store.setIsListMode(true);
            store.setRecords(...self.getStore().getRecords())
        })
    }

    /** -------------------- async api -------------------- **/
}

export default EstablishComponent;
