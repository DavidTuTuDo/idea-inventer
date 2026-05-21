const edit = true;

import { utiller as Util, exceptioner as ERROR, pooller as InfinitePool } from "utiller";

import Router from "../../router";
import BaseMetisComponent from "./BaseMetisComponent";

class ModularizedMetisComponent extends BaseMetisComponent {
    constructor(props) {
        super(props);
    }

    onMetisClazzSubmitChipClicked(param) {
        const clazz = param.object;
        const idOfClazz = clazz.getId();
        Router.gotoMetisSignUpPage(this.getComponentInstance(), idOfClazz);
    }

    onMetisClazzGotoPortfolioChipClicked(param) {
        const clazz = param.object;
        this.gotoUrlWithNewTabDirectly(clazz.getLinkOfPortfolio());
    }

    onMetisClazzShareIconButtonClicked(param) {
        const clazz = param.object;
        const idOfClazz = clazz.getId();
        this.copyTextToClipboard(Router.getUrlOfEstablishPage(idOfClazz), `已將報名連結複製到剪貼簿`);
    }

    getInjectPropsOfMetisClazzSubmitChip(clazz) {
        return { disabled: clazz.getCountsOfStudentCapacity() <= clazz.getCountsOfRegistered() };
    }

    onMetisClazzMoreChipClicked(param) {
        this.showWarningSnackMessage(`請美術設計海報`);
    }
}

export default ModularizedMetisComponent;
