import { inject } from "mobx-react";
import BaseNoteEditorComponent from "./BaseNoteEditorComponent";
import { observer } from "mobx-react";

class NoteEditorComponent extends BaseNoteEditorComponent {
    /** -------------------- fields -------------------- **/
    /** -------------------- functions -------------------- **/

    constructor(props) {
        super(props);
        this.getStore().setNoteId(this.getComponentInstance().getUidOfSheetDetail());
    }

    onNoteEditorFunctionAreaSubmitButtonClicked(param) {
        this.exeAsyncT(this.getStore().updateStringOfSubmit());
    }

    onNoteEditorFunctionAreaCancelButtonClicked(param) {
        this.dismiss();
    }

    /** -------------------- async api -------------------- **/
}

export default NoteEditorComponent;
