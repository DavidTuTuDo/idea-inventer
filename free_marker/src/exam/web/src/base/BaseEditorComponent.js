       import _ from 'lodash'
import React from "react";
import moment from 'moment';
import {utiller as Util, exceptioner as ERROR,} from "utiller";
import {Typography, LinearProgress, CircularProgress, Button, Paper} from "@material-ui/core";
import {Application} from '../index.js';
import BaseComponent from './BaseComponent';

class BaseEditorComponent extends BaseComponent {

    static getEditTypeObjects() {
        return [
            {name: 'update', loadingText: '正在更新中', buttonText: '更新'},
            {name: 'delete', loadingText: '正在刪除中', buttonText: '刪除'},
            {name: 'recover', loadingText: '正在回覆中', buttonText: '回復'}
        ]
    }

    types = BaseEditorComponent.getEditTypeObjects();

    renderEditFunctionView(onEditClickAsyncTask) {
        const self = this;
        return (
            <div
                className={"BaseEditorFunctionDiv"}>
                {self.types.map(type => {
                    return (
                        <Button
                            key={type.name}
                            className={"BaseEditFunctionButton"}
                            color={'primary'}
                            onClick={
                                () => self.handleAsyncFunction(onEditClickAsyncTask, type.name, type.loadingText).then()
                            }
                            variant={"outlined"}>
                            {type.buttonText}
                        </Button>)
                })}

            </div>
        )
    }

    async handleAsyncFunction(onEditClickAsyncTask, type, processingText) {
        this.setLoadingViewVisibility(true, processingText);
        await onEditClickAsyncTask(type);
        this.setLoadingViewVisibility(false);
    }


}

export default BaseEditorComponent;

