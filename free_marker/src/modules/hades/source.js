const component = {
    name: "hades",
    path: "/hades",
    struct: {
        name: "hades",
        type: "object",
        view: "div",
        injectView: true,
        children: [
            {
                name: "hade",
                plural: "s",
                type: "array",
                disableInitFetch: true,
                description: "紀錄交易的狀態，方便計算收入(當收入尚未付款時要用不一樣的顏色，完成收入是另外一個顏色)",
                path: "/users/:uid/hades",
                permission: {
                    read: "isSelf(uid)"
                },
                children: [
                    {
                        name: "inject",
                        type: "boolean",
                        defaultValue: false,
                        column: true
                    },
                    {
                        name: "id",
                        type: "string",
                        column: true,
                        description: "唯一碼，使用epay定義的uid，讓呼叫越來越如意"
                    },
                    {
                        name: "priceOfTotal",
                        type: `number`,
                        column: true,
                        description: "計算出的總價"
                    },
                    {
                        name: "feeOfTransport",
                        type: `number`,
                        column: true,
                        description: "運費"
                    },
                    {
                        name: "timeOfCreate",
                        type: "timestamp",
                        column: true,
                        description: "消費者下單的時間"
                    },
                    {
                        name: "timeOfPayment",
                        type: "timestamp",
                        column: true,
                        description: "消費者成功付費的時間"
                    },
                    {
                        name: "typeOfTransaction",
                        type: "number",
                        column: true,
                        description: `支付方式 TransactionMethod`
                    },
                    {
                        name: "paid",
                        type: "boolean",
                        defaultValue: false,
                        description: "確認這比交易是否已經付款，在functions處理"
                    },
                    {
                        name: "procedureOfPayment",
                        description: "付款方式例如:ECPAY།།Credit_CreditCard;第一個是TYPE_OF_THIRD_PARTY(EPAY,LINEPAY), 第二個是付款方式(CVS,ATM,CREDIT)",
                        column: true,
                        defaultValue: `unknown`,
                        type: "string"
                    }
                ]
            }
        ]
    }
};

export default component;
