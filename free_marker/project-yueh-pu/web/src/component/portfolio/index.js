import {inject} from "mobx-react";
import BasePortfolioComponent from "./BasePortfolioComponent";
import {observer} from "mobx-react";
import Router from "../../router";

@inject("portfolio")
@observer
class PortfolioComponent extends BasePortfolioComponent {
    /** -------------------- fields -------------------- **/
    /** -------------------- functions -------------------- **/

    constructor(props) {
        super(props);
    }

    onPortfolioRhythmCardClicked(param) {
        const rhythm = param.object;
        Router.gotoSheetDetailPage(this, rhythm.idOfGuitarPu)
    }

    isValidOfParamOfId(id) {
        return this.constraintOfParam(id);
    }

    isValidOfParamOfType(type) {
        return this.constraintOfParam(type, 'list', 'search', 'preludes');
    }

    /** -------------------- async api -------------------- **/
}

export default PortfolioComponent;
