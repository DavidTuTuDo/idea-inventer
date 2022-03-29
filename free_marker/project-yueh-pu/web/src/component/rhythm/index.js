import {inject} from "mobx-react";
import BaseRhythmComponent from "./BaseRhythmComponent";
import {
    utiller as Util,
    exceptioner as ERROR,
    pooller as InfinitePool,
} from "utiller";
import _ from "lodash";
import libpath from "path";
import Typography from "@material-ui/core/Typography";
import {observer} from "mobx-react";
import RhythmStore from "../../store/rhythm";
import Style from "../../style";
import MenuIcon from "@material-ui/icons/menu";
import React from "react";
import {Application} from "../../";
import Config from "../../config";
import Router from "../../router";
import Cookie from "../../cookie";
import BaseComponent from "../../base/BaseComponent";

@inject("rhythm")
@observer
class RhythmComponent extends BaseRhythmComponent {
    /** -------------------- fields -------------------- **/
    /** -------------------- functions -------------------- **/

    constructor(props) {
        super(props);
    }

    getGuitarpuContext(guitarpu) {
        const encrypt = super.getGuitarpuContext(guitarpu);
        const decrypt = Util.getDecryptString(encrypt);
        const normalize = _.replace(decrypt, new RegExp(` `, `gm`), ` `);
        return normalize;
    }

    /** -------------------- async api -------------------- **/
}

export default RhythmComponent;
