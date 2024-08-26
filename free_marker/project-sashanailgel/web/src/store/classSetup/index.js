const edit = true;
import BaseClassSetupStore from "./BaseClassSetupStore";
import { utiller as Util, exceptioner as ERROR, pooller as InfinitePool } from "utiller";
import Cookie from "../../cookie";
import QuickSignUp from '../quickSignUpClazz';
class ClassSetupStore extends BaseClassSetupStore {
  /** -------------------- fields -------------------- **/

  /** -------------------- functions -------------------- **/

  constructor(props) {
    super(props);
    this.api = new QuickSignUp();
  }

  async fetch(view = this.getComponent()) {
    const result = {
      ...{},
    };
    await new InfinitePool(2).runByEachTask([
      async () => {
        result.clazzes = await this.api.fetchClazzes(this.getComponent()); /** prepare with default value */;
      },
      async () => {
        result.append = this.append /** prepare with default value */;
      },
    ]);
    this.fromJson(result);
    return result;
  }

  async updateClazzState(clazz) {
     await this.api.updateClazzItem(this.getComponent(), clazz, clazz.id);
  }

  async deleteClazzRemote(clazz){
    await this.api.deleteClazzItem(this.getComponent(), clazz.id);
    clazz.remove();
  }

  appendClassTime(clazz){
    clazz.pushClassTime({});
  }

  async appendLatestClass() {
    const clazz = await this.api.submitClazzItem();
    this.pushClazzesByIndex(-1, clazz.value);
  }

  /** -------------------- async api -------------------- **/
}

export default ClassSetupStore;
