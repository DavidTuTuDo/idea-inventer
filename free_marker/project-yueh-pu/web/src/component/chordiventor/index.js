const edit = true;
import {inject} from "mobx-react";
import BaseChordiventorComponent from "./BaseChordiventorComponent";
import {utiller as Util, exceptioner as ERROR, pooller as InfinitePool} from "utiller";
import {observer} from "mobx-react";
import UserInfo from '../../base/BaseUserInfo';
import Router from "../../router";
import {isMobile, isTablet} from 'react-device-detect'


@inject("chordiventor")
@observer
class ChordiventorComponent extends BaseChordiventorComponent {

    constructor(props) {
        super(props);
    }

    getInjectPropsOfChordiventorTxtTextField(chordiventor) {
        if (isMobile) return {inputProps:{style: {fontSize: '0.8rem'}}}
        else return {inputProps:{style: {fontSize: '0.9rem'}}}
    // else if (isTablet) return {inputProps:{style: {fontSize: '0.9rem'}}}
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
        this.getStore().submitCustomPu().then((result) => {
            if(result) Router.gotoInventedOfPuPage(self);
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
        self.getStore().persistent().then((result) => {
            if(result) Router.gotoHomePage(self);
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

    isValidOfParamOfIdOfGuitarPu(idOfGuitarPu) {
        return _.size(idOfGuitarPu) >= 4;
    }

    /** -------------------- async api -------------------- **/
}

export default ChordiventorComponent;
