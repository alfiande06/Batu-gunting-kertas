const {Pool} = require ('pg');
const pool = new Pool({
    host: "rain.db.elephantsql.com",
    user: "fikjcrmh",
    port: "5432",
    password: "zOG1vIrzLpvcaZ8HqCwjwy6ItfnbLGdt",
    database: "fikjcrmh"

})
module.exports = pool;

