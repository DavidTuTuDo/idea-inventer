/***
 * 2XXX api io
 * 3XXX databases
 * 4XXX pooller
 * 8XXX file IO,Utiller
 * 9XXX commons
 * 7XXX ui experience
 * 6XXX puppter=>browser
 */
const ERRORs = {
    2001: {
        message: 'update item, id is required'
    },

    3001: {
        message: `get table error`
    },
    3002: {
        message: `show schema error`
    },
    3003: {
        message: `get object schema stmt error`
    },
    3004: {
        message: `lazy insert`
    },
    3005: {
        message: `drop all fail`
    },
    3006: {
        message: `delete record error`
    },
    3007: {
        message: `drop table error`
    },
    3008: {
        message: `orderBy,order SQLRules Error`
    },
    3009: {
        message: `createTableAndIndex, create table fail`
    },
    3010: {
        message: `alter columns fail`
    },
    3011: {
        message: `update record fail`
    },
    3012: {
        message: `create index fail`
    },
    3013: {
        message: `create table fail`
    },
    3014: {
        message: `insertRecord`
    },
    3015: {
        message: `fetch indexes error`
    },
    3016: {
        message: `more than 1 unique_index in table`
    },
    4001: {
        message: `priority state is wrong`
    },
    4002: {
        message: `task type isn't function`
    },
    4003: {
        message: `task type isn't array`
    },
    4004: {
        message: `task not exist when try to delete`
    },
    4005: {
        message: `state not valid`
    },
    4006: {
        message: `task param should be async function`
    },
    4007: {
        message: `除了runByTask以外, getTaskInfoDependOnPriority() 不能走到這裡, taskQueue裡面不能沒有Task`
    },
    4008: {
        message: `如果要用runInBackground的task發生Error,就必須設定 backgoundtasklistener,不能讓task發生錯誤而沒有紀錄`
    },
    4009: {
        message: `如果走到了這一層, 代表 runInBackGround() 在無預期的狀況下被停止了, 代表執行中的task拋出的catch()沒有自己處理好`
    },
    4010: {
        message: `task timeout`
    },
    4011: {
        message: `不能走到這裡, 目前被動式的機制只支援runByEachTask`,
    },

    8001: {
        message: `append file fail`
    },
    8002: {
        message: `open dir fail`
    },
    8003: {
        message: `not file nor dictionary,should get it`
    },
    8004: {
        message: `package exist in current path`
    },
    8005: {
        message: `input name is not valid`
    },
    8006: {
        message: `file exists when trying to copy`
    },
    8007: {
        message: `alias exist in shell script`
    },
    8008: {
        message: `persist folder fail`
    },
    8009: {
        message: `copy folder should be exist`
    },
    8010: {
        message: `the key can't exceed the length of 22`
    },
    8011: {
        message: `beautify class fail,but let it pass`
    },
    8012: {
        message: `incest props should define view,type either`
    },
    8013: {
        message: `render view type is out of condition, check why`
    },
    8014: {
        message: `type is not supported`
    },
    8015: {
        message: `build firestore error`
    },
    8016: {
        message: `class generator is necessary!!!`,
    },
    8017: {
        message: `className type is not valid!`,
    },
    8018: {
        message: `this platform is not supported`,
    },
    8019: {
        message: `find no source.js file`,
    },
    8020: {
        message: `package.json has something wrong`,
    },
    9999: {
        message: `super stupid error`
    },
    7001: {
        message: `state is wrong`
    },
    7002: {
        message: `initial should be override`
    },
    7003: {
        message: `css style duplicated defined`
    },
    7004: {
        message: `there's no ref target`
    },
    7005: {
        message: `can't happen this param type`
    },
    7006: {
        message: `view must instance of BaseComponent,otherwise found no root cause`
    },
    7007: {
        message: `result result should be either succeed or fail`
    },
    7008: {
      message:`in array can't be empty, otherwise it get abnormal next page`
    },
    6001: {
        message: `single page work fail`
    },


}

export default ERRORs;
