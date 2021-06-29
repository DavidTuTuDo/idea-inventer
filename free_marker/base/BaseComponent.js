import _ from 'lodash'
import React from "react";
import moment from 'moment';
import {utiller as Util} from "utiller";
import Store from "./BaseStore";


class BaseComponent extends React.Component {

    constructor(props) {
        super(props);
    }

    componentDidMount() {
    }

    renderLoadingView() {
        return <div>正在收集資料當中...</div>
    }

    renderErrorView(message) {
        return <div>出事了!阿伯...請聯絡管理員ＱＱ ${message}</div>
    }

    gotoPage(path){
        const { history } = this.props;
        history.push(path);
    }


    getStore() {
        return new Store();
    }

    render() {
        switch (this.getStore().state) {
            case "loading":
                return this.renderLoadingView();
            case "stable":
                return this.renderView();
            case "error":
                return this.renderErrorView(this.getStore().getErrorMsg());
            default:
                return this.renderView();
        }
    }
}

export default BaseComponent;

