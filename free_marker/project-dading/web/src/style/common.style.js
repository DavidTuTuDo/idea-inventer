import { utiller as Util, exceptioner as ERROR, pooller as InfinitePool } from "utiller";
import _ from "lodash";
import libpath from "path";

class CommonStyle {
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

  EstablishDesktopAreaOfFinancialDetailFinanceExtraIconMoreVertRounded = {};

  EstablishDesktopAreaOfFinancialDetailFinanceExtraReactFragmentWrap = {};

  EstablishDesktopAreaOfFinancialDetailFinanceExtraIconButton = {};

  EstablishDesktopAreaOfFinancialDetailFinanceFeeOfPartyATextField = {};

  EstablishDesktopAreaOfFinancialDetailFinanceFeeOfPartyBTextField = {};

  EstablishDesktopAreaOfFinancialDetailFinanceAccountOfLast5NumTextField = {};

  EstablishDesktopAreaOfFinancialDetailFinanceCodeOfCreditAuthTextField = {};

  EstablishDesktopAreaOfFinancialDetailFinanceSerialOfCreditTextField = {};

  EstablishDesktopAreaOfFinancialDetailFinanceCommentTextField = {};

  EstablishDesktopAreaOfFinancialDetailFinanceRequestMenuItem = {};

  EstablishDesktopAreaOfFinancialDetailFinanceRequestTextFieldList = {};

  EstablishDesktopAreaOfFinancialDetailFinanceStatusMenuItem = {};

  EstablishDesktopAreaOfFinancialDetailFinanceStatusTextFieldList = {};

  EstablishDesktopAreaOfFinancialDetailFinanceCreateTimeTextField = {};

  EstablishDesktopAreaOfFinancialDetailFinanceIndexOfSequenceTextField = {};

  EstablishDesktopAreaOfFinancialDetailFinanceDivList = {};

  EstablishDesktopAreaOfFinancialDetailFinanceDiv = {};

  EstablishDesktopAreaOfFinancialDetailDiv = {};

  EstablishDesktopAreaOfMemberDetailVisitorExtraIconMoreVertRounded = {};

  EstablishDesktopAreaOfMemberDetailVisitorExtraReactFragmentWrap = {};

  EstablishDesktopAreaOfMemberDetailVisitorExtraIconButton = {};

  EstablishDesktopAreaOfMemberDetailVisitorCommentTextField = {};

  EstablishDesktopAreaOfMemberDetailVisitorFeeOfProfitTextField = {};

  EstablishDesktopAreaOfMemberDetailVisitorPriceOfAgentCostTextField = {};

  EstablishDesktopAreaOfMemberDetailVisitorDiscountTextField = {};

  EstablishDesktopAreaOfMemberDetailVisitorPriceTextField = {};

  EstablishDesktopAreaOfMemberDetailVisitorPriceOfOriginalTextField = {};

  EstablishDesktopAreaOfMemberDetailVisitorCertificateMenuItem = {};

  EstablishDesktopAreaOfMemberDetailVisitorCertificateTextFieldList = {};

  EstablishDesktopAreaOfMemberDetailVisitorNameOfPassportTextField = {};

  EstablishDesktopAreaOfMemberDetailVisitorPassportMenuItem = {};

  EstablishDesktopAreaOfMemberDetailVisitorPassportTextFieldList = {};

  EstablishDesktopAreaOfMemberDetailVisitorNameTextField = {};

  EstablishDesktopAreaOfMemberDetailVisitorGenderMenuItem = {};

  EstablishDesktopAreaOfMemberDetailVisitorGenderTextFieldList = {};

  EstablishDesktopAreaOfMemberDetailVisitorAgeMenuItem = {};

  EstablishDesktopAreaOfMemberDetailVisitorAgeTextFieldList = {};

  EstablishDesktopAreaOfMemberDetailVisitorIdOfHotelRoomTextField = {};

  EstablishDesktopAreaOfMemberDetailVisitorIndexOfSequenceTextField = {};

  EstablishDesktopAreaOfMemberDetailVisitorDivList = {};

  EstablishDesktopAreaOfMemberDetailVisitorDiv = {};

  EstablishDesktopAreaOfMemberDetailDiv = {};

  EstablishDesktopInfoAreaOfThirdFeeOfProfitLabelOfFeeOfProfitTypography = {};

  EstablishDesktopInfoAreaOfThirdFeeOfProfitDivWrap = {};

  EstablishDesktopInfoAreaOfThirdFeeOfProfitTextField = {};

  EstablishDesktopInfoAreaOfThirdFeeOfAgentLabelOfFeeOfAgentTypography = {};

  EstablishDesktopInfoAreaOfThirdFeeOfAgentDivWrap = {};

  EstablishDesktopInfoAreaOfThirdFeeOfAgentTextField = {};

  EstablishDesktopInfoAreaOfThirdPriceOfCreditLabelOfPriceOfCreditTypography = {};

  EstablishDesktopInfoAreaOfThirdPriceOfCreditDivWrap = {};

  EstablishDesktopInfoAreaOfThirdPriceOfCreditTextField = {};

  EstablishDesktopInfoAreaOfThirdPriceOfCashLabelOfPriceOfCashTypography = {};

  EstablishDesktopInfoAreaOfThirdPriceOfCashDivWrap = {};

  EstablishDesktopInfoAreaOfThirdPriceOfCashTextField = {};

  EstablishDesktopInfoAreaOfThirdTotalOfNetLabelOfTotalOfNetTypography = {};

  EstablishDesktopInfoAreaOfThirdTotalOfNetDivWrap = {};

  EstablishDesktopInfoAreaOfThirdTotalOfNetTextField = {};

  EstablishDesktopInfoAreaOfThirdDiscountOfAgentLabelOfDiscountOfAgentTypography = {};

  EstablishDesktopInfoAreaOfThirdDiscountOfAgentDivWrap = {};

  EstablishDesktopInfoAreaOfThirdDiscountOfAgentTextField = {};

  EstablishDesktopInfoAreaOfThirdPriceOfAgentLabelOfPriceOfAgentTypography = {};

  EstablishDesktopInfoAreaOfThirdPriceOfAgentDivWrap = {};

  EstablishDesktopInfoAreaOfThirdPriceOfAgentTextField = {};

  EstablishDesktopInfoAreaOfThirdDiv = {};

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

  MainFilterOfSearchOrderAreaOfSelectedStatusOfPaidMenuItem = {};

  MainFilterOfSearchOrderAreaOfSelectedStatusOfPaidTextFieldList = {};

  MainFilterOfSearchOrderAreaOfSelectedDiv = {};

  MainFilterOfSearchOrderAreaOfTravelDestinationInputOfDestinationTextField = {};

  MainFilterOfSearchOrderAreaOfTravelDestinationAutocomplete = {};

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

  MainOrderAreaOfContactContactLabelOfContactTypography = {};

  MainOrderAreaOfContactContactBtnOfContactIconPhoneRounded = {};

  MainOrderAreaOfContactContactBtnOfContactIconButton = {};

  MainOrderAreaOfContactContactDivWrap = {};

  MainOrderAreaOfContactContactTypography = {};

  MainOrderAreaOfContactHostLabelOfHostTypography = {};

  MainOrderAreaOfContactHostDivWrap = {};

  MainOrderAreaOfContactHostTypography = {};

  MainOrderAreaOfContactDiv = {};

  MainOrderAreaOfDestinationDateOfStartTravelLabelOfDateOfStartTravelTypography = {};

  MainOrderAreaOfDestinationDateOfStartTravelDivWrap = {};

  MainOrderAreaOfDestinationDateOfStartTravelTypography = {};

  MainOrderAreaOfDestinationNameOfAgentLabelOfNameOfAgentTypography = {};

  MainOrderAreaOfDestinationNameOfAgentDivWrap = {};

  MainOrderAreaOfDestinationNameOfAgentTypography = {};

  MainOrderAreaOfDestinationNameOfDestinationLabelOfNameOfDestinationTypography = {};

  MainOrderAreaOfDestinationNameOfDestinationDivWrap = {};

  MainOrderAreaOfDestinationNameOfDestinationTypography = {};

  MainOrderAreaOfDestinationDiv = {};

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

export default new CommonStyle();
