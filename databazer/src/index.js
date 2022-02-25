import sqlite3 from 'sqlite3';
import {open} from 'sqlite';
import {configerer} from "configerer";
import {utiller as Util, exceptioner as ERROR} from 'utiller';
import _ from 'lodash';

function normalizeText(str) {
    return (str + '').replace(/\'/g, "''");

}

const SPLIT_SIGN_OF_ARRAY = `#&#@#`;

function getValidPresentOfSQLStatement(value) {
    if (_.isArray(value) || _.isObject(value))
        return `'${normalizeText(Util.deepFlat(value, SPLIT_SIGN_OF_ARRAY))}'`;
    if (_.isString(value))
        return `'${normalizeText(value)}'`;
    return value;
}

class SqliteHandler {

    static Builder() {
        return new ConditionBuilder();
    }


    constructor(_dbpath = configerer.BASE_DATABASE_PATH) {
        this.dbpath = _dbpath;
    }

    async createDbConnection(filename) {
        return await open({
            filename,
            driver: sqlite3.Database
        });
    }

    /** 如果是沒有database的路徑,他就會自己new出新的.db */
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
            throw new ERROR(3005, error.message);
        }
    }

    async deleteRecords(tableName, condition) {
        try {
            const result = await this.db.all(`DELETE FROM ${tableName} WHERE ${condition}`);
            return result;
        } catch (err) {
            throw new ERROR(3006, err.message);
        }
    }

    async tableNotExist(tableName) {
        const _tableNotExist = _.isEmpty(
            await this.fetchRecords('sqlite_master',
                SqliteHandler.Builder().equal('name', tableName).stmt(), 'name'));
        return _tableNotExist;
    }


    async fetchRecord(tableName, condition = '', ...columns) {
        const records = await this.fetchRecords(tableName, condition, ...columns);
        return Util.getRandomItemOfArray(records);
    }

    async fetchRecords(tableName, condition = '', ...columns) {
        let stmt = '';
        try {

            if (!_.isEqual(tableName, 'sqlite_master') &&
                await this.tableNotExist(tableName)) {
                return [];
            }

            let column = '*';
            if (!_.isEmpty(columns))
                column = _.join(columns, ', ');

            const needWhere = _.isEmpty(condition) ? '' : Util.startWiths(_.toUpper(condition), configerer.SQL_NEEDLESS_WHERE_START_OF) ? '' : 'WHERE';
            stmt = `SELECT ${column} FROM ${tableName} ${needWhere} ${condition}`;
            if (configerer.MODULE_MSG.SHOW_SUCCEED)
                Util.appendInfo('FETCH RECORD STMT:' + stmt);
            const result = await this.db.all(stmt);
            return result;
        } catch (err) {
            throw new ERROR(3007, err.message, `STMT => ${stmt}`);
        }
    }

    async dropTable(tableName) {
        try {
            await this.db.run(`DROP TABLE IF EXISTS ${tableName}`);
        } catch (err) {
            throw new ERROR(3007, err.message, tableName);
        }
    }

    async fetchSchema(tableName) {
        try {
            const result = await this.db.all(`PRAGMA table_info(${tableName})`);
            return result;
        } catch (err) {
            throw new ERROR(3002, err);
        }
    }

    /**
     * [
     { seqno: 0, cid: 1, name: 'name' },
     { seqno: 1, cid: 8, name: 'singer' }
     ]

     * */

    async fetchIndexesOfTable(tableName) {
        try {
            const result = await this.db.all(`PRAGMA index_list(${tableName})`);
            if (result.length === 1) return await this.db.all(`PRAGMA index_info(${result[0].name})`);
            if (result.length > 1) throw new ERROR(3016, result.map((each) => each.name));
            return result;
        } catch (err) {
            throw new ERROR(3015, err);
        }
    }

    async fetchTables() {
        try {
            const result = await this.db.all(`SELECT name FROM sqlite_master WHERE type = "table"`);
            return result;
        } catch (error) {
            throw new ERROR(3001, error);
        }
    }

    getAlterColumnStmt(tableName, obj) {
        const stmts = [];
        const attrs = this.getCreateColumnAttributes(obj);
        for (const attr of attrs) {
            stmts.push(`ALTER TABLE ${tableName} ADD COLUMN ${attr.key} ${attr.type} NOT NULL DEFAULT ${attr.defaultValue}`);
        }
        return stmts;
    }

    /** [...{key:'KEY',type:'TEXT',defaultValue:''}]*/
    getCreateColumnAttributes(content) {
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
                    throw new ERROR(3003, `unknown type of this object => key:${key}, value:${content[key]} type:${typeof content[key]}`);
            }
            attrs.push({key, type, defaultValue});
        }
        return attrs
    }

    getCreateTableStmt(tableName, content) {
        let stmt = [];
        stmt = _.concat(stmt, `\n${configerer.UID} INTEGER PRIMARY KEY AUTOINCREMENT`);

        const attrs = this.getCreateColumnAttributes(content);
        for (const attr of attrs) {
            stmt = _.concat(stmt, `\n${attr.key} ${attr.type} NOT NULL DEFAULT ${attr.defaultValue}`);
        }
        stmt = `CREATE TABLE IF NOT EXISTS ${tableName} (${stmt.join(',')})`;
        return stmt;
    }

    async createTable(tableName, object) {
        let stmt;
        try {
            const stmt = this.getCreateTableStmt(tableName, object);
            if (configerer.MODULE_MSG.SHOW_SUCCEED)
                Util.appendInfo(`CREATE TABLE STMT: ${stmt}`);
            await this.db.run(stmt);
        } catch (error) {
            throw new ERROR(3013, error, `STMT => ${stmt}`);
        }
    }

    async createIndex(tableName, ...index) {
        let stmt;
        try {
            if (!_.isEmpty(index)) {
                stmt = `CREATE UNIQUE INDEX IF NOT EXISTS ${_.join([tableName, ...index], '_')} ON ${tableName}(${_.join(index, ' ,')})`;
                if (configerer.MODULE_MSG.SHOW_SUCCEED)
                    Util.appendInfo(`CREATE INDEX STMT: ${stmt}`);
                await this.db.run(stmt);
            }
        } catch (error) {
            throw new ERROR(3012, error, `STMT => ${stmt}`);
        }
    }

    async createTableAndIndex(tableName, object, ...index) {
        let indexStmt = '';
        let createStmt = '';
        try {
            createStmt = this.getCreateTableStmt(tableName, object);
            if (configerer.MODULE_MSG.SHOW_SUCCEED)
                Util.appendInfo(`CREATE STMT ${createStmt}`);
            await this.db.run(createStmt);

            if (!_.isEmpty(index)) {
                indexStmt = `CREATE UNIQUE INDEX IF NOT EXISTS ${_.join([tableName, ...index], '_')} ON ${tableName}(${_.join(index, ' ,')})`;
                if (configerer.MODULE_MSG.SHOW_SUCCEED)
                    Util.appendInfo(`CREATE INDEX STMT:${indexStmt}`);
                await this.db.run(indexStmt);
            }


        } catch (error) {
            throw new ERROR(3009, error, createStmt, indexStmt);
        }
    }

    async fetchAllRecord(tableName) {
        return await this.db.all(`select * from ${tableName}`);
    }

    /** return number, which means how many record changed */
    async updateRecords(tableName, content, condition) {
        let updateStmt;
        try {
            if (await this.tableNotExist(tableName)) return 0; /** check table exist */

            await this.alterColumnIfNeed(tableName, content);
            /** check table consist of valid column */

            const pairs = [];
            for (const key in content) {
                pairs.push(`${key} = ${getValidPresentOfSQLStatement(content[key])}`);
            }

            updateStmt = `UPDATE ${tableName} SET ${_.join(pairs, ', ')} WHERE ${condition}`;
            if (configerer.MODULE_MSG.SHOW_SUCCEED)
                Util.appendInfo(`UPDATE STMT: ${updateStmt}`);
            const result = await this.db.run(updateStmt);
            return result.changes;

        } catch (error) {
            throw new ERROR(3011, error, `STMT => ${updateStmt}`);
        }
    }

    /** it can do
     * 1.create table if not exist.
     * 2.alter-column(新增欄位), if column is not exist in table.
     * 3.add index if params exist.
     * 3.if bump into CONSTRAINT prob, goes to updateRecords depend on index value.
     **/
    async lazyInsertRecord(tableName, content, ...indexes) {
        try {
            /** check table exist */
            await this.createTableAndIndex(tableName, content, ...indexes);
            /** check table consist of valid column */
            await this.alterColumnIfNeed(tableName, content);

            try {
                await this.insertRecord(tableName, content);
            } catch (error) {
                /** */
                if (error instanceof ERROR && error.isConstraintError()) {
                    Util.appendInfo(`lazyInsert 遇到 INDEX_CONSTRAINT, 會自動改成updateRecords TABLE:${tableName}, CONTENT:${Util.deepFlat(content)}`);
                    const condition = SqliteHandler.Builder();
                    const indexes = (await this.fetchIndexesOfTable(tableName)).map((indexes) => indexes.name);
                    _.each(indexes, (index) => {
                        if (!condition.isEmpty()) condition.and()
                        condition.equal(index, content[index])
                    });
                    await this.updateRecords(tableName, content, condition.stmt());
                }
            }

        } catch (err) {
            throw new ERROR(3004, err);
        }
    }

    async updateState(tableName, state, uid) {
        if (!Util.has(configerer.DATABASE_COLUMN_STATE, state)) {
            throw ERROR(9999, `state${state} not valid`);
        }
        return await this.updateRecords(tableName, {'state': state}, SqliteHandler.Builder().equal('uid', uid).stmt());
    }

    async insertRecords(tableName, contents) {
        let batchStmt;
        try {
            const stmts = contents.map((content, index) => this.getInsertStmt(tableName, content) + ';');
            batchStmt = _.join(stmts, '\n');
            batchStmt = `${batchStmt};`;
            Util.appendInfo(`BATCH STMT:${batchStmt}`);
            await this.db.exec(batchStmt);
        } catch (error) {
            throw new ERROR(3015, error, `BATCH STMT => ${batchStmt}`);
        }
    }

    async insertRecord(tableName, content) {
        let insertStmt;
        try {
            insertStmt = this.getInsertStmt(tableName, content);
            if (configerer.MODULE_MSG.SHOW_SUCCEED)
                Util.appendInfo(`INSERT STMT: ${insertStmt}`);

            await this.db.run(insertStmt);
        } catch (error) {
            throw new ERROR(3014, error, `INSERT STMT => ${insertStmt}`);
        }
    }

    async getCountsOfRecord(tableName) {
        const result = await this.db.all(`select count(*) from ${tableName}`);
        return Util.getObjectValue(result.shift());
    }

    getInsertStmt(tableName, content) {
        const contentValues = _.map(content, (value) => {
            return getValidPresentOfSQLStatement(value);
        });

        const insertStmt = `INSERT INTO ${tableName} (${_.join(_.keys(content), ', ')}) VALUES (${_.join(contentValues, ',\n')})`;
        return insertStmt;
    }

    async alterColumnIfNeed(tableName, content) {
        let stmts;
        try {
            const differ = {}
            const host = (await this.fetchSchema(tableName)).map((obj) => obj.name);
            const guest = Object.keys(content);
            const diff = _.difference(guest, host).map((key) => {
                differ[key] = content[key]
            });
            if (!_.isEmpty(diff)) {
                stmts = this.getAlterColumnStmt(tableName, differ);
                for (const stmt of stmts) {
                    if (configerer.MODULE_MSG.SHOW_SUCCEED)
                        Util.appendInfo(`ALTER COLUMN STMT:${stmt}`);
                    await this.db.run(stmt);
                }
            }
        } catch (error) {
            throw new ERROR(3010, `ALTER COLUMNS STMT => ${stmts}`);
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
        this.concat(`${column} == ${getValidPresentOfSQLStatement(value)}`);
        return this.self;
    }

    concat(string) {
        this._stmt = _.concat(this._stmt, string);
    }

    contains(column, value) {
        this.concat(`${column} LIKE '%${getValidPresentOfSQLStatement(value)}%'`);
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
                throw new ERROR('3008', `${rules[key]} is not valid, should be ['ASC', 'DESC']`);
            }
            array = _.concat(`${key} ${rules[key]}`);
        }
        this.concat(`ORDER BY ${_.join(array, ', ')}`);
        return this.self;
    }

    orderByRandom() {
        this.concat(`ORDER BY RANDOM()`);
        return this.self;
    }

    like(column, value) {
        this.concat(`${column} LIKE '%${getValidPresentOfSQLStatement(value)}'`);
        return this.self;
    }

    in(column, ...values) {
        values = _.map(values, value => {
            return getValidPresentOfSQLStatement(value)
        });
        this.concat(`${column} IN (${_.join(values, ' ,')})`)
        return this.self;
    }

    notIn(column, ...values) {
        values = _.map(values, value => {
            return getValidPresentOfSQLStatement(value)
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

    isEmpty() {
        return _.isEmpty(this._stmt);
    }

}

export {SqliteHandler as databazer, ConditionBuilder as builder}
/** 使用範例
 Util.appendInfo(await handler.fetchRecords("TONE",
 builder.gt('popularLevel', 50000).orderBy({'popularLevel': 'DESCS'})
 .limit(4)
 .stmt(),
 ['name', 'popularLevel', 'singer']))

 */

if (configerer.DEBUG_MODE) {
    (async () => {
        // const h = new SqliteHandler('./secret_infos_latest.db');
        // await h.init()
        // console.log(await h.getCountsOfRecord('SINGER'))

    })();

}

