import ModularizedEpayPurchaseOfHistoryOrderAreaOfPaymentDetailSectionOfCodeStore from "./ModularizedEpayPurchaseOfHistoryOrderAreaOfPaymentDetailSectionOfCodeStore";
import {
  utiller as Util,
  exceptioner as ERROR,
  pooller as InfinitePool,
} from "utiller";
import _ from "lodash";
import libpath from "path";
import { Application } from "../../";
import Config from "../../config";
import Router from "../../router";
import Cookie from "../../cookie";
import UserInfoRef from "../../base/BaseUserInfo";
import {
  makeAutoObservable,
  makeObservable,
  action,
  observable,
  comparer,
  computed,
  autorun,
  runInAction,
} from "mobx";
import BaseEpayPurchaseOfHistoryOrderAreaOfPaymentDetailSectionOfCodeStore from "./BaseEpayPurchaseOfHistoryOrderAreaOfPaymentDetailSectionOfCodeStore";

class EpayPurchaseOfHistoryOrderAreaOfPaymentDetailSectionOfCodeStore extends ModularizedEpayPurchaseOfHistoryOrderAreaOfPaymentDetailSectionOfCodeStore {
  /** -------------------- fields -------------------- **/
  /** -------------------- functions -------------------- **/

  constructor(props) {
    super(props);
  }
  /** -------------------- async api -------------------- **/
}
export default EpayPurchaseOfHistoryOrderAreaOfPaymentDetailSectionOfCodeStore;
