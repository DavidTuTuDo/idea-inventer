const edit = true;
import BaseReimburseRecordStore from "./BaseReimburseRecordStore";
import _ from "lodash";
import {computed} from "mobx";
import { utiller as Util, exceptioner as ERROR, pooller as InfinitePool } from "utiller";

class ReimburseRecordStore extends BaseReimburseRecordStore {
  /** -------------------- fields -------------------- **/

  /** -------------------- functions -------------------- **/

  constructor(props) {
    super(props);
    this.setFeeOfProcedureDisabled(true);
  }


   joinRecord2Order = async (obj = this) => {
    this.App().getEstablishStore().pushSingleRecord(this.columnData());
    this.getStoreOfComponent().getComponent().showInfoSnackMessage(`新增款項$${this.getFeeOfPaid()}成功`);
    this.getStoreOfComponent().getComponent(true).dismiss();
  }

  updateRecord2Order = async (obj = this) => {
    this.App().getEstablishStore().updateSingleRecord(this.columnData());
    this.getStoreOfComponent().getComponent().showInfoSnackMessage(`更新款項$${this.getFeeOfPaid()}成功`);
    this.getStoreOfComponent().getComponent(true).dismiss();

  }

  @computed
  get getComputedFeeOfProcedure() {
    const rate = Util.getNumberOfPercentageToFloat(`${this.getRateOfCredit()}%`);
    const result = _.round(_.multiply(this.getFeeOfPaid(), rate));
    this.setFeeOfProcedure(result);
    return result;
  }

  /** -------------------- async api -------------------- **/
}

export default ReimburseRecordStore;
