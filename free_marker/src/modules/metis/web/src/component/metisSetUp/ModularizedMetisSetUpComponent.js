const edit = true;

import { utiller as Util, exceptioner as ERROR, pooller as InfinitePool } from "utiller";

import Router from "../../router";
import BaseMetisSetUpComponent from "./BaseMetisSetUpComponent";

class ModularizedMetisSetUpComponent extends BaseMetisSetUpComponent {
    constructor(props) {
        super(props);
    }

    clazzOfCurrent;

    onMetisSetUpAppendChipClicked(param) {
        const self = this;
        this.getStore()
            .appendLatestClass()
            .then(() => {
                self.showInfoSnackMessage(`已新增課程[籌備中]`);
                self.scrollToTop();
            });
    }

    onMetisSetUpBackChipClicked(param) {
        Router.gotoMainPage(this.getComponentInstance());
    }

    onMetisSetUpClazzUpdateChipClicked(param) {
        const self = this;
        const clazz = param.object;
        this.getStore()
            .updateClazzState(clazz)
            .then(() => self.showInfoSnackMessage(`已更新[老師：${clazz.getNameOfHost()}]`));
    }

    onMetisSetUpClazzDeletedChipClicked(param) {
        const self = this;
        const clazz = param.object;
        this.getStore()
            .deleteClazzRemote(clazz)
            .then(() => self.showInfoSnackMessage(`已刪除[老師：${clazz.getNameOfHost()}]`));
    }

    onMetisSetUpClazzImageOfHostAvatarClicked(param) {
        this.clazzOfCurrent = param.object;
        this.enableImageSelectView();
    }

    onMetisSetUpClazzClassTimeExtraIconButtonAddedClicked(param) {
        const classTime = param.object;
        return async () => {
            this.getStore().appendClassTime(classTime.getParentNode());
        };
    }

    onMetisSetUpClazzClassTimeExtraIconButtonDeletedClicked(param) {
        const self = this;
        return async () => {
            const classTime = param.object;
            if (classTime.getParentNode().getLengthOfClassTime() > 1) classTime.remove();
            else self.showErrorSnackMessage(`無法刪除僅剩的課程時間`);
        };
    }

    onFilesSelected(files) {
        this.getStore()
            .uploadStorageFile(files[0], "public")
            .then((url) => {
                // this.showInfoSnackMessage(`下載位置=> ${url}`)
                // Util.appendInfo(2131321321, ' ==> ', url);
                this.clazzOfCurrent.setImageOfHost(url);
            });
    }
}

export default ModularizedMetisSetUpComponent;
