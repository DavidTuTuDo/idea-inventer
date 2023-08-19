import BaseMyI18n from "./BaseMyI18n";
import {
  utiller as Util,
  exceptioner as ERROR,
  pooller as InfinitePool,
} from "utiller";
import _ from "lodash";
import libpath from "path";
import BaseI18n from "../../base/BaseI18n";

class I18n extends BaseMyI18n {
  /** -------------------- fields -------------------- **/

  mainEditorInterestingOfFunctionLabelOfSubTitle = "用来显示标题";

  mainEditorInterestingOfFunctionLabelOfTitle = "用来显示标题";

  mainEditorInterestingOfFunctionLabelOfIndexOfSequence = "用来调整顺序orderBy";

  mainEditorInterestingOfFunctionLabelOfXs = "按钮的比重";

  mainEditorInterestingOfFunctionLabelOfRoute = "点击后的导页";

  mainEditorInterestingOfFunctionLabelOfId = "我是unique id,不能被更改";

  mainEditorHotSingerLabelOfId = "注意!这里的id是指cheap array的document id";

  mainEditorHotSingerLabelOfStatement = "歌手作品数量,或是耸动的标题";

  mainEditorHotSingerLabelOfIdOfSinger =
      "sheet的unique id,用来点击后道引到sheet";

  mainEditorHotSingerLabelOfIndexOfSequence = "名次";

  mainEditorHotSingerLabelOfName = "歌名";

  mainEditorHotSingerId = "contents";

  mainEditorHotSingerName = "如果不可以";

  mainEditorTitleOfHotSinger = "热门歌手";

  mainEditorHotRhythmLabelOfId = "注意!这里的id是指cheap array的document id";

  mainEditorHotRhythmLabelOfIdOfGuitarPu =
      "sheet的unique id,用来点击后道引到sheet";

  mainEditorHotRhythmLabelOfIndexOfSequence = "名次";

  mainEditorHotRhythmLabelOfSinger = "歌手";

  mainEditorHotRhythmLabelOfName = "歌名";

  mainEditorHotRhythmId = "contents";

  mainEditorHotRhythmSinger = "明悦";

  mainEditorHotRhythmName = "如果不可以";

  mainEditorTitleOfHotRhythm = "热门歌曲";

  mainEditorPromotedBannerLabelOfImage = "image 的实体位置";

  mainEditorPromotedBannerLabelOfRoute = "点击图片后的导页";

  mainEditorPromotedBannerLabelOfId = "我是unique id,不能被更改";

  pageTitleOfMainEditor = "悦谱-首页 editor";

  navigatorKeywordId = "contents";

  navigatorToolBarLogin = "登入";

  navigatorToolBarCompleteLabelOfInput = "没有解释";

  navigatorToolBarTitle = "明悦科技";

  /**  navigator  ↑ 需要的字串 */

  accountCredentialSignInMethod = "goooogle.com";

  accountCredentialProviderId = "goooogle.com";

  accountCredentialOauthAccessToken = "empty";

  accountCredentialOauthIdToken = "empty";

  accountCredentialIdToken = "empty";

  accountCredentialAccessToken = "empty";

  accountFuncAreaOfEditSelectedLang = "zh_TW";

  accountFuncAreaOfEditToEditMode = "编辑模式";

  dialogTitleOfAccountFuncAreaOfEditLogout = "再次确认";

  dialogContentOfAccountFuncAreaOfEditLogout = "是否确定登出?";

  accountFuncAreaOfEditLogout = "登出";

  accountFuncAreaOfEditCopyUserId = "複製令牌";

  accountFuncAreaOfEditLangLabel2 = "English";

  accountFuncAreaOfEditLangLabel1 = "简体中文";

  accountFuncAreaOfEditLangLabel0 = "繁体中文";

  accountFuncAreaOfIdStateAreaOfIdValueOfId = "读取中...";

  accountFuncAreaOfIdStateAreaOfIdLabelOfId = "个人令牌";

  accountFuncAreaOfEmailStateAreaOfEmailValueOfEmail = "读取中...";

  accountFuncAreaOfEmailStateAreaOfEmailLabelOfEmail = "电子邮件信箱";

  accountFuncAreaOfNameStateAreaOfNameValueOfName = "读取中...";

  accountFuncAreaOfNameStateAreaOfNameLabelOfName = "显示名称";

  /**  account  ↑ 需要的字串 */

  noteEditorLabelOfContent = "笔记的内容";

  noteEditorFunctionAreaCancel = "取消";

  noteEditorFunctionAreaSubmit = "编辑";

  /**  noteEditor  ↑ 需要的字串 */

  personalRhythmFavoritePuItemsOfExtraNoticeContent0 = "是否从我的最爱中删除";

  personalRhythmFavoritePuItemsOfExtraNoticeTitle0 = "执行删除";

  personalRhythmFavoritePuItemsOfExtraIcon0 = "CancelScheduleSend";

  personalRhythmFavoritePuItemsOfExtraLabel0 = "删除";

  personalRhythmFavoritePuIdOfFolder = "default";

  personalRhythmFavoritePuTitle = "标题";

  pageTitleOfPersonalRhythm = "我的最爱";

  /**  personalRhythm  ↑ 需要的字串 */

  pageTitleOfHistoryRhythm = "历史搜寻";

  /**  historyRhythm  ↑ 需要的字串 */

  /**  artist  ↑ 需要的字串 */

  portfolioRhythmUuidOfSinger = "-1";

  portfolioRhythmUuidOfSong = "-1";

  pageTitleOfPortfolio = "歌曲列表";

  /**  portfolio  ↑ 需要的字串 */

  sheetAdjustCenterUuidOfSinger = "-1";

  sheetAdjustCenterUuidOfSong = "-1";

  sheetAdjustCenterNote = "笔记";

  sheetAdjustCenterJoinToFavoriteLabel = "加到最爱";

  sheetAdjustCenterHideChordLabel = "隐藏和弦";

  sheetAdjustCenterToOriginalTonality = "回原调";

  sheetAdjustCenterToFemaleTonality = "转女调";

  sheetAdjustCenterToMaleTonality = "转男调";

  sheetAdjustCenterShrink = "字体缩小";

  sheetAdjustCenterEnlarge = "字体放大";

  sheetAdjustCenterFlatten = "降半音";

  sheetAdjustCenterSharpen = "升半音";

  sheetNameOfSongAndSinger = "解译中...";

  sheetGuitarpuFloatAreaMarkOfYueh = "images/yueh_black.png";

  sheetGuitarpuOriginalContext = "(原始)歌谱 C Am F G";

  sheetGuitarpuCurrentContext = "(画面上)C Am F G";

  pageTitleOfSheet = "详细的吉他谱";

  /**  sheet  ↑ 需要的字串 */

  mainHotSingerId = "contents";

  mainHotSingerName = "如果不可以";

  mainTitleOfHotSinger = "热门歌手";

  mainHotRhythmId = "contents";

  mainHotRhythmSinger = "明悦";

  mainHotRhythmName = "如果不可以";

  mainTitleOfHotRhythm = "热门歌曲";

  pageTitleOfMain = "悦谱-首页";


  constructor(props) {
    super(props);
  }

  /** -------------------- async api -------------------- **/
}

export default new I18n();
