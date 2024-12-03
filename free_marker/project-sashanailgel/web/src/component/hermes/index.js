const edit = true;
import {inject} from "mobx-react";
import BaseHermesComponent from "./BaseHermesComponent";
import {utiller as Util, exceptioner as ERROR, pooller as InfinitePool} from "utiller";
import _ from "lodash";
import libpath from "path";
import Router from '../../router';
import {observer} from "mobx-react";

@inject("hermes")
@observer
class HermesComponent extends BaseHermesComponent {
    /** -------------------- fields -------------------- **/

    /** -------------------- functions -------------------- **/

    constructor(props) {
        super(props);
    }

    getWrapInjectStyleOfHermesWholeCheckbox(hermes) {
        return Util.getVisibleOrHidden(false);
    }

    onHermesSubmitChipClicked(param) {
        if (this.getStore().hasSurelyChoice()){
            this.getStore().updateTransportInfo();
            Router.gotoPlutusPage(this);
        }

        else
            this.showWarningSnackMessage(`尚未選擇付款方式`)
    }

    onHermesTransportChoiceCheckboxChange(param) {
        const transport = param.object;
        this.getStore().updateCheckboxStatus(transport);
    }


    /** -------------------- async api -------------------- **/
}

export default HermesComponent;
