import sqlite3 from 'sqlite3';
import {open} from 'sqlite';
import ToneAnalysis from "../analysis/brain/ToneAnalysis";
import GlobalConfig from "../GlobalConfig";
import _ from 'lodash';
import EX from "../exception";
import Util from '../util';

// import SingersAnalysis from "../analysis/brain/SingersAnalysis";

function normalizeText(str) {
    return (str + '').replace(/\'/g, "''");

}

export default class SqliteHandler {

    static Builder() {
        return new ConditionBuilder();
    }

    constructor(_dbpath = GlobalConfig.BASE_DATABASE_PATH) {
        this.dbpath = _dbpath;
    }

    async createDbConnection(filename) {
        return await open({
            filename,
            driver: sqlite3.Database
        });
    }

    async init() {
        this.db = await this.createDbConnection(this.dbpath);
    }

    close() {
        this.db.close();
    }

    async dropAll() {
        try {
            const tables = await this.fetchTables();
            for (const table of tables) {
                if (_.isEqual('sqlite_sequence', table.name))
                    continue; /** not allow to deleted */

                await this.db.run(`DROP TABLE IF EXISTS ${table.name}`);
            }
        } catch (error) {
            throw new EX(3005, error);
        }
    }

    async deleteRecords(tableName, condition) {
        try {
            const result = await this.db.all(`DELETE FROM ${tableName} WHERE ${condition}`);
            return result;
        } catch (err) {
            throw new EX(3006, err);
        }
    }

    async fetchRecords(tableName, condition = '', ...columns) {
        try {
            if (!_.isEqual(tableName, 'sqlite_master')) {
                const tableNotExist = _.isEmpty(
                    await this.fetchRecords('sqlite_master',
                        SqliteHandler.Builder().equal('name', tableName).stmt(), 'name'));
                if (tableNotExist) return [];
            }

            let column = '*';
            if (!_.isEmpty(columns))
                column = _.join(columns, ', ');

            const needWhere = _.isEmpty(condition) ? '' : Util.startWiths(_.toUpper(condition), GlobalConfig.SQL_NEEDLESS_WHERE_START_OF) ? '' : 'WHERE';
            const stmt = `SELECT ${column} FROM ${tableName} ${needWhere} ${condition}`;
            if (GlobalConfig.MODULE_MSG.SHOW_SUCCEED)
                console.log(stmt);
            const result = await this.db.all(stmt);
            return result;
        } catch (err) {
            throw new EX(3007, err);
        }
    }

    async dropTable(tableName) {
        try {
            await this.db.run(`DROP TABLE IF EXISTS ${tableName}`);
        } catch (err) {
            throw new EX(3007, err);
        }
    }

    async fetchSchema(tableName) {
        try {
            const result = await this.db.all(`PRAGMA table_info(${tableName})`);
            return result;
        } catch (err) {
            throw new EX(3002, err);
        }
    }

    async fetchTables() {
        try {
            const result = await this.db.all(`SELECT name FROM sqlite_master WHERE type = "table"`);
            return result;
        } catch (error) {
            throw new EX(3001, error);
        }
    }

    getAlterColumnStmt(tableName, obj) {
        const stmts = [];
        const attrs = this.getColumnAttributes(obj);
        for (const attr of attrs) {
            stmts.push(`ALTER TABLE ${tableName} ADD COLUMN ${attr.key} ${attr.type} NOT NULL DEFAULT ${attr.defaultValue}`);
        }
        return stmts;
    }

    /** [...{key:'KEY',type:'TEXT',defaultValue:''}]*/
    getColumnAttributes(content) {
        const attrs = [];
        for (const key in content) {
            let value = content[key];
            let type = '';
            let defaultValue = 0;
            switch (typeof value) {
                case "boolean":
                case "number":
                    type = 'NUMERIC';
                    defaultValue = -32768;
                    break;
                case "string":
                    type = 'TEXT';
                    defaultValue = `''`;
                    break;
                default:
                    if (_.isArray(value) || _.isObject(value)) {
                        type = 'TEXT';
                        defaultValue = `''`;
                        break;
                    }
                    throw new EX(3003, `unknown type of this object => key:${key}, value:${content[key]} type:${typeof content[key]}`);
            }
            attrs.push({key, type, defaultValue});
        }
        return attrs
    }

    getCreateTableStmt(tableName, content) {
        let stmt = [];
        stmt = _.concat(stmt, `\noid INTEGER PRIMARY KEY AUTOINCREMENT`);

        const attrs = this.getColumnAttributes(content);
        for (const attr of attrs) {
            stmt = _.concat(stmt, `\n${attr.key} ${attr.type} NOT NULL DEFAULT ${attr.defaultValue}`);
        }
        stmt = `CREATE TABLE IF NOT EXISTS ${tableName} (${stmt.join(',')})`;
        return stmt;
    }

    async createTable(tableName, object, ...index) {
        try {
            const createStmt = this.getCreateTableStmt(tableName, object);
            if (GlobalConfig.MODULE_MSG.SHOW_SUCCEED)
                console.log(createStmt);
            await this.db.run(createStmt);

            if (!_.isEmpty(index)) {
                const stmt = `CREATE UNIQUE INDEX IF NOT EXISTS ${_.join([tableName, ...index], '_')} ON ${tableName}(${_.join(index, ' ,')})`;
                if (GlobalConfig.MODULE_MSG.SHOW_SUCCEED)
                    console.log(stmt);
                await this.db.run(stmt);
            }


        } catch (error) {
            throw new EX(3009, error);
        }
    }

    async fetchAllRecord(tableName) {
        return await this.db.all(`select * from ${tableName}`);
    }

    async insertRecord(tableName, content, ...index) {

        try {
            /** check table exist */
            await this.createTable(tableName, content, ...index);
            /** check table consist of valid column */

            await this.alterColumnIfNeed(tableName, content);

            /** insertRecord */
            const contentValues = _.map(content, (value) => {
                if (_.isArray(value) || _.isObject(value))
                    return `'${normalizeText(Util.deepFlat(value))}'`;
                if (_.isString(value))
                    return `'${normalizeText(Util.deepFlat(value))}'`;
                return value;

            });

            const insertStmt = `INSERT INTO ${tableName} (${_.join(_.keys(content), ', ')}) VALUES (${_.join(contentValues, ',\n')})`;
            if (GlobalConfig.MODULE_MSG.SHOW_SUCCEED)
                console.log(insertStmt);

            await this.db.run(insertStmt);
        } catch (err) {
            throw new EX(3004, err);
        }

    }

    async alterColumnIfNeed(tableName, content) {
        try {
            const differ = {}
            const host = (await this.fetchSchema(tableName)).map((obj) => obj.name);
            const guest = Object.keys(content);
            const diff = _.difference(guest, host).map((key) => {
                differ[key] = content[key]
            });
            if (!_.isEmpty(diff)) {
                const stmts = this.getAlterColumnStmt(tableName, differ);
                for (const stmt of stmts) {
                    if (GlobalConfig.MODULE_MSG.SHOW_SUCCEED)
                        console.log(stmt);
                    await this.db.run(stmt);
                }
            }
        } catch (error) {
            throw new EX(3010, error);
        }
    }
}

class ConditionBuilder {

    constructor() {
        this.self = this;
        this._stmt = [];
    }

    join() {

    }

    groupBy(column) {
        this.concat(`GROUP BY ${column}`);
        return this.self;
    }

    equal(column, value) {
        this.concat(`${column} == ${_.isString(value) ? `'${normalizeText(value)}'` : value}`);
        return this.self;
    }

    concat(string) {
        this._stmt = _.concat(this._stmt, string);
    }

    contains(column, value) {
        this.concat(`${column} LIKE '%${normalizeText(value)}%'`);
        return this.self;
    }

    limit(value, offset = 0) {
        this.concat(`LIMIT ${value} OFFSET ${offset}`);
        return this.self;
    }

    /** {column1:DESC,
     *  column2:ASC}*/
    orderBy(rules) {
        let array = [];
        for (const key in rules) {
            if (!['ASC', 'DESC'].includes(_.toUpper(rules[key]))) {
                throw new EX('3008', `${rules[key]} is not valid, should be ['ASC', 'DESC']`);
            }
            array = _.concat(`${key} ${rules[key]}`);
        }
        this.concat(`ORDER BY ${_.join(array, ', ')}`);
        return this.self;
    }

    like(column, value) {
        this.concat(`${column} LIKE '%${normalizeText(value)}'`);
        return this.self;
    }

    in(column, ...values) {
        values = _.map(values, value => {
            return _.isString(value) ? `'${value}'` : value
        });
        this.concat(`${column} IN (${_.join(values, ' ,')})`)
        return this.self;
    }

    notIn(column, ...values) {
        values = _.map(values, value => {
            return _.isString(value) ? `'${value}'` : value
        });
        this.concat(`${column} NOT IN (${_.join(values, ' ,')})`)
        return this.self;
    }

    between(column, small, large) {
        this.concat(`${column} BETWEEN ${small} AND ${large}`)
        return this.self;
    }

    lt(column, value) {
        this.concat(`${column} < ${value}`)
        return this.self;
    }

    lte(column, value) {
        this.concat(`${column} <= ${value}`)
        return this.self;
    }

    gte(column, value) {
        this.concat(`${column} >= ${value}`)
        return this.self;
    }

    gt(column, value) {
        this.concat(`${column} > ${value}`)
        return this.self;
    }

    and() {
        this.concat(`AND`);
        return this.self;

    }

    or() {
        this.concat(`OR`);
        return this.self;
    }

    stmt() {
        return _.join(this._stmt, ' ');
    }

}


/** 使用範例
 console.log(await handler.fetchRecords("TONE",
 builder.gt('popularLevel', 50000).orderBy({'popularLevel': 'DESCS'})
 .limit(4)
 .stmt(),
 ['name', 'popularLevel', 'singer']))

 */


if (GlobalConfig.DEBUG_MODE) {

    (async () => {
        try {
            // const tone = new ToneAnalysis();
            const handler = new SqliteHandler();
            await handler.init();
            // await handler.dropTable('testing');
            // const sample = {dddd: `dd'dsds'a'dsa`, eee: 'ddd', zzzz: 'zzz'};
            // const current  = await handler.fetchSchema('testing');

            // const host = current.map((obj) => obj.name);
            // const guest = Object.keys(sample);
            // console.log(_.difference(guest,host));

            // console.log(await handler.fetchRecords('TONE',
            //     new builder().equal('name','你的情歌').stmt()));
            // const names = await handler.fetchRecords('SINGER', SqliteHandler.Builder()
            //     .groupBy('name').orderBy({updateTime:'DESC'}).limit(10).stmt(), 'name');
            await handler.insertRecord('testing', {
                dddfff: 322,
                rr: 'eee',
                dddd: `dd'dsds'a'dsa`,
                fff: 1,
                drwe: 'wer',
                ddd: 23223
            })

            // console.log(await handler.fetchRecords('testing', new ConditionBuilder().equal('oid', 1).stmt()))
            // console.log(_.isEqual(await handler.fetchRecords('sqlite_master',
            //     new builder().equal('name', 'TONE').stmt(), 'name')))

            // console.log(names.map(name=>name.name));
            // await handler.dropTable('SINGER');
            // await handler.dropAll();
        } catch (error) {
            console.log(error);
        }
    })();

}


