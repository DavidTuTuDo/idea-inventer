const component = {
    name: "account",
    path: "/account",
    events: [
        {
            name: "authStateChanged",
            params: ["user"]
        }
    ],
    struct: {
        name: "account",
        type: "object",
        view: "Paper",
        ruleOfOuter: "end",
        wrapView: "div",
        children: [
            {
                name: "info",
                view: "div",
                needParam: true,
                children: [
                    {
                        name: "urlOfHeadPhoto",
                        view: "Avatar",
                        type: "string",
                        incest: { view: false, attribute: true }
                    },
                    {
                        name: "valueOfName",
                        type: "string",
                        view: "Typography",
                        defaultValue: "讀取中...",
                        incest: { view: false, attribute: true }
                    },
                    {
                        name: "valueOfEmail",
                        type: "string",
                        view: "Typography",
                        defaultValue: "讀取中...",
                        incest: { view: false, attribute: true }
                    },
                    {
                        name: "valueOfId",
                        type: "string",
                        // view: "Typography",
                        l10n: true,
                        incest: { view: false, attribute: true }
                        // defaultValue: "個人令牌"
                    }
                ]
            },
            {
                name: "basic",
                view: "div",
                injectStyle: true,
                needParam: true,
                children: [
                    {
                        name: "labelOfProp",
                        type: "string",
                        defaultValue: `選擇語言`,
                        view: "Typography",
                        incest: { view: false, attribute: true }
                    },
                    {
                        name: "lang",
                        column: true,
                        size: `small`,
                        description_: `選擇系統語言`,
                        incest: { view: false, attribute: true },
                        select: {
                            type: "spinner",
                            defaultValue: 1,
                            defaultValue: "zh_TW",
                            values: [
                                {
                                    label: "繁體中文",
                                    value: "zh_TW"
                                },
                                {
                                    label: "简体中文",
                                    value: "zh_CN"
                                },
                                {
                                    label: "English",
                                    value: "en_US"
                                }
                            ]
                        },
                        listProps: {
                            sx: {
                                "& .MuiOutlinedInput-root": {
                                    borderRadius: "20px", // 自訂圓角程度
                                    fontSize: "0.85rem" // 更精確地針對 input 本身設字體大小
                                }
                            }
                        }
                    }
                ]
            },
            {
                name: "area",
                view: "div",
                needParam: true,
                children: [
                    {
                        name: "sale",
                        view: "AccordionDetails",
                        title: "我的賣場",
                        icon: "ExpandMore",
                        wrapProps: {
                            square: true, // 保留圓角
                            disableGutters: true, // 取消內建 margin 處理
                            elevation: 0, // 取消陰影（等同 box-shadow: none）
                            sx: {
                                display: `###UserInfoRef.isAuthorUser() ? 'block':'none'`,
                                mt: "10px", // 跟 margin-bottom 一樣距離
                                borderRadius: "21px",
                                backgroundColor: "#fff",
                                border: "1px solid #e0e0e0",
                                boxShadow: "none",
                                overflow: "hidden"
                            }
                        },
                        needParam: true,
                        children: [
                            {
                                name: "listOfAuthorOrder",
                                view: "ArrowOption",
                                defaultContent: "未出貨｜未付款",
                                defaultTitle: "訂單處理",
                                needWrap: true,
                                incest: { view: false, attribute: true },
                                description: ""
                            },
                            {
                                name: "appendBooze",
                                view: "ArrowOption",
                                // defaultContent: "未設定",
                                defaultTitle: "新增商品",
                                needWrap: true,
                                incest: { view: false, attribute: true },
                                description: "(電商功能)新增上架商品"
                            },
                            {
                                name: "goToMyBooze",
                                view: "ArrowOption",
                                defaultContent: "線上｜未上架",
                                defaultTitle: "我的商品",
                                needWrap: true,
                                incest: { view: false, attribute: true },
                                description: "(電商功能)就管理創立商品的入口點"
                            },
                            {
                                name: "marketSetting",
                                view: "ArrowOption",
                                defaultContent: "線上支付｜管理",
                                defaultTitle: "環境設定",
                                needWrap: true,
                                incest: { view: false, attribute: true },
                                description: "(電商功能)設定支付帳號，店名，店內工作人數"
                            },
                            {
                                name: "mySchedule",
                                view: "ArrowOption",
                                defaultContent: "日｜週｜月曆",
                                defaultTitle: "行事曆",
                                needWrap: true,
                                incest: { view: false, attribute: true },
                                description: "(電商功能)可以看到所有訂單(商品|課程)的一覽表"
                            },
                            {
                                name: "myReport",
                                view: "ArrowOption",
                                defaultContent: "預期｜已實現收益",
                                defaultTitle: "數據報表",
                                needWrap: true,
                                incest: { view: false, attribute: true },
                                description: "(電商功能)可以設定區間查詢收益|查詢實際收益(線上支付要扣除手續費)|預期收益(這個月還沒結束，預先計算出賺了多少)"
                            }
                        ]
                    },
                    {
                        name: "buy",
                        view: "AccordionDetails",
                        title: "我的購物",
                        icon: "ExpandMore",
                        needParam: true,
                        wrapProps: {
                            square: true, // 保留圓角
                            disableGutters: true, // 取消內建 margin 處理
                            elevation: 0, // 取消陰影（等同 box-shadow: none）
                            sx: {
                                display: `###Config.EPayType ?'block':'none'`,
                                mt: "10px", // 跟 margin-bottom 一樣距離
                                borderRadius: "21px",
                                backgroundColor: "#fff",
                                border: "1px solid #e0e0e0",
                                boxShadow: "none",
                                overflow: "hidden"
                            }
                        },
                        children: [
                            {
                                name: "listOfUserOrder",
                                view: "ArrowOption",
                                defaultContent: "待付款｜已完成",
                                defaultTitle: "購物紀錄",
                                needWrap: true,
                                incest: { view: false, attribute: true },
                                description: "客端看到自己購物",
                                injectWrapStyle: true
                            }
                        ]
                    },
                    {
                        name: "admin",
                        view: "AccordionDetails",
                        title: "管理功能",
                        icon: "ExpandMore",
                        needParam: true,
                        wrapProps: {
                            square: true,
                            disableGutters: true, // 取消內建 margin 處理
                            elevation: 0, // 取消陰影（等同 box-shadow: none）
                            sx: {
                                display: `###UserInfoRef.isAdmin() ?'block':'none'`,
                                mt: "10px", // 跟 margin-bottom 一樣距離
                                borderRadius: "21px",
                                backgroundColor: "#fff",
                                border: "1px solid #e0e0e0",
                                boxShadow: "none",
                                overflow: "hidden"
                            }
                        },
                        children: [
                            {
                                name: "goEditMode",
                                view: "ArrowOption",
                                // defaultContent: "未設定",
                                defaultTitle: "編輯模式",
                                needWrap: true,
                                incest: { view: false, attribute: true },
                                description: "token就是firestore(user)的document id"
                            },
                            {
                                name: "appendAdmin",
                                view: "ArrowOption",
                                defaultContent: "最高權限",
                                defaultTitle: "新增管理人",
                                needWrap: true,
                                incest: { view: false, attribute: true },
                                description: "將用戶權限改為ADMIN",
                                alertDialog: {
                                    title: "修改用戶提升為為「管理者」",
                                    textInput: {
                                        value: "",
                                        enable: true,
                                        type: "text" /** email,phone,*/,
                                        label: "請輸入用戶令牌" /** */
                                    }
                                },
                                injectWrapStyle: true
                            },
                            {
                                name: "appendAuthor",
                                view: "ArrowOption",
                                // defaultContent: "未設定",
                                defaultTitle: "新增賣家",
                                needWrap: true,
                                incest: { view: false, attribute: true },
                                description: "將用戶權限改為AUTHOR=true",
                                alertDialog: {
                                    title: "修改用戶提升為為「賣家」",
                                    strict: true,
                                    textInput: {
                                        value: "",
                                        enable: true,
                                        type: "text" /** email,phone,*/,
                                        label: "請輸入用戶令牌" /** */
                                    }
                                },
                                injectWrapStyle: true
                            },
                            {
                                name: "appendReader",
                                view: "ArrowOption",
                                // defaultContent: "未設定",
                                defaultTitle: "新增讀取",
                                needWrap: true,
                                incest: { view: false, attribute: true },
                                description: "新增讀取人的權限{allowRead=true}",
                                alertDialog: {
                                    title: "將用戶讀取權限提升至「悅讀人」",
                                    strict: true,
                                    textInput: {
                                        value: "",
                                        enable: true,
                                        type: "text" /** email,phone,*/,
                                        label: "請輸入用戶令牌" /** */
                                    }
                                },
                                injectWrapStyle: true
                            }
                        ]
                    },
                    {
                        name: "user",
                        view: "AccordionDetails",
                        title: "個人功能",
                        icon: "ExpandMore",
                        needParam: true,
                        wrapProps: {
                            square: true,
                            disableGutters: true, // 取消內建 margin 處理
                            elevation: 0, // 取消陰影（等同 box-shadow: none）
                            sx: {
                                mt: "10px", // 跟 margin-bottom 一樣距離
                                borderRadius: "21px",
                                backgroundColor: "#fff",
                                border: "1px solid #e0e0e0",
                                boxShadow: "none",
                                overflow: "hidden"
                            }
                        },
                        children: [
                            {
                                name: "token",
                                view: "ArrowOption",
                                defaultTitle: "我的令牌",
                                needWrap: true,
                                incest: { view: false, attribute: true },
                                description: "就是firestore(user)的document id"
                            },
                            {
                                name: "usages",
                                view: "ArrowOption",
                                // defaultContent: "未設定",
                                defaultTitle: "網站使用條款",
                                needWrap: true,
                                incest: { view: false, attribute: true },
                                alertDialog: {
                                    customView: "infoOfCopyRightUsages",
                                    fullWidth: true,
                                    needActionButtons: false
                                }
                            },
                            {
                                name: "privacy",
                                view: "ArrowOption",
                                // defaultContent: "未設定",
                                defaultTitle: "隱私權政策",
                                needWrap: true,
                                incest: { view: false, attribute: true },
                                alertDialog: {
                                    customView: "infoOfCopyRightPrivacy",
                                    fullWidth: true,
                                    needActionButtons: false
                                }
                            },
                            {
                                name: "cleanCache",
                                view: "ArrowOption",
                                // defaultContent: "未設定",
                                defaultTitle: "清除餅乾",
                                needWrap: true,
                                incest: { view: false, attribute: true },
                                description: "清除Cookie"
                            },
                            {
                                name: "logout",
                                view: "ArrowOption",
                                // defaultContent: "未設定",
                                defaultTitle: "登出會員",
                                needWrap: true,
                                incest: { view: false, attribute: true },
                                description: "logout有什麼需要解釋的",
                                alertDialog: {
                                    fullWidth: true,
                                    title: "再次確認",
                                    content: "是否確定登出?"
                                }
                            }
                        ]
                    }
                ]
            },
            {
                name: `user`,
                plural: "s",
                disableInitFetch: true,
                type: "array",
                path: "users",
                permission: {
                    create: `isAdmin() || isSelf(user)`,
                    delete: `isAdmin()`,
                    update: "isAdmin() || isSelf(user)",
                    read: "isSelf(user)"
                },
                paginate: {
                    size: 30
                },
                children: [
                    {
                        name: "uid",
                        column: true,
                        type: "string"
                    },
                    {
                        name: "phone",
                        column: true,
                        type: "string"
                    },
                    {
                        name: "providerId",
                        column: true,
                        type: "string"
                    },
                    {
                        name: "email",
                        column: true,
                        type: "string"
                    },
                    {
                        name: "isAnonymous",
                        column: true,
                        type: "boolean",
                        defaultValue: true,
                        description: "是否為陌生訪問"
                    },
                    {
                        name: "displayName",
                        column: true,
                        type: "string"
                    },
                    {
                        name: "photoURL",
                        column: true,
                        type: "string"
                    },
                    {
                        name: "phoneNumber",
                        column: true,
                        type: "string"
                    },
                    {
                        name: "accessToken",
                        column: true,
                        type: "string"
                    },
                    {
                        name: "emailVerified",
                        column: true,
                        type: "number"
                    },
                    {
                        name: "allowRead",
                        column: true,
                        type: "boolean",
                        defaultValue: false,
                        description: `目前用在悅譜能不能讀取TONE，不然版權問題一爆就爆了`
                    },
                    {
                        name: "isAdmin",
                        column: true,
                        type: "boolean",
                        defaultValue: false,
                        description: `判斷是不是Super User 的 Permission`
                    },
                    {
                        name: "isAuthor",
                        column: true,
                        type: "boolean",
                        defaultValue: false,
                        description: `判斷是不是有資格創立商品`
                    }
                ]
            },
            {
                name: `fingerprint`,
                type: "array",
                disableInitFetch: true,
                path: `fingerprint`,
                plural: "s",
                children: [
                    {
                        name: "lastAccessedAt",
                        type: "timestamp",
                        description: "最近一次訪問時間",
                        column: true
                    }
                ]
            },
            {
                name: `liffUser`,
                type: `array`,
                column: true,
                path: `liffUser`,
                permission: {
                    create: `alwaysTrue()`,
                    delete: `isAdmin()`,
                    read: "isAdmin(user)"
                },
                children: [
                    {
                        name: "token",
                        type: "string",
                        column: true
                    },
                    {
                        name: "name",
                        type: "string",
                        column: true
                    },
                    {
                        name: "photo",
                        type: "string",
                        column: true
                    }
                ]
            }
        ]
    }
};

export default component;
