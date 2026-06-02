const component = {
    name: "infoOfCopyRight",
    path: "/infoOfCopyRight",
    isCopyRightView: true,
    struct: {
        name: "infoOfCopyRight",
        path: "/infoOfCopyRight",
        permission: {
            read: "alwaysTrue()"
        },
        type: "object",
        view: "div",
        children: [
            {
                name: `upperGroup`,
                view: `div`,
                needParam: true,
                children: [
                    {
                        name: "leftArea",
                        view: "div",
                        needParam: true,
                        children: [
                            {
                                name: `contact`,
                                view: `Button`,
                                type: `string`,
                                injectStyle: true,
                                incest: { view: false, attribute: true },
                                defaultValue: `聯絡YUEH`,
                                alertDialog: {
                                    customView: "infoOfCopyRightContact",
                                    needActionButtons: false,
                                    fullWidth: true
                                }
                            }
                        ]
                    },
                    {
                        name: "rightArea",
                        view: "div",
                        needParam: true,
                        children: [
                            {
                                name: "privilege",
                                needParam: true,
                                view: "div",
                                children: [
                                    {
                                        name: `refundNTurnPolicy`,
                                        view: `Button`,
                                        type: `string`,
                                        injectStyle: true,
                                        incest: { view: false, attribute: true },
                                        defaultValue: `退換貨政策`,
                                        alertDialog: {
                                            customView: "infoOfRefundNTurnPolicy",
                                            fullWidth: true,
                                            needActionButtons: false
                                        }
                                    },
                                    {
                                        name: `separator00`,
                                        view: `Typography`,
                                        type: `string`,
                                        incest: { view: false, attribute: true },
                                        defaultValue: `|`
                                    },
                                    {
                                        name: `usageRules`,
                                        view: `Button`,
                                        type: `string`,
                                        incest: { view: false, attribute: true },
                                        defaultValue: `網站使用條款`,
                                        alertDialog: {
                                            customView: "infoOfCopyRightUsages",
                                            fullWidth: true,
                                            needActionButtons: false
                                        }
                                    },
                                    {
                                        name: `separator01`,
                                        view: `Typography`,
                                        type: `string`,
                                        incest: { view: false, attribute: true },
                                        defaultValue: `|`
                                    },
                                    {
                                        name: `privacy`,
                                        view: `Button`,
                                        type: `string`,
                                        incest: { view: false, attribute: true },
                                        defaultValue: `隱私權政策`,
                                        alertDialog: {
                                            customView: "infoOfCopyRightPrivacy",
                                            fullWidth: true,
                                            needActionButtons: false
                                        }
                                    },
                                    {
                                        name: `separator02`,
                                        view: `Typography`,
                                        type: `string`,
                                        incest: { view: false, attribute: true },
                                        defaultValue: `|`
                                    }
                                ]
                            },
                            {
                                name: `responsibilityOff`,
                                view: `Button`,
                                type: `string`,
                                defaultValue: `免責聲明`,
                                incest: { view: false, attribute: true },
                                alertDialog: {
                                    enableCancel: false,
                                    title: `免責聲明`,
                                    content: `當您成為本站的用戶後，您已詳細讀明確瞭解本『免責聲明』並同意，屬下列情況發生時本網站毋負任何責任: \n\n一、您使用本站服務之險會由您個人承。用戶同意使用「本網站」各項服系基用戶的個人意願,並同意自負任何風險，包括因為自「本網站」下載資料或圖片，或自「本網站」服務中得之資料導致發生任何資源流失等結果。\n\n二、「本網站」就各項服務，不負任何明示或默示之擔保責任。「本網站」不保證各項服務之穩定、安全、無誤、不中斷;用戶明示承擔使用本服務之所有風險及可能發生之任何損害。\n\n三、用戶在「本網站」寫物件资訊個人資料、上傳圖片等行為，純用戶個人行為，「本網站」對其內容之真實性或完整性不負有任何責任。\n\n四、任何由於電腦病毒侵入或發作、因政府管制而造成的暫時性關閉等影響網路正常經營之不可抗力而造成的資料毀損、丟失、被盜用或被竄改等與「本網站」無關。\n\n五、對於用戶透過「本網站」刊登或發布虛假、違法資訊、侵害他人權益及欺騙、敲詐行為者，純屬用戶個人行為「本網站」對因此而產生的一切糾紛不負任何責任！特此聲明！`
                                }
                            },
                            {
                                name: `separator`,
                                view: `Typography`,
                                type: `string`,
                                incest: { view: false, attribute: true },
                                defaultValue: `|`
                            },
                            {
                                name: `cprt`,
                                view: `Button`,
                                type: `string`,
                                injectStyle: true,
                                incest: { view: false, attribute: true },
                                defaultValue: `© 2026`
                            }
                        ]
                    }
                ]
            },
            {
                name: `groupOfSocialMedia`,
                view: `div`,
                needParam: true,
                children: [
                    {
                        name: `fbO`,
                        view: `CustomImageButton`,
                        defaultValue: `images/facebook.png`,
                        incest: { view: false, attribute: true },
                        injectStyle: true
                    },
                    {
                        name: `igO`,
                        view: `CustomImageButton`,
                        defaultValue: `images/instagram.png`,
                        incest: { view: false, attribute: true },
                        injectStyle: true
                    },
                    {
                        name: `lineO`,
                        view: `CustomImageButton`,
                        defaultValue: `images/line.png`,
                        incest: { view: false, attribute: true },
                        injectStyle: true
                    }
                ]
            },
            {
                name: `col`,
                view: `div`,
                needParam: true,
                injectStyle: true,
                children: [
                    {
                        name: "companyO",
                        view: "Typography",
                        type: "string",
                        // defaultValue: `康新生物科技有限公司`,
                        incest: { view: false, attribute: true },
                        injectStyle: true
                    },
                    {
                        name: "addressO",
                        view: "Typography",
                        type: "string",
                        // defaultValue: `高雄市三民區大昌二路121之8號6樓之2`,
                        labelView: {
                            enable: true,
                            defaultValue: `地址：`
                        },
                        incest: { view: false, attribute: true },
                        injectWrapStyle: true
                    },
                    {
                        name: "phoneO",
                        view: "Typography",
                        type: "string",
                        // defaultValue: `0982-763-479`,
                        labelView: {
                            enable: true,
                            defaultValue: `電話：`
                        },
                        incest: { view: false, attribute: true },
                        injectWrapStyle: true
                    },
                    {
                        name: "unifiedB",
                        view: "Typography",
                        type: "string",
                        // defaultValue: "60791066",
                        labelView: {
                            enable: true,
                            defaultValue: `統編：`
                        },
                        incest: { view: false, attribute: true },
                        injectWrapStyle: true
                    }
                ]
            },
            {
                name: `ig`,
                type: `string`,
                column: true,
                description: `社群媒體`
            },
            {
                name: `fb`,
                type: `string`,
                column: true,
                description: `社群媒體`
            },
            {
                name: `line`,
                type: `string`,
                column: true,
                description: `社群媒體`
            },
            {
                name: `tiktok`,
                type: `string`,
                column: true,
                description: `社群媒體`
            },
            {
                name: "ready",
                type: "boolean",
                boolValue: false,
                description: "如果globalPerspective準備好了再改為true"
            }
        ]
    },
    componentsOfExtra: [
        {
            path: "/rule/privacy",
            name: "infoOfCopyRightPrivacy",
            description: "隱私權政策",
            struct: {
                name: "infoOfCopyRightPrivacy",
                wrapView: "Paper",
                view: "div",
                type: "object",
                children: [
                    {
                        name: "main",
                        view: "div",
                        needParam: true,
                        children: [
                            {
                                name: "title",
                                type: "string",
                                view: "Typography",
                                defaultValue: "隱私權政策",
                                l10n: true,
                                incest: { view: false, attribute: true }
                            },
                            {
                                name: "separator",
                                view: "div"
                            },
                            {
                                name: "content",
                                type: "string",
                                view: "Typography",
                                l10n: true,
                                incest: { view: false, attribute: true },
                                defaultValue: `本公司十分重視您的隱私權保護，將依個人資料保護法及本隱私權政策蒐集、處理及利用您的個人資料，並提供您對個人資料權利之行使與保護。若您不同意本隱私權政策之全部或部份者，請您停止使用本網站服務。\n\n1.\t本隱私權政策適用之範圍\n請您在使用本網站服務前，確認您已審閱並同意本隱私權政策所列全部條款，若您不同意全部或部份者，則請勿使用本網站服務。\n本隱私權政策僅適用於本網站對您個人資料所為蒐集、處理與利用，不及於其他非本公司所有或控制之其他公司或個人。您可能經由本網站連結至第三人所經營之網站，各該網站所為之個人資料蒐集係依其網站之隱私權政策規定處理，與本公司無涉。\n\n2.\t個人資料保護法應告知事項\n（1）\t蒐集機關名稱：明悅科技\n（2）\t蒐集目的：提供本公司相關服務、行銷、客戶管理、會員管理及其他與第三人合作之行銷推廣活動\n（3）\t個人資料類別：識別類（姓名、地址、聯絡電話、電子郵件信箱）、特徵類（年齡、性別、出生年月日等）、社會情況類（興趣、休閒、生活格調、消費模式等）、其他（往來電子郵件、網站留言、系統自動紀錄之軌跡資訊等）。\n（4）\t個人資料利用期間：本網站會員有效期間及終止後六個月；若非會員則於該蒐集個人資料之目的消失後六個月。\n（5）\t個人資料利用地區：本公司執行業務及伺服器主機所在地，目前為台灣地區。\n（6）\t個人資料利用對象：本公司及本公司委外之協力廠商（例如：提供物流、金流或活動贈品、展示品之廠商）；如為本公司與其他廠商共同蒐集者，將於該共同蒐集之活動中載明。\n(7)\t個人資料利用方式：依蒐集目的範圍及本隱私權政策進行利用。\n（8）\t行使個人資料權利方式：依個人資料保護法第3條規定，您就您的個人資料享有查詢或請求閱覽、請求製給複製本、請求補充或更正、請求停止蒐集、處理或利用、請求刪除之權利。您可運用社群聊天室行使上開權利，本公司將於收悉您的請求後，儘速處理。\n（9）\t個人資料選填說明：若本公司於蒐集個人資料時，相關網頁或文件載明為選填者，僅為提供您使用本網站更佳體驗，不影響您使用本網站之權益。\n\n3.\t個人資料蒐集、處理及利用說明\n本公司透過Facebook或類似社群服務系統，於取得您的同意後，將部份本網站的資訊發布於您的社群活動資訊頁面，若您不同意該等訊息之發布，請您勿點選同意鍵，或於事後透過各該社群服務之會員機制移除該等資訊或拒絕本網站繼續發布相關訊息。若有任何問題，仍可與本公司聯絡，本公司將協助您確認、處理相關問題。\n除依法應提供予司法、檢調機關、相關主管機關，或與本公司協力廠商為執行相關活動必要範圍之利用外，本公司將不會任意將您的個人資料提供予第三人。\n當本公司或本網站被其他第三者購併或收購資產，導致經營權轉換時，本公司會於事前將相關細節公告於本網站，且本公司所擁有之全部或部分使用者資訊亦可能在經營權轉換的狀況下移轉給第三人。\n\n4.\tCookie技術\n為便於日後辨識，當您使用本網站服務時，本公司可能會在您的電腦上設定與存取Cookie。\n您可以透過設定您的個人電腦或上網設備，決定是否允許Cookie技術的使用，若您關閉Cookie時，可能會造成您使用本網站服務時之不便利或部分功能限制。\n\n5.\t保密與安全性\n本公司之員工，僅於其為您提供產品或服務之需求範圍內，對於您的個人資料得為有限之接觸。\n為了保護您的帳戶及個人資料的安全，請您不要任意將個人帳號、密碼或驗證碼提供予第三人或允許第三人以您的個人資料申請帳號、密碼或驗證碼，否則，相關責任由您自行負擔。若您的帳號、密碼或驗證碼有外洩之虞，請您立即更改密碼，或通知本公司暫停該帳號（本公司可能會要求核對您的個人資料）。\n網際網路並不是一個安全的資訊傳輸環境，請您在使用本網站時，避免將敏感的個人資料提供予他人或在網站上公開揭露。\n\n6.\t未成年人保護\n本網站並非特別為未成年人/兒童設計，未成年人使用本網站時，若同意本網站蒐集、利用其個人資訊時，應在法定代理人或監護人之陪同下為之。法定代理人或監護人得隨時請求本公司停止特定帳號及其相關之個人資料之蒐集、處理及利用行為。\n\n7.\t隱私權政策之修改\n隱私權政策如經修改，本網站將以您所提供之電子郵件或簡訊通知您相關之重大變更，並於本網站公告。若您不同意該等變更或修改，請停止繼續使用本網站服務，並依本隱私權政策規定通知本公司停止蒐集、處理及利用您的個人資料。\n`
                            }
                        ]
                    }
                ]
            }
        },
        {
            path: "rule/trade/policy",
            name: "infoOfRefundNTurnPolicy",
            description: "退換貨政策",
            struct: {
                name: "infoOfRefundNTurnPolicy",
                wrapView: "Paper",
                view: "div",
                type: "object",
                children: [
                    {
                        name: "main",
                        view: "div",
                        needParam: true,
                        children: [
                            {
                                name: "title",
                                type: "string",
                                view: "Typography",
                                defaultValue: "退換貨政策",
                                l10n: true,
                                incest: { view: false, attribute: true }
                            },
                            {
                                name: "separator",
                                view: "div"
                            },
                            {
                                name: "content",
                                type: "string",
                                view: "Typography",
                                l10n: true,
                                incest: { view: false, attribute: true },
                                defaultValue: `(一)關於退貨\n1.依據「通訊交易解除權合理例外情事適用準則」第2條第一項：「易於腐敗、保存期限較短或解約時即將逾期」之商品，屬於消費者保護法第19條第一項但書所稱合理例外情事。自105年1月1日起，生鮮食品不適用於消費者保護法第19條，並不享有7天鑑賞期。\n基於重視客戶需求與服務品質，若商品真有不符合您的期許，有退/換貨需求時，請保持商品本體、贈品、內外包裝、發票及所有附隨文件或資料的完整性，切勿有任何缺漏或毀損，否則恕不接受退貨申請。\n2.外包裝及其內容物、贈品等均屬於商品的一部分，申請退貨者，本公司將依照商品於退貨時之不完整程度(遺失、毀損或缺件等)，就商品價金之範圍內扣除回復原狀費用後，返還剩餘價金與消費者。\n3.如商品有瑕疵，運輸過程造成貨品解凍或毀損、貨品品項錯誤，請於2小時內拍照存證並立即與客服聯繫，以便安排後續退換貨處理。\n4.由於本賣場所銷售的商品為新鮮冷凍食材，一經拆封即無法回復原狀的商品，在您還不確定是否要保留商品以前，請勿拆封。\n5.建議您使用原外包裝（紙箱或包裝袋）將商品包好，切勿在原廠包裝或外盒上為任何書寫，以免造成損毀，影響您的退貨權益。\n6.若需加退商品請自行負擔寄送運費，由於本站銷售商品包含冷凍食材，為避免爭議發生，請確實驗收後再進行退貨。\n\n(二)無法退換貨說明\n1.因個人口感或料理方式的問題。\n2.未附上原包裝盒含外包裝或包裝不完整及破損無法辨識之商品及發票。\n3.因特別情況已註明無法退換貨之商品。\n4.辦理退貨、換貨時，請事先告知，若消費者未通知，而自行將商品寄回者，本公司將不予接受，並立即將商品寄回期間所產生的運費消費者需自行負擔。`
                            }
                        ]
                    }
                ]
            }
        },
        {
            path: "/rule/usages",
            name: "infoOfCopyRightUsages",
            description: "網站使用條款",
            struct: {
                name: "infoOfCopyRightUsages",
                wrapView: "Paper",
                view: "div",
                type: "object",
                children: [
                    {
                        name: "main",
                        view: "div",
                        needParam: true,
                        children: [
                            {
                                name: "title",
                                type: "string",
                                view: "Typography",
                                defaultValue: "網站使用條款",
                                l10n: true,
                                incest: { view: false, attribute: true }
                            },
                            {
                                name: "separator",
                                view: "div"
                            },
                            {
                                name: "content",
                                type: "string",
                                view: "Typography",
                                l10n: true,
                                incest: { view: false, attribute: true },
                                defaultValue: `本平台使用條款之最新內容，將公布於本平台首頁或註冊頁連結，您於每次進行購物前，均可詳細閱讀，以維護您的權益。您於任何修改或變更之後繼續使用本平台服務，將視為您已經閱讀、瞭解並同意接受相關修改及變更。如您不同意本平台使用條款之修改或變更，請停止使用本平台相關服務。\n若您尚未滿十八歲，請您在父、母或監護人的陪同下，詳閱本平台使用條款並同意後，才進行相關購物流程。您及法定代理人或監護人均同意後續在本平台之購物行為，屬於日常生活所必須，並擔保已取得法定代理人或監護人之同意。\n\n【帳號或驗證碼】\n一、\t本平台為保障交易安全，將以您申請所填寫的手機號碼作為帳號，並由本平台發出的驗證碼，作為個人登入辨識使用。\n二、\t您同意就您的帳號、密碼或驗證碼善盡保管與保密之責任，包含但不限於：不洩漏帳戶、密碼或驗證碼予第三人、不與他人共用帳號、密碼或驗證碼、適時登出本平台等。除經證明係第三人違法使用之情形，您須為利用您所設定之正確帳號登入之使用行為負全部責任，不得任意否認交易。\n三、\t您聲明並保證您所填寫之基本資料為您正確且完整的資料，不得使用他人資料，如有違反前開保證，本公司有權暫停或終止您的帳號，並拒絕您使用本公司的服務。\n四、\t您的帳號若有被冒用、盜用之情形，應立即通知本公司，以避免損害擴大。本公司將協助暫停該帳號相關交易及後續利用，並於釐清帳號使用問題後，依您的請求重新設定開通使用。\n\n【個人資料保護】\n本公司於您每次交易或參加活動時，為提供本公司相關服務及行銷之目的，蒐集、處理及利用您的個人資料。有關個人資料相關應告知事項，請參閱隱私權保護政策。\n您同意本公司得不定期發送商品訊息至您的電子郵件位址。若您欲訂閱、停止訂閱或修改相關訂閱設定，您可向本平台上所記載的客服聯絡方式提出訂閱或取消。\n本公司將遵守個人資料保護相關法令的規定，除依本平台使用條款、隱私權政策或法律規定外，不會違法利用您的個人資料。在下列的情況下，本公司有可能會提供您的個人資料給相關機關，或主張其權利受侵害並提示司法機關正式文件之第三人：\n一、\t依法令或受檢警調、司法機關或其他有權機關基於法定程序之要求。\n二、\t在緊急情況下為維護其他客戶或是第三人之合法權益。\n三、\t為維護本平台的正常運作；\n四、\t為提供本公司相關服務產生的金流、物流或其他協力廠商或合作廠商必要資訊。\n五、\t使用者有任何違反政府法令或本平台使用條款之情形。\n本平台可能因廣告或其他合作促銷活動而包含其他平台之連結，您點選該等連結至其他平台，即不適用本平台使用條款及隱私權政策之規範。您須自行判斷各該平台相關條款對您的權益保障是否足夠，再決定是否使用該平台服務。\n\n【通知方式】\n您同意您與本公司間有關本平台使用或購物所生之交易，以電子郵件、推播通知、簡訊為表示方式。本公司得以電子郵件、推播通知、簡訊向您為意思表示之通知，您亦得透過本平台向本公司為意思表示之通知。\n\n【交易注意事項】\n本平台所提供之商品數量有限，請您於挑選後儘速完成訂購程序，放入購物車不代表您已完成訂購，若有其他使用者在您完成訂購程序前已經完成訂購程序，系統會通知您該筆商品已售畢，請您自購物車移除。\n您得依據本平台所提供的確認商品數量及價格機制進行下單。本公司對您的下單內容，除於下單後2工作日內附正當理由為拒絕外，為接受下單。但您已付款者，除法律另有規定外，視為交易成立。\n本平台得就特定商品訂定個別消費者每次訂購的數量上限。逾越該數量上限進行下單或同一消費者以複數帳號重覆、多次下單時，本平台僅負對單一消費者依該數量上限出貨之責任。\n本平台商品之運送依您訂購時選擇及指定之方式為之，商品之定價不含運費。惟若您符合一定活動優惠條件時，將依您選擇之商品運送方式，由本公司負擔運費。若您因部分商品退貨致不符合運費優惠條件時，本公司將自您解約退款之金額中收取該筆訂單之原始運送費用（運送費用依下單時平台公告為準）。\n您得依消費者保護法第19條規定於貨到後7日之鑑賞期間內，行使解除契約的權利。請注意：鑑賞期非試用期，僅評估您是否購買該商品之用，若退回商品已非全新完整狀態（包含商品原包裝），可能會影響您解約退款的權利。\n\n【智慧財產權】\n本平台所有內容，均屬本公司或相關權利人依法擁有智慧財產權之客體，受著作權法、商標法、專利法、營業秘密法及公平交易法之保護，非經本公司或權利人事先許可或授權，不得任意使用，以免涉侵權或違法之責任。\n\n【責任限制】\n您同意因使用本平台或於本平台購物所生之糾紛，除法律另有強制規定者外，以您當次使用或購物所實際支付予本公司之費用之3倍，為賠償責任之上限。您因違反本平台使用條款或其他違約事件所生對本公司之賠償責任，亦同。\n\n【服務中止及免責聲明】\n本公司將以符合目前一般可合理期待安全性之方式及技術，維護本平台的正常運作。下列情形本公司有權暫停提供本平台服務的全部或部分，且不負事先通知您的義務，本公司對因而產生任何直接或間接損害，均不負任何賠償或補償的義務：\n一、\t對本平台相關軟硬體設備進行搬遷、更換、升級、保養或維修；\n二、\t天災或其他不可抗力因素所導致的服務停止或中斷；\n三、\t因電信或網站公司服務中斷或其他不可歸責於本公司事由所致的服務停止或中斷；\n四、\t本平台遭外力影響致資訊顯示不正確、或遭偽造、竄改、刪除或擷取，或致系統中斷或不能正常運作；\n五、\t使用者有違反本平台使用條款或法令之情形而對該使用者暫停或終止服務；\n六、\t其他本公司認為有需要暫停或終止服務之情形。\n本公司針對可預知的軟硬體維護計畫，有可能導致網站暫停或終止服務時，將盡可能地於該狀況發生前，以適當方式於本平台公告。\n\n【違約處理】\n為維護本平台全體使用者之權益，若您有下列情形之一者，本公司得暫停或終止您的購物資格或拒絕您使用本平台全部或部份服務：\n一、\t提供錯誤或不實資料進行登錄；\n二、\t未經本人許可而有盜刷信用卡或其他盜用金融帳號情形；\n三、\t已出貨包裹因個人因素而退件，或超過本公司所規範未取次數之情形\n（1） 選用超商取貨付款，未於通知期限內至指定門市取件\n（2） 選用宅配貨到付款，物流公司配送時，無人簽收或拒收包裹\n四、\t經本公司認定因個人因素進行經常性退貨等行為；\n五、\t對本公司客服部門為騷擾或不當言行；\n六、\t其他違反本平台使用條款或違反法律規定、未遵循雙方約定、惡意濫用服務權益之客戶。\n您同意本公司依本平台使用條款暫停或終止您的購物資格，或拒絕您使用本平台全部或部份服務時，均無須得到您的同意，且本公司對您或任何第三人均不負任何義務或責任。\n\n【本同意書效力、準據法與管轄法院】\n本平台使用條款任何條款的全部或一部份無效時，並不影響其他約定的效力。您與本公司的權利義務關係，應依本平台使用條款及相關適用的本平台公告或規範定之。若有發生任何爭議，您可以向本平台上所記載的客服聯絡方式提出申訴或反應，雙方均應秉持最大誠意，依誠實信用、平等互惠原則協商解決之。若仍未能協商解決，除法律另有規定者外，雙方同意以台灣桃園地方法院為第一審管轄法院。\n本同意書若有未盡之處，依中華民國法律解釋、補充及辦理。`
                            }
                        ]
                    }
                ]
            }
        },
        {
            path: "/infoOfCopyRightContact",
            name: "infoOfCopyRightContact",
            title: `聯絡方式-明悅`,
            description: "用來做聯絡方式的頁面",
            struct: {
                name: "infoOfCopyRightContact",
                view: "Card",
                type: "object",
                wrapView: "div",
                ruleOfOuter: "end",
                path: "/infoOfCopyRightContact",
                permission: {
                    read: "alwaysTrue()"
                },
                children: [
                    {
                        name: `upperArea`,
                        view: `div`,
                        needParam: true,
                        children: [
                            {
                                name: `contact`,
                                type: `string`,
                                view: `Typography`,
                                wrapView: `div`,
                                l10n: true,
                                incest: { view: false, attribute: true },
                                defaultValue: `聯絡「明悅」`
                            },
                            {
                                name: `groupOfDetail`,
                                view: `div`,
                                needParam: true,
                                children: [
                                    {
                                        name: "phoneO",
                                        view: "Typography",
                                        type: "string",
                                        l10n: true,
                                        incest: { view: false, attribute: true },
                                        defaultValue: "0982-763-479",
                                        labelView: {
                                            enable: true,
                                            defaultValue: `：`,
                                            labelIcon: {
                                                enable: true,
                                                view: "PhoneOutlined"
                                            }
                                        },
                                        description: "聯絡手機"
                                    },
                                    {
                                        name: "emailO",
                                        view: "Typography",
                                        type: "string",
                                        l10n: true,
                                        incest: { view: false, attribute: true },
                                        defaultValue: "freshingmoon0725@gmail.com",
                                        labelView: {
                                            enable: true,
                                            defaultValue: `：`,
                                            labelIcon: {
                                                enable: true,
                                                view: "MailOutlined"
                                            }
                                        },
                                        description: "聯絡Email"
                                    }
                                ]
                            },
                            {
                                name: `groupOfSocialMedia`,
                                view: `div`,
                                needParam: true,
                                children: [
                                    {
                                        name: `fbO`,
                                        view: `CustomImageButton`,
                                        incest: { view: false, attribute: true },
                                        defaultValue: `images/facebook.png`,
                                        injectStyle: true
                                    },
                                    {
                                        name: `igO`,
                                        view: `CustomImageButton`,
                                        defaultValue: `images/instagram.png`,
                                        incest: { view: false, attribute: true },
                                        injectStyle: true
                                    },
                                    {
                                        name: `lineO`,
                                        view: `CustomImageButton`,
                                        defaultValue: `images/line.png`,
                                        incest: { view: false, attribute: true },
                                        injectStyle: true
                                    }
                                ]
                            }
                        ]
                    },
                    {
                        name: `lowerArea`,
                        view: "div",
                        needParam: true,
                        children: [
                            {
                                name: `introduce`,
                                type: `string`,
                                view: `Typography`,
                                wrapView: `div`,
                                l10n: true,
                                incest: { view: false, attribute: true },
                                defaultValue: `關於「明悅」`
                            },
                            {
                                name: "details",
                                l10n: true,
                                view: "Typography",
                                type: "string",
                                incest: { view: false, attribute: true },
                                defaultValue: "專注在街頭表演和工程開發。\n「坦蕩蕩」、「有一說一」、「負責到底」\n合作請講明預算、時間、地點。"
                            }
                        ]
                    },
                    {
                        name: `portfolio`,
                        type: `string`,
                        view: `Typography`,
                        wrapView: `div`,
                        wrapClick: true,
                        l10n: true,
                        defaultValue: `「明悅」作品集`,
                        alertDialog: {
                            customView: "infoOfCopyRightContent",
                            needActionButtons: false,
                            fullWidth: true
                        }
                    },
                    {
                        name: `phone`,
                        type: `string`,
                        column: true,
                        description: `手機`
                    },
                    {
                        name: `email`,
                        type: `string`,
                        column: true,
                        description: `電子郵件`
                    },
                    {
                        name: `ig`,
                        type: `string`,
                        column: true,
                        description: `社群媒體`
                    },
                    {
                        name: `fb`,
                        type: `string`,
                        column: true,
                        description: `社群媒體`
                    },
                    {
                        name: `line`,
                        type: `string`,
                        column: true,
                        description: `社群媒體`
                    }
                ]
            }
        },
        {
            path: "/infoOfCopyRightContent",
            name: "infoOfCopyRightContent",
            title: `服務項目-明悅`,
            editor: true,
            description: "用來做聯絡方式的頁面",
            struct: {
                name: "infoOfCopyRightContent",
                view: "Paper",
                wrapView: `div`,
                ruleOfOuter: "end",
                type: "object",
                children: [
                    {
                        name: `upperArea`,
                        view: `div`,
                        needParam: true,
                        children: [
                            {
                                name: `advantageStmt`,
                                view: `Typography`,
                                wrapView: `div`,
                                type: `string`,
                                l10n: true,
                                incest: { view: false, attribute: true },
                                defaultValue: `使用JS|React、Google Cloud(Firebase)的全端網頁工程製作，快速搭建線上式互動式\n(請參考以下專案)。\n\n完善的資料機密技術、權限管制、登入機制。\n支援金流支付串接（ECPAY、LINE-PAY）。\n每月提供一定免費伺服器額度(不需固定繳費，未達流量可免費使用)。\n開發費用3-10萬，2～4週交件。`
                            }
                        ]
                    },
                    {
                        name: "project",
                        type: `array`,
                        path: "project",
                        view: "div",
                        click: true,
                        plural: "s",
                        listEmptyTip: { enable: true },
                        permission: {
                            read: "alwaysTrue()"
                        },
                        conditions: [`{type:'orderBy', params:['indexOfSequence']}`],
                        example: [
                            {
                                id: "123",
                                title: `專案零`,
                                image: `https://seeklogo.com/images/D/disney-logo-575AED0F1D-seeklogo.com.png`,
                                trait: `非主流`,
                                descriptions: [
                                    {
                                        statement: `描述一二三四五六`
                                    },
                                    {
                                        statement: `描述一二三四五六`
                                    }
                                ]
                            },
                            {
                                id: "1234",
                                title: `專案一`,
                                image: `https://i.pcmag.com/imagery/reviews/05cItXL96l4LE9n02WfDR0h-5..v1582751026.png`,
                                trait: `遊戲類`,
                                descriptions: [
                                    {
                                        statement: `描述一二三四五六`
                                    },
                                    {
                                        statement: `描述一二三四五六`
                                    },
                                    {
                                        statement: `描述一二三四五六`
                                    }
                                ]
                            },
                            {
                                id: "12345",
                                title: `專案二`,
                                image: `https://s.yimg.com/cv/apiv2/social/images/yahoo_default_logo-1200x1200.png`,
                                trait: `模擬考題`,
                                descriptions: [
                                    {
                                        statement: `描述一二三四五六`
                                    },
                                    {
                                        statement: `描述一二三四五六`
                                    }
                                ]
                            },
                            {
                                id: "123456",
                                title: `專案三`,
                                image: `https://www.google.com.tw/images/branding/googlelogo/2x/googlelogo_color_160x56dp.png`,
                                trait: `期程安排`,
                                descriptions: [
                                    {
                                        statement: `描述一二三四五六`
                                    }
                                ]
                            }
                        ],
                        children: [
                            {
                                name: "route",
                                type: `string`,
                                column: true,
                                defaultValue: `https://google.com`,
                                description: `跳轉路徑`
                            },
                            {
                                name: `indexOfSequence`,
                                type: `number`,
                                column: true,
                                defaultValue: -1,
                                description: `順序`
                            },
                            {
                                name: `image`,
                                wrapView: "Card",
                                view: `img`,
                                type: `string`,
                                column: true,
                                storageFolder: "/project/:uid/images",
                                description: `專案的圖片`
                            },
                            {
                                name: `upperArea`,
                                view: `div`,
                                needParam: true,
                                children: [
                                    {
                                        name: `title`,
                                        type: `string`,
                                        view: `Typography`,
                                        column: true,
                                        incest: { view: false, attribute: true },
                                        description: `專案名稱`
                                    },
                                    {
                                        name: `trait`,
                                        type: `string`,
                                        incest: { view: false, attribute: true },
                                        view: `Typography`,
                                        column: true,
                                        wrapView: `div`,
                                        description: `專案分類`
                                    }
                                ]
                            },
                            {
                                name: `description`,
                                type: `array`,
                                plural: "s",
                                cheap: true,
                                view: "div",
                                column: true,
                                description: `描述`,
                                children: [
                                    {
                                        name: `statement`,
                                        type: `string`,
                                        view: `Typography`,
                                        column: true,
                                        description: `幾個專案重點`,
                                        labelView: {
                                            enable: true,
                                            labelIcon: {
                                                enable: true,
                                                view: "StarRounded"
                                            }
                                        }
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
