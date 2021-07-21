/** this code are generated, modify is no sense.
 author:David Tu,
 email:freshingmoon0725@gmail.com
 updateTime:2021-06-24-23-20-01
 */
import {
    utiller as Util,
    exceptioner as ERROR,
    pooller as InfinitePool,
} from "utiller";
import _ from "lodash";
import libpath from "path";
import {observer} from "mobx-react";
import {inject} from "mobx-react";
import BasePurchaseSucceedComponent from "./BasePurchaseSucceedComponent";
import queryString from 'query-string';
import PurchaseReport from '../../store/purchaseReport';
import Router from "../../router";
import Cookie from '../../cookie';
import UserInfo from '../../userInfo';

@inject("purchaseSucceed")
@observer
class PurchaseSucceedComponent extends BasePurchaseSucceedComponent {
    /** -------------------- fields -------------------- **/
    /** -------------------- functions -------------------- **/

    constructor(props) {
        super(props);
        this.params = queryString.parse(this.props.location.search) //console.log(params) { transactionId:2021062500677569710, orderId:Order2019101500001 };
    }

    componentDidMount() {
        const self = this;
        super.componentDidMount();
        /** 開始 loading view */
        self.setGlobalLoadingViewVisibility(true);
        const item = {uid: UserInfo.getUid(), ...this.params};
        Util.appendInfo('line導頁後得到的參數orderId, transactionId', item);
        new PurchaseReport().submitPurchaseReportItem(item).then((result) => {
            Util.appendInfo(result);
            self.setGlobalLoadingViewVisibility(false);
            /** 停止loading view */
        })
    }

    onConfirmButtonClicked(param) {
        Router.gotoMainPage(this);
    }

    /** -------------------- async api -------------------- **/
}

export default PurchaseSucceedComponent;
