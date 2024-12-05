const edit = true;
import {inject} from "mobx-react";
import {observer} from "mobx-react";
import {utiller as Util, exceptioner as ERROR, pooller as InfinitePool} from "utiller";
import BasePlutusComponent from './BasePlutusComponent';
import UserInfoRef from '../../base/BaseUserInfo';
import Cookie from '../../cookie';
import _ from "lodash";

@inject("plutus")
@observer
class PlutusComponent extends BasePlutusComponent {
    /** -------------------- fields -------------------- **/

    /** -------------------- functions -------------------- **/

    constructor(props) {
        super(props);
    }

    onPlutusFindIconButtonClicked(param) {
        this.getCurrentLocation().then(result => console.log(result));
    }

    getWrapInjectStyleOfPlutusWholeCheckbox(plutus) {
        return Util.getVisibleOrHidden(false);
    }

    getWrapInjectStyleOfPlutusEmailTextField(plutus) {
        return Util.getVisibleOrNone(UserInfoRef.isLoginWithSucceed())
    }

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
        const typeOfTransport = Cookie.getInfoOfSelectedTransport().typeOfTransport;
        const fee = UserInfoRef.getTotalPriceOfCartie();
        if(typeOfTransport < 0 || fee <= 0) {
            this.showWarningSnackMessage(`流程發生錯誤，請回到購物車流程`);
            return;
        }

        const address = this.getStore().getAddress();
        const phone = this.getStore().getPhone();
        const name = this.getStore().getName();

        if(Util.or(_.isEmpty(address),_.isEmpty(phone),_.isEmpty(name))) {
            this.showWarningSnackMessage(`資料尚未完整填寫，請再度確認欄位內容`);
            return;
        }

        this.showInfoSnackMessage(`進入付款流程`);
        Util.appendInfo(UserInfoRef.getCheckedCartieItem());
        UserInfoRef.deleteCheckedCartieItem();
    }

    /** -------------------- async api -------------------- **/
}

export default PlutusComponent;
