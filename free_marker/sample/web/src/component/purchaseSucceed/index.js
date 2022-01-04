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
import Router from "../../router";
import Cookie from '../../cookie';
import UserInfo from '../../userInfo';
import Functions from '../../functions';

@inject("purchaseSucceed")
@observer
class PurchaseSucceedComponent extends BasePurchaseSucceedComponent {
    /** -------------------- fields -------------------- **/
    /** -------------------- functions -------------------- **/

    constructor(props) {
        super(props);
    }

    componentDidMount() {
        const self = this;
        super.componentDidMount();
        const paramObject = queryString.parse(this.props.location.search) //console.log(params) { transactionId:2021062500677569710, orderId:Order2019101500001 };
        Util.appendInfo('line導頁後得到的參數orderId, transactionId', paramObject);
        Util.syncDelay(500).then((result) => {
            return Functions.httpOnCallConfirmLinePayInfo(self, {uid:UserInfo.getUid(),...paramObject});
        }).then(
            (result) => {
                self.getStore().setSucceedTitle('已完成交易');
                self.getStore().setIsTransactionSucceed(true);
            }
        ).catch(
            (error) => {
                self.getStore().setSucceedTitle(`失敗交易:${error.message}`);
                self.getStore().setIsTransactionSucceed(false);
            }
        )
    }

    getInjectPropsOfPurchaseSucceedConfirmButton(purchaseSucceed) {
        return {disabled: !this.getStore().getIsTransactionSucceed()}
    }

    onConfirmButtonClicked(param) {
        Router.gotoMainPage(this);
    }

    /** -------------------- async api -------------------- **/
}

export default PurchaseSucceedComponent;
