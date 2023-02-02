import BaseNoteEditorStore from "./BaseNoteEditorStore";
import {
    utiller as Util,
    exceptioner as ERROR,
    pooller as InfinitePool,
} from "utiller";
import _ from "lodash";
import libpath from "path";
import {Application} from "../../";
import Config from "../../config";
import Router from "../../router";
import Cookie from "../../cookie";
import UserInfoRef from "../../base/BaseUserInfo";
import {
    makeAutoObservable,
    makeObservable,
    action,
    observable,
    comparer,
    computed,
    autorun,
    runInAction,
} from "mobx";
import FunctionArea from "../noteEditorFunctionArea";
import BaseStore from "../../base/BaseStore";
import GuitarPuNote from '../personalRhythmGuitarPuNote';

class NoteEditorStore extends BaseNoteEditorStore {
    /** -------------------- fields -------------------- **/
    /** -------------------- functions -------------------- **/

    constructor(props) {
        super(props);
        this.apiOfGuitarNote = new GuitarPuNote();
        this.setContentDisabled(true);
        this.idOfNote = '';
    }

    setNoteId(id = '') {
        this.idOfNote = id;
    }

    async fetch() {
        const result = await super.fetch(this.getComponent());
        /** fetch content from remote */
        const noteOfGuitarPu = await this.apiOfGuitarNote.fetchGuitarPuNoteItem(this.getComponent(), this.idOfNote);
        if (noteOfGuitarPu.exists) {
            this.setContent(noteOfGuitarPu.statement);
        }
        return result;
    }

    async updateStringOfSubmit() {
        switch (this.getContentDisabled()) {
            case true:
                this.setContentDisabled(false);
                this.getFunctionArea().setSubmit('儲存');
                break
            case false:
                const result = await this.apiOfGuitarNote.submitGuitarPuNoteItem(this.getComponent(),  {
                    idOfGuitarPu: this.idOfNote,
                    statement: this.getContent(),

                },this.idOfNote);
                this.getComponent().showInfoSnackMessage('已更新 筆記內容');
                this.setContentDisabled(true);
                this.getFunctionArea().setSubmit('編輯');
                /** update remote item */
                break
        }
    }

    /** -------------------- async api -------------------- **/
}

export default NoteEditorStore;
