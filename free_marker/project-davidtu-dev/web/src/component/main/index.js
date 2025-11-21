const edit = true;

import BaseMainComponent from "./BaseMainComponent";
import Router from "../../router";

class MainComponent extends BaseMainComponent {
    /** -------------------- fields -------------------- **/
    /** -------------------- functions -------------------- **/

    constructor(props) {
        super(props);
    }

    onMainTestEpayTestButtonClicked(param) {
        Router.gotoEpayTestPage(this.getComponentInstance());
    }

    onMainTestGotoHistoryButtonClicked(param) {
        Router.gotoEpayFootprintPage(this.getComponentInstance(), "user", "pending");
    }

    onMainTestGoGaiaButtonClicked(param) {
        Router.gotoGaiaPage(this, "generate");
    }

    onMainTestGoMarketButtonClicked(param) {
        Router.gotoDionysusPage(this);
    }

    // onMainBannerSwiperSlideClicked(param) {
    //   const item = param.object;
    //   console.log(item);
    // }
    onMainBannerSimpleSwiperSlide() {
        //忽略換頁通知
    }

    onMainTestGoErosButtonClicked(param) {
        Router.gotoErosPage(this);
    }

    onMainBannerImageImgClicked(param) {
        console.log(param.object);
        this.getComponentInstance().showInfoSnackMessage(param.object.route);
    }

    onMainTestClockTimePickerChange(param) {
        console.log(param.value);
    }

    onMainTestEndDatePickerChange(param) {
        console.log(param.value);
    }

    onMainTestGoToBackUpButtonClicked(param) {
        Router.gotoHestiaPage(this);
    }

    onMainTestTestUsageButtonClicked(param) {
        Router.gotoDemeterPage(this);
        // this.getStore()
        //     .getTest()
        //     .submitTest()
        //     .then((result) => this.showInfoSnackMessage("上傳成功"));
    }

    /** -------------------- async api -------------------- **/
}
export default MainComponent;
