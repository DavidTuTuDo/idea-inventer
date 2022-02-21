import {databazer as SQL} from "databazer";
import {utiller as Util, exceptioner as ERROR} from 'utiller';
import config from './config';

(async () => {
    const database = new SQL(config.BASE_DATABASE_PATH);
    await database.init();
    Util.appendInfo(`update {ING => NOT}  succeed  ` + (await database.updateRecords('SONG', {state: 'NOT'}, new SQL.Builder().equal('state', 'ING').or().equal('state', 'DUP').stmt())).length);
    Util.appendInfo(`update {ING => NOT}  succeed  ` + (await database.updateRecords('SINGER', {state: 'NOT'}, new SQL.Builder().equal('state', 'ING').or().equal('state', 'DUP').stmt())).length);
    Util.appendInfo('ING SONG ' + ((await database.fetchRecords('SONG', new SQL.Builder().equal('state', 'ING').stmt())).length));
    Util.appendInfo('NOT SONG  ' + ((await database.fetchRecords('SONG', new SQL.Builder().equal('state', 'NOT').stmt())).length));
    Util.appendInfo('DONE SONG  ' + ((await database.fetchRecords('SONG', new SQL.Builder().equal('state', 'DONE').stmt())).length));
    Util.appendInfo('ING SINGER  ' + ((await database.fetchRecords('SINGER', new SQL.Builder().equal('state', 'ING').stmt())).length));
    Util.appendInfo('NOT SINGER  ' + ((await database.fetchRecords('SINGER', new SQL.Builder().equal('state', 'NOT').stmt())).length));
    Util.appendInfo('DONE SINGER ' + ((await database.fetchRecords('SINGER', new SQL.Builder().equal('state', 'DONE').stmt())).length));


})();
