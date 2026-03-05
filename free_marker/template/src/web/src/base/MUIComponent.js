const edit = true;

import React from "react";
import { observer } from "mobx-react";
import FiberManualRecord from "@mui/icons-material/FiberManualRecord";
import _ from "lodash";
import { Parser } from "html-to-react";
import { utiller as Util } from "utiller";
import { toJS, isObservable } from "mobx";
import Countdown from "react-countdown";
import Card from "@mui/material/Card";


class MuiComponent extends React.Component {
    constructor(props) {
        super(props);
    }

    asJS(proxyOfObservable) {
        return isObservable(proxyOfObservable) ? toJS(proxyOfObservable) : proxyOfObservable;
    }

    /**  import * as MUIcon from "@mui/icons-material"; <---這種引用方式把整個MUI包進去，導致bundle太大
     MUIconView = observer(({ name }) => {
     const CustomView = MUIcon[name];
     if (CustomView !== undefined) return <CustomView className={"BaseShortcutMUIconView"} />;
     else {
     const Random = _.sample(MUIcon);
     return <Random className={"BaseShortcutMUIconView"} />;
     }
     });
     */

    MUIconView = observer(({ name }) => {
        return <FiberManualRecord className={"BaseShortcutMUIconView"} />;
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

    handleNumber = (event, currentValue) => {
        // 1. 取得原始字串
        let nextValue = event?.target?.value;

        // 2. 如果使用者完全刪除內容，允許回傳空字串 (或是 0，視你的需求而定)
        if (nextValue === "") return "";

        // 3. 過濾掉非數字與非小數點的字元
        // 如果過濾後的字串與輸入不符（代表有英文字母），直接擋掉回傳舊值
        if (/[^0-9.]/g.test(nextValue)) {
            return currentValue;
        }

        // 4. 防止輸入多個小數點 (例如 153.12.3)
        const dots = nextValue.split(".");
        if (dots.length > 2) {
            return currentValue;
        }

        // 5. 處理前導零：僅在「不是 0.」開頭且長度 > 1 時處理
        if (nextValue.length > 1 && nextValue.startsWith("0") && !nextValue.startsWith("0.")) {
            nextValue = nextValue.replace(/^0+/, "") || "0";
        }

        // 6. 驗證是否為合法格式
        // 檢查是否結尾是點，或是合法的數字字串
        if (nextValue.endsWith(".") || !isNaN(_.toNumber(nextValue))) {
            return nextValue;
        }

        // 7. 若以上皆非，回傳舊值
        return currentValue;
    };

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

    CountdownView = observer(({ date, title }) => {
        const TimeDisplayView = ({ days, hours, minutes, seconds, completed }) => {
            const UnitView = ({ count, unit }) => {
                return (
                    <Card className={"BaseCountdownCountCard"}>
                        <Typography className={"BaseCountdownCountTypography"}>{count}</Typography>
                        <Typography className={"BaseCountdownUnitTypography"}>{unit}</Typography>
                    </Card>
                );
            };

            if (completed) {
                /** Render a completed state */
                return null;
            } else {
                const times = [
                    { unit: "天", count: days },
                    { unit: "小時", count: hours },
                    { unit: "分鐘", count: minutes },
                    { unit: "秒", count: seconds }
                ];
                return (
                    <div className={"BaseCountdownCountDiv"}>
                        <Typography className={"BaseCountdownTitleTypography"}>{title}</Typography>
                        <div />
                        <div className={"ListBaseCountdownCountDiv"}>
                            {times.map((each) => (
                                <UnitView key={each.unit} count={each.count} unit={each.unit} />
                            ))}
                        </div>
                    </div>
                );
            }
        };

        return <Countdown renderer={TimeDisplayView} date={Util.getCurrentTimeStamp() + Util.getDurationOfMillionSec(date)} />;
    });
}

export default MuiComponent;
