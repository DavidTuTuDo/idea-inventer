const edit = true;
import BaseAdditionStore from "./BaseAdditionStore";
import { utiller as Util, exceptioner as ERROR, pooller as InfinitePool } from "utiller";
import _ from "lodash";
import libpath from "path";
import Member from "../additionMember";
import BaseStore from "../../base/BaseStore";

class AdditionStore extends BaseAdditionStore {
  /** -------------------- fields -------------------- **/

  /** -------------------- functions -------------------- **/

  constructor(props) {
    super(props);
  }

  batchUpdateMember2Order = async (obj = this)=> {
    this.App().getEstablishStore().setBatchMember(...this.getMembers().map(member=> member.columnData()));
    this.getStoreOfComponent().getComponent().showInfoSnackMessage(`批次團員更新成功`);
    this.getStoreOfComponent().getComponent(true).dismiss();
    /** 還要放進 establish 裡面的 member */
  }

  /** -------------------- async api -------------------- **/
}

export default AdditionStore;
