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

  /** => following for addition  component  */

  AdditionAreaOfBatchBatchCancelChip = {};

  AdditionAreaOfBatchBatchUpdateChip = {};

  AdditionAreaOfBatchDiv = {};

  AdditionMemberAreaOfFuncCancelReactFragmentWrap = {};

  AdditionMemberAreaOfFuncCancelButton = {};

  AdditionMemberAreaOfFuncUpdateButton = {};

  AdditionMemberAreaOfFuncSubmitButton = {};

  AdditionMemberAreaOfFuncDiv = {};

  AdditionMemberAreaOfExtraCommentTextField = {};

  AdditionMemberAreaOfExtraDiv = {};

  AdditionMemberAreaOfCreditCodeOfCreditAuthTextField = {};

  AdditionMemberAreaOfCreditSerialOfCreditTextField = {};

  AdditionMemberAreaOfCreditDiv = {};

  AdditionMemberAreaOfPayPayMethodMenuItem = {};

  AdditionMemberAreaOfPayPayMethodTextFieldList = {};

  AdditionMemberAreaOfPayFeeOfPaidTextField = {};

  AdditionMemberAreaOfPayFeeOfTotalTextField = {};

  AdditionMemberAreaOfPayDiv = {};

  AdditionMemberChargeLabelOfChargeTypography = {};

  AdditionMemberChargeDivWrap = {};

  AdditionMemberChargeCheckbox = {};

  AdditionMemberAreaOfInternationCitizenMenuItem = {};

  AdditionMemberAreaOfInternationCitizenTextFieldList = {};

  AdditionMemberAreaOfInternationPassportTextField = {};

  AdditionMemberAreaOfInternationDiv = {};

  AdditionMemberAreaOfPersonAgeMenuItem = {};

  AdditionMemberAreaOfPersonAgeTextFieldList = {};

  AdditionMemberAreaOfPersonGenderMenuItem = {};

  AdditionMemberAreaOfPersonGenderTextFieldList = {};

  AdditionMemberAreaOfPersonDiv = {};

  AdditionMemberAreaOfPrivacySerialOfIdentityTextField = {};

  AdditionMemberAreaOfPrivacyBirthdayLocalizationProviderWrap = {};

  AdditionMemberAreaOfPrivacyBirthdayDatePicker = {};

  AdditionMemberAreaOfPrivacyDiv = {};

  AdditionMemberAreaOfContactPhoneTextField = {};

  AdditionMemberAreaOfContactNameTextField = {};

  AdditionMemberAreaOfContactDiv = {};

  AdditionMemberDivList = {};

  AdditionMemberCard = {};

  AdditionDiv = {};

  /** => following for establish  component  */

  EstablishAreaOfRemoteClearChip = {};

  EstablishAreaOfRemoteCancelReactFragmentWrap = {};

  EstablishAreaOfRemoteCancelChip = {};

  EstablishAreaOfRemoteUpdateChip = {};

  EstablishAreaOfRemoteSubmitChip = {};

  EstablishAreaOfRemoteDiv = {};

  EstablishCommentTextField = {};

  EstablishAreaOfBalanceBalanceTextField = {};

  EstablishAreaOfBalancePriceHasPaidTextField = {};

  EstablishAreaOfBalanceSalesmanMenuItem = {};

  EstablishAreaOfBalanceSalesmanTextFieldList = {};

  EstablishAreaOfBalanceDiv = {};

  EstablishAreaOfGroupPersonNameReactFragmentWrap = {};

  EstablishAreaOfGroupPersonNameChip = {};

  EstablishAreaOfGroupPersonDivList = {};

  EstablishAreaOfGroupPersonDiv = {};

  EstablishAreaOfGroupLabelOfListCountOfPeopleTextField = {};

  EstablishAreaOfGroupLabelOfListLabelOfAppendChip = {};

  EstablishAreaOfGroupLabelOfListDivWrap = {};

  EstablishAreaOfGroupLabelOfListChip = {};

  EstablishAreaOfGroupDiv = {};

  EstablishAreaOfCreditCodeOfCreditAuthTextField = {};

  EstablishAreaOfCreditSerialOfCreditTextField = {};

  EstablishAreaOfCreditDiv = {};

  EstablishAreaOfFeePriceOfAgentTextField = {};

  EstablishAreaOfFeePriceOfCreditTextField = {};

  EstablishAreaOfFeePriceOfCashTextField = {};

  EstablishAreaOfFeeDiv = {};

  EstablishAreaOfPaymentIsPaidMenuItem = {};

  EstablishAreaOfPaymentIsPaidTextFieldList = {};

  EstablishAreaOfPaymentPriceOfTotalTextField = {};

  EstablishAreaOfPaymentDiv = {};

  EstablishAreaOfDepositIsDepositPaidMenuItem = {};

  EstablishAreaOfDepositIsDepositPaidTextFieldList = {};

  EstablishAreaOfDepositPriceOfDepositTextField = {};

  EstablishAreaOfDepositDiv = {};

  EstablishAreaOfTourAgentMenuItem = {};

  EstablishAreaOfTourAgentTextFieldList = {};

  EstablishAreaOfTourPayMethodMenuItem = {};

  EstablishAreaOfTourPayMethodTextFieldList = {};

  EstablishAreaOfTourDiv = {};

  EstablishAreaOfObjectiveCityTextField = {};

  EstablishAreaOfObjectiveDestinationInputOfDestinationTextField = {};

  EstablishAreaOfObjectiveDestinationAutocomplete = {};

  EstablishAreaOfObjectiveDiv = {};

  EstablishAreaOfDateTravelLocalizationProviderWrap = {};

  EstablishAreaOfDateTravelDateRangePicker = {};

  EstablishAreaOfDateDiv = {};

  EstablishAreaOfContactPhoneTextField = {};

  EstablishAreaOfContactHostTextField = {};

  EstablishAreaOfContactDiv = {};

  EstablishIdLabelOfIdTypography = {};

  EstablishIdBtnOfIdIconCopyAll = {};

  EstablishIdBtnOfIdIconButton = {};

  EstablishIdDivWrap = {};

  EstablishIdTypography = {};

  EstablishDivWrap = {};

  EstablishPaper = {};

  /** => following for main  component  */

  MainFilterOfSearchOrderAreaOfFuncClearButton = {};

  MainFilterOfSearchOrderAreaOfFuncCancelButton = {};

  MainFilterOfSearchOrderAreaOfFuncSubmitButton = {};

  MainFilterOfSearchOrderAreaOfFuncDiv = {};

  MainFilterOfSearchOrderAreaOfStuffAgentMenuItem = {};

  MainFilterOfSearchOrderAreaOfStuffAgentTextFieldList = {};

  MainFilterOfSearchOrderAreaOfStuffSalesmanMenuItem = {};

  MainFilterOfSearchOrderAreaOfStuffSalesmanTextFieldList = {};

  MainFilterOfSearchOrderAreaOfStuffDiv = {};

  MainFilterOfSearchOrderAreaOfSelectedPayMethodMenuItem = {};

  MainFilterOfSearchOrderAreaOfSelectedPayMethodTextFieldList = {};

  MainFilterOfSearchOrderAreaOfSelectedIsPaidMenuItem = {};

  MainFilterOfSearchOrderAreaOfSelectedIsPaidTextFieldList = {};

  MainFilterOfSearchOrderAreaOfSelectedIsDepositPaidMenuItem = {};

  MainFilterOfSearchOrderAreaOfSelectedIsDepositPaidTextFieldList = {};

  MainFilterOfSearchOrderAreaOfSelectedDiv = {};

  MainFilterOfSearchOrderAreaOfTravelDestinationInputOfDestinationTextField = {};

  MainFilterOfSearchOrderAreaOfTravelDestinationAutocomplete = {};

  MainFilterOfSearchOrderAreaOfTravelRangeLocalizationProviderWrap = {};

  MainFilterOfSearchOrderAreaOfTravelRangeDateRangePicker = {};

  MainFilterOfSearchOrderAreaOfTravelDiv = {};

  MainFilterOfSearchOrderAreaOfContactPhoneTextField = {};

  MainFilterOfSearchOrderAreaOfContactHostTextField = {};

  MainFilterOfSearchOrderAreaOfContactDiv = {};

  MainFilterOfSearchOrderAreaOfIdentityGoAheadButton = {};

  MainFilterOfSearchOrderAreaOfIdentityPasteButton = {};

  MainFilterOfSearchOrderAreaOfIdentityIdOfOrderTextField = {};

  MainFilterOfSearchOrderAreaOfIdentityDiv = {};

  MainFilterOfSearchOrderSwipeableDrawerWrap = {};

  MainFilterOfSearchOrderDiv = {};

  MainOrderAreaOfContactPhoneLabelOfPhoneTypography = {};

  MainOrderAreaOfContactPhoneBtnOfPhoneIconPhoneRounded = {};

  MainOrderAreaOfContactPhoneBtnOfPhoneIconButton = {};

  MainOrderAreaOfContactPhoneDivWrap = {};

  MainOrderAreaOfContactPhoneTypography = {};

  MainOrderAreaOfContactHostLabelOfHostTypography = {};

  MainOrderAreaOfContactHostDivWrap = {};

  MainOrderAreaOfContactHostTypography = {};

  MainOrderAreaOfContactDiv = {};

  MainOrderAreaOfHeadExtraIconMoreHoriz = {};

  MainOrderAreaOfHeadExtraReactFragmentWrap = {};

  MainOrderAreaOfHeadExtraIconButton = {};

  MainOrderAreaOfHeadIdLabelOfIdTypography = {};

  MainOrderAreaOfHeadIdBtnOfIdIconCopyAll = {};

  MainOrderAreaOfHeadIdBtnOfIdIconButton = {};

  MainOrderAreaOfHeadIdDivWrap = {};

  MainOrderAreaOfHeadIdTypography = {};

  MainOrderAreaOfHeadDiv = {};

  MainOrderCardSkeleton = {};

  MainOrderDivList = {};

  MainOrderCard = {};

  MainAreaOfFuncSearchOfOrderButton = {};

  MainAreaOfFuncCreateOfOrderReactFragmentWrap = {};

  MainAreaOfFuncCreateOfOrderButton = {};

  MainAreaOfFuncDiv = {};

  MainDiv = {};

  /** -------------------- functions -------------------- **/

  constructor(props) {}

  /** -------------------- async api -------------------- **/
}

export default new MobileStyle();
