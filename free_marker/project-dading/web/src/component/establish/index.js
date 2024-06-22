const edit = true;
import {inject} from "mobx-react";
import {utiller as Util, exceptioner as ERROR, pooller as InfinitePool} from "utiller";
import _ from "lodash";
import {observer} from "mobx-react";
import {Application} from "../../";
import BaseEstablishComponent from "./BaseEstablishComponent";
import MonetizationOnRounded from "@mui/icons-material/MonetizationOnRounded";
import PaymentRounded from "@mui/icons-material/PaymentRounded";
import {Face3Rounded as AdultFemale} from "@mui/icons-material";
import {FaceRounded as AdultMale} from "@mui/icons-material";
import {TagFacesRounded as ChildBoy} from "@mui/icons-material";
import {AddReactionRounded as ChildGirl} from "@mui/icons-material";
import {QuestionMarkRounded as Question} from "@mui/icons-material";


import React from 'react';

@inject("establish")
@observer
class EstablishComponent extends BaseEstablishComponent {
    /** -------------------- fields -------------------- **/

    /** -------------------- functions -------------------- **/

    constructor(props) {
        super(props);
    }

    // getInjectStyleOfEstablishMobileDiv(establish) {
    //     return Util.getVisibleOrNone(this.isMobileDevice());
    // }
    //
    // onEstablishMobilePersonNameChipDeleted(param) {
    //     const person = param.object;
    //     this.getStore().deleteMemberById(person.getId());
    // }
    //
    // onEstablishMobileLabelOfListChipClicked(param) {
    //     const self = this;
    //     this.getEstablishPaperAlertDialogRef().open();
    //     Application.getAdditionStore().pushTasksOfCompleted((store) => {
    //         store.setIsListMode(true);
    //         store.setMembers(...self.getStore().getMembers())
    //     })
    // }
    //
    // onEstablishMobileLabelOfAppendChipClicked(param) {
    //     this.getEstablishPaperAlertDialogRef().open();
    // }
    //
    // onEstablishMobilePersonNameChipClicked(param) {
    //     const person = param.object;
    //     const member = this.getStore().getMemberById(person.getId()).columnData();
    //     this.getEstablishPaperAlertDialogRef().open();
    //     Application.getAdditionStore().pushTasksOfCompleted((store) => {
    //         store.setIsUpdate(true);
    //         store.setMembers(...[member]);
    //     })
    // }
    //
    // onEstablishMobileAppendOfIncomeChipClicked(param) {
    //     this.getAreaOfIncomeDivAlertDialogRef().open();
    // }
    //
    // onEstablishMobileListOfIncomeChipClicked(param) {
    //     const self = this;
    //     this.getAreaOfIncomeDivAlertDialogRef().open();
    //     Application.getReimburseStore().pushTasksOfCompleted((store) => {
    //         store.setIsListMode(true);
    //         store.setRecords(...self.getStore().getRecords())
    //     })
    // }
    //
    // getInjectPropsOfEstablishMobilePersonNameChip(person) {
    //     const age = person.getSelectedAge();// 1:adult 2:child
    //     const gender = person.getSelectedGender(); //1:female 2:male
    //
    //     let IconOfMui;
    //     if (age === 1 && gender === 1) IconOfMui = AdultFemale;
    //     else if (age === 1 && gender === 2) IconOfMui = AdultMale;
    //     else if (age === 2 && gender === 1) IconOfMui = ChildGirl;
    //     else if (age === 2 && gender === 2) IconOfMui = ChildBoy;
    //     else IconOfMui = Question;
    //
    //     return {icon: <IconOfMui/>}
    //
    // }
    //
    // getInjectPropsOfEstablishMobileIncomeFeeOfPaidChip(income) {
    //     return {icon: income.getSelectedPayMethod() === 2 ? <PaymentRounded/> : <MonetizationOnRounded/>}
    // }
    //
    // getIncomeFeeOfPaid(income) {
    //     const fee = super.getIncomeFeeOfPaid(income);
    //     return `${fee} 元`
    // }
    //
    // onEstablishMobileIncomeFeeOfPaidChipClicked(param) {
    //     const income = param.object;
    //     const record = this.getStore().getRecordById(income.getId()).columnData();
    //     this.getAreaOfIncomeDivAlertDialogRef().open();
    //     Application.getReimburseStore().pushTasksOfCompleted((store) => {
    //         store.setIsUpdate(true);
    //         store.setRecords(...[record]);
    //     })
    // }
    //
    // onEstablishMobileIncomeFeeOfPaidChipDeleted(param) {
    //     const income = param.object;
    //     this.getStore().deleteRecordById(income.getId());
    // }
    //
    // getInjectPropsOfEstablishMobilePriceHasPaidTextField(establish) {
    //     const fee = establish.getComputedFeeOfCreditProcedure;
    //     return fee > 0 ? {helperText: `不含手續費\$${fee}元`} : {};
    // }
    //
    // getInjectPropsOfEstablishMobilePriceOfTotalTextField(establish) {
    //     const fee = establish.getComputedDiscountOfMember;
    //     return fee > 0 ? {helperText: `團員總折扣\$${fee}元`} : {};
    // }
    //
    // getInjectPropsOfEstablishMobileBalanceTextField(establish) {
    //     const fee = establish.getExpenseOfProject;
    //     return fee > 0 ? {helperText: `已收-成本\$${fee}元`} : {};
    // }


    getInjectStyleOfEstablishDesktopDiv(establish) {
        return Util.getVisibleOrNone(!this.isMobileDevice());
    }
    getInjectStyleOfEstablishDesktopAreaOfMemberDetailDiv(establish) {
        return Util.getVisibleOrNone(!this.isMobileDevice())
    }

    getInjectStyleOfEstablishDesktopVisitorFeeOfProfitTextField(visitor) {
        return Util.getVisibleOrNone(false);
    }

    getInjectStyleOfEstablishDesktopVisitorPriceTextField(visitor) {
        return Util.getVisibleOrNone(false);
    }

    isCreditCardBehavior(finance) {
        return _.isEqual(_.toNumber(finance.getSelectedStatus()),2);
    }

    isCashMonetBehavior(finance) {
        return _.isEqual(_.toNumber(finance.getSelectedStatus()),1);
    }

    getInjectStyleOfEstablishDesktopFinanceSerialOfCreditTextField(finance) {
        return Util.getVisibleOrNone(this.isCreditCardBehavior(finance),true);
    }

    getInjectStyleOfEstablishDesktopFinanceCodeOfCreditAuthTextField(finance) {
        return Util.getVisibleOrNone(this.isCreditCardBehavior(finance),true);
    }

    getInjectStyleOfEstablishDesktopFinanceAccountOfLast5NumTextField(finance) {
        return Util.getVisibleOrNone(this.isCashMonetBehavior(finance),true);
    }

    onEstablishDesktopFinanceExtraIconButtonDeleteClicked(param) {
        const self = this;
        const finance = param.object;
        return (param) => {
            if (_.size(self.getStore().getDesktop().getFinances()) > 1) finance.remove()
            else self.showInfoSnackMessage(`無法刪除僅剩的支單紀錄`)
        }
    }

    onEstablishDesktopFinanceExtraIconButtonCreateClicked(param) {
        const self = this;
        const finance = param.object;
        return (param) => {
            self.getStore().getDesktop().pushFinance({});
        }
    }

    getFinanceCreateTime(finance) {
        const ts = super.getFinanceCreateTime(finance);
        return Util.getSimpleTimeYYMMDDHHmmFormat(ts);
    }

    onEstablishDesktopVisitorExtraIconButtonCreateClicked(param) {
        const self = this;
        const visitor = param.object;
        return (param) => {
            self.getStore().getDesktop().pushVisitors( {});
        }
    }

    getFinanceSerialOfCredit(finance) {
        const original = super.getFinanceSerialOfCredit(finance);
        return Util.getStringOfCreditCardFormatted(original);
    }

    onEstablishDesktopVisitorExtraIconButtonDeleteClicked(param) {
        const self = this;
        const visitor = param.object;
        return (param) => {
            if (_.size(self.getStore().getDesktop().getVisitors()) > 1) visitor.remove()
            else self.showInfoSnackMessage(`無法刪除僅剩的一名團員`)
        }
    }

    onEstablishDesktopVisitorExtraIconButtonCopyClicked(param) {
        const self = this;
        const visitor = param.object;
        return (param) => {
            const data = visitor.columnData();
            self.getStore().getDesktop().pushVisitorsByIndex(-1, data);
        }
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

    /** -------------------- async api -------------------- **/
}

export default EstablishComponent;
