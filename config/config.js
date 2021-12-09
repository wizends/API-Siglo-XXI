const oracledb = require('oracledb')
config = {
  user: 'portafolio1',
  password: '123',
  connectString: 'localhost:1521/xe',
}

async function open(sql, binds, autoCommit){
    let conn = await oracledb.getConnection(config);
    let result = await conn.execute(sql,binds,{autoCommit});
    //conn.release();
    return result
}

exports.Open = open;