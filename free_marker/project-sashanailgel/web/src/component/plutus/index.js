const edit = true;
import {inject} from "mobx-react";
import {observer} from "mobx-react";
import {utiller as Util, exceptioner as ERROR, pooller as InfinitePool} from "utiller";
import BasePlutusComponent from './BasePlutusComponent';
import UserInfoRef from '../../base/BaseUserInfo';
import Cookie from '../../cookie';
import _ from "lodash";
import Functions from '../../functions';
import Router from '../../router';

@inject("plutus")
@observer
class PlutusComponent extends BasePlutusComponent {
    /** -------------------- fields -------------------- **/

    /** -------------------- functions -------------------- **/

    constructor(props) {
        super(props);
    }

    onPlutusFindIconButtonClicked(param) {
        const self = this
        if (!_.isEmpty(this.getStore().getAddress())) {
            const address = this.getStore().getPreciselyAddress();
            Functions.httpOnCallGetDistanceOfSpecificAddress(this, {address}).then((result) => {
                this.getStore().setDistanceOfSasha(`距離倉庫 ${result}`);
            })
        } else this.showWarningSnackMessage(`未輸入地址`)
    }

    getWrapInjectStyleOfPlutusWholeCheckbox(plutus) {
        return Util.getVisibleOrHidden(false);
    }

    // getWrapInjectStyleOfPlutusEmailTextField(plutus) {
    //     return Util.getVisibleOrNone(!UserInfoRef.isLoginWithSucceed())
    // }

    onCitySelectedChange(value, param) {
        const self = this;
        Util.syncDelay(1).then(() => {
            self.getStore().validateDistrictByCity()
        })
    }

    getInjectStyleOfPlutusSecondDiv(plutus) {
        return Util.getVisibleOrNone(false, true);
    }

    getInjectStyleOfPlutusFourthDiv(plutus) {
        return Util.getVisibleOrNone(false, true);
    }

    onPlutusSubmitChipClicked(param) {
        const self = this;
        const typeOfTransport = UserInfoRef.getTypeOfTransport();
        const price = UserInfoRef.getTotalPriceOfCartie();
        if (typeOfTransport < 0 || price <= 0) {
            this.showWarningSnackMessage(`流程發生錯誤，請回到購物車流程`);
            return;
        }


        if (Util.or(_.isEmpty(this.getStore().getAddress()),
            _.isEmpty(this.getStore().getPhone()),
            _.isEmpty(this.getStore().getName()))) {
            this.showWarningSnackMessage(`資料尚未完整填寫，請再度確認欄位內容`);
            return;
        }

        this.showInfoSnackMessage(`進入付款流程`);
        this.getStore().submitSavior(this).then((result) => {
            self.showInfoSnackMessage(`已完成訂購，請收信信件確認`);
            UserInfoRef.deleteCheckedCartieItemBehavior();
            Util.syncDelay(2500).then((result) => {
                Router.gotoHomePage(this);
            })

        });


    }

    /** -------------------- async api -------------------- **/
}

export default PlutusComponent;
