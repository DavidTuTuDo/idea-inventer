import {configerer} from "configerer";
import {utiller as Util, exceptioner as ERROR, pooller as InfinitePool } from 'utiller';
import _ from 'lodash';
import libpath from 'path';
import Moment from 'moment';
import puppeteer from 'puppeteer';

/** author:明悅
 *  create time:Sun Oct 13 2024 02:27:45 GMT+0800 (Taipei Standard Time)
 */

class sashanail_scapier {

}

export { sashanail_scapier as sashanail_scapier }

if (configerer.DEBUG_MODE) {
(async () => {
        const browser = await puppeteer.launch({
            headless: false
        });

        const page = await browser.newPage();
        await page.goto(`https://www.sachianail.com/plist/-1`, {waitUntil: 'networkidle2'});


    }
)();
}
