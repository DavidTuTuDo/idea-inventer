import sqlite3 from 'sqlite3';
import {open} from 'sqlite';
import ToneAnalysis from "../analysis/brain/ToneAnalysis";
import GlobalConfig from "../GlobalConfig";
import _ from 'lodash';
import EX from "../exception";
import builder from "./ConditionBuilder"
import Util from '../util';

export default class SqliteHandler {

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

    async fetchRecords(tableName, condition, columns = []) {

        try {
            let column = '*';
            if (!_.isEmpty(columns))
                column = _.join(columns, ', ');

            const needWhere = Util.startWiths(_.toUpper(condition), GlobalConfig.SQL_NEEDLESS_WHERE_START_OF) ? '' : 'WHERE';
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

    getObjectSchemaStmt(tableName, content) {
        let stmt = [];
        stmt = _.concat(stmt, `\noid INTEGER PRIMARY KEY AUTOINCREMENT`);
        for (const key in content) {
            let type = '';
            let value = content[key];
            switch (typeof value) {
                case "boolean":
                case "number":
                    type = 'NUMERIC';
                    break;
                case "string":
                    type = 'TEXT';
                    break;
                default:
                    if (_.isArray(value)) {
                        type = 'TEXT';
                        value = _.join(value, ',');
                        break;
                    }
                    throw new EX(3003, `unknown type of this object => key:${key}, value:${content[key]} type:${typeof content[key]}`);
            }
            stmt = _.concat(stmt, `\n${key} ${type} NOT NULL`);
        }
        stmt = `CREATE TABLE IF NOT EXISTS ${tableName} (${stmt.join(',')})`;
        return stmt;
    }

    async fetchAllRecord(tableName) {
        return await this.db.all(`select * from ${tableName}`);
    }

    async insertRecord(tableName, content) {
        /** check table exist */
        try {
            const stmt = this.getObjectSchemaStmt(tableName, content);
            await this.db.run(stmt);

            /** check table consist of valid column */

            /** insertRecord */
            const contentValues = _.map(content, (value) => {
                if (_.isArray(value)) return `'${_.join(value, ',')}'`;
                if (_.isString(value)) return `'${value}'`;

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

}


if (GlobalConfig.DEBUG_MODE) {

    (async () => {
        try {
            const data = new ToneAnalysis();
            const handler = new SqliteHandler();
            await handler.init();
            console.log(await handler.fetchRecords('TONE', builder.notIn('singer', 'GAI', 'Hush', 'Ayo97').groupBy('singer').orderBy({'sum(popularLevel)': 'DESC'}).limit(5).get(), ['singer', 'sum(popularLevel)']))
            console.log('3157');

        } catch (error) {
            console.log(error);
        }
    })();

}


