const edit = true;
import "swiper/css/pagination";
import "swiper/css";
import { inject } from "mobx-react";
import BaseMainComponent from "./BaseMainComponent";
import { observer } from "mobx-react";
import Router from '../../router';

@inject("main")
@observer
class MainComponent extends BaseMainComponent {
  /** -------------------- fields -------------------- **/

  /** -------------------- functions -------------------- **/

  constructor(props) {
    super(props);
  }

  onMainPromotedBannerImageImgClicked(param) {
    this.gotoUrlWithNewTab(param.object.route);
  }

  onMainGotoShoppingChipClicked(param) {
    this.gotoUrlWithNewTab(`https://shopee.tw/seven19820706`)
  }

  onMainEditorOfClassChipClicked(param) {
    Router.gotoClassSetupPage(this);
  }

  onMainGotoInnerShoppingChipClicked(param) {
    Router.gotoDionysusPage(this);
  }


  /** -------------------- async api -------------------- **/
}

export default MainComponent;
