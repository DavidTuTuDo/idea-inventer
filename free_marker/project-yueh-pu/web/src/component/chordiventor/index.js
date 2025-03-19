const edit = true;
import {inject} from "mobx-react";
import BaseChordiventorComponent from "./BaseChordiventorComponent";
import {utiller as Util, exceptioner as ERROR, pooller as InfinitePool} from "utiller";
import {observer} from "mobx-react";
import UserInfo from '../../base/BaseUserInfo';
import Router from "../../router";

@inject("chordiventor")
@observer
class ChordiventorComponent extends BaseChordiventorComponent {

    constructor(props) {
        super(props);
    }

    getInjectStyleOfChordiventorClearIdChip(chordiventor) {
        return Util.getVisibleOrNone(UserInfo.isAdmin(), true);
    }

    getWrapInjectStyleOfChordiventorIdOfGuitarPuTextField(chordiventor) {
        return Util.getVisibleOrNone(UserInfo.isAdmin(), true);
    }

    getWrapInjectStyleOfChordiventorIdOfSingerTextField(chordiventor) {
        return Util.getVisibleOrNone(UserInfo.isAdmin(), true);
    }

    onChordiventorClearChipClicked(param) {
        this.getStore().cleanUp();
    }

    onChordiventorLoadChipClicked(param) {
        this.getStore().loadLatestData().then();
    }

    onChordiventorPersistChipClicked(param) {
        /** 按下發佈按鈕 */
        const self = this;
        this.getStore().submitCustomPu().then(() => {
            Router.gotoInventedOfPuPage(self);
        });
    }

    onChordiventorClearIdChipClicked(param) {
        this.getStore().removeIdOfGuitarPu();
    }

    onChordiventorTxtTextFieldChange(param) {
        this.getStore().invalidate();
    }

    onChordiventorCancelChipClicked(param) {
        const self = this;
        self.getStore().persistent().then(() => {
            Router.gotoHomePage(self);
        });
    }

    onChordiventorNameTextFieldChange(param) {
        this.getStore().invalidate();
    }

    onChordiventorSingerAutocompleteChange(param) {
        this.getStore().invalidate();
    }

    onChordiventorInputOfSingerTextFieldChange(param) {
        this.getStore().invalidate({cleanIdOfSinger: true});
    }

    onChordiventorSpeedTextFieldChange(param) {
        this.getStore().invalidate();
    }

    /** 女性建議調性 */
    onTonalityOfFemaleSelectedChange(value, param) {
        this.getStore().invalidate();
    }

    /** 男生建議調性 */
    onTonalityOfMaleSelectedChange(value, param) {
        this.getStore().invalidate();
    }

    /** 原曲調性 */
    onTonalityOfOriginalSelectedChange(value, param) {
        this.getStore().invalidate();
    }

    /** 譜曲調性 */
    onTonalityOfContextSelectedChange(value, param) {
        this.getStore().invalidate();
    }

    /** -------------------- async api -------------------- **/
}

export default ChordiventorComponent;
