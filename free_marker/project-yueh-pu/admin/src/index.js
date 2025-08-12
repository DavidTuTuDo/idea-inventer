const edit = true;

import Api from './api';
import {databazer as Databaser, builder as Builder} from "databazer";
import {utiller as Util, pooller as InfinitePool, exceptioner as ERROR} from "utiller";
import _ from 'lodash';
import Listener from './listener'
import firebase from "./base/FirebaseHelper";
import {linepayer as LinePay} from "linepayer";
import libpath from 'path';
import config from './config';
import moment from 'moment';
import {configerer} from "configerer";

/** 超過這個數量就用最浪費資源的方式 */
const THRESHOLD_OF_BATCH_MODE = 100;

/** 放入關鍵字的截止點，不然一個document沒辦法塞那麼多字 */
const THRESHOLD_OF_KEYWORD_MATCH = 690;

(async () => {

    const api = new Api();
    const listener = new Listener();
    const database = new Databaser('/Users/davidtu/cross-achieve/high/idea-inventer/pu91_scrapier/guitar_pu_from_91.db');
    const pathOfPreludes = `/Users/davidtu/cross-achieve/high/idea-inventer/pu91_scrapier/prelude`;
    await database.init();
    const bucket = firebase.storage().bucket();

    /** 找出週 rank */

    async function fetchTopSongsOfRank(n) {
        return Util.getArrayOfSize(_.orderBy(await database.fetchRecords('RANK',
          new Builder().gt('WEEK', 0).orderBy({WEEK: 'ASC'}).stmt()), (each) => each.WEEK, 'ASC'), n);
    }

    async function allowAllUserReadPermission() {

    }

    /** 找出週 rank 對應的tone*/
    async function deployMainPageHotRhythm(n) {
        const ranks = await fetchTopSongsOfRank(n);
        let guitars = await getObjectOfToneUrlAsKey()
        console.log(ranks);
        if (_.size(ranks) > 5) {
            await api.submitHotRhythms(ranks.map((each) => {
                return {
                    name: each.name,
                    singer: each.singer,
                    indexOfSequence: each.WEEK,
                    idOfGuitarPu: getDocumentId(each, guitars),
                    uuidOfSong: each.url,
                }
            }))
        }

        function getDocumentId(rank, guitars) {
            const url = rank.url;
            // console.log(rank.WEEK,' 歌名: ', rank.name, 'url:', rank.url);
            const guitar = guitars[url];
            return guitar ? guitar.idOfRemote : '';
        }
    }

    /** 找出週 rank 對應的tone*/
    async function deployMainPageHotSingers(n) {
        const singers = Util.getArrayOfSize((await api.fetchSingers(
          {orderBy: (stmt) => stmt.orderBy("popularLevel", 'desc')},
          {limit: (stmt) => stmt.limit(n)}
        )), n)
        if (_.size(singers) > 0) {
            await api.submitHotSingers(singers.map((each, index) => {
                return {
                    name: each.name,
                    singer: each.singer,
                    indexOfSequence: index,
                    idOfSinger: each.id,
                    statement: `作品 ${each.countsOfRhythm} 件`,
                }
            }))
        }
    }

    async function accumulatePopularLevelOfSinger() {
        const singers = await database.fetchRecords('SINGER');
        for (const singer of singers) {
            const tones = await database.fetchRecords('TONE', new Builder().equal('singerUrl', singer.url).stmt());
            const popularLevel = _.sum(tones.map((each) => each.popularLevel));
            const countsOfRhythm = _.size(tones);
            console.log(`歌手:${singer.name}, 有 ${popularLevel} 個讚, 有 ${countsOfRhythm} 個作品`);
            await database.updateRecords('SINGER', {
                popularLevel: popularLevel,
                songCounts: countsOfRhythm
            }, new Builder().equal('uid', singer.uid).stmt())
        }
    }

    async function deploySingers(popularLevel) {
        const singers = await database.fetchRecords('SINGER', new Builder().gt('songCounts', 0).and().gte('popularLevel', popularLevel).stmt());
        console.log('所有singer => ' + _.size(singers))
        _.remove(singers, (singer) => !Util.isUndefinedNullEmpty(singer.idOfRemote));
        _.remove(singers, (singer) => Util.isUndefinedNullEmpty(singer.url));
        console.log('所有singer 扣掉 已經有idOfRemote,剩下 => ' + _.size(singers))
        if (_.size(singers) > THRESHOLD_OF_BATCH_MODE) {
            await api.submitSingers(singers.map((singer) => getNormalizedSingerItem(singer)));
            await syncSingerRemoteIdIntoLocalStorage();
        } else {
            /** 數量低於 THRESHOLD_OF_BATCH_MODE, 所以one by one上傳 */
            for (const singer of singers) {
                const resultOfSinger = await api.submitSingerItem(getNormalizedSingerItem(singer));
                /** 更新idOfRemote到本端db */
                if (resultOfSinger.succeed) {
                    await database.updateRecords('SINGER', {idOfRemote: resultOfSinger.value.id},
                      new Builder().equal('url', resultOfSinger.value.uuidOfSinger).stmt())
                }

            }
        }
        return singers;
    }

    function getNormalizedSingerItem(singer) {
        return {
            name: singer.name,
            nicknames: singer.names.split(`#&#@#`).map(each => {
                return {statement: each}
            }),
            type: singer.type,
            uuidOfSinger: singer.url,
            popularLevel: singer.popularLevel,
            countsOfRhythm: singer.songCounts,
        }
    }

    async function deployKeywords() {
        /** 部署Keywords*/

        const singers = await fetchSingersContainRemoteId();
        const rhythms = await fetchTonesContainRemoteId();

        const keywords = [];
        keywords.push(...singers.map((singer) => {
            return {
                // value: singer.name,
                label: singer.name,
                popularLevel: singer.popularLevel,
                type: 12,
                uid: singer.idOfRemote,
                // extra: `11是代表rhythm,12代表singer`,
            }
        }));

        keywords.push(...rhythms.map((rhythm) => {
            return {
                // value: rhythm.singer,
                label: `${rhythm.singer}-${rhythm.name}`,
                popularLevel: rhythm.popularLevel,
                type: 11,
                uid: rhythm.idOfRhythm,
                // extra: `11是代表rhythm,12代表singer`,
            }
        }));
        /** extra 放進去會超過一個document的上限 必須>500! 不然keyword的已經exceed 一個document 可以放進去的數量*/
        await api.submitKeywords(_.filter(keywords, (item) => item.popularLevel >= THRESHOLD_OF_KEYWORD_MATCH)
        );
    }

    async function deployAllSingerTone(popularLevel) {
        await deploySingers(popularLevel);
        await deployGuitarPuByPopularLevel(popularLevel);
    }

    async function deployGuitarPuByPopularLevel(n) {
        const tones = await database.fetchRecords('TONE', new Builder().gte('popularLevel', n).stmt())
        console.log('所有tones => ' + _.size(tones))
        _.remove(tones, (tone) => !Util.isUndefinedNullEmpty(tone.idOfRemote))
        _.remove(tones, (tone) => Util.isUndefinedNullEmpty(tone.url))

        console.log('所有tones 扣掉 已經有idOfRemote,剩下 => ' + _.size(tones))

        if (_.size(tones) > THRESHOLD_OF_BATCH_MODE) {
            await deployGuitarPu(tones);
            await syncRemoteIdWithToneAndRhythmIntoLocalStorage();
        } else {
            const singers = await getObjectOfSingerUrlAsKey();
            for (const tone of tones) {
                const resultOfGuitar = await api.submitGuitarpuItem(getSubmitGuitarPuItemWithNormalized(tone, singers));
                if (resultOfGuitar.succeed) {
                    const resultOfRhythm = await api.submitRhythmItem({
                        ...resultOfGuitar.value,
                        idOfGuitarPu: resultOfGuitar.value.id
                    }, resultOfGuitar.value.id);
                    /** 更新idOfRemote到本端db */

                    await database.updateRecords('TONE', {
                          idOfRemote: resultOfGuitar.value.id,
                          idOfRhythm: resultOfRhythm.value.id
                      },
                      new Builder().equal('url', resultOfGuitar.value.uuidOfSong).stmt())
                    Util.appendInfo(`79874615 ${tone.singer}-${tone.name} 成功 submit`)
                }
            }
        }
        return tones;
    }

    async function fetchSingersContainRemoteId() {
        const singersOfLocalDatabase = await database.fetchRecords('SINGER');
        _.remove(singersOfLocalDatabase, (singer) => Util.isUndefinedNullEmpty(singer.idOfRemote));
        return singersOfLocalDatabase
    }

    async function getObjectOfSingerUrlAsKey() {
        return Util.toObjectWithAttributeKey((await fetchSingersContainRemoteId()), 'url');
    }

    async function getObjectOfToneUrlAsKey() {
        return Util.toObjectWithAttributeKey((await fetchTonesContainRemoteId()), 'url');
    }

    async function fetchTonesContainRemoteId() {
        const tonesOfLocalDatabase = await database.fetchRecords('TONE');
        _.remove(tonesOfLocalDatabase, (tone) => Util.isUndefinedNullEmpty(tone.idOfRemote));
        return tonesOfLocalDatabase
    }

    /** 粗暴的部署一拖拉庫的guitar pu,非常非常浪費firebase的點數 */
    async function deployGuitarPu(tones) {
        const singers = await getObjectOfSingerUrlAsKey();
        await api.submitGuitarpus(tones.map((each) => getSubmitGuitarPuItemWithNormalized(each, singers)));
        const guitars = await api.fetchGuitarpus();
        /** 部署Rhythms*/

        await api.submitRhythms(guitars.map(guitar => {
            return {...guitar, idOfGuitarPu: guitar.id};
        }));
    }

    function refactorTone(string) {
        /** decode */
        const origin = Util.getDecryptString(string);

        let latest = Util.replaceAllWithSets(origin,
          {from: '▲', to: '🌕'},
          {from: '★', to: '🌓'},
          {from: '△', to: '🌑'},
          {from: '✩', to: '🌙'},
          {from: '☆', to: '🌙'},
          {from: '\\|', to: '།'},
          {from: '\\[前奏\\]', to: '(開始)'},
          {from: '\\[尾奏\\]', to: '(結束)'},
          {from: '\\[間奏\\]', to: '(橋段)'},
          {from: '\\[間奏1\\]', to: '(橋段I)'},
          {from: '\\[間奏2\\]', to: '(橋段II)'},
          {from: '\\[間奏3\\]', to: '(橋段III)'},
          {from: '\\[間奏4\\]', to: '(橋段IV)'},
          {from: '\\(End\\)', to: '(終止)'},
        )

        /**   本來以為加個空白就能搞定對齊問題, 沒那麼簡單
         latest = Util.getStringHandledByEachLine(latest, (each, index, all) => {
         const isMatch = each.match(new RegExp('^[🌓🌑🌙🌕].+', 'g'));
         if (!isMatch) {
         all[index] = ` ${each}`;
         }
         })
         */
        return Util.getEncryptString(latest);
        /** encode */
    }

    /** *
     *
     * // 測試案例
     * //  console.log(parseMusicCredits("詞：吳劍泓 曲：林俊傑"));
     * // { lyricist: '吳劍泓', composer: '林俊傑' }
     *
     * //  console.log(parseMusicCredits("曲：林俊傑 詞：吳劍泓"));
     * // { lyricist: '吳劍泓', composer: '林俊傑' }
     *
     * //  console.log(parseMusicCredits("詞：吳劍泓"));
     * // { lyricist: '吳劍泓' }
     *
     * //  console.log(parseMusicCredits("曲：林俊傑"));
     * // { composer: '林俊傑' }
     *
     * //  console.log(parseMusicCredits(""));
     * // {}
     */

    function parseMusicCredits(inputStr) {
        if (!inputStr.trim()) {
            return {}; // 如果是空字串或只有空白，直接回傳空物件
        }

        const result = {};

        // 用正則分別擷取「詞」和「曲」，不論順序
        const lyricistMatch = inputStr.match(/詞：([^曲]+)/);
        const composerMatch = inputStr.match(/曲：([^詞]+)/);

        if (lyricistMatch) {
            result.lyricist = lyricistMatch[1].trim();
        }

        if (composerMatch) {
            result.composer = composerMatch[1].trim();
        }

        return result;
    }

    function getSubmitGuitarPuItemWithNormalized(tone, singers) {

        const objOfTones = getMapOfTonalitySpeed(tone.tkInfo);
        // '原調': 'E', '速度': '59', '男調': 'A', '女調': 'E'
        if (Util.isUndefinedNullEmpty(objOfTones['原調']) ||
          Util.isUndefinedNullEmpty(objOfTones['男調']) ||
          Util.isUndefinedNullEmpty(objOfTones['女調'])
        ) {
            console.log(tone.name, ' ===> ', objOfTones);
        }

        const objOfCapoTone = getCapoAndContextTonality(tone.capoLevel);
        const info = {name: tone.name, ...objOfCapoTone, ...objOfTones};
        const latestTone = refactorTone(tone.tone);
        return {
            id: Util.isUndefinedNullEmpty(tone.idOfRemote) ? undefined : tone.idOfRemote,
            tonalityOfContext: info.tonalityOfContext,
            latestContext: Util.getEncryptStringV2(Util.getDecryptString(latestTone)),
            capoLevel: info.capo ? _.toNumber(info.capo) : -1,
            tonalityOfFemale: info['女調'],
            tonalityOfMale: info['男調'],
            tonalityOfOriginal: info['原調'],
            speed: info['速度'] ? _.toNumber(info['速度']) : -1,
            singer: tone.singer,
            name: tone.name,
            uid: tone.id, /** database 裡面的column id */
            uuidOfSong: tone.url,
            uuidOfSinger: tone.singerUrl,
            composer: parseMusicCredits(tone.composer).composer,
            lyricist: parseMusicCredits(tone.composer).lyricist,
            popularLevel: tone.popularLevel,
            idOfSinger: getSingerDocumentId(),
            copyright: true,
        }

        function getSingerDocumentId() {
            const singerUrl = tone.singerUrl;
            if (singers && singerUrl && singers[singerUrl]) {
                return singers[singerUrl].idOfRemote;
            }
            return '';
        }
    }

    async function submitShortcut() {
        await api.deleteShortcuts();
        await api.submitShortcuts(
          [{
              title: '回到首頁',
              icon: 'muIcon:Bedtime',
              route: `route:main`,
              indexOfSequence: 0,
          }
              , {
              title: '我的最愛',
              icon: 'muIcon:FavoriteBorder',
              route: `route:personalRhythm`,
              indexOfSequence: 1,
          },
              {
                  title: '歷史搜尋',
                  icon: 'muIcon:History',
                  route: `route:historyRhythm`,
                  indexOfSequence: 2,
              },
              {
                  title: '編輯功能',
                  icon: 'muIcon:EditRounded',
                  indexOfSequence: 3,
                  subs: [
                      {
                          title: '新增悅譜',
                          icon: 'muIcon:LibraryMusic',
                          route: `route:chordiventor`,
                          indexOfSequence: 1,
                      },
                      {
                          title: '我譜的譜',
                          icon: 'muIcon:AddReactionRounded',
                          route: `route:inventedOfPu`,
                          indexOfSequence: 2,
                      },
                  ]
              },
              {
                  title: '相關網站',
                  icon: 'muIcon:Whatshot',
                  indexOfSequence: 4,
                  subs: [
                      {
                          title: '91譜',
                          icon: 'muIcon:School',
                          route: 'path:https://www.91pu.com.tw/',
                          indexOfSequence: 1,
                      },
                  ]
              }]
        )
    }

    /**
     *  原調：F#m速度：123
     男調：Fm女調：Cm
     *
     * return { '原調': 'E', '速度': '59', '男調': 'A', '女調': 'E' }
     * */
    function getMapOfTonalitySpeed(string) {
        function getWordOnly(string) {
            return Util.getStringOfHeadMatch(string, `[#a-zA-Z0-9-]+`);
        }

        let array = Util.toOneLineString(string).split(new RegExp('\(原調|速度|男調|女調\)', 'gm'));
        array.shift();
        array = _.chunk(array, 2);
        const object = {}
        for (const each of array) {
            object[each.shift()] = Util.replaceAll(getWordOnly(each.pop()), '-', '|');
        }
        return object;
    }

    /**
     * Capo: 1 (Am)
     *
     * { tonalityOfContext:C , capo:4}*/
    function getCapoAndContextTonality(string) {
        function getFirstNumber(string) {
            return Util.getStringOfHeadMatch(string, `[0-9]`);
        }

        function getStringOfBrace(string) {
            return Util.getStringOfHeadMatch(string, `(?<=\\()[\\w]+?(?=\\))`)
        }

        const obj = {
            capo: getFirstNumber(string),
            tonalityOfContext: getStringOfBrace(string)
        }
        return obj;
    }

    async function syncSingerRemoteIdIntoLocalStorage() {
        const singers = await api.fetchSingers();
        for (const singer of singers) {
            await database.updateRecords('SINGER', {idOfRemote: singer.id},
              new Builder().equal('url', singer.uuidOfSinger).stmt())
        }
    }

    /** 同步遠端的document id */
    async function syncRemoteIdWithToneAndRhythmIntoLocalStorage() {

        const guitars = await api.fetchGuitarpus()
        for (const guitar of guitars) {
            await database.updateRecords('TONE', {idOfRemote: guitar.id},
              new Builder().equal('url', guitar.uuidOfSong).stmt())
        }

        const rhythms = await api.fetchRhythms()
        for (const rhythm of rhythms) {
            await database.updateRecords('TONE', {idOfRhythm: rhythm.id},
              new Builder().equal('url', rhythm.uuidOfSong).stmt())
        }
    }

    /** 避免智慧權蠢做法 */
    async function updateTonesWithSameRemoteId() {
        const tones = await fetchTonesContainRemoteId();
        const objectOfSinger = await getObjectOfSingerUrlAsKey();

        const submits = tones.map(tone => getSubmitGuitarPuItemWithNormalized(tone, objectOfSinger));
        await api.submitGuitarpus(...submits);
    }

    async function updateSpecificGuitarPu(id = 'Wipyxry0V0CKLkPxjaS1') {
        const records = await database.fetchRecords('TONE', new Builder().equal('idOfRemote', id).stmt())
        const record = _.head(records);
        const guitar = getSubmitGuitarPuItemWithNormalized(record)
        await api.updateGuitarpuItem(guitar.id,
          {
              currentContext: guitar.currentContext,
              originalContext: guitar.originalContext
          }
        )
    }

    async function updateSpecificToneOfGuitarPu(id = '2qKAHVsPo4wriTPjSR3X', tone) {
        const pu = await api.fetchGuitarpuItem(id);
        if (pu) {
            pu.currentContext = tone;
            pu.originalContext = tone;
            await api.submitGuitarpuItem(pu, id);
        }
    }


    /** 這五個是initialize一組的, 如果跑了91pu scrapy */
    async function deployLatestSheet() {
        await deployAllSingerTone(550);
        await deployKeywords();
        await deployMainPageHotRhythm(25);
        await deployMainPageHotSingers(25);
    }

    /** 用uid把tone給persistent 方便拉上來當範本 */
    async function persistPuByIdOfRemoteGuitar(idOfGuitarPu) {
        const content = await database.fetchRecord('TONE', new Builder().equal('idOfRemote', idOfGuitarPu).stmt());
        console.log(content);
        const path = Util.persistByPath(`./temp/${content.name}`)
        Util.appendFile(libpath.join(path, 'pu.text'), Util.getDecryptString(content.tone))
    }

    /** 把deploy/pu.text 和 deploy/config.json */
    async function deployPuIntoDataBase() {
        const content = Util.getJsonObjByFilePath('./deploy/config.json');
        content.tone = Util.getEncryptString(Util.getFileContextInRaw('./deploy/pu.text'));
        content.updateTime = Util.getCurrentTimeStamp();
        console.log(content);
        console.log(`\n\n\n10秒後部署到database\n...\n...\n...`);
        await Util.syncDelay(10000);
        await database.insertRecord('TONE', content);
    }

    async function uploadPreludeImagesToStorage() {
        const raws = await database.fetchRecords('TONE', new Builder().gte('popularLevel', 1000).orderBy({'popularLevel': 'DESC'}).stmt())
        const tones = {};
        for (const tone of raws) {
            tones[_.toString(tone.uid)] = tone;
        }

        for (const folder of Util.getChildPathByPath(pathOfPreludes)) {
            if (Util.isDirectory(folder.absolute) && _.size(Util.getChildPathByPath(folder.absolute)) > 1) {
                const trait = folder.dirName.split(`-`);
                /** 從database 裡面找出 tone的document id*/
                const uid = _.toString(trait.shift());
                /** url的末碼*/
                const name = trait.pop();
                const record = tones[uid];

                if (record.hasPrelude) continue;
                /** 已經有前奏就不要再duplicated */

                /** 上傳C/G調的圖片，取得url of download */
                const files = Util.getChildPathByPath(folder.absolute);
                const fileOfC = _.find(files, (item) => _.startsWith(item.fileName, 'CAm'));
                const fileOfG = _.find(files, (item) => _.startsWith(item.fileName, 'GEm'));
                const prefix = `preludes/${_.trim(record.uid)}-${_.trim(record.name)}`;
                const urlOfC = await uploadFileToPublicStorage(fileOfC.absolute, `${prefix}-CAm.png`)
                const urlOfG = await uploadFileToPublicStorage(fileOfG.absolute, `${prefix}-GEm.png`)
                /** update pathOfPreludeC/pathOfPreludeG || hasPrelude必須改成true */

                await database.lazyInsertRecord('TONE', {
                    ...record,
                    pathOfPreludeC: urlOfC,
                    pathOfPreludeG: urlOfG,
                    hasPrelude: true,
                })
                Util.appendInfo(`完成了 ${prefix} 的prelude上傳工程`);
                await Util.syncDelay(10);
            }
        }
    }

    /** *
     * 上傳file到firebase storage，然後回傳download url
     * @param pathOfLocalFile 本地端的file路徑 => './test.png'
     * @param destinationOfRemote 遠端的storage路徑 => 'preludes/test.png'
     * @returns download-url 下載路徑
     */
    async function uploadFileToPublicStorage(pathOfLocalFile, destinationOfRemote) {
        console.log(`local:`, pathOfLocalFile, `remote:`, destinationOfRemote);
        const config = {
            action: 'read',
            expires: '02-14-2100',
        };

        const options = {
            destination: destinationOfRemote,
            preconditionOpts: {
                /** 這樣寫就能override相同fileName的檔案 */
                // ifGenerationMatch: 1,
                // ifGenerationNotMatch: 1,
                // ifMetagenerationMatch: 1,
                // ifMetagenerationNotMatch: 1,
            },
        };
        await bucket.upload(pathOfLocalFile, options);
        const urlOfDownload = await bucket.file(destinationOfRemote).getSignedUrl(config);
        return urlOfDownload;
    }

    async function updatePopularLevelOfEachTone() {
        const raws = await database.fetchRecords('TONE', new Builder().gte('popularLevel', 5000).orderBy({'popularLevel': 'DESC'}).stmt(), 'popularLevel', 'idOfRemote')
    }

    /** 利用batch的方式把preludes sync 到 firestore上面 */
    async function syncPreludeInfoToRemoteFirestore() {
        const pus = await database.fetchRecords('TONE', new Builder().equal('hasPrelude', 1).stmt());
        const itemsOfTone = pus.map(pu => {
            return {
                id: pu.idOfRemote,
                uid: pu.uid,
                hasPrelude: true,
                pathOfPreludeC: pu.pathOfPreludeC,
                pathOfPreludeG: pu.pathOfPreludeG,
            }
        });

        const itemsOfRhythm = pus.map(pu => {
            return {
                id: pu.idOfRhythm,
                hasPrelude: true,
            }
        });

        const deployToTone = await api.updateGuitarpus(itemsOfTone);
        Util.appendInfo(`81561212 ${deployToTone.message}`);
        const deployToRhythm = await api.updateRhythms(itemsOfRhythm);
        Util.appendInfo(`15444231 ${deployToRhythm.message}`);
    }

    /** 利用batch的方式把preludes sync 到 firestore上面 */
    async function fetchGuitarPuContainsPrelude() {
        const pus = await api.fetchGuitarpus({where: (stmt) => stmt.where('hasPrelude', '==', true)}, {limit: (stmt) => stmt.limit(20)});
        Util.appendInfo(pus);
    }

    /** 更新遠端prelude的程序 */
    async function updatePreludeToRemoteWholeProcess() {
        await uploadPreludeImagesToStorage();
        await syncPreludeInfoToRemoteFirestore();
    }

    async function updateUserAllowRead() {
        const result = await api.fetchUsers();
        console.log(result.map(each => each.displayName));
        console.log(await api.updateUsers(result.map(each => {
            return {allowRead: true, id: each.uid}
        })));
    }

    async function fetchProjectPrettier() {
        const projects = await api.fetchProjects();
        const commit = projects.map((project) => {
            delete project.updateTime;
            delete project._doc;
            delete project.id;
            return project;
        })

        Util.appendFile('./stringOfProject.json', JSON.stringify(commit), true, true);
        await Util.prettier('./stringOfProject.json', 120);
    }

    async function updateCPRT() {
        await api.submitInfoOfCopyRight({
            fb: `https://www.facebook.com/david.tu.587`,
            ig: `https://www.instagram.com/david.tu.guitar`,
            line: `davidtu0725`
        })
    }

    async function updateCPRTContent() {
        await api.submitInfoOfCopyRightContact({
            fb: `https://www.facebook.com/david.tu.587`,
            ig: `https://www.instagram.com/david.tu.guitar`,
            line: `davidtu0725`,
            phone: `+886982763479`,
            email: `freshingmoon0725@gmail.com`,
        })
    }

    async function updateCPRTProjects() {
        await api.deleteProjects(true);
        await api.submitProjects([
              {
                  "image": "https://firebasestorage.googleapis.com/v0/b/davidtu-dev.appspot.com/o/project%2F%3Auid%2Fimages%2FIMG_7832.jpg?alt=media&token=5bf27574-f678-462d-8b3a-ea4077c4910e",
                  "route": "https://kh-high.web.app/",
                  "indexOfSequence": 0,
                  "trait": "線上答題 | 高中學測",
                  "title": "悅考",
                  "descriptions": [{"statement": "一目暸然的答題方式(單選、多選)"}, {"statement": "錯誤回顧、線上協助"}]
              },
              {
                  "image": "https://firebasestorage.googleapis.com/v0/b/davidtu-dev.appspot.com/o/project%2F%3Auid%2Fimages%2FIMG_7833.jpg?alt=media&token=4998b3fa-5571-415a-b0d1-0dd4d5d81486",
                  "route": "https://yueh-voice.web.app/",
                  "indexOfSequence": 2,
                  "trait": "線上播放器 ｜客製化",
                  "title": "悅耳",
                  "descriptions": [{"statement": "建立自己的線上專輯"}, {"statement": "聲音的故事（PODCASTS、街聲）"}]
              },
              {
                  "image": "https://firebasestorage.googleapis.com/v0/b/davidtu-dev.appspot.com/o/project%2F%3Auid%2Fimages%2FIMG_7838.jpg?alt=media&token=8c1aa03d-5aff-4e93-9745-7bd3bd92e5ed",
                  "route": "empty",
                  "indexOfSequence": 4,
                  "trait": "施工中 | 知識變現 | 技能販售",
                  "title": "悅薪",
                  "descriptions": [
                      {"statement": "施工中"},
                      {"statement": "時薪制販售技能（科目教學、美編、美髮、美睫）"},
                      {"statement": "線上付款（降低人工筆記、保障權益）"}
                  ]
              },
              {
                  "image": "https://firebasestorage.googleapis.com/v0/b/davidtu-dev.appspot.com/o/project%2F%3Auid%2Fimages%2FS__3342348.jpg?alt=media&token=dfdc178e-aa97-4e3c-95d8-7029cbeef62f",
                  "route": "https://yueh-pu.web.app/",
                  "indexOfSequence": 1,
                  "trait": "音樂｜和弦譜",
                  "title": "悅譜",
                  "descriptions": [
                      {"statement": "和弦即時轉調（原調、男女建議調性）"},
                      {"statement": "字體調整（手機、平板、電腦）"}
                  ]
              },
              {
                  "image": "https://firebasestorage.googleapis.com/v0/b/davidtu-dev.appspot.com/o/project%2F%3Auid%2Fimages%2FIMG_7834.jpg?alt=media&token=9a973889-89a8-4c41-ae34-509b4182646f",
                  "route": "empty",
                  "indexOfSequence": 5,
                  "trait": "施工中 | 線上預約 | 申請",
                  "title": "悅曆",
                  "descriptions": [{"statement": "施工中"}, {"statement": "場地預約、資格審核、違規計點紀錄"}]
              },
              {
                  "image": "https://firebasestorage.googleapis.com/v0/b/davidtu-dev.appspot.com/o/project%2F%3Auid%2Fimages%2FIMG_7840.jpg?alt=media&token=0634dc18-6bff-450b-950a-2493898dcc66",
                  "route": "empty",
                  "indexOfSequence": 7,
                  "trait": "施工中 | 線上小説 ｜黑底白字",
                  "title": "悅讀",
                  "descriptions": [{"statement": "線上閱讀，使用案底色鮮少眼睛壓力"}, {"statement": "閱讀紀錄，全文檢索"}]
              }
          ]
        );
    }

    async function updateToneOfPublishStaff() {
        const tones = await api.fetchGuitarpus();
        await api.updateGuitarpus(tones.map(tone => {
            return {id: tone.id, publish: true}
        }))
        Util.appendInfo(`finished`)
    }

    async function updateSingerOfSuggest() {
        const singers = await api.fetchSingers();
        const suggests = singers.map((singer) => {
            return {
                label: singer.name,
                uid: singer.id,
                id: singer.id,
                value: singer.id,
                popularLevel: singer.popularLevel
            }
        })
        await api.submitSingerSuggests(suggests);
    }

    async function submitLatestGuitarPus() {
        await api.modifyGuitarpusOfPaginate(async(items) => {
            const itemsOfLatest = items.map((item) => {
                delete item.currentContext;
                delete item.originalContext;
                return item;
            })
            await api.submitGuitarpus(itemsOfLatest)
        })
    }

    async function fetchNoneCopyRightPu() {
        const pus = await api.fetchGuitarpus({where: (stmt) => stmt.where('copyright', '==', false)})
        console.log(pus);
    }

    async function fetchChordiventer(){
        await api.fetchDocumentIdsOfUser()
        await api.fetchChordiventor()
    }
    /** 如果db刪掉全部重跑的腳本 */
    async function redoAll() {
        await syncRemoteIdWithToneAndRhythmIntoLocalStorage();
        await updatePopularLevel();
        await syncSingerRemoteIdIntoLocalStorage();
        await accumulatePopularLevelOfSinger()
    }

    async function updatePopularLevel() {
        console.log(`開始了`);
        for (const g of await api.fetchGuitarpus()) {
            const tone = await database.fetchRecord("TONE", new Builder().equal("idOfRemote", g.id).stmt());
            if (!tone) continue;
            const { popularLevel: gp } = g, { popularLevel: tp } = tone;
            if (gp !== tp)
                gp > tp
                  ? (console.log(`中了！更新DB(${tp})->(${gp})`),
                    await database.updateRecords("TONE", { popularLevel: gp }, new Builder().equal("idOfRemote", g.id).stmt()))
                  : (console.log(`中了！更新遠端(${gp})->(${tp})`),
                    await api.updateGuitarpuItem({ popularLevel: tp }, g.id));
        }
    }

    // await redoAll();

    /** 每次都要跑 */
    // await updateToneOfPublishStaff();
    // await syncPreludeInfoToRemoteFirestore();
    // await updateToneOfEachCopyRightAsTrue();
    // await updatePopularLevelOfEachTone();
    // await persistPuByIdOfRemoteGuitar('48zU4kfV3E3LSmvMr5zH');
    // await deployKeywords();
    // await updatePreludeToRemoteWholeProcess();
    // await updateToneOfEncryptStringV2();
    // await deployPuIntoDataBase();
    // await updateSpecificToneOfGuitarPu('8z49z4zPQZclEhyNr4zy', refactorTone(Util.getEncryptString(Util.getFileContextInRaw('./deploy/pu.text'))))
    // await persistPuByIdOfRemoteGuitar('0FmWormxfJJCcNcZ2VD2');
    // await genRhythmByGuitarPuID('2qKAHVsPo4wriTPjSR3X');
    // await deployGuitarPuByPopularLevel(2000);
    // await deploySingers(2000);

    // await submitShortcut();
    // await updateTonesWithSameRemoteId();
    // console.log(await getObjectOfSingerUrlAsKey());
    // await updateSpecificGuitarPu();
    // await deployKeywords();
    // await submitLatestGuitarPus();
    // await updatePreludeToRemoteWholeProcess();
    // await accumulatePopularLevelOfSinger()
    // await syncRemoteIdWithToneAndRhythmIntoLocalStorage()
    await deployLatestSheet();
    // await updateSingerOfSuggest();
    // await updateUserAllowRead();
    // await fetchNoneCopyRightPu();
})();


