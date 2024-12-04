const edit = true;
import {inject} from "mobx-react";
import BaseMaenadsComponent from "./BaseMaenadsComponent";
import {utiller as Util, exceptioner as ERROR, pooller as InfinitePool} from "utiller";
import _ from "lodash";
import libpath from "path";
import Chip from "@mui/material/Chip";
import Typography from "@mui/material/Typography";
import {observer} from "mobx-react";
import Paper from "@mui/material/Paper";
import Style from "../../style";
import i18n from "../../i18n";
import React from "react";
import UserInfoRef from "../../base/BaseUserInfo";
import {Application} from "../../";
import Config from "../../config";
import Router from "../../router";
import Cookie from "../../cookie";
import BaseComponent from "../../base/BaseComponent";
import params from "lodash/seq";

@inject("maenads")
@observer
class MaenadsComponent extends BaseMaenadsComponent {
    /** -------------------- fields -------------------- **/

    /** -------------------- functions -------------------- **/

    constructor(props) {
        super(props);
    }

    onMaenadsOptionDivClicked(param) {
        const option = param.object;
        this.getStore().setCurrentOption(option);
    }

    getInjectPropsOfMaenadsOptionNameChip(option) {
        const index = this.getStore().getIndexOfOption(option);
        return {color: _.isEqual(index, this.getStore().getIndexOfSelected(option)) ? 'error' : 'default'};
    }

    getMaenadsCount(maenads) {
        const count = super.getMaenadsCount(maenads);
        return count > 0 ? ` 剩 ${count} 個` : `未選擇`;
    }

    getMaenadsPrice(maenads) {
        const price = super.getMaenadsPrice(maenads);
        const judgement = _.startsWith(_.trim(price), '$') || _.startsWith(_.trim(price), '＄');
        return judgement ? price : `＄${price}`;
    }

    onMaenadsIncreaseIconButtonClicked(param) {
        super.onMaenadsIncreaseIconButtonClicked(param);
        this.getStore().validateCountOfOrder();
    }

    onMaenadsDecreaseIconButtonClicked(param) {
        super.onMaenadsDecreaseIconButtonClicked(param);
        this.getStore().validateCountOfOrder(false);
    }

    onMaenadsSubmitChipClicked(param) {
        if (this.getStore().getIndexOfSelected() < 0) {
            this.getComponentInstance(true).showWarningSnackMessage(`尚未選擇商品`)
        } else {
            const maenads = param.object;
            const idOfBooze = maenads.getBooze().id;
            const idOfOption = maenads.getOptions()[this.getStore().getIndexOfSelected()].getValue();
            const count = _.toInteger(this.getStore().getCountOfSubmit())
            UserInfoRef.joinItemToCart({idOfBooze, idOfOption, count});
            this.getComponentInstance(true).showInfoSnackMessage(`已加入購物車`);
            this.dismiss();
        }
    }


    /** -------------------- async api -------------------- **/
}

export default MaenadsComponent;
