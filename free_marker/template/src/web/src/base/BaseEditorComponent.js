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
import UserInfoRef from '../userInfo';

class BaseEditorComponent extends BaseComponent {

    static getItemRemoteJobs(name = '') {
        return [
            {name: 'update', loadingText: '正在遠端更新中', buttonText: `更新遠端${name}`},
            {name: 'delete', loadingText: '正在遠端刪除中', buttonText: `遠端刪除${name}`},
            {name: 'recover', loadingText: '正在遠端回復中', buttonText: `回復初始${name}`},
            {name: 'duplicate', loadingText: '正在遠端複製更新中', buttonText: `遠端複製${name}`},
        ]
    }

    static getCollectionRemoteJobs(name = '') {
        return [
            {name: 'create', loadingText: '正在遠端新增中', buttonText: `遠端新增項目${name}`},
            {name: 'batchUpdate', loadingText: '正在遠端批次更新中', buttonText: `遠端批次更新${name}`},
        ]
    }

    static getObjectRemoteJobs(name = '') {
        return [
            {name: 'submit', loadingText: '正在遠端處理中', buttonText: `更新遠端${name}`},
            {name: 'recover', loadingText: '正在遠端回復中', buttonText: `回復初始${name}`},

        ]
    }

    static getItemJobs(name) {
        return [
            {name: 'delete', loadingText: '正在刪除中', buttonText: `刪除${name}`},
        ]
    }

    static getCollectionJobs(name = '') {
        return [
            {name: 'create', loadingText: '正在新增中', buttonText: `新增${name}`},
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

    currentUploadImagesTaskInfo = {
        needWaterMark: false,
        folderName: '',
        asyncTaskOfBeforeSubmit: (localUrls) => Util.appendInfo(localUrls),
        asyncTaskOfAfterSubmit: (remoteUrls) => Util.appendInfo(remoteUrls)
    };

    onImageEditorClicked(task) {
        this.currentUploadImagesTaskInfo = task;
        this.enableImageSelectView(false);
    }

    /** origin 的 資料結構是 參照 onFileSelected */
    async buildWatermarkBlob(origin) {
        const configOfWatermark = Config.watermark;
        switch (configOfWatermark.type) {
            case "text":
                const watermarkTextNode = watermark.text;
                const functionNameOfText = watermarkTextNode[configOfWatermark.position];
                const blobOfTextWatermark = await watermark([origin.blob])
                    .blob(functionNameOfText(configOfWatermark.src, configOfWatermark.textStyle, configOfWatermark.color, configOfWatermark.alpha))
                blobOfTextWatermark.name = `watermark_` + origin.blob.name;
                return blobOfTextWatermark;
                break;
            case "image":
                const watermarkImageNode = watermark.image;
                const functionNameOfImage = watermarkImageNode[configOfWatermark.position];
                const blobOfImageWatermark = await watermark([origin.url, configOfWatermark.src])
                    .blob(functionNameOfImage(configOfWatermark.alpha))
                blobOfImageWatermark.name = `watermark_` + origin.blob.name;
                return blobOfImageWatermark;
                break
            default:
                throw new ERROR(9999, 'un-handle watermark type');
        }


    }

    uploadImageStorage = async (view, files) => {
        const self = this;
        if (files.length === 1) {
            const file = files[0];
            const task = async () => {
                if (self.currentUploadImagesTaskInfo.needWatermark) {
                    const blobOfWatermark = await self.buildWatermarkBlob(file);
                    await self.currentUploadImagesTaskInfo.asyncTaskOfBeforeSubmit(URL.createObjectURL(blobOfWatermark));
                    const urlOfWatermark = await Firebaser.uploadImage(blobOfWatermark, self.currentUploadImagesTaskInfo.folderName);
                    const urlOfOrigin = await Firebaser.uploadImage(file.blob, self.currentUploadImagesTaskInfo.folderName);
                    await self.currentUploadImagesTaskInfo.asyncTaskOfAfterSubmit([{
                        watermark: urlOfWatermark,
                        origin: urlOfOrigin
                    }]);
                } else {
                    await self.currentUploadImagesTaskInfo.asyncTaskOfBeforeSubmit([file.url]);
                    const url = await Firebaser.uploadImage(file.blob, self.currentUploadImagesTaskInfo.folderName);
                    await self.currentUploadImagesTaskInfo.asyncTaskOfAfterSubmit([url]);
                }
                watermark.destroy();
            }
            await this.getStore().runUIAsyncTask(task, 'upload image', file.url, self);
        } else {
            const task = async () => {
                const urls = files.map((each => each.url));
                self.currentUploadImagesTaskInfo.asyncTaskOfBeforeSubmit(urls);
                const remoteUrls = [];
                for (const file of files) {
                    const remoteUrl = await Firebaser.uploadImage(file.blob, self.currentUploadImagesTaskInfo.folderName);
                    remoteUrls.push(remoteUrl);
                }
                self.currentUploadImagesTaskInfo.asyncTaskOfAfterSubmit(remoteUrls);
            }
            await this.getStore().runUIAsyncTask(task, 'upload images', '多圖上傳', self);
        }
    }

    onFilesSelected = (files) => {
        this.uploadImageStorage(this, files).then();
    }

    renderItemEditorView(onEditClickedAsyncTask, hasPath,sign) {
        return this.renderEditorFunctionView(hasPath ? BaseEditorComponent.getItemRemoteJobs(sign) : BaseEditorComponent.getItemJobs(sign),
            onEditClickedAsyncTask);
    }

    renderCollectionEditorView(onCreateClickedAsyncTask, hasPath,sign) {
        return this.renderEditorFunctionView(hasPath ? BaseEditorComponent.getCollectionRemoteJobs(sign) : BaseEditorComponent.getCollectionJobs(sign),
            onCreateClickedAsyncTask);
    }

    renderObjectEditorView(onEditClickAsyncTask,hasPath,sign) {
        return this.renderEditorFunctionView(BaseEditorComponent.getObjectRemoteJobs(sign), onEditClickAsyncTask)
    }

    async handleAsyncFunction(onClickAsyncTask, type, processingText) {
        await onClickAsyncTask(type);
    }

    renderSelectImageButtonView = (task) => {
        const self = this;
        const loginRequiredRef = React.createRef();
        self.currentUploadImagesTaskInfo = task
        return (<React.Fragment>
            {this.renderGlobalDialogView(loginRequiredRef)}

            <Button
                color={'primary'}
                onClick={(task) => {
                    if (!UserInfoRef.isLoginInSucceed()) {
                        loginRequiredRef.current.open()
                        return;
                    }
                    self.enableImageSelectView(true)
                }
                }
                className={'BaseImageSelectButton'}
                size={'large'}
                variant={'outlined'}>新增圖片</Button>
        </React.Fragment>)
    }


}

export default BaseEditorComponent;

