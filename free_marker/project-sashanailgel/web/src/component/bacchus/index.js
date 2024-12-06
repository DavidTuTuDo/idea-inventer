const edit = true;
import "swiper/css/pagination";
import "swiper/css";
import { inject } from "mobx-react";
import BaseBacchusComponent from "./BaseBacchusComponent";
import { utiller as Util, exceptioner as ERROR, pooller as InfinitePool } from "utiller";
import { observer } from "mobx-react";
import UserInfoRef from '../../base/BaseUserInfo';

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

  onBacchusBoughtChipClicked(param) {
    UserInfoRef.setGotoCartieDirect(true);
  }

  onBacchusJoinToCartChipClicked(param) {
    UserInfoRef.setGotoCartieDirect(false);
  }

  /** -------------------- async api -------------------- **/
}

export default BacchusComponent;
