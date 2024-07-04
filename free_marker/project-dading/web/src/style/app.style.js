import { utiller as Util, exceptioner as ERROR, pooller as InfinitePool } from "utiller";
import _ from "lodash";
import libpath from "path";

class AppStyle {
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

  /** => following for reimburse  component  */

  ReimburseAreaOfBatchXBatchCancelChip = {};

  ReimburseAreaOfBatchXBatchUpdateChip = {};

  ReimburseAreaOfBatchXDiv = {};

  ReimburseRecordAreaOfFuncXCancelReactFragmentWrap = {};

  ReimburseRecordAreaOfFuncXCancelButton = {};

  ReimburseRecordAreaOfFuncXUpdateButton = {};

  ReimburseRecordAreaOfFuncXSubmitButton = {};

  ReimburseRecordAreaOfFuncXDiv = {};

  ReimburseRecordAreaOfOperateFeeOfProcedureTextField = {};

  ReimburseRecordAreaOfOperateRateOfCreditTextField = {};

  ReimburseRecordAreaOfOperateDiv = {};

  ReimburseRecordAreaOfCreditCodeOfCreditAuthTextField = {};

  ReimburseRecordAreaOfCreditSerialOfCreditTextField = {};

  ReimburseRecordAreaOfCreditDiv = {};

  ReimburseRecordAreaOfPayCommentTextField = {};

  ReimburseRecordAreaOfPayFeeOfPaidTextField = {};

  ReimburseRecordAreaOfPayDiv = {};

  ReimburseRecordAreaOfInfoTimeOfCheckinDatePicker = {};

  ReimburseRecordAreaOfInfoPayMethodMenuItem = {};

  ReimburseRecordAreaOfInfoPayMethodTextFieldList = {};

  ReimburseRecordAreaOfInfoDiv = {};

  ReimburseRecordDivList = {};

  ReimburseRecordCard = {};

  ReimburseDiv = {};

  /** => following for addition  component  */

  AdditionAreaOfBatchXBatchCancelChip = {};

  AdditionAreaOfBatchXBatchUpdateChip = {};

  AdditionAreaOfBatchXDiv = {};

  AdditionMemberAreaOfFuncXCancelReactFragmentWrap = {};

  AdditionMemberAreaOfFuncXCancelButton = {};

  AdditionMemberAreaOfFuncXUpdateButton = {};

  AdditionMemberAreaOfFuncXSubmitButton = {};

  AdditionMemberAreaOfFuncXDiv = {};

  AdditionMemberCommentTextField = {};

  AdditionMemberAreaOfInternationDiscountTextField = {};

  AdditionMemberAreaOfInternationCertificateMenuItem = {};

  AdditionMemberAreaOfInternationCertificateTextFieldList = {};

  AdditionMemberAreaOfInternationPassportMenuItem = {};

  AdditionMemberAreaOfInternationPassportTextFieldList = {};

  AdditionMemberAreaOfInternationDiv = {};

  AdditionMemberAreaOfPersonCitizenMenuItem = {};

  AdditionMemberAreaOfPersonCitizenTextFieldList = {};

  AdditionMemberAreaOfPersonAgeMenuItem = {};

  AdditionMemberAreaOfPersonAgeTextFieldList = {};

  AdditionMemberAreaOfPersonGenderMenuItem = {};

  AdditionMemberAreaOfPersonGenderTextFieldList = {};

  AdditionMemberAreaOfPersonDiv = {};

  AdditionMemberAreaOfPrivacySerialOfIdentityTextField = {};

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

  EstablishDesktopAreaOfRecordFinanceExtraIconMoreVertRounded = {};

  EstablishDesktopAreaOfRecordFinanceExtraReactFragmentWrap = {};

  EstablishDesktopAreaOfRecordFinanceExtraIconButton = {};

  EstablishDesktopAreaOfRecordFinanceFeeOfPartyATextField = {};

  EstablishDesktopAreaOfRecordFinanceFeeOfPartyBTextField = {};

  EstablishDesktopAreaOfRecordFinanceAccountOfLast5NumTextField = {};

  EstablishDesktopAreaOfRecordFinanceCodeOfCreditAuthTextField = {};

  EstablishDesktopAreaOfRecordFinanceSerialOfCreditTextField = {};

  EstablishDesktopAreaOfRecordFinanceCommentTextField = {};

  EstablishDesktopAreaOfRecordFinanceNameOfPayPersonTextField = {};

  EstablishDesktopAreaOfRecordFinanceRequestMenuItem = {};

  EstablishDesktopAreaOfRecordFinanceRequestTextFieldList = {};

  EstablishDesktopAreaOfRecordFinanceStatusMenuItem = {};

  EstablishDesktopAreaOfRecordFinanceStatusTextFieldList = {};

  EstablishDesktopAreaOfRecordFinanceCreateTimeDateTimePicker = {};

  EstablishDesktopAreaOfRecordFinanceIndexOfSequenceTextField = {};

  EstablishDesktopAreaOfRecordFinanceDivList = {};

  EstablishDesktopAreaOfRecordFinanceDiv = {};

  EstablishDesktopAreaOfRecordDiv = {};

  EstablishDesktopAreaOfMemberCal02TotalOfNotReceivedLabelOfTotalOfNotReceivedTypography = {};

  EstablishDesktopAreaOfMemberCal02TotalOfNotReceivedDivWrap = {};

  EstablishDesktopAreaOfMemberCal02TotalOfNotReceivedTextField = {};

  EstablishDesktopAreaOfMemberCal02TotalOfReceivedLabelOfTotalOfReceivedTypography = {};

  EstablishDesktopAreaOfMemberCal02TotalOfReceivedDivWrap = {};

  EstablishDesktopAreaOfMemberCal02TotalOfReceivedTextField = {};

  EstablishDesktopAreaOfMemberCal02Div = {};

  EstablishDesktopAreaOfMemberCal01TotalOfCustomizePriceLabelOfTotalOfCustomizePriceTypography = {};

  EstablishDesktopAreaOfMemberCal01TotalOfCustomizePriceDivWrap = {};

  EstablishDesktopAreaOfMemberCal01TotalOfCustomizePriceTextField = {};

  EstablishDesktopAreaOfMemberCal01TotalOfPricePartyBLabelOfTotalOfPricePartyBTypography = {};

  EstablishDesktopAreaOfMemberCal01TotalOfPricePartyBDivWrap = {};

  EstablishDesktopAreaOfMemberCal01TotalOfPricePartyBTextField = {};

  EstablishDesktopAreaOfMemberCal01Div = {};

  EstablishDesktopAreaOfMemberVisitorExtraIconMoreVertRounded = {};

  EstablishDesktopAreaOfMemberVisitorExtraReactFragmentWrap = {};

  EstablishDesktopAreaOfMemberVisitorExtraIconButton = {};

  EstablishDesktopAreaOfMemberVisitorCommentTextField = {};

  EstablishDesktopAreaOfMemberVisitorFeeOfProfitTextField = {};

  EstablishDesktopAreaOfMemberVisitorPriceOfPartyATextField = {};

  EstablishDesktopAreaOfMemberVisitorPriceTextField = {};

  EstablishDesktopAreaOfMemberVisitorDiscountTextField = {};

  EstablishDesktopAreaOfMemberVisitorPriceOfPartyBTextField = {};

  EstablishDesktopAreaOfMemberVisitorCertificateMenuItem = {};

  EstablishDesktopAreaOfMemberVisitorCertificateTextFieldList = {};

  EstablishDesktopAreaOfMemberVisitorNameOfPassportTextField = {};

  EstablishDesktopAreaOfMemberVisitorPassportMenuItem = {};

  EstablishDesktopAreaOfMemberVisitorPassportTextFieldList = {};

  EstablishDesktopAreaOfMemberVisitorNameTextField = {};

  EstablishDesktopAreaOfMemberVisitorGenderMenuItem = {};

  EstablishDesktopAreaOfMemberVisitorGenderTextFieldList = {};

  EstablishDesktopAreaOfMemberVisitorAgeMenuItem = {};

  EstablishDesktopAreaOfMemberVisitorAgeTextFieldList = {};

  EstablishDesktopAreaOfMemberVisitorIdOfHotelRoomTextField = {};

  EstablishDesktopAreaOfMemberVisitorIndexOfSequenceTextField = {};

  EstablishDesktopAreaOfMemberVisitorDivList = {};

  EstablishDesktopAreaOfMemberVisitorDiv = {};

  EstablishDesktopAreaOfMemberDiv = {};

  EstablishDesktopInfoAreaOfThirdFeeOfProfitLabelOfFeeOfProfitTypography = {};

  EstablishDesktopInfoAreaOfThirdFeeOfProfitDivWrap = {};

  EstablishDesktopInfoAreaOfThirdFeeOfProfitTextField = {};

  EstablishDesktopInfoAreaOfThirdFeeOfAgentLabelOfFeeOfAgentTypography = {};

  EstablishDesktopInfoAreaOfThirdFeeOfAgentDivWrap = {};

  EstablishDesktopInfoAreaOfThirdFeeOfAgentTextField = {};

  EstablishDesktopInfoAreaOfThirdFeeOfCreditReceivedLabelOfFeeOfCreditReceivedTypography = {};

  EstablishDesktopInfoAreaOfThirdFeeOfCreditReceivedDivWrap = {};

  EstablishDesktopInfoAreaOfThirdFeeOfCreditReceivedTextField = {};

  EstablishDesktopInfoAreaOfThirdFeeOfCashReceivedLabelOfFeeOfCashReceivedTypography = {};

  EstablishDesktopInfoAreaOfThirdFeeOfCashReceivedDivWrap = {};

  EstablishDesktopInfoAreaOfThirdFeeOfCashReceivedTextField = {};

  EstablishDesktopInfoAreaOfThirdTotalOfNetLabelOfTotalOfNetTypography = {};

  EstablishDesktopInfoAreaOfThirdTotalOfNetDivWrap = {};

  EstablishDesktopInfoAreaOfThirdTotalOfNetTextField = {};

  EstablishDesktopInfoAreaOfThirdDiscountOfAgentLabelOfDiscountOfAgentTypography = {};

  EstablishDesktopInfoAreaOfThirdDiscountOfAgentDivWrap = {};

  EstablishDesktopInfoAreaOfThirdDiscountOfAgentTextField = {};

  EstablishDesktopInfoAreaOfThirdPriceOfAgentLabelOfPriceOfAgentTypography = {};

  EstablishDesktopInfoAreaOfThirdPriceOfAgentDivWrap = {};

  EstablishDesktopInfoAreaOfThirdPriceOfAgentTextField = {};

  EstablishDesktopInfoAreaOfThirdRateOfCreditLabelOfRateOfCreditTypography = {};

  EstablishDesktopInfoAreaOfThirdRateOfCreditDivWrap = {};

  EstablishDesktopInfoAreaOfThirdRateOfCreditTextField = {};

  EstablishDesktopInfoAreaOfThirdDiv = {};

  EstablishDesktopInfoAreaOfSecondRoomArrangeLabelOfRoomArrangeTypography = {};

  EstablishDesktopInfoAreaOfSecondRoomArrangeDivListWrap = {};

  EstablishDesktopInfoAreaOfSecondRoomArrangeMenuItem = {};

  EstablishDesktopInfoAreaOfSecondRoomArrangeTextFieldList = {};

  EstablishDesktopInfoAreaOfSecondStatusOfSendLabelOfStatusOfSendTypography = {};

  EstablishDesktopInfoAreaOfSecondStatusOfSendDivListWrap = {};

  EstablishDesktopInfoAreaOfSecondStatusOfSendMenuItem = {};

  EstablishDesktopInfoAreaOfSecondStatusOfSendTextFieldList = {};

  EstablishDesktopInfoAreaOfSecondFeeOfNotReceivedLabelOfFeeOfNotReceivedTypography = {};

  EstablishDesktopInfoAreaOfSecondFeeOfNotReceivedDivWrap = {};

  EstablishDesktopInfoAreaOfSecondFeeOfNotReceivedTextField = {};

  EstablishDesktopInfoAreaOfSecondFeeOfReceivedLabelOfFeeOfReceivedTypography = {};

  EstablishDesktopInfoAreaOfSecondFeeOfReceivedDivWrap = {};

  EstablishDesktopInfoAreaOfSecondFeeOfReceivedTextField = {};

  EstablishDesktopInfoAreaOfSecondFeeOfTotalLabelOfFeeOfTotalTypography = {};

  EstablishDesktopInfoAreaOfSecondFeeOfTotalDivWrap = {};

  EstablishDesktopInfoAreaOfSecondFeeOfTotalTextField = {};

  EstablishDesktopInfoAreaOfSecondCountOfPeopleLabelOfCountOfPeopleTypography = {};

  EstablishDesktopInfoAreaOfSecondCountOfPeopleDivWrap = {};

  EstablishDesktopInfoAreaOfSecondCountOfPeopleTextField = {};

  EstablishDesktopInfoAreaOfSecondPriceOfDepositLabelOfPriceOfDepositTypography = {};

  EstablishDesktopInfoAreaOfSecondPriceOfDepositDivWrap = {};

  EstablishDesktopInfoAreaOfSecondPriceOfDepositTextField = {};

  EstablishDesktopInfoAreaOfSecondIdOfAgentTravelLabelOfIdOfAgentTravelTypography = {};

  EstablishDesktopInfoAreaOfSecondIdOfAgentTravelDivWrap = {};

  EstablishDesktopInfoAreaOfSecondIdOfAgentTravelTextField = {};

  EstablishDesktopInfoAreaOfSecondDiv = {};

  EstablishDesktopInfoAreaOfHeadSalesmanLabelOfSalesmanTypography = {};

  EstablishDesktopInfoAreaOfHeadSalesmanDivListWrap = {};

  EstablishDesktopInfoAreaOfHeadSalesmanMenuItem = {};

  EstablishDesktopInfoAreaOfHeadSalesmanTextFieldList = {};

  EstablishDesktopInfoAreaOfHeadAgentLabelOfAgentTypography = {};

  EstablishDesktopInfoAreaOfHeadAgentDivListWrap = {};

  EstablishDesktopInfoAreaOfHeadAgentMenuItem = {};

  EstablishDesktopInfoAreaOfHeadAgentTextFieldList = {};

  EstablishDesktopInfoAreaOfHeadContactLabelOfContactTypography = {};

  EstablishDesktopInfoAreaOfHeadContactDivWrap = {};

  EstablishDesktopInfoAreaOfHeadContactTextField = {};

  EstablishDesktopInfoAreaOfHeadHostLabelOfHostTypography = {};

  EstablishDesktopInfoAreaOfHeadHostDivWrap = {};

  EstablishDesktopInfoAreaOfHeadHostTextField = {};

  EstablishDesktopInfoAreaOfHeadDestinationInputOfDestinationTextField = {};

  EstablishDesktopInfoAreaOfHeadDestinationLabelOfDestinationTypography = {};

  EstablishDesktopInfoAreaOfHeadDestinationDivWrap = {};

  EstablishDesktopInfoAreaOfHeadDestinationAutocomplete = {};

  EstablishDesktopInfoAreaOfHeadEndOfTravelLabelOfEndOfTravelTypography = {};

  EstablishDesktopInfoAreaOfHeadEndOfTravelDivWrap = {};

  EstablishDesktopInfoAreaOfHeadEndOfTravelDatePicker = {};

  EstablishDesktopInfoAreaOfHeadStartOfTravelLabelOfStartOfTravelTypography = {};

  EstablishDesktopInfoAreaOfHeadStartOfTravelDivWrap = {};

  EstablishDesktopInfoAreaOfHeadStartOfTravelDatePicker = {};

  EstablishDesktopInfoAreaOfHeadIdLabelOfIdTypography = {};

  EstablishDesktopInfoAreaOfHeadIdDivWrap = {};

  EstablishDesktopInfoAreaOfHeadIdTextField = {};

  EstablishDesktopInfoAreaOfHeadDiv = {};

  EstablishDesktopInfoDiv = {};

  EstablishDesktopDiv = {};

  EstablishIdLabelOfIdTypography = {};

  EstablishIdBtnOfIdIconCopyAll = {};

  EstablishIdBtnOfIdIconButton = {};

  EstablishIdDivWrap = {};

  EstablishIdTypography = {};

  EstablishDivWrap = {};

  EstablishPaper = {};

  /** => following for main  component  */

  MainFilterAreaOfFuncClearButton = {};

  MainFilterAreaOfFuncCancelButton = {};

  MainFilterAreaOfFuncSubmitButton = {};

  MainFilterAreaOfFuncDiv = {};

  MainFilterAreaOfStuffBaseOnDatePicker = {};

  MainFilterAreaOfStuffDestToInputOfDestToTextField = {};

  MainFilterAreaOfStuffDestToAutocomplete = {};

  MainFilterAreaOfStuffAgentToMenuItem = {};

  MainFilterAreaOfStuffAgentToTextFieldList = {};

  MainFilterAreaOfStuffDiv = {};

  MainFilterAreaOfContactContactTextField = {};

  MainFilterAreaOfContactHostTextField = {};

  MainFilterAreaOfContactDiv = {};

  MainFilterTypeLabelOfTypeTypography = {};

  MainFilterTypeDivListWrap = {};

  MainFilterTypeMenuItem = {};

  MainFilterTypeTextFieldList = {};

  MainFilterAreaOfIdentityGoAheadButton = {};

  MainFilterAreaOfIdentityPasteButton = {};

  MainFilterAreaOfIdentityIdOfOrderTextField = {};

  MainFilterAreaOfIdentityDiv = {};

  MainFilterSwipeableDrawerWrap = {};

  MainFilterDiv = {};

  MainOrderAreaOfHeadExtraIconMoreHoriz = {};

  MainOrderAreaOfHeadExtraReactFragmentWrap = {};

  MainOrderAreaOfHeadExtraIconButton = {};

  MainOrderAreaOfHeadCommentTextField = {};

  MainOrderAreaOfHeadCountOfPeopleTextField = {};

  MainOrderAreaOfHeadPriceOfDepositTextField = {};

  MainOrderAreaOfHeadContactTextField = {};

  MainOrderAreaOfHeadHostTextField = {};

  MainOrderAreaOfHeadAgentMenuItem = {};

  MainOrderAreaOfHeadAgentTextFieldList = {};

  MainOrderAreaOfHeadDestinationInputOfDestinationTextField = {};

  MainOrderAreaOfHeadDestinationAutocomplete = {};

  MainOrderAreaOfHeadStartOfTravelDatePicker = {};

  MainOrderAreaOfHeadMenuIconEditRounded = {};

  MainOrderAreaOfHeadMenuIconButton = {};

  MainOrderAreaOfHeadDiv = {};

  MainOrderCardSkeleton = {};

  MainOrderDivList = {};

  MainOrderCard = {};

  MainAreaOfFuncDoSearchOfOrderButton = {};

  MainAreaOfFuncDoCreateOfOrderReactFragmentWrap = {};

  MainAreaOfFuncDoCreateOfOrderButton = {};

  MainAreaOfFuncDoAppendOfOrderButton = {};

  MainAreaOfFuncDoDiv = {};

  MainAreaOfFuncFilterBaseOnDatePicker = {};

  MainAreaOfFuncFilterOrderByMenuItem = {};

  MainAreaOfFuncFilterOrderByTextFieldList = {};

  MainAreaOfFuncFilterDiv = {};

  MainAreaOfFuncDiv = {};

  MainDiv = {};

  /** -------------------- functions -------------------- **/

  constructor(props) {}

  /** -------------------- async api -------------------- **/
}

export default new AppStyle();
