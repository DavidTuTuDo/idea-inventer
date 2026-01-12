const edit = true;

import BaseComponent from "./BaseComponent";
import UserInfo from "../base/BaseUserInfo";
import copy from "copy-to-clipboard";
import functions from "../functions";
import { utiller as Util, exceptioner as ERROR } from "utiller";
import { isMobile } from "react-device-detect";
import _ from 'lodash';
import Router from'../router';

class ImpComponent extends BaseComponent {
    constructor(props) {
        super(props);
    }

    getCurrentLocation = async () => {
        const self = this;
        if (!navigator.geolocation) {
            this.showWarningSnackMessage("您的瀏覽器不支援地理定位");
            return;
        }
        navigator.geolocation.getCurrentPosition(
            async (position) => {
                const { latitude, longitude } = position.coords;
                console.log({ latitude, longitude });
                try {
                    const fetchedAddress = await functions.httpOnCallGetCurrentAddress(self, { latitude, longitude });
                    Util.appendInfo(fetchedAddress);
                    return fetchedAddress;
                } catch (error) {
                    this.showWarningSnackMessage("無法獲取地址，請手動輸入地址");
                }
            },
            (error) => {
                this.showWarningSnackMessage("無法獲取地理位置，請檢查您的定位服務是否開啟");
            }
        );
    };

    enableLoginConfirmDialog = () => {
        const self = this;
        this.getStore().setGlobalDialogContent({
            title: "此功能必須登入",
            content: "此功能必須登入,點擊確認後將喚起登入頁面",
            task: async () => await self.invokeLoginBehavior()
        });
        Util.performActionWithoutTimingIssue(() => self.getLoginDialogRef().open());
    };

    enableAlertDialog = (title = "標題", content = "內容", task = async () => true) => {
        const self = this;
        this.getStore().setGlobalDialogContent({
            title,
            content,
            task
        });
        Util.performActionWithoutTimingIssue(() => self.getLoginDialogRef().open());
    };

    invokeLoginBehavior = async () => {
        await Util.syncDelay(10);
        if (!UserInfo.isLoginWithSucceed()) this.App().getNavigatorRef().onNavigatorLoginIconButtonClicked();
    };

    openLineChatAccountWithMessage(id = "", message = "") {
        if (!isMobile) {
            this.showInfoSnackMessage(`抱歉,此功能僅提供在移動設備上(手機,平板)`);
            return;
        }
        this.gotoUrlWithNewTabDirectly(`https://line.me/R/oaMessage/${id}/?${message}`);
    }

    showWarningSnackMessage(message) {
        return this.updateSnackStatus(true, message, { type: `warning` });
    }

    showInfoSnackMessage(message, func) {
        return this.updateSnackStatus(true, message, { type: `info`, func });
    }

    showErrorSnackMessage(message) {
        console.error(message);
        return this.updateSnackStatus(true, message, { type: `error` });
    }

    showSuccessSnackMessage(message) {
        return this.updateSnackStatus(true, message, { type: `success` });
    }

    invokeEMailBehavior(email, subject = "", body = "", children = "") {
        if (!Util.isUndefinedNullEmpty(email)) {
            this.copyTextToClipboard(email);
            let params = subject || body ? "?" : "";
            if (subject) params += `subject=${encodeURIComponent(subject)}`;
            if (body) params += `${subject ? "&" : ""}body=${encodeURIComponent(body)}`;
            const link = document.createElement(`a`);
            link.target = `_blank`;
            link.rel = `noopener noreferrer`;
            link.href = `mailto:${email}${params}`;
            link.text = children;
            link.click();
        }
    }

    invokePhoneBehavior = (phone) => {
        if (!Util.isUndefinedNullEmpty(phone)) {
            this.copyTextToClipboard(phone);
            const link = document.createElement(`a`);
            link.target = `_blank`;
            link.rel = `noopener noreferrer`;
            link.href = `tel:${phone}`;
            link.click();
        }
    };

    invokeInstagramApp = (website) => {
        const forceToWebsite = true;

        const username = Util.getTailStringSplitBy(website, "/");
        if (isMobile && !forceToWebsite) {
            window.open(`instagram://user?username=${username}`, "_blank");
        } else {
            this.copyTextToClipboard(website, `已複製網址至剪貼簿`);
            this.gotoUrlWithNewTab(website);
        }
    };

    invokeFacebookApp = (website) => {
        const forceToWebsite = true;
        const idOfPage = Util.getTailStringSplitBy(website, "/");
        if (isMobile && !forceToWebsite) {
            window.open(`fb://page/${idOfPage}`, "_blank");
        } else {
            this.copyTextToClipboard(website, `已複製網址至剪貼簿`);
            this.gotoUrlWithNewTab(website);
        }
    };

    invokeLineApp = (idOfLine, message) => {
        this.gotoExternalUrlDirectly(`https://line.me/ti/p/~${idOfLine}`);
    };

    appendStyle(style) {
        this.style = { ...this.style, ...style };
    }

    appendComponentStyle(style) {
        this.componentStyle = { ...this.componentStyle, ...style };
    }

    /** path:'https://' or route:'pageName:...params'*/
    handleCustomRouter = (routeString = "") => {
        const words = routeString.split(":");
        const type = words.shift();
        switch (type) {
            case "path":
                const path = words.join(":");
                this.gotoExternalUrl(path);
                break;
            case "route":
                const page = words.shift();
                const functionName = `goto${_.upperFirst(page)}Page`;
                const functionOfGotoPage = Router[functionName];
                if (_.isFunction(functionOfGotoPage)) {
                    functionOfGotoPage(this.getComponentInstance(), ...words);
                } else {
                    this.updateSnackStatus(true, `4097 can't handle ${page}`, { type: "error" });
                }
                break;
            default:
                if (_.isEmpty(routeString)) {
                    /** doing nothing */
                } else {
                    this.updateSnackStatus(true, `can't handle ${routeString}`, { type: "error" });
                }
                break;
        }
    };

    async handleRestFulResult(restfulResult, succeedBehavior) {
        if (restfulResult === undefined) return;
        if (restfulResult.status === "succeed") {
            await succeedBehavior(restfulResult.data);
        } else if (restfulResult.status === "fail") {
            this.updateSnackStatus(true, restfulResult.message, { type: "warning" });
        } else {
            throw new ERROR(7007, `status ===> ${restfulResult.status}`);
        }
    }

    copyCurrentLinkToClipboard(message = `已複製當前的連結`) {
        copy(this.getCurrentWebSiteLink());
        this.getComponentInstance().showInfoSnackMessage(message);
    }

    copyTextToClipboard(text, message = `已將內容新增至剪貼簿`) {
        copy(text);
        this.getComponentInstance().showInfoSnackMessage(message);
    }

    /** auto completed 有suggest的概念{label,value,uid,popularLevel }*/
    getNumberOfSelected(suggest) {
        if (suggest !== null) {
            return suggest.value ? _.toNumber(suggest.value) : -1;
        }
        return 0;
    }

    download(path) {
        const link = document.createElement(`a`);
        link.href = `${path}`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    }
}

export default ImpComponent;
