import {configerer} from "configerer";
import {utiller as Util, exceptioner as ERROR} from 'utiller';

/** author:明悅
 *  create time:Mon Mar 08 2021 19:36:29 GMT+0800 (Taipei Standard Time)
 */

class gener_util {

}


export {gener_util as gener_util}

(async () => {
        console.log('3秒後, utillter 要部署到remote npm...')
            // Util.generatePackage('../scraper',false).then();
        await Util.syncDelay(2999);
        await Util.generatePackage('../utiller', true);
        // await Util.generatePackage('../databazer', true);
        // Util.generatePackage('../configerer',true).then();

    }
)();
