const edit = true;
import { observer, inject } from "mobx-react";
import Router from "../../router";
import _ from "lodash";
import ModularizedNavigatorComponent from "./ModularizedNavigatorComponent";
import { utiller as Util, exceptioner as ERROR } from "utiller";
import UserInfoRef from "../../base/BaseUserInfo";

@inject("navigator")
@observer
class NavigatorComponent extends ModularizedNavigatorComponent {
    gotoPageByContent = (keyword) => {
        switch (keyword.type) {
            case 11:
                Router.gotoSheetDetailPage(this.getComponentInstance(), keyword.uid);
                /** route to sheet-tone page*/
                break;
            case 12:
                Router.gotoPortfolioPage(this, "list", keyword.uid);
                /** route to singer page*/
                break;
            default:
                throw new ERROR(999, `88745478 ${keyword.type} not handed`);
        }
    };

    onSearchPressed(content) {
        const inputOfComplete = this.getStore().getInputOfComplete();
        if (!UserInfoRef.isLoginWithSucceed()) {
            this.showWarningSnackMessage(`請IG詢問 明悅 如何開通搜尋功能`);
            return;
        }

        if (_.isObject(content) && content.type) {
            this.gotoPageByContent.call(this, content);
        } else if (!Util.isUndefinedNullEmpty(content)) {
            Router.gotoPortfolioPage(this, "search", content);
        } else if (!_.isEmpty(inputOfComplete)) {
            const keyword = _.find(this.getStore().getCompleteSuggests(), (each) => each.label.includes(inputOfComplete.trim()));
            if (keyword) this.gotoPageByContent(keyword);
            else this.showWarningSnackMessage(`「${inputOfComplete}」沒有搜尋結果`);
        }
    }
}

export default NavigatorComponent;
