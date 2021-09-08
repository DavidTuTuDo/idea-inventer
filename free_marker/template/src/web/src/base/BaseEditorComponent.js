import _ from 'lodash'
import React from "react";
import moment from 'moment';
import {utiller as Util, exceptioner as ERROR,} from "utiller";
import {Typography, LinearProgress, CircularProgress, Button, Paper} from "@material-ui/core";
import {Application} from '../index.js';
import BaseComponent from './BaseComponent';
import Firebaser from './CommonFirebaseHelper';
import watermark from 'watermarkjs';
import Config from '../config';

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
            {name: 'batchUpdate', loadingText: '正在遠端批次更新中', buttonText: '遠端批次更新'},
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
        needWaterMark: false,
        folderName: '',
        beforeSubmit: (localUrl) => Util.appendInfo(localUrl),
        afterSubmit: (remoteUrl) => Util.appendInfo(remoteUrl)
    };

    onImageEditorClicked(task) {
        this.currentImageTask = task;
        this.enableImageSelectView(false);
    }

    /** origin 的 資料結構是 參照 onFileSelected */
    async buildWatermarkBlob(origin){
        const configOfWatermark  = Config.watermark;
        switch (configOfWatermark.type) {
            case "text":
                const watermarkTextNode = watermark.text;
                const functionNameOfText = watermarkTextNode[configOfWatermark.position];
                const blobOfTextWatermark = await watermark([origin.blob])
                    .blob(functionNameOfText(configOfWatermark.src, configOfWatermark.textStyle, configOfWatermark.color, configOfWatermark.alpha))
                blobOfTextWatermark.name = `watermark_`+origin.blob.name;
                return blobOfTextWatermark;
                break;
            case "image":
                const watermarkImageNode = watermark.image;
                const functionNameOfImage = watermarkImageNode[configOfWatermark.position];
                const blobOfImageWatermark = await watermark([origin.url,configOfWatermark.src])
                    .blob(functionNameOfImage(configOfWatermark.alpha))
                blobOfImageWatermark.name = `watermark_`+origin.blob.name;
                return blobOfImageWatermark;
                break
            default:
                throw new ERROR(9999,'un-handle watermark type');
        }


    }

    uploadImageStorage = async (file) => {
        this.setLoadingViewVisibility(true);
        if (this.currentImageTask.needWatermark) {
            const blobOfWatermark = await this.buildWatermarkBlob(file);
            await this.currentImageTask.beforeSubmit(URL.createObjectURL(blobOfWatermark));
            const urlOfWatermark = await Firebaser.uploadImage(blobOfWatermark, this.currentImageTask.folderName);
            const urlOfOrigin = await Firebaser.uploadImage(file.blob, this.currentImageTask.folderName);
            await this.currentImageTask.afterSubmit({watermark: urlOfWatermark, origin: urlOfOrigin});
        } else {
            await this.currentImageTask.beforeSubmit(file.url);
            const url = await Firebaser.uploadImage(file.blob, this.currentImageTask.folderName);
            await this.currentImageTask.afterSubmit(url);
        }
        watermark.destroy();
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
        return this.renderEditorFunctionView(BaseEditorComponent.getObjectRemoteJobs(), onEditClickAsyncTask)
    }

    async handleAsyncFunction(onClickAsyncTask, type, processingText) {
        await onClickAsyncTask(type);
    }


}

export default BaseEditorComponent;

