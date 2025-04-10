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

  MainEditorInterestingOfFunctionSubTitleTextField = {};

  MainEditorInterestingOfFunctionTitleTextField = {};

  MainEditorInterestingOfFunctionIndexOfSequenceTextField = {};

  MainEditorInterestingOfFunctionXsTextField = {};

  MainEditorInterestingOfFunctionRouteTextField = {};

  MainEditorInterestingOfFunctionIdTextField = {};

  MainEditorInterestingOfFunctionDivList = {};

  MainEditorInterestingOfFunctionDivWrap = {};

  MainEditorInterestingOfFunctionPaper = {};

  MainEditorHotSingerIdTextField = {};

  MainEditorHotSingerStatementTextField = {};

  MainEditorHotSingerIdOfSingerTextField = {};

  MainEditorHotSingerIndexOfSequenceTextField = {};

  MainEditorHotSingerNameTextField = {};

  MainEditorHotSingerDivList = {};

  MainEditorHotSingerDivWrap = {};

  MainEditorHotSingerCard = {};

  MainEditorHotRhythmIdTextField = {};

  MainEditorHotRhythmIdOfGuitarPuTextField = {};

  MainEditorHotRhythmIndexOfSequenceTextField = {};

  MainEditorHotRhythmSingerTextField = {};

  MainEditorHotRhythmNameTextField = {};

  MainEditorHotRhythmDivList = {};

  MainEditorHotRhythmDivWrap = {};

  MainEditorHotRhythmCard = {};

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

  /** => following for chordiventor  component  */

  ChordiventorFuncClearIdChip = {};

  ChordiventorFuncClearReactFragmentWrap = {};

  ChordiventorFuncClearChip = {};

  ChordiventorFuncCancelChip = {};

  ChordiventorFuncLoadChip = {};

  ChordiventorFuncPersistReactFragmentWrap = {};

  ChordiventorFuncPersistChip = {};

  ChordiventorFuncDiv = {};

  ChordiventorInfoCautionTypography = {};

  ChordiventorInfoHorizonLyricistLabelOfLyricistTypography = {};

  ChordiventorInfoHorizonLyricistDivWrap = {};

  ChordiventorInfoHorizonLyricistTextField = {};

  ChordiventorInfoHorizonComposerLabelOfComposerTypography = {};

  ChordiventorInfoHorizonComposerDivWrap = {};

  ChordiventorInfoHorizonComposerTextField = {};

  ChordiventorInfoHorizonSpeedLabelOfSpeedTypography = {};

  ChordiventorInfoHorizonSpeedDivWrap = {};

  ChordiventorInfoHorizonSpeedTextField = {};

  ChordiventorInfoHorizonDiv = {};

  ChordiventorInfoRowTonalityOfMaleLabelOfTonalityOfMaleTypography = {};

  ChordiventorInfoRowTonalityOfMaleDivListWrap = {};

  ChordiventorInfoRowTonalityOfMaleMenuItem = {};

  ChordiventorInfoRowTonalityOfMaleTextFieldList = {};

  ChordiventorInfoRowTonalityOfFemaleLabelOfTonalityOfFemaleTypography = {};

  ChordiventorInfoRowTonalityOfFemaleDivListWrap = {};

  ChordiventorInfoRowTonalityOfFemaleMenuItem = {};

  ChordiventorInfoRowTonalityOfFemaleTextFieldList = {};

  ChordiventorInfoRowTonalityOfOriginalLabelOfTonalityOfOriginalTypography = {};

  ChordiventorInfoRowTonalityOfOriginalDivListWrap = {};

  ChordiventorInfoRowTonalityOfOriginalMenuItem = {};

  ChordiventorInfoRowTonalityOfOriginalTextFieldList = {};

  ChordiventorInfoRowTonalityOfContextLabelOfTonalityOfContextTypography = {};

  ChordiventorInfoRowTonalityOfContextDivListWrap = {};

  ChordiventorInfoRowTonalityOfContextMenuItem = {};

  ChordiventorInfoRowTonalityOfContextTextFieldList = {};

  ChordiventorInfoRowDiv = {};

  ChordiventorInfoSingerInputOfSingerTextField = {};

  ChordiventorInfoSingerLabelOfSingerTypography = {};

  ChordiventorInfoSingerDivWrap = {};

  ChordiventorInfoSingerAutocomplete = {};

  ChordiventorInfoNameLabelOfNameTypography = {};

  ChordiventorInfoNameDivWrap = {};

  ChordiventorInfoNameTextField = {};

  ChordiventorInfoIdOfGuitarPuLabelOfIdOfGuitarPuTypography = {};

  ChordiventorInfoIdOfGuitarPuDivWrap = {};

  ChordiventorInfoIdOfGuitarPuTextField = {};

  ChordiventorInfoIdOfSingerLabelOfIdOfSingerTypography = {};

  ChordiventorInfoIdOfSingerDivWrap = {};

  ChordiventorInfoIdOfSingerTextField = {};

  ChordiventorInfoDiv = {};

  ChordiventorBriefFrameAreaOfPreviewLabelOfTipDivWrap = {};

  ChordiventorBriefFrameAreaOfPreviewLabelOfTipTypography = {};

  ChordiventorBriefFrameAreaOfPreviewDiv = {};

  ChordiventorBriefFrameDiv = {};

  ChordiventorBriefTxtTextField = {};

  ChordiventorBriefDiv = {};

  ChordiventorDivWrap = {};

  ChordiventorDiv = {};

  /** => following for noteEditor  component  */

  NoteEditorFunctionAreaCancelButton = {};

  NoteEditorFunctionAreaSubmitButton = {};

  NoteEditorFunctionAreaDiv = {};

  NoteEditorContentTextField = {};

  NoteEditorPaper = {};

  /** => following for inventedOfPu  component  */

  InventedOfPuDiv = {};

  /** => following for personalRhythm  component  */

  PersonalRhythmFavoritePuExtraIconMoreHoriz = {};

  PersonalRhythmFavoritePuExtraReactFragmentWrap = {};

  PersonalRhythmFavoritePuExtraIconButton = {};

  PersonalRhythmFavoritePuNameTypography = {};

  PersonalRhythmFavoritePuTitleDivWrap = {};

  PersonalRhythmFavoritePuTitleTypography = {};

  PersonalRhythmFavoritePuCardSkeleton = {};

  PersonalRhythmFavoritePuDivList = {};

  PersonalRhythmFavoritePuDivWrap = {};

  PersonalRhythmFavoritePuCard = {};

  PersonalRhythmDiv = {};

  /** => following for historyRhythm  component  */

  HistoryRhythmDiv = {};

  /** => following for artist  component  */

  ArtistDiv = {};

  /** => following for portfolio  component  */

  PortfolioRhythmComposerTypography = {};

  PortfolioRhythmSingerTypography = {};

  PortfolioRhythmNameTypography = {};

  PortfolioRhythmCardSkeleton = {};

  PortfolioRhythmDivList = {};

  PortfolioRhythmCard = {};

  PortfolioDiv = {};

  /** => following for sheet  component  */

  SheetAdjustCenterToggleWrapperNoteReactFragmentWrap = {};

  SheetAdjustCenterToggleWrapperNoteButton = {};

  SheetAdjustCenterToggleWrapperJoinToFavoriteLabelOfJoinToFavoriteTypography = {};

  SheetAdjustCenterToggleWrapperJoinToFavoriteToggleOfJoinToFavoriteSwitch = {};

  SheetAdjustCenterToggleWrapperJoinToFavoriteFormControlLabel = {};

  SheetAdjustCenterToggleWrapperHideChordLabelOfHideChordTypography = {};

  SheetAdjustCenterToggleWrapperHideChordToggleOfHideChordSwitch = {};

  SheetAdjustCenterToggleWrapperHideChordFormControlLabel = {};

  SheetAdjustCenterToggleWrapperDiv = {};

  SheetAdjustCenterGenderWrapperToOriginalTonalityButton = {};

  SheetAdjustCenterGenderWrapperToFemaleTonalityButton = {};

  SheetAdjustCenterGenderWrapperToMaleTonalityButton = {};

  SheetAdjustCenterGenderWrapperDiv = {};

  SheetAdjustCenterFontWrapperLinkButton = {};

  SheetAdjustCenterFontWrapperShrinkButton = {};

  SheetAdjustCenterFontWrapperEnlargeButton = {};

  SheetAdjustCenterFontWrapperDiv = {};

  SheetAdjustCenterTonalityWrapperEditorButton = {};

  SheetAdjustCenterTonalityWrapperFlattenButton = {};

  SheetAdjustCenterTonalityWrapperSharpenButton = {};

  SheetAdjustCenterTonalityWrapperDiv = {};

  SheetAdjustCenterPreludeWrapperPreludeOfGButton = {};

  SheetAdjustCenterPreludeWrapperPreludeOfCButton = {};

  SheetAdjustCenterPreludeWrapperDiv = {};

  SheetAdjustCenterDiv = {};

  SheetAdjustSwipeableDrawerWrap = {};

  SheetAdjustDiv = {};

  SheetTipOfLoadingTypography = {};

  SheetNameOfSongAndSingerTypography = {};

  SheetGuitarpuFloatAreaMarkOfYuehDivWrap = {};

  SheetGuitarpuFloatAreaMarkOfYuehImg = {};

  SheetGuitarpuFloatAreaDiv = {};

  SheetGuitarpuCurrentContextTypography = {};

  SheetGuitarpuImageOfPreludeImg = {};

  SheetGuitarpuInfoCapoLabelOfCapoTypography = {};

  SheetGuitarpuInfoCapoDivWrap = {};

  SheetGuitarpuInfoCapoTypography = {};

  SheetGuitarpuInfoSpeedOfRhythmLabelOfSpeedOfRhythmTypography = {};

  SheetGuitarpuInfoSpeedOfRhythmDivWrap = {};

  SheetGuitarpuInfoSpeedOfRhythmTypography = {};

  SheetGuitarpuInfoDivWrap = {};

  SheetGuitarpuInfoDiv = {};

  SheetGuitarpuDivSkeleton = {};

  SheetGuitarpuDivList = {};

  SheetGuitarpuPaperWrap = {};

  SheetGuitarpuDiv = {};

  SheetDiv = {};

  /** => following for main  component  */

  MainInterestingOfFunctionSubTitleTypography = {};

  MainInterestingOfFunctionTitleTypography = {};

  MainInterestingOfFunctionPaperSkeleton = {};

  MainInterestingOfFunctionGridList = {};

  MainInterestingOfFunctionGridWrap = {};

  MainInterestingOfFunctionPaper = {};

  MainHotSingerStatementTypography = {};

  MainHotSingerIndexOfSequenceTypography = {};

  MainHotSingerNameTypography = {};

  MainHotSingerCardSkeleton = {};

  MainHotSingerDivList = {};

  MainHotSingerCard = {};

  MainTitleOfHotSingerTypography = {};

  MainHotRhythmIndexOfSequenceTypography = {};

  MainHotRhythmSingerTypography = {};

  MainHotRhythmNameTypography = {};

  MainHotRhythmCardSkeleton = {};

  MainHotRhythmDivList = {};

  MainHotRhythmCard = {};

  MainTitleOfHotRhythmTypography = {};

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
