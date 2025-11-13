const edit = true;

import ModularizedNavigatorStore from "./ModularizedNavigatorStore";

class NavigatorStore extends ModularizedNavigatorStore {
  /** -------------------- fields -------------------- **/

  /** -------------------- functions -------------------- **/

  constructor(props) {
    super(props);
  }

  getTitle() {
    return `悅耳`;
  }

  /** -------------------- async api -------------------- **/
}

export default NavigatorStore;
