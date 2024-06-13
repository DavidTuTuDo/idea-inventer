const edit = true;
import {Application} from "../../index";
import BaseReimburseRecordStore from "./BaseReimburseRecordStore";

class ReimburseRecordStore extends BaseReimburseRecordStore {
  /** -------------------- fields -------------------- **/

  /** -------------------- functions -------------------- **/

  constructor(props) {
    super(props);
  }

  async joinRecord2Order(obj = this) {
    Application.getEstablishStore().pushSingleRecord(this.columnData());
    this.getStoreOfComponent().getComponent().showInfoSnackMessage(`新增款項$${this.getFeeOfPaid()}成功`);
    this.getStoreOfComponent().getComponent(true).dismiss();
  }

  async updateRecord2Order(obj = this) {
    Application.getEstablishStore().updateSingleRecord(this.columnData());
    this.getStoreOfComponent().getComponent().showInfoSnackMessage(`更新款項$${this.getFeeOfPaid()}成功`);
    this.getStoreOfComponent().getComponent(true).dismiss();

  }

  /** -------------------- async api -------------------- **/
}

export default ReimburseRecordStore;
