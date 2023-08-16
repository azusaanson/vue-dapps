const sqlite3 = require("sqlite3").verbose();

const db = new sqlite3.Database(
  "./db/mygovernance.db",
  sqlite3.OPEN_READWRITE,
  (err) => {
    if (err) {
      return console.log(err.message);
    }
  }
);

const sql = "DROP TABLE IF EXISTS `proposal`";

db.run(sql);
