const edit = true;
import BaseReimburseStore from "./BaseReimburseStore";
import { utiller as Util, exceptioner as ERROR, pooller as InfinitePool } from "utiller";
import _ from "lodash";
import {Application} from "../../index";

class ReimburseStore extends BaseReimburseStore {
  /** -------------------- fields -------------------- **/

  /** -------------------- functions -------------------- **/

  constructor(props) {
    super(props);
  }

  async batchUpdateRecord2Order(obj = this) {
    Application.getEstablishStore().setBatchRecord(...this.getRecords().map(record=> record.columnData()));
    this.getStoreOfComponent().getComponent().showInfoSnackMessage(`批次更新款項成功`);
    this.getStoreOfComponent().getComponent(true).dismiss();
  }

  /** -------------------- async api -------------------- **/
}

export default ReimburseStore;
