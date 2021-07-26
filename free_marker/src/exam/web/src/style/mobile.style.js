/** this code are generated, modify is no sense. 
	author:David Tu, 
	email:freshingmoon0725@gmail.com 
	updateTime:2021-07-26-22-18-44 
*/
import {
  utiller as Util,
  exceptioner as ERROR,
  pooller as InfinitePool,
} from "utiller";
import _ from "lodash";
import libpath from "path";

class MobileStyle {
  /** -------------------- fields -------------------- **/

  /** following for unknown */

  ExamQuestionAlertImageImg = {};

  ExamQuestionAlertImageImgWrapDiv = {};

  ExamEditorQuestionAlertImageTextField = {};

  ExamEditorQuestionAlertImageTextFieldWrapDiv = {};

  NavigatorAppBar = {};

  NavigatorAppBarWrapDiv = {};

  NavigatorToolBarToolbar = {};

  NavigatorToolBarMenuIconButton = {};

  NavigatorToolBarMenuIconMenuIcon = {};

  NavigatorToolBarTitleTypography = {};

  NavigatorToolBarLoginButton = {};

  NavigatorToolBarLoginButtonWrapDiv = {};

  NavigatorHomeAreaAvatar = {};

  NavigatorHomeAreaHomeImg = {};

  NavigatorFunctionDiv = {};

  NavigatorLoginButton = {};

  NavigatorLoginButtonWrapDiv = {};

  ExamQuestionCardArrayWrapDiv = {};

  ExamQuestionChoiceDivArrayWrapDiv = {};

  PurchasePlanDivArrayWrapDiv = {};

  PurchasePlanPriceTipTypography = {};

  PurchaseCardArrayWrapDiv = {};

  PurchaseCard = {};

  PurchaseArrayWrapDiv = {};

  PurchaseTitleTypography = {};

  NavigatorGoogleloginButton = {};

  NavigatorGoogleloginButtonWrapDiv = {};

  HeaderHomeAreaHomeImg = {};

  HeaderHomeAreaAvatar = {};

  HeaderFunctionDiv = {};

  HeaderLoginButton = {};

  HeaderLoginButtonWrapDiv = {};

  HeaderDiv = {};

  HeaderImageImg = {};

  HeaderImageImgWrapDiv = {};

  ExamQuestionAlertOuterDivWrapDiv = {};

  ExamQuestionAlertOuterImg = {};

  ExamQuestionAlertDiv = {};

  ExamQuestionAlertContentDiv = {};

  HeaderHomeImgWrapDiv = {};

  HeaderHomeImg = {};

  HeaderHomeAreaHomeImgWrapDiv = {};

  PurchasePlanPidTypography = {};

  PurchasePlanDivWrapDiv = {};

  PurchasePlanSpaceOuterDiv = {};

  PurchaseDivArrayWrapDiv = {};

  PurchasePlanBuyButtonWrapDiv = {};

  PurchasePlanBuyButton = {};

  PurchasePlanSweetTypographyWrapDiv = {};

  PurchasePlanSweetTypography = {};

  PurchasePlanMusicTypographyWrapDiv = {};

  PurchasePlanMusicTypography = {};

  PurchasePlanMathTypographyWrapDiv = {};

  PurchasePlanMathTypography = {};

  PurchasePlanPricePriceTipTypography = {};

  PurchasePlanPriceTypographyWrapDiv = {};

  PurchasePlanPriceTypography = {};

  PurchasePlanSpaceDiv = {};

  PurchasePlanNameTypographyWrapDiv = {};

  PurchasePlanNameTypography = {};

  PurchasePlanDivListWrapDiv = {};

  PurchasePlanDiv = {};

  AppBarToolBarLoginButtonWrapDiv = {};

  AppBarToolBarLoginButton = {};

  AppBarToolBarTitleTypography = {};

  AppBarToolBarMenuIconMenuIcon = {};

  AppBarToolBarMenuIconButton = {};

  AppBarToolBarToolbar = {};

  AppBarAppBar = {};

  NavigatorToolBarToolbarListWrapDiv = {};

  /** following for exam */

  ExamEditorTailDiv = {};

  ExamEditorFunctionAreaRestartButton = {};

  ExamEditorFunctionAreaSpaceDiv = {};

  ExamEditorFunctionAreaEndButton = {};

  ExamEditorFunctionAreaDiv = {};

  ExamEditorQuestionYearTextField = {};

  ExamEditorQuestionTypeTextField = {};

  ExamEditorQuestionSubjectTextField = {};

  ExamEditorQuestionTipTextFieldWrapDiv = {};

  ExamEditorQuestionTipTextField = {};

  ExamEditorQuestionAnswerTextField = {};

  ExamEditorQuestionReplyTextField = {};

  ExamEditorQuestionChoiceStatementTextFieldWrapDiv = {};

  ExamEditorQuestionChoiceStatementTextField = {};

  ExamEditorQuestionChoiceDivListWrapDiv = {};

  ExamEditorQuestionChoiceDiv = {};

  ExamEditorQuestionTopicTextFieldWrapDiv = {};

  ExamEditorQuestionTopicTextField = {};

  ExamEditorQuestionIdTextField = {};

  ExamEditorQuestionAlertAlertImageTextFieldWrapDiv = {};

  ExamEditorQuestionAlertAlertImageTextField = {};

  ExamEditorQuestionCardListWrapDiv = {};

  ExamEditorQuestionCardWrapDiv = {};

  ExamEditorQuestionAlertOuterDiv = {};

  ExamEditorQuestionCard = {};

  ExamEditorHeadDiv = {};

  ExamEditorDiv = {};

  /** following for purchase */

  PurchasePurchasePlanBuyButtonWrapDiv = {};

  PurchasePurchasePlanBuyButton = {};

  PurchasePurchasePlanPricePriceTipTypography = {};

  PurchasePurchasePlanPriceTypographyWrapDiv = {};

  PurchasePurchasePlanPriceTypography = {};

  PurchasePurchasePlanSpaceDiv = {};

  PurchasePurchasePlanNameTypographyWrapDiv = {};

  PurchasePurchasePlanNameTypography = {};

  PurchasePurchasePlanDivListWrapDiv = {};

  PurchasePurchasePlanDiv = {};

  PurchaseBannerImgWrapDiv = {};

  PurchaseBannerImg = {};

  PurchaseDiv = {};

  /** following for result */

  ResultMessageTypography = {};

  ResultScoreTypography = {};

  ResultCard = {};

  /** following for exam */

  ExamTailDiv = {};

  ExamFunctionAreaRestartButton = {};

  ExamFunctionAreaSpaceDiv = {};

  ExamFunctionAreaEndButton = {};

  ExamFunctionAreaDiv = {};

  ExamQuestionTipTypographyWrapDiv = {};

  ExamQuestionTipTypography = {};

  ExamQuestionChoiceStatementButtonWrapDiv = {};

  ExamQuestionChoiceStatementButton = { fontSize: "2.1rem" };

  ExamQuestionChoiceDivListWrapDiv = {};

  ExamQuestionChoiceDiv = {};

  ExamQuestionTopicTypographyWrapDiv = {};

  ExamQuestionTopicTypography = { lineHeight: 1.6, fontSize: "2.4rem" };

  ExamQuestionAlertAlertImageImgWrapDiv = {};

  ExamQuestionAlertAlertImageImg = {};

  ExamQuestionCardListWrapDiv = {};

  ExamQuestionCardWrapDiv = {};

  ExamQuestionAlertOuterDiv = {};

  ExamQuestionCard = {};

  ExamHeadDiv = {};

  ExamDiv = {};

  /** following for main */

  MainImageUrlImg = {};

  MainUploadButton = {};

  MainPurchaseButton = {};

  MainSocialButton = {};

  MainHighButton = {};

  MainJuniorButton = {};

  MainDiv = {};

  /** following for navigator */

  NavigatorExtraContentDiv = {};

  NavigatorExtraDrawer = {};

  NavigatorAppBarToolBarLoginButton = {};

  NavigatorAppBarToolBarTitleTypography = {};

  NavigatorAppBarToolBarMenuIconMenuIcon = {};

  NavigatorAppBarToolBarMenuIconButton = {};

  NavigatorAppBarToolBarToolbar = {};

  NavigatorAppBarAppBar = {};

  NavigatorDiv = {};

  /** following for login */

  LoginDivWrapDiv = {};

  LoginDiv = {};

  /** following for purchaseSucceed */

  PurchaseSucceedConfirmButton = {};

  PurchaseSucceedSucceedTitleTypography = {};

  PurchaseSucceedDiv = {};

  /** -------------------- functions -------------------- **/

  constructor(props) {}
  /** -------------------- async api -------------------- **/
}
export default new MobileStyle();
