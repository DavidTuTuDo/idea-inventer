import {
  utiller as Util,
  exceptioner as ERROR,
  pooller as InfinitePool,
} from "utiller";
import _ from "lodash";
import libpath from "path";

class CommonStyle {
  /** -------------------- fields -------------------- **/

  /** => following for main editor component  */

  MainEditorTestSubTitleTextField = {};

  MainEditorTestTitleTextField = {};

  MainEditorTestDivWrap = {};

  MainEditorTestDiv = {};

  MainEditorDiv = {};

  /** => following for navigator  component  */

  NavigatorDrawerShortcutIconImg = {};

  NavigatorDrawerShortcutTitleTypography = {};

  NavigatorDrawerShortcutListItemSkeleton = {};

  NavigatorDrawerShortcutListList = {};

  NavigatorDrawerShortcutListItem = {};

  NavigatorDrawerDrawer = {};

  NavigatorToolBarAccountHeadAccountCircle = {};

  NavigatorToolBarAccountReactFragmentWrap = {};

  NavigatorToolBarAccountIconButton = {};

  NavigatorToolBarLoginButton = {};

  NavigatorToolBarCompleteInputFormWrap = {};

  NavigatorToolBarCompleteInputTextField = {};

  NavigatorToolBarCompleteAutocomplete = {};

  NavigatorToolBarTitleTypography = {};

  NavigatorToolBarMenuIconMenuIcon = {};

  NavigatorToolBarMenuIconButton = {};

  NavigatorToolBarAppBarWrap = {};

  NavigatorToolBarToolbar = {};

  NavigatorDiv = {};

  /** => following for epayPurchaseCheckout  component  */

  EpayPurchaseCheckoutDiv = {};

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

  /** => following for methodOfPayment  component  */

  MethodOfPaymentOptionDescriptionTypography = {};

  MethodOfPaymentOptionImageImg = {};

  MethodOfPaymentOptionNameTypography = {};

  MethodOfPaymentOptionCardSkeleton = {};

  MethodOfPaymentOptionDivList = {};

  MethodOfPaymentOptionCard = {};

  MethodOfPaymentTitleTypography = {};

  MethodOfPaymentPaper = {};

  /** => following for epayBehaviorOfConfirmLinePay  component  */

  EpayBehaviorOfConfirmLinePayMessageOfFreezeTypography = {};

  EpayBehaviorOfConfirmLinePayDiv = {};

  /** => following for epay  component  */

  EpayMessageOfEPayTypography = {};

  EpayDiv = {};

  /** => following for account  component  */

  AccountFuncAreaOfEditToEditModeButton = {};

  AccountFuncAreaOfEditLogoutReactFragmentWrap = {};

  AccountFuncAreaOfEditLogoutButton = {};

  AccountFuncAreaOfEditCopyUserIdButton = {};

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

  MainTestSubTitleTypography = {};

  MainTestTitleTypography = {};

  MainTestDiv = {};

  MainDiv = {};

  /** -------------------- functions -------------------- **/

  constructor(props) {}
  /** -------------------- async api -------------------- **/
}
export default new CommonStyle();
