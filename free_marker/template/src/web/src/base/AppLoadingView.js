const edit = true;

import React from "react";
import { observable, action, makeObservable } from "mobx";
import { observer } from "mobx-react";
import LinearProgress from "@mui/material/LinearProgress";

class AppLoadingStore {

    @observable
    visible = false;

    constructor() {
        makeObservable(this);
    }

    // 建議增加 action 以符合 MobX 嚴格模式
    @action
    setVisible(isVisible) {
        this.visible = isVisible;
    }
}

export const storeOfAppLoading = new AppLoadingStore();

/**
 * 獨立的 Loading View
 * 使用 observer 確保只有這裡會因為 visible 改變而 re-render
 */
const AppLoadingView = observer(({ componentX }) => {

    const { visible } = storeOfAppLoading;
    if (!componentX.isNotNavigatorNComponentNCprtView()) return null;
    if (!visible) return null;

    return (
        <div className="BaseLoadingViewDiv">
            <LinearProgress className="BaseLoadingLinearProgress" />
        </div>
    );
});

export default AppLoadingView;
