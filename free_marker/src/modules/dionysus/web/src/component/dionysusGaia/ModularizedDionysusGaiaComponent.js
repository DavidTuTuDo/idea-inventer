const edit = true;

import { utiller as Util, exceptioner as ERROR, pooller as InfinitePool } from "utiller";
import _ from "lodash";
import libpath from "path";
import i18n from "../../i18n";
import React from "react";
import UserInfoRef from "../../base/BaseUserInfo";
import { Application } from "../../";
import Config from "../../config";
import Router from "../../router";
import Cookie from "../../cookie";
import BaseDionysusGaiaComponent from "./BaseDionysusGaiaComponent";

class ModularizedDionysusGaiaComponent extends BaseDionysusGaiaComponent {
    constructor(props) {
        super(props);
    }

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
    onDionysusGaiaBriefMainMainChipDeleted(param) {
        const main = param.object;
        if (main !== undefined) main.remove();
    }

    /** 副選項 */
    onDionysusGaiaBriefSubSubChipDeleted(param) {
        const sub = param.object;
        if (sub !== undefined) sub.remove();
    }

    onDionysusGaiaNameTextFieldChange(param) {
        this.getStore().onNameFieldChanged();
    }

    onDionysusGaiaDescriptionTextFieldChange(param) {
        this.getStore().onDescriptionFieldChanged();
    }

    onFilesSelected(files) {
        this.getStore().uploadBriefImages(files).then();
    }
}

export default ModularizedDionysusGaiaComponent;
