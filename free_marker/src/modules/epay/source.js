const component = {
    path: "/epay",
    name: "epay",
    disposablePage: true,
    cloudFunctions: [
        {
            name: "createEPayPreciseOrder",
            type: "httpOnCall",
            description: "透過client送來的order,對照idOfProduct,算出總金額,創建出waiting狀態得epay order",
            payload: {
                remark: "針對此次交易內容的備註內容",
                items: `[{nameOfBooze,idOfVariant:'商品的id',quantity:4}]`,
                address: "寄送地址",
                phone: "手機聯絡方式",
                name: "姓名",
                email: "聯絡用email",
                transport: "1.不需運費 3.自取,4.SEVEN-11 5.全家 7.當日到 8.宅配",
                transaction: "1.LINE支付 3.綠界支付 4,貨到付款, 9 //現金Pay"
            }
        },
        {
            name: "updatePreciseOrderRemarkContent",
            type: "httpOnCall", //functions.https.onCall(async (data, context) => {}) context 裏面有uid 或登入資訊
            description: "buyer可以update單筆Order的備註條件(還沒結帳之前)",
            payload: {
                remarkOfPreciseOrder: "備註內容",
                idOfPreciseOrder: ""
            }
        },
        {
            name: "forcePaidByAuthor",
            type: "httpOnCall",
            description: "author可以強制將訂單狀態設定為已付款",
            payload: {
                idOfPreciseOrder: ""
            }
        },
        {
            name: "informTransportingByAuthor",
            type: "httpOnCall",
            description: "author可以設定商品的貨運資料，發送Email通知User和Author保存",
            payload: {
                idOfPreciseOrder: "",
                idOfShipped: ""
            }
        },
        {
            name: "updateOrderRemarkOfAuthor",
            type: "httpOnCall", //functions.https.onCall(async (data, context) => {}) context 裏面有uid 或登入資訊
            description: "author可以update單筆Order的備註條件(還沒結帳之前)",
            payload: {
                remarkOfAuthor: "備註內容",
                idOfPreciseOrder: ""
            }
        },
        {
            name: "verifyByLiffIdToken",
            type: "httpOnCall",
            description: "將line開啟的webview拿到的liff token轉換成custom info，進而完成google auth",
            payload: {
                idToken: "liffIdToken"
            }
        },
        {
            name: "checkoutByLinePay",
            type: "httpOnCall", //functions.https.onCall(async (data, context) => {}) context 裏面有uid 或登入資訊
            description: "用line-pay付費",
            payload: {
                idOfPreciseOrder: ""
            }
        },
        {
            name: "confirmedByLinePay",
            type: "httpOnCall", //functions.https.onCall(async (data, context) => {}) context 裏面有uid 或登入資訊
            description: "line-pay付費完,用來核銷的,將裡面會將order改成succeed,扣掉庫存,消費者拿到應有的權利",
            payload: {
                idOfPreciseOrder: "",
                idOfTransaction: ""
            }
        },
        {
            name: "checkoutByECPay",
            type: "httpOnCall", //functions.https.onCall(async (data, context) => {}) context 裏面有uid 或登入資訊
            description: "用ECPay付費",
            payload: {
                idOfPreciseOrder: ""
            }
        },
        {
            name: "cancelPreciseOrder",
            type: "httpOnCall", //functions.https.onCall(async (data, context) => {}) context 裏面有uid 或登入資訊
            description: "只有idSeller,idOfUser,admin, 可以取消訂單. 可以把訂單狀態為(asking,order,pending)轉換為failure, 把數量atomic加回去",
            payload: {
                idOfPreciseOrder: ""
            }
        },
        {
            name: "paymentInfoByECPay",
            type: "httpOnRequest", //functions.https.onCall(async (data, context) => {}) context 裏面有uid 或登入資訊
            description: "讓EC-PAY透過post呼叫的API. 使用EC-PAY非信用卡付款時(CVS, ATM), 需要保存付費資訊",
            payload: {
                CheckMacValue: "",
                MerchantTradeNo: "",
                MerchantID: "",
                PaymentType: ""
            }
        },
        {
            name: "confirmedByECPay",
            type: "httpOnRequest", //functions.https.onCall(async (data, context) => {}) context 裏面有uid 或登入資訊
            description: "讓EC-PAY透過post呼叫的API. ECPay收到款項後,裡面會將order改成succeed,扣掉庫存,消費者拿到應有的權利",
            isRegularResponse: false,
            payload: {
                idOfPreciseOrder: "",
                idOfTransaction: ""
            }
        },
        {
            name: "selectorOfCVS",
            type: "httpOnRequest", //functions.https.onCall(async (data, context) => {}) context 裏面有uid 或登入資訊
            description: "讓7-11的店家選擇器，有post的url",
            isRegularResponse: false,
            payload: {
                storeaddress: "",
                storeid: "",
                storename: "",
                TempVar: ""
            }
        },
        {
            name: "schedulerOfExpiredOrder", //functions.pubsub.schedule('every 5 minutes').onRun(async (context) => {})
            type: "schedule",
            schedule: "every 30 minutes" // support hours,minutes,
        }
    ],
    events: [
        {
            name: "onPaymentSucceed",
            params: ["content"]
        }
    ],
    enums: {
        TransportMethod: {
            Needless: { value: 1, label: "無運費產生" }, // 不需運費
            SelfPickup: { value: 3, label: "自行取貨" }, // 自取
            Store711: { value: 4, label: "7-11（超取）" }, // 7-11
            StoreFamily: { value: 5, label: "全家（超取）" }, // 全家
            RapidOnDay: { value: 7, label: "當日到（14:00前下單）" }, // 當日到
            Freight: { value: 8, label: "宅配到府" } // 宅配
        },
        TransactionMethod: {
            LinePay: { value: 1, label: "LINE 支付" }, // LINE支付
            ECPay: { value: 3, label: "信用卡（綠界支付）" }, // 信用卡（綠界支付）
            COD: { value: 4, label: "貨到付款" }, // 貨到付款
            DirectPay: { value: 9, label: "現金支付" }, // 現金支付
            AuthorForcePaid: { value: 11, label: "賣家已自行確認" }
        },
        StateOfPayment: {
            Asking: { value: 1, label: "等待賣家同意" },
            Pending: { value: 2, label: "等付款" },
            Waiting: { value: 3, label: "待付款(ATM/超商條碼）" },
            Failure: { value: 4, label: "已失效" },
            Completed: { value: 5, label: "已完成" }
        },
        StateOfTransport: {
            Needless: { value: 1, label: "無運費產生" },
            Pending: { value: 2, label: "等待付款" },
            Sending: { value: 3, label: "已出貨" },
            Returning: { value: 4, label: "已退貨" }
        },
        EPayType: {
            LinePay: { value: 1, label: "LINEPAY" },
            ECPay: { value: 3, label: "ECPAY" },
            AuthorForcePaid: { value: 11, label: "AuthorForcePaid" }
        }
    },
    struct: {
        name: `epay`,
        type: "object",
        view: "div",
        children: [
            {
                name: "preciseOrder",
                type: "array",
                plural: "s",
                conditions: [`{type:'orderBy', params:['updateTime', 'desc']}`],
                path: "/ordersOfEPay",
                idxes: [
                    [
                        { name: "idOfAuthor", type: "order", rule: "ASCENDING" },
                        { name: "updateTime", type: "order", rule: "DESCENDING" },
                        { name: "__name__", type: "order", rule: "DESCENDING" }
                    ],
                    [
                        { name: "idOfUser", type: "order", rule: "ASCENDING" },
                        { name: "stateOfPayment", type: "order", rule: "ASCENDING" },
                        { name: "updateTime", type: "order", rule: "DESCENDING" },
                        { name: "__name__", type: "order", rule: "DESCENDING" }
                    ],
                    [
                        { name: "idOfUser", type: "order", rule: "ASCENDING" },
                        { name: "updateTime", type: "order", rule: "DESCENDING" },
                        { name: "__name__", type: "order", rule: "DESCENDING" }
                    ],
                    [
                        { name: "idOfAuthor", type: "order", rule: "ASCENDING" },
                        { name: "stateOfPayment", type: "order", rule: "ASCENDING" },
                        { name: "stateOfTransport", type: "order", rule: "ASCENDING" },
                        { name: "updateTime", type: "order", rule: "DESCENDING" },
                        { name: "__name__", type: "order", rule: "DESCENDING" }
                    ],
                    [
                        { name: "idOfUser", type: "order", rule: "ASCENDING" },
                        { name: "stateOfPayment", type: "order", rule: "ASCENDING" },
                        { name: "stateOfTransport", type: "order", rule: "ASCENDING" },
                        { name: "updateTime", type: "order", rule: "DESCENDING" },
                        { name: "__name__", type: "order", rule: "DESCENDING" }
                    ],
                    [
                        { name: "idOfAuthor", type: "order", rule: "ASCENDING" },
                        { name: "stateOfPayment", type: "order", rule: "ASCENDING" },
                        { name: "updateTime", type: "order", rule: "DESCENDING" },
                        { name: "__name__", type: "order", rule: "DESCENDING" }
                    ],
                    [
                        { name: "stateOfPayment", type: "order", rule: "ASCENDING" },
                        { name: "stateOfTransport", type: "order", rule: "ASCENDING" },
                        { name: "updateTime", type: "order", rule: "DESCENDING" },
                        { name: "__name__", type: "order", rule: "DESCENDING" }
                    ],
                    [
                        { name: "stateOfPayment", type: "order", rule: "ASCENDING" },
                        { name: "updateTime", type: "order", rule: "DESCENDING" },
                        { name: "__name__", type: "order", rule: "DESCENDING" }
                    ]
                ],
                paginate: {
                    threshold: 10,
                    size: 10
                },
                permission: {
                    write: "isAdmin()",
                    read: "isMyDocument() || isAdmin()"
                },
                children: [
                    {
                        name: "timeOfPayment",
                        type: "timestamp",
                        column: true,
                        description: "消費者成功付費的時間"
                    },
                    {
                        name: "cvs",
                        type: "objectOfEmpty",
                        description: `放置CVS資訊的欄位`,
                        column: true
                    },
                    {
                        name: "discountOfTotal",
                        type: "number",
                        defaultValue: 0,
                        column: true,
                        description: "優惠禮金(折扣價)"
                    },
                    {
                        name: "percentageOfDiscount",
                        type: "number",
                        defaultValue: 0,
                        column: true,
                        description: "當時給的折扣"
                    },
                    {
                        name: "feeOfTransport",
                        type: "number",
                        column: true,
                        defaultValue: 0,
                        description: "運費"
                    },
                    {
                        name: "typeOfCurrency",
                        type: "string",
                        column: true,
                        defaultValue: "TWD",
                        description: "使用的幣種TWD USD JPY TWD THB"
                    },
                    {
                        name: "serialOfTransport",
                        type: "string",
                        column: true,
                        description: "寄件後的追蹤編號"
                    },
                    {
                        name: "titleOfOrder",
                        type: "string",
                        column: true,
                        defaultValue: "明悅科技-線上支付",
                        description: "綠界科技有個TradeDesc欄位"
                    },
                    {
                        name: "isShipped",
                        type: "boolean",
                        column: true,
                        defaultValue: false,
                        description: "商品是否寄出"
                    },
                    {
                        name: "idOfUser",
                        column: true,
                        type: "string",
                        defaultValue: "UserOfNotLogin",
                        description: "買家的UserId(Buyer)"
                    },
                    {
                        name: "name",
                        column: true,
                        type: "string",
                        defaultValue: "欄位上買家填入的欄位",
                        description: "買家的真實名字(如果有登入就自動帶入)"
                    },
                    {
                        name: "idOfAuthor",
                        type: "string",
                        column: true,
                        description: "賣家的id, 刪除訂單的權限僅有 idOfUser(可能無須登入) 和 idOfAuthor(seller)"
                    },
                    {
                        name: "anonymous",
                        type: "boolean",
                        column: true,
                        defaultValue: false,
                        description: "未登入的user下單購買的標記，houseKeeping出任務時(未登入買家沒有當在當下完成交易時，刪除此筆訂單)"
                    },
                    {
                        name: "typeOfTransport",
                        type: "number",
                        column: true,
                        description: `物流方式 TransportMethod`
                    },
                    {
                        name: "typeOfTransaction",
                        type: "number",
                        column: true,
                        description: `支付方式 TransactionMethod`
                    },
                    {
                        name: "fingerprint",
                        type: "string",
                        column: true,
                        ignoreI: true,
                        description: "前端用來當作唯一認證ID的Hash"
                    },
                    {
                        name: "procedureOfPayment",
                        description: "付款方式例如:ECPAY།།Credit_CreditCard;;;;第一個是TYPE_OF_THIRD_PARTY(EPAY,LINEPAY), 第二個是付款方式(CVS,ATM,CREDIT)",
                        column: true,
                        defaultValue: `unknown`,
                        type: "string"
                    },
                    {
                        name: "infoOfPayment",
                        type: "string",
                        column: true,
                        description: "如果是ECPAY的ATM,就有分行-帳號, 如果是CVS 就有編號;;在LinePay就放paymentAccessToken(該代碼在LINE Pay可以代替掃描器使用)"
                    },
                    {
                        name: "contentOfRender",
                        description: "ECPAY如果在nodejs create, 訂單後會產生用來render的content, " + "因為不能重複呼叫aio_create訂單,把它存起來方便buyer可以re-invoke",
                        type: "string",
                        ignoreI: true,
                        column: true
                    },
                    {
                        name: "idOfThirdPartyTradeNo",
                        description: "第三支付建立的訂單編號(EX:綠界的TradeNo)",
                        column: true,
                        type: "string"
                    },
                    {
                        name: "timeOfExpired",
                        type: "timestamp",
                        column: true,
                        description: "如果非即時付款方式(ATM,CVS),就會有繳費期限的限制"
                    },
                    {
                        name: "timeOfHouseKeeping",
                        type: "timestamp",
                        column: true,
                        description: "例如逾期的檢查是來自於scheduler，應該要把houseKeeping執行時間記錄起來"
                    },
                    {
                        name: "timeOfCreate",
                        type: "timestamp",
                        column: true,
                        description: "開創order訂單的時間"
                    },
                    {
                        name: "needAddress",
                        type: "boolean",
                        column: true,
                        description: "發信時用來註記是否需要提供地址"
                    },
                    {
                        name: "timeOfTransport",
                        type: "timestamp",
                        column: true,
                        description: "order商品寄出時間"
                    },
                    {
                        name: "timeOfCancel",
                        type: "timestamp",
                        column: true,
                        description: "訂單被刪除的時間, 時間都是firestore去處理, 就能完美的解決locale問題, 不用去UTC+多少"
                    },
                    {
                        name: "stateOfPayment",
                        type: "number",
                        column: true,
                        defaultValue: 2,
                        description:
                            "訂單狀態解釋 " +
                            "asking: 等待賣家允許付費(尚未設計); 1" +
                            "pending: 訂單已成立; 2" +
                            "waiting: 訂單已成立, 而且選擇了第三方平台, 等待付費(CVS,ATM); 3" +
                            "failure: 訂單已失效, 交易商品數量已atomic加回去; 4" +
                            "completed: 訂單已完成; 5" +
                            "invalid: 訂單已將數量加回賣家, 但要保留單號, 避免產生duplicated 交易單號(尚未設計)"
                    },
                    {
                        name: "stateOfTransport",
                        type: "number",
                        column: true,
                        defaultValue: 2,
                        description: "運輸狀態解釋" + "needless: 免出貨(課程類) 1" + "pending: 未出貨 2" + "sending: 已出貨 3" + "returning: 已退貨 4"
                    },
                    {
                        name: "textOfContract",
                        type: "string",
                        column: true,
                        ignoreI: true,
                        description: "敘述購買內容 name:count = price 例:iphone13 pro x 3 = 40"
                    },
                    {
                        name: "messageOfPayment",
                        type: "string",
                        column: true,
                        description: "訂單狀態如果是失敗, 三方回過了的error message"
                    },
                    {
                        name: "priceOfTotal",
                        type: `number`,
                        column: true,
                        description: "計算出的總價"
                    },
                    {
                        name: "imageUrlOfHeadPhoto",
                        type: `string`,
                        column: true,
                        description: "放在付費頁面的頭版頭照片"
                    },
                    {
                        name: "remark",
                        type: "string",
                        column: true,
                        description: "購買者的其他備註"
                    },
                    {
                        name: "remarkOfAuthor",
                        type: "string",
                        column: true,
                        description: "賣家的備註（買家不能看到）"
                    },
                    {
                        name: "photoOfAuthor",
                        cheap: true,
                        plural: "s",
                        type: "array",
                        column: true,
                        description: `用來放運單的照片們`,
                        children: [
                            {
                                name: "href",
                                type: "string",
                                column: true,
                                fileMaximum: "5MB",
                                storageFolder: "epay/:id/transport",
                                permission: {
                                    read: "isAuthorOfEPay(id)",
                                    write: "isAuthorOfEPay(id)"
                                }
                            }
                        ]
                    },
                    {
                        name: "email",
                        type: "string",
                        column: true,
                        description: "購買人信箱"
                    },
                    {
                        name: "address",
                        type: "string",
                        column: true,
                        description: "購買人地址"
                    },
                    {
                        name: "distance",
                        type: "string",
                        column: true,
                        description: "購買人提供地址距離倉庫估算里程"
                    },
                    {
                        name: "phoneNumber",
                        type: "string",
                        column: true,
                        description: "收件人電話(手機-市話)"
                    },
                    {
                        name: "isRestoreItems",
                        type: "boolean",
                        column: true,
                        defaultValue: false,
                        description: "因為訂單會先咬著購買數量，如果stateOfPayment === `failure`，要把數量扣回去"
                    },
                    {
                        type: "array",
                        name: "item",
                        plural: "s",
                        column: true,
                        ignoreI: true,
                        description: "用來放購買商品列表,例如idOfPreciseProduct, Quantity",
                        children: [
                            {
                                name: "idOfPreciseProduct",
                                type: "string",
                                column: true
                            },
                            {
                                name: "isTaskJob",
                                type: "boolean",
                                column: true,
                                defaultValue: false,
                                description: "是否為課程(task)類型的商品variant"
                            },
                            {
                                name: "quantity",
                                type: "number",
                                column: true
                            },
                            {
                                name: "name",
                                type: "string",
                                column: true
                            },
                            {
                                name: "price",
                                type: "number",
                                column: true,
                                defaultValue: 0
                            },
                            {
                                name: "specific",
                                type: "string",
                                column: true,
                                description: "規格標註(例:同一款商品有顏色或尺寸的選項)"
                            },
                            {
                                name: "note",
                                type: "string",
                                column: true,
                                description: "商品備註(想設計為單一項目也能給備註)"
                            },
                            {
                                name: "imageUrlOfProduct",
                                type: `string`,
                                column: true,
                                description: "放在付費頁面的頭照片,目前只支援一組"
                            },
                            {
                                name: "infoOfHera",
                                type: `string`,
                                column: true,
                                description: "若是商品為課程(isTaskJob)，且useMainTrunk，就會產生一個processor(用來判斷時間衝突用)"
                            }
                        ]
                    },
                    {
                        name: "timesOfTransaction",
                        type: "number",
                        defaultValue: 0,
                        column: true,
                        description: "走到交易平台的次數;ecpay不能二次載入訂單,不然讓user無條件的更改交易方式,目前上限為兩次"
                    }
                ]
            },
            {
                name: "anonymous",
                type: "array",
                plural: "es",
                disableInitFetch: true,
                description: `用來記錄匿名用戶購買的紀錄，限制2分鐘內同一筆fingerprint僅能有一筆`,
                path: "/anonymouses",
                paginate: {
                    threshold: 10,
                    size: 10
                },
                permission: {
                    write: "isAdmin()",
                    read: "isMyDocument() || isAdmin()"
                },
                children: [
                    {
                        name: "id",
                        type: "string",
                        column: true,
                        description: `用fingerprint當作唯一碼`
                    },
                    {
                        name: "timeOfRequest",
                        type: "timestamp",
                        column: true,
                        description: `最近一次訪問的時間`
                    }
                ]
            },
            {
                name: "selectorOfCVS",
                type: "array",
                plural: "s",
                disableInitFetch: true,
                path: "selectorsOfCVS",
                column: true,
                permission: {
                    read: "alwaysTrue()"
                },
                description: `便利商店的選擇器(TransportMethod)`,
                children: [
                    {
                        name: "id",
                        type: "string",
                        description: `對應一個當前正在監聽documents的序號，由前端產生TempVar`,
                        column: true
                    },
                    {
                        name: "type",
                        description: `便利商店的選擇器(TransportMethod)`,
                        type: "number",
                        column: true
                    },
                    {
                        name: "storeid",
                        type: "string",
                        column: true,
                        description: "超商代碼"
                    },
                    {
                        name: "storeaddress",
                        type: "string",
                        column: true,
                        description: "監聽id"
                    },
                    {
                        name: "storename",
                        type: "string",
                        column: true,
                        description: "取貨店名"
                    }
                ]
            }
        ]
    },
    componentsOfExtra: [
        {
            path: "/respondtowardlinepay",
            name: "epayBehaviorOfConfirmLinePay",
            disposablePage: true,
            title: `LINEPAY支付(處理中)`,
            description:
                "當使用者用linepay付費完, LinePay Server 回傳的導引頁面, 裡面要執行functions-confirmedByLinePay,把頁面給Hang住, 執行成功後跳轉到listOfPurchaseHistory-已完成",
            struct: {
                name: "epayBehaviorOfConfirmLinePay",
                view: "div",
                type: "object",
                wrapView: "div",
                children: [
                    {
                        name: "messageOfFreeze",
                        l10n: true,
                        view: "Typography",
                        type: "string",
                        defaultValue: "交易執行中，請勿關閉當前頁面。"
                    }
                    // {
                    //     name: "loading",
                    //     view: "CircularProgress",
                    //     props: {
                    //         size: 60
                    //     }
                    // }
                ]
            }
        },
        {
            path: "/epayMethodOfPayment/",
            name: "epayMethodOfPayment",
            disposablePage: true,
            loginOnlyPage: true,
            description: `選擇付款的方式(LINE支付、ATM、信用卡、綠界科技)`,
            struct: {
                name: "epayMethodOfPayment",
                view: "Paper",
                type: "object",
                children: [
                    {
                        name: "title",
                        view: "Typography",
                        type: "string",
                        l10n: true,
                        defaultValue: "選擇支付方式"
                    },
                    {
                        name: "option",
                        type: "array",
                        path: "/paymentOptions",
                        cheap: true,
                        view: "Card",
                        click: true,
                        permission: {
                            read: "alwaysTrue()"
                        },
                        plural: "s",
                        conditions: [`{type:'orderBy', params:['indexOfSequence']}`],
                        children: [
                            {
                                name: "name",
                                description: "支付名稱",
                                view: "Typography",
                                type: "string",
                                defaultValue: "悅Pay",
                                column: true
                            },
                            {
                                name: "image",
                                description: "圖片",
                                view: "img",
                                column: true,
                                type: "string",
                                imgPreview: false,
                                storageFolder: "payment/options",
                                fileMaximum: "5MB",
                                permission: {
                                    read: "alwaysTrue()",
                                    write: "isAdmin()"
                                }
                            },
                            {
                                name: "description",
                                description: "補充敘述",
                                view: "Typography",
                                ignoreI: true,
                                column: true,
                                type: "string"
                            },
                            {
                                name: "indexOfSequence",
                                column: true,
                                description: "順序",
                                type: "number",
                                defaultValue: 100
                            },
                            {
                                name: "idOfUnique",
                                column: true,
                                type: "string"
                            }
                        ]
                    }
                ]
            }
        },
        {
            path: "/epayFootprint/:author/:typeOfTab",
            name: "epayFootprint",
            disposablePage: true,
            loginOnlyPage: true,
            title: `訂單明細一覽`,
            description: `學習蝦皮Tab方式呈現['全部(all),已完成(completed)','待付款(pending)','已取消(canceled)','已退款(refund)'] 已退款可能有點難搞, 退款系列的問題很麻煩`,
            struct: {
                name: "epayFootprint",
                view: "div",
                type: "object",
                wrapView: "div",
                children: [
                    {
                        name: "order",
                        plural: "s",
                        type: "array",
                        view: "Card",
                        listEmptyTip: {
                            enable: true
                        },
                        children: [
                            {
                                name: "needAddress",
                                type: "boolean",
                                description: "發信時用來註記是否需要提供地址"
                            },
                            {
                                name: "areaOfTop",
                                view: "div",
                                needParam: true,
                                children: [
                                    {
                                        name: "sectionOfHead",
                                        view: "div",
                                        needParam: true,
                                        children: [
                                            {
                                                name: "stringOfOrderIdentity",
                                                view: "Typography",
                                                type: "string",
                                                incest: { view: false, attribute: true },
                                                defaultValue: "HIWQEHDHJFDIIEE",
                                                labelView: {
                                                    enable: true,
                                                    defaultValue: `編號：`
                                                },
                                                description: "order的document id"
                                            },
                                            {
                                                name: "copyId",
                                                needParam: true,
                                                view: "IconButton",
                                                size: "small",
                                                icon: "CopyAll"
                                            }
                                        ]
                                    },
                                    {
                                        name: "sectionOfTail",
                                        view: "div",
                                        needParam: true,
                                        children: [
                                            {
                                                name: "stateOfOrder",
                                                view: "Typography",
                                                type: "string",
                                                incest: { view: false, attribute: true },
                                                defaultValue: "已完成",
                                                description: "order的訂單狀態[已完成,代付款]等等"
                                            },
                                            {
                                                name: "optionOfPending",
                                                injectStyle: true,
                                                needParam: true,
                                                icon: "MoreVertRounded",
                                                view: "IconButton",
                                                alertMenu: {
                                                    items: [
                                                        {
                                                            name: "updateRemark",
                                                            label: "編輯備註內容",
                                                            icon: "ChangeCircle",
                                                            id: 0,
                                                            loginOnly: true,
                                                            notice: {
                                                                title: "確認是否更改",
                                                                content: "交易完成後，就無法再更改備註內容。"
                                                            }
                                                        },
                                                        {
                                                            name: "deleteOrder",
                                                            label: "刪除訂單",
                                                            icon: "CancelScheduleSend",
                                                            loginOnly: true,
                                                            id: 1,
                                                            notice: {
                                                                title: "執行刪除",
                                                                content: "是否確任刪除訂單？"
                                                            }
                                                        }
                                                    ]
                                                }
                                            },
                                            {
                                                name: "optionOfUnpaid",
                                                injectStyle: true,
                                                needParam: true,
                                                icon: "MoreVertRounded",
                                                view: "IconButton",
                                                alertMenu: {
                                                    items: [
                                                        {
                                                            name: "authorForcePaid",
                                                            label: "買家已付款",
                                                            icon: "PaidOutlined",
                                                            id: 0,
                                                            loginOnly: true,
                                                            notice: {
                                                                title: "確認客戶已匯款",
                                                                content: "請確認此筆訂單的金額已交予（轉帳）您，完成付款的訂單無法再更改。"
                                                            }
                                                        },
                                                        {
                                                            name: "authorCancelOrder",
                                                            label: "取消訂單",
                                                            icon: "CancelOutlined",
                                                            id: 1,
                                                            loginOnly: true,
                                                            notice: {
                                                                title: "取消此筆訂單",
                                                                content: "請確認將此筆訂單取消，取消後訂單將無法回復。"
                                                            }
                                                        }
                                                    ]
                                                }
                                            },
                                            {
                                                name: "optionOfTransport",
                                                injectStyle: true,
                                                needParam: true,
                                                icon: "MoreVertRounded",
                                                view: "IconButton",
                                                alertMenu: {
                                                    items: [
                                                        {
                                                            name: "authorFormed",
                                                            label: "商品已出貨",
                                                            icon: "RocketLaunchOutlined",
                                                            id: 0,
                                                            loginOnly: true,
                                                            alertDialog: {
                                                                notice: {
                                                                    title: "商品出貨通知",
                                                                    content: "請確認將此筆訂單完成物流安排，出貨後將無法再更改。"
                                                                }
                                                                // customView: "epayMethodOfPayment",
                                                                // needActionButtons: false
                                                            }
                                                        }
                                                    ]
                                                }
                                            }
                                        ]
                                    }
                                ]
                            },
                            {
                                name: "brief",
                                plural: "s",
                                type: "array",
                                view: "div",
                                children: [
                                    {
                                        name: "imageOfProductPhoto",
                                        view: "img",
                                        type: "string"
                                    },
                                    {
                                        name: "sectionOfDescription",
                                        view: "div",
                                        needParam: true,
                                        children: [
                                            {
                                                name: "nameOfProduct",
                                                view: "Typography",
                                                type: "string",
                                                description: "商品名稱",
                                                incest: { view: false, attribute: true },
                                                defaultValue: `最厲害的商品`,
                                                wrapView: "div"
                                            },
                                            {
                                                name: "specificOfProduct",
                                                view: "Typography",
                                                type: "string",
                                                description: "商品名稱",
                                                incest: { view: false, attribute: true },
                                                defaultValue: `規格:藍色-XL`
                                            },
                                            {
                                                name: "quantity",
                                                view: "Typography",
                                                type: "string",
                                                incest: { view: false, attribute: true },
                                                description: "商品的購買數量",
                                                defaultValue: `x1`
                                            },
                                            {
                                                name: "price",
                                                view: "Typography",
                                                type: "string",
                                                incest: { view: false, attribute: true },
                                                description: "單項商品的總價",
                                                defaultValue: `$100`
                                            }
                                        ]
                                    }
                                ]
                            },
                            {
                                name: `areaOfTotalPrice`,
                                view: `div`,
                                needParam: true,
                                children: [
                                    {
                                        name: "valueOfTotalPrice",
                                        type: "string",
                                        incest: { view: false, attribute: true },
                                        view: "Typography",
                                        labelView: {
                                            enable: true,
                                            defaultValue: `訂單金額：`
                                        },
                                        defaultValue: `$100`
                                    }
                                ]
                            },
                            {
                                name: `areaOfChoosePaymentType`,
                                view: `div`,
                                injectStyle: true,
                                onClick: true,
                                needParam: true,
                                children: [
                                    {
                                        name: "labelOfPaymentType",
                                        defaultValue: "選擇付費方式：",
                                        type: "string",
                                        l10n: true,
                                        incest: { view: false, attribute: true },
                                        view: "Typography"
                                    },
                                    {
                                        name: "sectionOfChooseType",
                                        view: "div",
                                        needParam: true,
                                        children: [
                                            {
                                                name: "valueOfPaymentType",
                                                defaultValue: "",
                                                type: "string",
                                                incest: { view: false, attribute: true },
                                                view: "Typography"
                                            },
                                            {
                                                name: "arrow",
                                                view: "IconButton",
                                                needParam: true,
                                                icon: "ChevronRight",
                                                size: "small",
                                                props: { fontSize: "small" },
                                                alertDialog: {
                                                    customView: "epayMethodOfPayment",
                                                    needActionButtons: false
                                                }
                                            }
                                        ]
                                    }
                                ]
                            },
                            {
                                name: "remark",
                                view: "TextField",
                                type: "string",
                                injectProps: true,
                                injectStyle: true,
                                description: `買家可以填寫的備註事項/聯絡方式`,
                                l10n: true,
                                props: {
                                    variant: "outlined",
                                    minRows: 2,
                                    multiline: true,
                                    fullWidth: true
                                },
                                labelView: {
                                    enable: true,
                                    defaultValue: `買家備註：`
                                }
                            },
                            {
                                name: `aoi`,
                                view: `div`,
                                needParam: true,
                                children: [
                                    {
                                        name: "name",
                                        type: "string",
                                        view: "Typography",
                                        defaultValue: "",
                                        incest: { view: false, attribute: true },
                                        description: `收件姓名`,
                                        labelView: {
                                            enable: true,
                                            defaultValue: `收件姓名：`
                                        }
                                    }
                                ]
                            },
                            {
                                name: `aop`,
                                view: `div`,
                                needParam: true,
                                children: [
                                    {
                                        name: "phoneNumber",
                                        type: "string",
                                        view: "Typography",
                                        defaultValue: "",
                                        incest: { view: false, attribute: true },
                                        description: `聯絡手機`,
                                        labelView: {
                                            enable: true,
                                            defaultValue: `聯絡手機：`
                                        }
                                    }
                                ]
                            },
                            {
                                name: `areaOfPaymentRule`,
                                view: `div`,
                                needParam: true,
                                children: [
                                    {
                                        name: "rule",
                                        type: "string",
                                        view: "Typography",
                                        defaultValue: "銀行轉帳",
                                        incest: { view: false, attribute: true },
                                        description: `付費方式-銀行轉帳or付費方式-超商代碼,ui擺在左上`,
                                        labelView: {
                                            enable: true,
                                            defaultValue: `付費方式：`
                                        }
                                    }
                                ]
                            },
                            {
                                name: `aoa`,
                                view: `div`,
                                injectStyle: true,
                                needParam: true,
                                children: [
                                    {
                                        name: "address",
                                        type: "string",
                                        view: "Typography",
                                        defaultValue: "",
                                        incest: { view: false, attribute: true },
                                        description: `收件地址`,
                                        labelView: {
                                            enable: true,
                                            defaultValue: `收件地址：`
                                        }
                                    }
                                ]
                            },
                            {
                                name: `areaOfTransport`,
                                view: `div`,
                                injectStyle: true,
                                needParam: true,
                                children: [
                                    {
                                        name: "transportBy",
                                        type: "string",
                                        view: "Typography",
                                        defaultValue: "",
                                        incest: { view: false, attribute: true },
                                        description: `寄送方式`,
                                        labelView: {
                                            enable: true,
                                            defaultValue: `寄送物流：`
                                        }
                                    }
                                ]
                            },
                            {
                                name: `areaOfCVS`,
                                view: `div`,
                                injectStyle: true,
                                needParam: true,
                                children: [
                                    {
                                        name: "pickUpCVS",
                                        type: "string",
                                        view: "Typography",
                                        defaultValue: "",
                                        incest: { view: false, attribute: true },
                                        description: `取貨店號`,
                                        labelView: {
                                            enable: true,
                                            defaultValue: `取貨店號：`
                                        }
                                    }
                                ]
                            },
                            {
                                name: `areaOfSerial`,
                                view: `div`,
                                injectStyle: true,
                                needParam: true,
                                children: [
                                    {
                                        name: "serialOfTransport",
                                        type: "string",
                                        view: "Typography",
                                        defaultValue: "",
                                        incest: { view: false, attribute: true },
                                        description: `物流編號`,
                                        labelView: {
                                            enable: true,
                                            defaultValue: `物流編號：`
                                        }
                                    }
                                ]
                            },
                            {
                                name: `areaOfPaymentDeadline`,
                                view: `div`,
                                injectStyle: true,
                                needParam: true,
                                children: [
                                    {
                                        name: "deadline",
                                        type: "string",
                                        view: "Typography",
                                        wrapView: "div",
                                        defaultValue: "2029/07/05 12:33",
                                        description: `付費的截止時間,ui擺在右上`,
                                        incest: { view: false, attribute: true },
                                        labelView: {
                                            enable: true,
                                            defaultValue: `截止時間：`
                                        }
                                    }
                                ]
                            },
                            {
                                name: `areaOfPaymentDetail`,
                                view: `div`,
                                injectStyle: true,
                                wrapView: "div",
                                needParam: true,
                                children: [
                                    {
                                        name: "domain",
                                        type: "string",
                                        view: "Typography",
                                        incest: { view: false, attribute: true },
                                        defaultValue: "國泰世華(013)",
                                        description: `分行||超商.例:國泰世華-013||超商付款`,
                                        labelView: {
                                            enable: true,
                                            defaultValue: `單位分行：`
                                        }
                                    },
                                    {
                                        name: "sectionOfCode",
                                        view: "div",
                                        needParam: true,
                                        children: [
                                            {
                                                name: "code",
                                                type: "string",
                                                view: "Typography",
                                                defaultValue: "AS231IJDOIA123SJDOIA",
                                                description: `CVS碼||或是轉帳代碼`,
                                                incest: { view: false, attribute: true },
                                                labelView: {
                                                    enable: true,
                                                    defaultValue: `單位代碼：`
                                                }
                                            },
                                            {
                                                name: "copy",
                                                needParam: true,
                                                view: "IconButton",
                                                size: "small",
                                                icon: "CopyAll",
                                                props: {
                                                    fontSize: "small"
                                                }
                                            }
                                        ]
                                    }
                                ]
                            },
                            {
                                name: `areaOfFunc`,
                                view: `div`,
                                needParam: true,
                                injectProps: true,
                                injectStyle: true,
                                children: [
                                    {
                                        name: `checkout`,
                                        view: `Button`,
                                        type: `string`,
                                        variant: "contained",
                                        incest: { view: false, attribute: true },
                                        defaultValue: `立即付款`
                                    }
                                ]
                            },
                            {
                                name: `areaOfPaymentFailure`,
                                view: `div`,
                                needParam: true,
                                injectStyle: true,
                                children: [
                                    {
                                        name: "reason",
                                        type: "string",
                                        view: "Typography",
                                        incest: { view: false, attribute: true },
                                        defaultValue: "你放到過期了啦!",
                                        description: `如果order已失效,必須寫出失效原因`,
                                        labelView: {
                                            enable: true,
                                            defaultValue: `失效原因：`
                                        }
                                    }
                                ]
                            },
                            {
                                name: "remarkOfAuthor",
                                view: "TextField",
                                type: "string",
                                injectProps: true,
                                injectWrapStyle: true,
                                description: `備註事項(課程/出貨)`,
                                l10n: true,
                                props: {
                                    variant: "outlined",
                                    minRows: 2,
                                    multiline: true,
                                    fullWidth: true
                                },
                                labelView: {
                                    enable: true,
                                    defaultValue: `賣家備註：`
                                }
                            },
                            {
                                name: `cvs`,
                                type: "arrayOfField",
                                description: `裡面是storeid,storeaddress,storename`
                            },
                            {
                                name: `typeOfPayment`,
                                type: "string",
                                description: `付費的渠道(cvs,atm,linepay,credit,webatm,)`
                            },
                            {
                                name: `processOfPayment`,
                                type: "string",
                                description: `cvs,credit,linepay,atm,ecpay等等的`
                            },
                            {
                                name: `timeOfPayment`,
                                type: "timestamp",
                                description: "消費者成功付費的時間"
                            },
                            {
                                name: "timeOfExpired",
                                type: "timestamp",
                                description: "如果非即時付款方式(ATM,CVS),就會有繳費期限的限制"
                            },
                            {
                                name: "timeOfCreate",
                                type: "timestamp",
                                description: "開創order訂單的時間"
                            },
                            {
                                name: "timeOfTransport",
                                type: "timestamp",
                                description: "訂單商品寄出的時間"
                            },
                            {
                                name: "isTransported",
                                type: "boolean",
                                defaultValue: false,
                                description: "商品是否寄出"
                            },
                            {
                                name: "timeOfCancel",
                                type: "timestamp",
                                description: "訂單被刪除的時間, 時間都是firestore去處理, 就能完美的解決locale問題, 不用去UTC+多少"
                            },
                            {
                                name: "typeOfTransport",
                                type: "number",
                                description: "物流方式的代碼(Config裡可以找到對應的l10)"
                            },
                            {
                                name: `stateOfPayment`,
                                type: `number`,
                                description: `"訂單狀態解釋 " +
                                "asking: 等待賣家允許付費(尚未設計); 1" 
                                "pending: 訂單已成立; 2" 
                                "waiting: 訂單已成立, 而且選擇了第三方平台, 等待付費(CVS,ATM); 3" 
                                "failure: 訂單已失效, 交易商品數量已atomic加回去; 4" 
                                "completed: 訂單已完成; 5" 
                                "invalid: 訂單已將數量加回賣家, 但要保留單號, 避免產生duplicated 交易單號(尚未設計)"`
                            },
                            {
                                name: "stateOfTransport",
                                type: "number",
                                description: "運輸狀態解釋" + "needless: 免出貨(課程類) 1" + "pending: 未出貨 2" + "sending: 已出貨 3" + "returning: 已退貨 4"
                            },
                            {
                                name: `raw`,
                                type: `objectOfEmpty`,
                                description: `放precise order`
                            },
                            {
                                name: "idOfUser",
                                type: "string",
                                description: "買家的UserId(Buyer)"
                            },
                            {
                                name: "idOfAuthor",
                                type: "string",
                                description: "賣家的id, 刪除訂單的權限僅有 idOfUser(可能無須登入) 和 idOfAuthor(seller)"
                            },
                            {
                                name: "anonymous",
                                type: "boolean",
                                defaultValue: false,
                                description: "未登入的user下單購買的標記，houseKeeping出任務時(未登入買家沒有當在當下完成交易時，刪除此筆訂單)"
                            },
                            {
                                name: "photoOfAuthor",
                                cheap: true,
                                plural: "s",
                                type: "array",
                                description: `用來放運單的照片們`,
                                children: [
                                    {
                                        name: "href",
                                        type: "string"
                                    }
                                ]
                            }
                        ]
                    },
                    {
                        name: "tab",
                        type: "array",
                        injectListStyle: true,
                        valueOfTabDefault: 0,
                        scrollable: true,
                        plural: "s",
                        l10n: true,
                        defaultValue: [
                            {
                                label: `全部`,
                                value: 1,
                                type: `all`,
                                description: `(買家)所有idOfUser=self的表單`
                            },
                            {
                                label: `待付款`,
                                value: 2,
                                type: `pending`,
                                description: `(買家)所有idOfUser=self && stateOfPayment=pending`
                            },
                            {
                                label: `已完成`,
                                value: 3,
                                type: `completed`,
                                description: `(買家)所有idOfUser=self && stateOfPayment=completed`
                            },
                            {
                                label: `已失效`,
                                value: 4,
                                type: `failure`,
                                description: `(買家)所有idOfUser=self && stateOfPayment=failure`
                            },
                            {
                                label: `待出貨`,
                                value: 5,
                                type: `processing`
                            },
                            {
                                label: `一覽表`,
                                value: 11,
                                type: `status`,
                                description: `(賣家)所有idOfAuthor的表單`
                            },
                            {
                                label: `未付款`,
                                value: 12,
                                type: `unpaid`,
                                description: `(賣家)沒有完成付款的訂單(idOfAuthor=self && stateOfPayment=pending)  備註：賣家可用...設為已付款 及 取消單號`
                            },
                            {
                                label: `未出貨`,
                                value: 13,
                                type: `unshipped`,
                                description: `(賣家)訂單內包含商品類 且 已完成付款(idOfAuthor=self && stateOfPayment=completed && stateOfTransport=pending)，未出貨：未付款就不會出現在未出貨`
                            },
                            {
                                label: `已成立`,
                                value: 14,
                                type: `succeed`,
                                description: `(賣家)課程類已完成付款 | 包含商品的訂單已完成出貨(idOfAuthor=self && stateOfPayment=completed && stateOfTransport=completed || needless) 已完成就不能取消，還沒做退款功能`
                            },
                            {
                                label: `已作廢`,
                                value: 15,
                                type: `cancelled`,
                                description: `(賣家)課程類已完成付款 | 包含商品的訂單已完成出貨(idOfAuthor=self && stateOfPayment=failure)`
                            }
                        ],
                        listView: "Tabs",
                        view: "Tab",
                        disableObservable: true
                    },
                    {
                        name: "transNotify",
                        type: "string",
                        view: "div",
                        click: true,
                        virtual: true,
                        alertDialog: {
                            title: "貨品寄出後，請輸入物流編號，方便後續追蹤",
                            globalOfRef: true,
                            strict: true,
                            textInput: {
                                value: "",
                                enable: true,
                                type: "string" /** email,phone,*/,
                                label: "包裹或收據上的物流編號" /** */
                            }
                        }
                    },
                    {
                        name: "payNow",
                        type: "objectOfEmpty",
                        view: "div",
                        virtual: true,
                        defaultValue: {
                            price: 0,
                            href: "",
                            title: "",
                            caution: ""
                        },
                        alertDialog: {
                            globalOfRef: true,
                            customView: "ireneQrcode",
                            needActionButtons: false,
                            presetObj: true,
                            fullWidth: true
                        }
                    }
                ]
            }
        },
        {
            path: "/anonymousXDeal/:id",
            name: "anonymousXDeal",
            disposablePage: true,
            loginOnlyPage: false,
            struct: {
                name: "epayAnonymousXDeal",
                view: "div",
                type: "object",
                wrapView: "div",
                children: [
                    {
                        name: "func",
                        view: "div",
                        needParam: true,
                        children: [
                            {
                                name: "toMain",
                                type: "string",
                                view: "Chip",
                                color: "primary",
                                variant: "outlined",
                                incest: { view: false, attribute: true },
                                defaultValue: `回到首頁`
                            },
                            {
                                name: "copyLink",
                                type: "string",
                                view: "Chip",
                                color: "error",
                                incest: { view: false, attribute: true },
                                defaultValue: `複製連結`
                            }
                        ]
                    },
                    {
                        ref: "epayFootprint",
                        imitate: true,
                        implementActions: true
                    },
                    {
                        name: "payNow",
                        type: "objectOfEmpty",
                        view: "div",
                        virtual: true,
                        defaultValue: {
                            price: 0,
                            href: "",
                            title: "",
                            caution: ""
                        },
                        alertDialog: {
                            globalOfRef: true,
                            customView: "ireneQrcode",
                            needActionButtons: false,
                            presetObj: true,
                            fullWidth: true
                        }
                    }
                ]
            }
        }
    ]
};

export default component;
