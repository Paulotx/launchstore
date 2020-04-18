const { Pool } = require("pg");

module.exports = new Pool({
    user: "postgres",
    password: "Qwerty@13",
    host: "localhost",
    port: 5432,
    database: "launchstoredb"
});