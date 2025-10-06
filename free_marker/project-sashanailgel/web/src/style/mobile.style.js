import { utiller as Util, exceptioner as ERROR, pooller as InfinitePool } from "utiller";
import _ from "lodash";
import libpath from "path";

class MobileStyle {
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

    IreneNumberSetterFuncLeaveChip = {};

    IreneNumberSetterFuncConfirmChip = {};

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

    IreneTextFetchFuncLeaveChip = {};

    IreneTextFetchFuncAppendChip = {};

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

    /** => following for hades  component  */

    HadesDiv = {};

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

    DionysusQuantitySetterFuncCommonReactFragmentWrap = {};

    DionysusQuantitySetterFuncCommonChip = {};

    DionysusQuantitySetterFuncLeaveChip = {};

    DionysusQuantitySetterFuncBatchUpdateChip = {};

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

    DionysusApolloFuncLoadChip = {};

    DionysusApolloFuncLeaveChip = {};

    DionysusApolloFuncConfirmChip = {};

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

    DionysusErosAreaOfAmountOfMaximumBuyArrowOfAmountOfMaximumBuyIconNavigateNext = {};

    DionysusErosAreaOfAmountOfMaximumBuyArrowOfAmountOfMaximumBuyReactFragmentWrap = {};

    DionysusErosAreaOfAmountOfMaximumBuyArrowOfAmountOfMaximumBuyIconButton = {};

    DionysusErosAreaOfAmountOfMaximumBuyOptionOfAmountOfMaximumBuyContentTypography = {};

    DionysusErosAreaOfAmountOfMaximumBuyOptionOfAmountOfMaximumBuyTitleTypography = {};

    DionysusErosAreaOfAmountOfMaximumBuyDivWrap = {};

    DionysusErosAreaOfAmountOfMaximumBuyDiv = {};

    DionysusErosAreaOfAmountOfAllowAnonymousBuyArrowOfAmountOfAllowAnonymousBuyIconNavigateNext = {};

    DionysusErosAreaOfAmountOfAllowAnonymousBuyArrowOfAmountOfAllowAnonymousBuyReactFragmentWrap = {};

    DionysusErosAreaOfAmountOfAllowAnonymousBuyArrowOfAmountOfAllowAnonymousBuyIconButton = {};

    DionysusErosAreaOfAmountOfAllowAnonymousBuyOptionOfAmountOfAllowAnonymousBuyContentTypography = {};

    DionysusErosAreaOfAmountOfAllowAnonymousBuyOptionOfAmountOfAllowAnonymousBuyTitleTypography = {};

    DionysusErosAreaOfAmountOfAllowAnonymousBuyDivWrap = {};

    DionysusErosAreaOfAmountOfAllowAnonymousBuyDiv = {};

    DionysusErosAreaOfBoughtWithoutLoginInEnableOfBoughtWithoutLoginInSwitch = {};

    DionysusErosAreaOfBoughtWithoutLoginInOptionOfBoughtWithoutLoginInContentTypography = {};

    DionysusErosAreaOfBoughtWithoutLoginInOptionOfBoughtWithoutLoginInTitleTypography = {};

    DionysusErosAreaOfBoughtWithoutLoginInDivWrap = {};

    DionysusErosAreaOfBoughtWithoutLoginInDiv = {};

    DionysusErosAreaOfNumOfWorkerArrowOfNumOfWorkerIconNavigateNext = {};

    DionysusErosAreaOfNumOfWorkerArrowOfNumOfWorkerReactFragmentWrap = {};

    DionysusErosAreaOfNumOfWorkerArrowOfNumOfWorkerIconButton = {};

    DionysusErosAreaOfNumOfWorkerOptionOfNumOfWorkerContentTypography = {};

    DionysusErosAreaOfNumOfWorkerOptionOfNumOfWorkerTitleTypography = {};

    DionysusErosAreaOfNumOfWorkerDivWrap = {};

    DionysusErosAreaOfNumOfWorkerDiv = {};

    DionysusErosAreaOfPercentageOfDiscountArrowOfPercentageOfDiscountIconNavigateNext = {};

    DionysusErosAreaOfPercentageOfDiscountArrowOfPercentageOfDiscountReactFragmentWrap = {};

    DionysusErosAreaOfPercentageOfDiscountArrowOfPercentageOfDiscountIconButton = {};

    DionysusErosAreaOfPercentageOfDiscountOptionOfPercentageOfDiscountContentTypography = {};

    DionysusErosAreaOfPercentageOfDiscountOptionOfPercentageOfDiscountTitleTypography = {};

    DionysusErosAreaOfPercentageOfDiscountDivWrap = {};

    DionysusErosAreaOfPercentageOfDiscountDiv = {};

    DionysusErosAreaOfPriceOfFreeShippingArrowOfPriceOfFreeShippingIconNavigateNext = {};

    DionysusErosAreaOfPriceOfFreeShippingArrowOfPriceOfFreeShippingReactFragmentWrap = {};

    DionysusErosAreaOfPriceOfFreeShippingArrowOfPriceOfFreeShippingIconButton = {};

    DionysusErosAreaOfPriceOfFreeShippingOptionOfPriceOfFreeShippingContentTypography = {};

    DionysusErosAreaOfPriceOfFreeShippingOptionOfPriceOfFreeShippingTitleTypography = {};

    DionysusErosAreaOfPriceOfFreeShippingDivWrap = {};

    DionysusErosAreaOfPriceOfFreeShippingDiv = {};

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

    DionysusErosAreaOfPayOfDirectArrowOfPayOfDirectIconNavigateNext = {};

    DionysusErosAreaOfPayOfDirectArrowOfPayOfDirectReactFragmentWrap = {};

    DionysusErosAreaOfPayOfDirectArrowOfPayOfDirectIconButton = {};

    DionysusErosAreaOfPayOfDirectOptionOfPayOfDirectContentTypography = {};

    DionysusErosAreaOfPayOfDirectOptionOfPayOfDirectTitleTypography = {};

    DionysusErosAreaOfPayOfDirectDivWrap = {};

    DionysusErosAreaOfPayOfDirectDiv = {};

    DionysusErosAreaOfDirectEnableOfDirectSwitch = {};

    DionysusErosAreaOfDirectOptionOfDirectContentTypography = {};

    DionysusErosAreaOfDirectOptionOfDirectTitleTypography = {};

    DionysusErosAreaOfDirectDivWrap = {};

    DionysusErosAreaOfDirectDiv = {};

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

    DionysusErosAreaOfFeeOfInStorePickupArrowOfFeeOfInStorePickupIconNavigateNext = {};

    DionysusErosAreaOfFeeOfInStorePickupArrowOfFeeOfInStorePickupReactFragmentWrap = {};

    DionysusErosAreaOfFeeOfInStorePickupArrowOfFeeOfInStorePickupIconButton = {};

    DionysusErosAreaOfFeeOfInStorePickupOptionOfFeeOfInStorePickupContentTypography = {};

    DionysusErosAreaOfFeeOfInStorePickupOptionOfFeeOfInStorePickupTitleTypography = {};

    DionysusErosAreaOfFeeOfInStorePickupDivWrap = {};

    DionysusErosAreaOfFeeOfInStorePickupDiv = {};

    DionysusErosAreaOfFeeOfCashOnDeliveryArrowOfFeeOfCashOnDeliveryIconNavigateNext = {};

    DionysusErosAreaOfFeeOfCashOnDeliveryArrowOfFeeOfCashOnDeliveryReactFragmentWrap = {};

    DionysusErosAreaOfFeeOfCashOnDeliveryArrowOfFeeOfCashOnDeliveryIconButton = {};

    DionysusErosAreaOfFeeOfCashOnDeliveryOptionOfFeeOfCashOnDeliveryContentTypography = {};

    DionysusErosAreaOfFeeOfCashOnDeliveryOptionOfFeeOfCashOnDeliveryTitleTypography = {};

    DionysusErosAreaOfFeeOfCashOnDeliveryDivWrap = {};

    DionysusErosAreaOfFeeOfCashOnDeliveryDiv = {};

    DionysusErosAreaOfCashOnDeliveryEnableOfCashOnDeliverySwitch = {};

    DionysusErosAreaOfCashOnDeliveryOptionOfCashOnDeliveryContentTypography = {};

    DionysusErosAreaOfCashOnDeliveryOptionOfCashOnDeliveryTitleTypography = {};

    DionysusErosAreaOfCashOnDeliveryDivWrap = {};

    DionysusErosAreaOfCashOnDeliveryDiv = {};

    DionysusErosAreaOfTabCreatorArrowOfTabCreatorIconNavigateNext = {};

    DionysusErosAreaOfTabCreatorArrowOfTabCreatorReactFragmentWrap = {};

    DionysusErosAreaOfTabCreatorArrowOfTabCreatorIconButton = {};

    DionysusErosAreaOfTabCreatorOptionOfTabCreatorContentTypography = {};

    DionysusErosAreaOfTabCreatorOptionOfTabCreatorTitleTypography = {};

    DionysusErosAreaOfTabCreatorDivWrap = {};

    DionysusErosAreaOfTabCreatorDiv = {};

    DionysusErosAreaOfBrandNameArrowOfBrandNameIconNavigateNext = {};

    DionysusErosAreaOfBrandNameArrowOfBrandNameReactFragmentWrap = {};

    DionysusErosAreaOfBrandNameArrowOfBrandNameIconButton = {};

    DionysusErosAreaOfBrandNameOptionOfBrandNameContentTypography = {};

    DionysusErosAreaOfBrandNameOptionOfBrandNameTitleTypography = {};

    DionysusErosAreaOfBrandNameDivWrap = {};

    DionysusErosAreaOfBrandNameDiv = {};

    DionysusErosDivWrap = {};

    DionysusErosDiv = {};

    /** => following for gaia  component  */

    DionysusGaiaFuncBackToHomeReactFragmentWrap = {};

    DionysusGaiaFuncBackToHomeChip = {};

    DionysusGaiaFuncDeletedReactFragmentWrap = {};

    DionysusGaiaFuncDeletedChip = {};

    DionysusGaiaFuncRecoverChip = {};

    DionysusGaiaFuncCreateChip = {};

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

    DionysusPlutusMainPhoneLabelOfPhoneTypography = {};

    DionysusPlutusMainPhoneDivWrap = {};

    DionysusPlutusMainPhoneTextField = {};

    DionysusPlutusMainEmailLabelOfEmailTypography = {};

    DionysusPlutusMainEmailDivWrap = {};

    DionysusPlutusMainEmailTextField = {};

    DionysusPlutusMainNameLabelOfNameTypography = {};

    DionysusPlutusMainNameDivWrap = {};

    DionysusPlutusMainNameTextField = {};

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

    DionysusSelectTabSkeleton = {};

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

    /** => following for demeter  component  */

    DemeterDiv = {};

    /** => following for account  component  */

    AccountLogoutReactFragmentWrap = {};

    AccountLogoutChip = {};

    AccountAreaUserSummaryTitleOfUserTypography = {};

    AccountAreaUserSummaryAccordionSummary = {};

    AccountAreaUserAreaOfCleanCacheArrowOfCleanCacheIconNavigateNext = {};

    AccountAreaUserAreaOfCleanCacheArrowOfCleanCacheIconButton = {};

    AccountAreaUserAreaOfCleanCacheOptionOfCleanCacheContentTypography = {};

    AccountAreaUserAreaOfCleanCacheOptionOfCleanCacheTitleTypography = {};

    AccountAreaUserAreaOfCleanCacheDivWrap = {};

    AccountAreaUserAreaOfCleanCacheDiv = {};

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

export default new MobileStyle();
