const component = {
    name: "irene",
    disposablePage: true,
    title: "多種情境下會使用到的模組",
    struct: {
        name: `irene`,
        view: `div`
    },
    componentsOfExtra: [
        {
            name: "miniWeb",
            disposablePage: true,
            description: `可以開啟iframe然後完成給予href的功能，打開inside網頁`,
            struct: {
                name: "ireneMiniWeb",
                view: `div`,
                wrapView: "div",
                type: "object",
                injectView: true,
                children: [
                    {
                        name: "href",
                        type: "string",
                        column: true,
                        description: "iframe導引的頁面"
                    }
                ]
            }
        },
        {
            name: "ireneQrcode",
            disposablePage: true,
            path: `ireneQrcode`,
            description: `[QRCode掃碼付款]電腦版上產生QR View，當錢目的是做LinePay掃碼，不然網址會導引到怪怪的地方`,
            struct: {
                name: `ireneQrcode`,
                view: `div`,
                wrapView: "Paper",
                type: "object",
                injectWrapStyle: true,
                children: [
                    {
                        name: "useRemit",
                        type: "boolean",
                        defaultValue: false
                    },
                    {
                        name: "color",
                        type: "string",
                        defaultValue: `掃碼單位的企業顏色，用來當背景`
                    },
                    {
                        name: "visibleOfContent",
                        type: "boolean",
                        defaultValue: false,
                        description: `content是指定金額，有些情況用不到，就不顯示了`
                    },
                    {
                        name: "visibleOfCaution",
                        type: "boolean",
                        defaultValue: false,
                        description: `caution是官方提示，有些情況用不到，就不顯示了`
                    },
                    {
                        name: "main",
                        view: "div",
                        needParam: true,
                        children: [
                            {
                                name: "row",
                                view: "div",
                                needParam: true,
                                children: [
                                    {
                                        name: "main",
                                        type: "string",
                                        view: "Typography",
                                        incest: { view: false, attribute: true },
                                        description: `LINE`
                                    },
                                    {
                                        name: "sub",
                                        type: "string",
                                        injectWrapStyle: true,
                                        view: "Typography",
                                        wrapView: "div",
                                        incest: { view: false, attribute: true },
                                        description: `PAY`
                                    }
                                ]
                            },
                            {
                                name: "scan",
                                view: "div",
                                needParam: true,
                                click: true,
                                children: [
                                    {
                                        name: "tip",
                                        type: "string",
                                        view: "Typography",
                                        incest: { view: false, attribute: true },
                                        defaultValue: `（點擊開啟應用程式）`,
                                        description: `點擊提示`
                                    },
                                    {
                                        name: "href",
                                        type: "string",
                                        view: "QRCode",
                                        wrapView: "div",
                                        injectWrapStyle: true,
                                        incest: { view: false, attribute: true },
                                        description: `產生QRCODE`
                                    },
                                    {
                                        name: "owl",
                                        view: "div",
                                        needParam: true,
                                        injectStyle: true,
                                        children: [
                                            {
                                                name: "remitBank",
                                                type: "string",
                                                view: "Typography",
                                                incest: { view: false, attribute: true },
                                                defaultValue: `103（新光銀行）`,
                                                labelView: {
                                                    enable: true,
                                                    defaultValue: `代碼：`
                                                }
                                            },
                                            {
                                                name: "remitSerial",
                                                type: "string",
                                                view: "Typography",
                                                incest: { view: false, attribute: true },
                                                defaultValue: `0833-50206-5505`,
                                                labelView: {
                                                    enable: true,
                                                    defaultValue: `帳號：`
                                                }
                                            }
                                        ]
                                    },
                                    {
                                        name: "title",
                                        type: "string",
                                        view: "Typography",
                                        incest: { view: false, attribute: true },
                                        description: `莎夏美妝店`
                                    }
                                ]
                            },
                            {
                                name: "content",
                                type: "string",
                                view: "Typography",
                                incest: { view: false, attribute: true },
                                labelView: {
                                    enable: true,
                                    defaultValue: `支付費用：`
                                },
                                description: `支付費用：NT$ 1201 元`
                            },
                            {
                                name: "caution",
                                type: "string",
                                view: "Typography",
                                incest: { view: false, attribute: true }
                            }
                        ]
                    }
                ]
            }
        },
        {
            name: "textsFetch",
            disposablePage: true,
            description: `[增加多個項目]->回傳陣列當作[...string]的dialog view`,
            struct: {
                name: `ireneTextsFetch`,
                view: `Paper`,
                wrapView: "div",
                type: "object",
                children: [
                    {
                        name: "enableGoTop",
                        type: "boolean",
                        defaultValue: false
                    },
                    {
                        name: "title",
                        plural: "s",
                        view: "div",
                        type: "array",
                        defaultValue: [{}, {}, {}],
                        children: [
                            {
                                name: "index",
                                view: "Typography",
                                type: "string",
                                defaultValue: "1"
                            },
                            {
                                name: "content",
                                view: "TextField",
                                type: "string",
                                variant: "standard",
                                singleLine: true
                            },
                            {
                                name: "clear",
                                view: "IconButton",
                                needParam: true,
                                injectStyle: true,
                                icon: "DeleteForeverRounded"
                            }
                        ]
                    },
                    {
                        name: "func",
                        view: "div",
                        needParam: true,
                        children: [
                            {
                                name: "leave",
                                view: "Chip",
                                type: "string",
                                incest: { view: false, attribute: true },
                                variant: "outlined",
                                defaultValue: "離開"
                            },
                            {
                                name: "append",
                                view: "Chip",
                                type: "string",
                                incest: { view: false, attribute: true },
                                variant: "outlined",
                                color: "error",
                                defaultValue: "新增"
                            }
                        ]
                    }
                ]
            }
        },
        {
            name: "textFetch",
            disposablePage: true,
            description: `[增加單一項目]只能輸入一條String的Dialog View`,
            struct: {
                name: `ireneTextFetch`,
                view: `Paper`,
                wrapView: "div",
                type: "object",
                children: [
                    {
                        name: "row",
                        view: "div",
                        needParam: true,
                        children: [
                            {
                                name: "title",
                                view: "Typography",
                                type: "string",
                                incest: { view: false, attribute: true },
                                defaultValue: "輸入內容：",
                                singleLine: true
                            },
                            {
                                name: "content",
                                view: "TextField",
                                type: "string",
                                variant: "standard",
                                incest: { view: false, attribute: true },
                                singleLine: true
                            },
                            {
                                name: "clear",
                                view: "IconButton",
                                incest: { view: false, attribute: true },
                                needParam: true,
                                icon: "ClearRounded"
                            }
                        ]
                    },
                    {
                        name: "func",
                        view: "div",
                        needParam: true,
                        children: [
                            {
                                name: "leave",
                                view: "Chip",
                                type: "string",
                                incest: { view: false, attribute: true },
                                variant: "outlined",
                                defaultValue: "離開"
                            },
                            {
                                name: "append",
                                view: "Chip",
                                type: "string",
                                incest: { view: false, attribute: true },
                                variant: "outlined",
                                color: "error",
                                defaultValue: "新增"
                            }
                        ]
                    }
                ]
            }
        },
        {
            name: "textsIndexSetter",
            disposablePage: true,
            description: `[單元歸屬分頁設定]將單一個商品做分類，可以複選|單選|置頂 的功能頁面`,
            struct: {
                name: `ireneTextsIndexSetter`,
                view: `Paper`,
                wrapView: "div",
                type: "object",
                children: [
                    {
                        name: "enableOfGoTop",
                        defaultValue: true,
                        type: "boolean"
                    },
                    {
                        name: "row",
                        plural: "s",
                        view: "div",
                        type: "array",
                        example: [
                            { label: "所有商品" },
                            { label: "寶雅專櫃" },
                            { label: "大潤發專櫃" },
                            { label: "特價區" },
                            { label: "家樂福專櫃" },
                            { label: "大樂專櫃" },
                            { label: "頂好專櫃" }
                        ],
                        children: [
                            {
                                name: "belong",
                                description: `勾選為分頁搜尋依據`,
                                type: "boolean",
                                view: "Checkbox",
                                injectStyle: true,
                                column: true,
                                wrapView: "div",
                                defaultValue: false
                            },
                            {
                                name: "label",
                                view: "Typography",
                                type: "string",
                                variant: "standard",
                                column: true,
                                singleLine: true
                            },
                            {
                                name: "value",
                                column: true,
                                type: "number",
                                description: `讓資料庫比對用的value(number)`
                            },
                            {
                                name: "type",
                                column: true,
                                type: "string"
                            },
                            {
                                defaultValue: "置頂",
                                name: "goTop",
                                view: "Chip",
                                type: "string",
                                injectStyle: true,
                                variant: "outlined"
                            }
                        ]
                    },
                    {
                        name: "func",
                        view: "div",
                        needParam: true,
                        children: [
                            {
                                name: "leave",
                                view: "Chip",
                                type: "string",
                                incest: { view: false, attribute: true },
                                variant: "outlined",
                                defaultValue: "離開"
                            },
                            {
                                name: "update",
                                view: "Chip",
                                type: "string",
                                incest: { view: false, attribute: true },
                                variant: "outlined",
                                color: "error",
                                defaultValue: "更新"
                            }
                        ]
                    }
                ]
            }
        },
        {
            name: "timePeriod",
            disposablePage: true,
            description: `[時間的區間選擇工具]偶爾會需要這樣的字串 15:00-17:00`,
            struct: {
                name: `ireneTimePeriod`,
                view: `Paper`,
                wrapView: "div",
                type: "object",
                children: [
                    {
                        view: "div",
                        name: "main",
                        needParam: true,
                        children: [
                            {
                                name: "timeOfStart",
                                type: "timestamp",
                                view: "TimePicker",
                                size: "small",
                                column: true,
                                format: `HH:mm`,
                                defaultValue: "###dayjs()",
                                incest: { view: false, attribute: true },
                                labelView: {
                                    enable: true,
                                    defaultValue: `開始時間：`
                                }
                            },
                            {
                                name: "timeOfEnd",
                                type: "timestamp",
                                view: "TimePicker",
                                size: "small",
                                column: true,
                                format: `HH:mm`,
                                defaultValue: "###dayjs()",
                                incest: { view: false, attribute: true },
                                labelView: {
                                    enable: true,
                                    defaultValue: `結束時間：`
                                }
                            }
                        ]
                    },
                    {
                        name: "func",
                        view: "div",
                        needParam: true,
                        children: [
                            {
                                name: "leave",
                                view: "Chip",
                                type: "string",
                                incest: { view: false, attribute: true },
                                variant: "outlined",
                                defaultValue: "離開"
                            },
                            {
                                name: "confirm",
                                view: "Chip",
                                type: "string",
                                incest: { view: false, attribute: true },
                                variant: "outlined",
                                color: "error",
                                defaultValue: "確認"
                            }
                        ]
                    }
                ]
            }
        },
        {
            name: "numberSetter",
            disposablePage: true,
            description: `[數字輸入器]會有輸入數字的需求，例如價格｜數量｜折扣`,
            struct: {
                name: `ireneNumberSetter`,
                view: `Paper`,
                wrapView: "div",
                type: "object",
                children: [
                    {
                        view: "div",
                        name: "row",
                        type: "array",
                        plural: "s",
                        needParam: true,
                        example: [
                            { label: "原價", value: 0 },
                            { label: "特價", value: 0 }
                        ],
                        children: [
                            {
                                name: "label",
                                view: "Typography",
                                type: "string",
                                defaultValue: "標題"
                            },
                            {
                                name: "colon",
                                view: "Typography",
                                type: "string",
                                defaultValue: "："
                            },
                            {
                                name: "value",
                                view: "TextField",
                                type: "number",
                                size: "small",
                                variant: "outlined",
                                props: {
                                    sx: {
                                        input: { textAlign: "right" },
                                        "& .MuiInputBase-input.Mui-disabled": {
                                            WebkitTextFillColor: "black"
                                        }
                                    }
                                },
                                defaultValue: 0
                            }
                        ]
                    },
                    {
                        name: "func",
                        view: "div",
                        needParam: true,
                        children: [
                            {
                                name: "leave",
                                view: "Chip",
                                type: "string",
                                incest: { view: false, attribute: true },
                                variant: "outlined",
                                defaultValue: "離開"
                            },
                            {
                                name: "confirm",
                                view: "Chip",
                                type: "string",
                                incest: { view: false, attribute: true },
                                variant: "outlined",
                                color: "error",
                                defaultValue: "確認"
                            }
                        ]
                    }
                ]
            }
        }
    ]
};

export default component;
