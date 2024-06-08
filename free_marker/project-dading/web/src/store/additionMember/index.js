const edit = true;
import BaseAdditionMemberStore from "./BaseAdditionMemberStore";
import { utiller as Util, exceptioner as ERROR, pooller as InfinitePool } from "utiller";
import _ from "lodash";
import libpath from "path";
import { Application } from "../../";
import Config from "../../config";
import i18n from "../../i18n";

class AdditionMemberStore extends BaseAdditionMemberStore {
  /** -------------------- fields -------------------- **/

  /** -------------------- functions -------------------- **/

  constructor(props) {
    super(props);
  }

  async joinMember2Order(obj = this) {
    Application.getEstablishStore().pushSingleMember(this.columnData());
    this.getStoreOfComponent().getComponent().showInfoSnackMessage(`新增團員${this.getName()}成功`);
    this.getStoreOfComponent().getComponent(true).dismiss();
  }

  async updateMember2Order(obj = this) {
    Application.getEstablishStore().updateSingleMember(this.columnData());
    this.getStoreOfComponent().getComponent().showInfoSnackMessage(`更新團員${this.getName()}成功`);
    this.getStoreOfComponent().getComponent(true).dismiss();
  }

  /** -------------------- async api -------------------- **/
}

export default AdditionMemberStore;
