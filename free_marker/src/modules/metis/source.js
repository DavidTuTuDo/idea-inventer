const component = {
    name: "metis",
    path: "/metis-teach",
    disposablePage: true,
    title: "課程報名",
    struct: {
        name: `metis`,
        view: `div`,
        type: `object`,
        children: [
            {
                name: `clazz`,
                plural: "es",
                view: `Card`,
                column: true,
                type: "array",
                path: `classes`,
                permission: {
                    write: "alwaysTrue()",
                    read: "alwaysTrue()"
                },
                children: [
                    {
                        name: `classTime`,
                        plural: `s`,
                        type: `array`,
                        column: true,
                        cheap: true,
                        defaultValue: [{}],
                        children: [
                            {
                                name: "selectedDayOfWeek",
                                label: `上課時間`,
                                type: "number",
                                defaultValue: 1,
                                column: true
                            },
                            {
                                name: `startOfTime`,
                                type: `timestamp`,
                                label: "開始時間",
                                format: "hh:mm",
                                column: true
                            },
                            {
                                name: `endOfTime`,
                                view: `TimePicker`,
                                type: `timestamp`,
                                format: "hh:mm",
                                label: "結束時間",
                                column: true
                            }
                        ]
                    },
                    {
                        name: `head`,
                        view: `div`,
                        needParam: true,
                        children: [
                            {
                                name: `info`,
                                view: `div`,
                                needParam: true,
                                children: [
                                    {
                                        name: `imageOfHost`,
                                        type: `string`,
                                        view: `Avatar`,
                                        click: true,
                                        permission: {
                                            read: "alwaysTrue()",
                                            write: "alwaysTrue()"
                                        },
                                        storageFolder: "/photosOfTeacher",
                                        column: true,
                                        defaultValue: `images/default_avatar.png`,
                                        description: `老師美美的大頭照`,
                                        incest: { view: false, attribute: true }
                                    },
                                    {
                                        name: `nameOfHost`,
                                        type: `string`,
                                        column: true,
                                        view: `Typography`,
                                        defaultValue: `Ivy 卉昕`,
                                        incest: { view: false, attribute: true }
                                    }
                                ]
                            },
                            {
                                name: `desc`,
                                view: `div`,
                                needParam: true,
                                children: [
                                    {
                                        name: `experienceOfHost`,
                                        type: `string`,
                                        view: `Typography`,
                                        column: true,
                                        description: `老師的自我介紹`,
                                        defaultValue: `2024年INCA國際盃-冠軍\n14屆金指獎國際美業競賽-評審\nTNA美甲證照`,
                                        incest: { view: false, attribute: true }
                                    },
                                    {
                                        name: `gotoPortfolio`,
                                        type: `string`,
                                        view: `Chip`,
                                        wrapView: "div",
                                        variant: "outlined",
                                        color: "default",
                                        defaultValue: `作品集`,
                                        incest: { view: false, attribute: true }
                                    }
                                ]
                            }
                        ]
                    },
                    {
                        name: `second`,
                        view: `div`,
                        needParam: true,
                        children: [
                            {
                                name: `countsOfStudentCapacity`,
                                type: `number`,
                                column: true,
                                defaultValue: 0,
                                description: `課程人可容量學生人數`,
                                incest: { view: false, attribute: true }
                            },
                            {
                                name: `countsOfRegistered`,
                                type: `number`,
                                column: true,
                                defaultValue: 0,
                                description: `課程已報名人數`,
                                increment: {
                                    enable: true,
                                    delta: 1
                                },
                                incest: { view: false, attribute: true }
                            },
                            {
                                name: "startOfSpecificClass",
                                type: "timestamp",
                                size: "small",
                                column: true,
                                incest: { view: false, attribute: true }
                            },
                            {
                                name: "endOfSpecificClass",
                                type: "timestamp",
                                column: true,
                                incest: { view: false, attribute: true }
                            },
                            {
                                name: `nameOfClass`,
                                view: `Typography`,
                                type: "string",
                                column: true,
                                incest: { view: false, attribute: true },
                                defaultValue: `美甲初階培訓課程`,
                                labelView: {
                                    enable: true,
                                    defaultValue: `課程名稱：`
                                }
                            },
                            {
                                name: `feeOfClass`,
                                view: `Typography`,
                                type: `number`,
                                column: true,
                                incest: { view: false, attribute: true },
                                labelView: {
                                    enable: true,
                                    defaultValue: `課程費用：`
                                },
                                defaultValue: 100
                            },
                            {
                                name: `dateOfPeriod`,
                                view: `Typography`,
                                size: "small",
                                type: `string`,
                                variant: `standard`,
                                incest: { view: false, attribute: true },
                                labelView: {
                                    enable: true,
                                    defaultValue: `課程日期：`
                                },
                                defaultValue: `24/09/05 ~ /11/05`
                            },
                            {
                                name: `dateOfWeekAttend`,
                                view: `Typography`,
                                size: "small",
                                type: `string`,
                                variant: `standard`,
                                labelView: {
                                    enable: true,
                                    defaultValue: `上課時間：`
                                },
                                incest: { view: false, attribute: true },
                                defaultValue: `週三 週五 09:00-12:00`
                            },
                            {
                                name: `totalHoursOfClass`,
                                view: `Typography`,
                                size: "small",
                                type: `string`,
                                variant: `standard`,
                                labelView: {
                                    enable: true,
                                    defaultValue: `課總時數：`
                                },
                                incest: { view: false, attribute: true },
                                defaultValue: `60小時`
                            },
                            {
                                name: `stateOfRegistered`,
                                view: `Typography`,
                                size: "small",
                                type: `string`,
                                variant: `standard`,
                                incest: { view: false, attribute: true },
                                labelView: {
                                    enable: true,
                                    defaultValue: `課程人數：`
                                },
                                defaultValue: `課程人數：10人 (僅剩５位)`
                            },
                            {
                                name: `introduce`,
                                view: `Typography`,
                                type: `string`,
                                wrapView: "div",
                                incest: { view: false, attribute: true },
                                column: true,
                                description: `課程介紹`,
                                defaultValue: `課程內容：\n手部基礎保養\n基礎造型培訓(拋光、上色、凝膠)\n客人永續經營秘訣`
                            },
                            {
                                name: `func`,
                                view: `div`,
                                needParam: true,
                                children: [
                                    {
                                        name: `submit`,
                                        view: `Chip`,
                                        type: `string`,
                                        injectProps: true,
                                        icon: "SchoolRounded",
                                        incest: { view: false, attribute: true },
                                        color: `primary`,
                                        variant: `filled`,
                                        defaultValue: `立即報名`
                                    },
                                    {
                                        name: `more`,
                                        view: `Chip`,
                                        type: `string`,
                                        incest: { view: false, attribute: true },
                                        color: `warning`,
                                        iconOfDeleted: `ChevronRight`,
                                        variant: `filled`,
                                        defaultValue: `更多課程資訊`
                                    },
                                    {
                                        name: "share",
                                        view: "IconButton",
                                        needParam: true,
                                        icon: "ShareRounded"
                                    }
                                ]
                            }
                        ]
                    },
                    {
                        name: `selectedTypeOfClass`,
                        column: true,
                        type: "number",
                        defaultValue: 1,
                        description: "課程種類(付費/專案)"
                    },
                    {
                        name: `selectedStateOfClass`,
                        column: true,
                        type: "number",
                        defaultValue: 1,
                        description: "課程狀態(籌備/開放/上課中/結業)"
                    },
                    {
                        name: `linkOfPortfolio`,
                        column: true,
                        type: "string",
                        description: `老師的作品集`
                    }
                ]
            }
        ]
    },
    componentsOfExtra: [
        {
            name: "metisSetUp",
            path: "/metis-set-up",
            disposablePage: false,
            title: "課程編輯",
            struct: {
                name: `metisSetUp`,
                view: `div`,
                type: `object`,
                children: [
                    {
                        name: `areaOfEdit`,
                        view: `div`,
                        needParam: true,
                        children: [
                            {
                                name: `append`,
                                view: `Chip`,
                                type: "string",
                                variant: `filled`,
                                defaultValue: `新增`,
                                icon: "AddReactionRounded",
                                incest: { view: false, attribute: true }
                            },
                            {
                                name: `back`,
                                view: `Chip`,
                                type: "string",
                                variant: `filled`,
                                defaultValue: `返回`,
                                icon: "LogoutRounded",
                                incest: { view: false, attribute: true }
                            }
                        ]
                    },
                    {
                        name: `clazz`,
                        plural: `es`,
                        type: `array`,
                        view: `Paper`,
                        defaultValue: [{}, {}, {}],
                        column: true,
                        children: [
                            {
                                name: `id`,
                                type: `string`,
                                column: true,
                                trim: true
                            },
                            {
                                name: `head`,
                                view: `div`,
                                needParam: true,
                                children: [
                                    {
                                        name: `imageOfHost`,
                                        type: `string`,
                                        column: true,
                                        view: `Avatar`,
                                        click: true,
                                        incest: { view: false, attribute: true },
                                        description: `點擊後上傳`
                                    },
                                    {
                                        name: `nameOfHost`,
                                        type: `string`,
                                        column: true,
                                        view: `TextField`,
                                        variant: `outlined`,
                                        label: `老師名稱`,
                                        singleLine: true,
                                        incest: { view: false, attribute: true }
                                    }
                                ]
                            },
                            {
                                name: `experienceOfHost`,
                                type: `string`,
                                column: true,
                                label: `老師的經歷`,
                                view: `TextField`,
                                props: {
                                    multiline: true,
                                    minRows: 3,
                                    maxRows: 20
                                }
                            },
                            {
                                name: `linkOfPortfolio`,
                                type: `string`,
                                column: true,
                                view: `TextField`,
                                singleLine: true,
                                label: `作品集連結(IG/FB)`
                            },
                            {
                                name: `nameOfClass`,
                                view: `TextField`,
                                type: "string",
                                column: true,
                                label: `課程名稱`
                            },
                            {
                                name: `feeOfClass`,
                                view: `TextField`,
                                type: `number`,
                                label: `課程費用`,
                                column: true,
                                defaultValue: 100
                            },
                            {
                                name: "specificClass",
                                type: "timestamp",
                                column: true,
                                format: "YY/MM/DD",
                                view: "DateRangePicker",
                                label: ["開課日期", "結束日期"]
                            },
                            {
                                name: `classTime`,
                                plural: `s`,
                                type: `array`,
                                column: true,
                                cheap: true,
                                view: `div`,
                                defaultValue: [{}],
                                children: [
                                    {
                                        name: "dayOfWeek",
                                        label: `上課時間`,
                                        select: {
                                            type: "spinner",
                                            defaultValue: 1,
                                            values: [
                                                { label: "週一", value: "1" },
                                                { label: "週二", value: "2" },
                                                { label: "週三", value: "3" },
                                                { label: "週四", value: "4" },
                                                { label: "週五", value: "5" },
                                                { label: "週六", value: "6" },
                                                { label: "週日", value: "7" }
                                            ]
                                        }
                                    },
                                    {
                                        name: `startOfTime`,
                                        view: `TimePicker`,
                                        type: `timestamp`,
                                        label: "開始時間",
                                        format: "hh:mm",
                                        column: true
                                    },
                                    {
                                        name: `endOfTime`,
                                        view: `TimePicker`,
                                        type: `timestamp`,
                                        format: "hh:mm",
                                        label: "結束時間",
                                        column: true
                                    },
                                    {
                                        name: "extra",
                                        view: "IconButton",
                                        needParam: true,
                                        l10n: true,
                                        icon: "MoreVertRounded",
                                        alertMenu: {
                                            items: [
                                                {
                                                    name: "added",
                                                    label: "增加",
                                                    icon: "AddRounded",
                                                    id: 1
                                                },
                                                {
                                                    name: "deleted",
                                                    label: "刪除",
                                                    icon: "ClearRounded",
                                                    id: 2
                                                }
                                            ]
                                        }
                                    }
                                ]
                            },
                            {
                                name: `introduce`,
                                view: `TextField`,
                                type: `string`,
                                column: true,
                                label: `課程介紹`,
                                props: {
                                    variant: "outlined",
                                    minRows: 3,
                                    multiline: true,
                                    fullWidth: true
                                }
                            },
                            {
                                name: "info",
                                view: `div`,
                                needParam: true,
                                children: [
                                    {
                                        name: `countsOfStudentCapacity`,
                                        view: `TextField`,
                                        type: "number",
                                        column: true,
                                        incest: { view: false, attribute: true },
                                        label: `人數`,
                                        defaultValue: 1
                                    },
                                    {
                                        name: "typeOfClass",
                                        label: `課程總類`,
                                        column: true,
                                        incest: { view: false, attribute: true },

                                        select: {
                                            type: "spinner",
                                            defaultValue: 1,
                                            values: [
                                                { label: "付費課程", value: "1" },
                                                { label: "免費課程", value: "2" },
                                                { label: "專案課程", value: "3" }
                                            ]
                                        }
                                    },
                                    {
                                        name: "stateOfClass",
                                        label: `上課時間`,
                                        column: true,
                                        incest: { view: false, attribute: true },
                                        select: {
                                            type: "spinner",
                                            defaultValue: 1,
                                            values: [
                                                { label: "籌備中", value: "1" },
                                                { label: "開放報名", value: "2" },
                                                { label: "上課中", value: "3" },
                                                { label: "已結業", value: "4" }
                                            ]
                                        }
                                    }
                                ]
                            },
                            {
                                name: `areaOfFunc`,
                                view: `div`,
                                needParam: true,
                                children: [
                                    {
                                        name: `update`,
                                        view: `Chip`,
                                        type: "string",
                                        variant: `outlined`,
                                        incest: { view: false, attribute: true },
                                        color: `primary`,
                                        defaultValue: `更新`,
                                        icon: "RefreshRounded"
                                    },
                                    {
                                        name: `deleted`,
                                        view: `Chip`,
                                        type: "string",
                                        variant: `outlined`,
                                        incest: { view: false, attribute: true },
                                        color: `error`,
                                        defaultValue: `刪除`,
                                        icon: "DeleteOutlineRounded",
                                        alertDialog: {
                                            title: "執行刪除",
                                            content: "是否確任刪除本課程?"
                                        }
                                    }
                                ]
                            }
                        ]
                    }
                ]
            }
        },
        {
            name: `metisSignUp`,
            path: `/metis-sign-up/:idOfClass`,
            disposablePage: true,
            title: "報名課程-資料登入",
            struct: {
                name: `metisSignUp`,
                view: `div`,
                type: `object`,
                children: [
                    {
                        name: `student`,
                        view: `Paper`,
                        type: `array`,
                        disableInitFetch: true,
                        path: `studentsOfClass`,
                        defaultValue: [{}],
                        plural: "s",
                        permission: {
                            create: "alwaysTrue()",
                            read: "alwaysTrue()"
                        },
                        children: [
                            {
                                name: `idOfClass`,
                                type: `string`,
                                column: true
                            },
                            {
                                name: `main`,
                                view: `div`,
                                needParam: true,
                                children: [
                                    {
                                        name: "nameOfClass",
                                        type: "string",
                                        defaultValue: "進階美甲課程(老師：卉昕 Ivy)",
                                        view: "Typography",
                                        incest: { view: false, attribute: true },
                                        labelView: {
                                            enable: true,
                                            defaultValue: `課程名稱：`,
                                            labelIcon: {
                                                enable: true,
                                                view: "SchoolRounded"
                                            }
                                        }
                                    },
                                    {
                                        name: `datOfPeriodWithHours`,
                                        type: "string",
                                        incest: { view: false, attribute: true },
                                        view: "Typography",
                                        defaultValue: `2024/11/05 - 12/20(合計 60小時)`,
                                        // description: `例：2024/11/05 - 12/20(合計 60小時)`,
                                        labelView: {
                                            enable: true,
                                            defaultValue: `上課時間：`,
                                            labelIcon: {
                                                enable: true,
                                                view: "EditCalendarRounded"
                                            }
                                        }
                                    }
                                ]
                            },
                            {
                                name: `custom`,
                                view: `div`,
                                needParam: true,
                                children: [
                                    {
                                        name: "name",
                                        view: "TextField",
                                        type: "string",
                                        size: "small",
                                        incest: { view: false, attribute: true },
                                        column: true,
                                        variant: "outlined",
                                        labelView: {
                                            enable: true,
                                            defaultValue: `中文姓名：`
                                        },
                                        helperVisual: {
                                            enable: true,
                                            start: {
                                                type: "icon",
                                                content: "AccountCircleRounded"
                                            }
                                        }
                                    },
                                    {
                                        name: "textOfEmail",
                                        view: "TextField",
                                        type: "string",
                                        size: "small",
                                        incest: { view: false, attribute: true },
                                        column: true,
                                        variant: "outlined",
                                        labelView: {
                                            enable: true,
                                            defaultValue: `電子郵件：`
                                        },
                                        helperVisual: {
                                            enable: true,
                                            start: {
                                                type: "icon",
                                                content: "MailOutlineRounded"
                                            }
                                        }
                                    },
                                    {
                                        name: "contact",
                                        view: "TextField",
                                        type: "string",
                                        size: "small",
                                        incest: { view: false, attribute: true },
                                        column: true,
                                        variant: "outlined",
                                        labelView: {
                                            enable: true,
                                            defaultValue: `聯絡手機：`
                                        },
                                        helperVisual: {
                                            enable: true,
                                            start: {
                                                type: "icon",
                                                content: "LocalPhoneRounded"
                                            }
                                        }
                                    },
                                    {
                                        name: "birthday",
                                        type: "timestamp",
                                        view: "DatePicker",
                                        size: "small",
                                        incest: { view: false, attribute: true },
                                        column: true,
                                        variant: "outlined",
                                        labelView: {
                                            enable: true,
                                            defaultValue: `出生日期：`
                                        },
                                        format: `YY/MM/DD`,
                                        helperVisual: {
                                            enable: true,
                                            start: {
                                                type: "icon",
                                                content: "CakeRounded"
                                            }
                                        }
                                    },
                                    {
                                        name: "idOfNational",
                                        view: "TextField",
                                        type: "string",
                                        size: "small",
                                        incest: { view: false, attribute: true },
                                        column: true,
                                        variant: "outlined",
                                        labelView: {
                                            enable: true,
                                            defaultValue: `身分證號：`
                                        },
                                        helperVisual: {
                                            enable: true,
                                            start: {
                                                type: "icon",
                                                content: "FingerprintRounded"
                                            }
                                        }
                                    },
                                    {
                                        name: `young`,
                                        view: `div`,
                                        needParam: true,
                                        injectStyle: true,
                                        children: [
                                            {
                                                name: "nameOfGuardian",
                                                view: "TextField",
                                                type: "string",
                                                size: "small",
                                                incest: { view: false, attribute: true },
                                                column: true,
                                                variant: "outlined",
                                                labelView: {
                                                    enable: true,
                                                    defaultValue: `家長姓名：`
                                                },
                                                helperVisual: {
                                                    enable: true,
                                                    end: {
                                                        type: "icon",
                                                        content: "AccessibilityNew"
                                                    }
                                                }
                                            },
                                            {
                                                name: "contactOfGuardian",
                                                view: "TextField",
                                                type: "string",
                                                size: "small",
                                                incest: { view: false, attribute: true },
                                                column: true,
                                                variant: "outlined",
                                                labelView: {
                                                    enable: true,
                                                    defaultValue: `聯絡方式：`
                                                },
                                                helperVisual: {
                                                    enable: true,
                                                    end: {
                                                        type: "icon",
                                                        content: "LocalPhoneRounded"
                                                    }
                                                }
                                            },
                                            {
                                                name: `notice`,
                                                view: `Typography`,
                                                type: "string",
                                                wrapView: "div",
                                                incest: { view: false, attribute: true },
                                                defaultValue: `※未成年的學員，需要提供監護人相關資訊，僅應急情況才聯繫。`
                                            }
                                        ]
                                    },
                                    {
                                        name: `contract`,
                                        view: `Typography`,
                                        type: "string",
                                        wrapView: "div",
                                        injectWrapStyle: true,
                                        incest: { view: false, attribute: true },
                                        defaultValue: `本合約旨在規範學員與課程提供方之間的權利與義務，雙方同意遵守以下條款：\n\n1. 課程內容之保密性\n學員承諾不會在課程期間及課程結束後，將課程內容進行錄音、錄影或分享給任何第三方。此規定旨在保護課程的知識產權及其他學員的隱私。違反此條款者將承擔相應的法律責任，並可能被取消學籍。\n\n2. 退學與手續費\n若學員在課程開始前一週（課程開始日期的七天前）申請退學，課程提供方將扣除學費的10%作為手續費，剩餘學費將退還給學員。申請退學應以書面形式提出，並經課程提供方確認。\n\n3. 課程進行後之退費規定\n若學員在課程開始後，但未達課程1/2進度時申請退學，課程提供方將退還學費的一半。超過1/2進度後，學員無權申請退費。此條款旨在保障課程提供方的利益並促進學員全程參與。\n\n4. 請假與補課\n學員如需請假，應事先依課程提供方的規定提交請假申請。課程提供方將提供適當的補課安排，但補課形式與時間將依照課程提供方的決定進行。請假未依規定提出或無法補課者，課程進度將不予延長或補償。\n\n5. 參與率與證書發放\n學員的課程參與率需達到課程的1/2以上，方可獲得課程結業證書。若學員的參與率未達1/2，將無法領取結業證書，且課程提供方不予補發。此條款旨在確保學員積極參與並完成課程。\n\n6. 免學費學員之義務\n若學員享有免學費優惠，學員承諾在結業後一年內向莎夏美學購買總價值不低於5萬元的產品。未履行此義務者，將視為違反合約，需支付相應的賠償金。\n\n7. 表現良好者之獎勵\n在課程培訓期間表現優異者，課程提供方將提供協助展店之獎勵，並提供免費顧問服務，幫助學員實現事業目標。此獎勵旨在激勵學員努力學習並應用所學知識。\n\n8. 進階課程之優惠\n成功結業且續報進階課程的學員，可享有學費7折優惠。此優惠僅適用於下一個報名期，且不可與其他優惠同時使用。\n\n9. 未成年學員之家長同意若學員未滿18歲，須在報名前繳交家長或監護人簽署的同意書。此同意書將作為合約的附加文件，確保未成年學員的權益受到保護。\n\n10. 課程內容之公開分享\n課程提供方保留將課程內容用於公開社群媒體分享的權利，但將提前告知學員。學員有權選擇是否參與此類分享活動，且課程提供方將尊重學員的意願。`
                                    },
                                    {
                                        name: `agreeOfContract`,
                                        label: `已閱讀及同意合約內容`,
                                        view: `Checkbox`,
                                        type: `boolean`,
                                        defaultValue: false,
                                        incest: { view: false, attribute: true }
                                    },
                                    {
                                        name: `isCapacityFull`,
                                        type: "boolean",
                                        defaultValue: false,
                                        incest: { view: false, attribute: true }
                                    },
                                    {
                                        name: `func`,
                                        view: "div",
                                        needParam: true,
                                        children: [
                                            {
                                                name: `accept`,
                                                defaultValue: "確定報名",
                                                view: `Chip`,
                                                type: "string",
                                                injectProps: true,
                                                color: "primary",
                                                variant: "outlined",
                                                incest: { view: false, attribute: true },
                                                icon: "SchoolRounded",
                                                alertDialog: {
                                                    title: "確認送出",
                                                    content: "是否已確定報名資料皆無誤?"
                                                }
                                            },
                                            {
                                                name: `goBack`,
                                                defaultValue: "離開頁面",
                                                view: `Chip`,
                                                type: "string",
                                                color: "error",
                                                variant: "outlined",
                                                incest: { view: false, attribute: true },
                                                icon: "LogoutRounded",
                                                alertDialog: {
                                                    title: "確認離開",
                                                    content: "離開頁面後，填寫資料將不保留?"
                                                }
                                            }
                                        ]
                                    }
                                ]
                            }
                        ]
                    }
                ]
            }
        }
    ]
};

export default component;
