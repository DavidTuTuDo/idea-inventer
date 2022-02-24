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
            const files = Util.findFilePathBy('../', (file) => _.isEqual(file.fileNameExtension, 'package.json'), 'node_modules','release');
            const modulePackageJson = Util.getFileContextInJSON('/Users/davidtu/cross-achieve/high/idea-inventer/utiller/template/sample.package.json');

            for (const packageJson of files) {
                const uglyPackageJson = Util.getFileContextInJSON(packageJson.absolute);
                const ugly = Util.or(updatePackageJsonParticularSection(uglyPackageJson, 'dependencies'),
                    updatePackageJsonParticularSection(uglyPackageJson, 'devDependencies'));

                if (ugly) {
                    await Util.writeJsonThanPrettier(packageJson.absolute, uglyPackageJson);
                    await Util.deleteSelfByPath(libpath.join(packageJson.dirPath,'node_modules'),true);
                    await Util.executeCommandLine(`cd ${packageJson.dirPath} && npm install`)
                } else {
                    Util.appendInfo(`${packageJson.dirName} is latest project`)
                }
            }

            function updatePackageJsonParticularSection(uglyPackageJson, sectionName) {
                const moduleSection = modulePackageJson[sectionName];
                const targetSection = uglyPackageJson[sectionName];
                if (targetSection === undefined || moduleSection === undefined) {
                    return;
                }
                const waitForUpgrade = Util.getIntersectionObject(moduleSection, targetSection);
                const ugly = !Util.isObjectContainAndEqual(waitForUpgrade, targetSection);
                if (ugly)
                    uglyPackageJson[sectionName] = Util.mergeObject(uglyPackageJson[sectionName], waitForUpgrade);
                return ugly;
            }

        }
    )();
}
