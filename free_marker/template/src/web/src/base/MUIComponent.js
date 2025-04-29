import React from "react";
import { observer } from "mobx-react";
import * as MUIcon from "@mui/icons-material";
import _ from "lodash";
import { Parser } from "html-to-react";
import { utiller as Util } from "utiller";
import { toJS, isObservable } from "mobx";

class MuiComponent extends React.Component {
    constructor(props) {
        super(props);
    }

    asJS(proxyOfObservable) {
        return isObservable(proxyOfObservable) ? toJS(proxyOfObservable) : proxyOfObservable;
    }

    MUIconView = observer(({ name }) => {
        const CustomView = MUIcon[name];
        if (CustomView !== undefined) return <CustomView className={"BaseShortcutMUIconView"} />;
        else {
            const Random = _.sample(MUIcon);
            return <Random className={"BaseShortcutMUIconView"} />;
        }
    });

    gotoPreviewPage() {
        window.history.back();
    }

    getElementByClassName(className) {
        const element = document.getElementsByClassName(className)[0];
        return element;
    }

    getElementsByClassName(className) {
        const elements = document.getElementsByClassName(className);
        return elements;
    }

    isHtmlStringFormat(string) {
        return /<[a-z]+\d?(\s+[\w-]+=("[^"]*"|'[^']*'))*\s*\/?>|&#?\w+;/i.test(string);
    }

    handleTextString(object) {
        if (typeof object === "string") {
            if (this.isHtmlStringFormat(object)) {
                const content = Parser().parse(object);
                Util.appendInfo(`handleTextString() get textOfHtml format`, content);
                return content;
            }
            return object;
        } else {
            return _.toString(object);
        }
    }

    gotoUrlWithNewTabDirectly(url) {
        window.open(url, "_blank");
    }

    gotoExternalUrlDirectly(url) {
        window.location.replace(url);
    }

    /**
     * @param className
     * @param attribute font-size
     */
    getStyleByElementClassName(className, attribute) {
        const view = this.getElementByClassName(className);
        const style = window.getComputedStyle(view, null);
        const value = style.getPropertyValue(attribute);
        return value;
    }

    getStyleByElement(element, attribute) {
        const style = window.getComputedStyle(element, null);
        const value = style.getPropertyValue(attribute);
        return value;
    }

    renderHtmlOfDocument(textOfRender) {
        if (this.isHtmlStringFormat(textOfRender)) document.write(textOfRender);
    }

    /** 修改所有className 的elements */
    adjustBunchOfFontSizeByClassName(className, enlarge = true, delta = 1) {
        const elements = this.getElementsByClassName(className);
        for (const element of elements) {
            const originValue = parseFloat(this.getStyleByElement(element, "font-size"));
            const nextValue = enlarge ? originValue + delta : originValue - delta;
            element.style.fontSize = `${nextValue}px`;
        }
    }

    adjustFontSizeByClassName(className, enlarge = true, delta = 1) {
        const element = this.getElementByClassName(className);
        const originValue = parseFloat(this.getStyleByElementClassName(className, "font-size"));
        const nextValue = enlarge ? originValue + delta : originValue - delta;
        element.style.fontSize = `${nextValue}px`;
    }

    getCheckStateByEvent(event) {
        if (event && event.target) return event.target.checked;
        return false;
    }

    getLatestValueByEvent(event) {
        if (event && event.target) return event.target.value;
        return "";
    }
}

export default MuiComponent;
