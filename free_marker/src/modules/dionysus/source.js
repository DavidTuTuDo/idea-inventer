const component = {
    path: "/dionysus/:keyword?",
    name: "dionysus",
    destination: "module",
    useLazy: false,
    disposablePage: true,
    title: "精選商品列表",
    cloudFunctions: [
        // {
        //     name: "getCurrentAddress",
        //     type: "httpOnCall",
        //     description: "在網頁上拿到geo，再藉由google api去拿到接近地址",
        //     payload: { latitude: 0, longitude: 0 }
        // },
        // {
        //     name: "getDistanceOfSpecificAddress",
        //     type: "httpOnCall",
        //     description: "回傳距離莎夏的距離=> 6.2公里",
        //     payload: { address: "例：高雄市苓雅區武營路469巷16號" }
        // },
        {
            name: "sendEmailOfReceipt",
            type: "httpOnCall",
            description: "對送出的客戶發送Email",
            payload: { idOfSavior: "" } /** 發信的依據 */
        },
        {
            name: "generateDynamicPreview",
            type: "httpOnRequest",
            description: "讓ＳＰＡ的頁面讀「取特定網址」時，可以顯示出客制的預覽效果「芄食品」牛肉乾50公克 50元起"
        }
    ],
    enums: {
        ImageUploadMethod: {
            Minion: { value: 1, label: "產品圖片" },
            Banner: { value: 2, label: "置頂橫幅" }
        }
    },
    cookies: [
        {
            name: "infoOfCartie",
            type: "object"
            /**
             * {
             *   idOfCookieUsage:{idOfAuthor="", idOfBooze = "", idOfVariant = "", quantity=1, checked=true|fakse}
             * }
             * 註解一：idOfCookieUsage的格式(唯一碼)為 `idOfBooze|idOfVariant`
             * 註解二：count的累加邏輯都在BaseUserInfo
             * 註解三：checked代表商品確定購買，要送到後端去
             * */
        },
        {
            name: "totalPriceOfCartie",
            type: "string",
            defaultValue: "0"
            /** 總額 */
        },
        {
            name: "plutusInfo",
            type: "object",
            defaultValue: {
                name: "收件人姓名",
                phone: "收件電話",
                address: "店址",
                email: "電子信箱",
                city: "idOfSelected給城市用",
                district: "idOfSelected給區用"
            }
        },
        {
            name: "plutusCVS711",
            type: "object",
            defaultValue: {
                storeid: "代號",
                storeaddress: "店地址",
                storename: "店名"
            }
        },
        {
            name: "plutusCVSFamily",
            type: "object",
            defaultValue: {
                storeid: "代號",
                storeaddress: "店地址",
                storename: "店名"
            }
        },
        {
            name: "gotoCartieDirectly",
            type: "string"
            /** 判斷是否為空值，點擊'直接購買'後前往購物車 */
        },
        {
            name: "infoOfExpired",
            type: "object",
            defaultValue: {
                date: "1987-07-25 12:00",
                name: "David Tu"
            }
        }
    ],
    struct: {
        name: `dionysus`,
        view: `div`,
        type: `object`,
        wrapView: `div`,
        injectWrapStyle: true,
        children: [
            {
                name: `booze`,
                type: "array",
                path: `dionysus`,
                plural: "s",
                idxes: [
                    [
                        { name: "keywords", type: "arrayConfig", rule: "CONTAINS" },
                        { name: "visibility", type: "order", rule: "ASCENDING" },
                        { name: "updateTime", type: "order", rule: "DESCENDING" },
                        { name: "__name__", type: "order", rule: "DESCENDING" }
                    ],
                    [
                        { name: "visibility", type: "order", rule: "ASCENDING" },
                        { name: "updateTime", type: "order", rule: "DESCENDING" },
                        { name: "__name__", type: "order", rule: "DESCENDING" }
                    ],
                    [
                        { name: "category", type: "arrayConfig", rule: "CONTAINS" },
                        { name: "updateTime", type: "order", rule: "DESCENDING" },
                        { name: "__name__", type: "order", rule: "DESCENDING" }
                    ],
                    [
                        { name: "category", type: "arrayConfig", rule: "CONTAINS" },
                        { name: "visibility", type: "order", rule: "ASCENDING" },
                        { name: "updateTime", type: "order", rule: "DESCENDING" },
                        { name: "__name__", type: "order", rule: "DESCENDING" }
                    ]
                ],
                conditions: [`{type:'orderBy', params:['updateTime', 'desc']}`],
                column: true,
                view: "div",
                click: true,
                defaultValue: [],
                permission: {
                    delete: "isAuthorOfDionysus(booze) || isAdmin()",
                    update: "isAuthorOfDionysus(booze) || isAdmin()",
                    create: "isAuthor() || isAdmin()",
                    read: "alwaysTrue()"
                },
                paginate: {
                    threshold: 10,
                    size: 16
                },
                children: [
                    {
                        name: "checked",
                        type: "boolean",
                        view: "Checkbox",
                        defaultValue: false,
                        injectStyle: true
                    },
                    {
                        name: "selectedTypeOfProp",
                        type: "number",
                        description: "商品屬性=> 1.物品 2.課程",
                        column: true,
                        defaultValue: 1
                    },
                    {
                        name: "keywords",
                        type: "arrayOfField",
                        column: true,
                        description: "用來讓firestore可以做arrays-contain"
                    },
                    {
                        name: "buildBySelf",
                        type: "boolean",
                        column: true,
                        defaultValue: false,
                        description: "是否為自己建立的商品(不是從腳本批次輸入)"
                    },
                    {
                        name: "idOfAuthor",
                        type: "string",
                        column: true,
                        description: "商品的擁有者"
                    },
                    {
                        name: "photoOfDemo",
                        description: "圖片",
                        view: "img",
                        imgPreview: false,
                        type: "string",
                        column: true
                    },
                    {
                        name: "rangeOfPrice",
                        type: "string",
                        defaultValue: `$0`,
                        description: `可能是區間值100 - 200元`,
                        column: true
                    },
                    {
                        name: "statement",
                        type: "string",
                        description: `商品介紹裡的陳述`,
                        column: true,
                        ignoreI: true
                    },
                    {
                        name: "initCompleted",
                        type: "boolean",
                        defaultValue: false,
                        description: `當用下一步確認後{initCompleted => true}，「商品屬性」就要被鎖住，不能再更動`,
                        column: true
                    },
                    {
                        name: "photo",
                        cheap: true,
                        plural: "s",
                        type: "array",
                        ignoreI: true,
                        column: true,
                        description: `商品介紹裡的照片們`,
                        children: [
                            {
                                name: "href",
                                view: "img",
                                type: "string",
                                column: true,
                                storageFolder: "dionysus/:id/images",
                                fileMaximum: "2MB",
                                permission: {
                                    read: "alwaysTrue()",
                                    write: "isAuthorOfDionysus(id)",
                                    delete: "isAuthorOfDionysus(id)"
                                }
                            }
                        ]
                    },
                    {
                        name: "ban",
                        cheap: true,
                        plural: "s",
                        type: "array",
                        ignoreI: true,
                        column: true,
                        description: `商品介紹裡的橫幅照片`,
                        children: [
                            {
                                name: "href",
                                view: "img",
                                type: "string",
                                column: true,
                                storageFolder: "dionysus/:id/images",
                                fileMaximum: "2MB",
                                permission: {
                                    read: "alwaysTrue()",
                                    write: "isAuthorOfDionysus(id)",
                                    delete: "isAuthorOfDionysus(id)"
                                }
                            }
                        ]
                    },
                    {
                        name: "specificAttributes",
                        type: "arrayOfField",
                        column: true,
                        ignoreI: true,
                        description: "對照variant內的number定義商品有哪些變體屬性，每項包含 key (英文字串)、label (顯示用名稱)、options (選項列表)。",
                        example: [
                            {
                                key: "default",
                                label: "預設(不顯示)",
                                options: [
                                    { value: 0, label: "A款" },
                                    { value: 1, label: "B款" },
                                    { value: 2, label: "C款" }
                                ]
                            },
                            {
                                key: "color",
                                label: "顏色",
                                options: [
                                    { value: 0, label: "紅" },
                                    { value: 1, label: "白" },
                                    { value: 2, label: "黑" }
                                ]
                            },
                            {
                                key: "size",
                                label: "尺寸",
                                options: [
                                    { value: 0, label: "S" },
                                    { value: 1, label: "M" },
                                    { value: 2, label: "L" }
                                ]
                            },
                            {
                                key: "model",
                                label: "型號",
                                options: [
                                    { value: 0, label: "電鑽" },
                                    { value: 1, label: "泗溝垂鑽" },
                                    { value: 2, label: "衝擊起子" }
                                ]
                            },
                            {
                                key: "brand",
                                label: "廠牌",
                                options: [
                                    { value: 0, label: "Dewalt" },
                                    { value: 1, label: "Bosch" },
                                    { value: 2, label: "Milwaukee" },
                                    { value: 3, label: "Makita" }
                                ]
                            }
                        ]
                    },
                    {
                        name: "visibility",
                        type: "boolean",
                        defaultValue: false,
                        column: true,
                        description: `用來辨別是否上架商品，寫在firestore rules`
                    },
                    {
                        name: "isHomeTeaching",
                        type: "boolean",
                        defaultValue: false,
                        column: true,
                        description: `課程類商品的選項，如果到府授課，結帳時要提供地址`
                    },
                    {
                        name: "allowSelfPickUp",
                        type: "boolean",
                        defaultValue: false,
                        column: true,
                        description: `物品類商品的選項，可以自取的話，結帳要多一個自取選項`
                    },
                    {
                        name: "isTaskJob",
                        type: "boolean",
                        column: true,
                        defaultValue: false,
                        description: "是否為課程(task)類型的商品variant"
                    },
                    {
                        name: "useMainTrunk",
                        type: "boolean",
                        column: true,
                        defaultValue: true,
                        description: "課程(task)是否使用共同時間軸(main trunk)"
                    },
                    {
                        name: "category",
                        type: "arrayOfField",
                        defaultValue: [],
                        description: `用來作為Tab點擊後的依據[1,7]，有些商品會放在不同的Tab底下，例如[出清商品|指甲油]，這個欄位可以做compound(array-contains)`,
                        column: true,
                        example: [1, 2, 7]
                    },
                    {
                        name: `name`,
                        view: `Typography`,
                        column: true,
                        type: "string",
                        description: `商品名稱`,
                        wrapView: "div"
                    },
                    {
                        name: `serial`,
                        type: `string`,
                        column: true,
                        description: "商品序號->廠商既有的編號方式"
                    },
                    {
                        name: "variant",
                        type: "array",
                        permission: {
                            update: "isAdmin() || isAuthorOfDionysus(pid)",
                            create: "isAdmin() || isAuthorOfDionysus(pid)",
                            delete: "isAdmin() || isAuthorOfDionysus(pid)",
                            read: "alwaysTrue()"
                        },
                        path: "/dionysus/:pid/variants",
                        plural: "s",
                        hasFatherHood: true,
                        description: `商品裡基於specificAttributes去組則出來的購買方案例如:紅色 Ｓ號 => color_0_size_0 = document id`,
                        children: [
                            {
                                name: "id",
                                type: "string",
                                column: true,
                                description: "document id:組合字串=>${mainValue:hash}-${subValue:hash}"
                            },
                            {
                                name: "quantity",
                                type: "number",
                                column: true,
                                defaultValue: 0,
                                description: "此特定組合的剩餘庫存數量。"
                            },
                            {
                                name: "price",
                                type: "number",
                                column: true,
                                defaultValue: 100,
                                description: "此特定組合的價格（可選），若未設定則沿用商品基本價格。"
                            },
                            {
                                name: `priceB4Discount`,
                                type: "number",
                                column: true,
                                defaultValue: 120,
                                description: `折扣前價格`
                            },
                            {
                                name: `content`,
                                type: "string",
                                column: true,
                                ignoreI: true,
                                description: `商品的表述句=>顏色：紅 尺寸：S'`
                            },
                            {
                                name: "photo",
                                type: "string",
                                column: true,
                                defaultValue: "",
                                description: "選中組合的圖片"
                            },
                            {
                                name: "idOfBooze",
                                type: "string",
                                column: true,
                                description: "用來找出這個variant屬於哪個booze"
                            },
                            {
                                name: "nameOfBooze",
                                type: "string",
                                column: true,
                                description: "為了減少query，所以就寫到這上面"
                            },
                            {
                                name: "idOfAuthor",
                                type: "string",
                                column: true,
                                description: "用來找出這個variant屬於哪位作者的"
                            },
                            {
                                name: "isTaskJob",
                                type: "boolean",
                                column: true,
                                defaultValue: false,
                                description: "是否為課程(task)類型的商品variant"
                            },
                            {
                                name: "useMainTrunk",
                                type: "boolean",
                                column: true,
                                defaultValue: false,
                                description: "課程(task)是否使用共同時間軸(main trunk)"
                            },
                            {
                                name: "isHomeTeaching",
                                type: "boolean",
                                defaultValue: false,
                                column: true,
                                description: `課程類商品的選項，如果到府授課，結帳時要提供地址`
                            },
                            {
                                name: "allowSelfPickUp",
                                type: "boolean",
                                defaultValue: false,
                                column: true,
                                description: `物品類商品的選項，可以自取的話，結帳要多一個自取選項`
                            },
                            {
                                name: "visibility",
                                type: "boolean",
                                defaultValue: false,
                                column: true,
                                description: `用來辨別是否上架商品，寫在firestore rules`
                            }
                        ]
                    },
                    {
                        name: `row`,
                        view: `div`,
                        needParam: true,
                        children: [
                            {
                                name: "main",
                                view: "div",
                                needParam: true,
                                children: [
                                    {
                                        name: `dollars`,
                                        view: `Typography`,
                                        type: "string",
                                        defaultValue: "＄",
                                        incest: { view: false, attribute: true }
                                    },
                                    {
                                        name: `price`,
                                        view: `Typography`,
                                        column: true,
                                        type: "number",
                                        defaultValue: 0,
                                        incest: { view: false, attribute: true }
                                    },
                                    {
                                        name: `priceB4Discount`,
                                        view: `Typography`,
                                        column: true,
                                        type: "number",
                                        injectStyle: true,
                                        defaultValue: 0,
                                        description: `刪除線+最高價`,
                                        incest: { view: false, attribute: true }
                                    }
                                ]
                            },
                            {
                                name: "tail",
                                view: "div",
                                needParam: true,
                                children: [
                                    {
                                        name: "cart",
                                        view: "IconButton",
                                        needParam: true,
                                        icon: "ShoppingCartTwoTone",
                                        alertDialog: {
                                            customView: "maenads",
                                            needActionButtons: false
                                        }
                                    }
                                ]
                            }
                        ]
                    }
                ]
            },
            {
                name: "selectBound",
                type: "array",
                injectListStyle: true,
                valueOfTabDefault: 0,
                plural: "s",
                path: "tabsOfBooze",
                scrollable: true,
                cheap: true,
                listView: "Tabs",
                view: "Tab",
                permission: {
                    read: "alwaysTrue()",
                    create: "isAuthor() || isAdmin()",
                    update: "isAuthor() || isAdmin()"
                },
                disableObservable: true,
                example: [
                    {
                        label: `所有商品`,
                        value: 0,
                        type: `all`
                    },
                    {
                        label: `SACHIA品牌`,
                        value: 1,
                        type: ``
                    },
                    {
                        label: `最新商品`,
                        value: 2,
                        type: ``
                    },
                    {
                        label: `出清專區`,
                        value: 3,
                        type: ``
                    },
                    {
                        label: `穿戴甲專區`,
                        value: 4,
                        type: ``
                    },
                    {
                        label: `甲油膠、保養`,
                        value: 5,
                        type: ``
                    },
                    {
                        label: `美甲機器`,
                        value: 6,
                        type: ``
                    },
                    {
                        label: `美甲工具`,
                        value: 7,
                        type: ``
                    },
                    {
                        label: `美甲造型`,
                        value: 8,
                        type: ``
                    }
                ]
            },
            {
                name: "hera",
                plural: "s",
                type: "array",
                disableInitFetch: true,
                description:
                    "紀錄當天有多少工作，timestamp是使用(2025/09/01 00:00 01秒-> ts)，避免之後發生跨國狀況｜主要是作為 行事曆和課程衝突的判斷依據(不同商品但是共用同一個時間軸)",
                path: "/users/:uid/hera",
                permission: {
                    read: "alwaysTrue()",
                    write: "isSelf(uid)",
                    delete: "isSelf(uid)",
                    update: "iSelf(uid)"
                },
                idxes: [
                    [
                        { name: "useMainTrunk", type: "order", rule: "ASCENDING" },
                        { name: "startYYYYMMDDHHmmss", type: "order", rule: "ASCENDING" },
                        { name: "__name__", type: "order", rule: "ASCENDING" }
                    ]
                ],
                children: [
                    {
                        name: "inject",
                        type: "boolean",
                        defaultValue: false,
                        column: true
                    },
                    {
                        name: "idOfBooze",
                        type: "string",
                        column: true
                    },
                    {
                        name: "startYYYYMMDDHHmmss",
                        column: true,
                        type: "number",
                        description: `課程開始時間，compound會用到`
                    },
                    {
                        name: "endYYYYMMDDHHmmss",
                        column: true,
                        type: "number",
                        description: `課程結束時間，compound會用到`
                    },
                    {
                        name: "idOfVariant",
                        type: "string",
                        column: true
                    },
                    {
                        name: "name",
                        type: "string",
                        column: true,
                        description: "nameOfBooze-commentOfVariant，減少還要再拉idOfVariant的情況"
                    },
                    {
                        name: "period",
                        type: "string",
                        description: "YYYYMMDDHHSS(start)-YYYYMMDDHHSS(end)",
                        column: true
                    },
                    {
                        name: "useMainTrunk",
                        type: "boolean",
                        defaultValue: false,
                        column: true,
                        description: "hera會用在行事曆上，用來區分課程區要受制於mainTrunk，有些不用"
                    },
                    {
                        name: "idOfOrder",
                        type: "string",
                        column: true,
                        description: "訂單編號"
                    }
                ]
            },
            {
                name: "batch",
                view: "div",
                wrapView: "div",
                type: "object",
                injectWrapStyle: true,
                needParam: true,
                children: [
                    {
                        name: "mv2Head",
                        defaultValue: "置頂",
                        view: "Chip",
                        type: "string",
                        size: "small"
                    },
                    {
                        name: "crtBooze",
                        defaultValue: "新增商品",
                        view: "Chip",
                        type: "string",
                        color: "primary",
                        size: "small"
                    },
                    {
                        name: "adjustCat",
                        defaultValue: "調整分類",
                        view: "Chip",
                        type: "string",
                        size: "small",
                        alertDialog: {
                            customView: "textsIndexSetter",
                            needActionButtons: false,
                            useCustomCancel: true
                        }
                    },
                    {
                        name: "down",
                        defaultValue: "下架",
                        view: "Chip",
                        type: "string",
                        size: "small",
                        needParam: true,
                        alertDialog: {
                            title: "商品下架",
                            content: "是否確認將勾選的商品下架？"
                        }
                    },
                    {
                        name: "dismiss",
                        defaultValue: "結束編輯",
                        view: "Chip",
                        type: "string",
                        size: "small",
                        color: "error"
                    }
                ]
            }
        ]
    },
    componentsOfExtra: [
        {
            name: "hestia",
            path: "/hestia",
            disposablePage: true,
            title: "未上架商品",
            struct: {
                name: `dionysusHestia`,
                view: `div`,
                wrapView: "div",
                type: `object`,
                children: [
                    {
                        ref: "dionysus",
                        imitate: true,
                        implementActions: true
                    }
                ]
            }
        },
        {
            name: `bacchus`,
            path: `/bacchus`,
            disposablePage: true,
            title: "商品詳細規格頁面",
            detailPage: true,
            struct: {
                name: `dionysusBacchus`,
                view: `div`,
                wrapView: `div`,
                type: `object`,
                children: [
                    {
                        presetParam: true,
                        name: "booze",
                        type: "objectOfEmpty",
                        column: true
                    },
                    {
                        presetParam: true,
                        name: "erosPublic",
                        type: "objectOfEmpty",
                        column: true,
                        description: "用來提供賣家的付費資訊"
                    },
                    {
                        name: "banner",
                        type: "array",
                        plural: "s",
                        cheap: true,
                        view: "SimpleSwiper",
                        autoplay: {
                            delay: 2000,
                            disableOnInteraction: false
                        }
                    },
                    {
                        name: "rangeOfPrice",
                        view: `Typography`,
                        column: true,
                        type: "string",
                        wrapView: "div"
                    },
                    {
                        name: "name",
                        view: `Typography`,
                        column: true,
                        type: "string",
                        wrapView: "div"
                    },
                    {
                        name: "detail",
                        view: "div",
                        needParam: true,
                        children: [
                            {
                                name: "pay",
                                view: "ArrowOption",
                                defaultTitle: `付款`,
                                injectStyle: true,
                                defaultContent: `支援付款方式`
                            },
                            {
                                name: "shipping",
                                view: "ArrowOption",
                                defaultTitle: `運費`,
                                injectStyle: true,
                                defaultContent: `滿額免運`
                            },
                            {
                                name: "content",
                                view: "div",
                                needParam: true,
                                children: [
                                    {
                                        name: "ban",
                                        cheap: true,
                                        injectListStyle: true,
                                        plural: "s",
                                        type: "array",
                                        view: "div",
                                        column: true,
                                        incest: { view: false, attribute: true },
                                        description: `橫幅放置的區域`,
                                        children: [
                                            {
                                                name: "href",
                                                view: "img",
                                                type: "string",
                                                column: true
                                            }
                                        ]
                                    },
                                    {
                                        name: "statement",
                                        view: "Typography",
                                        type: "string",
                                        injectWrapStyle: true,
                                        wrapView: "div",
                                        description: `商品介紹裡的陳述`,
                                        column: true,
                                        incest: { view: false, attribute: true }
                                    },
                                    {
                                        name: "photo",
                                        cheap: true,
                                        plural: "s",
                                        type: "array",
                                        view: "div",
                                        column: true,
                                        incest: { view: false, attribute: true },
                                        description: `商品介紹裡的照片們`,
                                        children: [
                                            {
                                                name: "href",
                                                view: "img",
                                                type: "string",
                                                column: true
                                            }
                                        ]
                                    }
                                ]
                            }
                        ]
                    },
                    {
                        name: "func",
                        view: `div`,
                        wrapView: `div`,
                        needParam: true,
                        children: [
                            {
                                name: "backToHome",
                                type: "string",
                                view: `Chip`,
                                incest: { view: false, attribute: true },
                                defaultValue: "返回"
                            },
                            {
                                name: "joinToCart",
                                type: "string",
                                view: `Chip`,
                                color: `error`,
                                variant: "outlined",
                                incest: { view: false, attribute: true },
                                defaultValue: "加入購物車",
                                alertDialog: {
                                    customView: "maenads",
                                    needActionButtons: false
                                }
                            },
                            {
                                name: "bought",
                                type: "string",
                                view: `Chip`,
                                color: "error",
                                incest: { view: false, attribute: true },
                                defaultValue: "直接購買",
                                alertDialog: {
                                    customView: "maenads",
                                    needActionButtons: false
                                }
                            },
                            {
                                name: "edit",
                                type: "string",
                                view: `Chip`,
                                injectStyle: true,
                                color: "success",
                                incest: { view: false, attribute: true },
                                defaultValue: "編輯"
                            }
                        ]
                    },
                    {
                        name: "pretend",
                        view: "div",
                        injectStyle: true,
                        alertDialog: {
                            customView: "paymentBrief",
                            needActionButtons: false,
                            fullWidth: true,
                            globalOfRef: true
                        }
                    }
                ]
            }
        },
        {
            name: `maenads`,
            disposablePage: true,
            title: `加入購物車`,
            description: `商品下單頁面`,
            struct: {
                name: `dionysusMaenads`,
                view: `Paper`,
                wrapView: "div",
                type: "object",
                children: [
                    {
                        name: "cartieAnimate",
                        type: "boolean",
                        defaultValue: false
                    },
                    {
                        name: "currentOptionExist",
                        type: "boolean",
                        defaultValue: false
                    },
                    {
                        presetParam: true,
                        name: "booze",
                        type: "objectOfEmpty",
                        column: true
                    },
                    {
                        name: "selectedVariant",
                        type: "objectOfEmpty",
                        column: true
                    },
                    {
                        name: "main",
                        view: "div",
                        needParam: true,
                        children: [
                            {
                                name: `photo`,
                                view: `img`,
                                type: `string`,
                                column: true,
                                incest: { view: false, attribute: true }
                            },
                            {
                                name: "info",
                                view: `div`,
                                needParam: true,
                                children: [
                                    {
                                        name: "row",
                                        view: `div`,
                                        needParam: true,
                                        children: [
                                            {
                                                name: `rangeOfPrice`,
                                                type: `string`,
                                                view: `Typography`,
                                                injectStyle: true,
                                                incest: { view: false, attribute: true }
                                            },
                                            {
                                                name: `price`,
                                                type: `number`,
                                                view: `Typography`,
                                                defaultValue: 0,
                                                injectWrapStyle: true,
                                                labelView: {
                                                    enable: true,
                                                    defaultValue: `＄`
                                                },
                                                incest: { view: false, attribute: true }
                                            },
                                            {
                                                name: `priceB4Discount`,
                                                type: "number",
                                                column: true,
                                                description: `折扣前價格`,
                                                incest: { view: false, attribute: true },
                                                defaultValue: 0
                                            }
                                        ]
                                    },
                                    {
                                        name: `count`,
                                        type: `number`,
                                        view: `Typography`,
                                        defaultValue: 0,
                                        labelView: {
                                            enable: true,
                                            defaultValue: `商品數量：`
                                        },
                                        incest: { view: false, attribute: true }
                                    }
                                ]
                            }
                        ]
                    },
                    {
                        name: `titleOfShape`,
                        view: `Typography`,
                        defaultValue: `尚未選擇`,
                        description: `款式名稱，組合之後出來的(黑-XL)`,
                        type: `string`
                    },
                    {
                        name: "variant",
                        type: "array",
                        plural: `s`,
                        view: `div`,
                        children: [
                            {
                                name: "key",
                                type: "string",
                                description: "選項的key值，用來組合出指定商品"
                            },
                            {
                                name: "option",
                                type: "array",
                                plural: "s",
                                view: "div",
                                click: true,
                                injectStyle: true,
                                children: [
                                    {
                                        name: "label",
                                        view: "Chip",
                                        type: "string",
                                        variant: "outlined",
                                        injectProps: true,
                                        column: true
                                    },
                                    {
                                        name: "value",
                                        type: "string",
                                        defaultValue: "",
                                        description: `選項的Hash Value`
                                    },
                                    {
                                        name: "select",
                                        type: "boolean",
                                        defaultValue: false,
                                        description: `是否被點擊，單一選項設計`
                                    },
                                    {
                                        name: "quantity",
                                        type: "number",
                                        defaultValue: 1,
                                        description: `用來判斷是否要disable的根據`
                                    }
                                ]
                            }
                        ]
                    },
                    {
                        name: `decision`,
                        view: `div`,
                        needParam: true,
                        children: [
                            {
                                name: "titleOfSubmitOrder",
                                type: "string",
                                defaultValue: `數量`,
                                wrapView: "div",
                                incest: { view: false, attribute: true },
                                view: `Typography`
                            },
                            {
                                name: `conclusionOfQuantity`,
                                view: `div`,
                                wrapView: `div`,
                                needParam: true,
                                children: [
                                    {
                                        name: "decrease",
                                        view: "IconButton",
                                        needParam: true,
                                        icon: "Remove"
                                    },
                                    {
                                        name: `countOfSubmit`,
                                        type: `number`,
                                        column: true,
                                        view: "TextField",
                                        defaultValue: 1,
                                        variant: "outlined",
                                        size: "small",
                                        trim: true,
                                        props: {
                                            sx: {
                                                input: { textAlign: "center" },
                                                "& .MuiInputBase-input.Mui-disabled": {
                                                    WebkitTextFillColor: "black"
                                                }
                                            },
                                            inputProps: { style: { padding: 3 } }
                                        },
                                        singleLine: true,
                                        incest: { view: false, attribute: true }
                                    },
                                    {
                                        name: "increase",
                                        view: "IconButton",
                                        needParam: true,
                                        icon: "Add"
                                    }
                                ]
                            }
                        ]
                    },
                    {
                        name: "submit",
                        view: "Chip",
                        type: `string`,
                        wrapView: `div`,
                        color: "error",
                        injectProps: true,
                        injectWrapView: true,
                        defaultValue: `加入購物車`
                    }
                ]
            }
        },
        {
            name: `cartie`,
            disposablePage: true,
            path: `/cartie`,
            title: `結帳：購物車`,
            description: `購物車結帳`,
            struct: {
                name: `dionysusCartie`,
                view: "div",
                wrapView: "div",
                type: "object",
                children: [
                    {
                        name: `main`,
                        view: `div`,
                        needParam: true,
                        children: [
                            {
                                name: "brief",
                                type: "array",
                                view: "div",
                                plural: "s",
                                injectStyle: true,
                                incest: { view: false, attribute: true },
                                children: [
                                    {
                                        name: "idOfBooze",
                                        type: "string",
                                        defaultValue: `booze的id，variant物件必須帶上這個id`
                                    },
                                    {
                                        name: "idOfVariant",
                                        type: "string",
                                        defaultValue: `variant的唯一碼`
                                    },
                                    {
                                        name: "isHomeTeaching",
                                        type: "boolean",
                                        defaultValue: false,
                                        description: `課程類商品的選項，如果到府授課，結帳時要提供地址`
                                    },
                                    {
                                        name: "isTaskJob",
                                        type: "boolean",
                                        defaultValue: false,
                                        description: "是否為課程(task)類型的商品variant"
                                    },
                                    {
                                        name: "sure",
                                        description: `勾選購買`,
                                        type: "boolean",
                                        view: "Checkbox",
                                        wrapView: "div",
                                        injectProps: true,
                                        defaultValue: true
                                    },
                                    {
                                        name: "visibility",
                                        type: "boolean",
                                        defaultValue: false,
                                        description: "是否上架"
                                    },
                                    {
                                        name: "idOfCookieUsage",
                                        type: "string",
                                        description: `用來刪除cookie裡面的key，參考BaseUserInfo->deleteItemFromCart`,
                                        defaultValue: "idOfBooze|idOfOption|idOfChoice"
                                    },
                                    {
                                        name: "idOfAuthor",
                                        type: "string",
                                        description: "用來確認商品的賣家，目前只支援同一賣家",
                                        defaultValue: ""
                                    },
                                    {
                                        name: "photo",
                                        view: "img",
                                        defaultValue: "https://placehold.co/300x300/eeeeee/999999?text=載入中",
                                        type: "string"
                                    },
                                    {
                                        name: "spec",
                                        view: "div",
                                        needParam: true,
                                        children: [
                                            {
                                                name: "full",
                                                view: "div",
                                                needParam: true,
                                                children: [
                                                    {
                                                        name: "name",
                                                        view: "Typography",
                                                        type: "string",
                                                        wrapView: "div",
                                                        props: {
                                                            sx: {
                                                                display: "-webkit-box", // 必須配合 line-clamp 一起使用
                                                                WebkitBoxOrient: "vertical", // 指定文本方向
                                                                overflow: "hidden", // 超出部分隱藏
                                                                textOverflow: "ellipsis", // 添加省略號
                                                                WebkitLineClamp: 2 // 限制最多兩行
                                                            }
                                                        },
                                                        defaultValue: "Oooops",
                                                        description: `夢想家爆閃貓眼膠12色`,
                                                        singleLine: true,
                                                        incest: { view: false, attribute: true }
                                                    },
                                                    {
                                                        name: "cancel",
                                                        view: "IconButton",
                                                        needParam: true,
                                                        type: "string",
                                                        icon: "DeleteForeverRounded",
                                                        incest: { view: false, attribute: true }
                                                        // alertDialog: {
                                                        //     title: '移出商品',
                                                        //     content: '是否已將此商品移除購物車?',
                                                        // }
                                                    }
                                                ]
                                            },
                                            {
                                                name: "nameOfVariant",
                                                view: "Chip",
                                                type: "string",
                                                defaultValue: `ＯＯＯＰs`,
                                                description: `商品底下的選項名稱(大衣-> 綠色)`,
                                                // iconOfDeleted: `UnfoldMoreRounded`,
                                                incest: { view: false, attribute: true }
                                            },
                                            {
                                                name: "infoOfBenefit",
                                                view: "Typography",
                                                type: "string",
                                                description: `商品和購優惠`,
                                                incest: { view: false, attribute: true }
                                            },
                                            {
                                                name: "land",
                                                view: "div",
                                                needParam: true,
                                                children: [
                                                    {
                                                        name: "main",
                                                        view: "div",
                                                        needParam: true,
                                                        children: [
                                                            {
                                                                name: "price",
                                                                view: "Typography",
                                                                type: "number",
                                                                defaultValue: 0,
                                                                description: `販售價格`,
                                                                labelView: {
                                                                    enable: true,
                                                                    defaultValue: `＄`
                                                                },
                                                                incest: { view: false, attribute: true }
                                                            }
                                                        ]
                                                    },
                                                    {
                                                        ref: `conclusionOfQuantity`,
                                                        independence: true
                                                    }
                                                ]
                                            },
                                            {
                                                name: "tip",
                                                view: "div",
                                                needParam: true,
                                                children: [
                                                    {
                                                        name: "priceB4Discount",
                                                        view: "Typography",
                                                        type: "number",
                                                        defaultValue: 0,
                                                        description: `價格加上刪除線那種`,
                                                        wrapView: "div",
                                                        incest: { view: false, attribute: true }
                                                    },
                                                    {
                                                        name: `quantity`,
                                                        incest: { view: false, attribute: true },
                                                        type: "number",
                                                        description: "商品剩餘的數量",
                                                        view: "Typography",
                                                        defaultValue: 0,
                                                        labelView: {
                                                            enable: true,
                                                            defaultValue: `剩餘數量：`
                                                        }
                                                    }
                                                ]
                                            }
                                        ]
                                    }
                                ]
                            },
                            {
                                name: `summarise`,
                                view: `div`,
                                needParam: true,
                                children: [
                                    {
                                        name: "priceWithoutDiscount",
                                        type: "number",
                                        view: "Typography",
                                        computed: true,
                                        defaultValue: 12321200,
                                        price: true,
                                        incest: { view: false, attribute: true },
                                        labelView: {
                                            enable: true,
                                            defaultValue: `商品金額：＄`
                                        }
                                    },
                                    {
                                        name: "priceOfDiscount",
                                        type: "number",
                                        view: "Typography",
                                        defaultValue: 0,
                                        price: true,
                                        injectWrapStyle: true,
                                        incest: { view: false, attribute: true },
                                        labelView: {
                                            enable: true,
                                            defaultValue: `優惠折扣：＄`
                                        }
                                    },
                                    {
                                        name: "priceOfTransport",
                                        type: "number",
                                        view: "Typography",
                                        defaultValue: `未選擇`,
                                        incest: { view: false, attribute: true },
                                        labelView: {
                                            enable: true,
                                            defaultValue: `運送費用：＄`
                                        }
                                    },
                                    {
                                        name: "discountOfMember",
                                        type: "number",
                                        view: "Typography",
                                        defaultValue: 1200,
                                        price: true,
                                        computed: true,
                                        incest: { view: false, attribute: true },
                                        labelView: {
                                            enable: true,
                                            defaultValue: `優惠禮金：＄`
                                        }
                                    }
                                ]
                            }
                        ]
                    },
                    {
                        name: "funcOfCheckout",
                        view: "div",
                        wrapView: "div",
                        needParam: true,
                        children: [
                            {
                                name: "whole",
                                view: "Checkbox",
                                type: "boolean",
                                label: `全選`,
                                injectWrapStyle: true,
                                defaultValue: true,
                                incest: { view: false, attribute: true }
                            },
                            {
                                name: `priceB4Transport`,
                                type: `number`,
                                description: `放cookie裡面的priceOfTotal，還沒加上運費的欄位`,
                                incest: { view: false, attribute: true }
                            },
                            {
                                name: "priceOfTotal",
                                type: "number",
                                defaultValue: 58200010,
                                incest: { view: false, attribute: true },
                                view: "Typography",
                                computed: true,
                                price: true,
                                labelView: {
                                    enable: true,
                                    defaultValue: `台幣$`
                                }
                            },
                            {
                                name: "submit",
                                view: "Chip",
                                type: "string",
                                color: "error",
                                wrapView: "div",
                                incest: { view: false, attribute: true },
                                defaultValue: "結帳"
                            }
                        ]
                    }
                ]
            }
        },
        {
            name: `hermes`,
            disposablePage: true,
            path: `/hermes`,
            title: `結帳：選擇付款方式`,
            description: `結帳方式選擇`,
            struct: {
                name: `dionysusHermes`,
                view: "div",
                wrapView: "div",
                type: "object",
                children: [
                    {
                        name: "itemsOfChecked",
                        type: "arrayOfField",
                        description: `在購物車被選中的項目`
                    },
                    {
                        name: "hasPhysical",
                        type: "boolean",
                        description: `購物車裡有實體物件（需要寄送或自取）`
                    },
                    {
                        name: "transaction",
                        plural: "s",
                        type: "array",
                        view: "div",
                        column: true,
                        injectStyle: true,
                        defaultValue: [
                            {
                                id: "111",
                                typeOfTransaction: 1,
                                freeOfThreshold: 999,
                                name: `LINE支付`,
                                price: 60,
                                _description: `滿 999 元免運`
                            },
                            {
                                id: "333",
                                typeOfTransaction: 3,
                                freeOfThreshold: 1200,
                                price: 60,
                                name: `信用卡（綠界支付）`,
                                _description: `滿 1200 元免運`
                            },
                            {
                                id: "444",
                                typeOfTransaction: 4,
                                freeOfThreshold: 1200,
                                price: 120,
                                name: `貨到付款`,
                                _description: `滿 1200 元免運`
                            },
                            {
                                id: "999",
                                typeOfTransaction: 9,
                                freeOfThreshold: 1,
                                price: 0,
                                name: `現金支付（轉帳）`,
                                _description: `會員日全館9折優惠`
                            }
                        ],
                        children: [
                            {
                                name: "typeOfTransaction",
                                type: "number",
                                defaultValue: 0,
                                column: true,
                                description: `付款方式選擇`
                            },
                            {
                                name: `freeOfThreshold`,
                                type: "number",
                                description: `免運金額`,
                                column: true,
                                defaultValue: 1000
                            },
                            {
                                name: `choice`,
                                view: "Checkbox",
                                type: "boolean",
                                wrapView: "div",
                                defaultValue: false
                            },
                            {
                                name: "available",
                                type: "boolean",
                                defaultValue: false,
                                column: true,
                                description: `提供此付款方案`
                            },
                            {
                                name: `main`,
                                view: `div`,
                                needParam: true,
                                children: [
                                    {
                                        name: `top`,
                                        view: `div`,
                                        needParam: true,
                                        children: [
                                            {
                                                name: `name`,
                                                view: `Typography`,
                                                column: true,
                                                type: "string",
                                                defaultValue: `line Pay`,
                                                incest: { view: false, attribute: true }
                                            },
                                            {
                                                name: `photo`,
                                                view: `img`,
                                                column: true,
                                                type: "string",
                                                description: `付款標示的圖案`,
                                                defaultValue: ``,
                                                incest: { view: false, attribute: true }
                                            }
                                        ]
                                    },
                                    {
                                        name: `description`,
                                        view: `Typography`,
                                        column: true,
                                        type: "string",
                                        injectStyle: true,
                                        defaultValue: `滿 1200 元免運`,
                                        incest: { view: false, attribute: true }
                                    }
                                ]
                            },
                            {
                                name: `price`,
                                type: `number`,
                                column: true,
                                view: "Typography",
                                price: true,
                                defaultValue: 0,
                                injectWrapStyle: true,
                                labelView: {
                                    enable: true,
                                    defaultValue: `＄`
                                }
                            }
                        ]
                    },
                    {
                        name: "separator",
                        view: "div",
                        injectStyle: true
                    },
                    {
                        name: "transport",
                        plural: "s",
                        type: "array",
                        view: "div",
                        column: true,
                        injectListStyle: true,
                        injectStyle: true,
                        defaultValue: [
                            {
                                id: "333",
                                typeOfTransport: 3,
                                price: 0,
                                freeOfThreshold: 0,
                                name: `自行取貨`,
                                _description: `付款後保留商品`
                            },
                            {
                                id: "444",
                                typeOfTransport: 4,
                                freeOfThreshold: 999,
                                price: 60,
                                name: `7-11（店取）`,
                                _description: `滿 999 元免運`
                            },
                            // {
                            //     id: "555",
                            //     typeOfTransport: 5,
                            //     freeOfThreshold: 1200,
                            //     price: 60,
                            //     name: `全家（超取）`,
                            //     _description: `滿 999 元免運`
                            // },
                            {
                                id: "777",
                                typeOfTransport: 7,
                                price: 200,
                                freeOfThreshold: 1599,
                                name: `當日到（14:00前下單）`,
                                _description: `滿 1599 元免運`
                            },
                            {
                                id: "888",
                                typeOfTransport: 8,
                                price: 200,
                                freeOfThreshold: 2000,
                                name: `宅配到府`,
                                _description: `滿 2000 元免運、高雄市隔日到`
                            }
                        ],
                        children: [
                            {
                                name: "typeOfTransport",
                                type: "number",
                                defaultValue: 0,
                                column: true,
                                description: `運送及付款方式選擇`
                            },
                            {
                                name: `freeOfThreshold`,
                                type: "number",
                                description: `免運金額`,
                                column: true,
                                defaultValue: 1000
                            },
                            {
                                name: `choice`,
                                view: "Checkbox",
                                type: "boolean",
                                wrapView: "div",
                                defaultValue: false
                            },
                            {
                                name: "available",
                                type: "boolean",
                                defaultValue: false,
                                column: true,
                                description: `提供此項運送服務`
                            },
                            {
                                name: `main`,
                                view: `div`,
                                needParam: true,
                                children: [
                                    {
                                        name: `top`,
                                        view: `div`,
                                        needParam: true,
                                        children: [
                                            {
                                                name: `name`,
                                                view: `Typography`,
                                                column: true,
                                                type: "string",
                                                defaultValue: `line Pay`,
                                                incest: { view: false, attribute: true }
                                            },
                                            {
                                                name: `photo`,
                                                view: `img`,
                                                column: true,
                                                type: "string",
                                                description: `付款標示的圖案`,
                                                defaultValue: ``,
                                                incest: { view: false, attribute: true }
                                            }
                                        ]
                                    },
                                    {
                                        name: `description`,
                                        view: `Typography`,
                                        column: true,
                                        type: "string",
                                        injectStyle: true,
                                        defaultValue: `滿 1200 元免運`,
                                        incest: { view: false, attribute: true }
                                    }
                                ]
                            },
                            {
                                name: `price`,
                                type: `number`,
                                column: true,
                                view: "Typography",
                                price: true,
                                defaultValue: 0,
                                injectWrapStyle: true,
                                labelView: {
                                    enable: true,
                                    defaultValue: `＄`
                                }
                            }
                        ]
                    },
                    {
                        name: "divider",
                        view: "div",
                        injectStyle: true
                    },
                    {
                        name: "demandOfTransportBehavior",
                        type: "boolean",
                        defaultValue: false
                    },
                    {
                        ref: "funcOfCheckout",
                        independence: true
                    }
                ]
            }
        },
        {
            name: `plutus`,
            disposablePage: true,
            path: `/plutus`,
            title: `結帳：貨運資訊與備註`,
            description: `結帳方式選擇`,
            struct: {
                name: `dionysusPlutus`,
                view: "div",
                wrapView: "div",
                type: "object",
                children: [
                    {
                        name: "itemsOfChecked",
                        type: "arrayOfField",
                        description: `在購物車被選中的項目`
                    },
                    {
                        name: "hasPhysical",
                        type: "boolean",
                        description: `購物車裡有實體物件（需要寄送或自取）`
                    },
                    {
                        ref: "brief",
                        independence: true
                    },
                    {
                        name: "main",
                        view: "div",
                        needParam: true,
                        children: [
                            {
                                name: "location",
                                view: "div",
                                needParam: true,
                                injectStyle: true,
                                children: [
                                    {
                                        name: "headLabelOfAddress",
                                        type: "string",
                                        variant: "outlined",
                                        size: `small`,
                                        view: "Typography",
                                        defaultValue: "地址：",
                                        incest: { view: false, attribute: true },
                                        column: true
                                    },
                                    {
                                        name: "col",
                                        view: "div",
                                        needParam: true,
                                        children: [
                                            {
                                                name: "taken",
                                                view: "div",
                                                injectStyle: true,
                                                needParam: true,
                                                children: [
                                                    {
                                                        name: "whetherPickupByMySelf",
                                                        type: "boolean",
                                                        incest: { view: false, attribute: true },
                                                        view: "Checkbox",
                                                        label: "自行取貨",
                                                        defaultValue: false
                                                    }
                                                ]
                                            },
                                            {
                                                name: "main",
                                                view: "div",
                                                injectStyle: true,
                                                needParam: true,
                                                children: [
                                                    {
                                                        name: "head",
                                                        view: "div",
                                                        needParam: true,
                                                        children: [
                                                            {
                                                                name: "city",
                                                                label: "城市",
                                                                column: true,
                                                                size: `small`,
                                                                incest: { view: false, attribute: true },
                                                                select: {
                                                                    type: "spinner",
                                                                    defaultValue: 6,
                                                                    values: [
                                                                        { value: 1, label: "台北市" },
                                                                        { value: 2, label: "新北市" },
                                                                        { value: 3, label: "桃園市" },
                                                                        { value: 4, label: "台中市" },
                                                                        { value: 5, label: "台南市" },
                                                                        { value: 6, label: "高雄市" },
                                                                        { value: 7, label: "基隆市" },
                                                                        { value: 8, label: "新竹市" },
                                                                        { value: 9, label: "嘉義市" },
                                                                        { value: 10, label: "新竹縣" },
                                                                        { value: 11, label: "苗栗縣" },
                                                                        { value: 12, label: "彰化縣" },
                                                                        { value: 13, label: "南投縣" },
                                                                        { value: 14, label: "雲林縣" },
                                                                        { value: 15, label: "嘉義縣" },
                                                                        { value: 16, label: "屏東縣" },
                                                                        { value: 17, label: "宜蘭縣" },
                                                                        { value: 18, label: "花蓮縣" },
                                                                        { value: 19, label: "台東縣" }
                                                                    ]
                                                                }
                                                            },
                                                            {
                                                                name: "district",
                                                                label: "地區",
                                                                column: true,
                                                                size: `small`,
                                                                incest: { view: false, attribute: true },
                                                                select: {
                                                                    type: "spinner",
                                                                    defaultValue: -1,
                                                                    values: []
                                                                }
                                                            }
                                                        ]
                                                    },
                                                    {
                                                        name: "tail",
                                                        view: "div",
                                                        needParam: true,
                                                        children: [
                                                            {
                                                                name: "address",
                                                                view: "TextField",
                                                                useCache: true,
                                                                props: { autoComplete: "street-address" },
                                                                column: true,
                                                                incest: { view: false, attribute: true },
                                                                variant: "outlined",
                                                                label: `路名、門牌號`,
                                                                type: "string",
                                                                size: "small"
                                                            },
                                                            {
                                                                name: "find",
                                                                view: "IconButton",
                                                                needParam: true,
                                                                icon: "WifiFind"
                                                            }
                                                        ]
                                                    }
                                                ]
                                            }
                                        ]
                                    }
                                ]
                            },
                            {
                                name: "cvs",
                                type: "string",
                                asCode: true,
                                variant: "outlined",
                                size: `small`,
                                defaultValue: 0,
                                label: `店名`,
                                useCache: true,
                                singleLine: true,
                                view: "TextField",
                                inputRegEx: "/[^0-9]/g",
                                helperText: `取貨店碼地址`,
                                injectWrapStyle: true,
                                incest: { view: false, attribute: true },
                                column: true,
                                labelView: {
                                    enable: true,
                                    defaultValue: `店碼：`
                                },
                                helperVisual: {
                                    enable: true,
                                    end: {
                                        type: "icon",
                                        click: true,
                                        content: "Search"
                                    }
                                    // start:{
                                    //     type:"text",
                                    //     content:'$'
                                    // }
                                }
                                // 目標網頁無法用iframe
                                // alertDialog: {
                                //     customView: "miniWeb",
                                //     needActionButtons: false,
                                //     fullWidth: true
                                // }
                            },
                            {
                                name: "name",
                                type: "string",
                                variant: "outlined",
                                size: `small`,
                                view: "TextField",
                                singleLine: true,
                                useCache: true,
                                typeOfTextField: "name",
                                incest: { view: false, attribute: true },
                                props: { id: "full-name", autoComplete: "name", name: "name" },
                                column: true,
                                labelView: {
                                    enable: true,
                                    defaultValue: `姓名：`
                                }
                            },
                            {
                                name: "email",
                                type: "string",
                                variant: "outlined",
                                size: `small`,
                                useCache: true,
                                typeOfTextField: "email",
                                injectWrapStyle: true,
                                view: "TextField",
                                singleLine: true,
                                incest: { view: false, attribute: true },
                                props: { autoComplete: "email", id: "email", name: "email", type: "email" },
                                column: true,
                                labelView: {
                                    enable: true,
                                    defaultValue: `信箱：`
                                }
                            },
                            {
                                name: "phone",
                                type: "string",
                                variant: "outlined",
                                size: `small`,
                                typeOfTextField: "tel",
                                props: { autoComplete: "tel", id: "phone-number", name: "phone", type: "tel" },
                                view: "TextField",
                                singleLine: true,
                                useCache: true,
                                incest: { view: false, attribute: true },
                                column: true,
                                labelView: {
                                    enable: true,
                                    defaultValue: `手機：`
                                }
                            },
                            {
                                name: "remark",
                                type: "string",
                                variant: "outlined",
                                size: `small`,
                                view: "TextField",
                                singleLine: true,
                                useCache: true,
                                incest: { view: false, attribute: true },
                                column: true,
                                labelView: {
                                    enable: true,
                                    defaultValue: `備註：`
                                }
                            },
                            {
                                name: "summarise",
                                view: "div",
                                needParam: true,
                                children: [
                                    {
                                        name: "first",
                                        view: "div",
                                        needParam: true,
                                        children: [
                                            {
                                                name: `headLabelOfPrice`,
                                                type: `string`,
                                                defaultValue: `商品金額：`,
                                                wrapView: "div",
                                                incest: { view: false, attribute: true },
                                                view: "Typography"
                                            },
                                            {
                                                name: `price`,
                                                type: `number`,
                                                defaultValue: 84200,
                                                wrapView: "div",
                                                price: true,
                                                column: true,
                                                view: "Typography",
                                                incest: { view: false, attribute: true },
                                                labelView: {
                                                    enable: true,
                                                    defaultValue: `＄`
                                                }
                                            }
                                        ]
                                    },
                                    {
                                        name: "second",
                                        view: "div",
                                        needParam: true,
                                        injectStyle: true,
                                        children: [
                                            {
                                                name: `headLabelOfDiscount`,
                                                type: `string`,
                                                defaultValue: `優惠禮金：`,
                                                wrapView: "div",
                                                incest: { view: false, attribute: true },
                                                view: "Typography"
                                            },
                                            {
                                                name: `discount`,
                                                type: `number`,
                                                defaultValue: 0,
                                                wrapView: "div",
                                                price: true,
                                                column: true,
                                                view: "Typography",
                                                incest: { view: false, attribute: true },
                                                labelView: {
                                                    enable: true,
                                                    defaultValue: `＄`
                                                }
                                            }
                                        ]
                                    },
                                    {
                                        name: "third",
                                        view: "div",
                                        needParam: true,
                                        children: [
                                            {
                                                name: `headLabelOfTransport`,
                                                type: `string`,
                                                defaultValue: `運送費用：`,
                                                wrapView: "div",
                                                view: "Typography",
                                                incest: { view: false, attribute: true }
                                            },
                                            {
                                                name: `feeOfTransport`,
                                                type: `number`,
                                                defaultValue: 1200,
                                                wrapView: "div",
                                                price: true,
                                                column: true,
                                                view: "Typography",
                                                incest: { view: false, attribute: true },
                                                labelView: {
                                                    enable: true,
                                                    defaultValue: `＄`
                                                }
                                            }
                                        ]
                                    },
                                    {
                                        name: "fourth",
                                        view: "div",
                                        injectStyle: true,
                                        needParam: true,
                                        description: `目前沒有用到這個欄位`,
                                        children: [
                                            {
                                                name: `headLabelOfMemberDiscount`,
                                                type: `string`,
                                                defaultValue: `帳戶抵扣：`,
                                                wrapView: "div",
                                                view: "Typography",
                                                incest: { view: false, attribute: true }
                                            },
                                            {
                                                name: `feeOfMemberDiscount`,
                                                type: `number`,
                                                defaultValue: 1200,
                                                wrapView: "div",
                                                price: true,
                                                column: true,
                                                view: "Typography",
                                                incest: { view: false, attribute: true },
                                                labelView: {
                                                    enable: true,
                                                    defaultValue: `＄`
                                                }
                                            }
                                        ]
                                    },
                                    {
                                        name: "fifth",
                                        view: "div",
                                        needParam: true,
                                        children: [
                                            {
                                                name: `headLabelOfPayment`,
                                                type: `string`,
                                                defaultValue: `應付費用：`,
                                                wrapView: "div",
                                                view: "Typography",
                                                incest: { view: false, attribute: true }
                                            },
                                            {
                                                name: `feeOfPayment`,
                                                type: `number`,
                                                defaultValue: 74321012,
                                                wrapView: "div",
                                                price: true,
                                                column: true,
                                                computed: true,
                                                view: "Typography",
                                                incest: { view: false, attribute: true },
                                                labelView: {
                                                    enable: true,
                                                    defaultValue: `＄`
                                                }
                                            }
                                        ]
                                    },
                                    {
                                        name: "sixth",
                                        view: "div",
                                        needParam: true,
                                        children: [
                                            {
                                                name: `headLabelOfProcedureOfTransport`,
                                                type: `string`,
                                                defaultValue: `運送方式：`,
                                                wrapView: "div",
                                                view: "Typography",
                                                incest: { view: false, attribute: true }
                                            },
                                            {
                                                name: `procedureOfTransport`,
                                                type: `string`,
                                                defaultValue: `自取`,
                                                wrapView: "div",
                                                view: "Typography",
                                                incest: { view: false, attribute: true }
                                            }
                                        ]
                                    },
                                    {
                                        name: "seventh",
                                        view: "div",
                                        needParam: true,
                                        injectStyle: true,
                                        children: [
                                            {
                                                name: `headLabelOfDistance`,
                                                type: `string`,
                                                defaultValue: `物流距離：`,
                                                wrapView: "div",
                                                view: "Typography",
                                                incest: { view: false, attribute: true }
                                            },
                                            {
                                                name: `distanceOfSasha`,
                                                type: `string`,
                                                defaultValue: `計算中...`,
                                                wrapView: "div",
                                                view: "Typography",
                                                incest: { view: false, attribute: true }
                                            }
                                        ]
                                    },
                                    {
                                        name: "eighth",
                                        view: "div",
                                        needParam: true,
                                        injectStyle: true,
                                        children: [
                                            {
                                                name: `headLabelOfProcedurePayment`,
                                                type: `string`,
                                                defaultValue: `支付方式：`,
                                                wrapView: "div",
                                                view: "Typography",
                                                incest: { view: false, attribute: true }
                                            },
                                            {
                                                name: `procedureOfPayment`,
                                                type: `string`,
                                                defaultValue: `計算中...`,
                                                wrapView: "div",
                                                view: "Typography",
                                                incest: { view: false, attribute: true }
                                            }
                                        ]
                                    }
                                ]
                            }
                        ]
                    },
                    {
                        ref: "funcOfCheckout",
                        independence: true
                    },
                    {
                        name: "needCVS",
                        type: "boolean",
                        defaultValue: false
                    },
                    {
                        name: "needAddress",
                        type: "boolean",
                        defaultValue: false
                    },
                    {
                        name: "needSelfPickingChoice",
                        type: "boolean",
                        defaultValue: false
                    },
                    {
                        name: "typeOfTransport",
                        type: "number",
                        defaultValue: -1
                    },
                    {
                        name: "typeOfTransaction",
                        type: "number",
                        defaultValue: -1
                    }
                ]
            }
        },
        {
            name: `gaia`,
            disposablePage: true,
            disableKeyOfRoute: true,
            path: `/gaia/:pid`,
            title: `創建(更新)的商品`,
            description: `結帳方式選擇`,
            struct: {
                name: `dionysusGaia`,
                view: "div",
                wrapView: "div",
                type: "object",
                children: [
                    {
                        name: "areaOfPhotoUpload",
                        view: "div",
                        needParam: true,
                        children: [
                            {
                                name: "row",
                                view: "div",
                                needParam: true,
                                children: [
                                    {
                                        name: "labelOfUploadPhoto",
                                        view: "Typography",
                                        type: "string",
                                        incest: { view: false, attribute: true },
                                        defaultValue: "商品圖片"
                                    },
                                    {
                                        name: "joinPhoto",
                                        view: "Chip",
                                        type: "string",
                                        variant: "outlined",
                                        injectStyle: true,
                                        incest: { view: false, attribute: true },
                                        defaultValue: "新增圖片"
                                    }
                                ]
                            },
                            {
                                name: "addImage",
                                view: "IconButton",
                                needParam: true,
                                injectStyle: true,
                                icon: "AddPhotoAlternateOutlined"
                                // icon: "AddAPhotoOutlined",
                            },
                            {
                                name: "briefPhoto",
                                plural: "s",
                                view: "div",
                                type: "array",
                                // defaultValue: [{ href: "https://image.sachianail.com/H018/10.jpg" }],
                                incest: { view: false, attribute: true },
                                column: true,
                                children: [
                                    {
                                        name: "href",
                                        view: "img",
                                        type: "string",
                                        click: true,
                                        description: "商品上會用得到圖片列表",
                                        column: true
                                    },
                                    {
                                        name: "delete",
                                        view: "IconButton",
                                        needParam: true,
                                        icon: "HighlightOffRounded",
                                        description: `刪除已上傳照片用的，浮在照片左上角`
                                    }
                                ]
                            }
                        ]
                    },
                    {
                        name: "ban",
                        view: "div",
                        needParam: true,
                        children: [
                            {
                                name: "row",
                                view: "div",
                                needParam: true,
                                children: [
                                    {
                                        name: "labelOfUploadBan",
                                        view: "Typography",
                                        type: "string",
                                        incest: { view: false, attribute: true },
                                        defaultValue: "置頂橫幅"
                                    },
                                    {
                                        name: "joinBan",
                                        view: "Chip",
                                        type: "string",
                                        variant: "outlined",
                                        injectStyle: true,
                                        incest: { view: false, attribute: true },
                                        defaultValue: "新增橫幅"
                                    }
                                ]
                            },
                            {
                                name: "briefBan",
                                plural: "s",
                                view: "div",
                                type: "array",
                                defaultValue: [],
                                incest: { view: false, attribute: true },
                                column: true,
                                children: [
                                    {
                                        name: "href",
                                        view: "img",
                                        type: "string",
                                        click: true,
                                        description: "商品上會用得到橫幅列表",
                                        column: true
                                    },
                                    {
                                        name: "delete",
                                        view: "IconButton",
                                        needParam: true,
                                        icon: "HighlightOffRounded",
                                        description: `刪除已上傳照片用的，浮在照片左上角`
                                    }
                                ]
                            }
                        ]
                    },
                    {
                        name: "areaOfName",
                        view: "div",
                        needParam: true,
                        children: [
                            {
                                name: "row",
                                view: "div",
                                needParam: true,
                                children: [
                                    {
                                        name: "labelOfName",
                                        view: "Typography",
                                        type: "string",
                                        incest: { view: false, attribute: true },
                                        defaultValue: "商品名稱"
                                    },
                                    {
                                        name: "stmtOfNameMaximum",
                                        view: "Typography",
                                        type: "string",
                                        incest: { view: false, attribute: true },
                                        defaultValue: "0/50",
                                        description: `提示最高商品字數，超過時disable新增功能`
                                    }
                                ]
                            },
                            {
                                name: "name",
                                description_: "商品名稱",
                                column: true,
                                type: "string",
                                incest: { view: false, attribute: true },
                                size: "small",
                                view: "TextField",
                                variant: "standard",
                                props: {
                                    multiline: true,
                                    minRows: 1,
                                    maxRows: 2
                                }
                            }
                        ]
                    },
                    {
                        name: "areaOfProp",
                        view: "div",
                        injectStyle: true,
                        needParam: true,
                        children: [
                            {
                                name: "labelOfProp",
                                type: "string",
                                defaultValue: `商品屬性`,
                                view: "Typography",
                                incest: { view: false, attribute: true }
                            },
                            {
                                name: "typeOfProp",
                                column: true,
                                size: `small`,
                                description_: `商品的屬性會決定畫面上的功能顯現，例如課程類別就強制用戶使用排程(產生日期的唯一碼，作為課程衝突的邏輯判斷)`,
                                incest: { view: false, attribute: true },
                                select: {
                                    type: "spinner",
                                    defaultValue: 1,
                                    color: `primary`,
                                    values: [
                                        { value: "1", label: "物品" },
                                        { value: "2", label: "課程" }
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
                        name: "areaOfMain",
                        view: "div",
                        needParam: true,
                        children: [
                            {
                                name: "row",
                                view: "div",
                                needParam: true,
                                children: [
                                    {
                                        name: "labelOfMainType",
                                        view: "Typography",
                                        type: "string",
                                        incest: { view: false, attribute: true },
                                        defaultValue: "主選項（款式、型號）"
                                    },
                                    {
                                        name: "appendMain",
                                        view: "Chip",
                                        type: "string",
                                        variant: "outlined",
                                        incest: { view: false, attribute: true },
                                        defaultValue: "新增",
                                        injectStyle: true,
                                        description: `新增商品的選項，例如型號款式，屬於這個商品本身的子項目 `,
                                        alertDialog: {
                                            customView: "textsFetch",
                                            needActionButtons: false,
                                            useCustomCancel: true
                                        }
                                    },
                                    {
                                        name: "appendTask",
                                        view: "Chip",
                                        type: "string",
                                        variant: "outlined",
                                        injectProps: true,
                                        injectStyle: true,
                                        incest: { view: false, attribute: true },
                                        defaultValue: "批次新增",
                                        description: `新增關於課程的設計`,
                                        color: "error",
                                        alertDialog: {
                                            customView: "apollo",
                                            needActionButtons: false,
                                            useCustomCancel: true,
                                            callback: true
                                        }
                                    }
                                ]
                            },
                            {
                                name: "briefMain",
                                plural: "s",
                                view: "div",
                                type: "array",
                                defaultValue: [{ label: "長袖" }, { label: "短袖" }],
                                incest: { view: false, attribute: true },
                                column: true,
                                children: [
                                    {
                                        name: "value",
                                        type: "string",
                                        column: true,
                                        description: "產生的隨機唯一id，不可重覆",
                                        defaultValue: ""
                                    },
                                    {
                                        name: "label",
                                        view: "Chip",
                                        type: "string",
                                        column: true,
                                        variant: "outlined",
                                        color: "error",
                                        description: "簡化顯示給user，讓畫面不要太冗08/03",
                                        iconOfDeleted: `ClearRounded`
                                    }
                                ]
                            }
                        ]
                    },
                    {
                        name: "areaOfSub",
                        view: "div",
                        needParam: true,
                        children: [
                            {
                                name: "row",
                                view: "div",
                                needParam: true,
                                children: [
                                    {
                                        name: "labelOfSubType",
                                        view: "Typography",
                                        type: "string",
                                        incest: { view: false, attribute: true },
                                        defaultValue: "副選項（顏色、尺寸）"
                                    },
                                    {
                                        name: "appendSub",
                                        view: "Chip",
                                        type: "string",
                                        incest: { view: false, attribute: true },
                                        defaultValue: "新增",
                                        variant: "outlined",
                                        injectStyle: true,
                                        injectProp: true,
                                        description: `新增商品的副項，例如顏色、尺寸，屬於這個商品本身的副項目 `,
                                        alertDialog: {
                                            customView: "textsFetch",
                                            needActionButtons: false,
                                            useCustomCancel: true
                                        }
                                    },
                                    {
                                        name: "quantity",
                                        type: "number",
                                        defaultValue: 1,
                                        description: `用來判斷是否要disable的根據`
                                    }
                                ]
                            },
                            {
                                name: "briefSub",
                                plural: "s",
                                view: "div",
                                type: "array",
                                defaultValue: [{ label: "Ｍ號" }, { label: "Ｌ號" }],
                                incest: { view: false, attribute: true },
                                column: true,
                                children: [
                                    {
                                        name: "value",
                                        type: "string",
                                        column: true,
                                        description: "產生的隨機唯一id，不可重覆",
                                        defaultValue: ""
                                    },
                                    {
                                        name: "label",
                                        view: "Chip",
                                        type: "string",
                                        column: true,
                                        description: "簡化顯示給user，讓畫面不要太冗08/03",
                                        variant: "outlined",
                                        color: "success",
                                        iconOfDeleted: `ClearRounded`
                                    }
                                ]
                            }
                        ]
                    },
                    {
                        name: "priceSet",
                        view: "ArrowOption",
                        // defaultContent: "未設定",
                        defaultTitle: "設定價格（總項）",
                        needWrap: true,
                        injectWrapStyle: true,
                        description: "編輯每個組合後的variant價格",
                        alertDialog: {
                            customView: "priceSetter",
                            needActionButtons: false,
                            useCustomCancel: true
                        }
                    },
                    {
                        name: "quantitySet",
                        view: "ArrowOption",
                        // defaultContent: "未設定",
                        defaultTitle: "設定數量（總項）",
                        injectWrapStyle: true,
                        needWrap: true,
                        description: "編輯每個組合後的variant數量",
                        alertDialog: {
                            customView: "quantitySetter",
                            needActionButtons: false,
                            useCustomCancel: true
                        }
                    },
                    {
                        name: "photoSet",
                        view: "ArrowOption",
                        // defaultContent: "未設定",
                        injectWrapStyle: true,
                        defaultTitle: "設定圖片（總項）",
                        needWrap: true,
                        description: "編輯每個variant點選後的照片",
                        alertDialog: {
                            customView: "variantPhotoSetter",
                            needActionButtons: false
                        }
                    },
                    {
                        name: "tabSet",
                        view: "ArrowOption",
                        // defaultContent: "所有商品",
                        defaultTitle: "設定分頁",
                        needWrap: true,
                        description: "編輯商品要放置於哪個分頁",
                        alertDialog: {
                            customView: "textsIndexSetter",
                            needActionButtons: false,
                            useCustomCancel: true
                        }
                    },
                    {
                        name: "areaOfTrunk",
                        view: "div",
                        needParam: true,
                        injectStyle: true,
                        children: [
                            {
                                name: "labelOfTrunk",
                                type: "string",
                                defaultValue: `避免衝堂`,
                                view: "Typography",
                                incest: { view: false, attribute: true }
                            },
                            {
                                name: "useMainTrunk",
                                type: "boolean",
                                view: "Switch",
                                defaultValue: true,
                                description: `課程屬於單一宇宙，避免有一個老師遇到多個課程衝堂`,
                                incest: { view: false, attribute: true }
                            }
                        ]
                    },
                    {
                        name: "taken",
                        view: "div",
                        injectStyle: true,
                        needParam: true,
                        children: [
                            {
                                name: "labelOfPickUp",
                                type: "string",
                                defaultValue: `接受自取`,
                                view: "Typography",
                                incest: { view: false, attribute: true }
                            },
                            {
                                name: "allowSelfPickUp",
                                type: "boolean",
                                view: "Switch",
                                defaultValue: false,
                                incest: { view: false, attribute: true }
                            }
                        ]
                    },
                    {
                        name: "dest",
                        view: "div",
                        needParam: true,
                        injectStyle: true,
                        children: [
                            {
                                name: "labelOfHomeTeaching",
                                type: "string",
                                defaultValue: `到府授課`,
                                view: "Typography",
                                incest: { view: false, attribute: true }
                            },
                            {
                                name: "isHomeTeaching",
                                type: "boolean",
                                view: "Switch",
                                defaultValue: false,
                                incest: { view: false, attribute: true }
                            }
                        ]
                    },
                    {
                        name: "areaOfStatus",
                        view: "div",
                        needParam: true,
                        children: [
                            {
                                name: "labelOfStatus",
                                type: "string",
                                defaultValue: `上架商品`,
                                view: "Typography",
                                incest: { view: false, attribute: true }
                            },
                            {
                                name: "visibility",
                                type: "boolean",
                                view: "Switch",
                                defaultValue: false,
                                injectStyle: true,
                                incest: { view: false, attribute: true }
                            }
                        ]
                    },
                    {
                        name: "areaOfDescription",
                        view: "div",
                        needParam: true,
                        children: [
                            {
                                name: "row",
                                view: "div",
                                needParam: true,
                                children: [
                                    {
                                        name: "labelOfDescription",
                                        view: "Typography",
                                        type: "string",
                                        incest: { view: false, attribute: true },
                                        defaultValue: "商品內容"
                                    },
                                    {
                                        name: "stmtOfDescriptionMaximum",
                                        view: "Typography",
                                        type: "string",
                                        defaultValue: "0/300",
                                        incest: { view: false, attribute: true },
                                        description: `提示最高商品字數，超過時disable新增功能`
                                    }
                                ]
                            },
                            {
                                name: "statement",
                                description: "敘述（成分、產地、注意事項）",
                                column: true,
                                incest: { view: false, attribute: true },
                                size: "small",
                                type: "string",
                                view: "TextField",
                                variant: "standard",
                                props: {
                                    multiline: true,
                                    minRows: 1,
                                    maxRows: 15
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
                                name: "backToHome",
                                type: "string",
                                view: `Chip`,
                                variant: "outlined",
                                incest: { view: false, attribute: true },
                                defaultValue: "返回",
                                alertDialog: {
                                    title: "返回主頁",
                                    content: "即將離開頁面前，請確認當前內容是否需要儲存"
                                }
                            },
                            // {
                            //     name: "recover",
                            //     view: "Chip",
                            //     type: "string",
                            //     variant: "outlined",
                            //     injectStyle: true,
                            //     incest: { view: false, attribute: true },
                            //     defaultValue: "復原"
                            // },
                            {
                                name: "deleted",
                                view: "Chip",
                                type: "string",
                                color: "error",
                                incest: { view: false, attribute: true },
                                variant: "outlined",
                                defaultValue: "刪除",
                                injectStyle: true,
                                alertDialog: {
                                    title: "刪除商品",
                                    content: "是否確認刪除此商品？\n（＊＊無法回復＊＊）"
                                }
                            },
                            {
                                name: "create",
                                view: "Chip",
                                type: "string",
                                variant: "filled",
                                color: "primary",
                                injectStyle: true,
                                incest: { view: false, attribute: true },
                                defaultValue: "下一步",
                                alertDialog: {
                                    title: "新增商品",
                                    content: "確認新增後無法更改「商品屬性」以及「主、副選項」，是否已確認？\n"
                                }
                            },
                            {
                                name: "update",
                                view: "Chip",
                                type: "string",
                                variant: "filled",
                                color: "primary",
                                injectStyle: true,
                                incest: { view: false, attribute: true },
                                defaultValue: "更新"
                            }
                        ]
                    },
                    {
                        name: "selected",
                        type: "string",
                        description: "用了text[s]fetch，呼叫的callback需要一個switch",
                        defaultValue: "none"
                    },
                    {
                        name: "idOfBooze",
                        type: "string",
                        description: "booze的document id，也是產品的唯一序號"
                    },
                    {
                        presetParam: true,
                        name: "booze",
                        type: "objectOfEmpty",
                        column: true
                    },
                    {
                        name: "initCompleted",
                        type: "boolean",
                        defaultValue: false,
                        description: `當用下一步確認後{initCompleted => true}，[商品屬性]就要被鎖住，不能再更動`
                    },
                    {
                        name: "isNewBie",
                        type: "boolean",
                        defaultValue: false,
                        description: `當一次建立商品時，要提醒用戶點擊價格/數量/圖片區`
                    }
                ]
            }
        },
        {
            name: `eros`,
            disposablePage: true,
            path: `/eros`,
            title: `營運參數設定`,
            description: `分頁設定|LINE支付 ID|金流ID`,
            struct: {
                name: `dionysusEros`,
                view: "div",
                wrapView: "div",
                type: "object",
                children: [
                    {
                        name: "cupidSecret",
                        path: `/users/:uid/eros/secret`,
                        type: `object`,
                        permission: {
                            read: "isAuthorNSelf(uid) && isAdmin()",
                            write: "isAuthorNSelf(uid)",
                            delete: "isAuthorNSelf(uid)",
                            update: "isAuthorNSelf(uid)"
                        },
                        children: [
                            {
                                name: "linepaySet",
                                column: true,
                                type: "arrayOfField",
                                description: `用來存放linepay兩組序號`,
                                defaultValue: []
                            },
                            {
                                name: "ECPaySet",
                                column: true,
                                type: "arrayOfField",
                                description: `用來存放ECPay兩組序號`,
                                defaultValue: []
                            }
                        ]
                    },
                    {
                        name: "cupidPublic",
                        path: `/users/:uid/eros/public`,
                        type: `object`,
                        permission: {
                            read: "alwaysTrue()",
                            write: "isAuthorNSelf(uid)",
                            delete: "isAuthorNSelf(uid)",
                            update: "isAuthorNSelf(uid)"
                        },
                        children: [
                            {
                                name: "whetherHomeDelivery",
                                type: "boolean",
                                defaultValue: false,
                                column: true,
                                description: `宅配啟用功能`
                            },
                            {
                                name: "cautionOfDirectPay",
                                type: "string",
                                defaultValue: `（完成支付後，截圖給小編）`,
                                _defaultValue: `（截圖給男友支付，訊息給小編）`,
                                column: true,
                                description: `宅配啟用功能`
                            },
                            {
                                name: "whetherShipByRapidly",
                                type: "boolean",
                                defaultValue: false,
                                column: true,
                                description: `當日送開關功能`
                            },
                            {
                                name: "addressTimeOfSelfPickUp",
                                type: "string",
                                column: true,
                                description: `自取地點和時間提示`
                            },
                            {
                                name: "whetherShipByStorePickup",
                                type: "boolean",
                                defaultValue: false,
                                column: true,
                                description: `店到店啟用功能`
                            },
                            {
                                name: "enableOfCOD",
                                type: "boolean",
                                defaultValue: false,
                                column: true,
                                description: `貨到付啟用功能`
                            },
                            {
                                name: "whetherPickupByBuyerSelf",
                                type: "boolean",
                                defaultValue: false,
                                column: true,
                                description: `提供自取服務`
                            },
                            {
                                name: "thresholdOfAllowSelfPickup",
                                type: "number",
                                description: `自取的低消`,
                                column: true,
                                defaultValue: 0
                            },
                            {
                                name: "feeOfHomeDelivery",
                                type: "number",
                                description: `宅配的運費`,
                                column: true,
                                defaultValue: 200
                            },
                            {
                                name: "feeOfShipByCOD",
                                type: "number",
                                description: `貨到付款的運費`,
                                column: true,
                                defaultValue: 200
                            },
                            {
                                name: "percentageFeeOfCOD",
                                type: "number",
                                description: `貨到付款的手續費，不然好麻煩`,
                                column: true,
                                defaultValue: 30
                            },
                            {
                                name: "feeOfRapidOnDelivery",
                                type: "number",
                                description: `當日到的運費`,
                                column: true,
                                defaultValue: 400
                            },
                            {
                                name: "feeOfInStorePickup",
                                type: "number",
                                description: `超商寄送的運費`,
                                column: true,
                                defaultValue: 60
                            },
                            {
                                name: "enableOfECPay",
                                type: "boolean",
                                defaultValue: false,
                                column: true,
                                description: `EC開關功能`
                            },
                            {
                                name: "hasECPay",
                                type: "boolean",
                                defaultValue: true, //測試方便，還有enableOfECPay為false的開關
                                column: true,
                                description: '有ECPay需要的MerchantID: "3002607" HashKey: "pwFHCqoQZGmho4w6" HashIV: "EkRm7iFT261dpevs"'
                            },
                            {
                                name: "enableOfLinePay",
                                type: "boolean",
                                defaultValue: false,
                                column: true,
                                description: `Line Pay開關功能`
                            },
                            {
                                name: "hasLinePay",
                                type: "boolean",
                                defaultValue: true, //測試方便，還有enableOfLinePay為false的開關
                                column: true,
                                description: "有Line Pay的channelId,channelSecret。"
                            },
                            {
                                name: "enableOfDirectPay",
                                type: "boolean",
                                defaultValue: false,
                                column: true,
                                description: `允許用ＱＲ CODE立牌支付`
                            },
                            {
                                name: "hasDirectPay",
                                type: "boolean",
                                defaultValue: true,
                                column: true,
                                description: "有LinePay 的 ＱＲ code條碼:目前只接受lineapay。"
                            },
                            {
                                name: "thresholdOfCheckoutByLinePay",
                                type: "number",
                                description: `LINE支付消費門檻`,
                                column: true,
                                defaultValue: 10
                            },
                            {
                                name: "thresholdOfCheckoutByCredit",
                                type: "number",
                                description: `信用卡消費門檻`,
                                column: true,
                                defaultValue: 10
                            },
                            {
                                name: "thresholdOfFreeShipByCOD",
                                type: "number",
                                description: `貨到付款免運門檻`,
                                column: true,
                                defaultValue: 2000
                            },
                            {
                                name: "thresholdOfFreeShipByStorePickup",
                                type: "number",
                                description: `超取免費門檻`,
                                column: true,
                                defaultValue: 999
                            },
                            {
                                name: "thresholdOfFreeShipByRapidly",
                                type: "number",
                                description: `當日到門檻(14:00)`,
                                column: true,
                                defaultValue: 1999
                            },
                            {
                                name: "thresholdOfFreeShipByHomeDelivery",
                                type: "number",
                                description: `宅配免運門檻`,
                                column: true,
                                defaultValue: 1199
                            },
                            {
                                name: "hrefOfDirectPay",
                                column: true,
                                type: "string",
                                description: `用來存放立牌的連結。`,
                                defaultValue: ""
                            },
                            {
                                name: "nameOfDirectPay",
                                column: true,
                                type: "string",
                                description: `公司向第三方支付提交的店舖名。`,
                                defaultValue: ``
                            }
                        ]
                    },
                    {
                        name: "admin",
                        view: "div",
                        needParam: true,
                        injectStyle: true,
                        children: [
                            {
                                name: "brandName",
                                view: "ArrowOption",
                                // defaultContent: "未設定",
                                defaultTitle: "網站「店舖名」",
                                needWrap: true,
                                description: "設定左上角字樣",
                                alertDialog: {
                                    customView: "textFetch",
                                    needActionButtons: false,
                                    useCustomCancel: true
                                }
                            },
                            {
                                name: "tabCreator",
                                view: "ArrowOption",
                                // defaultContent: "未設定",
                                defaultTitle: "店鋪「分頁設定」",
                                injectWrapStyle: true,
                                needWrap: true,
                                description: "編輯分頁有哪些組合",
                                alertDialog: {
                                    customView: "textsFetch",
                                    needActionButtons: false,
                                    useCustomCancel: true
                                }
                            },
                            {
                                name: "dividerTop",
                                view: `div`
                            },
                            {
                                name: "whetherDisplaySpecific",
                                view: "ArrowOption",
                                useSwitch: true,
                                defaultValue: false,
                                description: `網頁底部是否顯示營業登記資訊`,
                                defaultTitle: "「頁底」營業資訊",
                                needWrap: true
                            },
                            {
                                name: "companyO",
                                view: "ArrowOption",
                                // defaultContent: "未設定",
                                defaultTitle: "公司登記名稱（經濟部）",
                                needWrap: true,
                                description: "公司登記名稱（經濟部）",
                                alertDialog: {
                                    title: "公司登記名稱（經濟部）",
                                    textInput: {
                                        value: "",
                                        enable: true,
                                        type: "string",
                                        label: "輸入公司登記名稱（經濟部）"
                                    }
                                }
                            },
                            {
                                name: "unifiedB",
                                view: "ArrowOption",
                                defaultTitle: "公司「統一編號」",
                                needWrap: true,
                                description: "公司「統一編號」",
                                alertDialog: {
                                    title: "公司「統一編號」",
                                    textInput: {
                                        value: "",
                                        enable: true,
                                        type: "string",
                                        label: "輸入公司「統一編號」"
                                    }
                                }
                            },
                            {
                                name: "addressO",
                                view: "ArrowOption",
                                defaultTitle: "店鋪「地址」",
                                needWrap: true,
                                description: "店鋪「地址」",
                                alertDialog: {
                                    title: "店鋪「地址」",
                                    textInput: {
                                        value: "",
                                        enable: true,
                                        type: "string",
                                        label: "店鋪「地址」，可提供自取點"
                                    }
                                }
                            },
                            {
                                name: "phoneO",
                                view: "ArrowOption",
                                defaultTitle: "店鋪「聯絡電話」",
                                needWrap: true,
                                description: "店鋪「聯絡電話」",
                                alertDialog: {
                                    title: "店鋪「聯絡電話」",
                                    textInput: {
                                        value: "",
                                        enable: true,
                                        type: "string",
                                        label: "手機聯絡電話，市話請加區碼"
                                    }
                                }
                            },
                            {
                                name: "emailO",
                                view: "ArrowOption",
                                defaultTitle: "店鋪「電子信箱」",
                                needWrap: true,
                                description: "店鋪「電子信箱」",
                                alertDialog: {
                                    title: "店鋪「電子信箱」",
                                    textInput: {
                                        value: "",
                                        enable: true,
                                        type: "string",
                                        label: "公司專用的Email（電子信箱）"
                                    }
                                }
                            },
                            {
                                name: "dividerTop",
                                view: `div`
                            },
                            {
                                name: "percentageOfDiscount",
                                view: "ArrowOption",
                                // defaultContent: "未設定",
                                defaultTitle: "店鋪「全館折扣」",
                                needWrap: true,
                                description: "目前全館給予多少折扣",
                                alertDialog: {
                                    title: "有購物結帳時，當前所有購物結帳時的額外折扣(%)。",
                                    textInput: {
                                        value: "",
                                        enable: true,
                                        type: "number" /** email,phone,*/,
                                        label: "輸入全館當前折扣(%)" /** */
                                    }
                                }
                            },
                            {
                                name: "numOfWorker",
                                view: "ArrowOption",
                                // defaultContent: "未設定",
                                defaultTitle: "店鋪「講師人數」",
                                needWrap: true,
                                description: "設定支付密碼",
                                alertDialog: {
                                    title: "可承接任務的人數",
                                    textInput: {
                                        value: "",
                                        enable: true,
                                        type: "number" /** email,phone,*/,
                                        label: "輸入人數，處理課程衝突" /** */
                                    }
                                }
                            },
                            {
                                name: "dividerTop",
                                view: `div`
                            },
                            {
                                name: "fbO",
                                view: "ArrowOption",
                                defaultTitle: "「FACEBOOK」官網",
                                needWrap: true,
                                description: "「FACEBOOK」官網",
                                alertDialog: {
                                    title: "「FACEBOOK」官網",
                                    textInput: {
                                        value: "",
                                        enable: true,
                                        type: "string",
                                        label: "「FACEBOOK」官網的網址連結"
                                    }
                                }
                            },
                            {
                                name: "igO",
                                view: "ArrowOption",
                                defaultTitle: "「INSTAGRAM」粉專",
                                needWrap: true,
                                description: "「INSTAGRAM」」粉專",
                                alertDialog: {
                                    title: "「INSTAGRAM」粉專",
                                    textInput: {
                                        value: "",
                                        enable: true,
                                        type: "string",
                                        label: "「INSTAGRAM」粉專的網址連結"
                                    }
                                }
                            },
                            {
                                name: "tiktokO",
                                view: "ArrowOption",
                                defaultTitle: "「TIKTOK」抖音",
                                needWrap: true,
                                description: "「TIKTOK」抖音",
                                alertDialog: {
                                    title: "「TIKTOK」抖音",
                                    textInput: {
                                        value: "",
                                        enable: true,
                                        type: "string",
                                        label: "「TIKTOK」抖音的網址連結"
                                    }
                                }
                            },
                            {
                                name: "ytO",
                                view: "ArrowOption",
                                defaultTitle: "「YOUTUBE」頻道",
                                needWrap: true,
                                description: "「YOUTUBE」頻道",
                                alertDialog: {
                                    title: "「YOUTUBE」頻道",
                                    textInput: {
                                        value: "",
                                        enable: true,
                                        type: "string",
                                        label: "「YOUTUBE」頻道的網址連結"
                                    }
                                }
                            },
                            {
                                name: "lineO",
                                view: "ArrowOption",
                                defaultTitle: "「LINE」官方帳號",
                                needWrap: true,
                                description: "「LINE」官方帳號",
                                alertDialog: {
                                    title: "「LINE」官方帳號",
                                    textInput: {
                                        value: "",
                                        enable: true,
                                        type: "string",
                                        label: "「LINE」的官方帳號"
                                    }
                                }
                            },
                            {
                                name: "dividerTop",
                                view: `div`
                            },
                            {
                                name: "maximumOfUniqueItems",
                                view: "ArrowOption",
                                injectWrapStyle: true,
                                // defaultContent: "未設定",
                                defaultTitle: "結帳品項數量上限",
                                needWrap: true,
                                description: "單筆交易結帳時，最多可以有多少品項，關係到後台要拿多少variant的effort",
                                alertDialog: {
                                    title: "交易結帳時，最多可以有多少品項",
                                    textInput: {
                                        value: "",
                                        enable: true,
                                        type: "number" /** email,phone,*/,
                                        label: "最多能有幾種品項？" /** */
                                    }
                                }
                            },
                            {
                                name: "ttlOfPayment",
                                view: "ArrowOption",
                                injectWrapStyle: true,
                                // defaultContent: "未設定",
                                defaultTitle: "結帳緩衝時間",
                                needWrap: true,
                                description: "交易完成後， (Time To Live)最長能接受多久的寬限期(分鐘)，超過就會被schedule失效",
                                alertDialog: {
                                    title: "設定結帳緩衝時間（登入用戶）",
                                    textInput: {
                                        value: "",
                                        enable: true,
                                        type: "number" /** email,phone,*/,
                                        label: "訂單完成後，多久內必須完成結帳程序？（分鐘）" /** */
                                    }
                                }
                            },
                            {
                                name: "ttlOfAnonymous",
                                view: "ArrowOption",
                                injectWrapStyle: true,
                                // defaultContent: "未設定",
                                defaultTitle: "結帳緩衝時間（陌生訪問）",
                                needWrap: true,
                                description: "陌生交易完成後， (Time To Live)最長能接受多久的寬限期(分鐘)，超過就會被schedule失效",
                                alertDialog: {
                                    title: "設定結帳緩衝時間（陌生訪問）",
                                    textInput: {
                                        value: "",
                                        enable: true,
                                        type: "number" /** email,phone,*/,
                                        label: "陌生交易需要在多久內完成結帳程序？（分鐘）" /** */
                                    }
                                }
                            },
                            {
                                name: "dividerTop",
                                view: `div`
                            },
                            {
                                name: "boughtWithoutLoginIn",
                                view: "ArrowOption",
                                useSwitch: true,
                                defaultValue: false,
                                description: `同意下單免登入功能，結帳僅能兩件。`,
                                defaultTitle: "下單免登入",
                                needWrap: true
                            },
                            {
                                name: "amountOfAllowAnonymousBuy",
                                view: "ArrowOption",
                                // defaultContent: "未設定",
                                defaultTitle: "未登入結帳額度上限",
                                needWrap: true,
                                description: "設定支付密碼",
                                alertDialog: {
                                    title: "避免巨額棄單，未登入需限制金額上限。",
                                    textInput: {
                                        value: "",
                                        enable: true,
                                        type: "number" /** email,phone,*/,
                                        label: "輸入上限金額" /** */
                                    }
                                }
                            },
                            {
                                name: "amountOfMaximumBuy",
                                view: "ArrowOption",
                                // defaultContent: "未設定",
                                defaultTitle: "單筆結帳額度上限",
                                needWrap: true,
                                description: "設定支付密碼",
                                alertDialog: {
                                    title: "避免單筆交易金額過大，必須限制金額上限。",
                                    textInput: {
                                        value: "",
                                        enable: true,
                                        type: "number" /** email,phone,*/,
                                        label: "輸入上限金額" /** */
                                    }
                                }
                            }
                        ]
                    },
                    {
                        name: "linepay",
                        view: "ArrowOption",
                        // defaultContent: "未設定",
                        useSwitch: true,
                        defaultValue: false,
                        defaultTitle: "啟用LINE支付",
                        needWrap: true
                    },
                    {
                        name: "linepaySet",
                        view: "ArrowOption",
                        defaultTitle: "LINE支付金鑰",
                        needWrap: true,
                        description: "設定支付密碼",
                        alertDialog: {
                            customView: "textsFetch",
                            needActionButtons: false,
                            useCustomCancel: true
                        }
                    },
                    {
                        name: "divider",
                        view: `div`
                    },
                    {
                        name: "directPay",
                        view: "ArrowOption",
                        useSwitch: true,
                        defaultValue: false,
                        defaultTitle: "啟用現金｜掃碼付款",
                        needWrap: true
                    },
                    {
                        name: "nameOfDirectPay",
                        view: "ArrowOption",
                        // defaultContent: "未設定",
                        defaultTitle: "掃碼「店鋪名」",
                        needWrap: true,
                        description: "公司向第三方支付提交的店舖名",
                        alertDialog: {
                            title: "公司向第三方支付提交的店舖名",
                            textInput: {
                                value: "",
                                enable: true,
                                type: "string" /** email,phone,*/,
                                label: "向第三方支付申請的店舖名" /** */
                            }
                        }
                    },
                    {
                        name: "hrefOfDirectPay",
                        view: "ArrowOption",
                        // defaultContent: "未設定",
                        defaultTitle: "LINE「ＱＲ碼」連結",
                        needWrap: true,
                        description: "設定直接付款的連結",
                        alertDialog: {
                            customView: "textsFetch",
                            needActionButtons: false,
                            useCustomCancel: true
                        }
                    },
                    {
                        name: "cautionOfDirectPay",
                        view: "ArrowOption",
                        // defaultContent: "未設定",
                        defaultTitle: "「ＱＲ碼」付費提示標語",
                        needWrap: true,
                        description: "「ＱＲ碼」付費提示標語",
                        alertDialog: {
                            title: "使用「LINE支付」消費門檻",
                            textInput: {
                                value: "",
                                enable: true,
                                type: "string" /** email,phone,*/,
                                label: "ＱＲ碼付費時的，提示標語(例：截圖給小編)" /** */
                            }
                        }
                    },
                    {
                        name: "previewDirectPay",
                        view: "ArrowOption",
                        // defaultContent: "未設定",
                        defaultTitle: "「ＱＲ碼」付費預覽",
                        needWrap: true,
                        description: "設定直接付款的連結",
                        alertDialog: {
                            customView: "ireneQrcode",
                            needActionButtons: false,
                            presetObj: true,
                            fullWidth: true
                        }
                    },
                    {
                        name: "divider",
                        view: `div`,
                        injectStyle: true
                    },
                    {
                        name: "ECPay",
                        view: "ArrowOption",
                        useSwitch: true,
                        defaultValue: false,
                        defaultTitle: "啟用綠界信用支付",
                        needWrap: true
                    },
                    {
                        name: "ECPaySet",
                        view: "ArrowOption",
                        defaultTitle: "綠界支付金鑰",
                        needWrap: true,
                        description: "設定支付密碼",
                        alertDialog: {
                            customView: "textsFetch",
                            needActionButtons: false,
                            useCustomCancel: true
                        }
                    },
                    {
                        name: "divider",
                        view: `div`
                    },
                    {
                        name: "thresholdOfCheckoutByLinePay",
                        view: "ArrowOption",
                        defaultTitle: "「LINE支付」消費門檻",
                        needWrap: true,
                        description: "使用「LINE支付」消費門檻",
                        alertDialog: {
                            title: "使用「LINE支付」消費門檻",
                            textInput: {
                                value: "",
                                enable: true,
                                type: "number" /** email,phone,*/,
                                label: "使用「LINE支付」消費門檻" /** */
                            }
                        }
                    },
                    {
                        name: "thresholdOfCheckoutByCredit",
                        view: "ArrowOption",
                        defaultTitle: "「信用卡」消費門檻",
                        needWrap: true,
                        description: "使用「信用卡」消費門檻",
                        alertDialog: {
                            title: "使用「信用卡」消費門檻",
                            textInput: {
                                value: "",
                                enable: true,
                                type: "number" /** email,phone,*/,
                                label: "使用「信用卡」消費門檻" /** */
                            }
                        }
                    },
                    {
                        name: "thresholdOfAllowSelfPickup",
                        view: "ArrowOption",
                        defaultTitle: "「自取」消費門檻",
                        needWrap: true,
                        description: "「自取」消費門檻",
                        alertDialog: {
                            title: "「自取」消費門檻",
                            textInput: {
                                value: "",
                                enable: true,
                                type: "number" /** email,phone,*/,
                                label: "「自取」消費門檻" /** */
                            }
                        }
                    },
                    {
                        name: "divider",
                        view: `div`
                    },
                    {
                        name: "whetherPickupByBuyerSelf",
                        view: "ArrowOption",
                        // defaultContent: "未設定",
                        useSwitch: true,
                        defaultValue: false,
                        defaultTitle: "提供買家「自取」",
                        needWrap: true
                    },
                    {
                        name: "addressTimeOfSelfPickUp",
                        view: "ArrowOption",
                        // defaultContent: "未設定",
                        defaultValue: false,
                        defaultTitle: "「自取」地點時間",
                        needWrap: true,
                        alertDialog: {
                            title: "商品「自取」地點時間",
                            textInput: {
                                value: "",
                                enable: true,
                                type: "text" /** email,phone,*/,
                                label: "輸入「自取」地點位置和時間提示" /** */
                            }
                        }
                    },
                    {
                        name: "divider",
                        view: `div`
                    },
                    {
                        name: "enableOfCOD",
                        view: "ArrowOption",
                        // defaultContent: "未設定",
                        useSwitch: true,
                        defaultValue: false,
                        defaultTitle: "啟用「貨到付」",
                        needWrap: true
                    },
                    {
                        name: "feeOfShipByCOD",
                        view: "ArrowOption",
                        defaultTitle: "「貨到付」運費",
                        needWrap: true,
                        description: "「貨到付」運費",
                        alertDialog: {
                            title: "「貨到付」運費",
                            textInput: {
                                value: "",
                                enable: true,
                                type: "number" /** email,phone,*/,
                                label: "「貨到付」運費" /** */
                            }
                        }
                    },
                    {
                        name: "percentageFeeOfCOD",
                        view: "ArrowOption",
                        defaultTitle: "「貨到付」手續費(%)",
                        needWrap: true,
                        description: "「貨到付」手續費(%)",
                        alertDialog: {
                            title: "「貨到付」手續費(%)",
                            textInput: {
                                value: "",
                                enable: true,
                                type: "number" /** email,phone,*/,
                                label: "「貨到付」手續費(%)" /** */
                            }
                        }
                    },
                    {
                        name: "thresholdOfFreeShipByCOD",
                        view: "ArrowOption",
                        defaultTitle: "免運門檻「貨到付」",
                        needWrap: true,
                        description: "免運門檻「貨到付」",
                        alertDialog: {
                            title: "免運門檻「貨到付」",
                            textInput: {
                                value: "",
                                enable: true,
                                type: "number" /** email,phone,*/,
                                label: "輸入「貨到付」免運的購買金額" /** */
                            }
                        }
                    },
                    {
                        name: "divider",
                        view: `div`
                    },
                    {
                        name: "whetherHomeDelivery",
                        view: "ArrowOption",
                        // defaultContent: "未設定",
                        useSwitch: true,
                        defaultValue: false,
                        defaultTitle: "啟用「宅配」",
                        needWrap: true
                    },
                    {
                        name: "feeOfHomeDelivery",
                        view: "ArrowOption",
                        defaultTitle: "「宅配」運費",
                        needWrap: true,
                        description: "「宅配」運費",
                        alertDialog: {
                            title: "「宅配」運費",
                            textInput: {
                                value: "",
                                enable: true,
                                type: "number" /** email,phone,*/,
                                label: "「宅配」運費" /** */
                            }
                        }
                    },
                    {
                        name: "thresholdOfFreeShipByHomeDelivery",
                        view: "ArrowOption",
                        defaultTitle: "免運門檻「宅配」",
                        needWrap: true,
                        description: "免運門檻「宅配」",
                        alertDialog: {
                            title: "免運門檻「宅配」",
                            textInput: {
                                value: "",
                                enable: true,
                                type: "number" /** email,phone,*/,
                                label: "輸入「宅配」免運的購買金額" /** */
                            }
                        }
                    },
                    {
                        name: "divider",
                        view: `div`
                    },
                    {
                        name: "whetherShipByRapidly",
                        view: "ArrowOption",
                        // defaultContent: "未設定",
                        useSwitch: true,
                        defaultValue: false,
                        defaultTitle: "啟用「當日到」",
                        needWrap: true
                    },
                    {
                        name: "feeOfRapidOnDelivery",
                        view: "ArrowOption",
                        defaultTitle: "「當日到」運費",
                        needWrap: true,
                        description: "「當日到」運費",
                        alertDialog: {
                            title: "「當日到」運費",
                            textInput: {
                                value: "",
                                enable: true,
                                type: "number" /** email,phone,*/,
                                label: "「當日到」運費" /** */
                            }
                        }
                    },
                    {
                        name: "thresholdOfFreeShipByRapidly",
                        view: "ArrowOption",
                        defaultTitle: "免運門檻「當日到」",
                        needWrap: true,
                        description: "免運門檻「當日到」",
                        alertDialog: {
                            title: "免運門檻「當日到」",
                            textInput: {
                                value: "",
                                enable: true,
                                type: "number" /** email,phone,*/,
                                label: "輸入「當日到」免運的購買金額" /** */
                            }
                        }
                    },
                    {
                        name: "divider",
                        view: `div`
                    },
                    {
                        name: "whetherShipByStorePickup",
                        view: "ArrowOption",
                        // defaultContent: "未設定",
                        useSwitch: true,
                        defaultValue: false,
                        defaultTitle: "啟用「店到店」",
                        needWrap: true
                    },
                    {
                        name: "feeOfInStorePickup",
                        view: "ArrowOption",
                        defaultTitle: "「店到店」運費",
                        needWrap: true,
                        description: "「店到店」運費",
                        alertDialog: {
                            title: "「店到店」運費（7-11｜全家）",
                            textInput: {
                                value: "",
                                enable: true,
                                type: "number" /** email,phone,*/,
                                label: "「店到店」運費" /** */
                            }
                        }
                    },
                    {
                        name: "thresholdOfFreeShipByStorePickup",
                        view: "ArrowOption",
                        defaultTitle: "免運門檻「店到店」",
                        needWrap: true,
                        description: "免運門檻「店到店」",
                        alertDialog: {
                            title: "免運門檻「店到店」",
                            textInput: {
                                value: "",
                                enable: true,
                                type: "number" /** email,phone,*/,
                                label: "輸入「超取」免運的購買金額" /** */
                            }
                        }
                    },
                    {
                        name: "selected",
                        type: "string",
                        description: "用了text[s]fetch，呼叫的callback需要一個switch",
                        defaultValue: "none"
                    }
                ]
            }
        },
        {
            name: `apollo`,
            disposablePage: true,
            path: `/apollo`,
            description: `給一些日期條件，就能夠產出一系列的日期和時間，不用一個一個手打`,
            struct: {
                name: `dionysusApollo`,
                view: "Paper",
                wrapView: "div",
                type: "object",
                children: [
                    {
                        name: "periodOfDate",
                        view: "div",
                        needParam: true,
                        children: [
                            {
                                name: "section",
                                view: "div",
                                needParam: true,
                                children: [
                                    {
                                        name: "labelOfDatePeriod",
                                        view: "Typography",
                                        type: `string`,
                                        defaultValue: `課程起迄日期`,
                                        incest: { view: false, attribute: true }
                                    },
                                    {
                                        name: "line",
                                        view: "div"
                                    }
                                ]
                            },
                            {
                                name: "main",
                                view: "div",
                                needParam: true,
                                children: [
                                    {
                                        name: "startOfDate",
                                        type: "timestamp",
                                        view: "DatePicker",
                                        size: "small",
                                        format: `YY/MM/DD`,
                                        defaultValue: "###dayjs()",
                                        column: true,
                                        incest: { view: false, attribute: true },
                                        labelView: {
                                            enable: true,
                                            defaultValue: `開始日期：`
                                        }
                                    },
                                    {
                                        name: "endOfDate",
                                        type: "timestamp",
                                        view: "DatePicker",
                                        format: `YY/MM/DD`,
                                        defaultValue: "###dayjs()",
                                        size: "small",
                                        column: true,
                                        incest: { view: false, attribute: true },
                                        labelView: {
                                            enable: true,
                                            defaultValue: `結束日期：`
                                        }
                                    }
                                ]
                            }
                        ]
                    },
                    {
                        name: "periodOfTime",
                        view: "div",
                        needParam: true,
                        children: [
                            {
                                name: "section",
                                view: "div",
                                needParam: true,
                                children: [
                                    {
                                        name: "labelOfTimePeriod",
                                        view: "Typography",
                                        type: `string`,
                                        defaultValue: `課堂起迄時間`,
                                        incest: { view: false, attribute: true }
                                    },
                                    {
                                        name: "line",
                                        view: "div"
                                    }
                                ]
                            },
                            {
                                name: "main",
                                view: "div",
                                needParam: true,
                                children: [
                                    {
                                        name: "timeOfStart",
                                        type: "timestamp",
                                        view: "TimePicker",
                                        size: "small",
                                        format: `HH:mm`,
                                        defaultValue: "###dayjs()",
                                        column: true,
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
                                        format: `HH:mm`,
                                        defaultValue: "###dayjs()",
                                        size: "small",
                                        column: true,
                                        incest: { view: false, attribute: true },
                                        labelView: {
                                            enable: true,
                                            defaultValue: `結束時間：`
                                        }
                                    }
                                ]
                            }
                        ]
                    },
                    {
                        name: "line",
                        view: "div"
                    },
                    {
                        name: "durationOfTask",
                        view: "TextField",
                        type: "number",
                        column: true,
                        defaultValue: 60,
                        size: "small",
                        variant: "outlined",
                        helperVisual: {
                            enable: true,
                            end: {
                                type: "text",
                                content: "分鐘"
                            }
                        },
                        labelView: {
                            enable: true,
                            defaultValue: `課程時長：`
                        }
                    },
                    {
                        name: "intervalOfTask",
                        view: "TextField",
                        type: "number",
                        defaultValue: 0,
                        size: "small",
                        variant: "outlined",
                        column: true,
                        helperVisual: {
                            enable: true,
                            end: {
                                type: "text",
                                content: "分鐘"
                            }
                        },
                        labelView: {
                            enable: true,
                            defaultValue: `課堂間隔：`
                        }
                    },
                    {
                        name: "areaOfRest",
                        view: "div",
                        needParam: true,
                        children: [
                            {
                                name: "row",
                                view: "div",
                                needParam: true,
                                children: [
                                    {
                                        name: "labelOfRestPeriod",
                                        view: "Typography",
                                        type: "string",
                                        incest: { view: false, attribute: true },
                                        defaultValue: "休息時間"
                                    },
                                    {
                                        name: "appendOfRestPeriod",
                                        view: "Chip",
                                        type: "string",
                                        variant: "outlined",
                                        incest: { view: false, attribute: true },
                                        defaultValue: "新增",
                                        description: `新增休息時間區間`,
                                        alertDialog: {
                                            customView: "timePeriod",
                                            needActionButtons: false,
                                            useCustomCancel: true,
                                            callback: true
                                        }
                                    }
                                ]
                            },
                            {
                                name: "restPeriod",
                                plural: "s",
                                view: "div",
                                type: "array",
                                defaultValue: [{ label: "12:00-13:00" }],
                                incest: { view: false, attribute: true },
                                column: true,
                                children: [
                                    {
                                        name: "value",
                                        type: "string",
                                        column: true,
                                        defaultValue: ""
                                    },
                                    {
                                        name: "label",
                                        view: "Chip",
                                        type: "string",
                                        column: true,
                                        variant: "outlined",
                                        color: "error",
                                        iconOfDeleted: `ClearRounded`
                                    }
                                ]
                            }
                        ]
                    },
                    {
                        name: "areaOfDayOff",
                        view: "div",
                        needParam: true,
                        children: [
                            {
                                name: "row",
                                view: "div",
                                needParam: true,
                                children: [
                                    {
                                        name: "labelOfDayOff",
                                        view: "Typography",
                                        type: "string",
                                        incest: { view: false, attribute: true },
                                        defaultValue: "固定公休"
                                    },
                                    {
                                        name: "appendOfDayOff",
                                        view: "Chip",
                                        type: "string",
                                        variant: "outlined",
                                        incest: { view: false, attribute: true },
                                        defaultValue: "更新",
                                        description: `新增每週公休時間`,
                                        alertDialog: {
                                            customView: "textsIndexSetter",
                                            needActionButtons: false,
                                            useCustomCancel: true
                                        }
                                    }
                                ]
                            },
                            {
                                name: "offDay",
                                plural: "s",
                                view: "div",
                                type: "array",
                                defaultValue: [
                                    { value: 6, label: "星期六" },
                                    { value: 7, label: "星期日" }
                                ],
                                incest: { view: false, attribute: true },
                                column: true,
                                children: [
                                    {
                                        name: "value",
                                        type: "number",
                                        column: true,
                                        defaultValue: ""
                                    },
                                    {
                                        name: "label",
                                        view: "Chip",
                                        type: "string",
                                        column: true,
                                        variant: "outlined",
                                        color: "error",
                                        iconOfDeleted: `ClearRounded`
                                    }
                                ]
                            }
                        ]
                    },
                    {
                        name: "func",
                        view: "div",
                        needParam: true,
                        children: [
                            {
                                name: "load",
                                view: "Chip",
                                type: "string",
                                incest: { view: false, attribute: true },
                                color: "success",
                                variant: "outlined",
                                defaultValue: "最近"
                            },
                            {
                                name: "leave",
                                view: "Chip",
                                type: "string",
                                incest: { view: false, attribute: true },
                                variant: "outlined",
                                defaultValue: "退出"
                            },
                            {
                                name: "confirm",
                                view: "Chip",
                                type: "string",
                                variant: "filled",
                                color: "primary",
                                incest: { view: false, attribute: true },
                                defaultValue: "確認"
                            }
                        ]
                    }
                ]
            }
        },
        {
            name: "quantitySetter",
            disposablePage: true,
            description: `設定商品數量`,
            struct: {
                name: `dionysusQuantitySetter`,
                view: `Paper`,
                wrapView: "div",
                type: "object",
                children: [
                    {
                        name: "variant",
                        plural: "s",
                        view: "div",
                        type: "array",
                        column: true,
                        example: [
                            { labelOfVariant: "黑｜ＸＬ", quantity: 530 },
                            { labelOfVariant: "白｜ＸＬ", quantity: 2000 },
                            { labelOfVariant: "綠｜ＸＬ", quantity: 12 }
                        ],
                        children: [
                            {
                                name: "id",
                                type: "string",
                                column: true,
                                description: "document id:組合字串=>${mainValue:hash}-${subValue:hash}"
                            },
                            {
                                name: "labelOfVariant",
                                view: "Typography",
                                type: "string",
                                wrapView: "div",
                                description: "variant的組合（黑-XL）"
                            },
                            {
                                name: "quantity",
                                view: "TextField",
                                type: "number",
                                variant: "outlined",
                                size: "small",
                                column: true,
                                defaultValue: 0,
                                singleLine: true,
                                // helperVisual: {
                                //     enable: true,
                                //     start: {
                                //         type: "icon",
                                //         content: "Inventory2"
                                //     }
                                // },
                                props: {
                                    sx: {
                                        input: { textAlign: "right" },
                                        "& .MuiInputBase-input.Mui-disabled": {
                                            WebkitTextFillColor: "black"
                                        }
                                    }
                                }
                            },
                            {
                                name: "update",
                                view: "IconButton",
                                needParam: true,
                                injectStyle: true,
                                icon: "RefreshRounded"
                            },
                            {
                                name: "existing",
                                type: "boolean",
                                defaultValue: false
                            }
                        ]
                    },
                    {
                        name: "func",
                        view: "div",
                        needParam: true,
                        children: [
                            {
                                name: "common",
                                view: "Chip",
                                type: "string",
                                color: "success",
                                incest: { view: false, attribute: true },
                                variant: "outlined",
                                defaultValue: "均一數量",
                                alertDialog: {
                                    customView: "numberSetter",
                                    needActionButtons: false,
                                    useCustomCancel: true,
                                    callback: true
                                }
                            },
                            {
                                name: "leave",
                                view: "Chip",
                                type: "string",
                                incest: { view: false, attribute: true },
                                variant: "outlined",
                                defaultValue: "離開"
                            },
                            {
                                name: "batchUpdate",
                                view: "Chip",
                                type: "string",
                                variant: "filled",
                                color: "primary",
                                incest: { view: false, attribute: true },
                                defaultValue: "批次更新"
                            }
                        ]
                    }
                ]
            }
        },
        {
            name: "priceSetter",
            disposablePage: true,
            description: `設定商品數量`,
            struct: {
                name: `dionysusPriceSetter`,
                view: `Paper`,
                wrapView: "div",
                type: "object",
                children: [
                    {
                        name: "variant",
                        plural: "s",
                        view: "div",
                        type: "array",
                        column: true,
                        example: [
                            { labelOfVariant: "黑｜ＸＬ", quantity: 530 },
                            { labelOfVariant: "白｜ＸＬ", quantity: 2000 },
                            { labelOfVariant: "綠｜ＸＬ", quantity: 12 }
                        ],
                        children: [
                            {
                                name: "id",
                                type: "string",
                                column: true,
                                description: "document id:組合字串=>${mainValue:hash}-${subValue:hash}"
                            },
                            {
                                name: "labelOfVariant",
                                view: "Typography",
                                type: "string",
                                wrapView: "div",
                                description: "variant的組合（黑-XL）",
                                singleLine: true
                            },
                            {
                                name: "row",
                                view: "div",
                                needParam: true,
                                children: [
                                    {
                                        name: "price",
                                        view: "TextField",
                                        type: "number",
                                        variant: "outlined",
                                        size: "small",
                                        column: true,
                                        defaultValue: 0,
                                        incest: { view: false, attribute: true },
                                        singleLine: true,
                                        description: "售價",
                                        props: {
                                            sx: {
                                                input: { textAlign: "right" },
                                                "& .MuiInputBase-input.Mui-disabled": {
                                                    WebkitTextFillColor: "black"
                                                }
                                            }
                                        },
                                        helperVisual: {
                                            enable: true,
                                            start: {
                                                type: "text",
                                                content: "$"
                                            }
                                        }
                                    },
                                    {
                                        name: "priceB4Discount",
                                        view: "TextField",
                                        type: "number",
                                        incest: { view: false, attribute: true },
                                        variant: "outlined",
                                        size: "small",
                                        column: true,
                                        defaultValue: 0,
                                        injectStyle: true,
                                        singleLine: true,
                                        description: "原價",
                                        props: {
                                            sx: {
                                                input: { textAlign: "right" },
                                                "& .MuiInputBase-input.Mui-disabled": {
                                                    WebkitTextFillColor: "black"
                                                }
                                            }
                                        },
                                        helperVisual: {
                                            enable: true,
                                            start: {
                                                type: "text",
                                                content: "$"
                                            }
                                        }
                                    }
                                ]
                            },
                            {
                                name: "update",
                                view: "IconButton",
                                needParam: true,
                                injectStyle: true,
                                icon: "RefreshRounded"
                            },
                            {
                                name: "existing",
                                type: "boolean",
                                defaultValue: false
                            }
                        ]
                    },
                    {
                        name: "func",
                        view: "div",
                        needParam: true,
                        children: [
                            {
                                name: "common",
                                view: "Chip",
                                type: "string",
                                color: "success",
                                incest: { view: false, attribute: true },
                                variant: "outlined",
                                defaultValue: "均一價",
                                alertDialog: {
                                    customView: "numberSetter",
                                    needActionButtons: false,
                                    useCustomCancel: true,
                                    callback: true
                                }
                            },
                            {
                                name: "leave",
                                view: "Chip",
                                type: "string",
                                incest: { view: false, attribute: true },
                                variant: "outlined",
                                defaultValue: "離開"
                            },
                            {
                                name: "batchUpdate",
                                view: "Chip",
                                type: "string",
                                variant: "filled",
                                color: "primary",
                                incest: { view: false, attribute: true },
                                defaultValue: "批次更新"
                            }
                        ]
                    }
                ]
            }
        },
        {
            name: "variantPhotoSetter",
            disposablePage: true,
            description: `當主選｜副選被選擇到時，顯示出的畫面`,
            struct: {
                name: `dionysusVariantPhotoSetter`,
                view: `Paper`,
                wrapView: "div",
                type: "object",
                children: [
                    {
                        name: "variant",
                        plural: "s",
                        view: "div",
                        type: "array",
                        column: true,
                        example: [{ labelOfVariant: "黑｜ＸＬ" }, { labelOfVariant: "白｜ＸＬ" }, { labelOfVariant: "綠｜ＸＬ" }],
                        children: [
                            {
                                name: "id",
                                type: "string",
                                column: true,
                                description: "document id:組合字串=>${mainValue:hash}-${subValue:hash}"
                            },
                            {
                                name: "labelOfVariant",
                                view: "Typography",
                                type: "string",
                                column: true,
                                wrapView: "div",
                                description: "variant的組合（黑-XL）",
                                singleLine: true
                            },
                            {
                                name: "update",
                                view: "IconButton",
                                needParam: true,
                                injectStyle: true,
                                icon: "AddPhotoAlternateRounded"
                            },
                            {
                                name: "photo",
                                type: "string",
                                column: true,
                                description: `用來放置上傳後的image path`
                            },
                            {
                                name: "preview",
                                view: "Chip",
                                needParam: true,
                                type: "string",
                                variant: "outlined",
                                injectStyle: true,
                                defaultValue: "預覽"
                            },
                            {
                                name: "existing",
                                type: "boolean",
                                defaultValue: false,
                                column: true
                            }
                        ]
                    }
                ]
            }
        },
        {
            name: "paymentBrief",
            title: "支付說明",
            struct: {
                name: "dionysusPaymentBrief",
                view: "div",
                type: "object",
                children: [
                    {
                        name: "note",
                        type: "array",
                        view: "div",
                        plural: "s",
                        children: [
                            {
                                name: "img",
                                view: "img",
                                type: "string",
                                wrapView: "div"
                            },
                            {
                                name: "title",
                                view: "Typography",
                                type: "string",
                                wrapView: "div"
                            }
                        ]
                    }
                ]
            }
        }
    ]
};

export default component;
