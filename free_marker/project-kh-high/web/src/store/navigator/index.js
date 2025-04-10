const edit = true;
import ModularizedNavigatorStore from "./ModularizedNavigatorStore";

class NavigatorStore extends ModularizedNavigatorStore {
  /** -------------------- fields -------------------- **/

  /** -------------------- functions -------------------- **/

  constructor(props) {
    super(props);
  }

  getTitle() {
    return `悅考`;
  }

  /** -------------------- async api -------------------- **/
}

export default NavigatorStore;
