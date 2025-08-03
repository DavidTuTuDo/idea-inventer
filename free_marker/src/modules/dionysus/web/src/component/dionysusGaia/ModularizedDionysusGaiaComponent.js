const edit = true;

import { utiller as Util, exceptioner as ERROR, pooller as InfinitePool } from "utiller";
import _ from "lodash";
import Router from "../../router";
import BaseDionysusGaiaComponent from "./BaseDionysusGaiaComponent";

class ModularizedDionysusGaiaComponent extends BaseDionysusGaiaComponent {
    constructor(props) {
        super(props);
    }

    onApolloDialogSubmit = async (...param) => {
        const result = param.pop();
        this.getStore().setScheduleResult(result).then();
    };

    onDionysusGaiaAppendMainChipClicked(param) {
        this.getStore().setSelected("main");
    }

    onDionysusGaiaAppendSubChipClicked(param) {
        this.getStore().setSelected("sub");
    }

    onDionysusGaiaJoinPhotoChipClicked(param) {
        this.enableImageSelectView(true);
    }

    onDionysusGaiaBriefPhotoDeleteIconButtonClicked(param) {
        const photo = param.object;
        if (photo !== undefined) photo.remove();
    }

    /** 主選項 */
    onDionysusGaiaBriefMainLabelChipDeleted(param) {
        const main = param.object;
        if (main !== undefined) main.remove();
    }

    /** 副選項 */
    onDionysusGaiaBriefSubLabelChipDeleted(param) {
        const sub = param.object;
        if (sub !== undefined) sub.remove();
    }

    getInjectStyleOfDionysusGaiaRecoverChip(dionysusGaia) {
        return Util.getVisibleOrNone(!Util.isUndefinedNullEmpty(this.getStore().getIdOfBooze()), true);
    }

    getInjectStyleOfDionysusGaiaDeletedChip(dionysusGaia) {
        return Util.getVisibleOrNone(!Util.isUndefinedNullEmpty(this.getStore().getIdOfBooze()), true);
    }

    onDionysusGaiaNameTextFieldChange(param) {
        this.getStore().onNameFieldChanged();
    }

    onDionysusGaiaStatementTextFieldChange(param) {
        this.getStore().onStatementFieldChanged();
    }

    onFilesSelected(files) {
        this.getStore().uploadBriefImages(files).then();
    }

    onDionysusGaiaCreateChipClicked(param) {
        /** 新增一個booze */
        this.getStore().createBooze4Sure().then();
    }

    onDionysusGaiaRecoverChipClicked(param) {
        this.getStore().recoverBooze4Sure().then();
    }

    onDionysusGaiaDeletedChipClicked(param) {
        const self = this;
        this.getStore()
            .deleteBooze4Sure()
            .then(() => Router.gotoDionysusPage(self));
    }

    onDionysusGaiaVisibilitySwitchChange(param) {
        this.getStore().onVisibilityChanged().then();
    }

    isValidOfParamOfPid(pid) {
        return true;
    }

    getInjectStyleOfDionysusGaiaAppendSubChip(dionysusGaia) {
        return Util.getVisibleOrNone(_.isEqual(1, dionysusGaia.getSelectedTypeOfProp()), true);
    }

    getInjectStyleOfDionysusGaiaAppendTaskChip(dionysusGaia) {
        return Util.getVisibleOrNone(_.isEqual(2, dionysusGaia.getSelectedTypeOfProp()), true);
    }

    getInjectStyleOfDionysusGaiaAppendMainChip(dionysusGaia) {
        return Util.getVisibleOrNone(_.isEqual(1, dionysusGaia.getSelectedTypeOfProp()), true);
    }
}

export default ModularizedDionysusGaiaComponent;
