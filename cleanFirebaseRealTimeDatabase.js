import firebaseHandler from './firebase';
import * as fs from "fs";
import Index from "./configer";
(async () => {
  await firebaseHandler.cleanReference();
  Util.appendInfo('清除firebase data 成功');

  fs.unlinkSync(Index.PATH_FILE_COMPLETED_SINGERS);
  fs.unlinkSync(Index.PATH_FILE_COMPLETED_TONES);
  Util.appendInfo('清除下載的存擋 成功');

})();
