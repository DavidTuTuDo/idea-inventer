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

    NavigatorToolBarAccountIconAccountCircle = {};

    NavigatorToolBarAccountReactFragmentWrap = {};

    NavigatorToolBarAccountIconButton = {};

    NavigatorToolBarLoginIconLogin = {};

    NavigatorToolBarLoginIconButton = {};

    NavigatorToolBarTipOfLoadingCircularProgress = {};

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

    /** => following for metisSignUp  component  */

    MetisSignUpStudentCustomFuncGoBackReactFragmentWrap = {};

    MetisSignUpStudentCustomFuncGoBackChip = {};

    MetisSignUpStudentCustomFuncAcceptReactFragmentWrap = {};

    MetisSignUpStudentCustomFuncAcceptChip = {};

    MetisSignUpStudentCustomFuncDiv = {};

    MetisSignUpStudentCustomAgreeOfContractLabelOfAgreeOfContractTypography = {};

    MetisSignUpStudentCustomAgreeOfContractDivWrap = {};

    MetisSignUpStudentCustomAgreeOfContractCheckbox = {};

    MetisSignUpStudentCustomContractDivWrap = {};

    MetisSignUpStudentCustomContractTypography = {};

    MetisSignUpStudentCustomYoungNoticeDivWrap = {};

    MetisSignUpStudentCustomYoungNoticeTypography = {};

    MetisSignUpStudentCustomYoungContactOfGuardianLabelOfContactOfGuardianTypography = {};

    MetisSignUpStudentCustomYoungContactOfGuardianDivWrap = {};

    MetisSignUpStudentCustomYoungContactOfGuardianTextField = {};

    MetisSignUpStudentCustomYoungNameOfGuardianLabelOfNameOfGuardianTypography = {};

    MetisSignUpStudentCustomYoungNameOfGuardianDivWrap = {};

    MetisSignUpStudentCustomYoungNameOfGuardianTextField = {};

    MetisSignUpStudentCustomYoungDiv = {};

    MetisSignUpStudentCustomIdOfNationalLabelOfIdOfNationalTypography = {};

    MetisSignUpStudentCustomIdOfNationalDivWrap = {};

    MetisSignUpStudentCustomIdOfNationalTextField = {};

    MetisSignUpStudentCustomBirthdayLabelOfBirthdayTypography = {};

    MetisSignUpStudentCustomBirthdayDivWrap = {};

    MetisSignUpStudentCustomBirthdayDatePicker = {};

    MetisSignUpStudentCustomContactLabelOfContactTypography = {};

    MetisSignUpStudentCustomContactDivWrap = {};

    MetisSignUpStudentCustomContactTextField = {};

    MetisSignUpStudentCustomTextOfEmailLabelOfTextOfEmailTypography = {};

    MetisSignUpStudentCustomTextOfEmailDivWrap = {};

    MetisSignUpStudentCustomTextOfEmailTextField = {};

    MetisSignUpStudentCustomNameLabelOfNameTypography = {};

    MetisSignUpStudentCustomNameDivWrap = {};

    MetisSignUpStudentCustomNameTextField = {};

    MetisSignUpStudentCustomDiv = {};

    MetisSignUpStudentMainDatOfPeriodWithHoursLabelOfDatOfPeriodWithHoursTypography = {};

    MetisSignUpStudentMainDatOfPeriodWithHoursBtnOfDatOfPeriodWithHoursIconEditCalendarRounded = {};

    MetisSignUpStudentMainDatOfPeriodWithHoursBtnOfDatOfPeriodWithHoursIconButton = {};

    MetisSignUpStudentMainDatOfPeriodWithHoursDivWrap = {};

    MetisSignUpStudentMainDatOfPeriodWithHoursTypography = {};

    MetisSignUpStudentMainNameOfClassLabelOfNameOfClassTypography = {};

    MetisSignUpStudentMainNameOfClassBtnOfNameOfClassIconSchoolRounded = {};

    MetisSignUpStudentMainNameOfClassBtnOfNameOfClassIconButton = {};

    MetisSignUpStudentMainNameOfClassDivWrap = {};

    MetisSignUpStudentMainNameOfClassTypography = {};

    MetisSignUpStudentMainDiv = {};

    MetisSignUpStudentPaperSkeleton = {};

    MetisSignUpStudentDivList = {};

    MetisSignUpStudentPaper = {};

    MetisSignUpDiv = {};

    /** => following for metisSetUp  component  */

    MetisSetUpClazzAreaOfFuncDeletedReactFragmentWrap = {};

    MetisSetUpClazzAreaOfFuncDeletedChip = {};

    MetisSetUpClazzAreaOfFuncUpdateChip = {};

    MetisSetUpClazzAreaOfFuncDiv = {};

    MetisSetUpClazzInfoStateOfClassTextFieldList = {};

    MetisSetUpClazzInfoStateOfClassMenuItem = {};

    MetisSetUpClazzInfoTypeOfClassTextFieldList = {};

    MetisSetUpClazzInfoTypeOfClassMenuItem = {};

    MetisSetUpClazzInfoCountsOfStudentCapacityTextField = {};

    MetisSetUpClazzInfoDiv = {};

    MetisSetUpClazzIntroduceTextField = {};

    MetisSetUpClazzClassTimeExtraIconMoreVertRounded = {};

    MetisSetUpClazzClassTimeExtraReactFragmentWrap = {};

    MetisSetUpClazzClassTimeExtraIconButton = {};

    MetisSetUpClazzClassTimeEndOfTimeTimePicker = {};

    MetisSetUpClazzClassTimeStartOfTimeTimePicker = {};

    MetisSetUpClazzClassTimeDayOfWeekTextFieldList = {};

    MetisSetUpClazzClassTimeDayOfWeekMenuItem = {};

    MetisSetUpClazzClassTimeDivList = {};

    MetisSetUpClazzClassTimeDiv = {};

    MetisSetUpClazzSpecificClassDateRangePicker = {};

    MetisSetUpClazzFeeOfClassTextField = {};

    MetisSetUpClazzNameOfClassTextField = {};

    MetisSetUpClazzLinkOfPortfolioTextField = {};

    MetisSetUpClazzExperienceOfHostTextField = {};

    MetisSetUpClazzHeadNameOfHostTextField = {};

    MetisSetUpClazzHeadImageOfHostAvatar = {};

    MetisSetUpClazzHeadDiv = {};

    MetisSetUpClazzDivList = {};

    MetisSetUpClazzPaper = {};

    MetisSetUpAreaOfEditBackChip = {};

    MetisSetUpAreaOfEditAppendChip = {};

    MetisSetUpAreaOfEditDiv = {};

    MetisSetUpDiv = {};

    /** => following for metis  component  */

    MetisClazzSecondFuncShareIconShareRounded = {};

    MetisClazzSecondFuncShareIconButton = {};

    MetisClazzSecondFuncMoreChip = {};

    MetisClazzSecondFuncSubmitChip = {};

    MetisClazzSecondFuncDiv = {};

    MetisClazzSecondIntroduceDivWrap = {};

    MetisClazzSecondIntroduceTypography = {};

    MetisClazzSecondStateOfRegisteredLabelOfStateOfRegisteredTypography = {};

    MetisClazzSecondStateOfRegisteredDivWrap = {};

    MetisClazzSecondStateOfRegisteredTypography = {};

    MetisClazzSecondTotalHoursOfClassLabelOfTotalHoursOfClassTypography = {};

    MetisClazzSecondTotalHoursOfClassDivWrap = {};

    MetisClazzSecondTotalHoursOfClassTypography = {};

    MetisClazzSecondDateOfWeekAttendLabelOfDateOfWeekAttendTypography = {};

    MetisClazzSecondDateOfWeekAttendDivWrap = {};

    MetisClazzSecondDateOfWeekAttendTypography = {};

    MetisClazzSecondDateOfPeriodLabelOfDateOfPeriodTypography = {};

    MetisClazzSecondDateOfPeriodDivWrap = {};

    MetisClazzSecondDateOfPeriodTypography = {};

    MetisClazzSecondFeeOfClassLabelOfFeeOfClassTypography = {};

    MetisClazzSecondFeeOfClassDivWrap = {};

    MetisClazzSecondFeeOfClassTypography = {};

    MetisClazzSecondNameOfClassLabelOfNameOfClassTypography = {};

    MetisClazzSecondNameOfClassDivWrap = {};

    MetisClazzSecondNameOfClassTypography = {};

    MetisClazzSecondDiv = {};

    MetisClazzHeadDescGotoPortfolioDivWrap = {};

    MetisClazzHeadDescGotoPortfolioChip = {};

    MetisClazzHeadDescExperienceOfHostTypography = {};

    MetisClazzHeadDescDiv = {};

    MetisClazzHeadInfoNameOfHostTypography = {};

    MetisClazzHeadInfoImageOfHostAvatar = {};

    MetisClazzHeadInfoDiv = {};

    MetisClazzHeadDiv = {};

    MetisClazzCardSkeleton = {};

    MetisClazzDivList = {};

    MetisClazzCard = {};

    MetisDiv = {};

    /** => following for numberSetter  component  */

    IreneNumberSetterFuncConfirmChip = {};

    IreneNumberSetterFuncLeaveChip = {};

    IreneNumberSetterFuncDiv = {};

    IreneNumberSetterRowValueTextField = {};

    IreneNumberSetterRowColonTypography = {};

    IreneNumberSetterRowLabelTypography = {};

    IreneNumberSetterRowDivList = {};

    IreneNumberSetterRowDiv = {};

    IreneNumberSetterDivWrap = {};

    IreneNumberSetterPaper = {};

    /** => following for timePeriod  component  */

    IreneTimePeriodFuncConfirmChip = {};

    IreneTimePeriodFuncLeaveChip = {};

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

    IreneTextsIndexSetterFuncUpdateChip = {};

    IreneTextsIndexSetterFuncLeaveChip = {};

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

    IreneTextFetchFuncAppendChip = {};

    IreneTextFetchFuncLeaveChip = {};

    IreneTextFetchFuncDiv = {};

    IreneTextFetchRowClearIconClearRounded = {};

    IreneTextFetchRowClearIconButton = {};

    IreneTextFetchRowContentTextField = {};

    IreneTextFetchRowTitleTypography = {};

    IreneTextFetchRowDiv = {};

    IreneTextFetchDivWrap = {};

    IreneTextFetchPaper = {};

    /** => following for textsFetch  component  */

    IreneTextsFetchFuncAppendChip = {};

    IreneTextsFetchFuncLeaveChip = {};

    IreneTextsFetchFuncDiv = {};

    IreneTextsFetchTitleClearIconDeleteForeverRounded = {};

    IreneTextsFetchTitleClearIconButton = {};

    IreneTextsFetchTitleContentTextField = {};

    IreneTextsFetchTitleIndexTypography = {};

    IreneTextsFetchTitleDivList = {};

    IreneTextsFetchTitleDiv = {};

    IreneTextsFetchDivWrap = {};

    IreneTextsFetchPaper = {};

    /** => following for ireneQrcode  component  */

    IreneQrcodeMainCautionTypography = {};

    IreneQrcodeMainContentLabelOfContentTypography = {};

    IreneQrcodeMainContentDivWrap = {};

    IreneQrcodeMainContentTypography = {};

    IreneQrcodeMainScanTitleTypography = {};

    IreneQrcodeMainScanHrefDivWrap = {};

    IreneQrcodeMainScanHrefQrCode = {};

    IreneQrcodeMainScanTipTypography = {};

    IreneQrcodeMainScanDiv = {};

    IreneQrcodeMainRowSubDivWrap = {};

    IreneQrcodeMainRowSubTypography = {};

    IreneQrcodeMainRowMainTypography = {};

    IreneQrcodeMainRowDiv = {};

    IreneQrcodeMainDiv = {};

    IreneQrcodePaperWrap = {};

    IreneQrcodeDiv = {};

    /** => following for miniWeb  component  */

    IreneMiniWebDivWrap = {};

    IreneMiniWebDiv = {};

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

    InfoOfCopyRightContactPortfolioDivWrap = {};

    InfoOfCopyRightContactPortfolioTypography = {};

    InfoOfCopyRightContactLowerAreaDetailsTypography = {};

    InfoOfCopyRightContactLowerAreaIntroduceDivWrap = {};

    InfoOfCopyRightContactLowerAreaIntroduceTypography = {};

    InfoOfCopyRightContactLowerAreaDiv = {};

    InfoOfCopyRightContactUpperAreaGroupOfSocialMediaLineOImgOfLineOImg = {};

    InfoOfCopyRightContactUpperAreaGroupOfSocialMediaLineOIconButton = {};

    InfoOfCopyRightContactUpperAreaGroupOfSocialMediaIgOImgOfIgOImg = {};

    InfoOfCopyRightContactUpperAreaGroupOfSocialMediaIgOIconButton = {};

    InfoOfCopyRightContactUpperAreaGroupOfSocialMediaFbOImgOfFbOImg = {};

    InfoOfCopyRightContactUpperAreaGroupOfSocialMediaFbOIconButton = {};

    InfoOfCopyRightContactUpperAreaGroupOfSocialMediaDiv = {};

    InfoOfCopyRightContactUpperAreaGroupOfDetailEmailOLabelOfEmailOTypography = {};

    InfoOfCopyRightContactUpperAreaGroupOfDetailEmailOBtnOfEmailOIconMailOutlined = {};

    InfoOfCopyRightContactUpperAreaGroupOfDetailEmailOBtnOfEmailOIconButton = {};

    InfoOfCopyRightContactUpperAreaGroupOfDetailEmailODivWrap = {};

    InfoOfCopyRightContactUpperAreaGroupOfDetailEmailOTypography = {};

    InfoOfCopyRightContactUpperAreaGroupOfDetailPhoneOLabelOfPhoneOTypography = {};

    InfoOfCopyRightContactUpperAreaGroupOfDetailPhoneOBtnOfPhoneOIconPhoneOutlined = {};

    InfoOfCopyRightContactUpperAreaGroupOfDetailPhoneOBtnOfPhoneOIconButton = {};

    InfoOfCopyRightContactUpperAreaGroupOfDetailPhoneODivWrap = {};

    InfoOfCopyRightContactUpperAreaGroupOfDetailPhoneOTypography = {};

    InfoOfCopyRightContactUpperAreaGroupOfDetailDiv = {};

    InfoOfCopyRightContactUpperAreaContactDivWrap = {};

    InfoOfCopyRightContactUpperAreaContactTypography = {};

    InfoOfCopyRightContactUpperAreaDiv = {};

    InfoOfCopyRightContactDivWrap = {};

    InfoOfCopyRightContactCard = {};

    /** => following for infoOfCopyRightUsages  component  */

    InfoOfCopyRightUsagesMainContentTypography = {};

    InfoOfCopyRightUsagesMainSeparatorDiv = {};

    InfoOfCopyRightUsagesMainTitleTypography = {};

    InfoOfCopyRightUsagesMainDiv = {};

    InfoOfCopyRightUsagesPaperWrap = {};

    InfoOfCopyRightUsagesDiv = {};

    /** => following for infoOfCopyRightPrivacy  component  */

    InfoOfCopyRightPrivacyMainContentTypography = {};

    InfoOfCopyRightPrivacyMainSeparatorDiv = {};

    InfoOfCopyRightPrivacyMainTitleTypography = {};

    InfoOfCopyRightPrivacyMainDiv = {};

    InfoOfCopyRightPrivacyPaperWrap = {};

    InfoOfCopyRightPrivacyDiv = {};

    /** => following for infoOfCopyRight  component  */

    InfoOfCopyRightColUnifiedBLabelOfUnifiedBTypography = {};

    InfoOfCopyRightColUnifiedBDivWrap = {};

    InfoOfCopyRightColUnifiedBTypography = {};

    InfoOfCopyRightColPhoneOLabelOfPhoneOTypography = {};

    InfoOfCopyRightColPhoneODivWrap = {};

    InfoOfCopyRightColPhoneOTypography = {};

    InfoOfCopyRightColAddressOLabelOfAddressOTypography = {};

    InfoOfCopyRightColAddressODivWrap = {};

    InfoOfCopyRightColAddressOTypography = {};

    InfoOfCopyRightColCompanyOTypography = {};

    InfoOfCopyRightColDiv = {};

    InfoOfCopyRightGroupOfSocialMediaLineOImgOfLineOImg = {};

    InfoOfCopyRightGroupOfSocialMediaLineOIconButton = {};

    InfoOfCopyRightGroupOfSocialMediaIgOImgOfIgOImg = {};

    InfoOfCopyRightGroupOfSocialMediaIgOIconButton = {};

    InfoOfCopyRightGroupOfSocialMediaFbOImgOfFbOImg = {};

    InfoOfCopyRightGroupOfSocialMediaFbOIconButton = {};

    InfoOfCopyRightGroupOfSocialMediaDiv = {};

    InfoOfCopyRightUpperGroupRightAreaCprtButton = {};

    InfoOfCopyRightUpperGroupRightAreaSeparatorTypography = {};

    InfoOfCopyRightUpperGroupRightAreaResponsibilityOffReactFragmentWrap = {};

    InfoOfCopyRightUpperGroupRightAreaResponsibilityOffButton = {};

    InfoOfCopyRightUpperGroupRightAreaPrivilegeSeparator02Typography = {};

    InfoOfCopyRightUpperGroupRightAreaPrivilegePrivacyReactFragmentWrap = {};

    InfoOfCopyRightUpperGroupRightAreaPrivilegePrivacyButton = {};

    InfoOfCopyRightUpperGroupRightAreaPrivilegeSeparator01Typography = {};

    InfoOfCopyRightUpperGroupRightAreaPrivilegeUsageRulesReactFragmentWrap = {};

    InfoOfCopyRightUpperGroupRightAreaPrivilegeUsageRulesButton = {};

    InfoOfCopyRightUpperGroupRightAreaPrivilegeDiv = {};

    InfoOfCopyRightUpperGroupRightAreaDiv = {};

    InfoOfCopyRightUpperGroupLeftAreaContactReactFragmentWrap = {};

    InfoOfCopyRightUpperGroupLeftAreaContactButton = {};

    InfoOfCopyRightUpperGroupLeftAreaDiv = {};

    InfoOfCopyRightUpperGroupDiv = {};

    InfoOfCopyRightDiv = {};

    /** => following for hades  component  */

    HadesDiv = {};

    /** => following for anonymousXDeal  component  */

    EpayAnonymousXDealFuncCopyLinkChip = {};

    EpayAnonymousXDealFuncToMainChip = {};

    EpayAnonymousXDealFuncDiv = {};

    EpayAnonymousXDealDivWrap = {};

    EpayAnonymousXDealDiv = {};

    /** => following for epayFootprint  component  */

    EpayFootprintPayNowReactFragmentWrap = {};

    EpayFootprintPayNowDiv = {};

    EpayFootprintTransNotifyReactFragmentWrap = {};

    EpayFootprintTransNotifyDiv = {};

    EpayFootprintTabTabsList = {};

    EpayFootprintTabTab = {};

    EpayFootprintOrderRemarkOfAuthorLabelOfRemarkOfAuthorTypography = {};

    EpayFootprintOrderRemarkOfAuthorDivWrap = {};

    EpayFootprintOrderRemarkOfAuthorTextField = {};

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

    EpayFootprintOrderAreaOfSerialSerialOfTransportLabelOfSerialOfTransportTypography = {};

    EpayFootprintOrderAreaOfSerialSerialOfTransportDivWrap = {};

    EpayFootprintOrderAreaOfSerialSerialOfTransportTypography = {};

    EpayFootprintOrderAreaOfSerialDiv = {};

    EpayFootprintOrderAreaOfCvsPickUpCvsLabelOfPickUpCvsTypography = {};

    EpayFootprintOrderAreaOfCvsPickUpCvsDivWrap = {};

    EpayFootprintOrderAreaOfCvsPickUpCvsTypography = {};

    EpayFootprintOrderAreaOfCvsDiv = {};

    EpayFootprintOrderAreaOfTransportTransportByLabelOfTransportByTypography = {};

    EpayFootprintOrderAreaOfTransportTransportByDivWrap = {};

    EpayFootprintOrderAreaOfTransportTransportByTypography = {};

    EpayFootprintOrderAreaOfTransportDiv = {};

    EpayFootprintOrderAreaOfPaymentRuleRuleLabelOfRuleTypography = {};

    EpayFootprintOrderAreaOfPaymentRuleRuleDivWrap = {};

    EpayFootprintOrderAreaOfPaymentRuleRuleTypography = {};

    EpayFootprintOrderAreaOfPaymentRuleDiv = {};

    EpayFootprintOrderRemarkLabelOfRemarkTypography = {};

    EpayFootprintOrderRemarkDivWrap = {};

    EpayFootprintOrderRemarkTextField = {};

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

    EpayFootprintOrderAreaOfTopSectionOfTailOptionOfTransportIconMoreVertRounded = {};

    EpayFootprintOrderAreaOfTopSectionOfTailOptionOfTransportReactFragmentWrap = {};

    EpayFootprintOrderAreaOfTopSectionOfTailOptionOfTransportIconButton = {};

    EpayFootprintOrderAreaOfTopSectionOfTailOptionOfUnpaidIconMoreVertRounded = {};

    EpayFootprintOrderAreaOfTopSectionOfTailOptionOfUnpaidReactFragmentWrap = {};

    EpayFootprintOrderAreaOfTopSectionOfTailOptionOfUnpaidIconButton = {};

    EpayFootprintOrderAreaOfTopSectionOfTailOptionOfPendingIconMoreVertRounded = {};

    EpayFootprintOrderAreaOfTopSectionOfTailOptionOfPendingReactFragmentWrap = {};

    EpayFootprintOrderAreaOfTopSectionOfTailOptionOfPendingIconButton = {};

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

    DionysusPriceSetterFuncBatchUpdateChip = {};

    DionysusPriceSetterFuncLeaveChip = {};

    DionysusPriceSetterFuncCommonReactFragmentWrap = {};

    DionysusPriceSetterFuncCommonChip = {};

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

    DionysusQuantitySetterFuncBatchUpdateChip = {};

    DionysusQuantitySetterFuncLeaveChip = {};

    DionysusQuantitySetterFuncCommonReactFragmentWrap = {};

    DionysusQuantitySetterFuncCommonChip = {};

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

    DionysusApolloFuncConfirmChip = {};

    DionysusApolloFuncLeaveChip = {};

    DionysusApolloFuncLoadChip = {};

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

    DionysusErosAreaOfThresholdOfFreeShipByStorePickupArrowOfThresholdOfFreeShipByStorePickupIconNavigateNext = {};

    DionysusErosAreaOfThresholdOfFreeShipByStorePickupArrowOfThresholdOfFreeShipByStorePickupReactFragmentWrap = {};

    DionysusErosAreaOfThresholdOfFreeShipByStorePickupArrowOfThresholdOfFreeShipByStorePickupIconButton = {};

    DionysusErosAreaOfThresholdOfFreeShipByStorePickupOptionOfThresholdOfFreeShipByStorePickupContentTypography = {};

    DionysusErosAreaOfThresholdOfFreeShipByStorePickupOptionOfThresholdOfFreeShipByStorePickupTitleTypography = {};

    DionysusErosAreaOfThresholdOfFreeShipByStorePickupDivWrap = {};

    DionysusErosAreaOfThresholdOfFreeShipByStorePickupDiv = {};

    DionysusErosAreaOfFeeOfInStorePickupArrowOfFeeOfInStorePickupIconNavigateNext = {};

    DionysusErosAreaOfFeeOfInStorePickupArrowOfFeeOfInStorePickupReactFragmentWrap = {};

    DionysusErosAreaOfFeeOfInStorePickupArrowOfFeeOfInStorePickupIconButton = {};

    DionysusErosAreaOfFeeOfInStorePickupOptionOfFeeOfInStorePickupContentTypography = {};

    DionysusErosAreaOfFeeOfInStorePickupOptionOfFeeOfInStorePickupTitleTypography = {};

    DionysusErosAreaOfFeeOfInStorePickupDivWrap = {};

    DionysusErosAreaOfFeeOfInStorePickupDiv = {};

    DionysusErosAreaOfWhetherShipByStorePickupEnableOfWhetherShipByStorePickupSwitch = {};

    DionysusErosAreaOfWhetherShipByStorePickupOptionOfWhetherShipByStorePickupContentTypography = {};

    DionysusErosAreaOfWhetherShipByStorePickupOptionOfWhetherShipByStorePickupTitleTypography = {};

    DionysusErosAreaOfWhetherShipByStorePickupDivWrap = {};

    DionysusErosAreaOfWhetherShipByStorePickupDiv = {};

    DionysusErosAreaOfThresholdOfFreeShipByRapidlyArrowOfThresholdOfFreeShipByRapidlyIconNavigateNext = {};

    DionysusErosAreaOfThresholdOfFreeShipByRapidlyArrowOfThresholdOfFreeShipByRapidlyReactFragmentWrap = {};

    DionysusErosAreaOfThresholdOfFreeShipByRapidlyArrowOfThresholdOfFreeShipByRapidlyIconButton = {};

    DionysusErosAreaOfThresholdOfFreeShipByRapidlyOptionOfThresholdOfFreeShipByRapidlyContentTypography = {};

    DionysusErosAreaOfThresholdOfFreeShipByRapidlyOptionOfThresholdOfFreeShipByRapidlyTitleTypography = {};

    DionysusErosAreaOfThresholdOfFreeShipByRapidlyDivWrap = {};

    DionysusErosAreaOfThresholdOfFreeShipByRapidlyDiv = {};

    DionysusErosAreaOfFeeOfRapidOnDeliveryArrowOfFeeOfRapidOnDeliveryIconNavigateNext = {};

    DionysusErosAreaOfFeeOfRapidOnDeliveryArrowOfFeeOfRapidOnDeliveryReactFragmentWrap = {};

    DionysusErosAreaOfFeeOfRapidOnDeliveryArrowOfFeeOfRapidOnDeliveryIconButton = {};

    DionysusErosAreaOfFeeOfRapidOnDeliveryOptionOfFeeOfRapidOnDeliveryContentTypography = {};

    DionysusErosAreaOfFeeOfRapidOnDeliveryOptionOfFeeOfRapidOnDeliveryTitleTypography = {};

    DionysusErosAreaOfFeeOfRapidOnDeliveryDivWrap = {};

    DionysusErosAreaOfFeeOfRapidOnDeliveryDiv = {};

    DionysusErosAreaOfWhetherShipByRapidlyEnableOfWhetherShipByRapidlySwitch = {};

    DionysusErosAreaOfWhetherShipByRapidlyOptionOfWhetherShipByRapidlyContentTypography = {};

    DionysusErosAreaOfWhetherShipByRapidlyOptionOfWhetherShipByRapidlyTitleTypography = {};

    DionysusErosAreaOfWhetherShipByRapidlyDivWrap = {};

    DionysusErosAreaOfWhetherShipByRapidlyDiv = {};

    DionysusErosAreaOfThresholdOfFreeShipByHomeDeliveryArrowOfThresholdOfFreeShipByHomeDeliveryIconNavigateNext = {};

    DionysusErosAreaOfThresholdOfFreeShipByHomeDeliveryArrowOfThresholdOfFreeShipByHomeDeliveryReactFragmentWrap = {};

    DionysusErosAreaOfThresholdOfFreeShipByHomeDeliveryArrowOfThresholdOfFreeShipByHomeDeliveryIconButton = {};

    DionysusErosAreaOfThresholdOfFreeShipByHomeDeliveryOptionOfThresholdOfFreeShipByHomeDeliveryContentTypography = {};

    DionysusErosAreaOfThresholdOfFreeShipByHomeDeliveryOptionOfThresholdOfFreeShipByHomeDeliveryTitleTypography = {};

    DionysusErosAreaOfThresholdOfFreeShipByHomeDeliveryDivWrap = {};

    DionysusErosAreaOfThresholdOfFreeShipByHomeDeliveryDiv = {};

    DionysusErosAreaOfFeeOfHomeDeliveryArrowOfFeeOfHomeDeliveryIconNavigateNext = {};

    DionysusErosAreaOfFeeOfHomeDeliveryArrowOfFeeOfHomeDeliveryReactFragmentWrap = {};

    DionysusErosAreaOfFeeOfHomeDeliveryArrowOfFeeOfHomeDeliveryIconButton = {};

    DionysusErosAreaOfFeeOfHomeDeliveryOptionOfFeeOfHomeDeliveryContentTypography = {};

    DionysusErosAreaOfFeeOfHomeDeliveryOptionOfFeeOfHomeDeliveryTitleTypography = {};

    DionysusErosAreaOfFeeOfHomeDeliveryDivWrap = {};

    DionysusErosAreaOfFeeOfHomeDeliveryDiv = {};

    DionysusErosAreaOfWhetherHomeDeliveryEnableOfWhetherHomeDeliverySwitch = {};

    DionysusErosAreaOfWhetherHomeDeliveryOptionOfWhetherHomeDeliveryContentTypography = {};

    DionysusErosAreaOfWhetherHomeDeliveryOptionOfWhetherHomeDeliveryTitleTypography = {};

    DionysusErosAreaOfWhetherHomeDeliveryDivWrap = {};

    DionysusErosAreaOfWhetherHomeDeliveryDiv = {};

    DionysusErosAreaOfThresholdOfFreeShipByCodArrowOfThresholdOfFreeShipByCodIconNavigateNext = {};

    DionysusErosAreaOfThresholdOfFreeShipByCodArrowOfThresholdOfFreeShipByCodReactFragmentWrap = {};

    DionysusErosAreaOfThresholdOfFreeShipByCodArrowOfThresholdOfFreeShipByCodIconButton = {};

    DionysusErosAreaOfThresholdOfFreeShipByCodOptionOfThresholdOfFreeShipByCodContentTypography = {};

    DionysusErosAreaOfThresholdOfFreeShipByCodOptionOfThresholdOfFreeShipByCodTitleTypography = {};

    DionysusErosAreaOfThresholdOfFreeShipByCodDivWrap = {};

    DionysusErosAreaOfThresholdOfFreeShipByCodDiv = {};

    DionysusErosAreaOfPercentageFeeOfCodArrowOfPercentageFeeOfCodIconNavigateNext = {};

    DionysusErosAreaOfPercentageFeeOfCodArrowOfPercentageFeeOfCodReactFragmentWrap = {};

    DionysusErosAreaOfPercentageFeeOfCodArrowOfPercentageFeeOfCodIconButton = {};

    DionysusErosAreaOfPercentageFeeOfCodOptionOfPercentageFeeOfCodContentTypography = {};

    DionysusErosAreaOfPercentageFeeOfCodOptionOfPercentageFeeOfCodTitleTypography = {};

    DionysusErosAreaOfPercentageFeeOfCodDivWrap = {};

    DionysusErosAreaOfPercentageFeeOfCodDiv = {};

    DionysusErosAreaOfFeeOfShipByCodArrowOfFeeOfShipByCodIconNavigateNext = {};

    DionysusErosAreaOfFeeOfShipByCodArrowOfFeeOfShipByCodReactFragmentWrap = {};

    DionysusErosAreaOfFeeOfShipByCodArrowOfFeeOfShipByCodIconButton = {};

    DionysusErosAreaOfFeeOfShipByCodOptionOfFeeOfShipByCodContentTypography = {};

    DionysusErosAreaOfFeeOfShipByCodOptionOfFeeOfShipByCodTitleTypography = {};

    DionysusErosAreaOfFeeOfShipByCodDivWrap = {};

    DionysusErosAreaOfFeeOfShipByCodDiv = {};

    DionysusErosAreaOfEnableOfCodEnableOfEnableOfCodSwitch = {};

    DionysusErosAreaOfEnableOfCodOptionOfEnableOfCodContentTypography = {};

    DionysusErosAreaOfEnableOfCodOptionOfEnableOfCodTitleTypography = {};

    DionysusErosAreaOfEnableOfCodDivWrap = {};

    DionysusErosAreaOfEnableOfCodDiv = {};

    DionysusErosAreaOfAddressTimeOfSelfPickUpArrowOfAddressTimeOfSelfPickUpIconNavigateNext = {};

    DionysusErosAreaOfAddressTimeOfSelfPickUpArrowOfAddressTimeOfSelfPickUpReactFragmentWrap = {};

    DionysusErosAreaOfAddressTimeOfSelfPickUpArrowOfAddressTimeOfSelfPickUpIconButton = {};

    DionysusErosAreaOfAddressTimeOfSelfPickUpOptionOfAddressTimeOfSelfPickUpContentTypography = {};

    DionysusErosAreaOfAddressTimeOfSelfPickUpOptionOfAddressTimeOfSelfPickUpTitleTypography = {};

    DionysusErosAreaOfAddressTimeOfSelfPickUpDivWrap = {};

    DionysusErosAreaOfAddressTimeOfSelfPickUpDiv = {};

    DionysusErosAreaOfWhetherPickupByBuyerSelfEnableOfWhetherPickupByBuyerSelfSwitch = {};

    DionysusErosAreaOfWhetherPickupByBuyerSelfOptionOfWhetherPickupByBuyerSelfContentTypography = {};

    DionysusErosAreaOfWhetherPickupByBuyerSelfOptionOfWhetherPickupByBuyerSelfTitleTypography = {};

    DionysusErosAreaOfWhetherPickupByBuyerSelfDivWrap = {};

    DionysusErosAreaOfWhetherPickupByBuyerSelfDiv = {};

    DionysusErosAreaOfThresholdOfAllowSelfPickupArrowOfThresholdOfAllowSelfPickupIconNavigateNext = {};

    DionysusErosAreaOfThresholdOfAllowSelfPickupArrowOfThresholdOfAllowSelfPickupReactFragmentWrap = {};

    DionysusErosAreaOfThresholdOfAllowSelfPickupArrowOfThresholdOfAllowSelfPickupIconButton = {};

    DionysusErosAreaOfThresholdOfAllowSelfPickupOptionOfThresholdOfAllowSelfPickupContentTypography = {};

    DionysusErosAreaOfThresholdOfAllowSelfPickupOptionOfThresholdOfAllowSelfPickupTitleTypography = {};

    DionysusErosAreaOfThresholdOfAllowSelfPickupDivWrap = {};

    DionysusErosAreaOfThresholdOfAllowSelfPickupDiv = {};

    DionysusErosAreaOfThresholdOfCheckoutByCreditArrowOfThresholdOfCheckoutByCreditIconNavigateNext = {};

    DionysusErosAreaOfThresholdOfCheckoutByCreditArrowOfThresholdOfCheckoutByCreditReactFragmentWrap = {};

    DionysusErosAreaOfThresholdOfCheckoutByCreditArrowOfThresholdOfCheckoutByCreditIconButton = {};

    DionysusErosAreaOfThresholdOfCheckoutByCreditOptionOfThresholdOfCheckoutByCreditContentTypography = {};

    DionysusErosAreaOfThresholdOfCheckoutByCreditOptionOfThresholdOfCheckoutByCreditTitleTypography = {};

    DionysusErosAreaOfThresholdOfCheckoutByCreditDivWrap = {};

    DionysusErosAreaOfThresholdOfCheckoutByCreditDiv = {};

    DionysusErosAreaOfThresholdOfCheckoutByLinePayArrowOfThresholdOfCheckoutByLinePayIconNavigateNext = {};

    DionysusErosAreaOfThresholdOfCheckoutByLinePayArrowOfThresholdOfCheckoutByLinePayReactFragmentWrap = {};

    DionysusErosAreaOfThresholdOfCheckoutByLinePayArrowOfThresholdOfCheckoutByLinePayIconButton = {};

    DionysusErosAreaOfThresholdOfCheckoutByLinePayOptionOfThresholdOfCheckoutByLinePayContentTypography = {};

    DionysusErosAreaOfThresholdOfCheckoutByLinePayOptionOfThresholdOfCheckoutByLinePayTitleTypography = {};

    DionysusErosAreaOfThresholdOfCheckoutByLinePayDivWrap = {};

    DionysusErosAreaOfThresholdOfCheckoutByLinePayDiv = {};

    DionysusErosAreaOfEcPaySetArrowOfEcPaySetIconNavigateNext = {};

    DionysusErosAreaOfEcPaySetArrowOfEcPaySetReactFragmentWrap = {};

    DionysusErosAreaOfEcPaySetArrowOfEcPaySetIconButton = {};

    DionysusErosAreaOfEcPaySetOptionOfEcPaySetContentTypography = {};

    DionysusErosAreaOfEcPaySetOptionOfEcPaySetTitleTypography = {};

    DionysusErosAreaOfEcPaySetDivWrap = {};

    DionysusErosAreaOfEcPaySetDiv = {};

    DionysusErosAreaOfEcPayEnableOfEcPaySwitch = {};

    DionysusErosAreaOfEcPayOptionOfEcPayContentTypography = {};

    DionysusErosAreaOfEcPayOptionOfEcPayTitleTypography = {};

    DionysusErosAreaOfEcPayDivWrap = {};

    DionysusErosAreaOfEcPayDiv = {};

    DionysusErosAreaOfPreviewDirectPayArrowOfPreviewDirectPayIconNavigateNext = {};

    DionysusErosAreaOfPreviewDirectPayArrowOfPreviewDirectPayReactFragmentWrap = {};

    DionysusErosAreaOfPreviewDirectPayArrowOfPreviewDirectPayIconButton = {};

    DionysusErosAreaOfPreviewDirectPayOptionOfPreviewDirectPayContentTypography = {};

    DionysusErosAreaOfPreviewDirectPayOptionOfPreviewDirectPayTitleTypography = {};

    DionysusErosAreaOfPreviewDirectPayDivWrap = {};

    DionysusErosAreaOfPreviewDirectPayDiv = {};

    DionysusErosAreaOfCautionOfDirectPayArrowOfCautionOfDirectPayIconNavigateNext = {};

    DionysusErosAreaOfCautionOfDirectPayArrowOfCautionOfDirectPayReactFragmentWrap = {};

    DionysusErosAreaOfCautionOfDirectPayArrowOfCautionOfDirectPayIconButton = {};

    DionysusErosAreaOfCautionOfDirectPayOptionOfCautionOfDirectPayContentTypography = {};

    DionysusErosAreaOfCautionOfDirectPayOptionOfCautionOfDirectPayTitleTypography = {};

    DionysusErosAreaOfCautionOfDirectPayDivWrap = {};

    DionysusErosAreaOfCautionOfDirectPayDiv = {};

    DionysusErosAreaOfHrefOfDirectPayArrowOfHrefOfDirectPayIconNavigateNext = {};

    DionysusErosAreaOfHrefOfDirectPayArrowOfHrefOfDirectPayReactFragmentWrap = {};

    DionysusErosAreaOfHrefOfDirectPayArrowOfHrefOfDirectPayIconButton = {};

    DionysusErosAreaOfHrefOfDirectPayOptionOfHrefOfDirectPayContentTypography = {};

    DionysusErosAreaOfHrefOfDirectPayOptionOfHrefOfDirectPayTitleTypography = {};

    DionysusErosAreaOfHrefOfDirectPayDivWrap = {};

    DionysusErosAreaOfHrefOfDirectPayDiv = {};

    DionysusErosAreaOfNameOfDirectPayArrowOfNameOfDirectPayIconNavigateNext = {};

    DionysusErosAreaOfNameOfDirectPayArrowOfNameOfDirectPayReactFragmentWrap = {};

    DionysusErosAreaOfNameOfDirectPayArrowOfNameOfDirectPayIconButton = {};

    DionysusErosAreaOfNameOfDirectPayOptionOfNameOfDirectPayContentTypography = {};

    DionysusErosAreaOfNameOfDirectPayOptionOfNameOfDirectPayTitleTypography = {};

    DionysusErosAreaOfNameOfDirectPayDivWrap = {};

    DionysusErosAreaOfNameOfDirectPayDiv = {};

    DionysusErosAreaOfDirectPayEnableOfDirectPaySwitch = {};

    DionysusErosAreaOfDirectPayOptionOfDirectPayContentTypography = {};

    DionysusErosAreaOfDirectPayOptionOfDirectPayTitleTypography = {};

    DionysusErosAreaOfDirectPayDivWrap = {};

    DionysusErosAreaOfDirectPayDiv = {};

    DionysusErosDividerDiv = {};

    DionysusErosAreaOfLinepaySetArrowOfLinepaySetIconNavigateNext = {};

    DionysusErosAreaOfLinepaySetArrowOfLinepaySetReactFragmentWrap = {};

    DionysusErosAreaOfLinepaySetArrowOfLinepaySetIconButton = {};

    DionysusErosAreaOfLinepaySetOptionOfLinepaySetContentTypography = {};

    DionysusErosAreaOfLinepaySetOptionOfLinepaySetTitleTypography = {};

    DionysusErosAreaOfLinepaySetDivWrap = {};

    DionysusErosAreaOfLinepaySetDiv = {};

    DionysusErosAreaOfLinepayEnableOfLinepaySwitch = {};

    DionysusErosAreaOfLinepayOptionOfLinepayContentTypography = {};

    DionysusErosAreaOfLinepayOptionOfLinepayTitleTypography = {};

    DionysusErosAreaOfLinepayDivWrap = {};

    DionysusErosAreaOfLinepayDiv = {};

    DionysusErosAdminAreaOfAmountOfMaximumBuyArrowOfAmountOfMaximumBuyIconNavigateNext = {};

    DionysusErosAdminAreaOfAmountOfMaximumBuyArrowOfAmountOfMaximumBuyReactFragmentWrap = {};

    DionysusErosAdminAreaOfAmountOfMaximumBuyArrowOfAmountOfMaximumBuyIconButton = {};

    DionysusErosAdminAreaOfAmountOfMaximumBuyOptionOfAmountOfMaximumBuyContentTypography = {};

    DionysusErosAdminAreaOfAmountOfMaximumBuyOptionOfAmountOfMaximumBuyTitleTypography = {};

    DionysusErosAdminAreaOfAmountOfMaximumBuyDivWrap = {};

    DionysusErosAdminAreaOfAmountOfMaximumBuyDiv = {};

    DionysusErosAdminAreaOfAmountOfAllowAnonymousBuyArrowOfAmountOfAllowAnonymousBuyIconNavigateNext = {};

    DionysusErosAdminAreaOfAmountOfAllowAnonymousBuyArrowOfAmountOfAllowAnonymousBuyReactFragmentWrap = {};

    DionysusErosAdminAreaOfAmountOfAllowAnonymousBuyArrowOfAmountOfAllowAnonymousBuyIconButton = {};

    DionysusErosAdminAreaOfAmountOfAllowAnonymousBuyOptionOfAmountOfAllowAnonymousBuyContentTypography = {};

    DionysusErosAdminAreaOfAmountOfAllowAnonymousBuyOptionOfAmountOfAllowAnonymousBuyTitleTypography = {};

    DionysusErosAdminAreaOfAmountOfAllowAnonymousBuyDivWrap = {};

    DionysusErosAdminAreaOfAmountOfAllowAnonymousBuyDiv = {};

    DionysusErosAdminAreaOfBoughtWithoutLoginInEnableOfBoughtWithoutLoginInSwitch = {};

    DionysusErosAdminAreaOfBoughtWithoutLoginInOptionOfBoughtWithoutLoginInContentTypography = {};

    DionysusErosAdminAreaOfBoughtWithoutLoginInOptionOfBoughtWithoutLoginInTitleTypography = {};

    DionysusErosAdminAreaOfBoughtWithoutLoginInDivWrap = {};

    DionysusErosAdminAreaOfBoughtWithoutLoginInDiv = {};

    DionysusErosAdminAreaOfTtlOfAnonymousArrowOfTtlOfAnonymousIconNavigateNext = {};

    DionysusErosAdminAreaOfTtlOfAnonymousArrowOfTtlOfAnonymousReactFragmentWrap = {};

    DionysusErosAdminAreaOfTtlOfAnonymousArrowOfTtlOfAnonymousIconButton = {};

    DionysusErosAdminAreaOfTtlOfAnonymousOptionOfTtlOfAnonymousContentTypography = {};

    DionysusErosAdminAreaOfTtlOfAnonymousOptionOfTtlOfAnonymousTitleTypography = {};

    DionysusErosAdminAreaOfTtlOfAnonymousDivWrap = {};

    DionysusErosAdminAreaOfTtlOfAnonymousDiv = {};

    DionysusErosAdminAreaOfTtlOfPaymentArrowOfTtlOfPaymentIconNavigateNext = {};

    DionysusErosAdminAreaOfTtlOfPaymentArrowOfTtlOfPaymentReactFragmentWrap = {};

    DionysusErosAdminAreaOfTtlOfPaymentArrowOfTtlOfPaymentIconButton = {};

    DionysusErosAdminAreaOfTtlOfPaymentOptionOfTtlOfPaymentContentTypography = {};

    DionysusErosAdminAreaOfTtlOfPaymentOptionOfTtlOfPaymentTitleTypography = {};

    DionysusErosAdminAreaOfTtlOfPaymentDivWrap = {};

    DionysusErosAdminAreaOfTtlOfPaymentDiv = {};

    DionysusErosAdminAreaOfMaximumOfUniqueItemsArrowOfMaximumOfUniqueItemsIconNavigateNext = {};

    DionysusErosAdminAreaOfMaximumOfUniqueItemsArrowOfMaximumOfUniqueItemsReactFragmentWrap = {};

    DionysusErosAdminAreaOfMaximumOfUniqueItemsArrowOfMaximumOfUniqueItemsIconButton = {};

    DionysusErosAdminAreaOfMaximumOfUniqueItemsOptionOfMaximumOfUniqueItemsContentTypography = {};

    DionysusErosAdminAreaOfMaximumOfUniqueItemsOptionOfMaximumOfUniqueItemsTitleTypography = {};

    DionysusErosAdminAreaOfMaximumOfUniqueItemsDivWrap = {};

    DionysusErosAdminAreaOfMaximumOfUniqueItemsDiv = {};

    DionysusErosAdminAreaOfLineOArrowOfLineOIconNavigateNext = {};

    DionysusErosAdminAreaOfLineOArrowOfLineOReactFragmentWrap = {};

    DionysusErosAdminAreaOfLineOArrowOfLineOIconButton = {};

    DionysusErosAdminAreaOfLineOOptionOfLineOContentTypography = {};

    DionysusErosAdminAreaOfLineOOptionOfLineOTitleTypography = {};

    DionysusErosAdminAreaOfLineODivWrap = {};

    DionysusErosAdminAreaOfLineODiv = {};

    DionysusErosAdminAreaOfYtOArrowOfYtOIconNavigateNext = {};

    DionysusErosAdminAreaOfYtOArrowOfYtOReactFragmentWrap = {};

    DionysusErosAdminAreaOfYtOArrowOfYtOIconButton = {};

    DionysusErosAdminAreaOfYtOOptionOfYtOContentTypography = {};

    DionysusErosAdminAreaOfYtOOptionOfYtOTitleTypography = {};

    DionysusErosAdminAreaOfYtODivWrap = {};

    DionysusErosAdminAreaOfYtODiv = {};

    DionysusErosAdminAreaOfTiktokOArrowOfTiktokOIconNavigateNext = {};

    DionysusErosAdminAreaOfTiktokOArrowOfTiktokOReactFragmentWrap = {};

    DionysusErosAdminAreaOfTiktokOArrowOfTiktokOIconButton = {};

    DionysusErosAdminAreaOfTiktokOOptionOfTiktokOContentTypography = {};

    DionysusErosAdminAreaOfTiktokOOptionOfTiktokOTitleTypography = {};

    DionysusErosAdminAreaOfTiktokODivWrap = {};

    DionysusErosAdminAreaOfTiktokODiv = {};

    DionysusErosAdminAreaOfIgOArrowOfIgOIconNavigateNext = {};

    DionysusErosAdminAreaOfIgOArrowOfIgOReactFragmentWrap = {};

    DionysusErosAdminAreaOfIgOArrowOfIgOIconButton = {};

    DionysusErosAdminAreaOfIgOOptionOfIgOContentTypography = {};

    DionysusErosAdminAreaOfIgOOptionOfIgOTitleTypography = {};

    DionysusErosAdminAreaOfIgODivWrap = {};

    DionysusErosAdminAreaOfIgODiv = {};

    DionysusErosAdminAreaOfFbOArrowOfFbOIconNavigateNext = {};

    DionysusErosAdminAreaOfFbOArrowOfFbOReactFragmentWrap = {};

    DionysusErosAdminAreaOfFbOArrowOfFbOIconButton = {};

    DionysusErosAdminAreaOfFbOOptionOfFbOContentTypography = {};

    DionysusErosAdminAreaOfFbOOptionOfFbOTitleTypography = {};

    DionysusErosAdminAreaOfFbODivWrap = {};

    DionysusErosAdminAreaOfFbODiv = {};

    DionysusErosAdminAreaOfNumOfWorkerArrowOfNumOfWorkerIconNavigateNext = {};

    DionysusErosAdminAreaOfNumOfWorkerArrowOfNumOfWorkerReactFragmentWrap = {};

    DionysusErosAdminAreaOfNumOfWorkerArrowOfNumOfWorkerIconButton = {};

    DionysusErosAdminAreaOfNumOfWorkerOptionOfNumOfWorkerContentTypography = {};

    DionysusErosAdminAreaOfNumOfWorkerOptionOfNumOfWorkerTitleTypography = {};

    DionysusErosAdminAreaOfNumOfWorkerDivWrap = {};

    DionysusErosAdminAreaOfNumOfWorkerDiv = {};

    DionysusErosAdminAreaOfPercentageOfDiscountArrowOfPercentageOfDiscountIconNavigateNext = {};

    DionysusErosAdminAreaOfPercentageOfDiscountArrowOfPercentageOfDiscountReactFragmentWrap = {};

    DionysusErosAdminAreaOfPercentageOfDiscountArrowOfPercentageOfDiscountIconButton = {};

    DionysusErosAdminAreaOfPercentageOfDiscountOptionOfPercentageOfDiscountContentTypography = {};

    DionysusErosAdminAreaOfPercentageOfDiscountOptionOfPercentageOfDiscountTitleTypography = {};

    DionysusErosAdminAreaOfPercentageOfDiscountDivWrap = {};

    DionysusErosAdminAreaOfPercentageOfDiscountDiv = {};

    DionysusErosAdminAreaOfEmailOArrowOfEmailOIconNavigateNext = {};

    DionysusErosAdminAreaOfEmailOArrowOfEmailOReactFragmentWrap = {};

    DionysusErosAdminAreaOfEmailOArrowOfEmailOIconButton = {};

    DionysusErosAdminAreaOfEmailOOptionOfEmailOContentTypography = {};

    DionysusErosAdminAreaOfEmailOOptionOfEmailOTitleTypography = {};

    DionysusErosAdminAreaOfEmailODivWrap = {};

    DionysusErosAdminAreaOfEmailODiv = {};

    DionysusErosAdminAreaOfPhoneOArrowOfPhoneOIconNavigateNext = {};

    DionysusErosAdminAreaOfPhoneOArrowOfPhoneOReactFragmentWrap = {};

    DionysusErosAdminAreaOfPhoneOArrowOfPhoneOIconButton = {};

    DionysusErosAdminAreaOfPhoneOOptionOfPhoneOContentTypography = {};

    DionysusErosAdminAreaOfPhoneOOptionOfPhoneOTitleTypography = {};

    DionysusErosAdminAreaOfPhoneODivWrap = {};

    DionysusErosAdminAreaOfPhoneODiv = {};

    DionysusErosAdminAreaOfAddressOArrowOfAddressOIconNavigateNext = {};

    DionysusErosAdminAreaOfAddressOArrowOfAddressOReactFragmentWrap = {};

    DionysusErosAdminAreaOfAddressOArrowOfAddressOIconButton = {};

    DionysusErosAdminAreaOfAddressOOptionOfAddressOContentTypography = {};

    DionysusErosAdminAreaOfAddressOOptionOfAddressOTitleTypography = {};

    DionysusErosAdminAreaOfAddressODivWrap = {};

    DionysusErosAdminAreaOfAddressODiv = {};

    DionysusErosAdminAreaOfUnifiedBArrowOfUnifiedBIconNavigateNext = {};

    DionysusErosAdminAreaOfUnifiedBArrowOfUnifiedBReactFragmentWrap = {};

    DionysusErosAdminAreaOfUnifiedBArrowOfUnifiedBIconButton = {};

    DionysusErosAdminAreaOfUnifiedBOptionOfUnifiedBContentTypography = {};

    DionysusErosAdminAreaOfUnifiedBOptionOfUnifiedBTitleTypography = {};

    DionysusErosAdminAreaOfUnifiedBDivWrap = {};

    DionysusErosAdminAreaOfUnifiedBDiv = {};

    DionysusErosAdminAreaOfCompanyOArrowOfCompanyOIconNavigateNext = {};

    DionysusErosAdminAreaOfCompanyOArrowOfCompanyOReactFragmentWrap = {};

    DionysusErosAdminAreaOfCompanyOArrowOfCompanyOIconButton = {};

    DionysusErosAdminAreaOfCompanyOOptionOfCompanyOContentTypography = {};

    DionysusErosAdminAreaOfCompanyOOptionOfCompanyOTitleTypography = {};

    DionysusErosAdminAreaOfCompanyODivWrap = {};

    DionysusErosAdminAreaOfCompanyODiv = {};

    DionysusErosAdminAreaOfWhetherDisplaySpecificEnableOfWhetherDisplaySpecificSwitch = {};

    DionysusErosAdminAreaOfWhetherDisplaySpecificOptionOfWhetherDisplaySpecificContentTypography = {};

    DionysusErosAdminAreaOfWhetherDisplaySpecificOptionOfWhetherDisplaySpecificTitleTypography = {};

    DionysusErosAdminAreaOfWhetherDisplaySpecificDivWrap = {};

    DionysusErosAdminAreaOfWhetherDisplaySpecificDiv = {};

    DionysusErosAdminDividerTopDiv = {};

    DionysusErosAdminAreaOfTabCreatorArrowOfTabCreatorIconNavigateNext = {};

    DionysusErosAdminAreaOfTabCreatorArrowOfTabCreatorReactFragmentWrap = {};

    DionysusErosAdminAreaOfTabCreatorArrowOfTabCreatorIconButton = {};

    DionysusErosAdminAreaOfTabCreatorOptionOfTabCreatorContentTypography = {};

    DionysusErosAdminAreaOfTabCreatorOptionOfTabCreatorTitleTypography = {};

    DionysusErosAdminAreaOfTabCreatorDivWrap = {};

    DionysusErosAdminAreaOfTabCreatorDiv = {};

    DionysusErosAdminAreaOfBrandNameArrowOfBrandNameIconNavigateNext = {};

    DionysusErosAdminAreaOfBrandNameArrowOfBrandNameReactFragmentWrap = {};

    DionysusErosAdminAreaOfBrandNameArrowOfBrandNameIconButton = {};

    DionysusErosAdminAreaOfBrandNameOptionOfBrandNameContentTypography = {};

    DionysusErosAdminAreaOfBrandNameOptionOfBrandNameTitleTypography = {};

    DionysusErosAdminAreaOfBrandNameDivWrap = {};

    DionysusErosAdminAreaOfBrandNameDiv = {};

    DionysusErosAdminDiv = {};

    DionysusErosDivWrap = {};

    DionysusErosDiv = {};

    /** => following for gaia  component  */

    DionysusGaiaFuncUpdateChip = {};

    DionysusGaiaFuncCreateReactFragmentWrap = {};

    DionysusGaiaFuncCreateChip = {};

    DionysusGaiaFuncDeletedReactFragmentWrap = {};

    DionysusGaiaFuncDeletedChip = {};

    DionysusGaiaFuncBackToHomeReactFragmentWrap = {};

    DionysusGaiaFuncBackToHomeChip = {};

    DionysusGaiaFuncDiv = {};

    DionysusGaiaAreaOfDescriptionStatementTextField = {};

    DionysusGaiaAreaOfDescriptionRowStmtOfDescriptionMaximumTypography = {};

    DionysusGaiaAreaOfDescriptionRowLabelOfDescriptionTypography = {};

    DionysusGaiaAreaOfDescriptionRowDiv = {};

    DionysusGaiaAreaOfDescriptionDiv = {};

    DionysusGaiaAreaOfStatusVisibilitySwitch = {};

    DionysusGaiaAreaOfStatusLabelOfStatusTypography = {};

    DionysusGaiaAreaOfStatusDiv = {};

    DionysusGaiaDestIsHomeTeachingSwitch = {};

    DionysusGaiaDestLabelOfHomeTeachingTypography = {};

    DionysusGaiaDestDiv = {};

    DionysusGaiaTakenAllowSelfPickUpSwitch = {};

    DionysusGaiaTakenLabelOfPickUpTypography = {};

    DionysusGaiaTakenDiv = {};

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

    DionysusGaiaAreaOfPhotoUploadAddImageIconAddPhotoAlternateOutlined = {};

    DionysusGaiaAreaOfPhotoUploadAddImageIconButton = {};

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

    DionysusPlutusMainSummariseEighthProcedureOfPaymentDivWrap = {};

    DionysusPlutusMainSummariseEighthProcedureOfPaymentTypography = {};

    DionysusPlutusMainSummariseEighthHeadLabelOfProcedurePaymentDivWrap = {};

    DionysusPlutusMainSummariseEighthHeadLabelOfProcedurePaymentTypography = {};

    DionysusPlutusMainSummariseEighthDiv = {};

    DionysusPlutusMainSummariseSeventhDistanceOfSashaDivWrap = {};

    DionysusPlutusMainSummariseSeventhDistanceOfSashaTypography = {};

    DionysusPlutusMainSummariseSeventhHeadLabelOfDistanceDivWrap = {};

    DionysusPlutusMainSummariseSeventhHeadLabelOfDistanceTypography = {};

    DionysusPlutusMainSummariseSeventhDiv = {};

    DionysusPlutusMainSummariseSixthProcedureOfTransportDivWrap = {};

    DionysusPlutusMainSummariseSixthProcedureOfTransportTypography = {};

    DionysusPlutusMainSummariseSixthHeadLabelOfProcedureOfTransportDivWrap = {};

    DionysusPlutusMainSummariseSixthHeadLabelOfProcedureOfTransportTypography = {};

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

    DionysusPlutusMainPhoneLabelOfPhoneTypography = {};

    DionysusPlutusMainPhoneDivWrap = {};

    DionysusPlutusMainPhoneTextField = {};

    DionysusPlutusMainEmailLabelOfEmailTypography = {};

    DionysusPlutusMainEmailDivWrap = {};

    DionysusPlutusMainEmailTextField = {};

    DionysusPlutusMainNameLabelOfNameTypography = {};

    DionysusPlutusMainNameDivWrap = {};

    DionysusPlutusMainNameTextField = {};

    DionysusPlutusMainCvsLabelOfCvsTypography = {};

    DionysusPlutusMainCvsDivWrap = {};

    DionysusPlutusMainCvsTextField = {};

    DionysusPlutusMainLocationColMainTailFindIconWifiFind = {};

    DionysusPlutusMainLocationColMainTailFindIconButton = {};

    DionysusPlutusMainLocationColMainTailAddressTextField = {};

    DionysusPlutusMainLocationColMainTailDiv = {};

    DionysusPlutusMainLocationColMainHeadDistrictTextFieldList = {};

    DionysusPlutusMainLocationColMainHeadDistrictMenuItem = {};

    DionysusPlutusMainLocationColMainHeadCityTextFieldList = {};

    DionysusPlutusMainLocationColMainHeadCityMenuItem = {};

    DionysusPlutusMainLocationColMainHeadDiv = {};

    DionysusPlutusMainLocationColMainDiv = {};

    DionysusPlutusMainLocationColTakenWhetherPickupByMySelfLabelOfWhetherPickupByMySelfTypography = {};

    DionysusPlutusMainLocationColTakenWhetherPickupByMySelfDivWrap = {};

    DionysusPlutusMainLocationColTakenWhetherPickupByMySelfCheckbox = {};

    DionysusPlutusMainLocationColTakenDiv = {};

    DionysusPlutusMainLocationColDiv = {};

    DionysusPlutusMainLocationHeadLabelOfAddressTypography = {};

    DionysusPlutusMainLocationDiv = {};

    DionysusPlutusMainDiv = {};

    DionysusPlutusBriefSectionOfDescriptionPriceTypography = {};

    DionysusPlutusBriefSectionOfDescriptionQuantityTypography = {};

    DionysusPlutusBriefSectionOfDescriptionSpecificOfProductTypography = {};

    DionysusPlutusBriefSectionOfDescriptionNameOfProductDivWrap = {};

    DionysusPlutusBriefSectionOfDescriptionNameOfProductTypography = {};

    DionysusPlutusBriefSectionOfDescriptionDiv = {};

    DionysusPlutusBriefImageOfProductPhotoImg = {};

    DionysusPlutusBriefDivList = {};

    DionysusPlutusBriefDiv = {};

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

    DionysusHermesDividerDiv = {};

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

    DionysusHermesSeparatorDiv = {};

    DionysusHermesTransactionPriceLabelOfPriceTypography = {};

    DionysusHermesTransactionPriceDivWrap = {};

    DionysusHermesTransactionPriceTypography = {};

    DionysusHermesTransactionMainDescriptionTypography = {};

    DionysusHermesTransactionMainTopPhotoImg = {};

    DionysusHermesTransactionMainTopNameTypography = {};

    DionysusHermesTransactionMainTopDiv = {};

    DionysusHermesTransactionMainDiv = {};

    DionysusHermesTransactionChoiceDivWrap = {};

    DionysusHermesTransactionChoiceCheckbox = {};

    DionysusHermesTransactionDivList = {};

    DionysusHermesTransactionDiv = {};

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

    DionysusSelectBoundTabSkeleton = {};

    DionysusSelectBoundTabsList = {};

    DionysusSelectBoundTab = {};

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

    /** => following for demeter  component  */

    DemeterDiv = {};

    /** => following for account  component  */

    AccountAreaUserSummaryTitleOfUserTypography = {};

    AccountAreaUserSummaryAccordionSummary = {};

    AccountAreaUserAreaOfLogoutArrowOfLogoutIconNavigateNext = {};

    AccountAreaUserAreaOfLogoutArrowOfLogoutReactFragmentWrap = {};

    AccountAreaUserAreaOfLogoutArrowOfLogoutIconButton = {};

    AccountAreaUserAreaOfLogoutOptionOfLogoutContentTypography = {};

    AccountAreaUserAreaOfLogoutOptionOfLogoutTitleTypography = {};

    AccountAreaUserAreaOfLogoutDivWrap = {};

    AccountAreaUserAreaOfLogoutDiv = {};

    AccountAreaUserAreaOfCleanCacheArrowOfCleanCacheIconNavigateNext = {};

    AccountAreaUserAreaOfCleanCacheArrowOfCleanCacheIconButton = {};

    AccountAreaUserAreaOfCleanCacheOptionOfCleanCacheContentTypography = {};

    AccountAreaUserAreaOfCleanCacheOptionOfCleanCacheTitleTypography = {};

    AccountAreaUserAreaOfCleanCacheDivWrap = {};

    AccountAreaUserAreaOfCleanCacheDiv = {};

    AccountAreaUserAreaOfPrivacyArrowOfPrivacyIconNavigateNext = {};

    AccountAreaUserAreaOfPrivacyArrowOfPrivacyReactFragmentWrap = {};

    AccountAreaUserAreaOfPrivacyArrowOfPrivacyIconButton = {};

    AccountAreaUserAreaOfPrivacyOptionOfPrivacyContentTypography = {};

    AccountAreaUserAreaOfPrivacyOptionOfPrivacyTitleTypography = {};

    AccountAreaUserAreaOfPrivacyDivWrap = {};

    AccountAreaUserAreaOfPrivacyDiv = {};

    AccountAreaUserAreaOfUsagesArrowOfUsagesIconNavigateNext = {};

    AccountAreaUserAreaOfUsagesArrowOfUsagesReactFragmentWrap = {};

    AccountAreaUserAreaOfUsagesArrowOfUsagesIconButton = {};

    AccountAreaUserAreaOfUsagesOptionOfUsagesContentTypography = {};

    AccountAreaUserAreaOfUsagesOptionOfUsagesTitleTypography = {};

    AccountAreaUserAreaOfUsagesDivWrap = {};

    AccountAreaUserAreaOfUsagesDiv = {};

    AccountAreaUserAreaOfTokenArrowOfTokenIconNavigateNext = {};

    AccountAreaUserAreaOfTokenArrowOfTokenIconButton = {};

    AccountAreaUserAreaOfTokenOptionOfTokenContentTypography = {};

    AccountAreaUserAreaOfTokenOptionOfTokenTitleTypography = {};

    AccountAreaUserAreaOfTokenDivWrap = {};

    AccountAreaUserAreaOfTokenDiv = {};

    AccountAreaUserAccordionWrap = {};

    AccountAreaUserAccordionDetails = {};

    AccountAreaAdminSummaryTitleOfAdminTypography = {};

    AccountAreaAdminSummaryAccordionSummary = {};

    AccountAreaAdminAreaOfAppendReaderArrowOfAppendReaderIconNavigateNext = {};

    AccountAreaAdminAreaOfAppendReaderArrowOfAppendReaderReactFragmentWrap = {};

    AccountAreaAdminAreaOfAppendReaderArrowOfAppendReaderIconButton = {};

    AccountAreaAdminAreaOfAppendReaderOptionOfAppendReaderContentTypography = {};

    AccountAreaAdminAreaOfAppendReaderOptionOfAppendReaderTitleTypography = {};

    AccountAreaAdminAreaOfAppendReaderDivWrap = {};

    AccountAreaAdminAreaOfAppendReaderDiv = {};

    AccountAreaAdminAreaOfAppendAuthorArrowOfAppendAuthorIconNavigateNext = {};

    AccountAreaAdminAreaOfAppendAuthorArrowOfAppendAuthorReactFragmentWrap = {};

    AccountAreaAdminAreaOfAppendAuthorArrowOfAppendAuthorIconButton = {};

    AccountAreaAdminAreaOfAppendAuthorOptionOfAppendAuthorContentTypography = {};

    AccountAreaAdminAreaOfAppendAuthorOptionOfAppendAuthorTitleTypography = {};

    AccountAreaAdminAreaOfAppendAuthorDivWrap = {};

    AccountAreaAdminAreaOfAppendAuthorDiv = {};

    AccountAreaAdminAreaOfAppendAdminArrowOfAppendAdminIconNavigateNext = {};

    AccountAreaAdminAreaOfAppendAdminArrowOfAppendAdminReactFragmentWrap = {};

    AccountAreaAdminAreaOfAppendAdminArrowOfAppendAdminIconButton = {};

    AccountAreaAdminAreaOfAppendAdminOptionOfAppendAdminContentTypography = {};

    AccountAreaAdminAreaOfAppendAdminOptionOfAppendAdminTitleTypography = {};

    AccountAreaAdminAreaOfAppendAdminDivWrap = {};

    AccountAreaAdminAreaOfAppendAdminDiv = {};

    AccountAreaAdminAreaOfGoEditModeArrowOfGoEditModeIconNavigateNext = {};

    AccountAreaAdminAreaOfGoEditModeArrowOfGoEditModeIconButton = {};

    AccountAreaAdminAreaOfGoEditModeOptionOfGoEditModeContentTypography = {};

    AccountAreaAdminAreaOfGoEditModeOptionOfGoEditModeTitleTypography = {};

    AccountAreaAdminAreaOfGoEditModeDivWrap = {};

    AccountAreaAdminAreaOfGoEditModeDiv = {};

    AccountAreaAdminAccordionWrap = {};

    AccountAreaAdminAccordionDetails = {};

    AccountAreaBuySummaryTitleOfBuyTypography = {};

    AccountAreaBuySummaryAccordionSummary = {};

    AccountAreaBuyAreaOfListOfUserOrderArrowOfListOfUserOrderIconNavigateNext = {};

    AccountAreaBuyAreaOfListOfUserOrderArrowOfListOfUserOrderIconButton = {};

    AccountAreaBuyAreaOfListOfUserOrderOptionOfListOfUserOrderContentTypography = {};

    AccountAreaBuyAreaOfListOfUserOrderOptionOfListOfUserOrderTitleTypography = {};

    AccountAreaBuyAreaOfListOfUserOrderDivWrap = {};

    AccountAreaBuyAreaOfListOfUserOrderDiv = {};

    AccountAreaBuyAccordionWrap = {};

    AccountAreaBuyAccordionDetails = {};

    AccountAreaSaleSummaryTitleOfSaleTypography = {};

    AccountAreaSaleSummaryAccordionSummary = {};

    AccountAreaSaleAreaOfMyReportArrowOfMyReportIconNavigateNext = {};

    AccountAreaSaleAreaOfMyReportArrowOfMyReportIconButton = {};

    AccountAreaSaleAreaOfMyReportOptionOfMyReportContentTypography = {};

    AccountAreaSaleAreaOfMyReportOptionOfMyReportTitleTypography = {};

    AccountAreaSaleAreaOfMyReportDivWrap = {};

    AccountAreaSaleAreaOfMyReportDiv = {};

    AccountAreaSaleAreaOfMyScheduleArrowOfMyScheduleIconNavigateNext = {};

    AccountAreaSaleAreaOfMyScheduleArrowOfMyScheduleIconButton = {};

    AccountAreaSaleAreaOfMyScheduleOptionOfMyScheduleContentTypography = {};

    AccountAreaSaleAreaOfMyScheduleOptionOfMyScheduleTitleTypography = {};

    AccountAreaSaleAreaOfMyScheduleDivWrap = {};

    AccountAreaSaleAreaOfMyScheduleDiv = {};

    AccountAreaSaleAreaOfMarketSettingArrowOfMarketSettingIconNavigateNext = {};

    AccountAreaSaleAreaOfMarketSettingArrowOfMarketSettingIconButton = {};

    AccountAreaSaleAreaOfMarketSettingOptionOfMarketSettingContentTypography = {};

    AccountAreaSaleAreaOfMarketSettingOptionOfMarketSettingTitleTypography = {};

    AccountAreaSaleAreaOfMarketSettingDivWrap = {};

    AccountAreaSaleAreaOfMarketSettingDiv = {};

    AccountAreaSaleAreaOfGoToMyBoozeArrowOfGoToMyBoozeIconNavigateNext = {};

    AccountAreaSaleAreaOfGoToMyBoozeArrowOfGoToMyBoozeIconButton = {};

    AccountAreaSaleAreaOfGoToMyBoozeOptionOfGoToMyBoozeContentTypography = {};

    AccountAreaSaleAreaOfGoToMyBoozeOptionOfGoToMyBoozeTitleTypography = {};

    AccountAreaSaleAreaOfGoToMyBoozeDivWrap = {};

    AccountAreaSaleAreaOfGoToMyBoozeDiv = {};

    AccountAreaSaleAreaOfAppendBoozeArrowOfAppendBoozeIconNavigateNext = {};

    AccountAreaSaleAreaOfAppendBoozeArrowOfAppendBoozeIconButton = {};

    AccountAreaSaleAreaOfAppendBoozeOptionOfAppendBoozeContentTypography = {};

    AccountAreaSaleAreaOfAppendBoozeOptionOfAppendBoozeTitleTypography = {};

    AccountAreaSaleAreaOfAppendBoozeDivWrap = {};

    AccountAreaSaleAreaOfAppendBoozeDiv = {};

    AccountAreaSaleAreaOfListOfAuthorOrderArrowOfListOfAuthorOrderIconNavigateNext = {};

    AccountAreaSaleAreaOfListOfAuthorOrderArrowOfListOfAuthorOrderIconButton = {};

    AccountAreaSaleAreaOfListOfAuthorOrderOptionOfListOfAuthorOrderContentTypography = {};

    AccountAreaSaleAreaOfListOfAuthorOrderOptionOfListOfAuthorOrderTitleTypography = {};

    AccountAreaSaleAreaOfListOfAuthorOrderDivWrap = {};

    AccountAreaSaleAreaOfListOfAuthorOrderDiv = {};

    AccountAreaSaleAccordionWrap = {};

    AccountAreaSaleAccordionDetails = {};

    AccountAreaDiv = {};

    AccountBasicLangTextFieldList = {};

    AccountBasicLangMenuItem = {};

    AccountBasicLabelOfPropTypography = {};

    AccountBasicDiv = {};

    AccountInfoValueOfEmailTypography = {};

    AccountInfoValueOfNameTypography = {};

    AccountInfoUrlOfHeadPhotoAvatar = {};

    AccountInfoDiv = {};

    AccountDivWrap = {};

    AccountPaper = {};

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

    MainPromotedBannerSwiperList = {};

    MainPromotedBannerSwiperSlide = {};

    MainDiv = {};

    /** -------------------- functions -------------------- **/

    constructor(props) {}

    /** -------------------- async api -------------------- **/
}

export default new AppStyle();
