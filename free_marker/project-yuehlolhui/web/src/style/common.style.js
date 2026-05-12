import { utiller as Util, exceptioner as ERROR, pooller as InfinitePool } from "utiller";
import _ from "lodash";
import libpath from "path";

class CommonStyle {
    /** -------------------- fields -------------------- **/

    /** => following for infoOfCopyRightContent editor component  */

    InfoOfCopyRightContentEditorProjectImageTextField = {};

    InfoOfCopyRightContentEditorProjectIdTextField = {};

    InfoOfCopyRightContentEditorProjectDescriptionStatementBtnOfStatementIconStarRounded = {};

    InfoOfCopyRightContentEditorProjectDescriptionStatementBtnOfStatementIconButton = {};

    InfoOfCopyRightContentEditorProjectDescriptionStatementDivWrap = {};

    InfoOfCopyRightContentEditorProjectDescriptionStatementTextField = {};

    InfoOfCopyRightContentEditorProjectDescriptionDivList = {};

    InfoOfCopyRightContentEditorProjectDescriptionDivWrap = {};

    InfoOfCopyRightContentEditorProjectDescriptionDiv = {};

    InfoOfCopyRightContentEditorProjectUpperAreaTraitDivWrap = {};

    InfoOfCopyRightContentEditorProjectUpperAreaTraitTextField = {};

    InfoOfCopyRightContentEditorProjectUpperAreaTitleTextField = {};

    InfoOfCopyRightContentEditorProjectUpperAreaDiv = {};

    InfoOfCopyRightContentEditorProjectImageCardWrap = {};

    InfoOfCopyRightContentEditorProjectImageImg = {};

    InfoOfCopyRightContentEditorProjectIndexOfSequenceTextField = {};

    InfoOfCopyRightContentEditorProjectRouteTextField = {};

    InfoOfCopyRightContentEditorProjectDivList = {};

    InfoOfCopyRightContentEditorProjectDivWrap = {};

    InfoOfCopyRightContentEditorProjectDiv = {};

    InfoOfCopyRightContentEditorUpperAreaDiv = {};

    InfoOfCopyRightContentEditorDivWrap = {};

    InfoOfCopyRightContentEditorPaper = {};

    /** => following for navigator  component  */

    NavigatorDrawerShortcutIconImg = {};

    NavigatorDrawerShortcutTitleTypography = {};

    NavigatorDrawerShortcutListItemSkeleton = {};

    NavigatorDrawerShortcutListList = {};

    NavigatorDrawerShortcutListItem = {};

    NavigatorDrawerDrawer = {};

    NavigatorToolBarAccountIconAccountCircle = {};

    NavigatorToolBarAccountReactFragmentWrap = {};

    NavigatorToolBarAccountIconButton = {};

    NavigatorToolBarLoginIconLogin = {};

    NavigatorToolBarLoginIconButton = {};

    NavigatorToolBarEditIconEditSharp = {};

    NavigatorToolBarEditIconButton = {};

    NavigatorToolBarSearchIconSearchRounded = {};

    NavigatorToolBarSearchIconButton = {};

    NavigatorToolBarTipOfLoadingCircularProgress = {};

    NavigatorToolBarCartieBadgeOfCartieIconShoppingCart = {};

    NavigatorToolBarCartieBadgeOfCartieBadge = {};

    NavigatorToolBarCartieIconButton = {};

    NavigatorToolBarCompleteInputOfCompleteFormWrap = {};

    NavigatorToolBarCompleteInputOfCompleteTextField = {};

    NavigatorToolBarCompleteAutocomplete = {};

    NavigatorToolBarTitleDivWrap = {};

    NavigatorToolBarTitleTypography = {};

    NavigatorToolBarMenuIconMenuRounded = {};

    NavigatorToolBarMenuIconButton = {};

    NavigatorToolBarAppBarWrap = {};

    NavigatorToolBarToolbar = {};

    NavigatorDiv = {};

    /** => following for infoOfCopyRightContent  component  */

    InfoOfCopyRightContentProjectDescriptionStatementBtnOfStatementIconStarRounded = {};

    InfoOfCopyRightContentProjectDescriptionStatementBtnOfStatementIconButton = {};

    InfoOfCopyRightContentProjectDescriptionStatementDivWrap = {};

    InfoOfCopyRightContentProjectDescriptionStatementTypography = {};

    InfoOfCopyRightContentProjectDescriptionDivList = {};

    InfoOfCopyRightContentProjectDescriptionDiv = {};

    InfoOfCopyRightContentProjectUpperAreaTraitDivWrap = {};

    InfoOfCopyRightContentProjectUpperAreaTraitTypography = {};

    InfoOfCopyRightContentProjectUpperAreaTitleTypography = {};

    InfoOfCopyRightContentProjectUpperAreaDiv = {};

    InfoOfCopyRightContentProjectImageCardWrap = {};

    InfoOfCopyRightContentProjectImageImg = {};

    InfoOfCopyRightContentProjectDivSkeleton = {};

    InfoOfCopyRightContentProjectDivList = {};

    InfoOfCopyRightContentProjectDiv = {};

    InfoOfCopyRightContentUpperAreaAdvantageStmtDivWrap = {};

    InfoOfCopyRightContentUpperAreaAdvantageStmtTypography = {};

    InfoOfCopyRightContentUpperAreaDiv = {};

    InfoOfCopyRightContentDivWrap = {};

    InfoOfCopyRightContentPaper = {};

    /** => following for infoOfCopyRightContact  component  */

    InfoOfCopyRightContactPortfolioDivWrap = {};

    InfoOfCopyRightContactPortfolioTypography = {};

    InfoOfCopyRightContactLowerAreaDetailsTypography = {};

    InfoOfCopyRightContactLowerAreaIntroduceDivWrap = {};

    InfoOfCopyRightContactLowerAreaIntroduceTypography = {};

    InfoOfCopyRightContactLowerAreaDiv = {};

    InfoOfCopyRightContactUpperAreaGroupOfSocialMediaLineOImgOfLineOImg = {};

    InfoOfCopyRightContactUpperAreaGroupOfSocialMediaLineOIconButton = {};

    InfoOfCopyRightContactUpperAreaGroupOfSocialMediaIgOImgOfIgOImg = {};

    InfoOfCopyRightContactUpperAreaGroupOfSocialMediaIgOIconButton = {};

    InfoOfCopyRightContactUpperAreaGroupOfSocialMediaFbOImgOfFbOImg = {};

    InfoOfCopyRightContactUpperAreaGroupOfSocialMediaFbOIconButton = {};

    InfoOfCopyRightContactUpperAreaGroupOfSocialMediaDiv = {};

    InfoOfCopyRightContactUpperAreaGroupOfDetailEmailOLabelOfEmailOTypography = {};

    InfoOfCopyRightContactUpperAreaGroupOfDetailEmailOBtnOfEmailOIconMailOutlined = {};

    InfoOfCopyRightContactUpperAreaGroupOfDetailEmailOBtnOfEmailOIconButton = {};

    InfoOfCopyRightContactUpperAreaGroupOfDetailEmailODivWrap = {};

    InfoOfCopyRightContactUpperAreaGroupOfDetailEmailOTypography = {};

    InfoOfCopyRightContactUpperAreaGroupOfDetailPhoneOLabelOfPhoneOTypography = {};

    InfoOfCopyRightContactUpperAreaGroupOfDetailPhoneOBtnOfPhoneOIconPhoneOutlined = {};

    InfoOfCopyRightContactUpperAreaGroupOfDetailPhoneOBtnOfPhoneOIconButton = {};

    InfoOfCopyRightContactUpperAreaGroupOfDetailPhoneODivWrap = {};

    InfoOfCopyRightContactUpperAreaGroupOfDetailPhoneOTypography = {};

    InfoOfCopyRightContactUpperAreaGroupOfDetailDiv = {};

    InfoOfCopyRightContactUpperAreaContactDivWrap = {};

    InfoOfCopyRightContactUpperAreaContactTypography = {};

    InfoOfCopyRightContactUpperAreaDiv = {};

    InfoOfCopyRightContactDivWrap = {};

    InfoOfCopyRightContactCard = {};

    /** => following for infoOfCopyRightUsages  component  */

    InfoOfCopyRightUsagesMainContentTypography = {};

    InfoOfCopyRightUsagesMainSeparatorDiv = {};

    InfoOfCopyRightUsagesMainTitleTypography = {};

    InfoOfCopyRightUsagesMainDiv = {};

    InfoOfCopyRightUsagesPaperWrap = {};

    InfoOfCopyRightUsagesDiv = {};

    /** => following for infoOfRefundNTurnPolicy  component  */

    InfoOfRefundNTurnPolicyMainContentTypography = {};

    InfoOfRefundNTurnPolicyMainSeparatorDiv = {};

    InfoOfRefundNTurnPolicyMainTitleTypography = {};

    InfoOfRefundNTurnPolicyMainDiv = {};

    InfoOfRefundNTurnPolicyPaperWrap = {};

    InfoOfRefundNTurnPolicyDiv = {};

    /** => following for infoOfCopyRightPrivacy  component  */

    InfoOfCopyRightPrivacyMainContentTypography = {};

    InfoOfCopyRightPrivacyMainSeparatorDiv = {};

    InfoOfCopyRightPrivacyMainTitleTypography = {};

    InfoOfCopyRightPrivacyMainDiv = {};

    InfoOfCopyRightPrivacyPaperWrap = {};

    InfoOfCopyRightPrivacyDiv = {};

    /** => following for infoOfCopyRight  component  */

    InfoOfCopyRightColUnifiedBLabelOfUnifiedBTypography = {};

    InfoOfCopyRightColUnifiedBDivWrap = {};

    InfoOfCopyRightColUnifiedBTypography = {};

    InfoOfCopyRightColPhoneOLabelOfPhoneOTypography = {};

    InfoOfCopyRightColPhoneODivWrap = {};

    InfoOfCopyRightColPhoneOTypography = {};

    InfoOfCopyRightColAddressOLabelOfAddressOTypography = {};

    InfoOfCopyRightColAddressODivWrap = {};

    InfoOfCopyRightColAddressOTypography = {};

    InfoOfCopyRightColCompanyOTypography = {};

    InfoOfCopyRightColDiv = {};

    InfoOfCopyRightGroupOfSocialMediaLineOImgOfLineOImg = {};

    InfoOfCopyRightGroupOfSocialMediaLineOIconButton = {};

    InfoOfCopyRightGroupOfSocialMediaIgOImgOfIgOImg = {};

    InfoOfCopyRightGroupOfSocialMediaIgOIconButton = {};

    InfoOfCopyRightGroupOfSocialMediaFbOImgOfFbOImg = {};

    InfoOfCopyRightGroupOfSocialMediaFbOIconButton = {};

    InfoOfCopyRightGroupOfSocialMediaDiv = {};

    InfoOfCopyRightUpperGroupRightAreaCprtButton = {};

    InfoOfCopyRightUpperGroupRightAreaSeparatorTypography = {};

    InfoOfCopyRightUpperGroupRightAreaResponsibilityOffReactFragmentWrap = {};

    InfoOfCopyRightUpperGroupRightAreaResponsibilityOffButton = {};

    InfoOfCopyRightUpperGroupRightAreaPrivilegeSeparator02Typography = {};

    InfoOfCopyRightUpperGroupRightAreaPrivilegePrivacyReactFragmentWrap = {};

    InfoOfCopyRightUpperGroupRightAreaPrivilegePrivacyButton = {};

    InfoOfCopyRightUpperGroupRightAreaPrivilegeSeparator01Typography = {};

    InfoOfCopyRightUpperGroupRightAreaPrivilegeUsageRulesReactFragmentWrap = {};

    InfoOfCopyRightUpperGroupRightAreaPrivilegeUsageRulesButton = {};

    InfoOfCopyRightUpperGroupRightAreaPrivilegeSeparator00Typography = {};

    InfoOfCopyRightUpperGroupRightAreaPrivilegeRefundNTurnPolicyReactFragmentWrap = {};

    InfoOfCopyRightUpperGroupRightAreaPrivilegeRefundNTurnPolicyButton = {};

    InfoOfCopyRightUpperGroupRightAreaPrivilegeDiv = {};

    InfoOfCopyRightUpperGroupRightAreaDiv = {};

    InfoOfCopyRightUpperGroupLeftAreaContactReactFragmentWrap = {};

    InfoOfCopyRightUpperGroupLeftAreaContactButton = {};

    InfoOfCopyRightUpperGroupLeftAreaDiv = {};

    InfoOfCopyRightUpperGroupDiv = {};

    InfoOfCopyRightDiv = {};

    /** => following for account  component  */

    AccountAreaUserSummaryTitleOfUserTypography = {};

    AccountAreaUserSummaryAccordionSummary = {};

    AccountAreaUserAreaOfLogoutArrowOfLogoutIconNavigateNext = {};

    AccountAreaUserAreaOfLogoutArrowOfLogoutReactFragmentWrap = {};

    AccountAreaUserAreaOfLogoutArrowOfLogoutIconButton = {};

    AccountAreaUserAreaOfLogoutOptionOfLogoutContentTypography = {};

    AccountAreaUserAreaOfLogoutOptionOfLogoutTitleTypography = {};

    AccountAreaUserAreaOfLogoutDivWrap = {};

    AccountAreaUserAreaOfLogoutDiv = {};

    AccountAreaUserAreaOfCleanCacheArrowOfCleanCacheIconNavigateNext = {};

    AccountAreaUserAreaOfCleanCacheArrowOfCleanCacheIconButton = {};

    AccountAreaUserAreaOfCleanCacheOptionOfCleanCacheContentTypography = {};

    AccountAreaUserAreaOfCleanCacheOptionOfCleanCacheTitleTypography = {};

    AccountAreaUserAreaOfCleanCacheDivWrap = {};

    AccountAreaUserAreaOfCleanCacheDiv = {};

    AccountAreaUserAreaOfPrivacyArrowOfPrivacyIconNavigateNext = {};

    AccountAreaUserAreaOfPrivacyArrowOfPrivacyReactFragmentWrap = {};

    AccountAreaUserAreaOfPrivacyArrowOfPrivacyIconButton = {};

    AccountAreaUserAreaOfPrivacyOptionOfPrivacyContentTypography = {};

    AccountAreaUserAreaOfPrivacyOptionOfPrivacyTitleTypography = {};

    AccountAreaUserAreaOfPrivacyDivWrap = {};

    AccountAreaUserAreaOfPrivacyDiv = {};

    AccountAreaUserAreaOfUsagesArrowOfUsagesIconNavigateNext = {};

    AccountAreaUserAreaOfUsagesArrowOfUsagesReactFragmentWrap = {};

    AccountAreaUserAreaOfUsagesArrowOfUsagesIconButton = {};

    AccountAreaUserAreaOfUsagesOptionOfUsagesContentTypography = {};

    AccountAreaUserAreaOfUsagesOptionOfUsagesTitleTypography = {};

    AccountAreaUserAreaOfUsagesDivWrap = {};

    AccountAreaUserAreaOfUsagesDiv = {};

    AccountAreaUserAreaOfTokenArrowOfTokenIconNavigateNext = {};

    AccountAreaUserAreaOfTokenArrowOfTokenIconButton = {};

    AccountAreaUserAreaOfTokenOptionOfTokenContentTypography = {};

    AccountAreaUserAreaOfTokenOptionOfTokenTitleTypography = {};

    AccountAreaUserAreaOfTokenDivWrap = {};

    AccountAreaUserAreaOfTokenDiv = {};

    AccountAreaUserAccordionWrap = {};

    AccountAreaUserAccordionDetails = {};

    AccountAreaAdminSummaryTitleOfAdminTypography = {};

    AccountAreaAdminSummaryAccordionSummary = {};

    AccountAreaAdminAreaOfAppendReaderArrowOfAppendReaderIconNavigateNext = {};

    AccountAreaAdminAreaOfAppendReaderArrowOfAppendReaderReactFragmentWrap = {};

    AccountAreaAdminAreaOfAppendReaderArrowOfAppendReaderIconButton = {};

    AccountAreaAdminAreaOfAppendReaderOptionOfAppendReaderContentTypography = {};

    AccountAreaAdminAreaOfAppendReaderOptionOfAppendReaderTitleTypography = {};

    AccountAreaAdminAreaOfAppendReaderDivWrap = {};

    AccountAreaAdminAreaOfAppendReaderDiv = {};

    AccountAreaAdminAreaOfAppendAuthorArrowOfAppendAuthorIconNavigateNext = {};

    AccountAreaAdminAreaOfAppendAuthorArrowOfAppendAuthorReactFragmentWrap = {};

    AccountAreaAdminAreaOfAppendAuthorArrowOfAppendAuthorIconButton = {};

    AccountAreaAdminAreaOfAppendAuthorOptionOfAppendAuthorContentTypography = {};

    AccountAreaAdminAreaOfAppendAuthorOptionOfAppendAuthorTitleTypography = {};

    AccountAreaAdminAreaOfAppendAuthorDivWrap = {};

    AccountAreaAdminAreaOfAppendAuthorDiv = {};

    AccountAreaAdminAreaOfAppendAdminArrowOfAppendAdminIconNavigateNext = {};

    AccountAreaAdminAreaOfAppendAdminArrowOfAppendAdminReactFragmentWrap = {};

    AccountAreaAdminAreaOfAppendAdminArrowOfAppendAdminIconButton = {};

    AccountAreaAdminAreaOfAppendAdminOptionOfAppendAdminContentTypography = {};

    AccountAreaAdminAreaOfAppendAdminOptionOfAppendAdminTitleTypography = {};

    AccountAreaAdminAreaOfAppendAdminDivWrap = {};

    AccountAreaAdminAreaOfAppendAdminDiv = {};

    AccountAreaAdminAreaOfGoEditModeArrowOfGoEditModeIconNavigateNext = {};

    AccountAreaAdminAreaOfGoEditModeArrowOfGoEditModeIconButton = {};

    AccountAreaAdminAreaOfGoEditModeOptionOfGoEditModeContentTypography = {};

    AccountAreaAdminAreaOfGoEditModeOptionOfGoEditModeTitleTypography = {};

    AccountAreaAdminAreaOfGoEditModeDivWrap = {};

    AccountAreaAdminAreaOfGoEditModeDiv = {};

    AccountAreaAdminAccordionWrap = {};

    AccountAreaAdminAccordionDetails = {};

    AccountAreaBuySummaryTitleOfBuyTypography = {};

    AccountAreaBuySummaryAccordionSummary = {};

    AccountAreaBuyAreaOfListOfUserOrderArrowOfListOfUserOrderIconNavigateNext = {};

    AccountAreaBuyAreaOfListOfUserOrderArrowOfListOfUserOrderIconButton = {};

    AccountAreaBuyAreaOfListOfUserOrderOptionOfListOfUserOrderContentTypography = {};

    AccountAreaBuyAreaOfListOfUserOrderOptionOfListOfUserOrderTitleTypography = {};

    AccountAreaBuyAreaOfListOfUserOrderDivWrap = {};

    AccountAreaBuyAreaOfListOfUserOrderDiv = {};

    AccountAreaBuyAccordionWrap = {};

    AccountAreaBuyAccordionDetails = {};

    AccountAreaSaleSummaryTitleOfSaleTypography = {};

    AccountAreaSaleSummaryAccordionSummary = {};

    AccountAreaSaleAreaOfMyReportArrowOfMyReportIconNavigateNext = {};

    AccountAreaSaleAreaOfMyReportArrowOfMyReportIconButton = {};

    AccountAreaSaleAreaOfMyReportOptionOfMyReportContentTypography = {};

    AccountAreaSaleAreaOfMyReportOptionOfMyReportTitleTypography = {};

    AccountAreaSaleAreaOfMyReportDivWrap = {};

    AccountAreaSaleAreaOfMyReportDiv = {};

    AccountAreaSaleAreaOfMyScheduleArrowOfMyScheduleIconNavigateNext = {};

    AccountAreaSaleAreaOfMyScheduleArrowOfMyScheduleIconButton = {};

    AccountAreaSaleAreaOfMyScheduleOptionOfMyScheduleContentTypography = {};

    AccountAreaSaleAreaOfMyScheduleOptionOfMyScheduleTitleTypography = {};

    AccountAreaSaleAreaOfMyScheduleDivWrap = {};

    AccountAreaSaleAreaOfMyScheduleDiv = {};

    AccountAreaSaleAreaOfMarketSettingArrowOfMarketSettingIconNavigateNext = {};

    AccountAreaSaleAreaOfMarketSettingArrowOfMarketSettingIconButton = {};

    AccountAreaSaleAreaOfMarketSettingOptionOfMarketSettingContentTypography = {};

    AccountAreaSaleAreaOfMarketSettingOptionOfMarketSettingTitleTypography = {};

    AccountAreaSaleAreaOfMarketSettingDivWrap = {};

    AccountAreaSaleAreaOfMarketSettingDiv = {};

    AccountAreaSaleAreaOfGoToMyBoozeArrowOfGoToMyBoozeIconNavigateNext = {};

    AccountAreaSaleAreaOfGoToMyBoozeArrowOfGoToMyBoozeIconButton = {};

    AccountAreaSaleAreaOfGoToMyBoozeOptionOfGoToMyBoozeContentTypography = {};

    AccountAreaSaleAreaOfGoToMyBoozeOptionOfGoToMyBoozeTitleTypography = {};

    AccountAreaSaleAreaOfGoToMyBoozeDivWrap = {};

    AccountAreaSaleAreaOfGoToMyBoozeDiv = {};

    AccountAreaSaleAreaOfAppendBoozeArrowOfAppendBoozeIconNavigateNext = {};

    AccountAreaSaleAreaOfAppendBoozeArrowOfAppendBoozeIconButton = {};

    AccountAreaSaleAreaOfAppendBoozeOptionOfAppendBoozeContentTypography = {};

    AccountAreaSaleAreaOfAppendBoozeOptionOfAppendBoozeTitleTypography = {};

    AccountAreaSaleAreaOfAppendBoozeDivWrap = {};

    AccountAreaSaleAreaOfAppendBoozeDiv = {};

    AccountAreaSaleAreaOfListOfAuthorOrderArrowOfListOfAuthorOrderIconNavigateNext = {};

    AccountAreaSaleAreaOfListOfAuthorOrderArrowOfListOfAuthorOrderIconButton = {};

    AccountAreaSaleAreaOfListOfAuthorOrderOptionOfListOfAuthorOrderContentTypography = {};

    AccountAreaSaleAreaOfListOfAuthorOrderOptionOfListOfAuthorOrderTitleTypography = {};

    AccountAreaSaleAreaOfListOfAuthorOrderDivWrap = {};

    AccountAreaSaleAreaOfListOfAuthorOrderDiv = {};

    AccountAreaSaleAccordionWrap = {};

    AccountAreaSaleAccordionDetails = {};

    AccountAreaDiv = {};

    AccountBasicLangTextFieldList = {};

    AccountBasicLangMenuItem = {};

    AccountBasicLabelOfPropTypography = {};

    AccountBasicDiv = {};

    AccountInfoValueOfEmailTypography = {};

    AccountInfoValueOfNameTypography = {};

    AccountInfoUrlOfHeadPhotoAvatar = {};

    AccountInfoDiv = {};

    AccountDivWrap = {};

    AccountPaper = {};

    /** => following for storyteller  component  */

    StorytellerActionContainerSubmitBtnButton = {};

    StorytellerActionContainerBackBtnButton = {};

    StorytellerActionContainerDiv = {};

    StorytellerContentTextField = {};

    StorytellerAuthorTextField = {};

    StorytellerCreateTimeTimeDatePicker = {};

    StorytellerPaperWrap = {};

    StorytellerDiv = {};

    /** => following for diaries  component  */

    DiariesMessageXReadMoreDivWrap = {};

    DiariesMessageXReadMoreTypography = {};

    DiariesMessageXAuthorTypography = {};

    DiariesMessageXContentTypography = {};

    DiariesMessageXCreateTimeTypography = {};

    DiariesMessageXCardSkeleton = {};

    DiariesMessageXDivList = {};

    DiariesMessageXCard = {};

    DiariesDivWrap = {};

    DiariesDiv = {};

    /** -------------------- functions -------------------- **/

    constructor(props) {}

    /** -------------------- async api -------------------- **/
}

export default new CommonStyle();
