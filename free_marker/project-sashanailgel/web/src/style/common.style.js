import { utiller as Util, exceptioner as ERROR, pooller as InfinitePool } from "utiller";
import _ from "lodash";
import libpath from "path";

class CommonStyle {
  /** -------------------- fields -------------------- **/

  /** following for homeless */

  /** => following for navigator  component  */

  NavigatorDrawerShortcutIconImg = {};

  NavigatorDrawerShortcutTitleTypography = {};

  NavigatorDrawerShortcutListItemSkeleton = {};

  NavigatorDrawerShortcutListList = {};

  NavigatorDrawerShortcutListItem = {};

  NavigatorDrawerDrawer = {};

  NavigatorToolBarTipOfLoadingCircularProgress = {};

  NavigatorToolBarLoginIconLogin = {};

  NavigatorToolBarLoginIconButton = {};

  NavigatorToolBarCartieBadgeOfCartieIconShoppingCart = {};

  NavigatorToolBarCartieBadgeOfCartieBadge = {};

  NavigatorToolBarCartieIconButton = {};

  NavigatorToolBarAccountIconAccountCircle = {};

  NavigatorToolBarAccountReactFragmentWrap = {};

  NavigatorToolBarAccountIconButton = {};

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

  AccountCancelChip = {};

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

  AccountDivWrap = {};

  AccountPaper = {};

  /** => following for plutus  component  */

  PlutusFuncOfCheckoutSubmitDivWrap = {};

  PlutusFuncOfCheckoutSubmitChip = {};

  PlutusFuncOfCheckoutPriceOfTotalLabelOfPriceOfTotalTypography = {};

  PlutusFuncOfCheckoutPriceOfTotalDivWrap = {};

  PlutusFuncOfCheckoutPriceOfTotalTypography = {};

  PlutusFuncOfCheckoutWholeLabelOfWholeTypography = {};

  PlutusFuncOfCheckoutWholeDivWrap = {};

  PlutusFuncOfCheckoutWholeCheckbox = {};

  PlutusFuncOfCheckoutDivWrap = {};

  PlutusFuncOfCheckoutDiv = {};

  PlutusMainSummariseFifthFeeOfPaymentLabelOfFeeOfPaymentTypography = {};

  PlutusMainSummariseFifthFeeOfPaymentDivWrap = {};

  PlutusMainSummariseFifthFeeOfPaymentTypography = {};

  PlutusMainSummariseFifthHeadLabelOfPaymentDivWrap = {};

  PlutusMainSummariseFifthHeadLabelOfPaymentTypography = {};

  PlutusMainSummariseFifthDiv = {};

  PlutusMainSummariseFourthFeeOfMemberDiscountLabelOfFeeOfMemberDiscountTypography = {};

  PlutusMainSummariseFourthFeeOfMemberDiscountDivWrap = {};

  PlutusMainSummariseFourthFeeOfMemberDiscountTypography = {};

  PlutusMainSummariseFourthHeadLabelOfMemberDiscountDivWrap = {};

  PlutusMainSummariseFourthHeadLabelOfMemberDiscountTypography = {};

  PlutusMainSummariseFourthDiv = {};

  PlutusMainSummariseThirdFeeOfTransportLabelOfFeeOfTransportTypography = {};

  PlutusMainSummariseThirdFeeOfTransportDivWrap = {};

  PlutusMainSummariseThirdFeeOfTransportTypography = {};

  PlutusMainSummariseThirdHeadLabelOfTransportDivWrap = {};

  PlutusMainSummariseThirdHeadLabelOfTransportTypography = {};

  PlutusMainSummariseThirdDiv = {};

  PlutusMainSummariseSecondDiscountLabelOfDiscountTypography = {};

  PlutusMainSummariseSecondDiscountDivWrap = {};

  PlutusMainSummariseSecondDiscountTypography = {};

  PlutusMainSummariseSecondHeadLabelOfDiscountDivWrap = {};

  PlutusMainSummariseSecondHeadLabelOfDiscountTypography = {};

  PlutusMainSummariseSecondDiv = {};

  PlutusMainSummariseFirstPriceLabelOfPriceTypography = {};

  PlutusMainSummariseFirstPriceDivWrap = {};

  PlutusMainSummariseFirstPriceTypography = {};

  PlutusMainSummariseFirstHeadLabelOfPriceDivWrap = {};

  PlutusMainSummariseFirstHeadLabelOfPriceTypography = {};

  PlutusMainSummariseFirstDiv = {};

  PlutusMainSummariseDiv = {};

  PlutusMainLocationMainTailFindIconWifiFind = {};

  PlutusMainLocationMainTailFindIconButton = {};

  PlutusMainLocationMainTailAddressTextField = {};

  PlutusMainLocationMainTailDiv = {};

  PlutusMainLocationMainHeadDistrictMenuItem = {};

  PlutusMainLocationMainHeadDistrictTextFieldList = {};

  PlutusMainLocationMainHeadCityMenuItem = {};

  PlutusMainLocationMainHeadCityTextFieldList = {};

  PlutusMainLocationMainHeadDiv = {};

  PlutusMainLocationMainDiv = {};

  PlutusMainLocationHeadLabelOfAddressTypography = {};

  PlutusMainLocationDiv = {};

  PlutusMainPhoneLabelOfPhoneTypography = {};

  PlutusMainPhoneDivWrap = {};

  PlutusMainPhoneTextField = {};

  PlutusMainEmailLabelOfEmailTypography = {};

  PlutusMainEmailDivWrap = {};

  PlutusMainEmailTextField = {};

  PlutusMainNameLabelOfNameTypography = {};

  PlutusMainNameDivWrap = {};

  PlutusMainNameTextField = {};

  PlutusMainDiv = {};

  PlutusDivWrap = {};

  PlutusDiv = {};

  /** => following for hermes  component  */

  HermesFuncOfCheckoutSubmitDivWrap = {};

  HermesFuncOfCheckoutSubmitChip = {};

  HermesFuncOfCheckoutPriceOfTotalLabelOfPriceOfTotalTypography = {};

  HermesFuncOfCheckoutPriceOfTotalDivWrap = {};

  HermesFuncOfCheckoutPriceOfTotalTypography = {};

  HermesFuncOfCheckoutWholeLabelOfWholeTypography = {};

  HermesFuncOfCheckoutWholeDivWrap = {};

  HermesFuncOfCheckoutWholeCheckbox = {};

  HermesFuncOfCheckoutDivWrap = {};

  HermesFuncOfCheckoutDiv = {};

  HermesTransportPriceLabelOfPriceTypography = {};

  HermesTransportPriceDivWrap = {};

  HermesTransportPriceTypography = {};

  HermesTransportMainDescriptionTypography = {};

  HermesTransportMainTopPhotoImg = {};

  HermesTransportMainTopNameTypography = {};

  HermesTransportMainTopDiv = {};

  HermesTransportMainDiv = {};

  HermesTransportChoiceDivWrap = {};

  HermesTransportChoiceCheckbox = {};

  HermesTransportDivList = {};

  HermesTransportDiv = {};

  HermesDivWrap = {};

  HermesDiv = {};

  /** => following for cartie  component  */

  CartieFuncOfCheckoutSubmitDivWrap = {};

  CartieFuncOfCheckoutSubmitChip = {};

  CartieFuncOfCheckoutPriceOfTotalLabelOfPriceOfTotalTypography = {};

  CartieFuncOfCheckoutPriceOfTotalDivWrap = {};

  CartieFuncOfCheckoutPriceOfTotalTypography = {};

  CartieFuncOfCheckoutWholeLabelOfWholeTypography = {};

  CartieFuncOfCheckoutWholeDivWrap = {};

  CartieFuncOfCheckoutWholeCheckbox = {};

  CartieFuncOfCheckoutDivWrap = {};

  CartieFuncOfCheckoutDiv = {};

  CartieMainSummariseDiscountOfMemberLabelOfDiscountOfMemberTypography = {};

  CartieMainSummariseDiscountOfMemberDivWrap = {};

  CartieMainSummariseDiscountOfMemberTypography = {};

  CartieMainSummarisePriceOfTransportLabelOfPriceOfTransportTypography = {};

  CartieMainSummarisePriceOfTransportDivWrap = {};

  CartieMainSummarisePriceOfTransportTypography = {};

  CartieMainSummarisePriceOfDiscountLabelOfPriceOfDiscountTypography = {};

  CartieMainSummarisePriceOfDiscountDivWrap = {};

  CartieMainSummarisePriceOfDiscountTypography = {};

  CartieMainSummarisePriceWithoutDiscountLabelOfPriceWithoutDiscountTypography = {};

  CartieMainSummarisePriceWithoutDiscountDivWrap = {};

  CartieMainSummarisePriceWithoutDiscountTypography = {};

  CartieMainSummariseDiv = {};

  CartieMainBriefSpecLandConclusionOfQuantityIncreaseIconAdd = {};

  CartieMainBriefSpecLandConclusionOfQuantityIncreaseIconButton = {};

  CartieMainBriefSpecLandConclusionOfQuantityCountOfSubmitTextField = {};

  CartieMainBriefSpecLandConclusionOfQuantityDecreaseIconRemove = {};

  CartieMainBriefSpecLandConclusionOfQuantityDecreaseIconButton = {};

  CartieMainBriefSpecLandConclusionOfQuantityDivWrap = {};

  CartieMainBriefSpecLandConclusionOfQuantityDiv = {};

  CartieMainBriefSpecLandMainPriceB4DiscountTypography = {};

  CartieMainBriefSpecLandMainPriceLabelOfPriceTypography = {};

  CartieMainBriefSpecLandMainPriceDivWrap = {};

  CartieMainBriefSpecLandMainPriceTypography = {};

  CartieMainBriefSpecLandMainDiv = {};

  CartieMainBriefSpecLandDiv = {};

  CartieMainBriefSpecInfoOfBenefitTypography = {};

  CartieMainBriefSpecNameOfOptionChip = {};

  CartieMainBriefSpecFullCancelIconDeleteForeverRounded = {};

  CartieMainBriefSpecFullCancelReactFragmentWrap = {};

  CartieMainBriefSpecFullCancelIconButton = {};

  CartieMainBriefSpecFullNameDivWrap = {};

  CartieMainBriefSpecFullNameTypography = {};

  CartieMainBriefSpecFullDiv = {};

  CartieMainBriefSpecDiv = {};

  CartieMainBriefPhotoImg = {};

  CartieMainBriefSureDivWrap = {};

  CartieMainBriefSureCheckbox = {};

  CartieMainBriefDivList = {};

  CartieMainBriefDiv = {};

  CartieMainDiv = {};

  CartieDivWrap = {};

  CartieDiv = {};

  /** => following for maenads  component  */

  MaenadsSubmitDivWrap = {};

  MaenadsSubmitChip = {};

  MaenadsDecisionConclusionOfQuantityIncreaseIconAdd = {};

  MaenadsDecisionConclusionOfQuantityIncreaseIconButton = {};

  MaenadsDecisionConclusionOfQuantityCountOfSubmitTextField = {};

  MaenadsDecisionConclusionOfQuantityDecreaseIconRemove = {};

  MaenadsDecisionConclusionOfQuantityDecreaseIconButton = {};

  MaenadsDecisionConclusionOfQuantityDivWrap = {};

  MaenadsDecisionConclusionOfQuantityDiv = {};

  MaenadsDecisionTitleOfSubmitOrderDivWrap = {};

  MaenadsDecisionTitleOfSubmitOrderTypography = {};

  MaenadsDecisionDiv = {};

  MaenadsOptionNameChip = {};

  MaenadsOptionDivList = {};

  MaenadsOptionDiv = {};

  MaenadsTitleOfShapeTypography = {};

  MaenadsMainInfoCountLabelOfCountTypography = {};

  MaenadsMainInfoCountDivWrap = {};

  MaenadsMainInfoCountTypography = {};

  MaenadsMainInfoRowPriceTypography = {};

  MaenadsMainInfoRowDiv = {};

  MaenadsMainInfoDiv = {};

  MaenadsMainPhotoImg = {};

  MaenadsMainDiv = {};

  MaenadsDivWrap = {};

  MaenadsPaper = {};

  /** => following for bacchus  component  */

  BacchusFuncBoughtReactFragmentWrap = {};

  BacchusFuncBoughtChip = {};

  BacchusFuncJoinToCartReactFragmentWrap = {};

  BacchusFuncJoinToCartChip = {};

  BacchusFuncBackToHomeChip = {};

  BacchusFuncDivWrap = {};

  BacchusFuncDiv = {};

  BacchusDetailContentPhotoHrefImg = {};

  BacchusDetailContentPhotoDivList = {};

  BacchusDetailContentPhotoDiv = {};

  BacchusDetailContentStatementTypography = {};

  BacchusDetailContentDiv = {};

  BacchusDetailAreaOfBenefitArrowIconNavigateNext = {};

  BacchusDetailAreaOfBenefitArrowIconButton = {};

  BacchusDetailAreaOfBenefitOptionOfBenefitContentTypography = {};

  BacchusDetailAreaOfBenefitOptionOfBenefitTitleTypography = {};

  BacchusDetailAreaOfBenefitDiv = {};

  BacchusDetailAreaOfShippingArrowIconNavigateNext = {};

  BacchusDetailAreaOfShippingArrowIconButton = {};

  BacchusDetailAreaOfShippingOptionOfShippingContentTypography = {};

  BacchusDetailAreaOfShippingOptionOfShippingTitleTypography = {};

  BacchusDetailAreaOfShippingDiv = {};

  BacchusDetailAreaOfPayArrowIconNavigateNext = {};

  BacchusDetailAreaOfPayArrowIconButton = {};

  BacchusDetailAreaOfPayOptionOfPayContentTypography = {};

  BacchusDetailAreaOfPayOptionOfPayTitleTypography = {};

  BacchusDetailAreaOfPayDiv = {};

  BacchusDetailDiv = {};

  BacchusNameDivWrap = {};

  BacchusNameTypography = {};

  BacchusRangeOfPriceDivWrap = {};

  BacchusRangeOfPriceTypography = {};

  BacchusBannerImageDivWrap = {};

  BacchusBannerImageImg = {};

  BacchusBannerSwiperSlide = {};

  BacchusBannerSwiperList = {};

  BacchusBannerSwiperSlide = {};

  BacchusDivWrap = {};

  BacchusDiv = {};

  /** => following for dionysus  component  */

  DionysusSelectTabsList = {};

  DionysusSelectTab = {};

  DionysusBoozeRowTailCartIconShoppingCartTwoTone = {};

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

  /** => following for establish  component  */

  EstablishStudentCustomFuncGoBackReactFragmentWrap = {};

  EstablishStudentCustomFuncGoBackChip = {};

  EstablishStudentCustomFuncAcceptReactFragmentWrap = {};

  EstablishStudentCustomFuncAcceptChip = {};

  EstablishStudentCustomFuncDiv = {};

  EstablishStudentCustomAgreeOfContractLabelOfAgreeOfContractTypography = {};

  EstablishStudentCustomAgreeOfContractDivWrap = {};

  EstablishStudentCustomAgreeOfContractCheckbox = {};

  EstablishStudentCustomContractDivWrap = {};

  EstablishStudentCustomContractTypography = {};

  EstablishStudentCustomYoungNoticeDivWrap = {};

  EstablishStudentCustomYoungNoticeTypography = {};

  EstablishStudentCustomYoungContactOfGuardianLabelOfContactOfGuardianTypography = {};

  EstablishStudentCustomYoungContactOfGuardianDivWrap = {};

  EstablishStudentCustomYoungContactOfGuardianTextField = {};

  EstablishStudentCustomYoungNameOfGuardianLabelOfNameOfGuardianTypography = {};

  EstablishStudentCustomYoungNameOfGuardianDivWrap = {};

  EstablishStudentCustomYoungNameOfGuardianTextField = {};

  EstablishStudentCustomYoungDiv = {};

  EstablishStudentCustomIdOfNationalLabelOfIdOfNationalTypography = {};

  EstablishStudentCustomIdOfNationalDivWrap = {};

  EstablishStudentCustomIdOfNationalTextField = {};

  EstablishStudentCustomBirthdayLabelOfBirthdayTypography = {};

  EstablishStudentCustomBirthdayDivWrap = {};

  EstablishStudentCustomBirthdayDatePicker = {};

  EstablishStudentCustomContactLabelOfContactTypography = {};

  EstablishStudentCustomContactDivWrap = {};

  EstablishStudentCustomContactTextField = {};

  EstablishStudentCustomTextOfEmailLabelOfTextOfEmailTypography = {};

  EstablishStudentCustomTextOfEmailDivWrap = {};

  EstablishStudentCustomTextOfEmailTextField = {};

  EstablishStudentCustomNameLabelOfNameTypography = {};

  EstablishStudentCustomNameDivWrap = {};

  EstablishStudentCustomNameTextField = {};

  EstablishStudentCustomDiv = {};

  EstablishStudentMainDatOfPeriodWithHoursLabelOfDatOfPeriodWithHoursTypography = {};

  EstablishStudentMainDatOfPeriodWithHoursBtnOfDatOfPeriodWithHoursIconEditCalendarRounded = {};

  EstablishStudentMainDatOfPeriodWithHoursBtnOfDatOfPeriodWithHoursIconButton = {};

  EstablishStudentMainDatOfPeriodWithHoursDivWrap = {};

  EstablishStudentMainDatOfPeriodWithHoursTypography = {};

  EstablishStudentMainNameOfClassLabelOfNameOfClassTypography = {};

  EstablishStudentMainNameOfClassBtnOfNameOfClassIconSchoolRounded = {};

  EstablishStudentMainNameOfClassBtnOfNameOfClassIconButton = {};

  EstablishStudentMainNameOfClassDivWrap = {};

  EstablishStudentMainNameOfClassTypography = {};

  EstablishStudentMainDiv = {};

  EstablishStudentPaperSkeleton = {};

  EstablishStudentDivList = {};

  EstablishStudentPaper = {};

  EstablishDiv = {};

  /** => following for classSetup  component  */

  ClassSetupClazzAreaOfFuncDeletedReactFragmentWrap = {};

  ClassSetupClazzAreaOfFuncDeletedChip = {};

  ClassSetupClazzAreaOfFuncUpdateChip = {};

  ClassSetupClazzAreaOfFuncDiv = {};

  ClassSetupClazzInfoStateOfClassMenuItem = {};

  ClassSetupClazzInfoStateOfClassTextFieldList = {};

  ClassSetupClazzInfoTypeOfClassMenuItem = {};

  ClassSetupClazzInfoTypeOfClassTextFieldList = {};

  ClassSetupClazzInfoCountsOfStudentCapacityTextField = {};

  ClassSetupClazzInfoDiv = {};

  ClassSetupClazzIntroduceTextField = {};

  ClassSetupClazzClassTimeExtraIconMoreVertRounded = {};

  ClassSetupClazzClassTimeExtraReactFragmentWrap = {};

  ClassSetupClazzClassTimeExtraIconButton = {};

  ClassSetupClazzClassTimeEndOfTimeTimePicker = {};

  ClassSetupClazzClassTimeStartOfTimeTimePicker = {};

  ClassSetupClazzClassTimeDayOfWeekMenuItem = {};

  ClassSetupClazzClassTimeDayOfWeekTextFieldList = {};

  ClassSetupClazzClassTimeDivList = {};

  ClassSetupClazzClassTimeDiv = {};

  ClassSetupClazzSpecificClassDateRangePicker = {};

  ClassSetupClazzFeeOfClassTextField = {};

  ClassSetupClazzNameOfClassTextField = {};

  ClassSetupClazzLinkOfPortfolioTextField = {};

  ClassSetupClazzExperienceOfHostTextField = {};

  ClassSetupClazzHeadNameOfHostTextField = {};

  ClassSetupClazzHeadImageOfHostAvatar = {};

  ClassSetupClazzHeadDiv = {};

  ClassSetupClazzDivList = {};

  ClassSetupClazzPaper = {};

  ClassSetupAreaOfEditBackChip = {};

  ClassSetupAreaOfEditAppendChip = {};

  ClassSetupAreaOfEditDiv = {};

  ClassSetupDiv = {};

  /** => following for quickSignUp  component  */

  QuickSignUpClazzSecondFuncShareIconShareRounded = {};

  QuickSignUpClazzSecondFuncShareIconButton = {};

  QuickSignUpClazzSecondFuncMoreChip = {};

  QuickSignUpClazzSecondFuncSubmitChip = {};

  QuickSignUpClazzSecondFuncDiv = {};

  QuickSignUpClazzSecondIntroduceDivWrap = {};

  QuickSignUpClazzSecondIntroduceTypography = {};

  QuickSignUpClazzSecondStateOfRegisteredLabelOfStateOfRegisteredTypography = {};

  QuickSignUpClazzSecondStateOfRegisteredDivWrap = {};

  QuickSignUpClazzSecondStateOfRegisteredTypography = {};

  QuickSignUpClazzSecondTotalHoursOfClassLabelOfTotalHoursOfClassTypography = {};

  QuickSignUpClazzSecondTotalHoursOfClassDivWrap = {};

  QuickSignUpClazzSecondTotalHoursOfClassTypography = {};

  QuickSignUpClazzSecondDateOfWeekAttendLabelOfDateOfWeekAttendTypography = {};

  QuickSignUpClazzSecondDateOfWeekAttendDivWrap = {};

  QuickSignUpClazzSecondDateOfWeekAttendTypography = {};

  QuickSignUpClazzSecondDateOfPeriodLabelOfDateOfPeriodTypography = {};

  QuickSignUpClazzSecondDateOfPeriodDivWrap = {};

  QuickSignUpClazzSecondDateOfPeriodTypography = {};

  QuickSignUpClazzSecondFeeOfClassLabelOfFeeOfClassTypography = {};

  QuickSignUpClazzSecondFeeOfClassDivWrap = {};

  QuickSignUpClazzSecondFeeOfClassTypography = {};

  QuickSignUpClazzSecondNameOfClassLabelOfNameOfClassTypography = {};

  QuickSignUpClazzSecondNameOfClassDivWrap = {};

  QuickSignUpClazzSecondNameOfClassTypography = {};

  QuickSignUpClazzSecondDiv = {};

  QuickSignUpClazzHeadDescGotoPortfolioDivWrap = {};

  QuickSignUpClazzHeadDescGotoPortfolioChip = {};

  QuickSignUpClazzHeadDescExperienceOfHostTypography = {};

  QuickSignUpClazzHeadDescDiv = {};

  QuickSignUpClazzHeadInfoNameOfHostTypography = {};

  QuickSignUpClazzHeadInfoImageOfHostAvatar = {};

  QuickSignUpClazzHeadInfoDiv = {};

  QuickSignUpClazzHeadDiv = {};

  QuickSignUpClazzCardSkeleton = {};

  QuickSignUpClazzDivList = {};

  QuickSignUpClazzCard = {};

  QuickSignUpDiv = {};

  /** => following for main  component  */

  MainCookieClearChip = {};

  MainEditorOfClassChip = {};

  MainGotoShoppingChip = {};

  MainClassSignUpReactFragmentWrap = {};

  MainClassSignUpChip = {};

  MainGotoInnerShoppingChip = {};

  MainPromotedBannerImageDivWrap = {};

  MainPromotedBannerImageImg = {};

  MainPromotedBannerSwiperSlideSkeleton = {};

  MainPromotedBannerSwiperSlide = {};

  MainPromotedBannerSwiperList = {};

  MainPromotedBannerSwiperSlide = {};

  MainDiv = {};

  /** -------------------- functions -------------------- **/

  constructor(props) {}

  /** -------------------- async api -------------------- **/
}

export default new CommonStyle();
