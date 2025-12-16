import {configerer} from "configerer";
import {utiller as Util, exceptioner as ERROR, pooller as InfinitePool} from 'utiller';
import _ from 'lodash';
import libpath from 'path';

/** author:明悅
 *  create time:Tue Nov 09 2021 23:34:19 GMT+0800 (Taipei Standard Time)
 */

class playground {

}

export {playground as playground}

// const text = '[{ "label":"更換付款方式","icon":"ChangeCircle","loginOnly":true,"notice":{"title":"確認是否更改","content":"訂單付款方式僅能更改一次,是否確定更改?"},"onClick":self.onEpayPurchaseOfHistoryOrderAreaOfTopExtraIconButtonChangeProcedureOfPaymentClicked(objectOfParam) },{ "label":"刪除訂單","icon":"CancelScheduleSend","loginOnly":true,"notice":{"title":"執行刪除","content":"是否確任刪除訂單?"},"onClick":self.onEpayPurchaseOfHistoryOrderAreaOfTopExtraIconButtonDeleteOrderClicked(objectOfParam) }]'

class AAA {
    properties = 1;
}

class BBB extends AAA {
    properties = 2;

}

if (configerer.DEBUG_MODE) {
    (async () => {
        const sample = [[[{a:1},[{b:1}]]],[],{c:1}];
        console.log(_.flattenDeep(sample));
        // enum StateOfPayment {
        //     pending = 2,
        //     failure = 4
        // }
        //     const a = async () => Promise.resolve(3)
        //     console.log(await a())


        // const percentage = 88
        // console.log(_.multiply(100, (1 - Util.toPercentageDecimal(percentage))))
        // console.log(StateOfPayment.pending)
          // console.log(StateOfPayment[2]);

          // const a = {value:-1};
        // const judge = a && a.value;
        // if(judge) console.log(judge,' => ', 'true');
        // else console.log(judge,' => ', 'false');
          // console.log(libpath.join('./temp','scs','qqq','as.js'));
        // const source = require('./modul
          // e/source');
            // console.log(source);
            // const a = null;
            // console.log(a ? 'yyy':'bbb')
            //     console.log(_.isUndefined(null))
            // console.log(_.slice('4',0,10))
            // const bbb = new BBB();
            // console.log(bbb.properties);
            // console.log(_.size(`fdipsjfoijsdoifdso`))
            // const browser = new Browser(true);
            // await browser.init();
            // browser.printf();
            // console.log('dsasad')
            // console.log(new URL('3333','https://1232.32.tw',).href)
            // console.log(Util.getFolderNameOfFilePath('a/c/d/js.js'));
            // const abc = JSON.parse(`[{ "label":"更換付款方式","icon":"ChangeCircle","loginOnly":true,"notice":{"title":"確認是否更改","content":"訂單付款方式僅能更改一次,是否確定更改?"},"onClick": }]`);
            // console.log(abc);

            // const latest = _.flattenDeep([['1','2','3'],['bbb','vccc','ddd'],['#$%#$','@!#12','@!#1']]);
            // console.log(latest);

            // const sample = {
            //     abc: {aa: 'aa', bb: 'bb'},
            //     def: {cc: 'cc', dd: 'dd'}
            // }
            // const copyOfDEF = sample.def;
            // delete sample.def;
            // console.log(sample, copyOfDEF);


            // const AtoZ = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
            // const oneToTen = '123456789';
            // const length = 5
            // console.log(oneToTen.substr(0,length));
            // console.log(AtoZ.substr(0,length));


            // async function runTaskWithTimeout() {
            //     const timeout = (ms, message) => {
            //         return new Promise((_, reject) => {
            //             setTimeout(() => {
            //                 reject(new Error(message));
            //             }, ms);
            //         });
            //     };
            //
            //     try {
            //         await Promise.race([
            //             timeout(3000, 'timeout happen'), // 3000 = the maximum time to wait
            //             (async () => {
            //                 // ..
            //                 console.log('task start')
            //                 await wait(4000);
            //             })()
            //         ]);
            //
            //         /** assume this is async function*/
            //         console.log('task complete')
            //     } catch (error) {
            //         console.log('catch error', error.message);
            //     } finally {
            //         console.log('task finally')
            //     }
            // }
            //
            // const timeout = (ms, message) => {
            //     return new Promise((_, reject) => {
            //         setTimeout(() => {
            //             reject(new Error(message));
            //         }, ms);
            //     });
            // };
            //
            // async function wait(ms) {
            //     return new Promise(resolve => {
            //         setTimeout(() => {
            //             resolve(ms);
            //         }, ms);
            //     });
            // }
            // await runTaskWithTimeout();
            // const array = [1,2,3,4,5,6,7,8];
            // console.log(_.nth(array,-9 % _.size(array)));
            // const ddd = [];
            // console.log(ddd.shift());
            // const sss = true;
            // console.log(!!sss);
            // const a = {aa: 1, ab: {abc: 1, abd: 2}}
            // const b = {bb: 2, bc: {abc: 1, abd: 2}}
            // const c = {cc: 3, cd: {abc: 1, abd: 2}}
            // _.merge(a, b);
            // a.bc = {fuc:4,dac:3};

            // console.log(`a===> `, a);
            // console.log(`b===> `, b);
            //
            // console.log('empty:?????>>> ',`${_.isEmpty('2')}`);

            // const array = _.range(90,110);
            // const full = array.map((each) => {
            //     return {value:`${each}`,
            //         label:`${each}年`}
            // })
            // console.log(full);
            // Util.printf();
            // console.log(_.range(95,112,1));
            // const ddd =false;
            // const rrr = !!ddd;
            // console.log('dddd===> ', rrr);

            // const line = `@desktop: ~"only screen and (min-width: 600px) and (max-width: 1680px)";`;
            // const line2 = `@media @mobile`;
            // let pattern = new RegExp('^' + '@[desktop|mobile|desktop]', 'i');
            //
            // console.log(pattern.test(line2));
            // const string = 'G/B Am 我';
            // const sample = 'G/B';
            // const reg = new RegExp(`^[A-G]`,'gm');
            // console.log(reg.test(sample));
            // const node0 = {z: 10}
            // const node1 = {a: node0, b: 200}
            //
            // const node2 = _.clone(node1);
            // node2.c = 300;
            // node2.a.z = 101;
            // console.log(node2);
            // console.log(node1);
            // /** 如果你想複製一個節點node, 可以用 clone = _.clone(node), clone的節點可以新增屬性 不會影響node, 但如果更動與node相關的屬性, node也會連動更改*/
            // console.log(_.tail([1]));

            //  const test = `[{ "label":"刪除",
            //          "icon":"CancelScheduleSend",
            //          "id":1,
            //          "loginOnly":true,
            //          "notice":{"title":"執行刪除","content":"是否從我的最愛中刪除"} }]`;
            //
            //  const test2 =`[
            //  {
            //      "label":"下載檔案",
            //      "icon":"CloudDownload",
            //      "id":undefined,
            //      "loginOnly":true,
            //      "notice":{"title":"執行動作","content":"是否確下載檔案至本端?"}
            //  },
            //  {
            //      "label":"分享連結",
            //      "icon":"Share",
            //      "id":undefined,
            //      "loginOnly":false,
            //      "notice":undefined
            //  },
            // {
            //      "label":"刪除",
            //      "icon":"DeleteForever",
            //      "id":undefined,
            //      "loginOnly":true,
            //      "notice":{"title":"執行刪除","content":"是否確任刪除?"} }
            //      ]`;
            //
            //  console.log(JSON.parse(test2));

            // JSON.parse(`[
            //     {
            //         "label":"下載檔案",
            //         "icon":"CloudDownload",
            //         "id":undefined,
            //         "loginOnly":true,
            //         "notice":{"title":"執行動作","content":"是否確下載檔案至本端?"}
            //     },
            //     {
            //         "label":"分享連結",
            //         "icon":"Share",
            //         "id":undefined,
            //         "loginOnly":false,
            //         "notice":undefined
            //     },
            //     {
            //         "label":"刪除",
            //         "icon":"DeleteForever",
            //         "id":undefined,
            //         "loginOnly":true,
            //         "notice":{"title":"執行刪除","content":"是否確任刪除?"}
            //     }
            //     ]`
            //
            const current =[
                "法國",
                "美國",
                "西班牙",
                "中國",
                "義大利",
                "土耳其",
                "墨西哥",
                "泰國",
                "德國",
                "英國",
                "日本",
                "馬來西亞",
                "越南",
                "澳大利亞",
                "加拿大",
                "印度",
                "韓國",
                "印尼",
                "荷蘭",
                "瑞士",
                "奧地利",
                "俄羅斯",
                "希臘",
                "葡萄牙",
                "阿聯酋",
                "新加坡",
                "沙特阿拉伯",
                "匈牙利",
                "愛爾蘭",
                "南非",
                "埃及",
                "摩洛哥",
                "阿根廷",
                "巴西",
                "台灣",
                "菲律賓",
                "帛琉",
                "智利",
                "關島",
                "香港",
                "澳門",
                "馬爾地夫",
                "柬埔寨",
                "波蘭",
                "捷克",
                "芬蘭",
                "瑞典",
                "丹麥",
                "挪威",
                "比利時",
                "冰島",
                "盧森堡",
                "斯洛伐克",
                "保加利亞",
                "羅馬尼亞",
                "塞爾維亞",
                "黑山",
                "馬其頓",
                "阿爾巴尼亞",
                "格魯吉亞",
                "亞美尼亞",
                "亞塞拜然",
                "白俄羅斯",
                "摩爾多瓦",
                "烏克蘭",
                "哈薩克斯坦",
                "烏茲別克斯坦",
                "土庫曼斯坦",
                "塔吉克斯坦",
                "吉爾吉斯斯坦",
                "蒙古",
                "北韓",
                "老撾",
                "緬甸",
                "文萊",
                "東帝汶",
                "新西蘭",
                "巴布亞新幾內亞",
                "所羅門群島",
                "斐濟",
                "薩摩亞",
                "瓦努阿圖",
                "紐埃",
                "吐瓦魯",
                "瑙魯",
                "馬紹爾群島",
                "密克羅尼西亞",
                "巴哈馬",
                "古巴",
                "牙買加",
                "海地",
                "多米尼加",
                "波多黎各",
                "安提瓜和巴布達",
                "聖基茨和尼維斯",
                "多米尼克",
                "聖盧西亞",
                "聖文森特和格林納丁斯",
                "巴巴多斯",
                "格林納達",
                "特立尼達和多巴哥",
                "哥斯達黎加",
                "巴拿馬",
                "尼加拉瓜",
                "洪都拉斯",
                "薩爾瓦多",
                "危地馬拉",
                "伯利茲",
                "哥倫比亞",
                "委內瑞拉",
                "蓋亞那",
                "蘇里南",
                "厄瓜多爾",
                "秘魯",
                "玻利維亞",
                "巴拉圭",
                "烏拉圭",
                "利比亞",
                "突尼斯",
                "阿爾及利亞",
                "蘇丹",
                "南蘇丹",
                "厄立特里亞",
                "吉布提",
                "索馬里",
                "埃塞俄比亞",
                "烏干達",
                "肯尼亞",
                "坦桑尼亞",
                "盧旺達",
                "布隆迪",
                "剛果民主共和國",
                "贊比亞",
                "安哥拉",
                "莫桑比克",
                "津巴布韋",
                "納米比亞",
                "博茨瓦納",
                "賴索托",
                "斯威士蘭",
                "馬達加斯加",
                "科摩羅",
                "塞舌爾",
                "毛里求斯",
                "馬拉維",
                "馬里",
                "布基納法索",
                "尼日爾",
                "奈及利亞",
                "乍得",
                "中非共和國",
                "喀麥隆",
                "赤道幾內亞",
                "加蓬",
                "剛果共和國",
                "聖多美和普林西比",
                "阿富汗",
                "安道爾",
                "安圭拉",
                "阿魯巴",
                "阿塞拜疆",
                "巴林",
                "孟加拉",
                "貝寧",
                "百慕大",
                "不丹",
                "波斯尼亞和黑塞哥維那",
                "英屬印度洋領地",
                "英屬維爾京群島",
                "佛得角",
                "開曼群島",
                "聖誕島",
                "科科斯群島",
                "剛果（布）",
                "剛果（金）",
                "庫克群島",
                "克羅地亞",
                "庫拉索",
                "塞浦路斯",
                "多米尼加共和國",
                "愛沙尼亞",
                "福克蘭群島",
                "法羅群島",
                "法屬圭亞那",
                "法屬波里尼西亞",
                "岡比亞",
                "加納",
                "直布羅陀",
                "格陵蘭",
                "瓜德羅普",
                "格恩西",
                "幾內亞",
                "幾內亞比紹",
                "圭亞那",
                "赫德島和麥當勞群島",
                "伊朗",
                "伊拉克",
                "馬恩島",
                "以色列",
                "象牙海岸",
                "澤西",
                "約旦",
                "基里巴斯",
                "科索沃",
                "科威特",
                "拉脫維亞",
                "黎巴嫩",
                "萊索托",
                "利比里亞",
                "列支敦士登",
                "立陶宛",
                "馬爾他",
                "馬提尼克",
                "毛里塔尼亞",
                "馬約特",
                "摩納哥",
                "蒙特塞拉特",
                "尼泊爾",
                "荷屬安地列斯",
                "新喀里多尼亞",
                "尼日利亞",
                "諾福克島",
                "北馬其頓",
                "北馬里亞納群島",
                "阿曼",
                "巴基斯坦",
                "巴勒斯坦",
                "皮特凱恩群島",
                "卡塔爾",
                "留尼汪",
                "聖巴泰勒米",
                "聖海倫娜",
                "聖馬丁",
                "聖皮埃爾和密克隆群島",
                "聖馬力諾",
                "塞內加爾",
                "塞拉利昂",
                "聖馬丁島",
                "斯洛文尼亞",
                "南喬治亞島和南桑威奇群島",
                "斯里蘭卡",
                "斯瓦爾巴特和揚馬延",
                "敘利亞",
                "多哥",
                "托克勞",
                "湯加",
                "突尼西亞",
                "特克斯和凱科斯群島",
                "圖瓦盧",
                "阿拉伯聯合酋長國",
                "美屬維爾京群島",
                "梵蒂岡",
                "瓦利斯和富圖納",
                "西撒哈拉",
                "也門",
                "北海道",
                "東京",
                "北陸",
                "東北",
                "九州",
                "四國",
                "沖繩",
                "大阪",
                "花卷",
                "首爾",
                "釜山",
                "濟州",
                "曼谷",
                "普吉島",
                "清邁",
                "華欣",
                "巴里島",
                "中南半島",
                "北越",
                "中越",
                "峴港",
                "南越",
                "馬新",
                "檳城",
                "蘭卡威",
                "關帛菲",
                "長灘島",
                "馬尼拉",
                "宿霧",
                "巴拉望",
                "歐州",
                "中西歐",
                "東歐",
                "奧捷",
                "北歐",
                "紐澳",
                "紐西蘭",
                "西澳",
                "南澳",
                "雪梨",
                "美加",
                "美東",
                "美加東",
                "中南美州",
                "夏威夷",
                "美西",
                "極光",
                "美南",
                "中東南亞非",
                "中東",
                "杜拜",
                "肯亞",
                "非州",
                "亞洲郵輪",
                "美洲郵輪",
                "歐洲郵輪",
                "中東郵輪",
            ]


            // const current = [
            //     "可樂旅遊",
            //     "雄獅",
            //     "五福",
            //     "格緻",
            //     "喜鴻",
            //     "百威",
            //     "永信",
            //     "尊榮國際",
            //     "山富國際",
            //     "旅天下聯合國際",
            //     "旅遊家",
            //     "聯翔國際",
            //     "駿樺",
            //     "東南",
            //     "大新",
            //     "台鋼燦星國際",
            //     "大榮",
            //     "凱旋-巨匠",
            //     "巨大",
            //     "品冠國際",
            //     "現代國際",
            //     "行健",
            //     "鳳凰國際",
            //     "世興-台北分部",
            // ]

            // console.log(_.size(current));
            // const latest = current.map((cou, index) => {
            //     return {label: cou, value: `${index + 1}`};
            // })
            //
            // Util.appendFile(`./latest.json`, JSON.stringify(latest), false, true);
            // // let i = 1
            // // _.range(1,12).forEach((item) => {
            // //     console.log(i);
            // //     i++;
            // // })

            // console.log(Util.camel(`set`,`photoURL`));

        }
    )();
}
