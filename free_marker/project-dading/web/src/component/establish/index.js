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


    /** --------------------- following are rules of desktop --------------------- */

    // getInjectStyleOfEstablishDesktopVisitorFeeOfProfitTextField(visitor) {
    //     return Util.getVisibleOrNone(false);
    // }
    //
    // getInjectStyleOfEstablishDesktopVisitorPriceTextField(visitor) {
    //     return Util.getVisibleOrNone(false);
    // }
    //
    // getInjectStyleOfEstablishDesktopDiv(establish) {
    //     return Util.getVisibleOrNone(!this.isMobileDevice());
    // }

    onEstablishDesktopVisitorNameTextFieldChange(param) {
        this.getStore().getDesktop().incrementVisitorColumn(param.object);
    }

    onEstablishDesktopVisitorPriceOfPartyBTextFieldChange(param) {
        this.getStore().getDesktop().incrementVisitorColumn(param.object);
    }

    onEstablishDesktopVisitorCommentTextFieldChange(param) {
        this.getStore().getDesktop().incrementVisitorColumn(param.object);
    }

    onEstablishDesktopFinanceFeeOfPartyBTextFieldChange(param) {
        this.getStore().getDesktop().incrementFinanceColumn(param.object);
    }

    onEstablishDesktopFinanceAccountOfLast5NumTextFieldChange(param) {
        this.getStore().getDesktop().incrementFinanceColumn(param.object);
    }

    onEstablishDesktopFinanceNameOfPayPersonTextFieldChange(param) {
        this.getStore().getDesktop().incrementFinanceColumn(param.object);
    }

    getInjectStyleOfEstablishDesktopVisitorIdOfHotelRoomTextField(visitor) {
        return Util.getVisibleOrNone(_.isEqual(_.toNumber(this.getStore().getDesktop().getInfo().getSelectedRoomArrange()), 2), true)
    }

    getInjectStyleOfEstablishDesktopTotalOfPricePartyBTextField(desktop) {
        return {background: '#e1eadd'};
    }

    getInjectStyleOfEstablishDesktopVisitorPriceOfPartyBTextField(visitor) {
        return {background: '#e1eadd'};
    }

    getInjectStyleOfEstablishDesktopTotalOfCustomizePriceTextField(desktop) {
        return {background: '#b9d2e6'}
    }

    getInjectStyleOfEstablishDesktopFinanceFeeOfPartyBTextField(finance) {
        const status = _.toNumber(finance.getSelectedRequest());
        let color = undefined;
        switch (status) {
            case 1:
                /** 現金匯款 */
                color = `#e8cea3`;
                break;
            case 2:
                /** 現金 */
                color = `#ffdddc`;
                break;
            case 3:
            case 4:
            case 5:
            case 6:
            case 7:
                color = `#b9d2e6`;
                break;
            default:
                color = undefined;

        }
        return color ? {background: color} : null;
    }

    isCreditCardBehavior(finance) {
        return _.isEqual(_.toNumber(finance.getSelectedRequest()), 2);
    }

    isCashMoneyBehavior(finance) {
        return _.isEqual(_.toNumber(finance.getSelectedRequest()), 1);
    }

    /** 支票行為 */
    isChequeBehavior(finance) {
        return Util.isOrEquals(_.toNumber(finance.getSelectedRequest()), 9, 10);
    }

    /** 代轉行為 */
    isRemittanceBehavior(finance) {
        return _.isEqual(_.toNumber(finance.getSelectedRequest()), 11);
    }

    getInjectPropsOfEstablishDesktopFinanceFeeOfPartyATextField(finance) {
        const fee = finance.getFeeOfCreditProcedure();
        return fee > 0 ? {helperText: `手續費${fee}元`} : {};
    }

    getFinanceFeeOfPartyA(finance) {
        if (this.isCreditCardBehavior(finance))
            return finance.getFeeOfComputedCreditProcedure;
        return super.getFinanceFeeOfPartyA(finance);
    }

    getInjectStyleOfEstablishDesktopFinanceFeeOfPartyATextField(finance) {
        return Util.getVisibleOrNone(!(this.isCashMoneyBehavior(finance) || this.isChequeBehavior(finance) || this.isRemittanceBehavior(finance)), true);

    }

    getInjectStyleOfEstablishDesktopFinanceNameOfPayPersonTextField(finance) {
        return Util.getVisibleOrNone(this.isChequeBehavior(finance) || this.isCashMoneyBehavior(finance) || this.isCreditCardBehavior(finance), true)
    }

    getInjectStyleOfEstablishDesktopFinanceSerialOfCreditTextField(finance) {
        return Util.getVisibleOrNone(this.isCreditCardBehavior(finance), true);
    }

    getInjectStyleOfEstablishDesktopFinanceCodeOfCreditAuthTextField(finance) {
        return Util.getVisibleOrNone(this.isCreditCardBehavior(finance), true);
    }

    getInjectStyleOfEstablishDesktopFinanceValidPeriodOfCreditTextField(finance) {
        return Util.getVisibleOrNone(this.isCreditCardBehavior(finance), true);
    }

    getInjectStyleOfEstablishDesktopFinanceAccountOfLast5NumTextField(finance) {
        return Util.getVisibleOrNone(this.isCashMoneyBehavior(finance), true);
    }

    getWrapInjectStyleOfEstablishDesktopInfoRateOfCreditTextField(info) {
        return Util.getVisibleOrHidden(false, true);
    }

    getInjectStyleOfEstablishDesktopFinanceSerialOfChequeTextField(finance) {
        return Util.getVisibleOrNone(this.isChequeBehavior(finance), true);
    }

    getWrapInjectStyleOfEstablishDesktopFinanceDateOfChequeDatePicker(finance) {
        return Util.getVisibleOrNone(this.isChequeBehavior(finance), true);
    }

    getInjectStyleOfEstablishDesktopFinanceHeadingTextField(finance) {
        return Util.getVisibleOrNone(this.isRemittanceBehavior(finance), true);
    }

    getInjectStyleOfEstablishDesktopFinanceTaxIdNumberTextField(finance) {
        return Util.getVisibleOrNone(this.isRemittanceBehavior(finance), true);
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

    onEstablishDesktopVisitorExtraIconButtonCreateClicked(param) {
        const self = this;
        const visitor = param.object;
        return (param) => {
            self.getStore().getDesktop().pushVisitors({});
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

    getInjectStyleOfEstablishDesktopVisitorNameOfPassportTextField(visitor) {
        return Util.getVisibleOrNone(false);
    }

    getWrapInjectStyleOfEstablishIdTypography(establish) {
        return Util.getVisibleOrNone(!_.isEmpty(establish.getId()), true);
    }

    onEstablishBtnOfIdIconButtonClicked(param) {
        const order = param.object;
        this.copyTextToClipboard(order.getId(), `已複製訂單編號至剪貼簿`)
    }

    onEstablishDesktopInfoIdTextFieldEndContentCopyRoundedClicked(param) {
        const id = param.object.getId();
        if (!_.isEmpty(id))
            this.copyTextToClipboard(id)
    }

    onEstablishDesktopInfoIdOfAgentTravelTextFieldEndContentCopyRoundedClicked(param) {
        const id = param.object.getIdOfAgentTravel();
        if (!_.isEmpty(id))
            this.copyTextToClipboard(id)
    }

    onEstablishDesktopVisitorExtraIconButtonGoTopClicked(param) {
        const self = this;
        const visitor = param.object;
        return () => {
            self.getStore().getDesktop().moveItemToTop(visitor);
        }
    }


    // getInjectStyleOfEstablishDesktopFinanceFeeOfPartyATextField(finance) {
    //     const status = _.toNumber(finance.getSelectedStatus());
    //     let color = undefined;
    //     switch (status) {
    //         case 1:
    //             color = `#f1e1c7`;
    //             break;
    //         case 2:
    //             color = `#ffe7e6`;
    //             break;
    //         case 3:
    //         case 4:
    //         case 5:
    //             color = `#d5e4f0`;
    //             break;
    //         default:
    //             color = undefined;
    //
    //     }
    //     return color ? {background: color} : null;
    // }

    /** -------------------- async api -------------------- **/
}

export default EstablishComponent;
