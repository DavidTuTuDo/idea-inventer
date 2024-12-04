const edit = true;
import "swiper/css/pagination";
import "swiper/css";
import { inject } from "mobx-react";
import BaseBacchusComponent from "./BaseBacchusComponent";
import { utiller as Util, exceptioner as ERROR, pooller as InfinitePool } from "utiller";
import _ from "lodash";
import libpath from "path";
import maenads from "../maenads";
import Chip from "@mui/material/Chip";
import { observer } from "mobx-react";
import Router from "../../router";

@inject("bacchus")
@observer
class BacchusComponent extends BaseBacchusComponent {
  /** -------------------- fields -------------------- **/

  /** -------------------- functions -------------------- **/

  constructor(props) {
    super(props);
  }

  onBacchusBackToHomeChipClicked(param) {
    // Router.gotoDionysusPage(this);
    this.gotoPreviewPage();
  }

  /** -------------------- async api -------------------- **/
}

export default BacchusComponent;
