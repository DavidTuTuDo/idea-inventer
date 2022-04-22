import {inject} from "mobx-react";
import BaseNoteEditorComponent from "./BaseNoteEditorComponent";
import {
    utiller as Util,
    exceptioner as ERROR,
    pooller as InfinitePool,
} from "utiller";
import _ from "lodash";
import libpath from "path";
import Button from "@material-ui/core/Button";
import {observer} from "mobx-react";
import TextField from "@material-ui/core/TextField";
import Paper from "@material-ui/core/Paper";
import NoteEditorStore from "../../store/noteEditor";
import Style from "../../style";
import React from "react";
import UserInfoRef from "../../base/BaseUserInfo";
import {Application} from "../../";
import Config from "../../config";
import Router from "../../router";
import Cookie from "../../cookie";
import BaseComponent from "../../base/BaseComponent";

@inject("noteEditor")
@observer
class NoteEditorComponent extends BaseNoteEditorComponent {
    /** -------------------- fields -------------------- **/
    /** -------------------- functions -------------------- **/

    constructor(props) {
        super(props);
        this.getStore().setNoteId(this.getComponentInstance().getUidOfDetail())
    }

    onNoteEditorFunctionAreaSubmitButtonClicked(param) {
        this.getStore().updateStringOfSubmit().then();
    }

    onNoteEditorFunctionAreaCancelButtonClicked(param) {
        this.dismiss();
    }

    /** -------------------- async api -------------------- **/
}

export default NoteEditorComponent;
