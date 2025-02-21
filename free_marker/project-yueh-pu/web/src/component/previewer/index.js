const edit = true;

import { inject } from "mobx-react";
import BasePreviewerComponent from "./BasePreviewerComponent";
import { utiller as Util, exceptioner as ERROR, pooller as InfinitePool } from "utiller";
import _ from "lodash";
import libpath from "path";
import { observer } from "mobx-react";

@inject("previewer")
@observer
class PreviewerComponent extends BasePreviewerComponent {
  /** -------------------- fields -------------------- **/

  /** -------------------- functions -------------------- **/

  constructor(props) {
    super(props);
  }

  onPreviewerNameTextFieldChange(param) {
    this.getStore().invalidate();
  }

  onPreviewerSingerAutocompleteChange(param) {
    this.getStore().invalidate();
  }


  onPreviewerSpeedTextFieldChange(param) {
    this.getStore().invalidate();
  }

  onPreviewerToneOfSingerAutocompleteChange(param) {
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

export default PreviewerComponent;
