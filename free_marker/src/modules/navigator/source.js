const component = {
    path: "/navigator",
    name: "navigator",
    useLazy: false,
    disposablePage: false,
    isNavigatorView: true,
    cookies: [
        {
            name: "user",
            type: `object` /** type是object 就是拿出來再幫你JSON.parse(...) */
        },
        {
            name: "SampleOfStringCookie",
            type: `string`,
            defaultValue: "i lovin it(2024.11.26)"
        },
        {
            name: "infoOfCartie",
            type: "object"
            /**
             * {
             *   idOfCookieUsage:{idOfBooze,idOfVariant,nameOfBooze,count,timestamp,checked}
             * }
             * 註解一：idOfCookieUsage的格式(唯一碼)為 `idOfBooze|idOfVariant`
             * 註解二：count的累加邏輯都在BaseUserInfo
             * 註解三：checked代表商品確定購買，要送到後端去
             * */
        }
    ],
    events: [
        {
            name: "authStateChanged",
            params: ["user"]
        }
    ],
    struct: {
        name: `navigator`,
        view: "div",
        textsOfI18n: { sample: "範例", example: "超級範例" },
        type: "object",
        children: [
            {
                name: "whetherSearchMode",
                type: "boolean",
                defaultValue: false
            },
            {
                name: "whetherEditMode",
                type: "boolean",
                defaultValue: false
            },
            {
                name: "toolBar",
                view: `Toolbar`,
                needParam: true,
                wrapView: "AppBar",
                children: [
                    {
                        name: "menu",
                        view: "IconButton",
                        icon: "MenuRounded",
                        injectStyle: true,
                        props: {
                            edge: "start",
                            color: "inherit"
                        }
                    },
                    {
                        name: "title",
                        view: "Typography",
                        type: "string",
                        l10n: true,
                        incest: { view: false, attribute: true },
                        wrapView: "div",
                        defaultValue: "明悅科技",
                        click: true
                    },
                    {
                        name: "whetherKeywordWasFetching",
                        type: "boolean",
                        defaultValue: false,
                        incest: { view: false, attribute: true }
                    },
                    {
                        name: "complete",
                        view: "Autocomplete",
                        type: "objectOfEmpty",
                        label: "請輸入關鍵字",
                        size: "small",
                        search: true,
                        injectStyle: true,
                        incest: { view: false, attribute: true }
                    },
                    {
                        name: "cartie",
                        view: "IconButton",
                        injectStyle: true,
                        size: "large",
                        propsOfBadge: { color: "error", anchorOrigin: { vertical: "top", horizontal: "left" } },
                        propsOfIcon: { sx: { color: "white" } },
                        icon: "ShoppingCart",
                        badge: true
                    },
                    {
                        name: "tipOfLoading",
                        view: "CircularProgress",
                        injectStyle: true,
                        props: {
                            size: "1.2rem",
                            color: "inherit"
                        },
                        incest: { view: false, attribute: true }
                    },
                    {
                        name: `search`,
                        needParam: true,
                        view: "IconButton",
                        injectStyle: true,
                        size: "large",
                        icon: "SearchRounded",
                        propsOfIcon: { sx: { color: "white" } }
                    },
                    {
                        name: `edit`,
                        needParam: true,
                        view: "IconButton",
                        injectStyle: true,
                        size: "large",
                        icon: "EditSharp",
                        propsOfIcon: { sx: { color: "white" } }
                    },
                    {
                        name: `login`,
                        needParam: true,
                        view: "IconButton",
                        injectStyle: true,
                        size: "large",
                        icon: "Login",
                        propsOfIcon: { sx: { color: "white" } }
                    },
                    {
                        name: "account",
                        view: "IconButton",
                        injectStyle: true,
                        size: "large",
                        icon: "AccountCircle",
                        propsOfIcon: { sx: { color: "white" } },
                        loginRequiredAlert: true,
                        alertDialog: {
                            customView: "account",
                            needActionButtons: false,
                            strict: true
                        }
                    }
                ]
            },
            {
                name: "drawer",
                view: "Drawer",
                needParam: true,
                props: {
                    anchor: "top",
                    onClose: "###() => self.onDrawerClosed()",
                    open: "###self.getDrawerOpenStatus()",
                    classes: { paper: "NavigatorDrawerDrawer" }
                },
                children: [
                    {
                        name: "shortcut",
                        plural: "s",
                        path: "/shortcuts",
                        listView: "List",
                        conditions: [`{type:'orderBy', params:['indexOfSequence']}`],
                        type: "array",
                        incest: { view: false, attribute: true },
                        view: "ListItem",
                        column: true,
                        permission: {
                            create: "isAdmin()",
                            update: "isAdmin()",
                            read: "alwaysTrue()",
                            delete: "isAdmin()"
                        },
                        children: [
                            {
                                column: true,
                                name: "indexOfSequence",
                                type: "number",
                                description: "用來調整順序orderBy"
                            },
                            {
                                name: "id",
                                column: true,
                                type: "string",
                                description: "shortcut的id沒辦法自己產不出來，超怪，可能ref自己"
                            },
                            {
                                column: true,
                                name: "title",
                                view: "Typography",
                                type: "string"
                            },
                            {
                                column: true,
                                name: "route",
                                type: "string"
                                /** 'path:https://www.google.com/' or  `route:exam:31232:tedsld` page後面接的是param */
                            },
                            {
                                column: true,
                                name: "icon",
                                view: "img",
                                type: "string"
                                /**  'muIcon:HelpCenter' or 'path:https://www.google.com/' */
                            },
                            {
                                name: "open",
                                type: "number"
                            },
                            {
                                column: true,
                                name: "sub",
                                type: "array",
                                plural: "s",
                                ref: "shortcut"
                            }
                        ]
                    }
                ]
            },
            {
                name: "globalPerspective",
                type: "object",
                path: `/global/preferences`,
                permission: {
                    read: "alwaysTrue()",
                    write: "isAdmin()",
                    delete: "isAdmin()",
                    update: "isAdmin()"
                },
                children: [
                    {
                        name: "nameOfBrand",
                        column: true,
                        type: "string",
                        description: `修改店舖[企業名稱]名稱（左上方的title）`,
                        defaultValue: ``
                    },
                    {
                        name: "amountOfAllowAnonymousBuy",
                        type: "number",
                        defaultValue: 1000,
                        description: `避免巨額棄單，未登入用戶需要限制金額。`,
                        column: true
                    },
                    {
                        name: "amountOfMaximumBuy",
                        type: "number",
                        defaultValue: 20000,
                        description: `單筆交易最高額度。`,
                        column: true
                    },
                    {
                        name: "numOfWorker",
                        type: "number",
                        description: `用來存放有多少處理Task的人數。`,
                        column: true,
                        defaultValue: 1
                    },
                    {
                        name: "percentageOfDiscount",
                        type: "number",
                        defaultValue: 3,
                        description: `彈性調整全店購物優惠折扣(3%=97折)。`,
                        column: true
                    },
                    {
                        name: "whetherDisplaySpecific",
                        column: true,
                        type: "boolean",
                        description: `是否顯示公司資訊`,
                        defaultValue: false
                    },
                    {
                        name: "companyO",
                        column: true,
                        type: "string",
                        description: `公司登記名稱（經濟部）`,
                        defaultValue: ``
                    },
                    {
                        name: "unifiedB",
                        column: true,
                        type: "string",
                        description: `統一編號`,
                        defaultValue: ``
                    },
                    {
                        name: "phoneO",
                        column: true,
                        type: "string",
                        description: `店鋪「聯絡電話」official`,
                        defaultValue: ``
                    },
                    {
                        name: "fbO",
                        column: true,
                        type: "string",
                        description: `(官方)網址連結`,
                        defaultValue: ``
                    },
                    {
                        name: "igO",
                        column: true,
                        type: "string",
                        description: `(官方)網址連結`,
                        defaultValue: ``
                    },
                    {
                        name: "ytO",
                        column: true,
                        type: "string",
                        description: `(官方)網址連結`,
                        defaultValue: ``
                    },
                    {
                        name: "tiktokO",
                        column: true,
                        type: "string",
                        description: `(官方)網址連結`,
                        defaultValue: ``
                    },
                    {
                        name: "maximumOfUniqueItems",
                        column: true,
                        type: "number",
                        description: `單筆交易最多可以有多少品項`,
                        defaultValue: 25
                    },
                    {
                        name: "addressO",
                        column: true,
                        type: "string",
                        description: `公司地址`,
                        defaultValue: ``
                    },
                    {
                        name: "emailO",
                        column: true,
                        type: "string",
                        description: `(官方)Email`,
                        defaultValue: ``
                    },
                    {
                        name: "lineO",
                        column: true,
                        type: "string",
                        description: `(官方)Email`,
                        defaultValue: ``
                    },
                    {
                        name: "ttlOfPayment",
                        column: true,
                        type: "number",
                        description: `交易完成後， (Time To Live)最長能接受多久的寬限期(分鐘)，超過就會被schedule失效`,
                        defaultValue: 360
                    },
                    {
                        name: "ttlOfAnonymous",
                        column: true,
                        type: "number",
                        description: `陌生交易完成後， (Time To Live)最長能接受多久的寬限期(分鐘)，超過就會被schedule失效`,
                        defaultValue: 60
                    },
                    {
                        name: "enableOfBoughtWithoutLoginIn",
                        column: true,
                        type: "boolean",
                        description: `同意免登入下單功能。`,
                        defaultValue: false
                    }
                ]
            },
            {
                name: `keyword`,
                type: `array`,
                plural: `s`,
                path: "/keywords",
                disableInitFetch: true,
                cheap: true,
                children: [
                    {
                        type: "string",
                        name: "value",
                        column: true,
                        description: "本質內容"
                    },
                    {
                        type: "string",
                        name: "label",
                        column: true,
                        description: "顯示在屏幕上"
                    },
                    {
                        type: "number",
                        name: "type",
                        column: true,
                        description: "用來當作額router"
                    },
                    {
                        name: "popularLevel",
                        type: "number",
                        column: true,
                        defaultValue: 1,
                        description: "order時候,會desc,讓最熱門的項目留在最上方"
                    },
                    {
                        type: "string",
                        name: "uid",
                        column: true,
                        description: "用來放document id,由type 判斷路由"
                    },
                    {
                        type: "string",
                        name: "extra",
                        column: true,
                        description: "用來放解釋|額外資訊, 也許type很快就忘了起初的定義"
                    }
                ],
                permission: {
                    read: "alwaysTrue()"
                }
            }
        ]
    }
};

export default component;
