const edit = true;

import { utiller as Util } from "utiller";
// import libpath from "path"; // 移除：整個 src 只有這裡用到，改用字串拼接
import Config from "../config";
import UserInfo from "./BaseUserInfo";

class BaseRouter {
    currentParam = [];

    currentComponent = undefined;

    currentRoute = "/";

    setCurrentComponent = (component) => {
        this.currentComponent = component;
        this.currentRoute = this.getCurrentRoute();
    };

    setCurrentRoute(route) {
        this.currentRoute = route;
    }

    App = () => {
        return require("../").Application;
    };

    isGotoSameRoute = (route) => {
        return Util.isEqual(this.currentRoute, route);
    };

    routeTo(component, path) {
        const navigate = component?.props?.navigate;
        if (!this.isGotoSameRoute(path)) {
            UserInfo.modifyEditPen(false);
        }
        UserInfo.modifyEditMode(false);

        if (navigate) {
            return navigate(path);
        }

        // 如果執行到這裡，代表導航失敗
        return Util.appendError(`45665512 導航失敗：可能是 component 缺失或未提供 navigate props [${path}]`);
    }

    getCurrentRoute = () => {
        /** 使用 window.location.pathname 是最直接且不需要依賴 component props 的方式，
         *  在 react-router-dom 環境下依然準確。
         **/
        return window.location.pathname;
    };

    getPathOfEditorRoute = () => {
        const segment = this.getCurrentRoute().split("/");
        const newbie = segment.map((each, index) => {
            return index === 1 ? `${each}editor` : each;
        });
        return newbie.join("/");
    };

    routeToHomePage(component) {
        this.routeTo(component, "/");
        return `${Config.host}/`;
    }

    getPathOfDeEditorRoute = () => {
        const segment = this.getCurrentRoute().split("/");
        const newbie = segment.map((each, index) => {
            return index === 1 ? this.getStringOfDeEditor(each) : each;
        });
        return newbie.join("/");
    };

    getStringOfDeEditor(string) {
        const segment = string.split("editor");
        return segment.shift();
    }

    isEditPath = () => {
        const segment = this.getCurrentRoute().split("/");
        segment.shift();
        /** 第一個是空值 */

        const isEdit = Util.has(segment.shift(), "editor");
        console.log("isEdit===> ", isEdit);
        return isEdit;
    };

    gotoEditPage = (component) => {
        const { history } = component.props;
        const route = this.isEditPath() ? this.getPathOfDeEditorRoute() : this.getPathOfEditorRoute();
        history.push(route);
    };

    setCurrentParam = (...param) => {
        this.currentParam.length = 0;
        this.currentParam.push(...param);
    };

    gotoHomePage = (component) => {
        const route = `/`;
        this.routeTo(component, route);
        this.setCurrentRoute(route);
        return new URL(route, Config.host).href;
    };
}

export default BaseRouter;
