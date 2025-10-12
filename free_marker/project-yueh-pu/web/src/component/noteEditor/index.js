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
        this.getStore().updateStringOfSubmit().then();
    }

    onNoteEditorFunctionAreaCancelButtonClicked(param) {
        this.dismiss();
    }

    /** -------------------- async api -------------------- **/
}

export default NoteEditorComponent;
