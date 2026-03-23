const edit = true;

/** this code are generated, modify is no sense.
 author:David Tu,
 email:freshingmoon0725@gmail.com
 updateTime:2021-04-23-17-02-38
 */

import BaseMainComponent from "./BaseMainComponent";
import React from "react";

class MainComponent extends BaseMainComponent {

    constructor(prop) {
        super(prop);
        setInterval(this.tick, 100);
    }

    getInjectViewOfMainCountdownPaper() {
        const CountdownView = this.CountdownView;
        let time = this.getStore().getExpired().getExpiredTime();
        return <CountdownView title={"距離學測"} date={time} />;
    }

    componentDidMount() {
        super.componentDidMount();
    }

    onMainViewPagerImageImgClicked(param) {
        this.gotoUrlWithNewTab(param.object.route);
    }

    /** 因為countdown自己會計算時間差, 所以只能藉由觸發他改變時間 */
    isOdd = false;

    tick = () => {
        const self = this;
        const beforeTimestamp = self.getStore().getExpired().getExpiredTime();
        if (beforeTimestamp > 0) {
            const newTime = self.isOdd ? beforeTimestamp - 1 : beforeTimestamp + 1;
            self.getStore().getExpired().setExpiredTime(newTime);
        }
        self.isOdd = !self.isOdd;
    };

}

export default MainComponent;
