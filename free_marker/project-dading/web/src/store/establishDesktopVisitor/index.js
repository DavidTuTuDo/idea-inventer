const edit = true;
import BaseEstablishDesktopVisitorStore from "./BaseEstablishDesktopVisitorStore";
import { utiller as Util, exceptioner as ERROR, pooller as InfinitePool } from "utiller";
import _ from "lodash";
import libpath from "path";
import { Application } from "../../";

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

  /** -------------------- async api -------------------- **/
}

export default EstablishDesktopVisitorStore;
