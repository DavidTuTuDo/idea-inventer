import { utiller as Util, exceptioner as ERROR, pooller as InfinitePool } from "utiller";
import _ from "lodash";
import libpath from "path";

class MobileStyle {
  /** -------------------- fields -------------------- **/

  /** following for homeless */

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

  MainEditorTestAgodaTextField = {};

  MainEditorTestTrivagoTextField = {};

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

  MainEditorBannerSwiperSlide = {};

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

  NavigatorToolBarAccountHeadAccountCircle = {};

  NavigatorToolBarAccountReactFragmentWrap = {};

  NavigatorToolBarAccountIconButton = {};

  NavigatorToolBarLoginButton = {};

  NavigatorToolBarCompleteInputOfCompleteFormWrap = {};

  NavigatorToolBarCompleteInputOfCompleteTextField = {};

  NavigatorToolBarCompleteAutocomplete = {};

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

  InfoOfCopyRightContentCancelButton = {};

  InfoOfCopyRightContentDivWrap = {};

  InfoOfCopyRightContentPaper = {};

  /** => following for infoOfCopyRightContact  component  */

  InfoOfCopyRightContactCancelButton = {};

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

  /** => following for epayPurchaseOfHistory  component  */

  EpayPurchaseOfHistoryOrderAreaOfPaymentFailureReasonLabelOfReasonTypography = {};

  EpayPurchaseOfHistoryOrderAreaOfPaymentFailureReasonDivWrap = {};

  EpayPurchaseOfHistoryOrderAreaOfPaymentFailureReasonTypography = {};

  EpayPurchaseOfHistoryOrderAreaOfPaymentFailureDiv = {};

  EpayPurchaseOfHistoryOrderAreaOfFuncCheckoutButton = {};

  EpayPurchaseOfHistoryOrderAreaOfFuncDiv = {};

  EpayPurchaseOfHistoryOrderAreaOfPaymentDetailSectionOfCodeCopyIconCopyAll = {};

  EpayPurchaseOfHistoryOrderAreaOfPaymentDetailSectionOfCodeCopyIconButton = {};

  EpayPurchaseOfHistoryOrderAreaOfPaymentDetailSectionOfCodeCodeLabelOfCodeTypography = {};

  EpayPurchaseOfHistoryOrderAreaOfPaymentDetailSectionOfCodeCodeDivWrap = {};

  EpayPurchaseOfHistoryOrderAreaOfPaymentDetailSectionOfCodeCodeTypography = {};

  EpayPurchaseOfHistoryOrderAreaOfPaymentDetailSectionOfCodeDiv = {};

  EpayPurchaseOfHistoryOrderAreaOfPaymentDetailDomainLabelOfDomainTypography = {};

  EpayPurchaseOfHistoryOrderAreaOfPaymentDetailDomainDivWrap = {};

  EpayPurchaseOfHistoryOrderAreaOfPaymentDetailDomainTypography = {};

  EpayPurchaseOfHistoryOrderAreaOfPaymentDetailDivWrap = {};

  EpayPurchaseOfHistoryOrderAreaOfPaymentDetailDiv = {};

  EpayPurchaseOfHistoryOrderAreaOfPaymentDeadlineDeadlineLabelOfDeadlineTypography = {};

  EpayPurchaseOfHistoryOrderAreaOfPaymentDeadlineDeadlineDivWrap = {};

  EpayPurchaseOfHistoryOrderAreaOfPaymentDeadlineDeadlineTypography = {};

  EpayPurchaseOfHistoryOrderAreaOfPaymentDeadlineDiv = {};

  EpayPurchaseOfHistoryOrderAreaOfPaymentRuleRuleLabelOfRuleTypography = {};

  EpayPurchaseOfHistoryOrderAreaOfPaymentRuleRuleDivWrap = {};

  EpayPurchaseOfHistoryOrderAreaOfPaymentRuleRuleTypography = {};

  EpayPurchaseOfHistoryOrderAreaOfPaymentRuleDiv = {};

  EpayPurchaseOfHistoryOrderAreaOfInputMessageValueTextField = {};

  EpayPurchaseOfHistoryOrderAreaOfInputMessageLabelTypography = {};

  EpayPurchaseOfHistoryOrderAreaOfInputMessageDiv = {};

  EpayPurchaseOfHistoryOrderAreaOfChoosePaymentTypeSectionOfChooseTypeArrowIconChevronRight = {};

  EpayPurchaseOfHistoryOrderAreaOfChoosePaymentTypeSectionOfChooseTypeArrowReactFragmentWrap = {};

  EpayPurchaseOfHistoryOrderAreaOfChoosePaymentTypeSectionOfChooseTypeArrowIconButton = {};

  EpayPurchaseOfHistoryOrderAreaOfChoosePaymentTypeSectionOfChooseTypeValueOfPaymentTypeTypography = {};

  EpayPurchaseOfHistoryOrderAreaOfChoosePaymentTypeSectionOfChooseTypeDiv = {};

  EpayPurchaseOfHistoryOrderAreaOfChoosePaymentTypeLabelOfPaymentTypeTypography = {};

  EpayPurchaseOfHistoryOrderAreaOfChoosePaymentTypeDiv = {};

  EpayPurchaseOfHistoryOrderAreaOfTotalPriceValueOfTotalPriceLabelOfValueOfTotalPriceTypography = {};

  EpayPurchaseOfHistoryOrderAreaOfTotalPriceValueOfTotalPriceDivWrap = {};

  EpayPurchaseOfHistoryOrderAreaOfTotalPriceValueOfTotalPriceTypography = {};

  EpayPurchaseOfHistoryOrderAreaOfTotalPriceDiv = {};

  EpayPurchaseOfHistoryOrderBriefSectionOfDescriptionPriceTypography = {};

  EpayPurchaseOfHistoryOrderBriefSectionOfDescriptionQuantityTypography = {};

  EpayPurchaseOfHistoryOrderBriefSectionOfDescriptionSpecificOfProductTypography = {};

  EpayPurchaseOfHistoryOrderBriefSectionOfDescriptionNameOfProductDivWrap = {};

  EpayPurchaseOfHistoryOrderBriefSectionOfDescriptionNameOfProductTypography = {};

  EpayPurchaseOfHistoryOrderBriefSectionOfDescriptionDiv = {};

  EpayPurchaseOfHistoryOrderBriefImageOfProductPhotoImg = {};

  EpayPurchaseOfHistoryOrderBriefDivList = {};

  EpayPurchaseOfHistoryOrderBriefDiv = {};

  EpayPurchaseOfHistoryOrderAreaOfTopSectionOfTailExtraIconMoreHoriz = {};

  EpayPurchaseOfHistoryOrderAreaOfTopSectionOfTailExtraReactFragmentWrap = {};

  EpayPurchaseOfHistoryOrderAreaOfTopSectionOfTailExtraIconButton = {};

  EpayPurchaseOfHistoryOrderAreaOfTopSectionOfTailStateOfOrderTypography = {};

  EpayPurchaseOfHistoryOrderAreaOfTopSectionOfTailDiv = {};

  EpayPurchaseOfHistoryOrderAreaOfTopSectionOfHeadCopyIdIconCopyAll = {};

  EpayPurchaseOfHistoryOrderAreaOfTopSectionOfHeadCopyIdIconButton = {};

  EpayPurchaseOfHistoryOrderAreaOfTopSectionOfHeadStringOfOrderIdentityLabelOfStringOfOrderIdentityTypography = {};

  EpayPurchaseOfHistoryOrderAreaOfTopSectionOfHeadStringOfOrderIdentityDivWrap = {};

  EpayPurchaseOfHistoryOrderAreaOfTopSectionOfHeadStringOfOrderIdentityTypography = {};

  EpayPurchaseOfHistoryOrderAreaOfTopSectionOfHeadDiv = {};

  EpayPurchaseOfHistoryOrderAreaOfTopDiv = {};

  EpayPurchaseOfHistoryOrderDivList = {};

  EpayPurchaseOfHistoryOrderCard = {};

  EpayPurchaseOfHistoryTabTabsList = {};

  EpayPurchaseOfHistoryTabTab = {};

  EpayPurchaseOfHistoryDiv = {};

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

  EpayBehaviorOfConfirmLinePayDiv = {};

  /** => following for epay  component  */

  EpayMessageOfEPayTypography = {};

  EpayDiv = {};

  /** => following for account  component  */

  AccountFuncAreaOfEditBtnOfJoinReaderReactFragmentWrap = {};

  AccountFuncAreaOfEditBtnOfJoinReaderButton = {};

  AccountFuncAreaOfEditBtnOfJoinAdminReactFragmentWrap = {};

  AccountFuncAreaOfEditBtnOfJoinAdminButton = {};

  AccountFuncAreaOfEditToEditModeButton = {};

  AccountFuncAreaOfEditLogoutReactFragmentWrap = {};

  AccountFuncAreaOfEditLogoutButton = {};

  AccountFuncAreaOfEditCopyUserIdButton = {};

  AccountFuncAreaOfEditLangMenuItem = {};

  AccountFuncAreaOfEditLangTextFieldList = {};

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

  MainTestEpayTestButton = {};

  MainTestSubTitleTypography = {};

  MainTestTitleTypography = {};

  MainTestDiv = {};

  MainBannerImageDivWrap = {};

  MainBannerImageImg = {};

  MainBannerSwiperSlide = {};

  MainBannerSwiperList = {};

  MainBannerSwiperSlide = {};

  MainDiv = {};

  /** -------------------- functions -------------------- **/

  constructor(props) {}

  /** -------------------- async api -------------------- **/
}

export default new MobileStyle();
