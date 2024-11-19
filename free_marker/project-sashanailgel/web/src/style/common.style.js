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

  /** => following for main editor component  */

  MainEditorPromotedBannerImageTextField = {};

  MainEditorPromotedBannerImageDivWrap = {};

  MainEditorPromotedBannerImageImg = {};

  MainEditorPromotedBannerRouteTextField = {};

  MainEditorPromotedBannerIdTextField = {};

  MainEditorPromotedBannerDivWrap = {};

  MainEditorPromotedBannerDiv = {};

  MainEditorPromotedBannerDivList = {};

  MainEditorPromotedBannerDivWrap = {};

  MainEditorPromotedBannerDiv = {};

  MainEditorDiv = {};

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

  PlutusSummariseFifthFeeOfPaymentLabelOfFeeOfPaymentTypography = {};

  PlutusSummariseFifthFeeOfPaymentDivWrap = {};

  PlutusSummariseFifthFeeOfPaymentTypography = {};

  PlutusSummariseFifthHeadLabelOfPaymentDivWrap = {};

  PlutusSummariseFifthHeadLabelOfPaymentTypography = {};

  PlutusSummariseFifthDiv = {};

  PlutusSummariseFourthFeeOfMemberDiscountLabelOfFeeOfMemberDiscountTypography = {};

  PlutusSummariseFourthFeeOfMemberDiscountDivWrap = {};

  PlutusSummariseFourthFeeOfMemberDiscountTypography = {};

  PlutusSummariseFourthHeadLabelOfMemberDiscountDivWrap = {};

  PlutusSummariseFourthHeadLabelOfMemberDiscountTypography = {};

  PlutusSummariseFourthDiv = {};

  PlutusSummariseThirdFeeOfTransportLabelOfFeeOfTransportTypography = {};

  PlutusSummariseThirdFeeOfTransportDivWrap = {};

  PlutusSummariseThirdFeeOfTransportTypography = {};

  PlutusSummariseThirdHeadLabelOfTransportDivWrap = {};

  PlutusSummariseThirdHeadLabelOfTransportTypography = {};

  PlutusSummariseThirdDiv = {};

  PlutusSummariseSecondDiscountLabelOfDiscountTypography = {};

  PlutusSummariseSecondDiscountDivWrap = {};

  PlutusSummariseSecondDiscountTypography = {};

  PlutusSummariseSecondHeadLabelOfDiscountDivWrap = {};

  PlutusSummariseSecondHeadLabelOfDiscountTypography = {};

  PlutusSummariseSecondDiv = {};

  PlutusSummariseFirstPriceLabelOfPriceTypography = {};

  PlutusSummariseFirstPriceDivWrap = {};

  PlutusSummariseFirstPriceTypography = {};

  PlutusSummariseFirstHeadLabelOfPriceDivWrap = {};

  PlutusSummariseFirstHeadLabelOfPriceTypography = {};

  PlutusSummariseFirstDiv = {};

  PlutusSummariseDiv = {};

  PlutusLocationMainTailFindIconWifiFind = {};

  PlutusLocationMainTailFindIconButton = {};

  PlutusLocationMainTailAddressTextField = {};

  PlutusLocationMainTailDiv = {};

  PlutusLocationMainHeadDistrictMenuItem = {};

  PlutusLocationMainHeadDistrictTextFieldList = {};

  PlutusLocationMainHeadCityMenuItem = {};

  PlutusLocationMainHeadCityTextFieldList = {};

  PlutusLocationMainHeadDiv = {};

  PlutusLocationMainDiv = {};

  PlutusLocationHeadLabelOfAddressTypography = {};

  PlutusLocationDiv = {};

  PlutusPhoneLabelOfPhoneTypography = {};

  PlutusPhoneDivWrap = {};

  PlutusPhoneTextField = {};

  PlutusEmailLabelOfEmailTypography = {};

  PlutusEmailDivWrap = {};

  PlutusEmailTextField = {};

  PlutusNameLabelOfNameTypography = {};

  PlutusNameDivWrap = {};

  PlutusNameTextField = {};

  PlutusDivWrap = {};

  PlutusDiv = {};

  /** => following for hermes  component  */

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

  CartieFuncSubmitDivWrap = {};

  CartieFuncSubmitChip = {};

  CartieFuncPriceOfTotalLabelOfPriceOfTotalTypography = {};

  CartieFuncPriceOfTotalDivWrap = {};

  CartieFuncPriceOfTotalTypography = {};

  CartieFuncWholeLabelOfWholeTypography = {};

  CartieFuncWholeDivWrap = {};

  CartieFuncWholeCheckbox = {};

  CartieFuncDivWrap = {};

  CartieFuncDiv = {};

  CartieSummariseDiscountOfMemberLabelOfDiscountOfMemberTypography = {};

  CartieSummariseDiscountOfMemberDivWrap = {};

  CartieSummariseDiscountOfMemberTypography = {};

  CartieSummarisePriceOfTransportLabelOfPriceOfTransportTypography = {};

  CartieSummarisePriceOfTransportDivWrap = {};

  CartieSummarisePriceOfTransportTypography = {};

  CartieSummarisePriceOfDiscountLabelOfPriceOfDiscountTypography = {};

  CartieSummarisePriceOfDiscountDivWrap = {};

  CartieSummarisePriceOfDiscountTypography = {};

  CartieSummarisePriceWithoutDiscountLabelOfPriceWithoutDiscountTypography = {};

  CartieSummarisePriceWithoutDiscountDivWrap = {};

  CartieSummarisePriceWithoutDiscountTypography = {};

  CartieSummariseDiv = {};

  CartieBriefSpecLandConclusionOfQuantityIncreaseIconAdd = {};

  CartieBriefSpecLandConclusionOfQuantityIncreaseIconButton = {};

  CartieBriefSpecLandConclusionOfQuantityCountOfSubmitTextField = {};

  CartieBriefSpecLandConclusionOfQuantityDecreaseIconRemove = {};

  CartieBriefSpecLandConclusionOfQuantityDecreaseIconButton = {};

  CartieBriefSpecLandConclusionOfQuantityDivWrap = {};

  CartieBriefSpecLandConclusionOfQuantityDiv = {};

  CartieBriefSpecLandMainPriceOfOriginTypography = {};

  CartieBriefSpecLandMainPriceLabelOfPriceTypography = {};

  CartieBriefSpecLandMainPriceDivWrap = {};

  CartieBriefSpecLandMainPriceTypography = {};

  CartieBriefSpecLandMainDiv = {};

  CartieBriefSpecLandDiv = {};

  CartieBriefSpecInfoOfBenefitTypography = {};

  CartieBriefSpecNameOfOptionChip = {};

  CartieBriefSpecFullCancelIconDeleteForeverRounded = {};

  CartieBriefSpecFullCancelReactFragmentWrap = {};

  CartieBriefSpecFullCancelIconButton = {};

  CartieBriefSpecFullNameTypography = {};

  CartieBriefSpecFullDiv = {};

  CartieBriefSpecDiv = {};

  CartieBriefPhotoImg = {};

  CartieBriefSureDivWrap = {};

  CartieBriefSureCheckbox = {};

  CartieBriefDivList = {};

  CartieBriefDiv = {};

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

  MaenadsMainInfoPriceTypography = {};

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

  BacchusDiv = {};

  /** => following for dionysus  component  */

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

  DionysusBoozeHeadPhotoImg = {};

  DionysusBoozeDivSkeleton = {};

  DionysusBoozeDivList = {};

  DionysusBoozeDiv = {};

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
