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

  onChordiventorPreviewChipClicked(param) {
    if(this.getStore().allowGotoPreviewPage()) Router.gotoPreviewerPage(this);
    else this.showWarningSnackMessage(`撰寫的內容不符合悅譜規定，請IG洽詢「明悅」`)
  }

  /** -------------------- async api -------------------- **/
}

export default ChordiventorComponent;
