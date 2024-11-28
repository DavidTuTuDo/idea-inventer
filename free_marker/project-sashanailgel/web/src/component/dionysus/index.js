const edit = true;
import { inject } from "mobx-react";
import BaseDionysusComponent from "./BaseDionysusComponent";
import { utiller as Util, exceptioner as ERROR, pooller as InfinitePool } from "utiller";
import _ from "lodash";
import { observer } from "mobx-react";
import Router from "../../router";
import Cookie from "../../cookie";

@inject("dionysus")
@observer
class DionysusComponent extends BaseDionysusComponent {
  /** -------------------- fields -------------------- **/

  /** -------------------- functions -------------------- **/

  constructor(props) {
    super(props);
  }

  getBoozePhotoOfHead(booze) {
    const url = super.getBoozePhotoOfHead(booze);
    return url;
  }

  onDionysusBoozeCartIconButtonClicked(param) {
    const booze = param.object;
    Router.gotoBacchusDetailPage(this.getComponentInstance(),booze.getId(),booze.columnData());
  }

  onDionysusBoozeDivClicked(param) {
    const booze = param.object;
    Router.gotoBacchusDetailPage(this.getComponentInstance(),booze.getId(),booze.columnData());
  }

  /** -------------------- async api -------------------- **/
}

export default DionysusComponent;
