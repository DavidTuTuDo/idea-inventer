import { utiller as Util, exceptioner as ERROR, pooller as InfinitePool } from "utiller";
import _ from "lodash";
import libpath from "path";

class MobileStyle {
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

    /** => following for main editor component  */

    MainEditorTestTestUsageButton = {};

    MainEditorTestEndOfAgodaTextField = {};

    MainEditorTestStartOfAgodaTextField = {};

    MainEditorTestEndOfTrivagoTextField = {};

    MainEditorTestStartOfTrivagoTextField = {};

    MainEditorTestFullTextField = {};

    MainEditorTestEndTextField = {};

    MainEditorTestClockTextField = {};

    MainEditorTestSubTitleTextField = {};

    MainEditorTestTitleTextField = {};

    MainEditorTestDivWrap = {};

    MainEditorTestDiv = {};

    MainEditorBannerImageTextField = {};

    MainEditorBannerImageDivWrap = {};

    MainEditorBannerImageImg = {};

    MainEditorBannerRouteTextField = {};

    MainEditorBannerSwiperList = {};

    MainEditorBannerSwiperSlide = {};

    MainEditorDiv = {};

    /** => following for navigator  component  */

    NavigatorDrawerShortcutIconImg = {};

    NavigatorDrawerShortcutTitleTypography = {};

    NavigatorDrawerShortcutListItemSkeleton = {};

    NavigatorDrawerShortcutListList = {};

    NavigatorDrawerShortcutListItem = {};

    NavigatorDrawerDrawer = {};

    NavigatorToolBarTipOfLoadingCircularProgress = {};

    NavigatorToolBarAccountIconAccountCircle = {};

    NavigatorToolBarAccountReactFragmentWrap = {};

    NavigatorToolBarAccountIconButton = {};

    NavigatorToolBarLoginIconLogin = {};

    NavigatorToolBarLoginIconButton = {};

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

    /** => following for numberSetter  component  */

    IreneNumberSetterFuncLeaveChip = {};

    IreneNumberSetterFuncConfirmChip = {};

    IreneNumberSetterFuncDiv = {};

    IreneNumberSetterRowValueTextField = {};

    IreneNumberSetterRowColonTypography = {};

    IreneNumberSetterRowLabelTypography = {};

    IreneNumberSetterRowDivList = {};

    IreneNumberSetterRowDiv = {};

    IreneNumberSetterDivWrap = {};

    IreneNumberSetterPaper = {};

    /** => following for timePeriod  component  */

    IreneTimePeriodFuncLeaveChip = {};

    IreneTimePeriodFuncConfirmChip = {};

    IreneTimePeriodFuncDiv = {};

    IreneTimePeriodMainTimeOfEndLabelOfTimeOfEndTypography = {};

    IreneTimePeriodMainTimeOfEndDivWrap = {};

    IreneTimePeriodMainTimeOfEndTimePicker = {};

    IreneTimePeriodMainTimeOfStartLabelOfTimeOfStartTypography = {};

    IreneTimePeriodMainTimeOfStartDivWrap = {};

    IreneTimePeriodMainTimeOfStartTimePicker = {};

    IreneTimePeriodMainDiv = {};

    IreneTimePeriodDivWrap = {};

    IreneTimePeriodPaper = {};

    /** => following for textsIndexSetter  component  */

    IreneTextsIndexSetterFuncLeaveChip = {};

    IreneTextsIndexSetterFuncUpdateChip = {};

    IreneTextsIndexSetterFuncDiv = {};

    IreneTextsIndexSetterRowGoTopChip = {};

    IreneTextsIndexSetterRowLabelTypography = {};

    IreneTextsIndexSetterRowBelongDivWrap = {};

    IreneTextsIndexSetterRowBelongCheckbox = {};

    IreneTextsIndexSetterRowDivList = {};

    IreneTextsIndexSetterRowDiv = {};

    IreneTextsIndexSetterDivWrap = {};

    IreneTextsIndexSetterPaper = {};

    /** => following for textFetch  component  */

    IreneTextFetchFuncLeaveChip = {};

    IreneTextFetchFuncAppendChip = {};

    IreneTextFetchFuncDiv = {};

    IreneTextFetchRowClearIconClearRounded = {};

    IreneTextFetchRowClearIconButton = {};

    IreneTextFetchRowContentTextField = {};

    IreneTextFetchRowTitleTypography = {};

    IreneTextFetchRowDiv = {};

    IreneTextFetchDivWrap = {};

    IreneTextFetchPaper = {};

    /** => following for textsFetch  component  */

    IreneTextsFetchFuncLeaveChip = {};

    IreneTextsFetchFuncAppendChip = {};

    IreneTextsFetchFuncDiv = {};

    IreneTextsFetchTitleClearIconDeleteForeverRounded = {};

    IreneTextsFetchTitleClearIconButton = {};

    IreneTextsFetchTitleContentTextField = {};

    IreneTextsFetchTitleIndexTypography = {};

    IreneTextsFetchTitleDivList = {};

    IreneTextsFetchTitleDiv = {};

    IreneTextsFetchDivWrap = {};

    IreneTextsFetchPaper = {};

    /** => following for irene  component  */

    IreneDiv = {};

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

    InfoOfCopyRightContactLowerAreaDetailsTypography = {};

    InfoOfCopyRightContactLowerAreaIntroduceDivWrap = {};

    InfoOfCopyRightContactLowerAreaIntroduceTypography = {};

    InfoOfCopyRightContactLowerAreaDiv = {};

    InfoOfCopyRightContactUpperAreaGroupOfSocialMediaLineImgOfLineImg = {};

    InfoOfCopyRightContactUpperAreaGroupOfSocialMediaLineIconButton = {};

    InfoOfCopyRightContactUpperAreaGroupOfSocialMediaIgImgOfIgImg = {};

    InfoOfCopyRightContactUpperAreaGroupOfSocialMediaIgIconButton = {};

    InfoOfCopyRightContactUpperAreaGroupOfSocialMediaFbImgOfFbImg = {};

    InfoOfCopyRightContactUpperAreaGroupOfSocialMediaFbIconButton = {};

    InfoOfCopyRightContactUpperAreaGroupOfSocialMediaDiv = {};

    InfoOfCopyRightContactUpperAreaGroupOfDetailEmailLabelOfEmailTypography = {};

    InfoOfCopyRightContactUpperAreaGroupOfDetailEmailBtnOfEmailIconMailOutlined = {};

    InfoOfCopyRightContactUpperAreaGroupOfDetailEmailBtnOfEmailIconButton = {};

    InfoOfCopyRightContactUpperAreaGroupOfDetailEmailDivWrap = {};

    InfoOfCopyRightContactUpperAreaGroupOfDetailEmailTypography = {};

    InfoOfCopyRightContactUpperAreaGroupOfDetailPhoneLabelOfPhoneTypography = {};

    InfoOfCopyRightContactUpperAreaGroupOfDetailPhoneBtnOfPhoneIconPhoneOutlined = {};

    InfoOfCopyRightContactUpperAreaGroupOfDetailPhoneBtnOfPhoneIconButton = {};

    InfoOfCopyRightContactUpperAreaGroupOfDetailPhoneDivWrap = {};

    InfoOfCopyRightContactUpperAreaGroupOfDetailPhoneTypography = {};

    InfoOfCopyRightContactUpperAreaGroupOfDetailDiv = {};

    InfoOfCopyRightContactUpperAreaContactDivWrap = {};

    InfoOfCopyRightContactUpperAreaContactTypography = {};

    InfoOfCopyRightContactUpperAreaDiv = {};

    InfoOfCopyRightContactDivWrap = {};

    InfoOfCopyRightContactCard = {};

    /** => following for infoOfCopyRight  component  */

    InfoOfCopyRightGroupOfSocialMediaLineImgOfLineImg = {};

    InfoOfCopyRightGroupOfSocialMediaLineIconButton = {};

    InfoOfCopyRightGroupOfSocialMediaIgImgOfIgImg = {};

    InfoOfCopyRightGroupOfSocialMediaIgIconButton = {};

    InfoOfCopyRightGroupOfSocialMediaFbImgOfFbImg = {};

    InfoOfCopyRightGroupOfSocialMediaFbIconButton = {};

    InfoOfCopyRightGroupOfSocialMediaDiv = {};

    InfoOfCopyRightUpperGroupRightAreaCprtButton = {};

    InfoOfCopyRightUpperGroupRightAreaSeparatorTypography = {};

    InfoOfCopyRightUpperGroupRightAreaResponsibilityOffReactFragmentWrap = {};

    InfoOfCopyRightUpperGroupRightAreaResponsibilityOffButton = {};

    InfoOfCopyRightUpperGroupRightAreaDiv = {};

    InfoOfCopyRightUpperGroupLeftAreaBusinessReactFragmentWrap = {};

    InfoOfCopyRightUpperGroupLeftAreaBusinessButton = {};

    InfoOfCopyRightUpperGroupLeftAreaContactReactFragmentWrap = {};

    InfoOfCopyRightUpperGroupLeftAreaContactButton = {};

    InfoOfCopyRightUpperGroupLeftAreaDiv = {};

    InfoOfCopyRightUpperGroupDiv = {};

    InfoOfCopyRightDiv = {};

    /** => following for epayFootprint  component  */

    EpayFootprintOrderAreaOfPaymentFailureReasonLabelOfReasonTypography = {};

    EpayFootprintOrderAreaOfPaymentFailureReasonDivWrap = {};

    EpayFootprintOrderAreaOfPaymentFailureReasonTypography = {};

    EpayFootprintOrderAreaOfPaymentFailureDiv = {};

    EpayFootprintOrderAreaOfFuncCheckoutButton = {};

    EpayFootprintOrderAreaOfFuncDiv = {};

    EpayFootprintOrderAreaOfPaymentDetailSectionOfCodeCopyIconCopyAll = {};

    EpayFootprintOrderAreaOfPaymentDetailSectionOfCodeCopyIconButton = {};

    EpayFootprintOrderAreaOfPaymentDetailSectionOfCodeCodeLabelOfCodeTypography = {};

    EpayFootprintOrderAreaOfPaymentDetailSectionOfCodeCodeDivWrap = {};

    EpayFootprintOrderAreaOfPaymentDetailSectionOfCodeCodeTypography = {};

    EpayFootprintOrderAreaOfPaymentDetailSectionOfCodeDiv = {};

    EpayFootprintOrderAreaOfPaymentDetailDomainLabelOfDomainTypography = {};

    EpayFootprintOrderAreaOfPaymentDetailDomainDivWrap = {};

    EpayFootprintOrderAreaOfPaymentDetailDomainTypography = {};

    EpayFootprintOrderAreaOfPaymentDetailDivWrap = {};

    EpayFootprintOrderAreaOfPaymentDetailDiv = {};

    EpayFootprintOrderAreaOfPaymentDeadlineDeadlineLabelOfDeadlineTypography = {};

    EpayFootprintOrderAreaOfPaymentDeadlineDeadlineDivWrap = {};

    EpayFootprintOrderAreaOfPaymentDeadlineDeadlineTypography = {};

    EpayFootprintOrderAreaOfPaymentDeadlineDiv = {};

    EpayFootprintOrderAreaOfPaymentRuleRuleLabelOfRuleTypography = {};

    EpayFootprintOrderAreaOfPaymentRuleRuleDivWrap = {};

    EpayFootprintOrderAreaOfPaymentRuleRuleTypography = {};

    EpayFootprintOrderAreaOfPaymentRuleDiv = {};

    EpayFootprintOrderAreaOfInputMessageValueTextField = {};

    EpayFootprintOrderAreaOfInputMessageLabelTypography = {};

    EpayFootprintOrderAreaOfInputMessageDiv = {};

    EpayFootprintOrderAreaOfChoosePaymentTypeSectionOfChooseTypeArrowIconChevronRight = {};

    EpayFootprintOrderAreaOfChoosePaymentTypeSectionOfChooseTypeArrowReactFragmentWrap = {};

    EpayFootprintOrderAreaOfChoosePaymentTypeSectionOfChooseTypeArrowIconButton = {};

    EpayFootprintOrderAreaOfChoosePaymentTypeSectionOfChooseTypeValueOfPaymentTypeTypography = {};

    EpayFootprintOrderAreaOfChoosePaymentTypeSectionOfChooseTypeDiv = {};

    EpayFootprintOrderAreaOfChoosePaymentTypeLabelOfPaymentTypeTypography = {};

    EpayFootprintOrderAreaOfChoosePaymentTypeDiv = {};

    EpayFootprintOrderAreaOfTotalPriceValueOfTotalPriceLabelOfValueOfTotalPriceTypography = {};

    EpayFootprintOrderAreaOfTotalPriceValueOfTotalPriceDivWrap = {};

    EpayFootprintOrderAreaOfTotalPriceValueOfTotalPriceTypography = {};

    EpayFootprintOrderAreaOfTotalPriceDiv = {};

    EpayFootprintOrderBriefSectionOfDescriptionPriceTypography = {};

    EpayFootprintOrderBriefSectionOfDescriptionQuantityTypography = {};

    EpayFootprintOrderBriefSectionOfDescriptionSpecificOfProductTypography = {};

    EpayFootprintOrderBriefSectionOfDescriptionNameOfProductDivWrap = {};

    EpayFootprintOrderBriefSectionOfDescriptionNameOfProductTypography = {};

    EpayFootprintOrderBriefSectionOfDescriptionDiv = {};

    EpayFootprintOrderBriefImageOfProductPhotoImg = {};

    EpayFootprintOrderBriefDivList = {};

    EpayFootprintOrderBriefDiv = {};

    EpayFootprintOrderAreaOfTopSectionOfTailExtraIconMoreVertRounded = {};

    EpayFootprintOrderAreaOfTopSectionOfTailExtraReactFragmentWrap = {};

    EpayFootprintOrderAreaOfTopSectionOfTailExtraIconButton = {};

    EpayFootprintOrderAreaOfTopSectionOfTailStateOfOrderTypography = {};

    EpayFootprintOrderAreaOfTopSectionOfTailDiv = {};

    EpayFootprintOrderAreaOfTopSectionOfHeadCopyIdIconCopyAll = {};

    EpayFootprintOrderAreaOfTopSectionOfHeadCopyIdIconButton = {};

    EpayFootprintOrderAreaOfTopSectionOfHeadStringOfOrderIdentityLabelOfStringOfOrderIdentityTypography = {};

    EpayFootprintOrderAreaOfTopSectionOfHeadStringOfOrderIdentityDivWrap = {};

    EpayFootprintOrderAreaOfTopSectionOfHeadStringOfOrderIdentityTypography = {};

    EpayFootprintOrderAreaOfTopSectionOfHeadDiv = {};

    EpayFootprintOrderAreaOfTopDiv = {};

    EpayFootprintOrderDivList = {};

    EpayFootprintOrderCard = {};

    EpayFootprintTabTabsList = {};

    EpayFootprintTabTab = {};

    EpayFootprintDivWrap = {};

    EpayFootprintDiv = {};

    /** => following for epayMethodOfPayment  component  */

    EpayMethodOfPaymentOptionDescriptionTypography = {};

    EpayMethodOfPaymentOptionImageImg = {};

    EpayMethodOfPaymentOptionNameTypography = {};

    EpayMethodOfPaymentOptionCardSkeleton = {};

    EpayMethodOfPaymentOptionDivList = {};

    EpayMethodOfPaymentOptionCard = {};

    EpayMethodOfPaymentTitleTypography = {};

    EpayMethodOfPaymentPaper = {};

    /** => following for epayBehaviorOfConfirmLinePay  component  */

    EpayBehaviorOfConfirmLinePayMessageOfFreezeTypography = {};

    EpayBehaviorOfConfirmLinePayDivWrap = {};

    EpayBehaviorOfConfirmLinePayDiv = {};

    /** => following for epay  component  */

    EpayDiv = {};

    /** => following for variantPhotoSetter  component  */

    DionysusVariantPhotoSetterVariantPreviewChip = {};

    DionysusVariantPhotoSetterVariantUpdateIconAddPhotoAlternateRounded = {};

    DionysusVariantPhotoSetterVariantUpdateIconButton = {};

    DionysusVariantPhotoSetterVariantLabelOfVariantDivWrap = {};

    DionysusVariantPhotoSetterVariantLabelOfVariantTypography = {};

    DionysusVariantPhotoSetterVariantDivList = {};

    DionysusVariantPhotoSetterVariantDiv = {};

    DionysusVariantPhotoSetterDivWrap = {};

    DionysusVariantPhotoSetterPaper = {};

    /** => following for priceSetter  component  */

    DionysusPriceSetterFuncCommonReactFragmentWrap = {};

    DionysusPriceSetterFuncCommonChip = {};

    DionysusPriceSetterFuncLeaveChip = {};

    DionysusPriceSetterFuncBatchUpdateChip = {};

    DionysusPriceSetterFuncDiv = {};

    DionysusPriceSetterVariantUpdateIconRefreshRounded = {};

    DionysusPriceSetterVariantUpdateIconButton = {};

    DionysusPriceSetterVariantRowPriceB4DiscountTextField = {};

    DionysusPriceSetterVariantRowPriceTextField = {};

    DionysusPriceSetterVariantRowDiv = {};

    DionysusPriceSetterVariantLabelOfVariantDivWrap = {};

    DionysusPriceSetterVariantLabelOfVariantTypography = {};

    DionysusPriceSetterVariantDivList = {};

    DionysusPriceSetterVariantDiv = {};

    DionysusPriceSetterDivWrap = {};

    DionysusPriceSetterPaper = {};

    /** => following for quantitySetter  component  */

    DionysusQuantitySetterFuncCommonReactFragmentWrap = {};

    DionysusQuantitySetterFuncCommonChip = {};

    DionysusQuantitySetterFuncLeaveChip = {};

    DionysusQuantitySetterFuncBatchUpdateChip = {};

    DionysusQuantitySetterFuncDiv = {};

    DionysusQuantitySetterVariantUpdateIconRefreshRounded = {};

    DionysusQuantitySetterVariantUpdateIconButton = {};

    DionysusQuantitySetterVariantQuantityTextField = {};

    DionysusQuantitySetterVariantLabelOfVariantDivWrap = {};

    DionysusQuantitySetterVariantLabelOfVariantTypography = {};

    DionysusQuantitySetterVariantDivList = {};

    DionysusQuantitySetterVariantDiv = {};

    DionysusQuantitySetterDivWrap = {};

    DionysusQuantitySetterPaper = {};

    /** => following for apollo  component  */

    DionysusApolloFuncLoadChip = {};

    DionysusApolloFuncLeaveChip = {};

    DionysusApolloFuncConfirmChip = {};

    DionysusApolloFuncDiv = {};

    DionysusApolloAreaOfDayOffOffDayLabelChip = {};

    DionysusApolloAreaOfDayOffOffDayDivList = {};

    DionysusApolloAreaOfDayOffOffDayDiv = {};

    DionysusApolloAreaOfDayOffRowAppendOfDayOffReactFragmentWrap = {};

    DionysusApolloAreaOfDayOffRowAppendOfDayOffChip = {};

    DionysusApolloAreaOfDayOffRowLabelOfDayOffTypography = {};

    DionysusApolloAreaOfDayOffRowDiv = {};

    DionysusApolloAreaOfDayOffDiv = {};

    DionysusApolloAreaOfRestRestPeriodLabelChip = {};

    DionysusApolloAreaOfRestRestPeriodDivList = {};

    DionysusApolloAreaOfRestRestPeriodDiv = {};

    DionysusApolloAreaOfRestRowAppendOfRestPeriodReactFragmentWrap = {};

    DionysusApolloAreaOfRestRowAppendOfRestPeriodChip = {};

    DionysusApolloAreaOfRestRowLabelOfRestPeriodTypography = {};

    DionysusApolloAreaOfRestRowDiv = {};

    DionysusApolloAreaOfRestDiv = {};

    DionysusApolloIntervalOfTaskLabelOfIntervalOfTaskTypography = {};

    DionysusApolloIntervalOfTaskDivWrap = {};

    DionysusApolloIntervalOfTaskTextField = {};

    DionysusApolloDurationOfTaskLabelOfDurationOfTaskTypography = {};

    DionysusApolloDurationOfTaskDivWrap = {};

    DionysusApolloDurationOfTaskTextField = {};

    DionysusApolloLineDiv = {};

    DionysusApolloPeriodOfTimeMainTimeOfEndLabelOfTimeOfEndTypography = {};

    DionysusApolloPeriodOfTimeMainTimeOfEndDivWrap = {};

    DionysusApolloPeriodOfTimeMainTimeOfEndTimePicker = {};

    DionysusApolloPeriodOfTimeMainTimeOfStartLabelOfTimeOfStartTypography = {};

    DionysusApolloPeriodOfTimeMainTimeOfStartDivWrap = {};

    DionysusApolloPeriodOfTimeMainTimeOfStartTimePicker = {};

    DionysusApolloPeriodOfTimeMainDiv = {};

    DionysusApolloPeriodOfTimeSectionLineDiv = {};

    DionysusApolloPeriodOfTimeSectionLabelOfTimePeriodTypography = {};

    DionysusApolloPeriodOfTimeSectionDiv = {};

    DionysusApolloPeriodOfTimeDiv = {};

    DionysusApolloPeriodOfDateMainEndOfDateLabelOfEndOfDateTypography = {};

    DionysusApolloPeriodOfDateMainEndOfDateDivWrap = {};

    DionysusApolloPeriodOfDateMainEndOfDateDatePicker = {};

    DionysusApolloPeriodOfDateMainStartOfDateLabelOfStartOfDateTypography = {};

    DionysusApolloPeriodOfDateMainStartOfDateDivWrap = {};

    DionysusApolloPeriodOfDateMainStartOfDateDatePicker = {};

    DionysusApolloPeriodOfDateMainDiv = {};

    DionysusApolloPeriodOfDateSectionLineDiv = {};

    DionysusApolloPeriodOfDateSectionLabelOfDatePeriodTypography = {};

    DionysusApolloPeriodOfDateSectionDiv = {};

    DionysusApolloPeriodOfDateDiv = {};

    DionysusApolloDivWrap = {};

    DionysusApolloPaper = {};

    /** => following for eros  component  */

    DionysusErosAreaOfLinepaySetArrowOfLinepaySetIconNavigateNext = {};

    DionysusErosAreaOfLinepaySetArrowOfLinepaySetReactFragmentWrap = {};

    DionysusErosAreaOfLinepaySetArrowOfLinepaySetIconButton = {};

    DionysusErosAreaOfLinepaySetOptionOfLinepaySetContentTypography = {};

    DionysusErosAreaOfLinepaySetOptionOfLinepaySetTitleTypography = {};

    DionysusErosAreaOfLinepaySetDivWrap = {};

    DionysusErosAreaOfLinepaySetDiv = {};

    DionysusErosAreaOfTabCreatorArrowOfTabCreatorIconNavigateNext = {};

    DionysusErosAreaOfTabCreatorArrowOfTabCreatorReactFragmentWrap = {};

    DionysusErosAreaOfTabCreatorArrowOfTabCreatorIconButton = {};

    DionysusErosAreaOfTabCreatorOptionOfTabCreatorContentTypography = {};

    DionysusErosAreaOfTabCreatorOptionOfTabCreatorTitleTypography = {};

    DionysusErosAreaOfTabCreatorDivWrap = {};

    DionysusErosAreaOfTabCreatorDiv = {};

    DionysusErosAreaOfBrandNameArrowOfBrandNameIconNavigateNext = {};

    DionysusErosAreaOfBrandNameArrowOfBrandNameReactFragmentWrap = {};

    DionysusErosAreaOfBrandNameArrowOfBrandNameIconButton = {};

    DionysusErosAreaOfBrandNameOptionOfBrandNameContentTypography = {};

    DionysusErosAreaOfBrandNameOptionOfBrandNameTitleTypography = {};

    DionysusErosAreaOfBrandNameDivWrap = {};

    DionysusErosAreaOfBrandNameDiv = {};

    DionysusErosDivWrap = {};

    DionysusErosDiv = {};

    /** => following for gaia  component  */

    DionysusGaiaFuncDeletedReactFragmentWrap = {};

    DionysusGaiaFuncDeletedChip = {};

    DionysusGaiaFuncRecoverChip = {};

    DionysusGaiaFuncCreateChip = {};

    DionysusGaiaFuncDiv = {};

    DionysusGaiaAreaOfDescriptionStatementTextField = {};

    DionysusGaiaAreaOfDescriptionRowStmtOfDescriptionMaximumTypography = {};

    DionysusGaiaAreaOfDescriptionRowLabelOfDescriptionTypography = {};

    DionysusGaiaAreaOfDescriptionRowDiv = {};

    DionysusGaiaAreaOfDescriptionDiv = {};

    DionysusGaiaAreaOfStatusVisibilitySwitch = {};

    DionysusGaiaAreaOfStatusLabelOfStatusTypography = {};

    DionysusGaiaAreaOfStatusDiv = {};

    DionysusGaiaAreaOfTrunkUseMainTrunkSwitch = {};

    DionysusGaiaAreaOfTrunkLabelOfTrunkTypography = {};

    DionysusGaiaAreaOfTrunkDiv = {};

    DionysusGaiaAreaOfTabSetArrowOfTabSetIconNavigateNext = {};

    DionysusGaiaAreaOfTabSetArrowOfTabSetReactFragmentWrap = {};

    DionysusGaiaAreaOfTabSetArrowOfTabSetIconButton = {};

    DionysusGaiaAreaOfTabSetOptionOfTabSetContentTypography = {};

    DionysusGaiaAreaOfTabSetOptionOfTabSetTitleTypography = {};

    DionysusGaiaAreaOfTabSetDivWrap = {};

    DionysusGaiaAreaOfTabSetDiv = {};

    DionysusGaiaAreaOfPhotoSetArrowOfPhotoSetIconNavigateNext = {};

    DionysusGaiaAreaOfPhotoSetArrowOfPhotoSetReactFragmentWrap = {};

    DionysusGaiaAreaOfPhotoSetArrowOfPhotoSetIconButton = {};

    DionysusGaiaAreaOfPhotoSetOptionOfPhotoSetContentTypography = {};

    DionysusGaiaAreaOfPhotoSetOptionOfPhotoSetTitleTypography = {};

    DionysusGaiaAreaOfPhotoSetDivWrap = {};

    DionysusGaiaAreaOfPhotoSetDiv = {};

    DionysusGaiaAreaOfQuantitySetArrowOfQuantitySetIconNavigateNext = {};

    DionysusGaiaAreaOfQuantitySetArrowOfQuantitySetReactFragmentWrap = {};

    DionysusGaiaAreaOfQuantitySetArrowOfQuantitySetIconButton = {};

    DionysusGaiaAreaOfQuantitySetOptionOfQuantitySetContentTypography = {};

    DionysusGaiaAreaOfQuantitySetOptionOfQuantitySetTitleTypography = {};

    DionysusGaiaAreaOfQuantitySetDivWrap = {};

    DionysusGaiaAreaOfQuantitySetDiv = {};

    DionysusGaiaAreaOfPriceSetArrowOfPriceSetIconNavigateNext = {};

    DionysusGaiaAreaOfPriceSetArrowOfPriceSetReactFragmentWrap = {};

    DionysusGaiaAreaOfPriceSetArrowOfPriceSetIconButton = {};

    DionysusGaiaAreaOfPriceSetOptionOfPriceSetContentTypography = {};

    DionysusGaiaAreaOfPriceSetOptionOfPriceSetTitleTypography = {};

    DionysusGaiaAreaOfPriceSetDivWrap = {};

    DionysusGaiaAreaOfPriceSetDiv = {};

    DionysusGaiaAreaOfSubBriefSubLabelChip = {};

    DionysusGaiaAreaOfSubBriefSubDivList = {};

    DionysusGaiaAreaOfSubBriefSubDiv = {};

    DionysusGaiaAreaOfSubRowAppendSubReactFragmentWrap = {};

    DionysusGaiaAreaOfSubRowAppendSubChip = {};

    DionysusGaiaAreaOfSubRowLabelOfSubTypeTypography = {};

    DionysusGaiaAreaOfSubRowDiv = {};

    DionysusGaiaAreaOfSubDiv = {};

    DionysusGaiaAreaOfMainBriefMainLabelChip = {};

    DionysusGaiaAreaOfMainBriefMainDivList = {};

    DionysusGaiaAreaOfMainBriefMainDiv = {};

    DionysusGaiaAreaOfMainRowAppendTaskReactFragmentWrap = {};

    DionysusGaiaAreaOfMainRowAppendTaskChip = {};

    DionysusGaiaAreaOfMainRowAppendMainReactFragmentWrap = {};

    DionysusGaiaAreaOfMainRowAppendMainChip = {};

    DionysusGaiaAreaOfMainRowLabelOfMainTypeTypography = {};

    DionysusGaiaAreaOfMainRowDiv = {};

    DionysusGaiaAreaOfMainDiv = {};

    DionysusGaiaAreaOfPropTypeOfPropTextFieldList = {};

    DionysusGaiaAreaOfPropTypeOfPropMenuItem = {};

    DionysusGaiaAreaOfPropLabelOfPropTypography = {};

    DionysusGaiaAreaOfPropDiv = {};

    DionysusGaiaAreaOfNameNameTextField = {};

    DionysusGaiaAreaOfNameRowStmtOfNameMaximumTypography = {};

    DionysusGaiaAreaOfNameRowLabelOfNameTypography = {};

    DionysusGaiaAreaOfNameRowDiv = {};

    DionysusGaiaAreaOfNameDiv = {};

    DionysusGaiaAreaOfPhotoUploadBriefPhotoDeleteIconHighlightOffRounded = {};

    DionysusGaiaAreaOfPhotoUploadBriefPhotoDeleteIconButton = {};

    DionysusGaiaAreaOfPhotoUploadBriefPhotoHrefImg = {};

    DionysusGaiaAreaOfPhotoUploadBriefPhotoDivList = {};

    DionysusGaiaAreaOfPhotoUploadBriefPhotoDiv = {};

    DionysusGaiaAreaOfPhotoUploadRowJoinPhotoChip = {};

    DionysusGaiaAreaOfPhotoUploadRowLabelOfUploadPhotoTypography = {};

    DionysusGaiaAreaOfPhotoUploadRowDiv = {};

    DionysusGaiaAreaOfPhotoUploadDiv = {};

    DionysusGaiaDivWrap = {};

    DionysusGaiaDiv = {};

    /** => following for plutus  component  */

    DionysusPlutusFuncOfCheckoutSubmitDivWrap = {};

    DionysusPlutusFuncOfCheckoutSubmitChip = {};

    DionysusPlutusFuncOfCheckoutPriceOfTotalLabelOfPriceOfTotalTypography = {};

    DionysusPlutusFuncOfCheckoutPriceOfTotalDivWrap = {};

    DionysusPlutusFuncOfCheckoutPriceOfTotalTypography = {};

    DionysusPlutusFuncOfCheckoutWholeLabelOfWholeTypography = {};

    DionysusPlutusFuncOfCheckoutWholeDivWrap = {};

    DionysusPlutusFuncOfCheckoutWholeCheckbox = {};

    DionysusPlutusFuncOfCheckoutDivWrap = {};

    DionysusPlutusFuncOfCheckoutDiv = {};

    DionysusPlutusMainSummariseSeventhDistanceOfSashaDivWrap = {};

    DionysusPlutusMainSummariseSeventhDistanceOfSashaTypography = {};

    DionysusPlutusMainSummariseSeventhHeadLabelOfDistanceDivWrap = {};

    DionysusPlutusMainSummariseSeventhHeadLabelOfDistanceTypography = {};

    DionysusPlutusMainSummariseSeventhDiv = {};

    DionysusPlutusMainSummariseSixthProcedureOfPaymentDivWrap = {};

    DionysusPlutusMainSummariseSixthProcedureOfPaymentTypography = {};

    DionysusPlutusMainSummariseSixthHeadLabelOfPaymentProcedureDivWrap = {};

    DionysusPlutusMainSummariseSixthHeadLabelOfPaymentProcedureTypography = {};

    DionysusPlutusMainSummariseSixthDiv = {};

    DionysusPlutusMainSummariseFifthFeeOfPaymentLabelOfFeeOfPaymentTypography = {};

    DionysusPlutusMainSummariseFifthFeeOfPaymentDivWrap = {};

    DionysusPlutusMainSummariseFifthFeeOfPaymentTypography = {};

    DionysusPlutusMainSummariseFifthHeadLabelOfPaymentDivWrap = {};

    DionysusPlutusMainSummariseFifthHeadLabelOfPaymentTypography = {};

    DionysusPlutusMainSummariseFifthDiv = {};

    DionysusPlutusMainSummariseFourthFeeOfMemberDiscountLabelOfFeeOfMemberDiscountTypography = {};

    DionysusPlutusMainSummariseFourthFeeOfMemberDiscountDivWrap = {};

    DionysusPlutusMainSummariseFourthFeeOfMemberDiscountTypography = {};

    DionysusPlutusMainSummariseFourthHeadLabelOfMemberDiscountDivWrap = {};

    DionysusPlutusMainSummariseFourthHeadLabelOfMemberDiscountTypography = {};

    DionysusPlutusMainSummariseFourthDiv = {};

    DionysusPlutusMainSummariseThirdFeeOfTransportLabelOfFeeOfTransportTypography = {};

    DionysusPlutusMainSummariseThirdFeeOfTransportDivWrap = {};

    DionysusPlutusMainSummariseThirdFeeOfTransportTypography = {};

    DionysusPlutusMainSummariseThirdHeadLabelOfTransportDivWrap = {};

    DionysusPlutusMainSummariseThirdHeadLabelOfTransportTypography = {};

    DionysusPlutusMainSummariseThirdDiv = {};

    DionysusPlutusMainSummariseSecondDiscountLabelOfDiscountTypography = {};

    DionysusPlutusMainSummariseSecondDiscountDivWrap = {};

    DionysusPlutusMainSummariseSecondDiscountTypography = {};

    DionysusPlutusMainSummariseSecondHeadLabelOfDiscountDivWrap = {};

    DionysusPlutusMainSummariseSecondHeadLabelOfDiscountTypography = {};

    DionysusPlutusMainSummariseSecondDiv = {};

    DionysusPlutusMainSummariseFirstPriceLabelOfPriceTypography = {};

    DionysusPlutusMainSummariseFirstPriceDivWrap = {};

    DionysusPlutusMainSummariseFirstPriceTypography = {};

    DionysusPlutusMainSummariseFirstHeadLabelOfPriceDivWrap = {};

    DionysusPlutusMainSummariseFirstHeadLabelOfPriceTypography = {};

    DionysusPlutusMainSummariseFirstDiv = {};

    DionysusPlutusMainSummariseDiv = {};

    DionysusPlutusMainRemarkLabelOfRemarkTypography = {};

    DionysusPlutusMainRemarkDivWrap = {};

    DionysusPlutusMainRemarkTextField = {};

    DionysusPlutusMainLocationMainTailFindIconWifiFind = {};

    DionysusPlutusMainLocationMainTailFindIconButton = {};

    DionysusPlutusMainLocationMainTailAddressTextField = {};

    DionysusPlutusMainLocationMainTailDiv = {};

    DionysusPlutusMainLocationMainHeadDistrictTextFieldList = {};

    DionysusPlutusMainLocationMainHeadDistrictMenuItem = {};

    DionysusPlutusMainLocationMainHeadCityTextFieldList = {};

    DionysusPlutusMainLocationMainHeadCityMenuItem = {};

    DionysusPlutusMainLocationMainHeadDiv = {};

    DionysusPlutusMainLocationMainDiv = {};

    DionysusPlutusMainLocationHeadLabelOfAddressTypography = {};

    DionysusPlutusMainLocationDiv = {};

    DionysusPlutusMainPhoneLabelOfPhoneTypography = {};

    DionysusPlutusMainPhoneDivWrap = {};

    DionysusPlutusMainPhoneTextField = {};

    DionysusPlutusMainEmailLabelOfEmailTypography = {};

    DionysusPlutusMainEmailDivWrap = {};

    DionysusPlutusMainEmailTextField = {};

    DionysusPlutusMainNameLabelOfNameTypography = {};

    DionysusPlutusMainNameDivWrap = {};

    DionysusPlutusMainNameTextField = {};

    DionysusPlutusMainDiv = {};

    DionysusPlutusDivWrap = {};

    DionysusPlutusDiv = {};

    /** => following for hermes  component  */

    DionysusHermesFuncOfCheckoutSubmitDivWrap = {};

    DionysusHermesFuncOfCheckoutSubmitChip = {};

    DionysusHermesFuncOfCheckoutPriceOfTotalLabelOfPriceOfTotalTypography = {};

    DionysusHermesFuncOfCheckoutPriceOfTotalDivWrap = {};

    DionysusHermesFuncOfCheckoutPriceOfTotalTypography = {};

    DionysusHermesFuncOfCheckoutWholeLabelOfWholeTypography = {};

    DionysusHermesFuncOfCheckoutWholeDivWrap = {};

    DionysusHermesFuncOfCheckoutWholeCheckbox = {};

    DionysusHermesFuncOfCheckoutDivWrap = {};

    DionysusHermesFuncOfCheckoutDiv = {};

    DionysusHermesTransportPriceLabelOfPriceTypography = {};

    DionysusHermesTransportPriceDivWrap = {};

    DionysusHermesTransportPriceTypography = {};

    DionysusHermesTransportMainDescriptionTypography = {};

    DionysusHermesTransportMainTopPhotoImg = {};

    DionysusHermesTransportMainTopNameTypography = {};

    DionysusHermesTransportMainTopDiv = {};

    DionysusHermesTransportMainDiv = {};

    DionysusHermesTransportChoiceDivWrap = {};

    DionysusHermesTransportChoiceCheckbox = {};

    DionysusHermesTransportDivList = {};

    DionysusHermesTransportDiv = {};

    DionysusHermesDivWrap = {};

    DionysusHermesDiv = {};

    /** => following for cartie  component  */

    DionysusCartieFuncOfCheckoutSubmitDivWrap = {};

    DionysusCartieFuncOfCheckoutSubmitChip = {};

    DionysusCartieFuncOfCheckoutPriceOfTotalLabelOfPriceOfTotalTypography = {};

    DionysusCartieFuncOfCheckoutPriceOfTotalDivWrap = {};

    DionysusCartieFuncOfCheckoutPriceOfTotalTypography = {};

    DionysusCartieFuncOfCheckoutWholeLabelOfWholeTypography = {};

    DionysusCartieFuncOfCheckoutWholeDivWrap = {};

    DionysusCartieFuncOfCheckoutWholeCheckbox = {};

    DionysusCartieFuncOfCheckoutDivWrap = {};

    DionysusCartieFuncOfCheckoutDiv = {};

    DionysusCartieMainSummariseDiscountOfMemberLabelOfDiscountOfMemberTypography = {};

    DionysusCartieMainSummariseDiscountOfMemberDivWrap = {};

    DionysusCartieMainSummariseDiscountOfMemberTypography = {};

    DionysusCartieMainSummarisePriceOfTransportLabelOfPriceOfTransportTypography = {};

    DionysusCartieMainSummarisePriceOfTransportDivWrap = {};

    DionysusCartieMainSummarisePriceOfTransportTypography = {};

    DionysusCartieMainSummarisePriceOfDiscountLabelOfPriceOfDiscountTypography = {};

    DionysusCartieMainSummarisePriceOfDiscountDivWrap = {};

    DionysusCartieMainSummarisePriceOfDiscountTypography = {};

    DionysusCartieMainSummarisePriceWithoutDiscountLabelOfPriceWithoutDiscountTypography = {};

    DionysusCartieMainSummarisePriceWithoutDiscountDivWrap = {};

    DionysusCartieMainSummarisePriceWithoutDiscountTypography = {};

    DionysusCartieMainSummariseDiv = {};

    DionysusCartieMainBriefSpecTipQuantityLabelOfQuantityTypography = {};

    DionysusCartieMainBriefSpecTipQuantityDivWrap = {};

    DionysusCartieMainBriefSpecTipQuantityTypography = {};

    DionysusCartieMainBriefSpecTipPriceB4DiscountDivWrap = {};

    DionysusCartieMainBriefSpecTipPriceB4DiscountTypography = {};

    DionysusCartieMainBriefSpecTipDiv = {};

    DionysusCartieMainBriefSpecLandConclusionOfQuantityIncreaseIconAdd = {};

    DionysusCartieMainBriefSpecLandConclusionOfQuantityIncreaseIconButton = {};

    DionysusCartieMainBriefSpecLandConclusionOfQuantityCountOfSubmitTextField = {};

    DionysusCartieMainBriefSpecLandConclusionOfQuantityDecreaseIconRemove = {};

    DionysusCartieMainBriefSpecLandConclusionOfQuantityDecreaseIconButton = {};

    DionysusCartieMainBriefSpecLandConclusionOfQuantityDivWrap = {};

    DionysusCartieMainBriefSpecLandConclusionOfQuantityDiv = {};

    DionysusCartieMainBriefSpecLandMainPriceLabelOfPriceTypography = {};

    DionysusCartieMainBriefSpecLandMainPriceDivWrap = {};

    DionysusCartieMainBriefSpecLandMainPriceTypography = {};

    DionysusCartieMainBriefSpecLandMainDiv = {};

    DionysusCartieMainBriefSpecLandDiv = {};

    DionysusCartieMainBriefSpecInfoOfBenefitTypography = {};

    DionysusCartieMainBriefSpecNameOfVariantChip = {};

    DionysusCartieMainBriefSpecFullCancelIconDeleteForeverRounded = {};

    DionysusCartieMainBriefSpecFullCancelIconButton = {};

    DionysusCartieMainBriefSpecFullNameDivWrap = {};

    DionysusCartieMainBriefSpecFullNameTypography = {};

    DionysusCartieMainBriefSpecFullDiv = {};

    DionysusCartieMainBriefSpecDiv = {};

    DionysusCartieMainBriefPhotoImg = {};

    DionysusCartieMainBriefSureDivWrap = {};

    DionysusCartieMainBriefSureCheckbox = {};

    DionysusCartieMainBriefDivList = {};

    DionysusCartieMainBriefDiv = {};

    DionysusCartieMainDiv = {};

    DionysusCartieDivWrap = {};

    DionysusCartieDiv = {};

    /** => following for maenads  component  */

    DionysusMaenadsSubmitDivWrap = {};

    DionysusMaenadsSubmitChip = {};

    DionysusMaenadsDecisionConclusionOfQuantityIncreaseIconAdd = {};

    DionysusMaenadsDecisionConclusionOfQuantityIncreaseIconButton = {};

    DionysusMaenadsDecisionConclusionOfQuantityCountOfSubmitTextField = {};

    DionysusMaenadsDecisionConclusionOfQuantityDecreaseIconRemove = {};

    DionysusMaenadsDecisionConclusionOfQuantityDecreaseIconButton = {};

    DionysusMaenadsDecisionConclusionOfQuantityDivWrap = {};

    DionysusMaenadsDecisionConclusionOfQuantityDiv = {};

    DionysusMaenadsDecisionTitleOfSubmitOrderDivWrap = {};

    DionysusMaenadsDecisionTitleOfSubmitOrderTypography = {};

    DionysusMaenadsDecisionDiv = {};

    DionysusMaenadsVariantOptionLabelChip = {};

    DionysusMaenadsVariantOptionDivList = {};

    DionysusMaenadsVariantOptionDiv = {};

    DionysusMaenadsVariantDivList = {};

    DionysusMaenadsVariantDiv = {};

    DionysusMaenadsTitleOfShapeTypography = {};

    DionysusMaenadsMainInfoCountLabelOfCountTypography = {};

    DionysusMaenadsMainInfoCountDivWrap = {};

    DionysusMaenadsMainInfoCountTypography = {};

    DionysusMaenadsMainInfoRowPriceLabelOfPriceTypography = {};

    DionysusMaenadsMainInfoRowPriceDivWrap = {};

    DionysusMaenadsMainInfoRowPriceTypography = {};

    DionysusMaenadsMainInfoRowRangeOfPriceTypography = {};

    DionysusMaenadsMainInfoRowDiv = {};

    DionysusMaenadsMainInfoDiv = {};

    DionysusMaenadsMainPhotoImg = {};

    DionysusMaenadsMainDiv = {};

    DionysusMaenadsDivWrap = {};

    DionysusMaenadsPaper = {};

    /** => following for bacchus  component  */

    DionysusBacchusFuncEditChip = {};

    DionysusBacchusFuncBoughtReactFragmentWrap = {};

    DionysusBacchusFuncBoughtChip = {};

    DionysusBacchusFuncJoinToCartReactFragmentWrap = {};

    DionysusBacchusFuncJoinToCartChip = {};

    DionysusBacchusFuncBackToHomeChip = {};

    DionysusBacchusFuncDivWrap = {};

    DionysusBacchusFuncDiv = {};

    DionysusBacchusDetailContentPhotoHrefImg = {};

    DionysusBacchusDetailContentPhotoDivList = {};

    DionysusBacchusDetailContentPhotoDiv = {};

    DionysusBacchusDetailContentStatementTypography = {};

    DionysusBacchusDetailContentDiv = {};

    DionysusBacchusDetailAreaOfBenefitArrowOfBenefitIconNavigateNext = {};

    DionysusBacchusDetailAreaOfBenefitArrowOfBenefitIconButton = {};

    DionysusBacchusDetailAreaOfBenefitOptionOfBenefitContentTypography = {};

    DionysusBacchusDetailAreaOfBenefitOptionOfBenefitTitleTypography = {};

    DionysusBacchusDetailAreaOfBenefitDiv = {};

    DionysusBacchusDetailAreaOfShippingArrowOfShippingIconNavigateNext = {};

    DionysusBacchusDetailAreaOfShippingArrowOfShippingIconButton = {};

    DionysusBacchusDetailAreaOfShippingOptionOfShippingContentTypography = {};

    DionysusBacchusDetailAreaOfShippingOptionOfShippingTitleTypography = {};

    DionysusBacchusDetailAreaOfShippingDiv = {};

    DionysusBacchusDetailAreaOfPayArrowOfPayIconNavigateNext = {};

    DionysusBacchusDetailAreaOfPayArrowOfPayIconButton = {};

    DionysusBacchusDetailAreaOfPayOptionOfPayContentTypography = {};

    DionysusBacchusDetailAreaOfPayOptionOfPayTitleTypography = {};

    DionysusBacchusDetailAreaOfPayDiv = {};

    DionysusBacchusDetailDiv = {};

    DionysusBacchusNameDivWrap = {};

    DionysusBacchusNameTypography = {};

    DionysusBacchusRangeOfPriceDivWrap = {};

    DionysusBacchusRangeOfPriceTypography = {};

    DionysusBacchusBannerImageDivWrap = {};

    DionysusBacchusBannerImageImg = {};

    DionysusBacchusBannerSwiperList = {};

    DionysusBacchusBannerSwiperSlide = {};

    DionysusBacchusDivWrap = {};

    DionysusBacchusDiv = {};

    /** => following for hestia  component  */

    DionysusHestiaDivWrap = {};

    DionysusHestiaDiv = {};

    /** => following for dionysus  component  */

    DionysusSelectTabSkeleton = {};

    DionysusSelectTabsList = {};

    DionysusSelectTab = {};

    DionysusBoozeRowTailCartIconShoppingCartTwoTone = {};

    DionysusBoozeRowTailCartReactFragmentWrap = {};

    DionysusBoozeRowTailCartIconButton = {};

    DionysusBoozeRowTailDiv = {};

    DionysusBoozeRowMainPriceB4DiscountTypography = {};

    DionysusBoozeRowMainPriceTypography = {};

    DionysusBoozeRowMainDollarsTypography = {};

    DionysusBoozeRowMainDiv = {};

    DionysusBoozeRowDiv = {};

    DionysusBoozeNameDivWrap = {};

    DionysusBoozeNameTypography = {};

    DionysusBoozePhotoOfDemoImg = {};

    DionysusBoozeDivSkeleton = {};

    DionysusBoozeDivList = {};

    DionysusBoozeDiv = {};

    DionysusDivWrap = {};

    DionysusDiv = {};

    /** => following for account  component  */

    AccountFuncAreaOfEditBtnOfJoinReaderReactFragmentWrap = {};

    AccountFuncAreaOfEditBtnOfJoinReaderButton = {};

    AccountFuncAreaOfEditBtnOfJoinAdminReactFragmentWrap = {};

    AccountFuncAreaOfEditBtnOfJoinAdminButton = {};

    AccountFuncAreaOfEditCleanCacheButton = {};

    AccountFuncAreaOfEditToEditModeButton = {};

    AccountFuncAreaOfEditLogoutReactFragmentWrap = {};

    AccountFuncAreaOfEditLogoutButton = {};

    AccountFuncAreaOfEditCopyUserIdButton = {};

    AccountFuncAreaOfEditLangTextFieldList = {};

    AccountFuncAreaOfEditLangMenuItem = {};

    AccountFuncAreaOfEditDiv = {};

    AccountFuncAreaOfIdStateAreaOfIdValueOfIdTypography = {};

    AccountFuncAreaOfIdStateAreaOfIdLabelOfIdTypography = {};

    AccountFuncAreaOfIdStateAreaOfIdDiv = {};

    AccountFuncAreaOfIdDiv = {};

    AccountFuncAreaOfEmailStateAreaOfEmailValueOfEmailTypography = {};

    AccountFuncAreaOfEmailStateAreaOfEmailLabelOfEmailTypography = {};

    AccountFuncAreaOfEmailStateAreaOfEmailDiv = {};

    AccountFuncAreaOfEmailDiv = {};

    AccountSpaceDiv = {};

    AccountFuncAreaOfNameStateAreaOfNameValueOfNameTypography = {};

    AccountFuncAreaOfNameStateAreaOfNameLabelOfNameTypography = {};

    AccountFuncAreaOfNameStateAreaOfNameDiv = {};

    AccountFuncAreaOfNameDiv = {};

    AccountUrlOfHeadPhotoAvatar = {};

    AccountDivWrap = {};

    AccountPaper = {};

    /** => following for epayTest  component  */

    EpayTestFindLinePayPageByIdButton = {};

    EpayTestFindEcPayPageByIdButton = {};

    EpayTestIdOfPreciseOrderInputTextField = {};

    EpayTestIdOfCurrentPreciseOrderTypography = {};

    EpayTestCheckoutByEcPayButton = {};

    EpayTestCheckoutByLinePayButton = {};

    EpayTestCancelPreciseOrderButton = {};

    EpayTestCreatePreciseOrderButton = {};

    EpayTestDiv = {};

    /** => following for main  component  */

    MainTestTestUsageButton = {};

    MainTestAgodaDateTimeRangePicker = {};

    MainTestTrivagoDateRangePicker = {};

    MainTestFullDateTimePicker = {};

    MainTestEndDatePicker = {};

    MainTestClockTimePicker = {};

    MainTestGotoHistoryButton = {};

    MainTestGoGaiaButton = {};

    MainTestGoErosButton = {};

    MainTestGoToBackUpButton = {};

    MainTestGoMarketButton = {};

    MainTestEpayTestButton = {};

    MainTestSubTitleTypography = {};

    MainTestTitleTypography = {};

    MainTestDiv = {};

    MainBannerImageDivWrap = {};

    MainBannerImageImg = {};

    MainBannerSwiperList = {};

    MainBannerSwiperSlide = {};

    MainDiv = {};

    /** -------------------- functions -------------------- **/

    constructor(props) {}

    /** -------------------- async api -------------------- **/
}

export default new MobileStyle();
