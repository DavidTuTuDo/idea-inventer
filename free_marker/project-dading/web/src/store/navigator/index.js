import ModularizedNavigatorStore from "./ModularizedNavigatorStore";

class NavigatorStore extends ModularizedNavigatorStore {
  /** -------------------- fields -------------------- **/

  /** -------------------- functions -------------------- **/

  constructor(props) {
    super(props);
  }

  getTitle() {
    return `大鼎`;
  }

  /** -------------------- async api -------------------- **/
}

export default NavigatorStore;
