const edit = true;
import BaseClassSetupClazzStore from "./BaseClassSetupClazzStore";
import { utiller as Util, exceptioner as ERROR, pooller as InfinitePool } from "utiller";
import _ from "lodash";
import libpath from "path";
import { Application } from "../../";

class ClassSetupClazzStore extends BaseClassSetupClazzStore {
  /** -------------------- fields -------------------- **/

  /** -------------------- functions -------------------- **/

  constructor(props) {
    super(props);
  }

  onInitialCompleted(object) {
    super.onInitialCompleted(object);
    this.setSpecificClass([this.getStartOfSpecificClass(),this.getEndOfSpecificClass()])
  }

  /** -------------------- async api -------------------- **/
}

export default ClassSetupClazzStore;
