import {configerer} from "configerer";
import {utiller as Util, exceptioner as ERROR, pooller as InfinitePool} from 'utiller';
import _ from 'lodash';
import libpath from 'path';
import Moment from 'moment';

/** author:明悅
 *  create time:Fri Feb 25 2022 00:32:46 GMT+0800 (Taipei Standard Time)
 */

class refresh_all {


}

export {refresh_all as refresh_all}

if (configerer.DEBUG_MODE) {
    (async () => {
            const files = Util.findFilePathBy('../', (file) => _.isEqual(file.fileNameExtension, 'package.json'), 'node_modules');
            const modulePackageJson = Util.getFileContextInJSON('/Users/davidtu/cross-achieve/high/idea-inventer/utiller/template/sample.package.json');

            for (const packageJson of files) {
                const uglyPackageJson = Util.getFileContextInJSON(packageJson.absolute);
                updateSection(uglyPackageJson, 'dependencies');
                updateSection(uglyPackageJson, 'devDependencies');
                console.log(uglyPackageJson);
                await Util.syncDelay(5000);
            }

            function updateSection(uglyPackageJson, sectionName) {
                const moduleSection = modulePackageJson[sectionName];
                const targetSection = uglyPackageJson[sectionName];
                if (targetSection === undefined || moduleSection === undefined) {
                    return;
                }
                const waitForUpgrade = Util.getIntersectionObject(moduleSection, targetSection);
                uglyPackageJson[sectionName] = Util.mergeObject(uglyPackageJson[sectionName], waitForUpgrade);
            }


        }
    )();
}
