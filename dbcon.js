var mysql = require('mysql');
var pool = mysql.createPool({
    host: 'classmysql.engr.oregonstate.edu',
    user: 'cs290_linxia',
    password: '4958',
    database: 'cs290_linxia'
});

module.exports.pool = pool;