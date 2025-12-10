import { utiller as Util, exceptioner as ERROR, pooller as InfinitePool } from "utiller";
import _ from "lodash";
import BaseInfoOfCopyRightContentComponent from "./BaseInfoOfCopyRightContentComponent";

class ModularizedInfoOfCopyRightContentComponent extends BaseInfoOfCopyRightContentComponent {
    /** -------------------- fields -------------------- **/

    /** -------------------- functions -------------------- **/

    constructor(props) {
        super(props);
    }

    onInfoOfCopyRightContentProjectDivClicked(param) {
        const project = param.object;
        if (Util.isUndefinedNullEmpty(project.getRoute()) || _.isEqual(project.getRoute(), "empty")) this.showInfoSnackMessage(`施工中，請稍後再試`);
        else this.handleProjectRouter(project.getRoute());
    }

    handleProjectRouter(route) {
        this.gotoExternalUrl(route);
    }

    onInfoOfCopyRightContentCancelChipClicked(param) {
        this.dismiss();
    }

    /** -------------------- async api -------------------- **/
}

export default ModularizedInfoOfCopyRightContentComponent;
