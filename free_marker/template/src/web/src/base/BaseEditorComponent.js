import _ from 'lodash'
import React from "react";
import moment from 'moment';
import {utiller as Util, exceptioner as ERROR,} from "utiller";
import {Typography, LinearProgress, CircularProgress, Button, Paper} from "@material-ui/core";
import {Application} from '../index.js';
import BaseComponent from './BaseComponent';
import Firebaser from './CommonFirebaseHelper'

class BaseEditorComponent extends BaseComponent {

    static getItemRemoteJobs() {
        return [
            {name: 'update', loadingText: '正在遠端更新中', buttonText: '更新遠端'},
            {name: 'delete', loadingText: '正在遠端刪除中', buttonText: '遠端刪除'},
            {name: 'recover', loadingText: '正在遠端回復中', buttonText: '回復初始'}
        ]
    }

    static getCollectionRemoteJobs() {
        return [
            {name: 'create', loadingText: '正在遠端新增中', buttonText: '遠端新增項目'},
        ]
    }

    static getObjectRemoteJobs() {
        return [
            {name: 'submit', loadingText: '正在遠端處理中', buttonText: '更新遠端'},
            {name: 'recover', loadingText: '正在遠端回復中', buttonText: '回復初始'},

        ]
    }

    static getItemJobs() {
        return [
            {name: 'delete', loadingText: '正在刪除中', buttonText: '刪除'},
        ]
    }

    static getCollectionJobs() {
        return [
            {name: 'create', loadingText: '正在新增中', buttonText: '新增'},
        ]
    }

    types = BaseEditorComponent.getItemJobs();


    renderEditorFunctionView(types, onClickedAsyncTask) {
        const self = this;
        return (
            <div
                className={"BaseEditorFunctionDiv"}>
                {types.map(type => {
                    return (
                        <Button
                            key={type.name}
                            className={"BaseEditFunctionButton"}
                            color={'primary'}
                            onClick={
                                () => self.handleAsyncFunction(onClickedAsyncTask, type.name, type.loadingText).then()
                            }
                            variant={"outlined"}>
                            {type.buttonText}
                        </Button>)
                })}
            </div>
        )
    }

    currentImageTask = {
        folderName: '',
        beforeSubmit: (localUrl) => Util.appendInfo(localUrl),
        afterSubmit: (remoteUrl) => Util.appendInfo(remoteUrl)
    };

    onImageEditorClicked(task) {
        this.currentImageTask = task;
        this.enableImageSelectView(false);
    }

    uploadImageStorage = async (file) => {
        await this.currentImageTask.beforeSubmit(file.url);
        this.setLoadingViewVisibility(true);
        const url = await Firebaser.uploadImage(file.blob, this.currentImageTask.folderName);
        await this.currentImageTask.afterSubmit(url);
        this.setLoadingViewVisibility(false);

    }

    onFilesSelected(files) {
        this.uploadImageStorage(files[0]).then();
    }

    renderItemEditorView(onEditClickedAsyncTask, hasPath) {
        return this.renderEditorFunctionView(hasPath ? BaseEditorComponent.getItemRemoteJobs() : BaseEditorComponent.getItemJobs(),
            onEditClickedAsyncTask);
    }

    renderCollectionEditorView(onCreateClickedAsyncTask, hasPath) {
        return this.renderEditorFunctionView(hasPath ? BaseEditorComponent.getCollectionRemoteJobs() : BaseEditorComponent.getCollectionJobs(),
            onCreateClickedAsyncTask);
    }

    renderObjectEditorView(onEditClickAsyncTask) {
        return this.renderEditorFunctionView(BaseEditorComponent.getObjectRemoteJobs(),onEditClickAsyncTask)
    }

    async handleAsyncFunction(onClickAsyncTask, type, processingText) {
        await onClickAsyncTask(type);
    }


}

export default BaseEditorComponent;

