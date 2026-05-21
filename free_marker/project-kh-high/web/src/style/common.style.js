import { utiller as Util, exceptioner as ERROR, pooller as InfinitePool } from "utiller";

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

    /** => following for exam editor component  */

    ExamEditorQuestionSelectedSelectorOfMathTextField = {};

    ExamEditorQuestionTypeOfMathTextField = {};

    ExamEditorQuestionYearTextField = {};

    ExamEditorQuestionTypeTextField = {};

    ExamEditorQuestionIndexOfAnswerTextField = {};

    ExamEditorQuestionQidTextField = {};

    ExamEditorQuestionSubjectTextField = {};

    ExamEditorQuestionIdTextField = {};

    ExamEditorQuestionFunctionCenterDiv = {};

    ExamEditorQuestionAnswerTextField = {};

    ExamEditorQuestionTimesOfYearTextField = {};

    ExamEditorQuestionTypeOfQuestionTextField = {};

    ExamEditorQuestionOptionalChoiceDivList = {};

    ExamEditorQuestionOptionalChoiceDiv = {};

    ExamEditorQuestionOptionalDivList = {};

    ExamEditorQuestionOptionalDiv = {};

    ExamEditorQuestionSelectorOfMathValueTextField = {};

    ExamEditorQuestionSelectorOfMathLabelTextField = {};

    ExamEditorQuestionSelectorOfMathRadioGroupList = {};

    ExamEditorQuestionSelectorOfMathFormControlLabel = {};

    ExamEditorQuestionChoiceImageUrlTextField = {};

    ExamEditorQuestionChoiceImageUrlImg = {};

    ExamEditorQuestionChoiceImageDivList = {};

    ExamEditorQuestionChoiceImageDivWrap = {};

    ExamEditorQuestionChoiceImageDiv = {};

    ExamEditorQuestionChoiceStatementDivWrap = {};

    ExamEditorQuestionChoiceStatementTextField = {};

    ExamEditorQuestionChoiceDivList = {};

    ExamEditorQuestionChoiceDivWrap = {};

    ExamEditorQuestionChoiceDiv = {};

    ExamEditorQuestionTopicImageUrlTextField = {};

    ExamEditorQuestionTopicImageUrlImg = {};

    ExamEditorQuestionTopicImageDivList = {};

    ExamEditorQuestionTopicImageDivWrap = {};

    ExamEditorQuestionTopicImageDiv = {};

    ExamEditorQuestionTopicNameDivWrap = {};

    ExamEditorQuestionTopicNameTextField = {};

    ExamEditorQuestionTopicDiv = {};

    ExamEditorQuestionTopicOfAssistantImageUrlTextField = {};

    ExamEditorQuestionTopicOfAssistantImageUrlImg = {};

    ExamEditorQuestionTopicOfAssistantImageDivList = {};

    ExamEditorQuestionTopicOfAssistantImageDivWrap = {};

    ExamEditorQuestionTopicOfAssistantImageDiv = {};

    ExamEditorQuestionTopicOfAssistantNameTextField = {};

    ExamEditorQuestionTopicOfAssistantDiv = {};

    ExamEditorQuestionAlertDiv = {};

    ExamEditorQuestionDivList = {};

    ExamEditorQuestionDivWrap = {};

    ExamEditorQuestionCard = {};

    ExamEditorHistoryFilterSelectedOrderByWhatTextField = {};

    ExamEditorHistoryFilterSelectedWhichSubjectTextField = {};

    ExamEditorHistoryFilterSelectedReplyTypeTextField = {};

    ExamEditorHistoryFilterOrderByWhatValueTextField = {};

    ExamEditorHistoryFilterOrderByWhatLabelTextField = {};

    ExamEditorHistoryFilterOrderByWhatTextFieldList = {};

    ExamEditorHistoryFilterOrderByWhatMenuItem = {};

    ExamEditorHistoryFilterWhichSubjectValueTextField = {};

    ExamEditorHistoryFilterWhichSubjectLabelTextField = {};

    ExamEditorHistoryFilterWhichSubjectTextFieldList = {};

    ExamEditorHistoryFilterWhichSubjectMenuItem = {};

    ExamEditorHistoryFilterSpaceDiv = {};

    ExamEditorHistoryFilterReplyTypeValueTextField = {};

    ExamEditorHistoryFilterReplyTypeLabelTextField = {};

    ExamEditorHistoryFilterReplyTypeRadioGroupList = {};

    ExamEditorHistoryFilterReplyTypeFormControlLabel = {};

    ExamEditorHistoryFilterDivWrap = {};

    ExamEditorHistoryFilterDiv = {};

    ExamEditorDiv = {};

    /** => following for main editor component  */

    MainEditorCountdownPaper = {};

    MainEditorEnterPointSubTitleTextField = {};

    MainEditorEnterPointTitleTextField = {};

    MainEditorEnterPointIndexOfSequenceTextField = {};

    MainEditorEnterPointXsTextField = {};

    MainEditorEnterPointRouteTextField = {};

    MainEditorEnterPointIdTextField = {};

    MainEditorEnterPointDivList = {};

    MainEditorEnterPointDivWrap = {};

    MainEditorEnterPointPaper = {};

    MainEditorViewPagerImageTextField = {};

    MainEditorViewPagerImageDivWrap = {};

    MainEditorViewPagerImageImg = {};

    MainEditorViewPagerRouteTextField = {};

    MainEditorViewPagerIdTextField = {};

    MainEditorViewPagerDivList = {};

    MainEditorViewPagerDivWrap = {};

    MainEditorViewPagerDiv = {};

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

    /** => following for textsIndexSetter  component  */

    IreneTextsIndexSetterFuncLeaveChip = {};

    IreneTextsIndexSetterFuncUpdateChip = {};

    IreneTextsIndexSetterFuncDiv = {};

    IreneTextsIndexSetterRowGoTopChip = {};

    IreneTextsIndexSetterRowContentTypography = {};

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

    IreneTextsFetchFuncLeaveChip = {};

    IreneTextsFetchFuncAppendChip = {};

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

    /** => following for account  component  */

    AccountFuncAreaOfEditBtnOfJoinReaderReactFragmentWrap = {};

    AccountFuncAreaOfEditBtnOfJoinReaderButton = {};

    AccountFuncAreaOfEditBtnOfJoinAdminReactFragmentWrap = {};

    AccountFuncAreaOfEditBtnOfJoinAdminButton = {};

    AccountFuncAreaOfEditCleanCacheButton = {};

    AccountFuncAreaOfEditToEditModeButton = {};

    AccountFuncAreaOfEditLogoutReactFragmentWrap = {};

    AccountFuncAreaOfEditLogoutButton = {};

    AccountFuncAreaOfEditCopyUserIdButton = {};

    AccountFuncAreaOfEditLangTextFieldList = {};

    AccountFuncAreaOfEditLangMenuItem = {};

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

    /** => following for myFatefulQuestions  component  */

    MyFatefulQuestionsFatefulItemQuestionInfoCreateTimeTypography = {};

    MyFatefulQuestionsFatefulItemQuestionInfoSubjectInfoTypography = {};

    MyFatefulQuestionsFatefulItemQuestionInfoDiv = {};

    MyFatefulQuestionsFatefulItemQuestionTopicTypography = {};

    MyFatefulQuestionsFatefulItemDivList = {};

    MyFatefulQuestionsFatefulItemCard = {};

    MyFatefulQuestionsFilterQuestionTypeTextFieldList = {};

    MyFatefulQuestionsFilterQuestionTypeMenuItem = {};

    MyFatefulQuestionsFilterWhichSubjectTextFieldList = {};

    MyFatefulQuestionsFilterWhichSubjectMenuItem = {};

    MyFatefulQuestionsFilterDiv = {};

    MyFatefulQuestionsDiv = {};

    /** => following for whoknowz  component  */

    WhoknowzSubmitReactFragmentWrap = {};

    WhoknowzSubmitButton = {};

    WhoknowzAnswerImageUrlImg = {};

    WhoknowzAnswerImageDivList = {};

    WhoknowzAnswerImageDiv = {};

    WhoknowzAnswerAnswerByTextTextField = {};

    WhoknowzAnswerCardSkeleton = {};

    WhoknowzAnswerDivList = {};

    WhoknowzAnswerCard = {};

    WhoknowzQuestionDiv = {};

    WhoknowzFastCenterAskmrlinButton = {};

    WhoknowzFastCenterCopylinkButton = {};

    WhoknowzFastCenterDiv = {};

    WhoknowzDiv = {};

    /** => following for purchase  component  */

    PurchasePurchasePlanBuyDivWrap = {};

    PurchasePurchasePlanBuyButton = {};

    PurchasePurchasePlanPricePriceTipTypography = {};

    PurchasePurchasePlanPriceDivWrap = {};

    PurchasePurchasePlanPriceTypography = {};

    PurchasePurchasePlanSpaceDiv = {};

    PurchasePurchasePlanNameDivWrap = {};

    PurchasePurchasePlanNameTypography = {};

    PurchasePurchasePlanDivSkeleton = {};

    PurchasePurchasePlanDivList = {};

    PurchasePurchasePlanDiv = {};

    PurchaseBannerDivWrap = {};

    PurchaseBannerImg = {};

    PurchaseDiv = {};

    /** => following for result  component  */

    ResultMessageTypography = {};

    ResultScoreTypography = {};

    ResultCard = {};

    /** => following for exam  component  */

    ExamQuestionReplyTimestampTypography = {};

    ExamQuestionDurationTypography = {};

    ExamQuestionTipDivWrap = {};

    ExamQuestionTipTypography = {};

    ExamQuestionFunctionCenterCalloutHelpReactFragmentWrap = {};

    ExamQuestionFunctionCenterCalloutHelpButton = {};

    ExamQuestionFunctionCenterAddToFavoriteReactFragmentWrap = {};

    ExamQuestionFunctionCenterAddToFavoriteButton = {};

    ExamQuestionFunctionCenterDiv = {};

    ExamQuestionOptionalChoiceStatementButton = {};

    ExamQuestionOptionalChoiceDivList = {};

    ExamQuestionOptionalChoiceDiv = {};

    ExamQuestionOptionalIndexOfAnswerTypography = {};

    ExamQuestionOptionalDivList = {};

    ExamQuestionOptionalDiv = {};

    ExamQuestionSelectorOfMathValueRadio = {};

    ExamQuestionSelectorOfMathLabelTypography = {};

    ExamQuestionSelectorOfMathRadioGroupList = {};

    ExamQuestionSelectorOfMathFormControlLabel = {};

    ExamQuestionChoiceImageUrlImg = {};

    ExamQuestionChoiceImageDivList = {};

    ExamQuestionChoiceImageDiv = {};

    ExamQuestionChoiceStatementDivWrap = {};

    ExamQuestionChoiceStatementButton = {};

    ExamQuestionChoiceDivList = {};

    ExamQuestionChoiceDiv = {};

    ExamQuestionTopicImageUrlImg = {};

    ExamQuestionTopicImageDivList = {};

    ExamQuestionTopicImageDiv = {};

    ExamQuestionTopicNameDivWrap = {};

    ExamQuestionTopicNameTypography = {};

    ExamQuestionTopicDiv = {};

    ExamQuestionTopicOfAssistantImageUrlImg = {};

    ExamQuestionTopicOfAssistantImageDivList = {};

    ExamQuestionTopicOfAssistantImageDiv = {};

    ExamQuestionTopicOfAssistantNameTypography = {};

    ExamQuestionTopicOfAssistantDiv = {};

    ExamQuestionAlertAlertImageDivWrap = {};

    ExamQuestionAlertAlertImageImg = {};

    ExamQuestionAlertDiv = {};

    ExamQuestionCardSkeleton = {};

    ExamQuestionDivList = {};

    ExamQuestionDivWrap = {};

    ExamQuestionCard = {};

    ExamHistoryFilterOrderByWhatTextFieldList = {};

    ExamHistoryFilterOrderByWhatMenuItem = {};

    ExamHistoryFilterWhichSubjectTextFieldList = {};

    ExamHistoryFilterWhichSubjectMenuItem = {};

    ExamHistoryFilterSpaceDiv = {};

    ExamHistoryFilterReplyTypeValueRadio = {};

    ExamHistoryFilterReplyTypeLabelTypography = {};

    ExamHistoryFilterReplyTypeRadioGroupList = {};

    ExamHistoryFilterReplyTypeFormControlLabel = {};

    ExamHistoryFilterDiv = {};

    ExamDiv = {};

    /** => following for main  component  */

    MainCountdownPaper = {};

    MainEnterPointSubTitleTypography = {};

    MainEnterPointTitleTypography = {};

    MainEnterPointPaperSkeleton = {};

    MainEnterPointGridList = {};

    MainEnterPointGridWrap = {};

    MainEnterPointPaper = {};

    MainViewPagerImageDivWrap = {};

    MainViewPagerImageImg = {};

    MainViewPagerSwiperSlideSkeleton = {};

    MainViewPagerSwiperList = {};

    MainViewPagerSwiperSlide = {};

    MainDiv = {};

    /** => following for purchaseSucceed  component  */

    PurchaseSucceedConfirmButton = {};

    PurchaseSucceedSucceedTitleTypography = {};

    PurchaseSucceedDiv = {};

    /** => following for examFilter  component  */

    ExamFilterHistoryTestBtnWithHistoryButton = {};

    ExamFilterHistoryTestSpaceDiv = {};

    ExamFilterHistoryTestSelectorTextFieldList = {};

    ExamFilterHistoryTestSelectorMenuItem = {};

    ExamFilterHistoryTestDiv = {};

    ExamFilterSpaceDiv = {};

    ExamFilterRandomTestBtnOfStartExamButton = {};

    ExamFilterRandomTestCountsOfExamValueRadio = {};

    ExamFilterRandomTestCountsOfExamLabelTypography = {};

    ExamFilterRandomTestCountsOfExamRadioGroupList = {};

    ExamFilterRandomTestCountsOfExamFormControlLabel = {};

    ExamFilterRandomTestRangeOfYearSlider = {};

    ExamFilterRandomTestSpaceDiv = {};

    ExamFilterRandomTestFastRangeButtonGroupList = {};

    ExamFilterRandomTestFastRangeButton = {};

    ExamFilterRandomTestDiv = {};

    ExamFilterDiv = {};

    /** => following for editorOfSubject  component  */

    EditorOfSubjectAreaOfStatementUpdateButton = {};

    EditorOfSubjectAreaOfStatementTotalOfClassifyQLabelOfTotalOfClassifyQTypography = {};

    EditorOfSubjectAreaOfStatementTotalOfClassifyQDivWrap = {};

    EditorOfSubjectAreaOfStatementTotalOfClassifyQTypography = {};

    EditorOfSubjectAreaOfStatementTotalOfSubjectQLabelOfTotalOfSubjectQTypography = {};

    EditorOfSubjectAreaOfStatementTotalOfSubjectQDivWrap = {};

    EditorOfSubjectAreaOfStatementTotalOfSubjectQTypography = {};

    EditorOfSubjectAreaOfStatementYearTextFieldList = {};

    EditorOfSubjectAreaOfStatementYearMenuItem = {};

    EditorOfSubjectAreaOfStatementDiv = {};

    EditorOfSubjectDiv = {};

    /** -------------------- functions -------------------- **/

    constructor(props) {}

    /** -------------------- async api -------------------- **/
}

export default new CommonStyle();
