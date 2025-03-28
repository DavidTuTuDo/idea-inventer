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

  DionysusPlutusMainLocationMainHeadDistrictMenuItem = {};

  DionysusPlutusMainLocationMainHeadDistrictTextFieldList = {};

  DionysusPlutusMainLocationMainHeadCityMenuItem = {};

  DionysusPlutusMainLocationMainHeadCityTextFieldList = {};

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

  DionysusCartieMainBriefSpecTipCountLabelOfCountTypography = {};

  DionysusCartieMainBriefSpecTipCountDivWrap = {};

  DionysusCartieMainBriefSpecTipCountTypography = {};

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

  DionysusCartieMainBriefSpecNameOfOptionChip = {};

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

  DionysusMaenadsOptionNameChip = {};

  DionysusMaenadsOptionDivList = {};

  DionysusMaenadsOptionDiv = {};

  DionysusMaenadsTitleOfShapeTypography = {};

  DionysusMaenadsMainInfoCountLabelOfCountTypography = {};

  DionysusMaenadsMainInfoCountDivWrap = {};

  DionysusMaenadsMainInfoCountTypography = {};

  DionysusMaenadsMainInfoRowPriceTypography = {};

  DionysusMaenadsMainInfoRowDiv = {};

  DionysusMaenadsMainInfoDiv = {};

  DionysusMaenadsMainPhotoImg = {};

  DionysusMaenadsMainDiv = {};

  DionysusMaenadsDivWrap = {};

  DionysusMaenadsPaper = {};

  /** => following for bacchus  component  */

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

  DionysusBacchusDetailAreaOfBenefitArrowIconNavigateNext = {};

  DionysusBacchusDetailAreaOfBenefitArrowIconButton = {};

  DionysusBacchusDetailAreaOfBenefitOptionOfBenefitContentTypography = {};

  DionysusBacchusDetailAreaOfBenefitOptionOfBenefitTitleTypography = {};

  DionysusBacchusDetailAreaOfBenefitDiv = {};

  DionysusBacchusDetailAreaOfShippingArrowIconNavigateNext = {};

  DionysusBacchusDetailAreaOfShippingArrowIconButton = {};

  DionysusBacchusDetailAreaOfShippingOptionOfShippingContentTypography = {};

  DionysusBacchusDetailAreaOfShippingOptionOfShippingTitleTypography = {};

  DionysusBacchusDetailAreaOfShippingDiv = {};

  DionysusBacchusDetailAreaOfPayArrowIconNavigateNext = {};

  DionysusBacchusDetailAreaOfPayArrowIconButton = {};

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

  DionysusBacchusBannerSwiperSlide = {};

  DionysusBacchusBannerSwiperList = {};

  DionysusBacchusBannerSwiperSlide = {};

  DionysusBacchusDivWrap = {};

  DionysusBacchusDiv = {};

  /** => following for dionysus  component  */

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

export default new AppStyle();
