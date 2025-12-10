const edit = true;
import BaseAdditionMemberStore from "./BaseAdditionMemberStore";
import { utiller as Util, exceptioner as ERROR, pooller as InfinitePool } from "utiller";
import _ from "lodash";

class AdditionMemberStore extends BaseAdditionMemberStore {
  /** -------------------- fields -------------------- **/

  /** -------------------- functions -------------------- **/

  constructor(props) {
    super(props);
  }

  joinMember2Order = async (obj = this) => {
    this.App().getEstablishStore().pushSingleMember(this.columnData());
    this.getStoreOfComponent().getComponent().showInfoSnackMessage(`新增團員${this.getName()}成功`);
    this.getStoreOfComponent().getComponent(true).dismiss();
  }

  updateMember2Order = async (obj = this) => {
    this.App().getEstablishStore().updateSingleMember(this.columnData());
    this.getStoreOfComponent().getComponent().showInfoSnackMessage(`更新團員${this.getName()}成功`);
    this.getStoreOfComponent().getComponent(true).dismiss();
  }

  /** -------------------- async api -------------------- **/
}

export default AdditionMemberStore;
