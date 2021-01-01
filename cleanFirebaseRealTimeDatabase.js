import firebaseHandler from './firebase';
import * as fs from "fs";
import GlobalConfig from "./GlobalConfig";
(async () => {
  await firebaseHandler.cleanReference();
  console.log('清除firebase data 成功');

  fs.unlinkSync(GlobalConfig.PATH_COMPLETED_SINGERS);
  fs.unlinkSync(GlobalConfig.PATH_COMPLETED_TONES);
  console.log('清除下載的存擋 成功');

})();
