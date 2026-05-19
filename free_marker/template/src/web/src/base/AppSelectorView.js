const edit = true;

import React from "react";
import { observable, action, makeObservable } from "mobx";
import { observer } from "mobx-react";

/**
 * AppSelectorStore — 全域檔案選擇器狀態
 * 採用與 AppLoadingView 相同的 MobX 獨立 Store 模式，
 * 使檔案選擇器的狀態變更不會觸發 BaseComponent 整體 re-render。
 */
class AppSelectorStore {
    /** 檔案選擇器的 ref (由 View 內部管理) */
    inputRef = React.createRef();

    @observable
    params = {
        type: "file",
        accept: "file",
        multiple: false,
    };

    /** 檔案選取後的 callback，由 BaseComponent 在 mount 時註冊 */
    onFilesSelectedCallback = null;

    constructor() {
        makeObservable(this);
    }

    /**
     * 設定選擇器參數並觸發檔案選擇對話框
     * @param {{ accept: string, multiple: boolean, type: string }} newParams
     */
    @action
    setParamsAndOpen(newParams) {
        this.params = { ...this.getDefaultParams(), ...newParams };
        // 延遲一個 tick 等 React render 完成後再 click
        setTimeout(() => {
            if (this.inputRef.current) {
                this.inputRef.current.click();
            }
        }, 10);
    }

    /**
     * 註冊檔案選取後的 callback
     * @param {Function} callback - (files: Array) => void
     */
    registerCallback(callback) {
        this.onFilesSelectedCallback = callback;
    }

    /** 清除 callback (componentWillUnmount 時呼叫) */
    unregisterCallback() {
        this.onFilesSelectedCallback = null;
    }

    getDefaultParams() {
        return {
            type: "file",
            accept: "file",
            multiple: false,
        };
    }
}

export const storeOfAppSelector = new AppSelectorStore();

/**
 * 獨立的 File Selector View
 * 使用 observer 確保只有這裡會因為 params 改變而 re-render，
 * 不會觸發 BaseComponent 的 render()。
 */
const AppSelectorView = observer(() => {
    const { params, inputRef } = storeOfAppSelector;

    const onFilesSelectedEventReceived = (event) => {
        event.stopPropagation();
        event.preventDefault();
        const files = event.target.files;
        const array = [];
        for (const index in files) {
            const file = files[index];
            if (file instanceof File) {
                array.push({
                    name: file.name,
                    index: index,
                    blob: file,
                    url: URL.createObjectURL(file),
                });
            }
        }
        if (array.length > 0 && storeOfAppSelector.onFilesSelectedCallback) {
            storeOfAppSelector.onFilesSelectedCallback(array);
        }

        /** 將事件內選到檔案清空，不然選到同一個檔案將無法觸發onChange */
        event.target.value = "";
    };

    return (
        <input
            multiple={params.multiple}
            type={params.type}
            accept={params.accept}
            ref={inputRef}
            style={{ display: "none" }}
            onChange={onFilesSelectedEventReceived}
        />
    );
});

export default AppSelectorView;
