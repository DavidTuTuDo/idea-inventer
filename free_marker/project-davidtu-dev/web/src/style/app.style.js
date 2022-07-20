import {
  utiller as Util,
  exceptioner as ERROR,
  pooller as InfinitePool,
} from "utiller";
import _ from "lodash";
import libpath from "path";

class AppStyle {
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

  /** => following for epayPurchaseOfHistory  component  */

  EpayPurchaseOfHistoryOrderAreaOfFuncCheckoutButton = {};

  EpayPurchaseOfHistoryOrderAreaOfFuncDiv = {};

  EpayPurchaseOfHistoryOrderAreaOfPaymentInfoAreaOfCodeCopyButton = {};

  EpayPurchaseOfHistoryOrderAreaOfPaymentInfoAreaOfCodeCodeLabelOfCodeTypography = {};

  EpayPurchaseOfHistoryOrderAreaOfPaymentInfoAreaOfCodeCodeDivWrap = {};

  EpayPurchaseOfHistoryOrderAreaOfPaymentInfoAreaOfCodeCodeTypography = {};

  EpayPurchaseOfHistoryOrderAreaOfPaymentInfoAreaOfCodeDiv = {};

  EpayPurchaseOfHistoryOrderAreaOfPaymentInfoDomainLabelOfDomainTypography = {};

  EpayPurchaseOfHistoryOrderAreaOfPaymentInfoDomainDivWrap = {};

  EpayPurchaseOfHistoryOrderAreaOfPaymentInfoDomainTypography = {};

  EpayPurchaseOfHistoryOrderAreaOfPaymentInfoDeadlineLabelOfDeadlineTypography = {};

  EpayPurchaseOfHistoryOrderAreaOfPaymentInfoDeadlineDivWrap = {};

  EpayPurchaseOfHistoryOrderAreaOfPaymentInfoDeadlineTypography = {};

  EpayPurchaseOfHistoryOrderAreaOfPaymentInfoRuleLabelOfRuleTypography = {};

  EpayPurchaseOfHistoryOrderAreaOfPaymentInfoRuleDivWrap = {};

  EpayPurchaseOfHistoryOrderAreaOfPaymentInfoRuleTypography = {};

  EpayPurchaseOfHistoryOrderAreaOfPaymentInfoDivWrap = {};

  EpayPurchaseOfHistoryOrderAreaOfPaymentInfoDiv = {};

  EpayPurchaseOfHistoryOrderAreaOfTotalPriceValueOfTotalPriceTypography = {};

  EpayPurchaseOfHistoryOrderAreaOfTotalPriceLabelOfTotalPriceTypography = {};

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

  EpayPurchaseOfHistoryOrderAreaOfTopSectionOfHeadCopyIdentityOfOrderButton = {};

  EpayPurchaseOfHistoryOrderAreaOfTopSectionOfHeadStringOfOrderIdentityTypography = {};

  EpayPurchaseOfHistoryOrderAreaOfTopSectionOfHeadDiv = {};

  EpayPurchaseOfHistoryOrderAreaOfTopDiv = {};

  EpayPurchaseOfHistoryOrderDivList = {};

  EpayPurchaseOfHistoryOrderCard = {};

  EpayPurchaseOfHistoryTabTabsList = {};

  EpayPurchaseOfHistoryTabTab = {};

  EpayPurchaseOfHistoryDiv = {};

  /** => following for epayBehaviorOfConfirmLinePay  component  */

  EpayBehaviorOfConfirmLinePayMessageOfFreezeTypography = {};

  EpayBehaviorOfConfirmLinePayDiv = {};

  /** => following for epay  component  */

  EpayStatementTypography = {};

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
export default new AppStyle();
