const edit = true;
import BaseEstablishDesktopVisitorStore from "./BaseEstablishDesktopVisitorStore";
import _ from "lodash";

class EstablishDesktopVisitorStore extends BaseEstablishDesktopVisitorStore {
  /** -------------------- fields -------------------- **/

  /** -------------------- functions -------------------- **/

  constructor(props) {
    super(props);
    this.setIndexOfSequenceDisabled(true)
  }

  invalidate() {
    this.setIndexOfSequence(_.indexOf(this.getParentNode().getVisitors(), this) + 1);
  }

  @computed
  get getComputedPrice() {
    const value = this.getPriceOfPartyB() - this.getDiscount();
    this.setPrice(value);
    return value;
  }

  @computed
  get getComputedFeeOfProfit() {
    const value = this.getPrice() - this.getPriceOfPartyA();
    this.setFeeOfProfit(value);
    return value;
  }

  /** -------------------- async api -------------------- **/
}

export default EstablishDesktopVisitorStore;
