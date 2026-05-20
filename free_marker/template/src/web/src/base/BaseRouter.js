import { utiller as Util } from "utiller";
import libpath from "path";
import Config from "../config";
import _ from "lodash";

class BaseRouter {
    currentParam = [];

    currentComponent = undefined;

    currentRoute = "";
    setCurrentComponent = (component) => {
        this.currentComponent = component;
    };

    setCurrentRoute(route) {
        this.currentRoute = route;
    }

    getCurrentRoute(route) {
        return this.currentRoute;
    }

    App = () => {
        return require("../").Application;
    };

    isGotoSameRoute(route) {
        return Util.isEqual(this.currentRoute, route);
    }

    routeTo(component, path) {
        const navigate = component?.props?.navigate;

        if (navigate) {
            return navigate(path);
        }

        // 如果執行到這裡，代表導航失敗
        return Util.appendError(`45665512 導航失敗：可能是 component 缺失或未提供 navigate props [${path}]`);
    }

    getCurrentPath = () => {
        if (this.currentComponent) {
            const history = this.currentComponent.props.history;
            return history.location.pathname;
        }
        return "";
    };

    getPathOfEditorRoute = () => {
        const segment = this.getCurrentPath().split("/");
        const newbie = segment.map((each, index) => {
            return index === 1 ? `${each}editor` : each;
        });
        return newbie.join("/");
    };

    routeToHomePage(component) {
        this.routeTo(component, "/");
        return libpath.join(Config.host, "/");
    }

    getPathOfDeEditorRoute = () => {
        const segment = this.getCurrentPath().split("/");
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
        const segment = this.getCurrentPath().split("/");
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
