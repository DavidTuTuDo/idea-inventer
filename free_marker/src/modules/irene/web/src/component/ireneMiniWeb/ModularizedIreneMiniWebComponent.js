const edit = true;

import { utiller as Util, exceptioner as ERROR, pooller as InfinitePool } from "utiller";
import _ from "lodash";
import React, { Component, createRef } from "react";
import Box from "@mui/material/Box";

import BaseIreneMiniWebComponent from "./BaseIreneMiniWebComponent";

class ModularizedIreneMiniWebComponent extends BaseIreneMiniWebComponent {
    /** -------------------- fields -------------------- **/

    /** -------------------- functions -------------------- **/

    constructor(props) {
        super(props);
        this.iframeRef = createRef();
    }

    /**
     * 4. 监听 iframe URL 变化的回调函数
     */
    handleLoad = () => {
        this.setState({ isLoading: false });
        const currentIframe = this.iframeRef.current;
        if (currentIframe && currentIframe.contentWindow) {
            try {
                // 尝试获取 iframe 内部的 URL
                const newUrl = currentIframe.contentWindow.location.href;
                // 调用 Prop 传入的回调函数
                this.getComponentInstance().onIframeUrlChange?.(newUrl);
            } catch (error) {
                // 跨域安全错误处理
                // console.warn('无法获取跨域 iframe 的 URL:', error);
                this.getComponentInstance().onIframeUrlChange?.("跨域内容: 无法获取 URL");
            }
        }
    };

    getInjectViewOfIreneMiniWebDiv = () => {
        const self = this;
        return (
            <Box
                component="iframe"
                ref={self.iframeRef}
                src={self.getStore().getHref()} // 2. 接收参数 href
                onLoad={self.handleLoad} // 监听加载完成
                sx={{
                    width: "100%",
                    height: "100vh", // 高度设置
                    border: "none",
                    display: self.getStore().isGlobalLoading() ? "none" : "block" // 加载中隐藏 iframe
                }}
            />
        );
    };

    /** -------------------- async api -------------------- **/
}

export default ModularizedIreneMiniWebComponent;
