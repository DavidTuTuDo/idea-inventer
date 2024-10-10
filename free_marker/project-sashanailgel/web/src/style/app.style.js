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
