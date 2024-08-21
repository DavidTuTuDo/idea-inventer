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

  /** => following for establish  component  */

  EstablishCustomFuncGoBackReactFragmentWrap = {};

  EstablishCustomFuncGoBackChip = {};

  EstablishCustomFuncAcceptReactFragmentWrap = {};

  EstablishCustomFuncAcceptChip = {};

  EstablishCustomFuncDiv = {};

  EstablishCustomAgreeOfContractLabelOfAgreeOfContractTypography = {};

  EstablishCustomAgreeOfContractDivWrap = {};

  EstablishCustomAgreeOfContractCheckbox = {};

  EstablishCustomContractDivWrap = {};

  EstablishCustomContractTypography = {};

  EstablishCustomYoungNoticeDivWrap = {};

  EstablishCustomYoungNoticeTypography = {};

  EstablishCustomYoungContactOfGuardianLabelOfContactOfGuardianTypography = {};

  EstablishCustomYoungContactOfGuardianDivWrap = {};

  EstablishCustomYoungContactOfGuardianTextField = {};

  EstablishCustomYoungNameOfGuardianLabelOfNameOfGuardianTypography = {};

  EstablishCustomYoungNameOfGuardianDivWrap = {};

  EstablishCustomYoungNameOfGuardianTextField = {};

  EstablishCustomYoungDiv = {};

  EstablishCustomIdOfNationalLabelOfIdOfNationalTypography = {};

  EstablishCustomIdOfNationalDivWrap = {};

  EstablishCustomIdOfNationalTextField = {};

  EstablishCustomBirthdayLabelOfBirthdayTypography = {};

  EstablishCustomBirthdayDivWrap = {};

  EstablishCustomBirthdayTextField = {};

  EstablishCustomContactLabelOfContactTypography = {};

  EstablishCustomContactDivWrap = {};

  EstablishCustomContactTextField = {};

  EstablishCustomTextOfEmailLabelOfTextOfEmailTypography = {};

  EstablishCustomTextOfEmailDivWrap = {};

  EstablishCustomTextOfEmailTextField = {};

  EstablishCustomNameLabelOfNameTypography = {};

  EstablishCustomNameDivWrap = {};

  EstablishCustomNameTextField = {};

  EstablishCustomDiv = {};

  EstablishMainDatOfPeriodWithHoursTypography = {};

  EstablishMainNameOfClassLabelOfNameOfClassTypography = {};

  EstablishMainNameOfClassBtnOfNameOfClassIconSchoolRounded = {};

  EstablishMainNameOfClassBtnOfNameOfClassIconButton = {};

  EstablishMainNameOfClassDivWrap = {};

  EstablishMainNameOfClassTypography = {};

  EstablishMainDiv = {};

  EstablishPaper = {};

  /** => following for classSetup  component  */

  ClassSetupClazzAreaOfFuncDeletedChip = {};

  ClassSetupClazzAreaOfFuncUpdateChip = {};

  ClassSetupClazzAreaOfFuncDiv = {};

  ClassSetupClazzInfoStateOfClassMenuItem = {};

  ClassSetupClazzInfoStateOfClassTextFieldList = {};

  ClassSetupClazzInfoTypeOfClassMenuItem = {};

  ClassSetupClazzInfoTypeOfClassTextFieldList = {};

  ClassSetupClazzInfoCountsOfStudentCapacityTextField = {};

  ClassSetupClazzInfoDiv = {};

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

  ClassSetupClazzNameOfClassTextField = {};

  ClassSetupClazzLinkOfPortfolioTextField = {};

  ClassSetupClazzExperienceOfHostTextField = {};

  ClassSetupClazzHeadNameOfHostTextField = {};

  ClassSetupClazzHeadImageOfHostAvatar = {};

  ClassSetupClazzHeadDiv = {};

  ClassSetupClazzDivList = {};

  ClassSetupClazzPaper = {};

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

export default new CommonStyle();
