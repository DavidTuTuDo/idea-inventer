import _ from 'lodash';
import GlobalConfig from "../GlobalConfig";
import EX from "../exception";

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
        this.concat(`${column} == ${_.isString(value) ? `'${value}'` : value}`);
        return this.self;
    }

    concat(string) {
        this._stmt = _.concat(this._stmt, string);
    }

    contains(column, value) {
        this.concat(`${column} LIKE '%${value}%'`);
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
        this.concat(`${column} LIKE '%${value}'`);
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

export default ConditionBuilder;

if (GlobalConfig.DEBUG_MODE) {
    const builder = new ConditionBuilder();

}
/** 使用範例
 console.log(await handler.fetchRecords("TONE",
 builder.gt('popularLevel', 50000).orderBy({'popularLevel': 'DESCS'})
 .limit(4)
 .stmt(),
 ['name', 'popularLevel', 'singer']))

 */
