const edit = true;

import { inject } from "mobx-react";
import BaseChordiventorComponent from "./BaseChordiventorComponent";
import { utiller as Util, exceptioner as ERROR, pooller as InfinitePool } from "utiller";
import _ from "lodash";
import libpath from "path";
import { observer } from "mobx-react";
import Router from "../../router";

@inject("chordiventor")
@observer
class ChordiventorComponent extends BaseChordiventorComponent {

  constructor(props) {
    super(props);
  }

  onChordiventorClearChipClicked(param) {
    this.getStore().cleanUp();
  }

  onChordiventorPersistChipClicked(param) {
    /** 按下發佈按鈕 */
    this.getStore().submitCustomPu().then();
  }

  onChordiventorClearIdChipClicked(param) {
    this.getStore().removeIdOfGuitarPu();
  }

  onChordiventorTxtTextFieldChange(param) {
    this.getStore().invalidate();
  }

  onChordiventorCancelChipClicked(param) {
    this.getStore().persistent();
    // Router.gotoHomePage(this);
  }

  onChordiventorNameTextFieldChange(param) {
    this.getStore().invalidate();
  }

  onChordiventorSingerAutocompleteChange(param) {
    this.getStore().invalidate();

  }

  onChordiventorInputOfSingerTextFieldChange(param) {
    this.getStore().invalidate();
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
