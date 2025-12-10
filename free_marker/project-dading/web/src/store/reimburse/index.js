const edit = true;
import BaseReimburseStore from "./BaseReimburseStore";


class ReimburseStore extends BaseReimburseStore {
  /** -------------------- fields -------------------- **/

  /** -------------------- functions -------------------- **/

  constructor(props) {
    super(props);
  }


  batchUpdateRecord2Order = async (obj = this) => {
    this.App().getEstablishStore().setBatchRecord(...this.getRecords().map(record=> record.columnData()));
    this.getStoreOfComponent().getComponent().showInfoSnackMessage(`批次更新款項成功`);
    this.getStoreOfComponent().getComponent(true).dismiss();
  }

  /** -------------------- async api -------------------- **/
}

export default ReimburseStore;
