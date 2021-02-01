/***
 *
 * 3XXX databases
 * 4XXX pooller
 * 8XXX file IO
 * 9XXX commons
 */
const ERRORs = {
    3001:{
        message:`get table error`
    },
    3002:{
        message:`show schema error`
    },
    3003:{
        message:`get object schema stmt error`
    },
    3004:{
        message:`lazy insert`
    },
    3005:{
        message:`drop all fail`
    },
    3006:{
        message:`delete record error`

    },
    3007:{
        message:`drop table error`

    },
    3008:{
        message:`orderBy,order SQLRules Error`

    },
    3009:{
        message:`createTableAndIndex, create table fail`
    },
    3010:{
        message:`alter columns fail`
    },
    3011:{
        message:`update record fail`
    },
    3012:{
        message:`create index fail`
    },
    3013:{
        message:`create table fail`
    },
    3014:{
        message:`insertRecord`
    },
    4001:{
        message:`priority state is wrong`
    },
    4002:{
        message:`task type isn't function`
    },
    4003:{
        message:`task type isn't array`
    },
    4004:{
        message:`task not exist when try to delete`
    },
    4005:{
        message:`state not valid`
    },
    4006:{
        message:`task as param is ridiculous`
    },
    4007:{
        message:`worker的周間休息的時候, Pooller被停掉了, 所以不再工作了`
    },
    8001:{
        message:`append file fail`
    }

}

export default ERRORs;
