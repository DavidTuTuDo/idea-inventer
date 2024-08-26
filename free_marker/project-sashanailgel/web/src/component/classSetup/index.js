const edit = true;
import { inject } from "mobx-react";
import BaseClassSetupComponent from "./BaseClassSetupComponent";
import { observer } from "mobx-react";
import { utiller as Util, exceptioner as ERROR, pooller as InfinitePool } from "utiller";
import Router from '../../router'

@inject("classSetup")
@observer
class ClassSetupComponent extends BaseClassSetupComponent {
  /** -------------------- fields -------------------- **/

  /** -------------------- functions -------------------- **/

  constructor(props) {
    super(props);
  }

  clazzOfCurrent;

  onClassSetupAppendChipClicked(param) {
    const self = this;
     this.getStore().appendLatestClass().then(() => {
       self.showInfoSnackMessage(`已新增課程[籌備中]`)
       self.scrollToTop();
     });
  }

  onClassSetupBackChipClicked(param) {
    Router.gotoMainPage(this.getComponentInstance());
  }

  onClassSetupClazzUpdateChipClicked(param) {
    const self = this;
    const clazz = param.object;
    this.getStore().updateClazzState(clazz).then(() => self.showInfoSnackMessage(`已更新[老師：${clazz.getNameOfHost()}]`));
  }

  onClassSetupClazzDeletedChipClicked(param) {
    const self = this;
    const clazz = param.object;
    this.getStore().deleteClazzRemote(clazz).then(() => self.showInfoSnackMessage(`已刪除[老師：${clazz.getNameOfHost()}]`));

  }

  onClassSetupClazzImageOfHostAvatarClicked(param) {
    this.clazzOfCurrent = param.object;
    this.enableImageSelectView();
  }

  onClassSetupClazzClassTimeExtraIconButtonAddedClicked(param) {
    const classTime = param.object;
    return async ()  => {
      this.getStore().appendClassTime(classTime.getParentNode());
    }
  }


  onClassSetupClazzClassTimeExtraIconButtonDeletedClicked(param) {
    const self = this;
    return async ()  => {
      const classTime = param.object;
      if(classTime.getParentNode().getLengthOfClassTime() > 1) classTime.remove();
      else self.showErrorSnackMessage(`無法刪除僅剩的課程時間`);
    }
  }

  onFilesSelected(files) {
    this.getStore().uploadStorageFile(files[0], 'public').then(url => {
      // this.showInfoSnackMessage(`下載位置=> ${url}`)
      // Util.appendInfo(2131321321, ' ==> ', url);
      this.clazzOfCurrent.setImageOfHost(url);
    })
  }

  /** -------------------- async api -------------------- **/
}

export default ClassSetupComponent;
